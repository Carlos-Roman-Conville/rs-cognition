import { mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import type { Ledger } from "../../diagnostics/ledger.ts";
import { classifyBehaviour, classifyMechanisms, CLASSIFICATION_THRESHOLDS, opportunityRate } from "../classify.ts";
import { ownOpportunities } from "../../diagnostics/opportunities.ts";
import { runRecord } from "./run.ts";
import { buildReport, seedInterval } from "../../diagnostics/report.ts";
import type { Report } from "../../diagnostics/report.ts";
import { sourceHash } from "../../hungry-pair/report-integrity.ts";

declare const process: { argv: string[]; stdout: { write(s: string): void }; stderr: { write(s: string): void }; exitCode: number };
export const METRICS = ["inspectBeforeGatherShare", "novelPatchVisitShare", "bestKnownReturnRate", "foodGathered"] as const;
export const HOOKS = ["pertinence", "interpret", "generate", "learning"] as const;
type Metric = typeof METRICS[number];
export interface MetricRecord {
  scenario: string; seed: number; configuration: { version: string; stack?: string }; replayed: boolean;
  metrics: Record<Metric, number> & { trace: { hooks: Record<string, { calls: number; changedCalls: number; changedParameters: Record<string, number> }>; changedCueShares: number; byFormula: null } };
}
export type Classification = "stable" | "context-dependent" | "none";
export const DEFINITION = "for each stack × metric, `stable` if the paired-difference interval excludes zero over all 200 seeds and in both seed halves with the same sign; `context-dependent` if the interval excludes zero in exactly one half, or over all seeds while the halves disagree in sign; `none` otherwise.";
export function summarize(values: readonly number[]) {
  return { n: values.length, mean: values.length ? values.reduce((a, b) => a + b, 0) / values.length : null, interval95: seedInterval(values) };
}
type Summary = ReturnType<typeof summarize>;
const sign = (s: Summary) => s.interval95 && s.interval95[0] > 0 ? 1 : s.interval95 && s.interval95[1] < 0 ? -1 : 0;
export function classify(all: Summary, first: Summary, second: Summary): Classification {
  const a = sign(all), b = sign(first), c = sign(second);
  if (a && a === b && a === c) return "stable";
  if (Boolean(b) !== Boolean(c) || (a && first.mean !== null && second.mean !== null && first.mean * second.mean < 0)) return "context-dependent";
  return "none";
}
const key = (r: MetricRecord) => r.configuration.version === "null" ? "null" : `${r.configuration.version}/${r.configuration.stack}`;
/** Equal-weight seeds, paired by identity. splitSeed=100 gives the prespecified S1 halves. */
export function analyze(records: readonly MetricRecord[], splitSeed = 100) {
  const groups = new Map<string, Map<number, MetricRecord>>();
  for (const r of records) {
    if (r.scenario !== "s1-forage" || !r.replayed || !Number.isSafeInteger(r.seed) || r.seed < 1 || METRICS.some((m) => !Number.isFinite(r.metrics[m]))) throw new Error("Invalid S1 record");
    const group = groups.get(key(r)) ?? new Map<number, MetricRecord>();
    if (group.has(r.seed)) throw new Error(`Duplicate ${key(r)} seed ${r.seed}`);
    group.set(r.seed, r); groups.set(key(r), group);
  }
  const baseline = groups.get("null");
  if (!baseline?.size) throw new Error("Missing null configuration");
  const seeds = [...baseline.keys()].sort((a, b) => a - b);
  const names = [...groups.keys()].sort((a, b) => a === "null" ? -1 : b === "null" ? 1 : a.localeCompare(b, "en"));
  const configurations = names.map((name) => {
    const group = groups.get(name)!;
    if (group.size !== seeds.length || seeds.some((s) => !group.has(s))) throw new Error(`Unpaired seeds: ${name}`);
    const rows = seeds.map((s) => group.get(s)!);
    const means = Object.fromEntries(METRICS.map((m) => [m, summarize(rows.map((r) => r.metrics[m])).mean!])) as Record<Metric, number>;
    const hooks = Object.fromEntries(HOOKS.map((h) => {
      const total = { calls: 0, changedCalls: 0, changedParameters: {} as Record<string, number> };
      for (const r of rows) {
        const hook = r.metrics.trace.hooks[h];
        total.calls += hook.calls; total.changedCalls += hook.changedCalls;
        for (const p of Object.keys(hook.changedParameters).sort()) total.changedParameters[p] = (total.changedParameters[p] ?? 0) + hook.changedParameters[p];
      }
      return [h, total];
    }));
    return { name, means, hooks, changedCueShares: rows.reduce((n, r) => n + r.metrics.trace.changedCueShares, 0) };
  });
  const stacks = names.filter((n) => n !== "null");
  const paired = stacks.flatMap((name) => METRICS.map((metric) => {
    const differences = seeds.map((s) => groups.get(name)!.get(s)!.metrics[metric] - baseline.get(s)!.metrics[metric]);
    const all = summarize(differences), first = summarize(differences.filter((_v, i) => seeds[i] <= splitSeed)), second = summarize(differences.filter((_v, i) => seeds[i] > splitSeed));
    return { name, metric, all, first, second, differingSeeds: differences.filter((v) => v !== 0).length, classification: classify(all, first, second) };
  }));
  // Byte equality of canonical JSON numeric vectors in sorted seed / fixed metric order; excludes null pairs.
  const equality = (metrics: readonly Metric[]) => {
    const vectors = stacks.map((name) => JSON.stringify(seeds.map((s) => metrics.map((m) => groups.get(name)!.get(s)!.metrics[m]))));
    return { distinct: new Set(vectors).size, identicalPairs: vectors.reduce((n, v, i) => n + vectors.slice(i + 1).filter((w) => w === v).length, 0) };
  };
  const counts = { stable: 0, "context-dependent": 0, none: 0 };
  for (const p of paired) counts[p.classification]++;
  return { recordCount: records.length, seeds, splitSeed, configurations, paired, counts, vectors: equality(METRICS), vectorsByMetric: Object.fromEntries(METRICS.map((m) => [m, equality([m])])) };
}
export type Analysis = ReturnType<typeof analyze>;
const number = (n: number | null) => n === null ? "unavailable" : n === 0 ? "0" : Number(n.toPrecision(9)).toString();
const interval = (s: Summary) => `${number(s.mean)} [${s.interval95?.map(number).join(", ") ?? "unavailable"}]`;
function table(headers: string[], rows: (string | number)[][]) {
  return [headers, headers.map(() => "---"), ...rows].map((row) => `| ${row.map(String).map((s) => s.replaceAll("|", "\\|").replace(/[\r\n]+/g, " ")).join(" | ")} |`).join("\n");
}
export interface Provenance { source: string; inputs: { path: string; bytes: number; lines: number }[] }
export function renderReport(a: Analysis, ledger: Report, provenance: Provenance): string {
  const significant = a.paired.filter((p) => p.classification !== "none");
  const ledgerRows = ledger.byFunction;
  const nullEquivalent = a.configurations.filter((c) => c.name !== "null" && a.paired.filter((p) => p.name === c.name).every((p) => p.differingSeeds === 0)).map((c) => c.name);
  return [
    "# S1 forage analysis", `Records: ${a.recordCount} (${a.seeds.length} seeds × ${a.configurations.length} configurations)`,
    "Source commits: fixture 31c81c6; ledger 1c0c36c.", `Source SHA256: ${provenance.source}`,
    "Source hash uses hungry-pair/report-integrity.ts sourceHash (sorted src paths and LF-normalized contents), measured at analysis time; the reduced inputs do not embed a run-time source hash.",
    table(["Input", "Bytes", "Lines"], provenance.inputs.map((p) => [p.path, p.bytes, p.lines])),
    "Run commands (keeper-produced inputs; no simulation rerun for this analysis):\n\n```sh\nnode --experimental-strip-types bench/scenarios/s1-forage/run.ts --seeds 200 --stacks all --ledger off\nnode --experimental-strip-types bench/scenarios/s1-forage/run.ts --seeds 24 --stacks all --ledger summary\n```\n\nBoth stdout streams were filtered to scenario, seed, configuration, metrics, replayed. Full traces were not retained. Reproduction/filter and analysis commands are in ../README.md.",
    "## Metrics by configuration",
    "Means give each seed equal weight; zero-denominator shares retain the fixture's zero convention. Inspect share uses successful gathers with an unused same-patch inspection; novel share uses successful moves; best-known return uses moves after a yield sample, past-mean ranking and mint-order ties; food is resolved gathered units.",
    table(["Configuration", ...METRICS], a.configurations.map((c) => [c.name, ...METRICS.map((m) => number(c.means[m]))])),
    `Across stacks: ${a.vectors.distinct} distinct joint behavioral metric vectors; ${a.vectors.identicalPairs} byte-identical unordered stack pairs out of ${a.configurations.length > 1 ? (a.configurations.length - 1) * (a.configurations.length - 2) / 2 : 0}. Null is excluded from pair counts. Equality is canonical JSON of numeric values in seed and metric order, not raw input whitespace. This compares measured behavior, not full action trajectories.`,
    table(["Metric", "Distinct stack vectors", "Identical stack pairs"], METRICS.map((m) => [m, a.vectorsByMetric[m].distinct, a.vectorsByMetric[m].identicalPairs])),
    "## Paired differences from null",
    `Each cell is mean [two-sided 95% interval], stack minus null with the same seed and yield stream. Independent units are seeds. seedInterval uses Student t with df=n−1 and its conservative df=10 critical value for larger samples (2.228139): all n=${a.seeds.length}; halves split at seed ${a.splitSeed}. No multiple-comparison correction.`,
    ...(["all", "first", "second"] as const).map((part) => `### ${part === "all" ? "All seeds" : part === "first" ? `Seeds ≤ ${a.splitSeed}` : `Seeds > ${a.splitSeed}`}\n\n` + table(["Stack", ...METRICS], a.configurations.filter((c) => c.name !== "null").map((c) => [c.name, ...METRICS.map((m) => interval(a.paired.find((p) => p.name === c.name && p.metric === m)![part]))]))),
    "## Classification",
    "Operational definition by the keeper, pending Rex (verbatim): " + DEFINITION,
    "For the second context-dependent clause, halves disagree in sign when their paired means have opposite signs. Zero is not a sign; an unavailable interval does not exclude zero.",
    table(["Stack", "Metric", "Seeds differing from null", "Classification"], a.paired.map((p) => [p.name, p.metric, p.differingSeeds, p.classification])),
    `Summary: stable ${a.counts.stable}; context-dependent ${a.counts["context-dependent"]}; none ${a.counts.none}. Stack-metric vectors with at least one nonzero seed difference: ${a.paired.filter((p) => p.differingSeeds > 0).length}/${a.paired.length}. Stacks equal to null on every metric and seed: ${nullEquivalent.join(", ") || "none"}. A classification of none is not proof of equivalence or absence of small effects.`,
    "## Function ledger",
    `Ledger schema: ${ledger.schema}; ${ledger.seedCount} independent seeds (1–24), 17 configurations per seed. The 408 reduced ledger-run records match the corresponding 200-seed input records.`,
    ...ledger.limitations,
    "Whole-formula groups overlap, not an additive decomposition: shared F1/F2/F3 are mapped to present functions, and F7/F11 combine functions. The JSON names eight function groups, not separate shared-formula rows. Activations count changed function-group/hook/epoch tuples, not aggregate hook calls. No cause is inferred from a parameter name. metrics.trace.byFormula is null; per-formula firing cannot be recovered from these inputs.",
    table(["Group", "Activations", "Opportunities", "Frequency", "Mean ΔU", "95% seed interval", "Seeds", "Learning KL", "Eligibility active / eligible / no input"], ledgerRows.map((r) => [r.key, r.activations, r.opportunities, number(r.frequency), number(r.meanDeltaU), r.interval95?.map(number).join(" to ") ?? "unavailable", r.seeds, number(r.learningContribution), `${r.eligibility.activated} / ${r.eligibility["eligible-not-activated"]} / ${r.eligibility["no-relevant-input"]}`])),
    `Activated groups: ${ledgerRows.filter((r) => r.activations > 0).map((r) => r.key).join(", ") || "none"}. Groups that never changed a hook output: ${ledgerRows.filter((r) => r.activations === 0).map((r) => r.key).join(", ") || "none"}. Groups with ΔU intervals excluding zero: ${ledgerRows.filter((r) => r.interval95 && (r.interval95[0] > 0 || r.interval95[1] < 0)).map((r) => r.key).join(", ") || "none"}. ΔU is the base chosen action's margin effect under full-trajectory ablation, not a behavioral metric.`,
    "Stack-null behavioral differences are reported above, but no individual function group can be established as their cause: the ledger contains utility-margin effects, not ablated behavioral metric vectors. Group-level behavioral attribution is unavailable, rather than zero. Se/Si have domain learning contributions; other groups have zero domain learning contribution here.",
    "Re-check of T-3's never-fired list (F4–F7, F9–F11, F13): S1 has space and physical/present/targeted inputs, nonzero Se/Si learning contributions and group output changes. Individual formulas cannot be labeled fired/never-fired from byFormula: null. All generate calls remain unchanged; no function group remains wholly inactive. F6 categorical precision is limited as below. These observations do not establish a formula-level causal decomposition.",
    `### Aggregate hook trace (${a.seeds.length} seeds)`,
    "Cells are changed calls / total calls. changedCueShares counts shares changed beyond 1e-12, not parameter changes. The pure analysis also retains changed-parameter counts per hook.",
    table(["Configuration", ...HOOKS, "changedCueShares"], a.configurations.map((c) => [c.name, ...HOOKS.map((h) => `${c.hooks[h].changedCalls} / ${c.hooks[h].calls}`), c.changedCueShares])),
    "## Controls",
    "The two T-1 controls—randomised θ with the null personality, and hook outputs shuffled across functions—were **not run**: the runner has no such option.",
    significant.length ? "Differences for the next control unit: " + significant.map((p) => `${p.name} × ${p.metric} (${p.classification})`).join("; ") + "." : "No stable or context-dependent behavioral difference exists for a control to rule out. The controls are moot for S1 as built under the keeper's operational classification: no difference meets the stable or context-dependent criteria. Seed-level differences can still exist; none qualifies as an effect requiring those controls under this rule. This does not satisfy the unrun mandatory T-1 control protocol or control the ledger's internal ΔU effects.",
    "## Interpretation limits",
    "The metrics files cannot show per-epoch or per-patch context, action ordering, conditional effects or observation updates. Those contexts require full traces, which were not kept. Seed halves test seed-range stability, not environmental context subsets. Identical aggregate metrics do not prove identical complete trajectories.",
    "S1 supplies categorical colour/size cues. F6's targeted Weber-precision modification is recorded but categorical identification does not consume that precision; the present-physical attention lever is active. Current S1 traces record observationBeliefDeltas with subjective prior/posterior beliefs and KL; older report inputs may predate these diagnostics. Frozen context also has no remembered flag.",
    "The ledger cost ceiling limited influence evidence to 24 seeds: exact full-trajectory counterfactuals cost several worlds and lightweight summaries do not meet the requested small constant overhead. No 200-seed mechanism-influence claim is made. Missing comparable chosen actions are excluded from ΔU, never replaced by zero.",
    `This is level-5 evidence of model behavior, not human validation; human comparison waits until S6. T-3's 16 → 3 measured behaviors become ${a.configurations.length - 1} → ${a.vectors.distinct} on these S1 metrics. F1–F13, fixture, parameters and engine are unchanged; no tuning is proposed.`,
  ].join("\n\n") + "\n";
}
export function parseRecords(text: string): MetricRecord[] { return text.trim().split(/\r?\n/).map((line) => JSON.parse(line) as MetricRecord); }
export const ADDENDUM_HEADING = "## Addendum (2026-11-02): reclassification under §10";
/** Preserve the complete original UTF-8 prefix, including its final whitespace. */
export function replaceAddendum(original: string, body: string): string {
  const start = original.indexOf(ADDENDUM_HEADING);
  if (start >= 0) return original.slice(0, start + ADDENDUM_HEADING.length) + "\n\n" + body;
  return original + ADDENDUM_HEADING + "\n\n" + body;
}

export function renderAddendum(records: readonly MetricRecord[], analysis: Analysis, ledger: Report, runs: readonly Ledger[]): string {
  const seeds = [...new Set(runs.map((r) => r.seed))].sort((a, b) => a - b);
  // Match diagnostics/report.ts: sum margins/counts across configurations and hooks WITHIN a seed,
  // then give independent seeds equal weight. Retain the original report's null control rows.
  const inputs = ledger.byFunction.map((row) => ({ key: row.key, eligibility: row.eligibility,
    seedEffects: seeds.map((seed) => {
      const rows = runs.filter((r) => r.seed === seed).flatMap((r) => r.summary.filter((s) => s.function === row.key));
      const count = rows.reduce((n, r) => n + r.deltaUCount, 0);
      return count ? rows.reduce((n, r) => n + r.deltaUSum, 0) / count : null;
    }) }));
  const mechanisms = classifyMechanisms(inputs);
  // Fail closed if individual reduced ledgers do not reproduce the aggregate input report.
  for (const row of ledger.byFunction) {
    const source = runs.flatMap((r) => r.summary.filter((s) => s.function === row.key));
    for (const field of ["activated", "eligible-not-activated", "no-relevant-input"] as const) {
      if (source.reduce((n, r) => n + r.eligibility[field], 0) !== row.eligibility[field]) throw new Error(`Ledger eligibility mismatch: ${row.key}`);
    }
    const result = mechanisms.find((r) => r.key === row.key)!;
    if (result.all.n !== row.seeds || (result.all.mean === null) !== (row.meanDeltaU === null) ||
      Math.abs((result.all.mean ?? 0) - (row.meanDeltaU ?? 0)) > 1e-12) throw new Error(`Ledger effect mismatch: ${row.key}`);
  }
  const baseline = new Map(records.filter((r) => key(r) === "null").map((r) => [r.seed, r]));
  const behaviour = analysis.paired.map((p) => {
    // Shared formula-group output changes are directly observed, not inferred from type letters.
    const stackRows = ledger.byStack.filter((r) => r.key.startsWith(`${p.name}/`) && r.changedHookCalls > 0);
    const exercised = stackRows.map((r) => ({ key: r.key.slice(p.name.length + 1), o_f: opportunityRate(r.eligibility) }));
    const differences = records.filter((r) => key(r) === p.name).sort((a, b) => a.seed - b.seed)
      .map((r) => r.metrics[p.metric] - baseline.get(r.seed)!.metrics[p.metric]);
    return { name: p.name, metric: p.metric, original: p.classification, ...classifyBehaviour(differences, exercised) };
  });
  const changed = behaviour.filter((r) => r.original !== r.classification).map((r) => `- ${r.name} × ${r.metric}: ${r.original} → ${r.classification}.`);
  const mechanismChanges = mechanisms.flatMap((r) => {
    const original = classify(r.all, r.first, r.second);
    return original === r.classification ? [] : [`- ${r.key}: ${original} → ${r.classification} (original S1 rule applied retrospectively to ledger effects).`];
  });
  const thresholds = CLASSIFICATION_THRESHOLDS;
  return [
    "Reproduce (updates only this addendum): `node --experimental-strip-types bench/scenarios/s1-forage/analyze.ts --addendum`.",
    `Recomputed from the existing out/s1-200.metrics.jsonl, out/s1-24-ledger.metrics.jsonl, out/ledger-report.json and the 408 out/ledger-{seed}-{version}-{stack}.json summaries. No simulation rerun. [Rule: DESIGN §10.1](../DESIGN.md#101-the-rule-keepers-operational-form): α=${thresholds.alpha}, θ_s=${thresholds.thetaS}, θ_ex=${thresholds.thetaEx}; halves split at the middle seed (12/24 and 100/200). seedInterval retains its conservative Student-t critical-value bins. Zero effects have no sign; unavailable effects are excluded, never replaced by zero.`,
    "### Mechanisms (24 seeds)",
    "Same aggregation as the original ledger report: V1's sixteen stacks plus the null control, pooled within seed, then equally weighted seeds. Groups overlap. o_f uses (active + eligible-not-activated) / (active + eligible-not-activated + no-input); the ledger's opportunities field counts eligible opportunities only. Effects are mean ΔU [95% interval].",
    table(["Group", "o_f", "s_f", "All seeds", "First half", "Second half", "Classification"], mechanisms.map((r) => [r.key, number(r.o_f), number(r.s_f), interval(r.all), interval(r.first), interval(r.second), r.classification])),
    "**Evidence discrepancy with §10.2's expectation:** the saved ledger gives Te/Ti/Fe/Fi 4608 active and 14976 no-input opportunities each (o_f = 0.235294118), not zero eligible input. Its shared F1/F2/F3 fallback counts internal-state opportunities outside each function's nominal domain (bench/diagnostics/ledger.ts localRecord; diagnostics/README.md). Applying §10.1 to these unchanged counts therefore does not label those groups not exercised. This is not evidence of domain-specific judging activity. The keeper must reconcile the expected domain-only interpretation with the recorded whole-formula groups; no counts, formulas or thresholds were changed.",
    "### Behaviour (200 paired seeds)",
    "Exercised groups are those with observed changedHookCalls in the stack's 24-seed byStack ledger and o_f ≥ θ_ex. These are measured whole-formula output differences; no per-function causal attribution is claimed. The 24-seed opportunity evidence is not a 200-seed ledger. Behaviour retains S1's original opposite-half-means clause (requires an all-seed interval excluding zero), adding seed consistency to stable and the all-groups-unexercised class.",
    table(["Stack", "Metric", "Exercised groups", "s_f", "All seeds", "First half", "Second half", "Classification"], behaviour.map((r) => [r.name, r.metric, r.exercised.join(", ") || "none", number(r.s_f), interval(r.all), interval(r.first), interval(r.second), r.classification])),
    "### Changed classes",
    changed.length ? changed.join("\n") : "No behaviour row changed from the original rule.",
    "The original report did not assign mechanism classes. For comparison only, applying its three-class rule to the same ledger effects gives these changes:",
    mechanismChanges.length ? mechanismChanges.join("\n") : "No mechanism row changes in that retrospective comparison.",
    "### Processing evidence and limits",
    "Each mechanism row rests on summary.eligibility and deltaUSum/deltaUCount from the saved ledgers; each behaviour row rests on paired metrics and byStack.changedHookCalls/eligibility. The underlying trace fields are hooks (parameters), attention.shares (cue shares), evaluation.expectedUtility (candidate EUs), and learning.updates[].kl (learning KL); reduced summaries retain interpretationMagnitude, attentionMoved and learningContribution. Full per-epoch traces were not retained, so context-specific attribution remains unavailable. See the original Function ledger and Aggregate hook trace tables above and [diagnostic attribution notes](../../diagnostics/README.md).",
    `The original negative findings and identical pairs remain: ${analysis.vectors.distinct} distinct joint metric vectors, ${analysis.vectors.identicalPairs} identical unordered stack pairs. T-1 control support now exists (unit 5435), but these stored inputs contain no control runs; no attribution to function structure is established. Level-5 model evidence only.`,
  ].join("\n\n") + "\n";
}
export const ADDENDUM2_HEADING = "## Addendum 2 (2026-11-02): own-opportunity count (§10.5)";
export function replaceAddendum2(original: string, body: string): string {
  if (!original.includes(ADDENDUM_HEADING)) throw new Error("First addendum required");
  const index = original.indexOf(ADDENDUM2_HEADING);
  const prefix = index < 0 ? original : original.slice(0, index);
  return prefix + ADDENDUM2_HEADING + "\n\n" + body;
}
export function mechanismInputs(ledger: Report, runs: readonly Ledger[]) {
  const seeds = [...new Set(runs.map((r) => r.seed))].sort((a, b) => a - b);
  const effects = (select: (run: Ledger) => string | undefined) => seeds.map((seed) => {
    const rows = runs.filter((r) => r.seed === seed).flatMap((r) => r.summary.filter((s) => s.function === select(r)));
    const count = rows.reduce((n, r) => n + r.deltaUCount, 0);
    return count ? rows.reduce((n, r) => n + r.deltaUSum, 0) / count : null;
  });
  return { rows: ledger.byFunction.map((r) => ({ key: r.key, eligibility: r.eligibility,
    ownCounts: ledger.ownByFunction?.find((o) => o.key === r.key)?.counts, seedEffects: effects(() => r.key) })),
    shared: ledger.sharedAttitude ? { counts: ledger.sharedAttitude.counts, seedEffects: effects((r) => r.ownOpportunities?.sharedGroup) } : undefined };
}
export function mechanismTable(rows: ReturnType<typeof classifyMechanisms>): string {
  return table(["Group", "o_f", "s_f", "All seeds", "First half", "Second half", "Classification"],
    rows.map((r) => [r.key, number(r.o_f), number(r.s_f), interval(r.all), interval(r.first), interval(r.second), r.classification]));
}
export function renderAddendum2(ledger: Report, runs: readonly Ledger[]): string {
  const inputs = mechanismInputs(ledger, runs);
  const own = classifyMechanisms(inputs.rows, { opportunity: "own", shared: inputs.shared });
  const group = classifyMechanisms(inputs.rows, { opportunity: "group" });
  return [
    "Reproduce: `node --experimental-strip-types bench/scenarios/s1-forage/analyze.ts --addendum2`.",
    "The old 24-seed summaries lack per-formula input. Only their 408 base trajectories (24 seeds, sixteen V1 stacks plus null) were replayed to reduce own opportunities into out/addendum2-temporary/. Regenerated metrics must exactly match the saved inputs; saved counterfactual effects are reused, and every existing ledger-report key is checked unchanged. No 200-seed study was rerun.",
    "### Mechanisms (24 seeds; own input)",
    "DESIGN §10.5 changes only the opportunity definition: α=0.05, θ_s=0.6, θ_ex=0.05; halves remain seeds 1–12 and 13–24. The denominator remains all function/hook/epoch tuples, including absent functions and null. Input is counted once per tuple when an owned formula receives relevant input, regardless of output activation. Numerators and denominators are stored in ownByFunction and sharedAttitude. Ownership follows frozen V1 formulas.json: F4 Se/Ne/Te, F5 Si/Ni, F6 Se, F7 the enabled domain owners, F8 Si, F9 Ne, F10 Ni, F11 Ne/Ni, F12 Ni, F13 Te; Ti/Fe/Fi cores remain off. F9/F10 have no host adapters in these traces; zero κ supplies no F11 input.",
    mechanismTable(own),
    "Function effects remain the original overlapping whole-group ΔU effects, not isolated own-operation effects. The shared row is never a function: its counterfactual reuses exactly one present Ti/Fe/Fi group per configuration (null uses Ti), whose only enabled formulas are F1–F3. Its opportunities are counted once per hook/epoch, without duplicating them across functions. Effects retain equal seed weighting, unavailable margins are excluded, and the shared row uses the same classification rule.",
    "### Changes from the first addendum",
    own.filter((r) => group.some((g) => g.key === r.key && g.classification !== r.classification)).map((r) =>
      `- ${r.key}: ${group.find((g) => g.key === r.key)!.classification} → ${r.classification}.`).join("\n") || "No function class changed.",
    "The shared row is new. The original behaviour tables and negative findings are retained: own opportunity classification does not establish behavioural attribution, and identical type pairs remain unchanged. Evidence rests on reconstructed subjective hooks/cue tags and saved summary deltaUSum/deltaUCount; no formulas, thresholds, or engine code changed. This remains level-5 model evidence.",
  ].join("\n\n") + "\n";
}
if ((import.meta as ImportMeta & { main?: boolean }).main) {
  try {
    const args = process.argv.slice(2), addendum = args[0] === "--addendum", addendum2 = args[0] === "--addendum2";
    const defaults = ["s1-200.metrics.jsonl", "s1-24-ledger.metrics.jsonl", "ledger-report.json", "ledger-report.md"].map((p) => join(import.meta.dirname, "out", p));
    const paths = addendum || addendum2 ? (args.length === 1 ? defaults : args.slice(1)) : args;
    if (paths.length !== 4) throw new Error("Usage: analyze.ts METRICS_JSONL LEDGER_METRICS_JSONL LEDGER_REPORT_JSON LEDGER_REPORT_MD (Markdown to stdout)");
    const texts = paths.map((p) => readFileSync(p, "utf8"));
    const records = parseRecords(texts[0]), subset = parseRecords(texts[1]);
    if (records.length !== 3400 || subset.length !== 408) throw new Error("Expected 3400 main and 408 ledger records");
    const analysis = analyze(records), small = analyze(subset, 12);
    if (analysis.configurations.length !== 17 || analysis.seeds.join(",") !== Array.from({ length: 200 }, (_, i) => i + 1).join(",") || small.configurations.length !== 17 || small.seeds.join(",") !== Array.from({ length: 24 }, (_, i) => i + 1).join(",")) throw new Error("Unexpected configuration/seed coverage");
    const main = new Map(records.map((r) => [`${r.seed}/${key(r)}`, r]));
    for (const r of subset) if (JSON.stringify(r) !== JSON.stringify(main.get(`${r.seed}/${key(r)}`))) throw new Error("Ledger metrics differ from main run");
    const ledger = JSON.parse(texts[2]) as Report;
    if (ledger.schema !== "function-ledger-report/v1" || ledger.seedCount !== 24) throw new Error("Unexpected ledger schema/seed count");
    if (addendum || addendum2) {
      const runs = subset.map((r) => {
        const path = join(dirname(paths[2]), `ledger-${r.seed}-${r.configuration.version}-${r.configuration.stack ?? "null"}.json`);
        const run = JSON.parse(readFileSync(path, "utf8")) as Ledger;
        if (run.schema !== "function-ledger/v1" || run.scenario !== r.scenario || run.seed !== r.seed ||
          run.configuration.version !== r.configuration.version || run.configuration.stack !== r.configuration.stack) throw new Error(`Invalid ledger: ${path}`);
        return run;
      });
      const reportPath = join(import.meta.dirname, "REPORT.md");
      if (addendum2) {
        // Old summaries lack per-formula context. Regenerate only the 24-seed
        // base traces for opportunity reduction, retaining verified saved effects.
        const temporary = join(dirname(paths[2]), "addendum2-temporary");
        mkdirSync(temporary, { recursive: true });
        for (let i = 0; i < runs.length; i++) {
          const run = runs[i];
          if (!run.ownOpportunities) {
            const fresh = runRecord(run.seed, run.configuration, "off");
            if (JSON.stringify(fresh.metrics) !== JSON.stringify(subset[i].metrics)) throw new Error(`Regenerated metrics differ: ${run.seed}/${run.configuration.stack}`);
            run.ownOpportunities = ownOpportunities(fresh);
          }
          writeFileSync(join(temporary, `ledger-${run.seed}-${run.configuration.version}-${run.configuration.stack ?? "null"}.json`), JSON.stringify(run) + "\n");
        }
        const updated = buildReport(runs);
        for (const field of Object.keys(ledger) as (keyof Report)[]) {
          if (field !== "ownByFunction" && field !== "sharedAttitude" && JSON.stringify(updated[field]) !== JSON.stringify(ledger[field])) throw new Error(`Legacy report changed: ${field}`);
        }
        writeFileSync(join(temporary, "ledger-report.json"), JSON.stringify(updated, null, 2) + "\n");
        writeFileSync(reportPath, replaceAddendum2(readFileSync(reportPath, "utf8"), renderAddendum2(updated, runs)));
      } else {
        const body = renderAddendum(records, analysis, ledger, runs);
        writeFileSync(reportPath, replaceAddendum(readFileSync(reportPath, "utf8"), body));
      }
      process.stdout.write(`Updated ${reportPath}\n`);
    } else process.stdout.write(renderReport(analysis, ledger, { source: sourceHash(), inputs: paths.map((path, i) => ({ path, bytes: (statSync(path) as { size: number; isDirectory(): boolean }).size, lines: texts[i].trimEnd().split(/\r?\n/).length })) }));
  } catch (error) { process.stderr.write(`${String(error)}\n`); process.exitCode = 1; }
}
