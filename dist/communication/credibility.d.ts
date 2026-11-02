import type { BetaReliability, MemoryState, Observation } from "../types.ts";
export interface CredibilitySettlement {
    readonly speaker: string;
    readonly prior: BetaReliability;
    readonly posterior: BetaReliability;
    readonly kl: number | "Infinity";
}
/** DESIGN §5.1: direct categorical identification confidence q weights Beta evidence.
 * Reports and null detections cannot settle claims. All matching older claims settle in receipt order.
 */
export declare function settleTestimony(memory: MemoryState, observation: Observation): {
    reliability: MemoryState["reliability"];
    testimony: MemoryState["testimony"];
    settlements: CredibilitySettlement[];
};
