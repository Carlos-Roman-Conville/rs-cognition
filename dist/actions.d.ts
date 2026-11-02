import type { GenerateParams, PersonalityModel } from "./personality.ts";
import type { AssetDefinition, ExchangeSpec, BeliefStore, Candidate, CategoricalBelief, Domain, MindView, PredictedOutcome } from "./types.ts";
/** DESIGN §2.4: pure host expressions consume only this mind's beliefs. */
export interface ActionDefinition {
    readonly exchange?: ExchangeSpec;
    readonly id: string;
    readonly target?: string;
    /** DESIGN §2.4: host repertoire data passed through untouched; numbers only; Cognition never reads a term */
    readonly terms?: Readonly<Record<string, number>>;
    readonly targetKind: string;
    readonly domain: Domain;
    readonly preconditions: readonly {
        readonly id: string;
        readonly probability: (beliefs: BeliefStore) => number;
    }[];
    readonly outcomeSpace: readonly PredictedOutcome[];
    readonly duration: number;
    readonly capacityRequired: number;
    readonly cost: number;
    readonly naiveModel: (beliefs: BeliefStore) => CategoricalBelief;
}
export interface GenerationInputs {
    readonly assets?: readonly AssetDefinition[];
    readonly repertoire: readonly ActionDefinition[];
    /** Required host data, including its id: the engine has no reserved action ids. */
    readonly wait: ActionDefinition;
    readonly body: {
        readonly capacity_functional: number;
    };
    readonly thetaPre?: number;
}
export interface GenerationResult {
    readonly assets?: readonly AssetDefinition[];
    readonly candidates: readonly Candidate[];
    readonly params: GenerateParams;
    readonly thetaPre: number;
    readonly capacityFunctional: number;
    /** Includes rejected definitions, so the feasibility decision can be explained. */
    readonly checks: readonly {
        readonly action: string;
        readonly target?: string;
        readonly capacityRequired: number;
        readonly preconditions: Candidate["preconditions"];
        readonly eligible: boolean;
    }[];
}
/** Shared boundary validation also applies to recombinations returned by the generate hook. */
export declare function validateCandidate(candidate: Candidate): void;
/** DESIGN §2.4: θ_pre=0.5 proposed; capacity is a declared body input, never computed here. */
export declare function generateActions(inputs: GenerationInputs, ctx: MindView, personality?: PersonalityModel): GenerationResult;
