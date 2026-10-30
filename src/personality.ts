import type { Candidate, Domain, MindView } from "./types.ts";
export type { Domain } from "./types.ts";

/** DESIGN §9: interpretation controls only; motivations are not parameters of a hook. */
export interface InterpretParams {
  readonly eta: number;
  readonly alpha0: number;
  readonly lambda: number;
  /** Multiplier on believed success mass, [0,1]; proposed identity baseline is 1. */
  readonly confidence: number;
  readonly weberFraction: number;
  readonly testimonyFloor: number;
}

export interface GenerateParams { readonly kappa: number }
export interface LearningParams {
  readonly rate: number;
  readonly d: number;
  /** Seconds, matching belief drift's boundary. */
  readonly beliefHalfLife: number;
}

/** DESIGN §9 "The hooks", refining §3. No concrete personality theory is enabled. */
export interface PersonalityModel {
  id: string;
  version: string;
  pertinence(base: Record<string, number>, ctx: MindView): Record<string, number>;
  interpret(base: InterpretParams, domain: Domain, ctx: MindView): InterpretParams;
  generate(candidates: readonly Candidate[], base: GenerateParams, ctx: MindView): {
    candidates: readonly Candidate[]; params: GenerateParams;
  };
  learning(base: LearningParams, domain: Domain, ctx: MindView): LearningParams;
}

export const nullPersonality: PersonalityModel = Object.freeze({
  id: "null", version: "1",
  pertinence: (base) => base,
  interpret: (base) => base,
  generate: (candidates, base) => ({ candidates, params: base }),
  learning: (base) => base,
} satisfies PersonalityModel);
