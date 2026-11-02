import type { SimTime } from "@rex/kernel";
import type { CategoricalBelief, EntityHandle } from "../types.ts";
/** DESIGN §5.1: serializable meaning rules; no executable host callbacks. */
export interface MeaningCandidate {
    readonly id: string;
    readonly attribute: string;
    readonly value: {
        readonly kind: "literal";
        readonly value: string;
    };
}
export type MeaningPool = Readonly<Record<string, readonly (MeaningCandidate & {
    readonly counts: Readonly<Record<string, number>>;
})[]>>;
export interface Utterance {
    readonly act: string;
    readonly term: string;
    readonly about: EntityHandle;
    readonly claim?: {
        readonly attribute: string;
        readonly value: string;
    };
    readonly declared?: MeaningCandidate;
}
export interface Message {
    readonly id: string;
    readonly sender: EntityHandle;
    readonly receivers: readonly EntityHandle[];
    readonly medium: string;
    readonly t: SimTime;
    readonly utterances: readonly Utterance[];
}
export interface ConfusionCue {
    readonly speaker: EntityHandle;
    readonly term: string;
    readonly F: number;
}
export interface EquivocationCue {
    readonly speaker: EntityHandle;
    readonly term: string;
    readonly from: string;
    readonly to: string;
}
export interface TermReading {
    readonly speaker: EntityHandle;
    readonly conversation: string;
    readonly term: string;
    readonly meaning: string;
}
export interface PendingTestimony {
    readonly speaker: EntityHandle;
    readonly about: EntityHandle;
    readonly attribute: string;
    readonly value: string;
    readonly t: SimTime;
}
export interface CommunicationContext {
    /** Host conversation handle; omitted messages are independent conversations (proposed). */
    readonly conversation?: string;
    readonly bubble: string;
    readonly thetaPre: number;
    readonly poolConcentration?: number;
    readonly intentionModel?: ConversationModel;
    /** Subjectively understood links supplied with the observation, not world truth. */
    readonly links?: readonly SharedTopic[];
    /** Observed group usage and confirmed readings, never inferred from intended claims. */
    readonly usage?: readonly {
        readonly term: string;
        readonly meaning: MeaningCandidate;
        readonly bubble: string;
    }[];
    readonly confirmed?: readonly {
        readonly term: string;
        readonly meaning: string;
        readonly bubble: string;
    }[];
}
export interface ComprehendedUtterance {
    readonly utterance: Utterance;
    readonly distribution: CategoricalBelief | undefined;
    readonly F: number;
    readonly confusion?: ConfusionCue;
    readonly equivocation?: EquivocationCue;
    readonly pending?: PendingTestimony;
    readonly testimony: readonly {
        readonly about: EntityHandle;
        readonly attribute: string;
        readonly values: readonly string[];
        readonly likelihood: readonly number[];
    }[];
}
/** DESIGN §5.1: host-ordered atomic details; a prefix is retained (proposed granularity). */
export interface ClaimDetail {
    readonly act: string;
    readonly about: string;
    readonly attribute: string;
    readonly value?: string;
    readonly declared?: MeaningCandidate;
}
export interface EncodePlan {
    readonly action: string;
    readonly target?: string;
    readonly receivers: readonly string[];
    readonly medium: string;
    readonly capacity: number;
    readonly bubble: string;
    readonly conversation: string;
    readonly terms: readonly string[];
    readonly details: readonly ClaimDetail[];
    readonly articulability?: number;
}
export interface SharedTopic {
    readonly about: string;
    readonly attribute: string;
}
export interface ConversationRecord {
    readonly partner: string;
    readonly sharedContext: readonly SharedTopic[];
    readonly perceivedIntention?: CategoricalBelief;
    readonly turns: number;
    readonly conversationTolerance?: number;
    readonly engagementWillingness?: number;
}
export interface ConversationModel {
    readonly prior: CategoricalBelief;
    /** Likelihoods in prior.values order, keyed by host act. */
    readonly likelihoods: Readonly<Record<string, readonly number[]>>;
}
export interface ConversationDecision {
    readonly partner: string;
    readonly turns: readonly {
        readonly action: string;
        readonly target?: string;
    }[];
    readonly leave: {
        readonly action: string;
        readonly target?: string;
    };
}
export interface CommunicationDecision {
    readonly conversations?: readonly ConversationDecision[];
    readonly encode?: readonly EncodePlan[];
}
