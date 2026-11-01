import { addTotals, emptyTotals } from "./ledger.ts";
import type { Ledger, SummaryRow, Totals } from "./ledger.ts";

export interface ReportRow extends Totals {
  key: string; seeds: number; interval95: [number, number] | null;
}
/** DESIGN diagnostics §2: independent units are seeds, never individual epochs or stacks.
 * Two-sided Student t interval on equally weighted seed means. Proposed conservative
 * critical-value bins beyond df=10; singleton seeds cannot identify uncertainty.
 */
export function seedInterval(values: readonly number[]): [number, number] | null {
  if (values.length < 2) return null;
  const mean = values.reduce((sum, x) => sum + x, 0) / values.length;
  const variance = values.reduce((sum, x) => sum + (x - mean) ** 2, 0) / (values.length - 1);
  const critical = [0, 12.706205, 4.302653, 3.182446, 2.776445, 2.570582, 2.446912, 2.364624, 2.306004, 2.262157, 2.228139];
  const df = values.length - 1;
  const t = critical[Math.min(df, 10)];
  const width = t * Math.sqrt(variance / values.length);
  return [mean - width, mean + width];
}

function aggregate(runs: readonly Ledger[], source: "summary" | "domains", key: (run: Ledger, row: SummaryRow) => string): ReportRow[] {
  const groups = new Map<string, { total: Totals; seeds: Map<number, { sum: number; count: number }> }>();
  for (const run of runs) for (const row of run[source]) {
    const id = key(run, row);
    let group = groups.get(id);
    if (!group) { group = { total: emptyTotals(), seeds: new Map() }; groups.set(id, group); }
    addTotals(group.total, row);
    const seed = group.seeds.get(run.seed) ?? { sum: 0, count: 0 };
    seed.sum += row.deltaUSum; seed.count += row.deltaUCount; group.seeds.set(run.seed, seed);
  }
  return [...groups].map(([key, group]) => {
    const means = [...group.seeds.values()].filter((seed) => seed.count).map((seed) => seed.sum / seed.count);
    return { key, ...group.total, meanDeltaU: means.length ? means.reduce((sum, x) => sum + x, 0) / means.length : null,
      seeds: means.length, interval95: seedInterval(means) };
  });
}

/** Pure trace-derived report. No filesystem or hypothesis-map dependency. */
export function buildReport(runs: readonly Ledger[]) {
  const stack = (run: Ledger) => `${run.configuration.version}/${run.configuration.stack ?? "null"}`;
  return { schema: "function-ledger-report/v1", seedCount: new Set(runs.map((run) => run.seed)).size,
    limitations: [...new Set(runs.flatMap((run) => run.limitations))],
    byFunction: aggregate(runs, "summary", (_run, row) => row.function),
    byStack: aggregate(runs, "summary", (run, row) => `${stack(run)}/${row.function}`),
    byScenario: aggregate(runs, "summary", (run, row) => `${run.scenario}/${row.function}`),
    byDomain: aggregate(runs, "domains", (_run, row) => row.domain!),
    observedRelevanceMap: aggregate(runs, "domains", (_run, row) => `${row.function}/${row.domain}`),
    byDevelopmentalStage: [] as ReportRow[], byUpbringing: [] as ReportRow[] };
}
export type Report = ReturnType<typeof buildReport>;
export const reportJSON = (report: Report) => `${JSON.stringify(report, null, 2)}\n`;
export function reportMarkdown(report: Report): string {
  const number = (x: number | null) => x === null ? "unavailable" : x.toFixed(6);
  const sections = ["byFunction", "byStack", "byScenario", "byDomain", "observedRelevanceMap", "byDevelopmentalStage", "byUpbringing"] as const;
  return `${report.limitations.join("\n\n")}\n\n${sections.map((section) => `## ${section}\n\n` +
    "| Group | Activations | Opportunities | Frequency | Mean ΔU | 95% seed interval | Seeds | Learning KL | Eligibility (active / eligible / no input) |\n" +
    "|---|---:|---:|---:|---:|---|---:|---:|---|\n" + report[section].map((row) =>
      `| ${row.key.replaceAll("|", "\\|")} | ${row.activations} | ${row.opportunities} | ${number(row.frequency)} | ${number(row.meanDeltaU)} | ${row.interval95?.map(number).join(" to ") ?? "unavailable"} | ${row.seeds} | ${number(row.learningContribution)} | ${row.eligibility.activated} / ${row.eligibility["eligible-not-activated"]} / ${row.eligibility["no-relevant-input"]} |`).join("\n")).join("\n\n")}\n`;
}
