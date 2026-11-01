import { readFileSync, statSync } from "node:fs";
import { seedInterval } from "../../diagnostics/report.ts";
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
if ((import.meta as ImportMeta & { main?: boolean }).main) {
  try {
    const paths = process.argv.slice(2);
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
    process.stdout.write(renderReport(analysis, ledger, { source: sourceHash(), inputs: paths.map((path, i) => ({ path, bytes: (statSync(path) as { size: number; isDirectory(): boolean }).size, lines: texts[i].trimEnd().split(/\r?\n/).length })) }));
  } catch (error) { process.stderr.write(`${String(error)}\n`); process.exitCode = 1; }
}
