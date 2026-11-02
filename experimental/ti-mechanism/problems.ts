import { streams, type RandomStream } from "@rex/kernel";
import { evaluate, implies } from "./evaluator.ts";
import { families, type Claims, type Clause, type Family } from "./types.ts";

export type Knowledge = "none" | "accurate" | "partly-false";
/** Labels stay in the generator/scorer envelope; pass only X and L to runTi. */
export interface Problem {
  X: Claims; L: Clause[]; mix: Family[]; knowledge: Knowledge;
  label: "consistent" | "contradiction";
  combinedLabel: "consistent" | "contradiction";
  lemmaImplied: boolean[];
  falseLemmaUnavailable: boolean;
}
const integer = (r: RandomStream, n: number): number => Math.floor(r() * n);
function shuffle(values: number[], r: RandomStream): number[] {
  for (let i = values.length - 1; i > 0; i--) {
    const j = integer(r, i + 1); [values[i], values[j]] = [values[j], values[i]];
  }
  return values;
}

/** DESIGN §1 template sizes are proposed: chain uses all atoms, XOR uses
 * adjacent pairs, pigeon uses two holes with two or three pigeons. */
function template(family: Family, atoms: number[], r: RandomStream): Clause[] {
  const n = atoms.length;
  if (family === "chain") {
    const c: Clause[] = atoms.slice(1).map((v, i) => [-atoms[i], v]);
    c.push([-atoms[n - 1], -atoms[0]]);
    if (r() < 0.5) c.push([atoms[0]]);
    return c;
  }
  if (family === "parity") {
    const c: Clause[] = [];
    for (let i = 0; i + 1 < n; i += 2) {
      const a = atoms[i], b = atoms[i + 1];
      if (r() < 0.5) c.push([a, b], [-a, -b]);
      else c.push([-a, b], [a, -b]);
    }
    if (r() < 0.5) c.push([atoms[0]], [r() < 0.5 ? atoms[1] : -atoms[1]]);
    return c;
  }
  if (family === "pigeon") {
    const pigeons = r() < 0.5 ? 2 : 3, c: Clause[] = [];
    for (let p = 0; p < pigeons; p++) c.push([atoms[2 * p], atoms[2 * p + 1]]);
    for (let p = 0; p < pigeons; p++) for (let q = p + 1; q < pigeons; q++)
      for (let h = 0; h < 2; h++) c.push([-atoms[2 * p + h], -atoms[2 * q + h]]);
    return c;
  }
  // DESIGN §1: near-threshold ratio 4.26 (Mitchell et al.; Crawford & Auton).
  return Array.from({ length: Math.round(4.26 * n) }, () =>
    shuffle(atoms.slice(), r).slice(0, 3).map(v => r() < 0.5 ? v : -v));
}

/** DESIGN §1: exact balance of X labels per mix, rejection-sampled and checked.
 * Proposed cap 100,000 prevents silent infinite rejection loops. Knowledge is
 * applied after sampling, so changing knowledge preserves the same X sequence. */
export function generateProblems(seed: number, options: {
  mixes: readonly (readonly Family[])[]; perMix: number; knowledge: Knowledge; n?: number;
}): Problem[] {
  if (!Number.isInteger(options.perMix) || options.perMix < 2 || options.perMix % 2)
    throw new Error("perMix must be a positive even count");
  if (options.n !== undefined && (!Number.isInteger(options.n) || options.n < 8 || options.n > 20))
    throw new Error("n must be 8..20");
  const r = streams(seed).get("ti.problems", "experiment"), result: Problem[] = [];
  for (const mix of options.mixes) {
    if (mix.length < 1 || mix.length > 2 || new Set(mix).size !== mix.length ||
      mix.some(f => !families.includes(f))) throw new Error("Expected one or two distinct families");
    const counts = { consistent: 0, contradiction: 0 };
    let attempts = 0;
    while (counts.consistent + counts.contradiction < options.perMix) {
      if (++attempts > 100_000) throw new Error(`Balance rejection limit exceeded: ${mix.join("+")}`);
      const n = options.n ?? 8 + integer(r, 13);
      const atoms = shuffle(Array.from({ length: n }, (_, i) => i + 1), r);
      const clauses: Clause[] = [], tags: Family[][] = Array.from({ length: n + 1 }, () => []);
      for (const family of mix) {
        // Shared atom vocabulary, independent order avoids systematic template conflicts.
        const block = template(family, shuffle(atoms.slice(), r), r); clauses.push(...block);
        for (const v of new Set(block.flat().map(Math.abs))) tags[v].push(family);
      }
      const X = { n, clauses, tags }, checked = evaluate(n, clauses);
      if (counts[checked.label] >= options.perMix / 2) continue;
      counts[checked.label]++;
      result.push({ X, L: [], mix: [...mix], knowledge: options.knowledge,
        label: checked.label, combinedLabel: checked.label, lemmaImplied: [], falseLemmaUnavailable: false });
    }
  }
  for (const p of result) {
    if (options.knowledge === "none") continue;
    // Proposed helpers: first implied unit or binary clause absent from X.
    const candidates: Clause[] = [];
    for (let a = 1; a <= p.X.n; a++) candidates.push([a], [-a]);
    for (let a = 1; a <= p.X.n; a++) for (let b = a + 1; b <= p.X.n; b++)
      for (const sa of [1, -1]) for (const sb of [1, -1]) candidates.push([sa * a, sb * b]);
    const helper = candidates.find(c => !p.X.clauses.some(x =>
      x.length === c.length && c.every(l => x.includes(l))) && implies(p.X.n, p.X.clauses, c));
    // If there is no short new consequence, an existing clause is still a checked lemma.
    p.L.push(helper ?? p.X.clauses[0]);
    if (options.knowledge === "partly-false") {
      // Classical explosion: UNSAT X implies every clause; no false lemma exists.
      const falseLemma = candidates.find(c => !implies(p.X.n, p.X.clauses, c));
      if (falseLemma) p.L.push(falseLemma);
      else p.falseLemmaUnavailable = true;
    }
    p.lemmaImplied = p.L.map(c => implies(p.X.n, p.X.clauses, c));
    p.combinedLabel = evaluate(p.X.n, [...p.X.clauses, ...p.L]).label;
  }
  return result;
}
