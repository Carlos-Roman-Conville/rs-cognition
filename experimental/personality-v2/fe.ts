import { comprehend, reconstruct, reinforce, selectMeaning } from "../../src/index.ts";
import type { CategoricalBelief, CommunicationContext, ComprehendedUtterance, ComprehensionView,
  Message, PersonalityOperation } from "../../src/index.ts";
import type { EightFunctionV2, V2Context } from "./v2.ts";

export interface V2CommunicationContext extends CommunicationContext {
  /** Subjectively identified listeners and their bubbles, in host mint order. */
  readonly audience?: readonly { readonly listener: string; readonly bubble: string }[];
}
export type AudienceMap = readonly {
  readonly listener: string;
  readonly bubble: string;
  /** Null means §5.1 has no supported meaning, not an invented uniform reading. */
  readonly distribution: CategoricalBelief | null;
}[];
export interface V2ComprehendedUtterance extends ComprehendedUtterance {
  readonly audienceMap?: AudienceMap;
}
export type V2Comprehension = Omit<ReturnType<typeof comprehend>, "utterances"> & {
  readonly utterances: readonly V2ComprehendedUtterance[];
};

/** Experimental entry point: FUNCTION-DESIGN §6.4 supersedes DESIGN §22.4 pooling.
 * The engine's own comprehension stays unchanged; no EU, expression or memory writes.
 */
export function comprehendV2(view: ComprehensionView, message: Message, context: V2CommunicationContext,
  model: EightFunctionV2, ctx: V2Context): V2Comprehension {
  const result = comprehend(view, message, context);
  const fe = model.allocation(ctx).find(row => row.function === "Fe");
  if (!fe || fe.A.eval <= 0 || !context.audience?.length || !model.operationEnabled("Fe", "meaningSelection")) return result;

  // Replay only §5.1's public pool updates so each reading uses its own instant,
  // never a later utterance's definition. This is a local value, not new state.
  let pool = view.meaningPool ?? {};
  for (const usage of context.usage ?? []) pool = reconstruct(pool, usage.term, usage.meaning, usage.bubble);
  for (const confirmed of context.confirmed ?? []) pool = reinforce(pool, confirmed.term, confirmed.meaning, confirmed.bubble);
  const operations: PersonalityOperation[] = [];
  const utterances = result.utterances.map((reading): V2ComprehendedUtterance => {
    const { utterance } = reading;
    if (utterance.declared) pool = reconstruct(pool, utterance.term, utterance.declared, context.bubble);
    // FUNCTION-DESIGN §6.4: one full §5.1 distribution per listener, never pooled
    // or scaled. Positive allocation gates execution; competence has no effect.
    const audienceMap: AudienceMap = context.audience!.map(({ listener, bubble }) => ({
      listener, bubble, distribution: selectMeaning(pool, utterance.term, bubble, context.poolConcentration) ?? null,
    }));
    operations.push({ function: "Fe", operation: "meaningSelection", executed: true,
      output: structuredClone({ term: utterance.term, audienceMap }) });
    return { ...reading, audienceMap };
  });
  return { ...result, utterances, operations };
}
