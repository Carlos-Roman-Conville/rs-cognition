import type { EncodingResult, Episode, MindView, PersonalityOperation } from "../../src/index.ts";
import type { EightFunctionV2, V2Context } from "./v2.ts";

export interface EncodingContext extends V2Context {
  readonly operations: PersonalityOperation[];
}
export interface EncodingOptions {
  readonly context: (mind: MindView) => EncodingContext;
  /** Engine attention share and subjective dimension for this episode's feature. */
  readonly cue: (key: string, mind: MindView) => { readonly attention: number; readonly dimension: string };
}

// DESIGN §16.2 / §22.4: proposed unit weights for the four specified profiles.
// Unspecified dimensions (including Ni's pattern) contribute nothing.
const profiles: Readonly<Record<string, string>> = {
  Si: "physical", Fi: "valence", Ti: "structural", Fe: "social",
};

export function encodeV2(cues: Episode["context"], mind: MindView,
  model: EightFunctionV2, options: EncodingOptions): EncodingResult {
  const inputs = Object.keys(cues).map(key => {
    const { attention, dimension } = options.cue(key, mind);
    if (!Number.isFinite(attention) || attention < 0 || attention > 1) {
      throw new RangeError("Encoding attention share must be finite and in [0, 1]");
    }
    return { key, attention, dimension };
  });
  const ctx = options.context(mind);
  const active = model.allocation(ctx).filter(row => Object.hasOwn(profiles, row.function)
    && row.A.att > 0 && model.operationEnabled(row.function, "encoding"));
  // DESIGN §22.4, corrected by §22.7 / Num-Q1: attention enters once; no competence gain.
  const strengths = Object.fromEntries(inputs.map(cue => [cue.key, cue.attention * (1 +
    active.reduce((sum, row) => sum + (profiles[row.function] === cue.dimension ? row.A.att : 0), 0))]));
  for (const row of active) {
    ctx.operations.push({ function: row.function, operation: "encoding", executed: true,
      output: structuredClone({ inputs, allocation: row.A.att, dimension: profiles[row.function], strengths }) });
  }
  // DESIGN §22.4: threshold estimate, not a fitted value or shared engine parameter.
  return { strengths, tauEnc: 0.1 };
}
