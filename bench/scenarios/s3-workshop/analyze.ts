import { readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { buildReport } from "../../diagnostics/report.ts";
import { sourceHash } from "../../hungry-pair/report-integrity.ts";
import { mechanismInputs, mechanismTable } from "../s1-forage/analyze.ts";
import { SHARED_ATTITUDE } from "../../diagnostics/opportunities.ts";
import { commitmentCalibration } from "./run.ts";
import { classifyBehaviour, classifyMechanisms, CLASSIFICATION_THRESHOLDS, opportunityRate } from "../classify.ts";
import { FUNCTIONS } from "../../diagnostics/ablation.ts";
import { addTotals, emptyTotals } from "../../diagnostics/ledger.ts";
import type { Ledger } from "../../diagnostics/ledger.ts";
import type { Configuration } from "./cognition.ts";
import type { summarizeWorkshop } from "./metrics.ts";
export const METRICS = ["completionRate", "switchesPerCompletedTask", "verifyBeforeContinueRate", "lowOpinionAcceptance", "lowProceduralAcceptance"] as const;
export interface RecordInput { seed: number; configuration: Configuration; header: { kappa: number }; metrics: ReturnType<typeof summarizeWorkshop>; ledger?: Ledger }
const control = (r: RecordInput) => r.configuration.control ?? "none";
export function analyze(records: readonly RecordInput[]) {
  if (!records.length) throw new Error("No S3 records");
  const ids = records.map(r => JSON.stringify([r.seed, r.configuration.version, r.configuration.stack, control(r)]));
  if (new Set(ids).size !== ids.length) throw new Error("Duplicate scenario records");
  const kappas = [...new Set(records.map(r => r.header.kappa))];
  if (kappas.length !== 1 || !Number.isFinite(kappas[0]) || kappas[0] <= 0) throw new Error("Missing or inconsistent calibrated kappa");
  const groups = [...new Set(records.map(r => `${r.configuration.version}/${control(r)}`))];
  return { scenario: "s3-workshop", kappa: kappas[0], thresholds: CLASSIFICATION_THRESHOLDS, groups: groups.map(key => {
    const group = records.filter(r => `${r.configuration.version}/${control(r)}` === key).sort((a, b) => a.seed - b.seed);
    const seeds = [...new Set(group.map(r => r.seed))];
    if (control(group[0]) === "none" && group[0].configuration.version !== "null" && group.some(r => !r.ledger)) throw new Error("Mechanism classification requires --ledger summary");
    const available = group.every(r => !!r.ledger) && control(group[0]) === "none";
    const totals = (rows: Ledger["summary"]) => { const sum = emptyTotals(); rows.forEach(row => addTotals(sum, row)); return sum; };
    const inputs = FUNCTIONS.map(f => ({ key: f,
      eligibility: totals(group.flatMap(r => r.ledger?.summary.filter(s => s.function === f) ?? [])).eligibility,
      seedEffects: seeds.map(seed => { const sum = totals(group.filter(r => r.seed === seed).flatMap(r => r.ledger?.summary.filter(s => s.function === f) ?? [])); return sum.meanDeltaU; }) }));
    const mechanisms = available ? classifyMechanisms(inputs) : [];
    const stacks = [...new Set(group.map(r => r.configuration.stack ?? "null"))];
    const behaviour = stacks.flatMap(stack => {
      const runs = group.filter(r => (r.configuration.stack ?? "null") === stack);
      // section 10: compare each version/control with the matched-seed unmodified null.
      const paired = runs.map(r => {
        const baseline = records.find(b => b.seed === r.seed && b.configuration.version === "null" && control(b) === "none");
        if (!baseline) throw new Error(`Missing unmodified null for seed ${r.seed}`);
        return { r, baseline };
      });
      const exercised = FUNCTIONS.flatMap(f => { const sum = totals(runs.flatMap(r => r.ledger?.summary.filter(s => s.function === f) ?? []));
        return sum.changedHookCalls ? [{ key: f, o_f: opportunityRate(sum.eligibility) }] : []; });
      // Controls cannot be attributed to unpermuted function groups. Report the actual hook opportunity separately.
      const controlGroups = control(group[0]) !== "none" && runs.some(r => Object.values(r.metrics.trace.hooks).some(h => h.changedCalls))
        ? [{ key: "control hooks (unattributed)", o_f: 1 }] : exercised;
      return METRICS.map(metric => ({ stack, metric, ...classifyBehaviour(paired.map(({ r, baseline }) => r.metrics[metric] - baseline.metrics[metric]), controlGroups),
        attributionAvailable: available }));
    });
    return { key, seeds, mechanisms, behaviour, mechanismAvailability: available ? "available" : "unavailable: controls have no function attribution; otherwise supply --ledger summary",
      evidence: ["ledger.summary.eligibility", "ledger.summary.deltaUSum/deltaUCount", "trace.hooks", "trace.attention.shares", "trace.evaluation.expectedUtility", "trace.learning.updates[].kl"] };
  }) };
}
export function renderReport(result: ReturnType<typeof analyze>) {
  const lines = [`# S3 Workshop`, ``, `Calibrated kappa: ${result.kappa}. Thresholds: ${JSON.stringify(result.thresholds)}.`, ""];
  for (const group of result.groups) {
    lines.push(`## ${group.key}`, "", `Seeds: ${group.seeds.join(", ")}. Mechanism evidence: ${group.mechanismAvailability}.`, "",
      "| Function | Opportunity | Consistency | Mean effect | 95% interval | First half | Second half | Class |", "|---|---:|---:|---:|---|---|---|---|");
    for (const row of group.mechanisms) lines.push(`| ${row.key} | ${row.o_f} | ${row.s_f} | ${row.all.mean} | ${JSON.stringify(row.all.interval95)} | ${JSON.stringify(row.first.interval95)} | ${JSON.stringify(row.second.interval95)} | ${row.classification} |`);
    lines.push("", "| Stack | Metric | Mean difference | 95% interval | Consistency | Exercised groups | Class |", "|---|---|---:|---|---:|---|---|");
    for (const row of group.behaviour) lines.push(`| ${row.stack} | ${row.metric} | ${row.all.mean} | ${JSON.stringify(row.all.interval95)} | ${row.s_f} | ${row.exercised.join(", ")} | ${row.classification} |`);
    lines.push("", `Evidence: ${group.evidence.join(", ")}. Controls are compared with the unmodified null; effects present under controls are not attributable to function structure.`, "");
  }
  return lines.join("\n");
}
export interface StudyRecord {
  scenario: string; seed: number; configuration: Configuration; replayed: boolean;
  metrics: RecordInput["metrics"];
}
const studyKey = (r: StudyRecord) => r.configuration.version === "null" ? "null" : `${r.configuration.version}/${r.configuration.stack}`;
const studyControl = (r: StudyRecord) => r.configuration.control ?? "none";
const fmt = (v: number | null) => v === null ? "unavailable" : Number(v.toPrecision(9)).toString();
const cell = (s: ReturnType<typeof classifyBehaviour>["all"]) => `${fmt(s.mean)} [${s.interval95?.map(fmt).join(", ") ?? "unavailable"}] (n=${s.n})`;
const table = (head: string[], rows: (string | number)[][]) => [head, head.map(() => "---"), ...rows].map(r => `| ${r.join(" | ")} |`).join("\n");
const hasEffect = (r: ReturnType<typeof classifyBehaviour>) => r.classification === "stable" || r.classification === "context-dependent";
/** §10.3: a qualifying same-direction effect under either control defeats structure attribution.
 * This is an appearance test, not a test of equivalence between effect magnitudes. */
export function controlAttribution(base: ReturnType<typeof classifyBehaviour>, controls: ReturnType<typeof classifyBehaviour>[]) {
  if (!hasEffect(base)) return "no classified stack effect";
  return controls.some(c => hasEffect(c) && Math.sign(c.all.mean ?? 0) === Math.sign(base.all.mean ?? 0))
    ? "not attributable to function structure" : "not reproduced by these controls; causal attribution not established";
}

/** Reduced study inputs are paired by seed, configuration and control, never by file order. */
export function analyzeStudy(records: readonly StudyRecord[], runs: readonly Ledger[]) {
  const groups = new Map<string, Map<number, StudyRecord>>();
  for (const r of records) {
    if (r.scenario !== "s3-workshop" || !r.replayed || !Number.isSafeInteger(r.seed) || r.seed < 1 ||
      !["null", "v1"].includes(r.configuration.version) || METRICS.some(m => !Number.isFinite(r.metrics[m]))) throw new Error("Invalid S3 study record");
    const key = `${studyControl(r)}:${studyKey(r)}`, group = groups.get(key) ?? new Map();
    if (group.has(r.seed)) throw new Error(`Duplicate ${key}/${r.seed}`);
    group.set(r.seed, r); groups.set(key, group);
  }
  const baseline = groups.get("none:null");
  if (!baseline?.size) throw new Error("Missing unmodified null");
  const seeds = [...baseline.keys()].sort((a, b) => a - b);
  const names = [...groups.keys()].filter(k => k.startsWith("none:")).map(k => k.slice(5)).sort((a, b) => a === "null" ? -1 : b === "null" ? 1 : a.localeCompare(b, "en"));
  for (const control of ["none", "random-theta", "shuffled"]) for (const name of names) {
    const group = groups.get(`${control}:${name}`);
    if (!group || group.size !== seeds.length || seeds.some(s => !group.has(s))) throw new Error(`Unpaired ${control}:${name}`);
  }
  if (groups.size !== names.length * 3) throw new Error("Unexpected control configuration");
  const ledgerIds = new Set<string>();
  for (const run of runs) {
    const id = `${run.seed}/${run.configuration.version}/${run.configuration.stack ?? "null"}`;
    if (run.schema !== "function-ledger/v1" || run.scenario !== "s3-workshop" || !run.ownOpportunities || ledgerIds.has(id) ||
      !baseline.has(run.seed)) throw new Error("Invalid or duplicate ledger");
    ledgerIds.add(id);
  }
  const ledgerSeeds = [...new Set(runs.map(r => r.seed))].sort((a, b) => a - b);
  if (!ledgerSeeds.length) throw new Error("Missing ledger");
  for (const seed of ledgerSeeds) for (const name of names) {
    if (!ledgerIds.has(`${seed}/${name === "null" ? "null/null" : name}`)) throw new Error("Unpaired ledger");
  }
  if (runs.length !== ledgerSeeds.length * names.length) throw new Error("Unexpected ledger configuration");
  // Match S1: aggregate margins/counts within each seed before equal-weight seed summaries.
  const ledger = buildReport(runs), inputs = mechanismInputs(ledger, runs);
  const mechanisms = classifyMechanisms(inputs.rows, { opportunity: "own", shared: inputs.shared });
  const exercised = (name: string) => {
    const selected = runs.filter(r => `${r.configuration.version}/${r.configuration.stack}` === name);
    const report = buildReport(selected);
    const own = report.byFunction.filter(r => r.changedHookCalls > 0).map(r => {
      const c = report.ownByFunction!.find(o => o.key === r.key)!.counts;
      return { key: r.key, o_f: c.total ? c.input / c.total : 0 };
    });
    if (report.sharedAttitude?.effect?.changedHookCalls) {
      const c = report.sharedAttitude.counts;
      own.push({ key: SHARED_ATTITUDE, o_f: c.total ? c.input / c.total : 0 });
    }
    return own;
  };
  const configurations = names.map(name => ({ name, means: METRICS.map(m => seeds.reduce((sum, s) => sum + groups.get(`none:${name}`)!.get(s)!.metrics[m], 0) / seeds.length) }));
  const paired = names.filter(n => n !== "null").flatMap(name => {
    const evidence = exercised(name);
    return METRICS.map(metric => {
      const result = (control: string) => {
        const rows = seeds.map(s => groups.get(`${control}:${name}`)!.get(s)!);
        const differences = rows.map(r => r.metrics[metric] - baseline.get(r.seed)!.metrics[metric]);
        // Controls have no function attribution. Hook changes establish only control exposure.
        const hooks = rows.some(r => Object.values(r.metrics.trace.hooks).some(h => h.changedCalls > 0));
        return { ...classifyBehaviour(differences, control === "none" ? evidence : hooks ? [{ key: "control hooks (unattributed)", o_f: 1 }] : []),
          differingSeeds: differences.filter(d => d !== 0).length };
      };
      const base = result("none"), random = result("random-theta"), shuffled = result("shuffled");
      return { name, metric, ...base, random, shuffled, attribution: controlAttribution(base, [random, shuffled]) };
    });
  });
  const stacks = names.filter(n => n !== "null");
  const vectors = stacks.map(name => JSON.stringify(seeds.map(s => METRICS.map(m => groups.get(`none:${name}`)!.get(s)!.metrics[m]))));
  const identicalPairs = stacks.flatMap((name, i) => stacks.slice(i + 1).filter((_n, j) => vectors[i] === vectors[i + j + 1]).map(other => `${name} = ${other}`));
  return { seeds, ledgerSeeds, configurations, paired, mechanisms, ledger, identicalPairs, distinct: new Set(vectors).size,
    recordCount: seeds.length * names.length };
}

export interface StudyProvenance {
  source: string; commits: string; commitment: { seed: number; medianGap: number; kappa: number };
  inputs: { path: string; bytes: number; lines: number }[];
}
export function renderStudyReport(a: ReturnType<typeof analyzeStudy>, p: StudyProvenance) {
  const counts = Object.fromEntries(["stable", "context-dependent", "none", "not exercised"].map(c => [c, a.paired.filter(r => r.classification === c).length]));
  return ["# S3 workshop study", `Records: ${a.recordCount} (${a.seeds.length} seeds × ${a.configurations.length} configurations)`,
    `Source commits: ${p.commits}.`, `Source SHA256: ${p.source}`,
    "Hash: hungry-pair/report-integrity.ts sourceHash, sorted src/ paths and LF-normalized contents, measured at analysis time. Reduced inputs do not embed the runtime source hash or commit; listed commits identify source history, not independently attested run provenance.",
    `κ = ${p.commitment.kappa}; median gap = ${p.commitment.medianGap}. Runner commitmentCalibration(): null seed ${p.commitment.seed}, κ=0, best-minus-second-best candidate EU gap at each eligible decision; κ = 0.25 × median gap (DESIGN §10.4). Only this calibration was recomputed; no study was rerun.`,
    table(["Input", "Bytes", "Lines"], p.inputs.map(i => [i.path, i.bytes, i.lines])),
    "Keeper run commands (stdout reduced to scenario, seed, configuration, metrics, replayed):\n\n```sh\nnode --experimental-strip-types bench/scenarios/s3-workshop/run.ts --seeds 200 --stacks all --control none --ledger off\nnode --experimental-strip-types bench/scenarios/s3-workshop/run.ts --seeds 200 --stacks all --control random-theta --ledger off\nnode --experimental-strip-types bench/scenarios/s3-workshop/run.ts --seeds 200 --stacks all --control shuffled --ledger off\nnode --experimental-strip-types bench/scenarios/s3-workshop/run.ts --seeds 24 --stacks all --control none --ledger summary\nnode --experimental-strip-types bench/scenarios/s3-workshop/analyze.ts\n```",
    "## Metrics by configuration",
    "Equal-weight seed means, including the fixture's zero-denominator convention. Completion is finished tasks / 2, not defect-free completion. Switching divides by completed tasks. Verification requires an immediately preceding verify on the same task before a successful continue. Acceptance is the per-seed accepted/input share for low-reliability (r=0.4) opinion or procedural testimony; seeds without such input contribute zero, so these are not pooled conditional acceptance rates.",
    table(["Configuration", ...METRICS], a.configurations.map(c => [c.name, ...c.means.map(fmt)])),
    `Joint measured metric vectors: ${a.distinct} distinct; ${a.identicalPairs.length} identical unordered type pairs. Equality compares canonical JSON numeric vectors in ascending seed and fixed metric order, excluding null.`,
    a.identicalPairs.join("; ") || "No identical type pairs.",
    "## Paired differences from null",
    `Stack minus unmodified null on the same seed for every arm. Cells: mean [95% interval] (n). seedInterval uses Student t, df=n−1, with conservative df=10 critical value 2.228139 above ten degrees of freedom. Halves split at the middle sorted seed: first through ${a.seeds[Math.floor(a.seeds.length / 2) - 1]}, second thereafter. No multiple-comparison correction.`,
    table(["Stack", "Metric", "All seeds", "First half", "Second half", "Differing seeds"], a.paired.map(r => [r.name, r.metric, cell(r.all), cell(r.first), cell(r.second), r.differingSeeds])),
    "## Classification",
    `DESIGN §10.1 and §10.5; fixed thresholds ${JSON.stringify(CLASSIFICATION_THRESHOLDS)}. classifyBehaviour supplies the behavior rows; classifyMechanisms(opportunity: \"own\") supplies the mechanism rows. Stable requires same-sign nonzero intervals in all seeds and both halves and consistency ≥0.6. Context-dependent follows the registered half/consistency rule; none is the remaining exercised class. Opportunity below 0.05 is not exercised, never evidence of ineffectiveness.`,
    "### Behavior",
    `Behavior uses ${a.seeds.length} seeds; exercised groups are evidenced by changedHookCalls and own/shared input counts in the ${a.ledgerSeeds.length}-seed ledger, not assumed across unsaved traces. Shared F1–F3 exposure is explicitly separate from own function exposure.`,
    table(["Stack", "Metric", "Consistency", "Exercised groups", "Class"], a.paired.map(r => [r.name, r.metric, fmt(r.s_f), r.exercised.join(", ") || "not exercised", r.classification])),
    `Behavior class counts: ${JSON.stringify(counts)}. Stacks exactly equal to null on every measured metric and seed: ${a.configurations.filter(c => c.name !== "null" && a.paired.filter(r => r.name === c.name).every(r => !r.differingSeeds)).map(c => c.name).join(", ") || "no stacks"}. None does not establish equivalence or exclude small effects.`,
    "### Mechanisms (V1 with null reference rows)",
    `Independent ledger seeds: ${a.ledgerSeeds.length}; halves split at the middle seed. Own counts include absent functions and null in the denominator, matching S1 §10.5. Margin sums/counts are pooled within seed, then seeds receive equal weight; unavailable margins are excluded, never zero-filled.`,
    mechanismTable(a.mechanisms),
    "Evidence: ledger.ownOpportunities.byFunction/shared, summary.eligibility, summary.changedHookCalls, deltaUSum/deltaUCount; trace.hooks and changedCueShares. Full-trace cue shares, candidate expectedUtility and learning updates/KL underlie the ledger, but cannot be reconstructed from reduced metrics. Shared attitude (F1–F3) uses one present Ti/Fe/Fi shared-only group per configuration (null uses Ti), counted once, not once per function.",
    "## Function ledger",
    `Saved summary ledgers: ${a.ledgerSeeds.length} seeds × ${a.configurations.length} configurations. Their reduced metrics exactly match the corresponding main records (checked by CLI).`,
    ...a.ledger.limitations,
    "Whole-formula groups overlap: shared F1–F3 map to present functions and combined formulas involve multiple functions. This is not an additive decomposition. Own opportunity classification does not isolate own-function ΔU; effects still ablate overlapping groups. Activations count function-group/hook/epoch tuples, not aggregate hook calls.",
    table(["Group", "Activations", "Opportunities", "Frequency", "Mean ΔU", "95% interval", "Seeds", "Learning KL", "Active / eligible / no input"], a.ledger.byFunction.map(r => [r.key, r.activations, r.opportunities, fmt(r.frequency), fmt(r.meanDeltaU), r.interval95?.map(fmt).join(", ") ?? "unavailable", r.seeds, fmt(r.learningContribution), `${r.eligibility.activated} / ${r.eligibility["eligible-not-activated"]} / ${r.eligibility["no-relevant-input"]}`])),
    "## Controls",
    "Every stack and metric is compared against the same unmodified null, including random-theta and shuffled arms. Control hook exposure has no function attribution. A stable or context-dependent base effect appearing with the same mean sign and either effect class under a control is labelled not attributable to function structure. This operational appearance comparison does not test equality of magnitudes; passing it does not prove a mechanism.",
    table(["Stack", "Metric", "Base mean [95%] / class", "random-theta mean [95%] / class", "shuffled mean [95%] / class", "Attribution"], a.paired.map(r => [r.name, r.metric, `${cell(r.all)} / ${r.classification}`, `${cell(r.random.all)} / ${r.random.classification}`, `${cell(r.shuffled.all)} / ${r.shuffled.classification}`, r.attribution])),
    "## Interpretation limits",
    "Level-5 model evidence only; no human validation. Full trajectories were not retained in these reduced study files. Equal aggregate metrics do not establish equal trajectories. Seed halves assess seed-range stability, not environmental contexts. The 24-seed full-trajectory ablation ledger cannot support a 200-seed mechanism claim. Missing comparable actions are excluded from ΔU. Utility-margin effects are not ablated behavioral metrics, so individual function causes of behavioral differences remain unidentified.",
    "S3 is a 16-epoch, two-task fixture; defect probability 0.2, reliability 0.9/0.4, alternating instruction context and the κ scale are fixed fixture choices, not empirical estimates. Completion can include defects; zero verification and zero acceptance must be read under their denominator conventions. Own-input absence is not ineffectiveness. byFormula is null: hook changes and parameter names cannot establish individual formula firing. Frozen formulas, thresholds and engine were not tuned. External yardstick comparison waits for S6.",
  ].join("\n\n") + "\n";
}

if ((import.meta as ImportMeta & { main?: boolean }).main) {
  const root = join(import.meta.dirname, "out"), inputs: StudyProvenance["inputs"] = [];
  const read = (name: string) => {
    const path = join(root, name), text = readFileSync(path, "utf8");
    inputs.push({ path: `out/${name}`, bytes: (statSync(path) as { size: number; isDirectory(): boolean }).size, lines: text.trimEnd().split(/\r?\n/).length });
    return text;
  };
  const parse = (text: string) => text.trim().split(/\r?\n/).map(line => JSON.parse(line) as StudyRecord);
  const arms = ["none", "random-theta", "shuffled"].map(c => parse(read(`s3-200-${c}.metrics.jsonl`)));
  const subset = parse(read("s3-24-ledger.metrics.jsonl"));
  if (arms.some(a => a.length !== 3400) || subset.length !== 408) throw new Error("Unexpected study record counts");
  const main = new Map(arms[0].map(r => [`${r.seed}/${studyKey(r)}`, r]));
  for (const r of subset) if (JSON.stringify(r) !== JSON.stringify(main.get(`${r.seed}/${studyKey(r)}`))) throw new Error("Ledger metrics differ from main run");
  const runs = subset.map(r => {
    const run = JSON.parse(read(`ledger-${r.seed}-${r.configuration.version}-${r.configuration.stack ?? "null"}.json`)) as Ledger;
    if (run.seed !== r.seed || run.configuration.version !== r.configuration.version || run.configuration.stack !== r.configuration.stack) throw new Error("Ledger identity mismatch");
    return run;
  });
  const analysis = analyzeStudy(arms.flat(), runs);
  if (analysis.configurations.length !== 17 || analysis.seeds.some((s, i) => s !== i + 1) || analysis.seeds.length !== 200 ||
    analysis.ledgerSeeds.length !== 24 || analysis.ledgerSeeds.some((s, i) => s !== i + 1)) throw new Error("Unexpected seed/configuration coverage");
  writeFileSync(join(import.meta.dirname, "REPORT.md"), renderStudyReport(analysis, { source: sourceHash(), inputs,
    commits: "S3 fixture 9c17e42; own-opportunity amendments e0f7a37; analysis checkout bb24f86",
    commitment: commitmentCalibration() }));
}
