import type { SimTime } from "@rex/kernel";

/** DESIGN §1: a mind's handle, not access to the entity's objective state. */
export type EntityHandle = string;
export type Channel = "sight" | "sound" | "touch" | "report";
export type Domain = "space" | "adaptation" | "meta" | "cohesion" | "body" | "people" | "strategy" | "none";
export type Relevance = Readonly<Record<string, number>>;

interface Cue {
  readonly cue: string;
  readonly about: EntityHandle;
  readonly attribute: string;
  readonly channel: Channel;
}

/** DESIGN §1, §2.1: ONLY perception may consume this objective boundary input. */
export type Stimulus = Cue & {
  readonly present: boolean;
  readonly detectability: number;
  readonly relevance: Relevance;
  readonly domain: Domain;
} & (
  | { readonly kind: "categorical"; readonly value: string; readonly values: readonly string[] }
  | { readonly kind: "real"; readonly value: number }
);

export interface DetectionModel {
  readonly P_H: number;
  readonly P_FA: number;
}

/** DESIGN §2.1: reported values only; null means attended but not detected. */
export type Observation = Cue & { readonly t: SimTime } & (
  | { readonly kind: "categorical"; readonly value: string; readonly model: DetectionModel & { readonly q: number } }
  | { readonly kind: "real"; readonly value: number; readonly model: DetectionModel & { readonly sigma: number } }
  | { readonly kind: "null"; readonly model: DetectionModel }
);

export interface CategoricalBelief {
  readonly kind: "categorical";
  /** Values and probabilities have the same order; values are unique. */
  readonly values: readonly string[];
  readonly probabilities: readonly number[];
}

export interface GaussianBelief {
  readonly kind: "gaussian";
  readonly mean: number;
  readonly variance: number;
}

export interface ExistenceBelief {
  readonly kind: "existence";
  readonly probability: number;
}

export type Belief = CategoricalBelief | GaussianBelief | ExistenceBelief;
export interface BetaReliability {
  /** Nonnegative pseudo-counts; at least one must be positive (endpoints allowed). */
  readonly alpha: number;
  readonly beta: number;
}

export interface BeliefEntry {
  readonly about: EntityHandle;
  readonly attribute: string;
  readonly belief: Belief;
  /** Initial prior retained as the categorical relaxation target, even if false. */
  readonly prior: Belief;
  readonly origin: "ignorance" | "given" | "false";
}

/** DESIGN §2.3, §7: serializable records in insertion order; updates keep their slot. */
export interface BeliefStore {
  readonly entries: readonly BeliefEntry[];
}

/** DESIGN §3: ASCII spellings of θ; n and m are the shared drive exponents (§2.2). */
export interface CognitiveParams {
  readonly beta: number;
  readonly lambda: number;
  readonly gamma: number;
  readonly eta: number;
  readonly alpha0: number;
  readonly d: number;
  readonly tau: number;
  readonly s: number;
  readonly kappa: number;
  readonly k: number;
  readonly n: number;
  readonly m: number;
}

export const DEFAULT_COGNITIVE_PARAMS: Readonly<CognitiveParams> = Object.freeze({
  beta: 1, // proposed; inverse decision temperature, >= 0
  lambda: 2.25, // DESIGN §2.4: Tversky & Kahneman 1992 median; >= 0
  gamma: 0.99, // proposed; per-epoch discount, [0, 1]
  eta: 1, // proposed Bayesian baseline, [0, 1]; 0 freezes learning (DESIGN CB-5)
  alpha0: 1, // proposed; theory pseudo-count strength, > 0
  d: 0.5, // DESIGN §2.3: ACT-R, Anderson & Lebiere 1998; > 0
  tau: 0, // proposed; retrieval activation threshold, finite
  s: 0.4, // proposed baseline logistic scale, > 0; research calibration belongs to memory
  kappa: 0, // proposed; commitment advantage threshold, >= 0
  k: 0, // proposed; neutral SDT criterion, finite
  n: 4, // DESIGN §2.2: Keramati & Gutkin 2014 starting value; n > m
  m: 3, // DESIGN §2.2: Keramati & Gutkin 2014 starting value; m >= 1
});

/** DESIGN �2.4: addresses subjective beliefs, never objective asset state. */
export interface BeliefKey {
  readonly about: EntityHandle;
  readonly attribute: string;
}

export interface AssetDefinition {
  readonly id: string;
  readonly usefulness: Readonly<Record<string, number>>;
  readonly issuer?: EntityHandle;
  readonly accepted?: BeliefKey;
  readonly genuine?: BeliefKey;
  readonly rates?: Readonly<Record<string, BeliefKey>>;
}

export interface ExchangeSpec {
  readonly give: { readonly asset: string; readonly units: number };
  readonly want: { readonly asset: string; readonly units?: number };
}

export interface BeliefQuery extends BeliefKey {
  readonly value?: string;
}

/** DESIGN §2.2: needs are data, never a fixed list of engine behaviours. */
export interface NeedDefinition {
  readonly id: string;
  readonly category: string;
  readonly sdt?: "autonomy" | "competence" | "relatedness";
  readonly source:
    | { readonly signal: string }
    | { readonly appraisal: BeliefQuery }
    | { readonly accumulator: { readonly rate: number; readonly reset_on: readonly string[] } };
  readonly setpoint: number;
  readonly weight: number;
  readonly salienceTags: readonly string[];
}

export interface FeltNeed {
  readonly definition: NeedDefinition;
  readonly level: number;
  readonly deficit: number;
  readonly salience: number;
  readonly pressure: number;
  readonly priority: number;
}

export interface Goal {
  readonly id: string;
  readonly value: number;
  readonly progress: number;
  readonly deadline?: SimTime;
}

export interface NeedState {
  readonly needs: readonly FeltNeed[];
  readonly goals: readonly Goal[];
}

export interface Episode {
  readonly id: string;
  readonly t: SimTime;
  readonly retrievals: readonly SimTime[];
  readonly context: Readonly<Record<string, string | number | boolean>>;
  readonly action: string;
  readonly outcome: string;
  readonly reward: number;
  readonly predictionError: number;
  readonly attributedCause: string;
  readonly domain: Domain;
}

export interface MemoryState {
  readonly beliefs: BeliefStore;
  readonly episodes: readonly Episode[];
  readonly reliability: readonly { readonly speaker: EntityHandle; readonly belief: BetaReliability }[];
}

/** DESIGN §2.4: predicted deficits/progress, never changes applied to an engine. */
export interface PredictedOutcome {
  readonly id: string;
  /** Omitted need/goal keys retain their current values (proposed). */
  readonly deficits: Readonly<Record<string, number>>;
  readonly goalProgress: Readonly<Record<string, number>>;
  /** Host classification for the §9 confidence hook; never inferred from an id. */
  readonly success?: boolean;
}

/** DESIGN §2.4: serializable subjective candidate, in host repertoire order. */
export interface Candidate {
  readonly exchange?: ExchangeSpec;
  readonly action: string;
  readonly target?: EntityHandle;
  /** DESIGN §2.4: host repertoire data passed through untouched; numbers only; Cognition never reads a term */
  readonly terms?: Readonly<Record<string, number>>;
  readonly targetKind: string;
  readonly domain: Domain;
  readonly duration: number;
  readonly cost: number;
  readonly capacityRequired: number;
  readonly preconditions: readonly { readonly id: string; readonly probability: number }[];
  readonly effects: readonly PredictedOutcome[];
  readonly outcomes: CategoricalBelief;
}

export interface Intention {
  readonly id: string;
  readonly mind: EntityHandle;
  readonly action: string;
  readonly target?: EntityHandle;
  /** DESIGN §2.4: host repertoire data passed through untouched; numbers only; Cognition never reads a term */
  readonly terms?: Readonly<Record<string, number>>;
  readonly t: SimTime;
  readonly expectedOutcomes: CategoricalBelief;
  readonly status: "active" | "completed" | "failed" | "impossible";
}

export interface CandidateTrace {
  readonly candidate: Candidate;
  /** DESIGN §2.4: P_hat after interpretation, distinct from the candidate's naive theory. */
  readonly expectedOutcomes: CategoricalBelief;
  readonly expectedUtility: number;
  readonly probability: number;
}

export interface DecisionTrace {
  readonly ineligible?: readonly { readonly candidate: Candidate; readonly eligible: false; readonly reason: string }[];
  readonly mind: EntityHandle;
  readonly t: SimTime;
  readonly candidates: readonly CandidateTrace[];
  readonly beliefs: BeliefStore;
  readonly needs: NeedState;
  readonly params: CognitiveParams;
  readonly intention: Intention;
  readonly predictionError?: number;
  readonly attributedCause?: string;
}

/** DESIGN §3: deeply readonly subjective inputs; no world or other mind access. */
export interface MindView {
  readonly beliefs: BeliefStore;
  readonly needs: NeedState;
  readonly params: CognitiveParams;
}
