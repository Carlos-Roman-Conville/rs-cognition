import type { Evaluation } from "./evaluate.ts";
import type { CommunicationContext } from "./communication/types.ts";
import type { Candidate, CategoricalBelief, Domain, Episode, MindView, Observation } from "./types.ts";
export type { Domain } from "./types.ts";

/** DESIGN §9: interpretation controls only; motivations are not parameters of a hook. */
export interface InterpretParams {
  /** DESIGN §5.1: proposed neutral default 0; omitted to preserve legacy traces. */
  readonly equivocationPertinence?: number;
  /** DESIGN §5.1: proposed default 1; optional to preserve legacy serialized traces. */
  readonly poolConcentration?: number;
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
  /** DESIGN §22.4: aligned with evaluated candidates; terms are added after base EU. */
  evaluationTerms?(candidates: readonly Evaluation[], ctx: MindView): readonly (readonly EvaluationTerm[])[];
  meaningSelection?(dist: CategoricalBelief, context: CommunicationContext, ctx: MindView): CategoricalBelief;
  preconditionEvidence?(candidate: Candidate, precondition: Candidate["preconditions"][number],
    beliefP: number, presentObs: readonly Observation[], ctx: MindView): number;
  encoding?(cues: Episode["context"], ctx: MindView): EncodingResult;
  id: string;
  version: string;
  pertinence(base: Record<string, number>, ctx: MindView): Record<string, number>;
  interpret(base: InterpretParams, domain: Domain, ctx: MindView): InterpretParams;
  generate(candidates: readonly Candidate[], base: GenerateParams, ctx: MindView): {
    candidates: readonly Candidate[]; params: GenerateParams;
  };
  learning(base: LearningParams, domain: Domain, ctx: MindView): LearningParams;
}

export interface EvaluationTerm {
  readonly label: string;
  readonly function?: string;
  readonly value: number;
}
export interface EncodingResult {
  readonly strengths: Readonly<Record<string, number>>;
  /** DESIGN §22.4: supplied by the model; no engine estimate/default. */
  readonly tauEnc: number;
}

export const nullPersonality: PersonalityModel = Object.freeze({
  id: "null", version: "1",
  pertinence: (base) => base,
  interpret: (base) => base,
  generate: (candidates, base) => ({ candidates, params: base }),
  learning: (base) => base,
} satisfies PersonalityModel);
