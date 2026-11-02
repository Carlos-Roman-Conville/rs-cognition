import type { Counters, RandomStream } from "@rex/kernel";
import type { Evaluation, EvaluationResult } from "./evaluate.ts";
import type { DecisionTrace, Intention } from "./types.ts";
/** DESIGN §2.4, Luce (1959), level 2: stable softmax in declared candidate order. */
export declare function softmax(utilities: readonly number[], beta: number): number[];
export interface SelectionTrace extends DecisionTrace {
    readonly conversations?: readonly import("./communication/types.ts").ConversationRecord[];
    readonly message?: import("./communication/types.ts").Message;
    readonly candidates: readonly (Evaluation & {
        /** Effective selection probability, including a commitment point mass. */
        readonly probability: number;
        readonly softmaxProbability: number;
    })[];
    readonly inputs: {
        readonly generation: EvaluationResult["generation"];
        readonly episodes: EvaluationResult["episodes"];
        readonly context: EvaluationResult["context"];
        readonly previousIntention?: Intention;
    };
    readonly commitment: {
        readonly kappa: number;
        readonly kept: boolean;
        readonly advantage?: number;
    };
    /** Exactly one selection-stream draw per re-choice, none when keeping an intention. */
    readonly draw?: number;
}
export interface SelectionInputs {
    readonly mind: string;
    readonly counters: Counters;
    readonly current?: Intention;
}
/**
 * DESIGN §2.4, §7: caller supplies streams.get("cognition.decision.select", mind).
 * Commitment: Bratman (1987), Cohen & Levesque (1990); quantitative threshold level 5.
 * Emits intention data for the reducer to wrap in a kernel event, never a resolved outcome.
 */
export declare function selectAction(evaluation: EvaluationResult, inputs: SelectionInputs, stream: RandomStream): {
    intention: Intention;
    trace: SelectionTrace;
    counters: Counters;
};
