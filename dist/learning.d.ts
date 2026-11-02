import type { CredibilitySettlement } from "./communication/credibility.ts";
import type { Counters, SimTime } from "@rex/kernel";
import type { Evaluation } from "./evaluate.ts";
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
export type LearningLatent = Latent & ({
    readonly kind: "discrete";
    readonly about: string;
    readonly attribute: string;
    readonly likelihood: (evidence: LearningEvidence) => readonly number[];
} | {
    readonly kind: "gaussian";
    readonly about: string;
    readonly attribute: string;
    readonly likelihood: (evidence: LearningEvidence) => {
        readonly mean: number;
        readonly variance: number;
    };
} | {
    readonly kind: "reliability";
    readonly speaker: string;
    readonly likelihood: (evidence: LearningEvidence) => {
        readonly reliable: boolean;
        readonly weight: number;
    };
});
export interface LearningInputs {
    readonly mind: string;
    readonly intention: Intention;
    /** Complete utility evaluation saved when this intention was formed, including its needs context. */
    readonly evaluation: Evaluation;
    readonly outcome: ObservedOutcome;
    readonly context: Episode["context"];
    readonly domain: Domain;
    /** Observation-only appraisal into the action's outcome vocabulary; no scalar reward channel. */
    readonly appraise: (evidence: LearningEvidence) => {
        readonly outcome: string;
    };
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
    readonly learning: Omit<LearningParams, "beliefHalfLife"> & {
        readonly beliefHalfLife: number | null;
    };
}
export interface LearningTrace {
    readonly credibility?: readonly CredibilitySettlement[];
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
export declare const LEARNING_LIKELIHOOD_FLOOR = 1e-12;
export declare const DEFAULT_ATTRIBUTION_EPSILON = 0.000001;
/** DESIGN §2.5: KL of the full Beta distributions, NOT Bernoulli KL of their means.
 * KL(Beta(a,b)||Beta(c,d)) = log B(c,d)/B(a,b)
 *   + (a-c)ψ(a) + (b-d)ψ(b) + (c+d-a-b)ψ(a+b).
 * Proposed endpoint convention matches belief KL: equal point masses give 0, singular changes Infinity.
 */
export declare function reliabilityKLDivergence(posterior: BetaReliability, prior: BetaReliability): number;
/** DESIGN §2.5: maximum KL read-out; strictly above epsilon, first declared latent wins equal moves. */
export declare function attributeCause(updates: readonly Pick<LatentUpdate, "id" | "kl">[], epsilon?: number): string;
/** DESIGN §2.5 (learning level 4, attribution level 5): no reward-to-action shortcut.
 * Returns immutable state and trace data; the reducer owns event emission and duplicate-event suppression.
 * view supplies current needs/parameters; beliefs always come from memory, avoiding stale split snapshots.
 */
export declare function learnOutcome(inputs: LearningInputs, memory: MemoryState, view: MindView, counters: Counters, personality?: PersonalityModel): {
    next: MemoryState;
    counters: Counters;
    trace: LearningTrace;
    episode?: Episode;
};
export {};
