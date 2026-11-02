import type { PersonalityModel } from "./personality.ts";
import type { MindView, Relevance } from "./types.ts";
/** Metadata only, projected at the sensory boundary. Arrays are in host mint order. */
export interface AttentionCue {
    readonly cue: string;
    readonly salience: number;
    readonly relevance: Relevance;
}
export interface AttentionCategory {
    readonly id: string;
    readonly base: number;
    /** rel(j,k), keyed by need id; omitted relations are zero (proposed). */
    readonly relevance: Relevance;
}
export type PertinenceHook = (base: Record<string, number>, ctx: MindView) => Record<string, number>;
/** DESIGN §3: the baseline personality is identity. */
export declare const identityPertinence: PertinenceHook;
export interface AttentionAllocation {
    readonly pertinence: Readonly<Record<string, number>>;
    /** Weights and shares align with the input cue order. */
    readonly weights: readonly number[];
    readonly shares: readonly number[];
}
/** DESIGN §2.1: Bundesen (1990), TVA form level 2; this mapping is level 4. */
export declare function allocateAttention(cues: readonly AttentionCue[], categories: readonly AttentionCategory[], ctx: MindView, hook?: PertinenceHook, personality?: PersonalityModel): AttentionAllocation;
