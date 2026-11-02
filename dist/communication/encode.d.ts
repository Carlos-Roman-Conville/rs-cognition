import type { Intention, MemoryState } from "../types.ts";
import type { EncodePlan, Message, TermReading } from "./types.ts";
/** DESIGN §5.1: content only, after select; host term order breaks ties. */
export declare function encode(intention: Intention, memory: MemoryState, plan: EncodePlan): {
    message: Message;
    readings: readonly TermReading[];
};
