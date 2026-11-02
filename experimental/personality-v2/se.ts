import type { Candidate, MindView, Observation, PersonalityOperation } from "../../src/index.ts";
import type { EightFunctionV2, V2Context } from "./v2.ts";

type Precondition = Candidate["preconditions"][number];
export interface SeContext extends V2Context {
  readonly t: Observation["t"];
  readonly operations: PersonalityOperation[];
}
export interface SeOptions {
  readonly context: (mind: MindView) => SeContext;
  /** Host subjective cue tag; never Stimulus.present or objective world state. */
  readonly isPresent: (observation: Observation) => boolean;
  /** Host precondition semantics, using only the filtered observations. Undefined
   * means none supports this precondition; combining cues belongs to the host.
   */
  readonly probability: (candidate: Candidate, precondition: Precondition,
    observations: readonly Observation[]) => number | undefined;
}

export function seEvidence(candidate: Candidate, precondition: Precondition, beliefP: number,
  observations: readonly Observation[], mind: MindView, model: EightFunctionV2, options: SeOptions): number {
  if (!model.operationEnabled("Se", "preconditionEvidence")) return beliefP;
  const ctx = options.context(mind);
  const present = observations.filter(obs => obs.t === ctx.t && options.isPresent(obs));
  if (!present.length) return beliefP;
  const psi = model.allocation(ctx).find(row => row.function === "Se")?.A.att ?? 0;
  if (psi <= 0) return beliefP;
  const presentP = options.probability(candidate, precondition, present);
  if (presentP === undefined) return beliefP;
  if (!Number.isFinite(presentP) || presentP < 0 || presentP > 1) {
    throw new RangeError("Se present probability must be finite and in [0, 1]");
  }
  // DESIGN §22.4, corrected by §22.7 / Num-Q1: allocation only, no gain or clip.
  const probability = (1 - psi) * beliefP + psi * presentP;
  ctx.operations.push({ function: "Se", operation: "preconditionEvidence", executed: true,
    output: structuredClone({ action: candidate.action, target: candidate.target,
      precondition: precondition.id, t: ctx.t, observations: present, beliefP, presentP, psi, probability }) });
  return probability;
}
