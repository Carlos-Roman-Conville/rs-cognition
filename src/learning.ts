import { simTime } from "@rex/kernel";
import type { Counters, SimTime } from "@rex/kernel";
import {
  categorical, existence, getBelief, klDivergence, reliabilityMean, setBelief,
  updateCategorical, updateGaussian, updateReliability,
} from "./beliefs.ts";
import { encodeEpisode } from "./memory.ts";
import { nullPersonality } from "./personality.ts";
import type { LearningParams, PersonalityModel } from "./personality.ts";
import type { Belief, BetaReliability, Domain, Episode, Intention, MemoryState, MindView, Observation } from "./types.ts";

/** DESIGN §2.5: only perceived feedback crosses this boundary; cause identifies the intention event. */
export interface ObservedOutcome {
  readonly cause: string;
  readonly t: SimTime;
  readonly observations: readonly Observation[];
}

export interface LearningEvidence {
  readonly observations: readonly Observation[];
  readonly intention: Intention;
  readonly view: MindView;
  readonly memory: MemoryState;
}

interface Latent {
  /** Unique read-out label; "chance" is reserved. Order is the attribution tie breaker. */
  readonly id: string;
  readonly domain: Domain;
}

/** Pure host naive-model adapters; all read the SAME pre-update subjective snapshot.
 * Discrete likelihoods follow belief support order (existence: present, absent).
 * Gaussian likelihoods must be conjugate in the latent, not arbitrary posterior estimates.
 * Reliability uses the Bernoulli likelihood r^successes (1-r)^failures.
 */
export type LearningLatent = Latent & (
  | { readonly kind: "discrete"; readonly about: string; readonly attribute: string;
      readonly likelihood: (evidence: LearningEvidence) => readonly number[] }
  | { readonly kind: "gaussian"; readonly about: string; readonly attribute: string;
      readonly likelihood: (evidence: LearningEvidence) => { readonly mean: number; readonly variance: number } }
  | { readonly kind: "reliability"; readonly speaker: string;
      readonly likelihood: (evidence: LearningEvidence) => { readonly reliable: boolean; readonly weight: number } }
);

export interface LearningInputs {
  readonly mind: string;
  readonly intention: Intention;
  /** EU saved when this intention was formed, not a refreshed decision score. */
  readonly expectedUtility: number;
  readonly outcome: ObservedOutcome;
  readonly context: Episode["context"];
  readonly domain: Domain;
  /** Observation-only appraisal into the action's outcome vocabulary and perceived reward. */
  readonly appraise: (evidence: LearningEvidence) => { readonly outcome: string; readonly reward: number };
  readonly latents: readonly LearningLatent[];
  readonly encode?: boolean;
  readonly epsilonAttribution?: number;
}

export interface LatentUpdate {
  readonly id: string;
  readonly prior: Belief | BetaReliability;
  readonly posterior: Belief | BetaReliability;
  /** Singular moves are tagged explicitly so JSON never silently converts Infinity to null. */
  readonly kl: number | "Infinity";
  readonly eta: number;
  /** null represents disabled drift (Infinity at the hook boundary) in a JSON trace. */
  readonly learning: Omit<LearningParams, "beliefHalfLife"> & { readonly beliefHalfLife: number | null };
}

export interface LearningTrace {
  readonly mind: string;
  readonly intention: string;
  readonly t: SimTime;
  readonly observations: readonly Observation[];
  readonly outcome: string;
  readonly reward: number;
  readonly expectedUtility: number;
  readonly predictionError: number;
  readonly updates: readonly LatentUpdate[];
  readonly attributedCause: string;
  readonly epsilonAttribution: number;
  readonly likelihoodFloor: number;
  readonly episode?: string;
}

// DESIGN §2.5 stability: proposed floor on discrete naive likelihoods, not on prior support.
// Impossible evidence under every hypothesis becomes uninformative, without NaN.
export const LEARNING_LIKELIHOOD_FLOOR = 1e-12;
export const DEFAULT_ATTRIBUTION_EPSILON = 1e-6; // proposed threshold, in nats; not calibrated.

function finite(value: number, name: string): number {
  if (!Number.isFinite(value)) throw new RangeError(`${name} must be finite`);
  return value;
}

function nonnegative(value: number, name: string): number {
  if (finite(value, name) < 0) throw new RangeError(`${name} must be nonnegative`);
  return value;
}

function unit(value: number, name: string): number {
  if (nonnegative(value, name) > 1) throw new RangeError(`${name} must be in [0,1]`);
  return value;
}

// Mathematical helpers: log Γ and ψ via recurrence and Stirling/Bernoulli expansions (DLMF §5.11).
// Shift to >=16 before expanding; no empirical model parameters are introduced.
function logGamma(x: number): number {
  let correction = 0;
  while (x < 16) { correction -= Math.log(x); x++; }
  const inv = 1 / x;
  const z = inv * inv;
  return correction + (x - 0.5) * Math.log(x) - x + 0.5 * Math.log(2 * Math.PI) +
    inv * (1 / 12 + z * (-1 / 360 + z * (1 / 1260 + z * (-1 / 1680 + z / 1188))));
}

function digamma(x: number): number {
  let correction = 0;
  while (x < 16) { correction -= 1 / x; x++; }
  const inv = 1 / x;
  const z = inv * inv;
  return correction + Math.log(x) - inv / 2 -
    z * (1 / 12 + z * (-1 / 120 + z * (1 / 252 + z * (-1 / 240 + z / 132))));
}

/** DESIGN §2.5: KL of the full Beta distributions, NOT Bernoulli KL of their means.
 * KL(Beta(a,b)||Beta(c,d)) = log B(c,d)/B(a,b)
 *   + (a-c)ψ(a) + (b-d)ψ(b) + (c+d-a-b)ψ(a+b).
 * Proposed endpoint convention matches belief KL: equal point masses give 0, singular changes Infinity.
 */
export function reliabilityKLDivergence(posterior: BetaReliability, prior: BetaReliability): number {
  reliabilityMean(posterior);
  reliabilityMean(prior);
  const { alpha: a, beta: b } = posterior;
  const { alpha: c, beta: d } = prior;
  if (a === c && b === d) return 0;
  if (a === 0 || b === 0 || c === 0 || d === 0) {
    return (a === 0 && c === 0) || (b === 0 && d === 0) ? 0 : Infinity;
  }
  const logBeta = (x: number, y: number) => logGamma(x) + logGamma(y) - logGamma(finite(x + y, "Beta total"));
  return Math.max(0, finite(logBeta(c, d) - logBeta(a, b) + (a - c) * digamma(a) +
    (b - d) * digamma(b) + ((c - a) + (d - b)) * digamma(a + b), "Beta KL"));
}

/** DESIGN §2.5: maximum KL read-out; strictly above epsilon, first declared latent wins equal moves. */
export function attributeCause(updates: readonly Pick<LatentUpdate, "id" | "kl">[], epsilon = DEFAULT_ATTRIBUTION_EPSILON): string {
  nonnegative(epsilon, "attribution epsilon");
  let cause = "chance";
  let maximum = epsilon;
  for (const update of updates) {
    const kl = update.kl === "Infinity" ? Infinity : update.kl;
    if (Number.isNaN(kl) || kl < 0) throw new RangeError("KL must be nonnegative");
    if (kl > maximum) { maximum = kl; cause = update.id; }
  }
  return cause;
}

/** DESIGN §2.5 (learning level 4, attribution level 5): no reward-to-action shortcut.
 * Returns immutable state and trace data; the reducer owns event emission and duplicate-event suppression.
 * view supplies current needs/parameters; beliefs always come from memory, avoiding stale split snapshots.
 */
export function learnOutcome(
  inputs: LearningInputs, memory: MemoryState, view: MindView, counters: Counters,
  personality: PersonalityModel = nullPersonality,
): { next: MemoryState; counters: Counters; trace: LearningTrace; episode?: Episode } {
  const { intention, outcome } = inputs;
  if (intention.mind !== inputs.mind || outcome.cause !== intention.id) {
    throw new RangeError("Outcome cause must identify this mind's intention");
  }
  simTime(intention.t);
  simTime(outcome.t);
  if (outcome.t < intention.t) throw new RangeError("Outcome predates intention");
  for (const observation of outcome.observations) {
    simTime(observation.t);
    if (observation.t < intention.t || observation.t > outcome.t) throw new RangeError("Observation is outside the intention/outcome interval");
  }
  const ctx = { ...view, beliefs: memory.beliefs };
  const evidence: LearningEvidence = { observations: outcome.observations, intention, view: ctx, memory };
  const perceived = inputs.appraise(evidence);
  if (!intention.expectedOutcomes.values.includes(perceived.outcome)) throw new RangeError("Perceived outcome must belong to the intention's outcome space");
  finite(perceived.reward, "perceived reward");
  finite(inputs.expectedUtility, "expected utility");
  // DESIGN §2.5: δ = r_obs - EU(ι); reward prediction error (Sutton & Barto 2018).
  const predictionError = finite(perceived.reward - inputs.expectedUtility, "prediction error");
  const epsilon = inputs.epsilonAttribution ?? DEFAULT_ATTRIBUTION_EPSILON;
  nonnegative(epsilon, "attribution epsilon");
  unit(ctx.params.eta, "eta");
  let beliefs = memory.beliefs;
  let reliability = memory.reliability;
  const updates: LatentUpdate[] = [];
  const keys = new Set<string>();
  const ids = new Set<string>();
  for (const latent of inputs.latents) {
    const key = JSON.stringify(latent.kind === "reliability" ? ["reliability", latent.speaker] : ["belief", latent.about, latent.attribute]);
    if (!latent.id || latent.id === "chance" || ids.has(latent.id) || keys.has(key)) throw new RangeError("Latents must identify unique update targets and nonreserved ids");
    ids.add(latent.id);
    keys.add(key);
    // Proposed neutral placeholders for unused interpretation controls, matching the evaluation boundary.
    const interpreted = personality.interpret({ eta: ctx.params.eta, alpha0: ctx.params.alpha0,
      lambda: ctx.params.lambda, confidence: 1, weberFraction: 0, testimonyFloor: 0 }, latent.domain, ctx);
    // Proposed neutral learning rate 1 and disabled drift Infinity; d is the configured ACT-R decay.
    const learning = personality.learning({ rate: 1, d: ctx.params.d, beliefHalfLife: Infinity }, latent.domain, ctx);
    unit(interpreted.eta, "interpreted eta");
    nonnegative(learning.rate, "learning rate");
    if (finite(learning.d, "memory decay") <= 0 || !(learning.beliefHalfLife > 0)) throw new RangeError("Decay and half-life must be positive");
    // DESIGN §3, §9: proposed hook composition, capped to §2.3's η range. CB-5's freeze overrides hooks.
    const eta = ctx.params.eta === 0 ? 0 : Math.min(1, interpreted.eta * learning.rate);
    let prior: Belief | BetaReliability;
    let posterior: Belief | BetaReliability;
    let kl: number;
    if (latent.kind === "reliability") {
      const index = memory.reliability.findIndex((entry) => entry.speaker === latent.speaker);
      if (index < 0) throw new RangeError("Missing reliability prior");
      prior = memory.reliability[index].belief;
      const likelihood = latent.likelihood(evidence);
      nonnegative(likelihood.weight, "Bernoulli evidence weight");
      // DESIGN §2.3, §2.5: tempering r or (1-r) by η adds η-weighted Beta pseudo-counts once.
      posterior = eta === 0 ? prior : updateReliability(prior, likelihood.reliable, finite(eta * likelihood.weight, "evidence weight"));
      kl = reliabilityKLDivergence(posterior, prior);
      if (eta !== 0) reliability = reliability.map((entry, i) => i === index ? { ...entry, belief: posterior as BetaReliability } : entry);
    } else {
      const belief = getBelief(memory.beliefs, latent.about, latent.attribute);
      if (!belief) throw new RangeError("Missing latent prior");
      prior = belief;
      let updated: Belief;
      if (latent.kind === "gaussian") {
        if (belief.kind !== "gaussian") throw new RangeError("Gaussian likelihood requires a Gaussian prior");
        const likelihood = latent.likelihood(evidence);
        updated = updateGaussian(belief, likelihood.mean, likelihood.variance, eta);
      } else {
        if (belief.kind === "gaussian") throw new RangeError("Discrete likelihood requires categorical or existence prior");
        const likelihood = latent.likelihood(evidence).map((p) => Math.max(LEARNING_LIKELIHOOD_FLOOR, unit(p, "likelihood")));
        const distribution = belief.kind === "categorical" ? belief : categorical(["present", "absent"], [belief.probability, 1 - belief.probability]);
        const result = updateCategorical(distribution, likelihood, eta);
        updated = belief.kind === "categorical" ? result : existence(result.probabilities[0]);
      }
      if (eta !== 0) beliefs = setBelief(beliefs, latent.about, latent.attribute, updated);
      posterior = eta === 0 ? prior : getBelief(beliefs, latent.about, latent.attribute)!;
      kl = klDivergence(posterior, prior);
    }
    updates.push({ id: latent.id, prior, posterior, kl: kl === Infinity ? "Infinity" : kl, eta,
      learning: { ...learning, beliefHalfLife: learning.beliefHalfLife === Infinity ? null : learning.beliefHalfLife } });
  }
  const attributedCause = attributeCause(updates, epsilon);
  // DESIGN §2.5: encode by default; complete one episode with the read-out, never update latents again.
  const encoded = (inputs.encode ?? true) ? encodeEpisode({ t: outcome.t, context: inputs.context,
    action: intention.action, outcome: perceived.outcome, reward: perceived.reward, predictionError,
    attributedCause, domain: inputs.domain }, counters) : undefined;
  const next = beliefs === memory.beliefs && reliability === memory.reliability && !encoded ? memory : {
    beliefs, reliability, episodes: encoded ? [...memory.episodes, encoded.episode] : memory.episodes,
  };
  return { next, counters: encoded?.counters ?? counters, episode: encoded?.episode,
    trace: { mind: inputs.mind, intention: intention.id, t: outcome.t, observations: outcome.observations,
      outcome: perceived.outcome, reward: perceived.reward, expectedUtility: inputs.expectedUtility, predictionError,
      updates, attributedCause, epsilonAttribution: epsilon, likelihoodFloor: LEARNING_LIKELIHOOD_FLOOR,
      episode: encoded?.episode.id } };
}
