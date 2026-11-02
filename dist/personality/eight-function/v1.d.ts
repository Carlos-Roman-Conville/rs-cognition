import stacks from "../../../personality/eight-function/stacks.json";
import type { PersonalityModel } from "../../personality.ts";
import type { Candidate, CategoricalBelief, Domain, MindView } from "../../types.ts";
export type CognitiveFunction = "Se" | "Si" | "Ne" | "Ni" | "Te" | "Ti" | "Fe" | "Fi";
export type PersonalityType = keyof typeof stacks;
/** Subjective tags supplied by the caller, never objective world state. */
export interface V1Context {
    readonly failures?: number;
    readonly cues?: Readonly<Record<string, {
        readonly domain: Domain;
        readonly physical?: boolean;
        readonly present?: boolean;
    }>>;
    readonly targeted?: boolean;
    readonly aboutPerson?: boolean;
    readonly present?: boolean;
    readonly testimony?: boolean;
}
/** F9: the host owns precondition semantics and the compound's subjective outcome model.
 * No joint probability, outcome effects, or world transition is invented by personality.
 */
export interface BelievedCompound {
    readonly outcome: string;
    readonly precondition: string;
    readonly candidate: Candidate;
}
/** The compound remains one host candidate, with its two intended steps preserved in traces. */
export interface V1CompoundCandidate extends Candidate {
    readonly steps: readonly [Pick<Candidate, "action" | "target">, Pick<Candidate, "action" | "target">];
}
export interface V1Options {
    /** DESIGN §9 F1 names eta_min but gives no value: required, not a hidden default. */
    readonly etaMin: number;
    /** Proposed absence convention: no extra tags and zero recorded failures. */
    readonly context?: (mind: MindView) => V1Context;
    /** Return only when a's believed outcome satisfies a precondition of b. */
    readonly compound?: (a: Candidate, b: Candidate, mind: MindView) => BelievedCompound | undefined;
    readonly otherMind?: {
        /** Only outcomes dependent on another mind's choice get a believed situation. */
        readonly situation: (candidate: Candidate, mind: MindView) => MindView | undefined;
        /** Run this mind's own policy in that subjective situation and project its choice
         * distribution onto candidate outcomes. The host supplies that projection, not v1.
         * Pass the supplied model to policy; recursive other-mind simulation is disabled.
         */
        readonly ownPolicy: (candidate: Candidate, situation: MindView, model: PersonalityModel) => CategoricalBelief;
    };
}
export interface EightFunctionV1 extends PersonalityModel {
    readonly version: "v1";
    readonly stack: readonly CognitiveFunction[];
    readonly weights: Readonly<Record<CognitiveFunction, number>>;
    readonly tilt: number;
    /** DESIGN §9: explicitly reserved identity hooks, including inline off exceptions. */
    readonly off: Readonly<Record<string, PersonalityModel>>;
}
/** DESIGN §9, FUNCTIONS "Stack position and confidence" and "Attitudes".
 * Named types have four slots. Shorter distinct diagnostic stacks exercise off-only content;
 * present slots retain their specified ordinal weights; absent functions have weight zero.
 */
export declare function createEightFunctionV1(typeOrStack: PersonalityType | readonly CognitiveFunction[], options: V1Options): EightFunctionV1;
