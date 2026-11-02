import { readFileSync } from "node:fs";
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
declare const process: { argv: string[]; stdout: { write(text: string): void } };
if ((import.meta as ImportMeta & { main?: boolean }).main) {
  const records = process.argv.slice(2).flatMap(path => readFileSync(path, "utf8").trim().split(/\r?\n/).filter(Boolean).map(line => JSON.parse(line) as RecordInput));
  process.stdout.write(renderReport(analyze(records)));
}
