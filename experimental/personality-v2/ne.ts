import type { RandomStreams } from "@rex/kernel";
import { contextMatches, validateCandidate } from "../../src/index.ts";
import type { Candidate, Episode, GenerateParams, MindView, PersonalityOperation, V1CompoundCandidate } from "../../src/index.ts";
import type { EightFunctionV2, V2Context } from "./v2.ts";

export const NE_STREAM = "cognition.personality.v2.Ne.generate";

export interface NeContext extends V2Context {
  readonly episodes: readonly Episode[];
  readonly context: Episode["context"];
  readonly random: RandomStreams;
  readonly operations: (Omit<PersonalityOperation, "operation"> & { readonly operation: "generate" })[];
}

export interface NeOptions {
  readonly context: (mind: MindView) => NeContext;
  /** Host subjective composition model, as in Te. Its stable action ID identifies
   * the ordered pair in existing episodes (including targets when relevant).
   */
  readonly compound: (a: Candidate, b: Candidate, mind: MindView) => Candidate | undefined;
}

/** DESIGN §22.4: raw episode count, not retrieval-weighted experience. Use §2.3's
 * context convention, including §22.4's conditioning on only encoded features.
 */
export function neNovelty(action: string, ctx: Pick<NeContext, "episodes" | "context">): number {
  const count = ctx.episodes.filter(episode => episode.action === action &&
    (episode.strengths === undefined ? contextMatches(episode.context, ctx.context) :
      Object.keys(episode.context).every(key => Object.hasOwn(ctx.context, key) &&
        ctx.context[key] === episode.context[key]))).length;
  return 1 / (1 + count);
}

export function generateNe(repertoire: readonly Candidate[], base: GenerateParams, mind: MindView,
  model: EightFunctionV2, options: NeOptions, existing: readonly Candidate[] = repertoire) {
  const unchanged = { candidates: existing, params: base };
  if (!model.operationEnabled("Ne", "generate")) return unchanged;
  const ctx = options.context(mind);
  const allocation = model.allocation(ctx).find(r => r.function === "Ne")?.A.eval ?? 0;
  if (allocation <= 0) return unchanged;
  const ranked: { candidate: V1CompoundCandidate; novelty: number }[] = [];
  for (const a of repertoire) for (const b of repertoire) {
    const compound = options.compound(a, b, mind);
    if (!compound) continue;
    validateCandidate(compound);
    if (existing.some(c => c.action === compound.action && c.target === compound.target)) continue;
    ranked.push({ candidate: { ...compound, steps: [
      { action: a.action, target: a.target }, { action: b.action, target: b.target },
    ] }, novelty: neNovelty(compound.action, ctx) });
  }
  // DESIGN §22.4: stable sorting preserves ordered repertoire ties.
  ranked.sort((a, b) => b.novelty - a.novelty);
  // DESIGN §22.7 / Num-Q1: estimated expected count 2*A, no competence gain.
  const expected = 2 * allocation;
  const whole = Math.floor(expected);
  const fraction = expected - whole;
  const count = whole + (fraction > 0 && ctx.random.get(NE_STREAM, ctx.mind)() < fraction ? 1 : 0);
  const added: V1CompoundCandidate[] = [];
  for (const { candidate } of ranked) {
    if (added.length === count) break;
    if (!added.some(c => c.action === candidate.action && c.target === candidate.target)) added.push(candidate);
  }
  ctx.operations.push({ function: "Ne", operation: "generate", executed: true,
    output: structuredClone({ context: ctx.context, expected, count, ranked, added }) });
  return { candidates: added.length ? [...existing, ...added] : existing, params: base };
}
