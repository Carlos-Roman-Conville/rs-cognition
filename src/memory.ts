import { operation, withOperations } from "./personality-operations.ts";
import type { PersonalityOperation } from "./personality-operations.ts";
import type { PersonalityModel } from "./personality.ts";
import type { MindView } from "./types.ts";
import { mint, SECOND, simTime } from "@rex/kernel";
import type { Counters, RandomStream, SimTime } from "@rex/kernel";
import { categorical } from "./beliefs.ts";
import { DEFAULT_COGNITIVE_PARAMS } from "./types.ts";
import type { CategoricalBelief, CognitiveParams, Episode } from "./types.ts";

export type MemoryParams = Pick<CognitiveParams, "d" | "tau" | "s">;
export type ExpectationParams = MemoryParams & Pick<CognitiveParams, "alpha0">;
export type EpisodeInput = Omit<Episode, "id" | "retrievals">;

function finite(value: number, name: string): void {
  if (!Number.isFinite(value)) throw new RangeError(`${name} must be finite`);
}

function validateParams({ d, tau, s }: MemoryParams): void {
  finite(d, "d");
  finite(tau, "tau");
  finite(s, "s");
  if (d <= 0 || s <= 0) throw new RangeError("Memory requires d > 0 and s > 0");
}

function validateContext(context: Episode["context"]): void {
  for (const value of Object.values(context)) {
    if (typeof value === "number") finite(value, "context feature");
    else if (typeof value !== "string" && typeof value !== "boolean") {
      throw new RangeError("Context features must be strings, finite numbers or booleans");
    }
  }
}

/** DESIGN §2.3, §4: encode subjective experience; kernel mint adds the dot to prefix ep. */
export function encodeEpisode(input: EpisodeInput, counters: Counters, hooks?: { personality: PersonalityModel; ctx: MindView }): { episode: Episode; counters: Counters; operations?: readonly PersonalityOperation[] } {
  simTime(input.t);
  finite(input.reward, "reward");
  finite(input.predictionError, "predictionError");
  validateContext(input.context);
  const operations: PersonalityOperation[] = [];
  let context = { ...input.context };
  let strengths = input.strengths;
  if (hooks?.personality.encoding) {
    const result = hooks.personality.encoding(input.context, hooks.ctx);
    finite(result.tauEnc, "encoding threshold");
    if (result.tauEnc < 0) throw new RangeError("Encoding threshold must be nonnegative");
    context = {};
    const stored: Record<string, number> = {};
    for (const [cue, value] of Object.entries(input.context)) {
      const strength = result.strengths[cue];
      finite(strength, "cue strength");
      if (strength < 0) throw new RangeError("Cue strength must be nonnegative");
      if (strength >= result.tauEnc) { context[cue] = value; stored[cue] = strength; }
    }
    strengths = stored;
    operations.push(operation(hooks.personality, "encoding", { ...result, context, stored }));
  }
  const minted = mint(counters, "ep");
  return withOperations({
    counters: minted.counters,
    episode: {
      id: minted.id, t: input.t, retrievals: [], context, ...(strengths === undefined ? {} : { strengths }),
      action: input.action, outcome: input.outcome, reward: input.reward,
      predictionError: input.predictionError, attributedCause: input.attributedCause, domain: input.domain,
    },
  }, operations);
}

/**
 * DESIGN §2.3: ACT-R B = ln Σ (t - t_j)^(-d), with SimTime ms converted to seconds.
 * Default d = 0.5: Anderson & Lebiere (1998); presentation history: Anderson & Schooler (1991).
 * Proposed zero-delay convention: use the formula's +Infinity limit (P = 1), without a time floor.
 */
export function baseLevelActivation(
  episode: Episode, t: SimTime, d: number = DEFAULT_COGNITIVE_PARAMS.d,
): number {
  finite(d, "d");
  if (d <= 0) throw new RangeError("Memory decay d must be positive");
  simTime(t);
  let previous = simTime(episode.t);
  const logs: number[] = [];
  for (const presentation of [episode.t, ...episode.retrievals]) {
    simTime(presentation);
    if (presentation < previous || presentation > t) {
      throw new RangeError("Presentations must be chronological and no later than retrieval time");
    }
    previous = presentation;
    const ageSeconds = (t - presentation) / SECOND;
    const logWeight = ageSeconds === 0 ? Infinity : -d * Math.log(ageSeconds);
    if (ageSeconds > 0) finite(logWeight, "activation term");
    logs.push(logWeight);
  }
  // Log-sum-exp is algebraically identical to the DESIGN §2.3 sum, avoiding power overflow/underflow.
  const maximum = logs.reduce((max, value) => Math.max(max, value), -Infinity);
  if (maximum === Infinity) return Infinity;
  return maximum + Math.log(logs.reduce((sum, value) => sum + Math.exp(value - maximum), 0));
}

/** DESIGN §2.3: ACT-R logistic retrieval, Anderson & Lebiere (1998); tau/s defaults remain proposed. */
export function retrievalProbability(
  episode: Episode, t: SimTime, params: MemoryParams = DEFAULT_COGNITIVE_PARAMS,
): number {
  validateParams(params);
  const activation = baseLevelActivation(episode, t, params.d);
  const difference = activation - params.tau;
  // Divide first only if subtraction overflowed; preserve cancellation for nearby finite values.
  const z = Number.isFinite(activation) && !Number.isFinite(difference)
    ? activation / params.s - params.tau / params.s : difference / params.s;
  // Sign-separated logistic keeps both tails in [0, 1] without exponent overflow.
  if (z >= 0) return 1 / (1 + Math.exp(-z));
  const weight = Math.exp(z);
  return weight / (1 + weight);
}

export interface RetrievalResult {
  readonly episode: Episode;
  readonly retrieved: boolean;
  /** Probability before adding this retrieval as a presentation. */
  readonly probability: number;
}

/**
 * DESIGN §2.3, §7: one Bernoulli draw realizes the logistic retrieval probability.
 * Caller supplies streams.get("cognition.memory.retrieve", mindId); only success adds a presentation.
 * Always consumes one draw, including probabilities 0 and 1, for a fixed replay contract.
 */
export function retrieveEpisode(
  episode: Episode, t: SimTime, stream: RandomStream, params: MemoryParams = DEFAULT_COGNITIVE_PARAMS,
): RetrievalResult {
  const probability = retrievalProbability(episode, t, params);
  const draw = stream();
  if (!Number.isFinite(draw) || draw < 0 || draw >= 1) throw new RangeError("Stream draw must be in [0, 1)");
  const retrieved = draw < probability;
  return {
    episode: retrieved ? { ...episode, retrievals: [...episode.retrievals, t] } : episode,
    retrieved, probability,
  };
}

/** DESIGN §2.3 E(a,c), proposed: exact own-key/value equality of all declared features, no partial match. */
export function contextMatches(left: Episode["context"], right: Episode["context"]): boolean {
  validateContext(left);
  validateContext(right);
  const keys = Object.keys(left);
  return keys.length === Object.keys(right).length &&
    keys.every((key) => Object.hasOwn(right, key) && left[key] === right[key]);
}

export interface OutcomeExpectation {
  /** Counts align with distribution.values, in the caller's declared outcome order. */
  readonly counts: readonly number[];
  readonly distribution: CategoricalBelief;
}

/**
 * DESIGN §2.3: n_o = alpha0 P_theory(o) + Σ P_retrieve(e)[o_e = o]; P_hat = n_o / Σ n.
 * Instance-based learning: Gonzalez, Lerch & Lebiere (2003); Gonzalez & Dutt (2011).
 * Pass episodes in mint order. This expectation read consumes no RNG and adds no presentations.
 * P_theory is supplied by the repertoire, already evaluated from subjective beliefs (§2.4).
 */
export function outcomeExpectations(
  episodes: readonly Episode[], action: string, context: Episode["context"], theory: CategoricalBelief,
  t: SimTime, params: ExpectationParams = DEFAULT_COGNITIVE_PARAMS,
): OutcomeExpectation {
  simTime(t);
  validateParams(params);
  validateContext(context);
  finite(params.alpha0, "alpha0");
  if (params.alpha0 < 0) throw new RangeError("Prior strength alpha0 must be nonnegative");
  const prior = categorical(theory.values, theory.probabilities);
  const counts = prior.probabilities.map((p) => params.alpha0 * p);
  const indexes = new Map(prior.values.map((value, index) => [value, index]));
  for (const episode of episodes) {
    // DESIGN §22.4: encoded features alone condition experience; legacy contexts remain exact.
    const matches = episode.strengths === undefined ? contextMatches(episode.context, context)
      : Object.keys(episode.context).every(key => Object.hasOwn(context, key) && context[key] === episode.context[key]);
    if (episode.action !== action || !matches) continue;
    const index = indexes.get(episode.outcome);
    if (index === undefined) throw new RangeError("Matching episode outcome is outside the declared outcome space");
    counts[index] += retrievalProbability(episode, t, params);
    finite(counts[index], "outcome count");
  }
  // DESIGN §10 zero-count boundary: proposed uniform ignorance when theory and experience supply no mass.
  const weights = counts.some((count) => count > 0) ? counts : counts.map(() => 1);
  return { counts, distribution: categorical(prior.values, weights) };
}
