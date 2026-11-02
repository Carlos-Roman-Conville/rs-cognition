import type { CommunicationDecision, Message } from "./communication/types.ts";
import type { CredibilitySettlement } from "./communication/credibility.ts";
import type { CommunicationContext, ComprehendedUtterance } from "./communication/types.ts";
import type { Counters, RandomStream, SimTime } from "@rex/kernel";
import type { GenerationInputs } from "./actions.ts";
import type { PersonalityModel } from "./personality.ts";
import type { SelectionTrace } from "./select.ts";
import type { Belief, CognitiveParams, Episode, Intention, MemoryState, NeedState, Observation } from "./types.ts";
/** §3's memory plus the host affordances and bookkeeping required by §2.4.
 * This ephemeral view may contain pure host expressions; never persist it in Runner state/logs.
 */
export interface PolicyMemoryState extends MemoryState {
    readonly decision: {
        readonly communication?: CommunicationDecision;
        readonly mind: string;
        readonly counters: Counters;
        readonly generation: GenerationInputs;
        readonly context: Episode["context"];
        readonly current?: Intention;
    };
}
/** Subjective diagnostics in observation order, then belief insertion order. */
export interface ObservationUpdate {
    readonly cue: string;
    readonly observationIndex: number;
    readonly attribute: string;
    readonly about: string;
    readonly prior: Belief;
    readonly posterior: Belief;
    /** Same JSON-safe singular KL representation as LearningTrace. */
    readonly kl: number | "Infinity";
}
export interface ObservationTrace {
    readonly conversations?: MemoryState["conversations"];
    readonly credibility?: readonly CredibilitySettlement[];
    readonly comprehension?: readonly ComprehendedUtterance[];
    readonly updates: readonly ObservationUpdate[];
}
export interface ObservationResult extends MemoryState {
    readonly trace: ObservationTrace;
}
/** DESIGN §1, §2.3: observe declared attributes in input order, without inventing priors.
 * Hosts must declare support/priors for every attribute they want learned. Existence
 * entries for the same entity also receive detection evidence, once per observation.
 */
export declare function observeMemory(observations: readonly Observation[], memory: MemoryState, needs: NeedState, personality: PersonalityModel, params: CognitiveParams, t: SimTime, communication?: Pick<CommunicationContext, "thetaPre">): ObservationResult;
/** DESIGN §3: π(o,m,n,p,θ,rng,t), pure apart from the explicitly supplied stream.
 * §2.3 evaluation uses expected retrieval weights, not sampled/rehearsed memories.
 * Thus this call consumes only the decision.select stream; no hidden retrieval draws.
 */
export declare function policy(o: readonly Observation[], m: PolicyMemoryState, n: NeedState, p: PersonalityModel, theta: CognitiveParams, rng: RandomStream, t: SimTime): {
    intention: Intention;
    trace: SelectionTrace;
    next: MemoryState;
    counters: Counters;
    message?: Message;
};
