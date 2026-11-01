import type { SimTime } from "@rex/kernel";
import type { CategoricalBelief, EntityHandle } from "../types.ts";

/** DESIGN §5.1: serializable meaning rules; no executable host callbacks. */
export interface MeaningCandidate {
  readonly id: string;
  readonly attribute: string;
  readonly value: { readonly kind: "literal"; readonly value: string };
}
export type MeaningPool = Readonly<Record<string, readonly (MeaningCandidate & {
  readonly counts: Readonly<Record<string, number>>;
})[]>>;
export interface Utterance {
  readonly act: string;
  readonly term: string;
  readonly about: EntityHandle;
  readonly claim?: { readonly attribute: string; readonly value: string };
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
export interface ConfusionCue { readonly speaker: EntityHandle; readonly term: string; readonly F: number }
export interface CommunicationContext {
  readonly bubble: string;
  readonly thetaPre: number;
  readonly poolConcentration?: number;
  /** Observed group usage and confirmed readings, never inferred from intended claims. */
  readonly usage?: readonly { readonly term: string; readonly meaning: MeaningCandidate; readonly bubble: string }[];
  readonly confirmed?: readonly { readonly term: string; readonly meaning: string; readonly bubble: string }[];
}
export interface ComprehendedUtterance {
  readonly utterance: Utterance;
  readonly distribution: CategoricalBelief | undefined;
  readonly F: number;
  readonly confusion?: ConfusionCue;
  readonly testimony: readonly {
    readonly about: EntityHandle; readonly attribute: string;
    readonly values: readonly string[]; readonly likelihood: readonly number[];
  }[];
}
