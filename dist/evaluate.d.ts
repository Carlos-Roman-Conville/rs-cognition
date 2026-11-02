import type { SimTime } from "@rex/kernel";
import type { GenerationResult } from "./actions.ts";
import type { InterpretParams, PersonalityModel } from "./personality.ts";
import type { Candidate, CategoricalBelief, DecisionTrace, Episode, MindView } from "./types.ts";
export interface OutcomeUtility {
    readonly outcome: string;
    readonly probability: number;
    readonly driveReward: number;
    readonly goalReward: number;
    readonly cost: number;
    readonly netReward: number;
    readonly value: number;
}
/** DESIGN §2.4 PA-Q2: keeper's proposed search bound; sourced: false. */
export declare const R_MAX = 1000000;
export interface Evaluation {
    readonly ratioMin?: number;
    readonly candidate: Candidate;
    readonly interpret: InterpretParams;
    readonly counts: readonly number[];
    /** Memory's unmodified P_hat, then the interpreted distribution used by EU. */
    readonly memoryDistribution: CategoricalBelief;
    readonly expectedOutcomes: CategoricalBelief;
    readonly outcomes: readonly OutcomeUtility[];
    readonly discount: number;
    readonly expectedUtility: number;
}
export interface EvaluationResult {
    readonly ineligible?: DecisionTrace["ineligible"];
    readonly generation: GenerationResult;
    readonly candidates: readonly Evaluation[];
    readonly view: MindView;
    readonly episodes: readonly Episode[];
    readonly context: Episode["context"];
    readonly t: SimTime;
}
/** DESIGN §2.4: one-action EU, drive reduction plus goals minus effort, with loss aversion and discount. */
export declare function evaluateActions(generation: GenerationResult, ctx: MindView, episodes: readonly Episode[], context: Episode["context"], t: SimTime, personality?: PersonalityModel): EvaluationResult;
