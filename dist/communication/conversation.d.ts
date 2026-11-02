import type { EvaluationResult } from "../evaluate.ts";
import type { CommunicationContext, ConversationDecision, ConversationRecord, ConfusionCue, SharedTopic, Utterance } from "./types.ts";
export declare function conversation(records: readonly ConversationRecord[], partner: string): ConversationRecord;
export declare function keepConversation(records: readonly ConversationRecord[], record: ConversationRecord): readonly ConversationRecord[];
/** DESIGN §5.1: subjective topics only; intention evidence reuses §2.3 updateCategorical. */
export declare function conversationTurn(record: ConversationRecord, utterance: Utterance, topics: readonly SharedTopic[], context: Pick<CommunicationContext, "intentionModel" | "links">, eta: number, heard: boolean): {
    record: ConversationRecord;
    confusion?: ConfusionCue;
};
/** DESIGN §5.1: σ(β(max EU(turn)-EU(leave))), stable two-way softmax; no choice or RNG. */
export declare function assessConversation(record: ConversationRecord, evaluation: EvaluationResult, spec: ConversationDecision): ConversationRecord;
