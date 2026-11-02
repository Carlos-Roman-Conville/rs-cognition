import type { Belief, BeliefEntry, BeliefStore, BetaReliability, CategoricalBelief, DetectionModel, EntityHandle, ExistenceBelief, GaussianBelief, Observation } from "./types.ts";
export declare function categorical(values: readonly string[], weights: readonly number[]): CategoricalBelief;
export declare function gaussian(mean: number, variance: number): GaussianBelief;
export declare function existence(value: number): ExistenceBelief;
export type PriorSpec = {
    readonly kind: "categorical";
    readonly values: readonly string[];
} | {
    readonly kind: "gaussian";
    readonly mean: number;
    readonly variance: number;
} | {
    readonly kind: "existence";
};
/** DESIGN §2.3: ignorance is uniform / host-declared wide Gaussian / even existence odds. */
export declare function ignorancePrior(spec: PriorSpec): Belief;
export declare function givenPrior(belief: Belief): Belief;
/** DESIGN §1, §2.3: false knowledge is supplied by the host; never compare it to truth. */
export declare function falsePrior(belief: Belief): Belief;
export declare function createBeliefStore(): BeliefStore;
export declare function getBelief(store: BeliefStore, about: EntityHandle, attribute: string): Belief | undefined;
/** DESIGN §2.3, §7: immutable replacement keeps insertion order and the original prior. */
export declare function setBelief(store: BeliefStore, about: EntityHandle, attribute: string, belief: Belief, origin?: BeliefEntry["origin"]): BeliefStore;
/** DESIGN §2.3: P' ∝ P L^η (Bayes; conservatism: Edwards 1968, evidence level 2).
 * Log weights avoid underflow. η=0 freezes learning (CB-5). If evidence has zero
 * probability under the entire prior, conditioning is undefined: keep the prior
 * (proposed boundary convention), rather than manufacture support or return NaN.
 */
export declare function updateCategorical(prior: CategoricalBelief, likelihood: readonly number[], eta: number): CategoricalBelief;
/** DESIGN §2.3: scalar Kalman update, K=V/(V+R/η). Ratios avoid overflow.
 * A point prior remains a point, including contradictory noiseless evidence
 * (the same impossible-evidence convention as the categorical update).
 */
export declare function updateGaussian(prior: GaussianBelief, observed: number, observationVariance: number, eta: number): GaussianBelief;
/** DESIGN §2.3: detected uses (P_H,P_FA); attended misses use their complements. */
export declare function updateExistence(prior: ExistenceBelief, detected: boolean, model: DetectionModel, eta: number): ExistenceBelief;
/** DESIGN §2.1–2.3: update only from the observation's own reliability model. */
export declare function updateFromObservation(prior: Belief, observation: Observation, eta: number): Belief;
/** DESIGN §2.3: Beta mean α/(α+β); endpoints represent limiting total distrust/trust. */
export declare function reliabilityMean(reliability: BetaReliability): number;
/** DESIGN §2.5: Beta–Bernoulli evidence; an observed lie increments β. */
export declare function updateReliability(prior: BetaReliability, reliable: boolean, weight?: number): BetaReliability;
/** DESIGN §2.3: L(v')=r[v'=v]+(1-r)/K, then the same conservative Bayes update. */
export declare function updateTestimony(prior: CategoricalBelief, reported: string, reliability: BetaReliability, eta: number): CategoricalBelief;
/** DESIGN §2.3: V'=V+q Δt; q is variance per second, elapsed time is kernel ms. */
export declare function driftGaussian(belief: GaussianBelief, q: number, elapsedMs: number): GaussianBelief;
/** DESIGN §2.3: exponential relaxation with λ_b=ln(2)/h_b; half-life in seconds.
 * Infinity disables relaxation; a positive finite half-life is otherwise required.
 */
export declare function driftCategorical(belief: CategoricalBelief, prior: CategoricalBelief, halfLifeSeconds: number, elapsedMs: number): CategoricalBelief;
/** DESIGN §2.3: apply per-attribute drift in record insertion order; existence holds. */
export declare function driftBeliefs(store: BeliefStore, elapsedMs: number, settings: (entry: BeliefEntry) => {
    readonly q: number;
    readonly halfLifeSeconds: number;
}): BeliefStore;
/** DESIGN §2.5: KL(posterior || prior), in nats (Kullback–Leibler divergence).
 * Zero posterior mass contributes 0; positive mass outside prior support gives
 * Infinity. Equal point Gaussians give 0; unequal/singular distributions Infinity.
 */
export declare function klDivergence(posterior: Belief, prior: Belief): number;
