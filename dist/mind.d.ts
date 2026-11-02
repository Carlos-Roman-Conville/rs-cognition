import { Runner } from "@rex/kernel";
import type { Counters, SimTime, StreamsState } from "@rex/kernel";
import type { GenerationInputs } from "./actions.ts";
import type { LearningInputs, LearningTrace } from "./learning.ts";
import type { NeedInputs } from "./needs.ts";
import type { PersonalityModel } from "./personality.ts";
import type { ObservationTrace } from "./policy.ts";
import type { SelectionTrace } from "./select.ts";
import type { CognitiveParams, Episode, Intention, MemoryState, NeedState, Observation } from "./types.ts";
export interface MindConfig {
    readonly communication?: import("./communication/types.ts").CommunicationDecision;
    readonly generation: Omit<GenerationInputs, "body">;
    readonly personality?: PersonalityModel;
    readonly learning: Pick<LearningInputs, "appraise" | "latents" | "encode" | "epsilonAttribution">;
}
export type MindsConfig = Readonly<Record<string, MindConfig>>;
export interface MindInput {
    readonly config: string;
    readonly memory: MemoryState;
    readonly needs: NeedState;
    readonly params?: CognitiveParams;
    readonly capacityFunctional: number;
    readonly context?: Episode["context"];
}
export interface PendingIntention {
    readonly intention: Intention;
    /** Original decision, retained even when commitment refreshes EU or another intention replaces it. */
    readonly trace: SelectionTrace;
    readonly outcomeEvent?: string;
}
export interface Mind extends MindInput {
    readonly id: string;
    readonly params: CognitiveParams;
    readonly context: Episode["context"];
    readonly beliefIds: readonly {
        readonly id: string;
        readonly about: string;
        readonly attribute: string;
    }[];
    readonly observations: readonly Observation[];
    readonly current?: Intention;
    readonly intentions: readonly PendingIntention[];
    readonly decisions: readonly SelectionTrace[];
    readonly learning: readonly LearningTrace[];
}
export interface MindsState {
    readonly minds: readonly Mind[];
    readonly counters: Counters;
    readonly runSeed: number;
    readonly streams: StreamsState;
    readonly ignoredOutcomes: readonly {
        readonly event: string;
        readonly cause?: string;
        readonly reason: "unknown cause" | "duplicate outcome";
    }[];
}
export interface OutcomeFeedback {
    readonly observations: readonly Observation[];
    readonly status?: "completed" | "failed" | "impossible";
}
export type MindCommand = {
    readonly type: "addMind";
    readonly mind: MindInput;
} | {
    readonly type: "observe";
    readonly mind: string;
    readonly t: SimTime;
    readonly observations: readonly Observation[];
    readonly perceptionState?: number;
} | {
    readonly type: "tickNeeds";
    readonly mind: string;
    readonly inputs: Omit<NeedInputs, "beliefs" | "accumulators">;
    /** Observed goal progress from the host, never inferred from a chosen action. */
    readonly goalProgress?: Readonly<Record<string, number>>;
} | {
    readonly type: "decide";
    readonly mind: string;
    readonly t: SimTime;
    readonly capacityFunctional?: number;
    readonly context?: Episode["context"];
} | {
    readonly type: "outcome";
    readonly event: string;
    readonly cause?: string;
    /** Resolved by the process from a previously published intention event, never guessed from cause. */
    readonly intention?: string;
    readonly t: SimTime;
    readonly feedback: OutcomeFeedback;
};
export type CognitionEmission = {
    readonly type: "cognition.intention";
    readonly payload: Intention;
} | {
    readonly type: "cognition.attribution";
    readonly payload: LearningTrace;
    readonly cause: string;
};
export interface MindResult {
    readonly state: MindsState;
    readonly events: CognitionEmission[];
    readonly added?: string;
    readonly observationTrace?: ObservationTrace;
    readonly message?: import("./communication/types.ts").Message;
}
export declare function createMindsState(runSeed: number): MindsState;
/** DESIGN §4, §7: a pure reducer; callbacks are fixed configuration, commands/state are cloneable data. */
export declare function reduceMinds(state: MindsState, command: MindCommand, configs: MindsConfig): MindResult;
export declare class MindsRunner extends Runner<MindsState, MindCommand, MindResult, CognitionEmission> {
    constructor(state: MindsState, configs: MindsConfig);
}
