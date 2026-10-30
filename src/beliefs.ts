import type {
  Belief, BeliefEntry, BeliefStore, BetaReliability, CategoricalBelief,
  DetectionModel, EntityHandle, ExistenceBelief, GaussianBelief, Observation,
} from "./types.ts";

function nonnegative(value: number, name: string): void {
  if (!Number.isFinite(value) || value < 0) throw new RangeError(`${name} must be finite and nonnegative`);
}

function probability(value: number, name: string): void {
  nonnegative(value, name);
  if (value > 1) throw new RangeError(`${name} must be <= 1`);
}

/** Scale before summing to avoid overflow; positive mass is required. */
function normalize(weights: readonly number[]): number[] {
  let max = 0;
  for (const weight of weights) {
    nonnegative(weight, "weight");
    max = Math.max(max, weight);
  }
  if (max === 0) throw new RangeError("A distribution must have positive mass");
  const scaled = weights.map((weight) => weight / max);
  const total = scaled.reduce((sum, weight) => sum + weight, 0);
  return scaled.map((weight) => weight / total);
}

export function categorical(values: readonly string[], weights: readonly number[]): CategoricalBelief {
  if (values.length !== weights.length || new Set(values).size !== values.length) {
    throw new RangeError("Categories must be unique and match the probability vector");
  }
  return { kind: "categorical", values: [...values], probabilities: normalize(weights) };
}

export function gaussian(mean: number, variance: number): GaussianBelief {
  if (!Number.isFinite(mean)) throw new RangeError("Mean must be finite");
  nonnegative(variance, "variance");
  return { kind: "gaussian", mean, variance };
}

export function existence(value: number): ExistenceBelief {
  probability(value, "existence probability");
  return { kind: "existence", probability: value };
}

function copyBelief(belief: Belief): Belief {
  switch (belief.kind) {
    case "categorical": return categorical(belief.values, belief.probabilities);
    case "gaussian": return gaussian(belief.mean, belief.variance);
    case "existence": return existence(belief.probability);
  }
}

export type PriorSpec =
  | { readonly kind: "categorical"; readonly values: readonly string[] }
  | { readonly kind: "gaussian"; readonly mean: number; readonly variance: number }
  | { readonly kind: "existence" };

/** DESIGN §2.3: ignorance is uniform / host-declared wide Gaussian / even existence odds. */
export function ignorancePrior(spec: PriorSpec): Belief {
  switch (spec.kind) {
    case "categorical": return categorical(spec.values, spec.values.map(() => 1));
    case "gaussian": return gaussian(spec.mean, spec.variance);
    case "existence": return existence(0.5); // proposed uninformative binary prior
  }
}

export function givenPrior(belief: Belief): Belief { return copyBelief(belief); }
/** DESIGN §1, §2.3: false knowledge is supplied by the host; never compare it to truth. */
export function falsePrior(belief: Belief): Belief { return copyBelief(belief); }

export function createBeliefStore(): BeliefStore { return { entries: [] }; }

export function getBelief(store: BeliefStore, about: EntityHandle, attribute: string): Belief | undefined {
  return store.entries.find((entry) => entry.about === about && entry.attribute === attribute)?.belief;
}

function compatible(left: Belief, right: Belief): void {
  if (left.kind !== right.kind) throw new RangeError("Belief kinds must match");
  if (left.kind === "categorical" && right.kind === "categorical" &&
      (left.values.length !== right.values.length || left.values.some((value) => !right.values.includes(value)))) {
    throw new RangeError("Categorical supports must match");
  }
}

/** DESIGN §2.3, §7: immutable replacement keeps insertion order and the original prior. */
export function setBelief(
  store: BeliefStore, about: EntityHandle, attribute: string, belief: Belief,
  origin: BeliefEntry["origin"] = "given",
): BeliefStore {
  const next = copyBelief(belief);
  const index = store.entries.findIndex((entry) => entry.about === about && entry.attribute === attribute);
  const entries = [...store.entries];
  if (index < 0) entries.push({ about, attribute, belief: next, prior: copyBelief(next), origin });
  else {
    compatible(entries[index].belief, next);
    entries[index] = { ...entries[index], belief: next };
  }
  return { entries };
}

/** DESIGN §2.3: P' ∝ P L^η (Bayes; conservatism: Edwards 1968, evidence level 2).
 * Log weights avoid underflow. η=0 freezes learning (CB-5). If evidence has zero
 * probability under the entire prior, conditioning is undefined: keep the prior
 * (proposed boundary convention), rather than manufacture support or return NaN.
 */
export function updateCategorical(
  prior: CategoricalBelief, likelihood: readonly number[], eta: number,
): CategoricalBelief {
  const base = categorical(prior.values, prior.probabilities);
  probability(eta, "eta");
  if (likelihood.length !== base.values.length) throw new RangeError("Likelihood size must match categories");
  for (const value of likelihood) nonnegative(value, "likelihood");
  if (eta === 0) return base;
  const logs = base.probabilities.map((p, i) => p === 0 || likelihood[i] === 0
    ? -Infinity : Math.log(p) + eta * Math.log(likelihood[i]));
  const max = logs.reduce((a, b) => Math.max(a, b), -Infinity);
  if (max === -Infinity) return base;
  return categorical(base.values, logs.map((weight) => Math.exp(weight - max)));
}

/** DESIGN §2.3: scalar Kalman update, K=V/(V+R/η). Ratios avoid overflow.
 * A point prior remains a point, including contradictory noiseless evidence
 * (the same impossible-evidence convention as the categorical update).
 */
export function updateGaussian(prior: GaussianBelief, observed: number, observationVariance: number, eta: number): GaussianBelief {
  const base = gaussian(prior.mean, prior.variance);
  if (!Number.isFinite(observed)) throw new RangeError("Observation must be finite");
  nonnegative(observationVariance, "observation variance");
  probability(eta, "eta");
  if (eta === 0 || base.variance === 0) return base;
  if (observationVariance === 0) return gaussian(observed, 0);
  // Log ratios also preserve a tiny R/V when dividing it by a tiny η would recover it.
  const ratio = Math.exp(Math.log(observationVariance) - Math.log(base.variance) - Math.log(eta));
  const gain = 1 / (1 + ratio);
  const retained = ratio === Infinity ? 1 : ratio / (1 + ratio);
  // Convex combination avoids overflow in observed - mean for opposite extremes.
  return gaussian(retained * base.mean + gain * observed, retained * base.variance);
}

/** DESIGN §2.3: detected uses (P_H,P_FA); attended misses use their complements. */
export function updateExistence(prior: ExistenceBelief, detected: boolean, model: DetectionModel, eta: number): ExistenceBelief {
  existence(prior.probability);
  probability(model.P_H, "P_H");
  probability(model.P_FA, "P_FA");
  const likelihood = detected ? [model.P_H, model.P_FA] : [1 - model.P_H, 1 - model.P_FA];
  const result = updateCategorical(categorical(["exists", "absent"], [prior.probability, 1 - prior.probability]), likelihood, eta);
  return existence(result.probabilities[0]);
}

/** DESIGN §2.1–2.3: update only from the observation's own reliability model. */
export function updateFromObservation(prior: Belief, observation: Observation, eta: number): Belief {
  if (prior.kind === "existence") return updateExistence(prior, observation.kind !== "null", observation.model, eta);
  probability(eta, "eta");
  if (observation.kind === "null") return copyBelief(prior);
  if (prior.kind === "categorical" && observation.kind === "categorical") {
    probability(observation.model.q, "q");
    if (!prior.values.includes(observation.value)) throw new RangeError("Reported category must be in the belief support");
    // DESIGN §2.1: incorrect identifications are uniform over the other K-1 values.
    const count = prior.values.length;
    return updateCategorical(prior, prior.values.map((value) => count === 1 ? 1 :
      value === observation.value ? observation.model.q : (1 - observation.model.q) / (count - 1)), eta);
  }
  if (prior.kind === "gaussian" && observation.kind === "real") {
    nonnegative(observation.model.sigma, "sigma");
    return updateGaussian(prior, observation.value, observation.model.sigma ** 2, eta);
  }
  throw new RangeError("Observation and attribute belief kinds must match");
}

/** DESIGN §2.3: Beta mean α/(α+β); endpoints represent limiting total distrust/trust. */
export function reliabilityMean(reliability: BetaReliability): number {
  nonnegative(reliability.alpha, "alpha");
  nonnegative(reliability.beta, "beta");
  return normalize([reliability.alpha, reliability.beta])[0];
}

/** DESIGN §2.5: Beta–Bernoulli evidence; an observed lie increments β. */
export function updateReliability(prior: BetaReliability, reliable: boolean, weight = 1): BetaReliability {
  reliabilityMean(prior);
  nonnegative(weight, "evidence weight");
  const result = { alpha: prior.alpha + (reliable ? weight : 0), beta: prior.beta + (reliable ? 0 : weight) };
  reliabilityMean(result);
  return result;
}

/** DESIGN §2.3: L(v')=r[v'=v]+(1-r)/K, then the same conservative Bayes update. */
export function updateTestimony(prior: CategoricalBelief, reported: string, reliability: BetaReliability, eta: number): CategoricalBelief {
  const r = reliabilityMean(reliability);
  if (!prior.values.includes(reported)) throw new RangeError("Testimony category must be in the belief support");
  return updateCategorical(prior, prior.values.map((value) => (value === reported ? r : 0) + (1 - r) / prior.values.length), eta);
}

/** DESIGN §2.3: V'=V+q Δt; q is variance per second, elapsed time is kernel ms. */
export function driftGaussian(belief: GaussianBelief, q: number, elapsedMs: number): GaussianBelief {
  gaussian(belief.mean, belief.variance);
  nonnegative(q, "q");
  nonnegative(elapsedMs, "elapsedMs");
  return gaussian(belief.mean, belief.variance + q * (elapsedMs / 1000));
}

/** DESIGN §2.3: exponential relaxation with λ_b=ln(2)/h_b; half-life in seconds.
 * Infinity disables relaxation; a positive finite half-life is otherwise required.
 */
export function driftCategorical(belief: CategoricalBelief, prior: CategoricalBelief, halfLifeSeconds: number, elapsedMs: number): CategoricalBelief {
  const base = categorical(belief.values, belief.probabilities);
  const target = categorical(prior.values, prior.probabilities);
  compatible(base, target);
  nonnegative(elapsedMs, "elapsedMs");
  if (!(halfLifeSeconds > 0)) throw new RangeError("Half-life must be positive");
  const relaxed = -Math.expm1(-Math.LN2 * ((elapsedMs / 1000) / halfLifeSeconds));
  return categorical(base.values, base.probabilities.map((p, i) =>
    (1 - relaxed) * p + relaxed * target.probabilities[target.values.indexOf(base.values[i])]));
}

/** DESIGN §2.3: apply per-attribute drift in record insertion order; existence holds. */
export function driftBeliefs(
  store: BeliefStore, elapsedMs: number,
  settings: (entry: BeliefEntry) => { readonly q: number; readonly halfLifeSeconds: number },
): BeliefStore {
  nonnegative(elapsedMs, "elapsedMs");
  return { entries: store.entries.map((entry) => {
    const config = settings(entry);
    const belief = entry.belief.kind === "gaussian" ? driftGaussian(entry.belief, config.q, elapsedMs)
      : entry.belief.kind === "categorical" && entry.prior.kind === "categorical"
        ? driftCategorical(entry.belief, entry.prior, config.halfLifeSeconds, elapsedMs) : copyBelief(entry.belief);
    return { ...entry, belief };
  }) };
}

/** DESIGN §2.5: KL(posterior || prior), in nats (Kullback–Leibler divergence).
 * Zero posterior mass contributes 0; positive mass outside prior support gives
 * Infinity. Equal point Gaussians give 0; unequal/singular distributions Infinity.
 */
export function klDivergence(posterior: Belief, prior: Belief): number {
  const p = copyBelief(posterior);
  const q = copyBelief(prior);
  compatible(p, q);
  if (p.kind === "gaussian" && q.kind === "gaussian") {
    if (p.variance === 0 || q.variance === 0) return p.variance === q.variance && p.mean === q.mean ? 0 : Infinity;
    // KL(Np||Nq)=1/2[Vp/Vq - 1 - ln(Vp/Vq) + (μp-μq)^2/Vq].
    const logRatio = Math.log(p.variance) - Math.log(q.variance);
    const meanDifference = p.mean - q.mean;
    const scaledDifference = Number.isFinite(meanDifference) ? meanDifference / Math.sqrt(q.variance)
      : p.mean / Math.sqrt(q.variance) - q.mean / Math.sqrt(q.variance);
    return Math.max(0, 0.5 * (Math.expm1(logRatio) - logRatio + scaledDifference ** 2));
  }
  const pp = p.kind === "categorical" ? p.probabilities : p.kind === "existence" ? [p.probability, 1 - p.probability] : [];
  const qq = p.kind === "categorical" && q.kind === "categorical"
    ? p.values.map((value) => q.probabilities[q.values.indexOf(value)])
    : q.kind === "existence" ? [q.probability, 1 - q.probability] : [];
  return Math.max(0, pp.reduce((sum, mass, i) => mass === 0 ? sum :
    sum + mass * (Math.log(mass) - Math.log(qq[i])), 0));
}
