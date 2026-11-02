import type { V2Ledger } from "./v2-ledger.ts";
import { V2_FUNCTIONS } from "./v2-ledger.ts";
import { classifyMechanisms } from "../scenarios/classify.ts";
export interface ComparisonRecord {
  seed: number; configuration: { version: string; stack?: string; control?: string };
  metrics: object; ledger?: { schema: string };
}
const table = (headers: string[], rows: unknown[][]) => [headers, headers.map(() => "---"), ...rows]
  .map(row => `| ${row.map(x => x === null ? "unavailable" : typeof x === "object" ? JSON.stringify(x) : x).join(" | ")} |`).join("\n");
export function renderComparison(records: readonly ComparisonRecord[], metrics: readonly string[]) {
  const base = records.filter(r => !r.configuration.control || r.configuration.control === "none");
  const v2 = base.filter(r => r.configuration.version === "v2");
  const seen = new Set<string>();
  const paired = v2.map(r => {
    const key = `${r.seed}/${r.configuration.stack}`;
    if (seen.has(key)) throw new Error(`Duplicate V2 pair ${key}`);
    seen.add(key);
    const matches = base.filter(b => b.seed === r.seed && b.configuration.stack === r.configuration.stack && b.configuration.version === "v1");
    if (matches.length !== 1) throw new Error(`Expected one V1 pair for ${key}`);
    return { v1: matches[0], v2: r };
  });
  const values = (r: ComparisonRecord, metric: string) => {
    const value = (r.metrics as Record<string, unknown>)[metric];
    if (typeof value !== "number" || !Number.isFinite(value)) throw new Error(`Invalid metric ${metric}`);
    return value;
  };
  const seeds = [...new Set(v2.map(r => r.seed))].sort((a, b) => a - b);
  const ledgers = v2.flatMap(r => r.ledger?.schema === "function-ledger/v2" ? [r.ledger as V2Ledger] : []);
  const mechanism = V2_FUNCTIONS.map(f => {
    const rows = ledgers.flatMap(l => l.summary.filter(s => s.function === f));
    const total = rows.reduce((s, r) => s + r.opportunities, 0), eligible = rows.reduce((s, r) => s + r.eligible, 0);
    const classification = classifyMechanisms([{ key: f, eligibility: { activated: eligible, "eligible-not-activated": 0, "no-relevant-input": total - eligible },
      seedEffects: seeds.map(seed => {
        const own = ledgers.filter(l => l.seed === seed).flatMap(l => l.summary.filter(s => s.function === f));
        const n = own.reduce((s, r) => s + r.deltaUCount, 0);
        return n ? own.reduce((s, r) => s + r.deltaUSum, 0) / n : null;
      }) }])[0];
    const mean = (get: (r: V2Ledger["summary"][number]) => number) => rows.length ? rows.reduce((s, r) => s + get(r), 0) / rows.length : null;
    return [f, mean(r => r.allocation.att), mean(r => r.allocation.eval), mean(r => r.executionShare), mean(r => r.influenceShare),
      classification.o_f, classification.all.mean, classification.all.interval95, classification.s_f, classification.classification];
  });
  return ["## V1 against V2", paired.length ? "Identical seeds and stack identities; paired V2 − V1 differences below." : "No paired V2 records supplied.",
    table(["Seed", "Stack", "Metric", "V1", "V2", "V2 − V1"], paired.flatMap(p => metrics.map(m => [p.v2.seed, p.v2.configuration.stack, m,
      values(p.v1, m), values(p.v2, m), values(p.v2, m) - values(p.v1, m)]))),
    "### V2 mechanisms (DESIGN scenarios §10)",
    "Allocation is mean capacity per epoch. Execution and influence shares count function/operation pairs. Effects use the base action's EU margin; unavailable margins are excluded. Classifications use the registered thresholds and equal seed weighting. No operation input means not exercised. Shared parameters are separate, never function effects.",
    ledgers.length ? table(["Function", "Allocation att", "Allocation eval", "Execution share", "Influence share", "Opportunity", "Mean ΔU", "95% interval", "Consistency", "Class"], mechanism) : "V2 ledger unavailable: run with --ledger summary.",
    "Shared parameters: see each V2 ledger's sharedParameters rows. V2 changes none. Immediate influence excludes later effects of encoding. Held operations and unsupported fixture inputs cannot establish ineffectiveness."] .join("\n\n") + "\n";
}
