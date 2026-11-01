import { nullPersonality } from "./personality.ts";
import type { PersonalityModel } from "./personality.ts";
import type { MindView, Relevance } from "./types.ts";

/** Metadata only, projected at the sensory boundary. Arrays are in host mint order. */
export interface AttentionCue {
  readonly cue: string;
  readonly salience: number;
  readonly relevance: Relevance;
}

export interface AttentionCategory {
  readonly id: string;
  readonly base: number;
  /** rel(j,k), keyed by need id; omitted relations are zero (proposed). */
  readonly relevance: Relevance;
}

export type PertinenceHook = (base: Record<string, number>, ctx: MindView) => Record<string, number>;
/** DESIGN §3: the baseline personality is identity. */
export const identityPertinence: PertinenceHook = (base) => base;

export interface AttentionAllocation {
  readonly pertinence: Readonly<Record<string, number>>;
  /** Weights and shares align with the input cue order. */
  readonly weights: readonly number[];
  readonly shares: readonly number[];
}

function nonnegative(value: number, name: string): number {
  if (!Number.isFinite(value) || value < 0) throw new RangeError(`${name} must be finite and nonnegative`);
  return value;
}

function membership(value: number): number {
  if (nonnegative(value, "relevance") > 1) throw new RangeError("relevance must be <= 1");
  return value;
}

/** DESIGN §2.1: Bundesen (1990), TVA form level 2; this mapping is level 4. */
export function allocateAttention(
  cues: readonly AttentionCue[], categories: readonly AttentionCategory[], ctx: MindView,
  hook: PertinenceHook = identityPertinence,
  personality: PersonalityModel = nullPersonality,
): AttentionAllocation {
  if (new Set(categories.map((category) => category.id)).size !== categories.length) {
    throw new RangeError("Attention category ids must be unique");
  }
  const base: Record<string, number> = Object.create(null);
  for (const category of categories) {
    // DESIGN §2.1: proposed pi_j = pi0_j + sum_k priority_k rel(j,k).
    let pi = nonnegative(category.base, "base pertinence");
    for (const need of ctx.needs.needs) {
      pi += membership(need.priority) * membership(category.relevance[need.definition.id] ?? 0);
    }
    if (category.id === "equivocation") {
      // DESIGN §5.1: neutral 0, added to this category only; v1 passes the field through.
      const interpreted = personality.interpret({ eta: ctx.params.eta, alpha0: ctx.params.alpha0,
        lambda: ctx.params.lambda, confidence: 1, weberFraction: 0, testimonyFloor: 0,
        equivocationPertinence: 0 }, "none", ctx);
      pi += nonnegative(interpreted.equivocationPertinence ?? 0, "equivocation pertinence");
    }
    base[category.id] = nonnegative(pi, "pertinence");
  }
  const modified = hook(base, ctx);
  const pertinence: Record<string, number> = Object.create(null);
  for (const category of categories) {
    if (!Object.hasOwn(modified, category.id)) throw new RangeError("Hook omitted an attention category");
    pertinence[category.id] = nonnegative(modified[category.id], "hook pertinence");
  }
  const weights = cues.map((cue) => {
    let evidence = 0;
    for (const category of categories) {
      evidence += membership(cue.relevance[category.id] ?? 0) * pertinence[category.id];
    }
    // DESIGN §2.1, Bundesen: w_c = s_c sum_j eta(c,j) pi_j.
    return nonnegative(nonnegative(cue.salience, "salience") * evidence, "attention weight");
  });
  let max = 0;
  for (const weight of weights) max = Math.max(max, weight);
  // DESIGN §2.1: a_c = w_c / sum(w); scale to avoid sum overflow.
  // Proposed zero-total convention: no attended cues, never a uniform fallback.
  const scaled = weights.map((weight) => max === 0 ? 0 : weight / max);
  const total = scaled.reduce((sum, weight) => sum + weight, 0);
  return { pertinence, weights, shares: scaled.map((weight) => total === 0 ? 0 : weight / total) };
}
