import type { EventBus, EventCursor, KernelEvent, OrderPosition, Process, ProcessContext, RandomStream, SimTime } from "@rex/kernel";
import type { Mind, MindCommand, MindsRunner, OutcomeFeedback } from "./mind.ts";
import type { Episode, Observation } from "./types.ts";
export interface CognitionEpoch {
    /** The host performs attention/perception at the sensory boundary using the supplied stream. */
    readonly observations: readonly Observation[];
    readonly needs: Extract<MindCommand, {
        type: "tickNeeds";
    }>["inputs"];
    readonly capacityFunctional: number;
    readonly context: Episode["context"];
    readonly goalProgress?: Readonly<Record<string, number>>;
}
/** Event cursors belong to the host (kernel events.ts); snapshot this alongside Runner and EventBus. */
export interface CognitionProcessState {
    readonly cursor: EventCursor;
    readonly intentions: readonly {
        readonly event: string;
        readonly intention: string;
    }[];
}
export interface CognitionProcessOptions {
    readonly runner: MindsRunner;
    readonly bus: EventBus;
    /** DESIGN §7: required host Δ, no engine-selected decision cadence. */
    readonly period: SimTime;
    readonly epoch: (mind: Mind, t: SimTime, dt: SimTime, perception: RandomStream) => CognitionEpoch;
    readonly outcomeTypes: readonly string[];
    /** Host boundary adapter: return perceived observations, never raw resolved results. */
    readonly readOutcome: (event: KernelEvent) => OutcomeFeedback;
    /** Default phases, first/only cognition process; supply rank when the host extends/reorders them. */
    readonly position?: OrderPosition;
    readonly from?: CognitionProcessState;
}
/** DESIGN §4, §7: the one population process; host registers its id in the default cognition phase. */
export declare class CognitionProcess implements Process {
    readonly id = "cognition.tick";
    readonly phase = "cognition";
    readonly mechanisms: string[];
    readonly period: SimTime;
    private readonly options;
    private readonly position;
    private cursor;
    private intentions;
    constructor(options: CognitionProcessOptions);
    state(): CognitionProcessState;
    run(ctx: ProcessContext): void;
}
