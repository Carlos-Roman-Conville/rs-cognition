import { categorical } from "./beliefs.ts";
import { nullPersonality } from "./personality.ts";
import type { GenerateParams, PersonalityModel } from "./personality.ts";
import type { BeliefStore, Candidate, CategoricalBelief, Domain, MindView, PredictedOutcome } from "./types.ts";

/** DESIGN §2.4: pure host expressions consume only this mind's beliefs. */
export interface ActionDefinition {
  readonly id: string;
  readonly target?: string;
  readonly targetKind: string;
  readonly domain: Domain;
  readonly preconditions: readonly { readonly id: string; readonly probability: (beliefs: BeliefStore) => number }[];
  readonly outcomeSpace: readonly PredictedOutcome[];
  readonly duration: number;
  readonly capacityRequired: number;
  readonly cost: number;
  readonly naiveModel: (beliefs: BeliefStore) => CategoricalBelief;
}

export interface GenerationInputs {
  readonly repertoire: readonly ActionDefinition[];
  /** Required host data, including its id: the engine has no reserved action ids. */
  readonly wait: ActionDefinition;
  readonly body: { readonly capacity_functional: number };
  readonly thetaPre?: number;
}

export interface GenerationResult {
  readonly candidates: readonly Candidate[];
  readonly params: GenerateParams;
  readonly thetaPre: number;
  readonly capacityFunctional: number;
  /** Includes rejected definitions, so the feasibility decision can be explained. */
  readonly checks: readonly {
    readonly action: string; readonly target?: string; readonly capacityRequired: number;
    readonly preconditions: Candidate["preconditions"]; readonly eligible: boolean;
  }[];
}

function nonnegative(value: number, name: string): void {
  if (!Number.isFinite(value) || value < 0) throw new RangeError(`${name} must be finite and nonnegative`);
}

function validateFeasibility(candidate: Pick<Candidate, "cost" | "capacityRequired" | "duration" | "preconditions">): void {
  nonnegative(candidate.cost, "cost");
  nonnegative(candidate.capacityRequired, "required capacity");
  if (!Number.isSafeInteger(candidate.duration) || candidate.duration < 1) throw new RangeError("Duration must be positive epochs");
  for (const condition of candidate.preconditions) {
    nonnegative(condition.probability, "precondition probability");
    if (condition.probability > 1) throw new RangeError("Precondition probability must be <= 1");
  }
}

/** Shared boundary validation also applies to recombinations returned by the generate hook. */
export function validateCandidate(candidate: Candidate): void {
  validateFeasibility(candidate);
  const ids = candidate.effects.map((effect) => effect.id);
  if (ids.length === 0 || new Set(ids).size !== ids.length ||
      ids.length !== candidate.outcomes.values.length || ids.some((id, i) => id !== candidate.outcomes.values[i])) {
    throw new RangeError("Theory must follow the declared unique outcome order");
  }
  categorical(candidate.outcomes.values, candidate.outcomes.probabilities);
  const total = candidate.outcomes.probabilities.reduce((sum, p) => sum + p, 0);
  if (Math.abs(total - 1) > 1e-12) throw new RangeError("Theory probabilities must sum to one");
  for (const effect of candidate.effects) {
    for (const value of [...Object.values(effect.deficits), ...Object.values(effect.goalProgress)]) {
      nonnegative(value, "predicted deficit/progress");
      if (value > 1) throw new RangeError("Predicted deficit/progress must be <= 1");
    }
  }
}

function sameAction(left: Candidate, right: Candidate): boolean {
  return left.action === right.action && left.target === right.target;
}

/** DESIGN §2.4: θ_pre=0.5 proposed; capacity is a declared body input, never computed here. */
export function generateActions(
  inputs: GenerationInputs, ctx: MindView, personality: PersonalityModel = nullPersonality,
): GenerationResult {
  const thetaPre = inputs.thetaPre ?? 0.5; // DESIGN §2.4 proposed default.
  nonnegative(thetaPre, "thetaPre");
  if (thetaPre > 1) throw new RangeError("thetaPre must be <= 1");
  nonnegative(inputs.body.capacity_functional, "body.capacity_functional");
  const wait = inputs.wait;
  if (wait.preconditions.length !== 0 || wait.capacityRequired !== 0 || wait.cost !== 0 || wait.duration !== 1) {
    throw new RangeError("The host's fallback must be unconditional, zero-cost, zero-capacity and one epoch");
  }
  const checks: GenerationResult["checks"][number][] = [];
  const candidates: Candidate[] = [];
  const definitions = [...inputs.repertoire, wait];
  for (let i = 0; i < definitions.length; i++) {
    const definition = definitions[i];
    if (definitions.slice(0, i).some((other) => other.id === definition.id && other.target === definition.target)) {
      throw new RangeError("Action/target pairs must be unique, including the fallback");
    }
    const metadata = {
      action: definition.id, target: definition.target, targetKind: definition.targetKind,
      domain: definition.domain, duration: definition.duration, cost: definition.cost,
      capacityRequired: definition.capacityRequired,
      preconditions: definition.preconditions.map((condition) => ({ id: condition.id, probability: condition.probability(ctx.beliefs) })),
    };
    validateFeasibility(metadata);
    // DESIGN §2.4: each believed prerequisite must meet θ_pre; no independence assumption.
    const eligible = metadata.preconditions.every((condition) => condition.probability >= thetaPre) &&
      metadata.capacityRequired <= inputs.body.capacity_functional;
    checks.push({ action: metadata.action, target: metadata.target, capacityRequired: metadata.capacityRequired,
      preconditions: metadata.preconditions, eligible });
    if (eligible) {
      const candidate: Candidate = { ...metadata, effects: definition.outcomeSpace, outcomes: definition.naiveModel(ctx.beliefs) };
      validateCandidate(candidate);
      candidates.push(candidate);
    }
  }
  const fallback = candidates[candidates.length - 1];
  const generated = personality.generate(candidates, { kappa: ctx.params.kappa }, ctx);
  nonnegative(generated.params.kappa, "kappa");
  const feasible = generated.candidates.filter((candidate) => {
    validateCandidate(candidate);
    return candidate.preconditions.every((condition) => condition.probability >= thetaPre) &&
      candidate.capacityRequired <= inputs.body.capacity_functional;
  });
  // DESIGN §2.4: hooks cannot remove or alter the required fallback. Preserve their remaining order.
  const result = feasible.map((candidate) => sameAction(candidate, fallback) ? fallback : candidate);
  if (!result.some((candidate) => sameAction(candidate, fallback))) result.push(fallback);
  if (result.some((candidate, i) => result.slice(0, i).some((other) => sameAction(candidate, other)))) {
    throw new RangeError("Generated action/target pairs must be unique");
  }
  return { candidates: result, params: generated.params, thetaPre,
    capacityFunctional: inputs.body.capacity_functional, checks };
}
