import type { RandomStreams } from "@rex/kernel";
import { families, validate, type Assignment, type Claims, type Clause } from "./types.ts";

export interface Theta { atom: readonly number[]; polarity: number }
export interface Decision {
  forced: boolean;
  atom: number; value: boolean; features: number[]; probability: number;
  valueProbability: number;
  candidates: { atom: number; features: number[]; probability: number }[];
  path: { atom: number; value: boolean }[];
}
export interface Conflict { clause: number; assignment: Assignment }
export interface TiResult {
  conclusion: "contradiction" | "consistent" | "unresolved";
  evidence: { assignment: Assignment; conflicts: Conflict[] };
  stepsUsed: number;
  trace: Decision[];
}

/** DESIGN §2 proposed conventions: signed polarity count (positive minus negative),
 * static clause lengths, and the last eight conflicts as the recent window.
 * Feature order: unit, binary, >=3, polarity, recent conflicts, then families. */
export function atomFeatures(X: Claims, L: readonly Clause[], v: number,
  recent: readonly number[], familyTags = true): number[] {
  const f = [0, 0, 0, 0, 0];
  const clauses = [...X.clauses, ...L];
  clauses.forEach(c => c.forEach(l => {
    if (Math.abs(l) === v) { f[Math.min(c.length, 3) - 1]++; f[3] += l > 0 ? 1 : -1; }
  }));
  for (const index of recent) for (const l of clauses[index]) if (Math.abs(l) === v) f[4]++;
  if (familyTags) for (const family of families) f.push(X.tags[v]?.includes(family) ? 1 : 0);
  return f;
}

/** DESIGN §2: budgeted DPLL, one step/clause check and c_d/decision.
 * c_d=1 is the design estimate; tags enabled is the requested baseline.
 * A proof completed on the last paid step is valid; inability to pay a required
 * next operation yields unresolved. Reversed branches also pay c_d. */
export function runTi(X: Claims, L: readonly Clause[], theta: Theta, budget: number,
  costs: { c_d: number }, rng: RandomStreams,
  options: { features?: { familyTags: boolean } } = {}): TiResult {
  const clauses = [...X.clauses, ...L]; validate(X.n, clauses);
  const tags = options.features?.familyTags ?? true;
  if (theta.atom.length !== (tags ? 9 : 5) || ![...theta.atom, theta.polarity].every(Number.isFinite))
    throw new Error("Invalid theta dimensions or weights");
  if (!Number.isFinite(budget) || budget < 0 || !Number.isFinite(costs.c_d) || costs.c_d <= 0)
    throw new Error("Invalid budget or decision cost");
  const draw = rng.get("ti.branch", "experiment");
  let stepsUsed = 0;
  let partial: Assignment = Array<boolean | null>(X.n + 1).fill(null);
  const conflicts: Conflict[] = [], trace: Decision[] = [], recent: number[] = [];
  function pay(cost: number): boolean {
    if (stepsUsed + cost > budget) return false;
    stepsUsed += cost; return true;
  }
  type Outcome = "contradiction" | "consistent" | "unresolved";
  function search(a: Assignment, path: Decision["path"]): Outcome {
    partial = a;
    let changed: boolean;
    do {
      changed = false;
      let allSatisfied = true;
      for (let i = 0; i < clauses.length; i++) {
        if (!pay(1)) return "unresolved";
        const c = clauses[i];
        if (c.some(l => a[Math.abs(l)] === (l > 0))) continue;
        allSatisfied = false;
        const free = [...new Set(c.filter(l => a[Math.abs(l)] === null))];
        if (!free.length) {
          conflicts.push({ clause: i, assignment: a.slice() });
          recent.push(i); if (recent.length > 8) recent.shift();
          return "contradiction";
        }
        if (free.length === 1) { a[Math.abs(free[0])] = free[0] > 0; changed = true; }
      }
      if (allSatisfied) {
        partial = a.map((v, i) => i === 0 ? null : v ?? false);
        return "consistent";
      }
    } while (changed);
    if (!pay(costs.c_d)) return "unresolved";
    const candidates = [];
    for (let v = 1; v <= X.n; v++) if (a[v] === null) {
      const features = atomFeatures(X, L, v, recent, tags);
      const score = features.reduce((sum, f, i) => sum + f * theta.atom[i], 0);
      if (!Number.isFinite(score)) throw new Error("Feature score overflow");
      candidates.push({ atom: v, features, score, probability: 0 });
    }
    // DESIGN §2 softmax; subtract maximum for numerical stability.
    const max = Math.max(...candidates.map(c => c.score));
    const total = candidates.reduce((sum, c) => sum + Math.exp(c.score - max), 0);
    for (const c of candidates) c.probability = Math.exp(c.score - max) / total;
    let u = draw(), chosen = candidates[candidates.length - 1];
    for (const c of candidates) { u -= c.probability; if (u < 0) { chosen = c; break; } }
    // DESIGN §2 proposed binary polarity policy: sigmoid(weight * balance).
    const pTrue = 1 / (1 + Math.exp(-theta.polarity * chosen.features[3]));
    const value = draw() < pTrue;
    trace.push({ forced: false, atom: chosen.atom, value, features: chosen.features,
      probability: chosen.probability, valueProbability: value ? pTrue : 1 - pTrue,
      candidates: candidates.map(({ atom, features, probability }) => ({ atom, features, probability })), path });
    for (const [i, branch] of [value, !value].entries()) {
      if (i > 0 && !pay(costs.c_d)) { partial = a; return "unresolved"; }
      if (i > 0) trace.push({ forced: true, atom: chosen.atom, value: branch,
        features: atomFeatures(X, L, chosen.atom, recent, tags), probability: 1,
        valueProbability: 1, candidates: [], path });
      const next = a.slice(); next[chosen.atom] = branch;
      const result = search(next, [...path, { atom: chosen.atom, value: branch }]);
      if (result !== "contradiction") return result;
    }
    return "contradiction";
  }
  const conclusion = search(partial, []);
  return { conclusion, evidence: { assignment: partial.slice(), conflicts }, stepsUsed, trace };
}
