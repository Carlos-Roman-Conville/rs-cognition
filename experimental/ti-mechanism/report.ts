/// <reference path="../../scripts/node.d.ts" />
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import type { Metrics, Summary } from "./experiment.ts";
declare const process: { argv: string[] };

/** Proposed descriptive interval: observed seed min/max, not a confidence interval.
 * No independence or normality assumption; null measurements are explicitly counted. */
export function interval(values: (number | null)[]): string {
  const valid = values.filter((v): v is number => v !== null && Number.isFinite(v));
  if (!valid.length) return `NA (0/${values.length})`;
  const mean = valid.reduce((a, b) => a + b, 0) / valid.length;
  return `${mean.toFixed(4)} [${Math.min(...valid).toFixed(4)}, ${Math.max(...valid).toFixed(4)}] (${valid.length}/${values.length})`;
}
/** A cell may span batches, but each seed must occur in exactly one batch. */
export function combineSummaries(summaries: Summary[]): Summary[] {
  const cells = new Map<string, Summary>();
  for (const s of summaries) {
    const f = s.factors;
    const key = JSON.stringify([s.arm, f.knowledge, f.history, f.regime, f.c_d]);
    const prior = cells.get(key);
    if (new Set(s.settings.seeds).size !== s.settings.seeds.length)
      throw new Error("Overlapping seeds within batch");
    if (!prior) {
      cells.set(key, { ...s, settings: { ...s.settings, seeds: [...s.settings.seeds] }, seeds: [...s.seeds] });
      continue;
    }
    const configuration = (x: Summary) => JSON.stringify([x.settings.budgets, x.settings.trainingBudget,
      x.settings.testCount, x.settings.trainMixes, x.settings.transferMixes, x.settings.n]);
    if (configuration(prior) !== configuration(s)) throw new Error("Incompatible settings for cell");
    if (s.settings.seeds.some(seed => prior.settings.seeds.includes(seed)))
      throw new Error("Overlapping seeds across batches");
    prior.settings.seeds.push(...s.settings.seeds);
    prior.seeds.push(...s.seeds);
  }
  for (const s of cells.values()) {
    s.settings.seeds.sort((a, b) => a - b);
    s.seeds.sort((a, b) => a.seed - b.seed);
  }
  return [...cells.values()];
}

export function renderReport(summaries: Summary[]): string {
  summaries = combineSummaries(summaries);
  const lines = ["# Ti mechanism results", "",
    "Budgeted DPLL charges one step per propagation clause check and c_d per branch. Atom choice is softmax(theta·features); polarity uses a sigmoid. REINFORCE (Williams 1992) uses lambda=0.05 and the mean of past received rewards. Correct definite reward is 1−steps/b; wrong is −1; unresolved is −0.25. Missing feedback makes no update. Confidence is recorded before feedback. Method confidence never changes allocation.", "",
    "Estimates/design choices: n=8–20; chain uses all atoms, XOR adjacent pairs, pigeon two holes/two or three pigeons, random ratio 4.26; recent-conflict window eight; signed polarity counts; c_d∈{1,2,4}; lambda, reward shape and unresolved penalty above; missing probability 0.5 and flip probability 0.3; budgets 50/100/200/400/800; histories 0/100/400; test counts 200 and seeds 40. Actual settings below override these defaults. Proposed choices: training budget 400, singleton training and pair transfer, Beta(1,1) priors, method Beta updated from own resolution, Brier calibration on definite answers, fixed-quality target 0.8. Habit is unused (design h=1, E_0=22, no decay).", "",
    "All entries are seed means [observed minimum, maximum] (available/total seeds), not confidence intervals. Quality is correct definite answers divided by all tasks, scored against X, not X∪L. False-report and unresolved rates also use all tasks. Calibration excludes unresolved answers; NA is not zero. Paired deltas compare identical problems and branch seeds. These descriptive results alone do not establish population improvement.", "",
    "Memorise caches definite labels inferred from received binary feedback and recalls them at zero search cost without proof evidence (a proposed optimistic lookup control). Shared tasks are training repeats; fresh and unseen mixes are disjoint. A shuffled control permutes all learned weights, including polarity. Evaluation does not learn or update confidence. Budget sweeps reuse one trained state. No competence value is supplied to a mind.", ""];
  const metricKeys: (keyof Metrics)[] = ["quality", "correctContradiction", "correctConsistency", "falseContradiction", "falseConsistency", "unresolved", "steps", "definiteSteps", "brier", "definiteCount"];
  for (const s of summaries) {
    lines.push(`## ${s.arm}: ${JSON.stringify(s.factors)}`, "", `Actual settings: ${JSON.stringify(s.settings)}`, "",
      "| Task set / policy | Budget | " + metricKeys.join(" | ") + " |",
      "|---|---|" + metricKeys.map(() => "---").join("|") + "|");
    const keys = [...new Set(s.seeds.map(r => JSON.stringify([r.phase, r.policy, r.budget])))];
    for (const key of keys) {
      const [phase, policy, budget] = JSON.parse(key) as [string, string, number];
      const rows = s.seeds.filter(r => r.phase === phase && r.policy === policy && r.budget === budget);
      lines.push(`| ${phase} / ${policy} | ${budget} | ${metricKeys.map(k => interval(rows.map(r => r.metrics[k]))).join(" | ")} |`);
    }
    lines.push("", "Minimum tested budget for quality ≥0.8 (unreached seeds are censored, not imputed):", "");
    for (const phase of ["baseline", "fresh", "transfer", "shared", "attribution-fresh", "attribution-transfer"]) {
      const values = s.settings.seeds.map(seed => {
        const reached = s.seeds.filter(r => r.seed === seed && r.phase === phase && r.metrics.quality >= 0.8);
        return reached.length ? Math.min(...reached.map(r => r.budget)) : null;
      });
      lines.push(`- ${phase}: ${interval(values)}; unreached or unavailable ${values.filter(v => v === null).length}/${values.length}.`);
    }
    lines.push("", "Paired quality delta versus zero theta (positive means higher observed quality):", "");
    for (const phase of ["fresh", "transfer"]) for (const budget of s.settings.budgets) {
      const deltas = s.settings.seeds.map(seed => {
        const a = s.seeds.find(r => r.seed === seed && r.phase === phase && r.budget === budget);
        const b = s.seeds.find(r => r.seed === seed && r.phase === `attribution-${phase}` && r.budget === budget);
        return a && b ? a.metrics.quality - b.metrics.quality : null;
      });
      lines.push(`- ${phase}, budget ${budget}: ${interval(deltas)}.`);
    }
    lines.push("");
  }
  lines.push("## Unseen-mix transfer beside memorisation", "",
    "| Factors | Budget | Trained, family tags | Trained, no family tags | Memorise unseen | Memorise fresh | Memorise shared |",
    "|---|---|---|---|---|---|---|");
  for (const f of [...new Set(summaries.map(s => JSON.stringify(s.factors)))]) {
    const group = summaries.filter(s => JSON.stringify(s.factors) === f);
    for (const budget of [...new Set(group.flatMap(s => s.settings.budgets))].sort((a, b) => a - b)) {
      const cell = (arm: string, phase: string): string => interval(group.filter(s => s.arm === arm)
        .flatMap(s => s.seeds.filter(r => r.phase === phase && r.budget === budget).map(r => r.metrics.quality)));
      lines.push(`| ${f} | ${budget} | ${cell("trained", "transfer")} | ${cell("no-family-tags", "transfer")} | ${cell("memorise", "transfer")} | ${cell("memorise", "fresh")} | ${cell("memorise", "shared")} |`);
    }
  }
  lines.push("", "Absent arms are NA. Null and negative differences are retained. Fresh/transfer performance, not weight change or practice count, is the evidence. No conclusions about other functions or general competence follow from this experiment.", "");
  return lines.join("\n");
}
export function writeReport(folder: string): void {
  const summaries = readdirSync(folder).filter(f => f.endsWith(".summary.json")).sort()
    .map(f => JSON.parse(readFileSync(join(folder, f), "utf8")) as Summary);
  if (!summaries.length) throw new Error("No summaries found");
  writeFileSync(resolve(import.meta.dirname, "REPORT.md"), renderReport(summaries));
}
if (process.argv[1] && resolve(process.argv[1]) === resolve(import.meta.filename)) {
  if (process.argv.length !== 3) throw new Error("Usage: report.ts <results-folder>");
  writeReport(process.argv[2]);
}
