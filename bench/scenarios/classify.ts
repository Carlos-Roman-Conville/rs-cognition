import { seedInterval } from "../diagnostics/report.ts";
import { SHARED_ATTITUDE } from "../diagnostics/opportunities.ts";
import type { InputCounts } from "../diagnostics/opportunities.ts";

export type Classification = "stable" | "context-dependent" | "none" | "not exercised";
export interface Thresholds { alpha: number; thetaS: number; thetaEx: number }
/** DESIGN §10.1: Fisher's conventional alpha; keeper-chosen consistency and opportunity cutoffs. */
export const CLASSIFICATION_THRESHOLDS: Readonly<Thresholds> = Object.freeze({ alpha: 0.05, thetaS: 0.6, thetaEx: 0.05 });
export interface EligibilityCounts { activated: number; "eligible-not-activated": number; "no-relevant-input": number }
export interface MechanismInput {
  key: string; eligibility: EligibilityCounts;
  ownCounts?: InputCounts;
  /** One equally weighted effect per seed, in ascending seed order; null means unavailable, never zero. */
  seedEffects: readonly (number | null)[];
}
export interface ExercisedGroup { key: string; o_f: number }

function validate(thresholds: Readonly<Thresholds>) {
  // seedInterval's registered Student-t table implements only two-sided alpha=.05.
  if (thresholds.alpha !== CLASSIFICATION_THRESHOLDS.alpha) throw new Error("seedInterval supports only alpha=0.05");
  for (const value of [thresholds.thetaS, thresholds.thetaEx]) {
    if (!Number.isFinite(value) || value < 0 || value > 1) throw new Error("Threshold must be in [0, 1]");
  }
}
/** DESIGN §10.1: denominator includes no-input opportunities (ledger.opportunities does not). */
export function opportunityRate(counts: EligibilityCounts): number {
  for (const value of Object.values(counts)) if (!Number.isFinite(value) || value < 0) throw new Error("Invalid eligibility count");
  const eligible = counts.activated + counts["eligible-not-activated"];
  const all = eligible + counts["no-relevant-input"];
  return all ? eligible / all : 0;
}
function summary(values: readonly (number | null)[]) {
  const available = values.filter((v): v is number => v !== null);
  if (available.some((v) => !Number.isFinite(v))) throw new Error("Non-finite seed effect");
  return { n: available.length, mean: available.length ? available.reduce((a, b) => a + b, 0) / available.length : null,
    interval95: seedInterval(available) };
}
type Summary = ReturnType<typeof summary>;
const sign = (s: Summary) => s.interval95 && s.interval95[0] > 0 ? 1 : s.interval95 && s.interval95[1] < 0 ? -1 : 0;
function effect(values: readonly (number | null)[], exercised: boolean, thresholds: Readonly<Thresholds>, behaviour: boolean) {
  validate(thresholds);
  // DESIGN §10.1: split at the middle seed BEFORE excluding unavailable effects.
  const middle = Math.floor(values.length / 2);
  const all = summary(values), first = summary(values.slice(0, middle)), second = summary(values.slice(middle));
  const direction = Math.sign(all.mean ?? 0);
  // Zero has no direction and does not count as consistent evidence.
  const s_f = all.n && direction ? values.filter((v) => v !== null && Math.sign(v) === direction).length / all.n : 0;
  const a = sign(all), b = sign(first), c = sign(second);
  const disagree = first.mean !== null && second.mean !== null && first.mean * second.mean < 0;
  let classification: Classification = "none";
  if (!exercised) classification = "not exercised";
  else if (a && a === b && a === c && s_f >= thresholds.thetaS) classification = "stable";
  // Mechanisms use §10.1; behaviour retains S1's all-seed condition for opposite half means.
  else if (Boolean(b) !== Boolean(c) || (disagree && (!behaviour || Boolean(a))) || (a && s_f < thresholds.thetaS)) classification = "context-dependent";
  return { all, first, second, s_f, classification };
}

/** DESIGN §10.1: pure classification of ledger groups, separately for each personality version. */
export interface MechanismOptions {
  opportunity?: "group" | "own";
  shared?: { counts: InputCounts; seedEffects: readonly (number | null)[] };
}
export function classifyMechanisms(ledgerRows: readonly MechanismInput[],
  options: MechanismOptions | Readonly<Thresholds> = {}, thresholds = CLASSIFICATION_THRESHOLDS) {
  if ("alpha" in options) { thresholds = options; options = {}; }
  validate(thresholds);
  const rate = (counts: InputCounts | undefined) => {
    if (!counts) throw new Error("Own opportunity counts unavailable");
    return opportunityRate({ activated: 0, "eligible-not-activated": counts.input, "no-relevant-input": counts.total - counts.input });
  };
  const rows = ledgerRows.map((row) => {
    const o_f = options.opportunity === "own" ? rate(row.ownCounts) : opportunityRate(row.eligibility);
    return { key: row.key, o_f, ...effect(row.seedEffects, o_f >= thresholds.thetaEx, thresholds, false) };
  });
  if (options.opportunity !== "own") return rows;
  if (!options.shared) throw new Error("Shared attitude evidence unavailable");
  const o_f = rate(options.shared.counts);
  return [...rows.map((r) => ({ ...r, kind: "function" as const })),
    { key: SHARED_ATTITUDE, kind: "shared" as const, o_f,
      ...effect(options.shared.seedEffects, o_f >= thresholds.thetaEx, thresholds, false) }];
}

/** Pass ONLY groups by which this stack's hook outputs differ from null's, with their opportunity rates. */
export function classifyBehaviour(pairedDiffs: readonly number[], exercised: readonly ExercisedGroup[], thresholds = CLASSIFICATION_THRESHOLDS) {
  const groups = exercised.filter((g) => g.o_f >= thresholds.thetaEx).map((g) => g.key);
  return { exercised: groups, ...effect(pairedDiffs, groups.length > 0, thresholds, true) };
}
