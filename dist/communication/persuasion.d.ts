import type { GenerationInputs } from "../actions.ts";
import type { PersonalityModel } from "../personality.ts";
import type { BeliefStore, Episode, MindView } from "../types.ts";
import type { Utterance } from "./types.ts";
import type { SimTime } from "@rex/kernel";
export interface PersuasionInputs {
    readonly utterance: Utterance;
    readonly before: MindView;
    readonly after: BeliefStore;
    readonly generation: GenerationInputs;
    readonly episodes: readonly Episode[];
    readonly context: Episode["context"];
    readonly t: SimTime;
    readonly action: {
        readonly action: string;
        readonly target?: string;
    };
    /** Speaker's claims for counterfactuals, including beliefs not targeted by this utterance. */
    readonly claims: readonly {
        readonly about: string;
        readonly attribute: string;
        readonly value: string;
    }[];
}
/** DESIGN §5.1: diagnostic only. Reuses generation/EU, with no selection, RNG or state writes.
 * Each counterfactual moves one categorical belief fully to the supplied claim (proposed).
 * Mint-order ties are stable; no positive gap reduction means no identified objection.
 */
export declare function persuasion(input: PersuasionInputs, personality?: PersonalityModel): {
    utterance: Utterance;
    targets: {
        about: string;
        attribute: string;
    }[];
    candidates: {
        action: string;
        target?: string;
        before: number | null;
        after: number | null;
    }[];
    objection: {
        about: string;
        attribute: string;
        reduction: number;
    } | undefined;
    counterfactuals: {
        reduction: number;
        about: string;
        attribute: string;
        value: string;
    }[];
    hit: boolean;
};
