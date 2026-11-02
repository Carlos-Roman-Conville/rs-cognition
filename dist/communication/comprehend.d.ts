import type { CategoricalBelief, MemoryState, MindView } from "../types.ts";
import type { CommunicationContext, ComprehendedUtterance, MeaningCandidate, MeaningPool, Message, TermReading } from "./types.ts";
/** DESIGN §5.1: two-level Dirichlet (Teh et al. 2006); proposed concentration 1.
 * Scale counts and alpha together to avoid overflowing their sums. Zero-mass pools are unknown.
 */
export declare function selectMeaning(pool: MeaningPool, term: string, bubble: string, alpha?: number): CategoricalBelief | undefined;
/** DESIGN §5.1, §18.1: explicit definition or observed usage adds exactly one count. */
export declare function reconstruct(pool: MeaningPool, term: string, candidate: MeaningCandidate, bubble: string): MeaningPool;
/** DESIGN §5.1: reinforcement requires an observed confirmation, never mere reception. */
export declare function reinforce(pool: MeaningPool, term: string, meaning: string, bubble: string): MeaningPool;
export type ComprehensionView = Pick<MindView, "beliefs"> & Pick<MemoryState, "reliability" | "meaningPool" | "termReadings">;
/** DESIGN §5.1: meaning selection, prior fit and credibility mixture; no belief mutation.
 * Unknown speakers use proposed Beta(1,1) ignorance. Speaker intent is not a definition.
 */
export declare function comprehend(view: ComprehensionView, message: Message, context: CommunicationContext): {
    readonly readings: readonly TermReading[];
    readonly pool: MeaningPool;
    readonly utterances: readonly ComprehendedUtterance[];
};
