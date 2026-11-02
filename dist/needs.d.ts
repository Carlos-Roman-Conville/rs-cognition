import type { BeliefStore, FeltNeed, Goal, NeedDefinition, Relevance } from "./types.ts";
export interface NeedInputs {
    readonly signals: Readonly<Record<string, number>>;
    readonly beliefs: BeliefStore;
    /** Accumulator levels at the beginning of this interval, keyed by need id. */
    readonly accumulators: Readonly<Record<string, number>>;
    readonly elapsedSeconds: number;
    /** Outcomes at the end of the interval; matching tags reset to the setpoint. */
    readonly outcomeTags: readonly string[];
    readonly cues: readonly {
        readonly attention: number;
        readonly relevance: Relevance;
    }[];
}
/** DESIGN §2.2: level-4 proposed pressure model; definitions remain in host mint order. */
export declare function evaluateNeeds(definitions: readonly NeedDefinition[], inputs: NeedInputs): FeltNeed[];
/** DESIGN §2.2, Keramati & Gutkin (2014), level 4; defaults n=4, m=3 from the shared parameters. */
export declare function drive(needs: readonly FeltNeed[], n?: number, m?: number): number;
/** DESIGN §2.2, Keramati & Gutkin (2014): r = D(h) - D(h'). */
export declare function driveReward(before: readonly FeltNeed[], after: readonly FeltNeed[], n?: number, m?: number): number;
/** DESIGN §2.2: one goal step contributes exactly V_g Δp_g; deadlines are host metadata. */
export declare function goalReward(goal: Goal, nextProgress: number): number;
