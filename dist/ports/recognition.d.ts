import type { BeliefStore } from "../types.ts";
/** DESIGN §2.3: read the mind's categorical belief using its own office handle. */
export declare function recognition(beliefs: BeliefStore, officeHandle: string, domain: string): number | null;
export interface RecognitionLookup {
    beliefs(person: string): BeliefStore | undefined;
    handle(person: string, actor: string): string | undefined;
}
/** Host adapter for government.port.recognition; no beliefs are created or updated. */
export declare function createRecognitionReader(lookup: RecognitionLookup): {
    recognition(person: string, actor: string, domain: string): number | null;
};
