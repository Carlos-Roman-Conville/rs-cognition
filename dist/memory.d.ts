import type { Counters, RandomStream, SimTime } from "@rex/kernel";
import type { CategoricalBelief, CognitiveParams, Episode } from "./types.ts";
export type MemoryParams = Pick<CognitiveParams, "d" | "tau" | "s">;
export type ExpectationParams = MemoryParams & Pick<CognitiveParams, "alpha0">;
export type EpisodeInput = Omit<Episode, "id" | "retrievals">;
/** DESIGN §2.3, §4: encode subjective experience; kernel mint adds the dot to prefix ep. */
export declare function encodeEpisode(input: EpisodeInput, counters: Counters): {
    episode: Episode;
    counters: Counters;
};
/**
 * DESIGN §2.3: ACT-R B = ln Σ (t - t_j)^(-d), with SimTime ms converted to seconds.
 * Default d = 0.5: Anderson & Lebiere (1998); presentation history: Anderson & Schooler (1991).
 * Proposed zero-delay convention: use the formula's +Infinity limit (P = 1), without a time floor.
 */
export declare function baseLevelActivation(episode: Episode, t: SimTime, d?: number): number;
/** DESIGN §2.3: ACT-R logistic retrieval, Anderson & Lebiere (1998); tau/s defaults remain proposed. */
export declare function retrievalProbability(episode: Episode, t: SimTime, params?: MemoryParams): number;
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
export declare function retrieveEpisode(episode: Episode, t: SimTime, stream: RandomStream, params?: MemoryParams): RetrievalResult;
/** DESIGN §2.3 E(a,c), proposed: exact own-key/value equality of all declared features, no partial match. */
export declare function contextMatches(left: Episode["context"], right: Episode["context"]): boolean;
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
export declare function outcomeExpectations(episodes: readonly Episode[], action: string, context: Episode["context"], theory: CategoricalBelief, t: SimTime, params?: ExpectationParams): OutcomeExpectation;
