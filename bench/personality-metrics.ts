import { canonical } from "@rex/kernel";
import type { Domain, LearningTrace, SelectionTrace } from "../src/index.ts";
import { DOMAINS } from "./personality-models.ts";
import { FIXTURE, runHungryPair } from "./hungry-pair/world.ts";
import type { Outcome } from "./hungry-pair/world.ts";

export type Run = ReturnType<typeof runHungryPair>;
export type Metrics = Record<string, number | null>;
export const STABLE_EPOCHS = 3; // proposed finite-horizon measurement, not a model parameter.

/** DESIGN §9 T-3 measurement: exact EU ordering including ties and candidate membership.
 * A disappearing candidate counts as a changed ranking. No one-candidate "learning" success.
 */
export function ranking(trace: SelectionTrace, domain: Domain): string | null {
  const rows = trace.candidates.filter((c) => c.candidate.domain === domain)
    .map((c) => ({ id: `${c.candidate.action}@${c.candidate.target ?? ""}`, eu: c.expectedUtility }))
    .sort((a, b) => b.eu - a.eu || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  if (rows.length < 2) return null;
  const groups: string[][] = [];
  rows.forEach((row, i) => {
    if (i === 0 || row.eu !== rows[i - 1].eu) groups.push([]);
    groups.at(-1)!.push(row.id);
  });
  return canonical(groups);
}

/** Proposed retrospective stabilization: first epoch of the final unchanged suffix,
 * lasting >=3 consecutive epochs through the horizon, strictly after informative feedback.
 * Unobserved / right-censored is null, never zero or the horizon substituted as an event.
 */
export function stabilization(rows: readonly { t: number; rank: string | null }[], first: number) {
  const after = rows.filter((row) => row.t > first);
  const last = after.at(-1);
  if (!last || last.rank === null) return null;
  let start = after.length - 1;
  while (start > 0 && after[start - 1].rank === last.rank && after[start].t - after[start - 1].t === FIXTURE.epochMs) start--;
  return after.length - start >= STABLE_EPOCHS ? (after[start].t - first) / FIXTURE.epochMs : null;
}

export function summarizePersonality(run: Run): Metrics {
  const result: Metrics = {};
  const choices = new Map<string, SelectionTrace["candidates"][number]["candidate"]>();
  for (const trace of run.decisions) {
    const candidate = trace.candidates.find((c) => c.candidate.action === trace.intention.action && c.candidate.target === trace.intention.target)!;
    choices.set(trace.intention.id, candidate.candidate);
  }
  const local = (id: string) => id.replace(/^cognition\//, "");
  const learning = run.attributions.map((event) => event.payload as LearningTrace);
  const outcomes = run.outcomes.map((event) => event.payload as Outcome);
  for (const [index, role] of ["A", "B", "O"].entries()) {
    const mind = `mind.${String(index + 1).padStart(4, "0")}`;
    const decisions = run.decisions.filter((trace) => local(trace.mind) === mind);
    for (const domain of DOMAINS) {
      const prefix = `${role}/${domain}`;
      // All host repertoire actions appear in every trace, including zero-frequency actions.
      const actions = [...new Set(decisions.flatMap((trace) => trace.candidates.filter((c) => c.candidate.domain === domain).map((c) => c.candidate.action)))].sort();
      for (const action of actions) result[`${prefix}/action:${action}`] =
        decisions.filter((trace) => trace.intention.action === action).length / decisions.length;
      const receipts = outcomes.filter((outcome) => local(outcome.mind) === mind && choices.get(local(outcome.intention))?.domain === domain);
      for (const outcome of ["good", "bad", "unfinished"]) result[`${prefix}/outcome:${outcome}`] =
        receipts.length ? receipts.filter((receipt) => receipt.result === outcome).length / receipts.length : null;
      result[`${prefix}/receipts`] = receipts.length;
      const first = Math.min(...learning.filter((trace) => local(trace.mind) === mind &&
        choices.get(local(trace.intention))?.domain === domain && trace.outcome !== "unfinished" &&
        trace.updates.some((update) => Number(update.kl) > 0)).map((trace) => trace.t));
      const eligible = Number.isFinite(first);
      const speed = eligible ? stabilization(decisions.map((trace) => ({ t: trace.t, rank: ranking(trace, domain) })), first) : null;
      result[`${prefix}/informative`] = Number(eligible);
      result[`${prefix}/stabilized`] = Number(speed !== null);
      result[`${prefix}/censored`] = Number(eligible && speed === null);
      result[`${prefix}/learning-epochs`] = speed;
    }
  }
  return result;
}

export { interval, paired } from "./personality-report.ts";
