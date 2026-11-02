import type { RandomStreams } from "@rex/kernel";
import { validateCandidate } from "../../src/index.ts";
import type { Candidate, GenerateParams, MindView, PersonalityOperation, V1CompoundCandidate } from "../../src/index.ts";
import type { EightFunctionV2, V2Context } from "./v2.ts";

export const TE_STREAM = "cognition.personality.v2.Te.generate";

export interface TeContext extends V2Context {
  /** Host-selected existing goal; personality never chooses or creates one. */
  readonly activeGoal?: string;
  readonly random: RandomStreams;
  readonly operations: (Omit<PersonalityOperation, "operation"> & { readonly operation: "generate" })[];
}

export interface TeOptions {
  readonly context: (mind: MindView) => TeContext;
  /** Subjective model of these ordered steps; undefined means no known composition.
   * As in V1, the host owns joint effects, costs and precondition semantics.
   */
  readonly compound: (a: Candidate, b: Candidate, mind: MindView) => Candidate | undefined;
}

/** DESIGN §22.4 Te: expected progress per unit cost and duration. Proposed zero-cost
 * convention: positive progress is infinitely efficient; no progress is not added.
 * Divide sequentially to avoid overflow in cost * duration; ties retain repertoire order.
 */
export function teEfficiency(candidate: Candidate, goal: { id: string; progress: number }): number {
  const progress = candidate.effects.reduce((sum, effect, i) => sum + candidate.outcomes.probabilities[i] *
    ((effect.goalProgress[goal.id] ?? goal.progress) - goal.progress), 0);
  return progress <= 0 ? 0 : candidate.cost === 0 ? Infinity : progress / candidate.cost / candidate.duration;
}

export function generateTe(candidates: readonly Candidate[], base: GenerateParams, mind: MindView,
  model: EightFunctionV2, options: TeOptions) {
  const unchanged = { candidates, params: base };
  if (!model.operationEnabled("Te", "generate")) return unchanged;
  const ctx = options.context(mind);
  const goal = mind.needs.goals.find(g => g.id === ctx.activeGoal);
  if (!goal) return unchanged;
  const allocation = model.allocation(ctx).find(r => r.function === "Te")?.A.eval ?? 0;
  if (allocation <= 0) return unchanged;
  const ranked: { candidate: V1CompoundCandidate; score: number }[] = [];
  for (const a of candidates) for (const b of candidates) {
    const compound = options.compound(a, b, mind);
    if (!compound) continue;
    validateCandidate(compound);
    if (candidates.some(c => c.action === compound.action && c.target === compound.target)) continue;
    const score = teEfficiency(compound, goal);
    if (score <= 0) continue;
    ranked.push({ candidate: { ...compound, steps: [
      { action: a.action, target: a.target }, { action: b.action, target: b.target },
    ] }, score });
  }
  ranked.sort((a, b) => a.score === b.score ? 0 : a.score > b.score ? -1 : 1);
  // DESIGN §22.7 / Num-Q1: estimated expected count 2*A, no competence gain.
  const expected = 2 * allocation;
  const whole = Math.floor(expected);
  const fraction = expected - whole;
  const count = whole + (fraction > 0 && ctx.random.get(TE_STREAM, ctx.mind)() < fraction ? 1 : 0);
  const added: V1CompoundCandidate[] = [];
  for (const { candidate } of ranked) {
    if (added.length === count) break;
    if (!added.some(c => c.action === candidate.action && c.target === candidate.target)) added.push(candidate);
  }
  ctx.operations.push({ function: "Te", operation: "generate", executed: true,
    output: structuredClone({ goal: goal.id, expected, count, added }) });
  return { candidates: added.length ? [...candidates, ...added] : candidates, params: base };
}
