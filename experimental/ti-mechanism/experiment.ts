/// <reference path="../../scripts/node.d.ts" />
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { streams } from "@rex/kernel";
import { generateProblems, type Knowledge, type Problem } from "./problems.ts";
import { families, type Family } from "./types.ts";
import { runTi, type Theta, type TiResult } from "./run-ti.ts";
import { feedback, learn, learner, type Regime, type Feedback } from "./learn.ts";
import { confidence, recordConfidence, updateConfidence } from "./confidence.ts";

declare const process: { argv: string[] };
export interface Factors { knowledge: Knowledge; history: number; regime: Regime; c_d: number }
export type Arm = "trained" | "no-family-tags" | "shuffled" | "memorise";
export interface Settings {
  seeds: number[]; budgets: number[]; trainingBudget: number; testCount: number;
  trainMixes: Family[][]; transferMixes: Family[][]; n?: number;
}
/** DESIGN §4 estimates; training budget 400 and singleton/pair split are proposed.
 * Budget sweeps reuse the same learned state, isolating evaluation allocation. */
export const defaults: Settings = { seeds: Array.from({ length: 40 }, (_, i) => i + 1),
  budgets: [50, 100, 200, 400, 800], trainingBudget: 400, testCount: 200,
  trainMixes: families.map(f => [f]),
  transferMixes: families.flatMap((f, i) => families.slice(i + 1).map(g => [f, g])) };
export interface RecordRow {
  seed: number; phase: "baseline" | "training" | "fresh" | "transfer" | "attribution" | "shared";
  policy: "zero" | Arm; budget: number; problem: string; mix: string;
  mind: { result: TiResult; confidence: ReturnType<typeof recordConfidence>; feedback: Feedback };
  evaluator: { label: Problem["label"]; correct: boolean; falseLemmaUnavailable: boolean };
}
export interface Metrics { quality: number; correctContradiction: number; correctConsistency: number;
  falseContradiction: number; falseConsistency: number; unresolved: number; steps: number;
  definiteSteps: number | null; brier: number | null; definiteCount: number; count: number }
export interface Summary { arm: Arm; factors: Factors; settings: Settings;
  seeds: { seed: number; phase: string; policy: string; budget: number; metrics: Metrics }[] }
export const problemKey = (p: Problem): string => JSON.stringify([p.X, p.L]);

/** DESIGN §5 evaluator-only scoring, relative to X, so false knowledge can be wrong. */
export function measure(rows: RecordRow[]): Metrics {
  const n = rows.length, definite = rows.filter(r => r.mind.result.conclusion !== "unresolved");
  const share = (predicate: (r: RecordRow) => boolean): number => rows.filter(predicate).length / n;
  return { count: n, quality: share(r => r.evaluator.correct),
    correctContradiction: share(r => r.evaluator.correct && r.mind.result.conclusion === "contradiction"),
    correctConsistency: share(r => r.evaluator.correct && r.mind.result.conclusion === "consistent"),
    falseContradiction: share(r => !r.evaluator.correct && r.mind.result.conclusion === "contradiction"),
    falseConsistency: share(r => !r.evaluator.correct && r.mind.result.conclusion === "consistent"),
    unresolved: share(r => r.mind.result.conclusion === "unresolved"),
    steps: rows.reduce((s, r) => s + r.mind.result.stepsUsed, 0) / n,
    definiteCount: definite.length,
    definiteSteps: definite.length ? definite.reduce((s, r) => s + r.mind.result.stepsUsed, 0) / definite.length : null,
    // DESIGN §5 proposed calibration statistic: Brier on definite conclusions only.
    brier: definite.length ? definite.reduce((s, r) =>
      s + (r.mind.confidence.answer! - Number(r.evaluator.correct)) ** 2, 0) / definite.length : null };
}

function dataset(seed: number, count: number, mixes: Family[][], knowledge: Knowledge,
  excluded: Set<string>, n?: number): Problem[] {
  if (!Number.isInteger(count) || count < 0 || count % 2 || !mixes.length) throw new Error("Expected even count and mixes");
  const result: Problem[] = [];
  // DESIGN §1 balance: distribute pairs across mixes, including counts not divisible by mix count.
  for (let i = 0; i < count / 2; i++) {
    let accepted = false;
    for (let attempt = 0; attempt < 1000 && !accepted; attempt++) {
      const pair = generateProblems(seed + i * 1009 + attempt, { mixes: [mixes[i % mixes.length]], perMix: 2, knowledge, n });
      if (pair.some(p => excluded.has(problemKey(p)))) continue;
      pair.forEach(p => excluded.add(problemKey(p))); result.push(...pair); accepted = true;
    }
    if (!accepted) throw new Error("Disjoint sampling exhausted");
  }
  return result;
}

export function runExperiment(arm: Arm, factors: Factors, settings: Settings = defaults): { records: RecordRow[]; summary: Summary } {
  const records: RecordRow[] = [];
  const tags = arm !== "no-family-tags";
  for (const seed of settings.seeds) {
    const excluded = new Set<string>();
    const training = dataset(seed * 1000003, factors.history, settings.trainMixes, factors.knowledge, excluded, settings.n);
    const baseline = dataset(seed * 1000003 + 200000, settings.testCount, settings.trainMixes, factors.knowledge, excluded, settings.n);
    const fresh = dataset(seed * 1000003 + 400000, settings.testCount, settings.trainMixes, factors.knowledge, excluded, settings.n);
    const transfer = dataset(seed * 1000003 + 600000, settings.testCount, settings.transferMixes, factors.knowledge, excluded, settings.n);
    let state = learner(tags);
    const zero = state.theta, beliefs = confidence();
    const memory = new Map<string, TiResult["conclusion"]>();
    const feedbackRng = streams(seed);
    function trial(p: Problem, i: number, phase: RecordRow["phase"], policy: RecordRow["policy"],
      theta: Theta, budget: number): void {
      // Mind receives X,L,theta,budget only. Paired policies use identical branch seeds.
      let result = runTi(p.X, p.L, theta, budget, { c_d: factors.c_d }, streams(seed * 100003 + i),
        { features: { familyTags: tags } });
      const remembered = policy === "memorise" ? memory.get(problemKey(p)) : undefined;
      if (remembered) result = { conclusion: remembered, stepsUsed: 0, trace: [],
        evidence: { assignment: [], conflicts: [] } };
      const before = recordConfidence(beliefs, result.conclusion, p.mix.join("+"));
      const correct = result.conclusion === p.label;
      const received = phase === "training" ? feedback(correct, factors.regime, feedbackRng) : null;
      records.push({ seed, phase, policy, budget, problem: problemKey(p), mix: p.mix.join("+"),
        mind: { result, confidence: before, feedback: received },
        evaluator: { label: p.label, correct, falseLemmaUnavailable: p.falseLemmaUnavailable } });
      if (phase === "training") {
        state = learn(state, result, budget, received);
        updateConfidence(beliefs, result.conclusion, p.mix.join("+"), received);
        // Proposed memorise control: cache labels inferred solely from binary feedback;
        // unresolved feedback cannot reveal a label. No evidence is claimed for recall.
        if (received !== null && result.conclusion !== "unresolved") memory.set(problemKey(p),
          received === "correct" ? result.conclusion : result.conclusion === "consistent" ? "contradiction" : "consistent");
      }
    }
    for (const b of settings.budgets) baseline.forEach((p, i) => trial(p, i, "baseline", "zero", zero, b));
    training.forEach((p, i) => trial(p, i, "training", arm, state.theta, settings.trainingBudget));
    let trained = arm === "memorise" ? zero : state.theta;
    if (arm === "shuffled") {
      const weights = [...trained.atom, trained.polarity], r = streams(seed).get("ti.shuffle", "experiment");
      for (let i = weights.length - 1; i > 0; i--) {
        const j = Math.floor(r() * (i + 1)); [weights[i], weights[j]] = [weights[j], weights[i]];
      }
      trained = { atom: weights.slice(0, -1), polarity: weights[weights.length - 1] };
    }
    for (const b of settings.budgets) {
      for (const [phase, set] of [["fresh", fresh], ["transfer", transfer], ["shared", training]] as const) {
        set.forEach((p, i) => trial(p, i, phase, arm, trained, b));
        if (phase !== "shared") set.forEach((p, i) => trial(p, i, "attribution", "zero", zero, b));
      }
    }
  }
  const groups = new Map<string, RecordRow[]>();
  for (const row of records) {
    // Separate attribution training-family and unseen-mix task sets.
    const phase = row.phase === "attribution" ? `attribution-${settings.transferMixes.some(m => m.join("+") === row.mix) ? "transfer" : "fresh"}` : row.phase;
    const key = JSON.stringify([row.seed, phase, row.policy, row.budget]);
    const group = groups.get(key) ?? []; group.push(row); groups.set(key, group);
  }
  return { records, summary: { arm, factors, settings, seeds: [...groups].map(([key, rows]) => {
    const [seed, phase, policy, budget] = JSON.parse(key) as [number, string, string, number];
    return { seed, phase, policy, budget, metrics: measure(rows) };
  }) } };
}

/** --factors selects dimensions to sweep; omitted dimensions use proposed reference
 * none / 400 / accurate / 1. "all" performs the full factorial; default is all. */
export function main(args: string[]): void {
  let seeds = defaults.seeds, out = "experimental/ti-mechanism/results", subset = "all";
  for (let i = 0; i < args.length; i += 2) {
    const value = args[i + 1]; if (!value) throw new Error("Missing flag value");
    if (args[i] === "--seeds") {
      const count = Number(value); if (!Number.isInteger(count) || count < 1) throw new Error("--seeds requires a positive count");
      seeds = Array.from({ length: count }, (_, j) => j + 1);
    } else if (args[i] === "--out") out = value;
    else if (args[i] === "--factors") subset = value;
    else throw new Error(`Unknown flag ${args[i]}`);
  }
  const selected = subset === "all" ? ["knowledge", "history", "feedback", "cost"] : subset === "none" ? [] : subset.split(",");
  if (selected.some(f => !["knowledge", "history", "feedback", "cost"].includes(f))) throw new Error("Unknown factor");
  mkdirSync(out, { recursive: true });
  for (const knowledge of (selected.includes("knowledge") ? ["none", "accurate", "partly-false"] : ["none"]) as Knowledge[])
    for (const history of selected.includes("history") ? [0, 100, 400] : [400])
      for (const regime of (selected.includes("feedback") ? ["accurate", "incomplete", "misleading"] : ["accurate"]) as Regime[])
        for (const c_d of selected.includes("cost") ? [1, 2, 4] : [1])
          for (const arm of ["trained", "no-family-tags", "shuffled", "memorise"] as Arm[]) {
            const result = runExperiment(arm, { knowledge, history, regime, c_d }, { ...defaults, seeds });
            const name = `${arm}-${knowledge}-${history}-${regime}-${c_d}`;
            // Node writes string data as UTF-8 by default.
            writeFileSync(join(out, `${name}.jsonl`), result.records.map(r => JSON.stringify(r)).join("\n") + "\n");
            writeFileSync(join(out, `${name}.summary.json`), JSON.stringify(result.summary, null, 2) + "\n");
          }
}
if (process.argv[1] && resolve(process.argv[1]) === resolve(import.meta.filename)) main(process.argv.slice(2));
