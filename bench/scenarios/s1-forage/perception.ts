// Objective values stop here. Downstream modules receive observations and cue metadata only.
import { allocateAttention, attentionCues, perceive } from "../../../src/index.ts";
import type { MindView, PersonalityModel, Stimulus, V1Context } from "../../../src/index.ts";
import type { RandomStream } from "@rex/kernel";
import { data, distance, kindOf } from "./field.ts";
import type { FieldState } from "./field.ts";

export interface CueMetadata { cue: string; about: string; attribute: string; domain: "space"; tags: string[] }
export function patchCues(state: FieldState): CueMetadata[] {
  const here = state.patches.find((patch) => patch.id === state.position)!;
  return state.patches.flatMap((patch) => kindOf(patch).cues.map((cue) => ({
    cue: `${patch.id}:${cue.attribute}`, about: patch.id, attribute: cue.attribute, domain: "space" as const,
    // fixture rule (DESIGN bench/scenarios §2): cardinal adjacency; inspect lasts the next sensing epoch; visits persist.
    tags: [...cue.tags, ...(distance(here, patch) <= 1 ? ["present"] : []),
      ...(state.targeted === patch.id ? ["targeted"] : []), ...(state.visited.includes(patch.id) ? ["remembered"] : [])],
  })));
}

export type Sensor = ReturnType<typeof makeSensor>;
export type Sensed = ReturnType<Sensor>;
function categoricalDraws(rng: RandomStream): RandomStream {
  // fixture rule (DESIGN bench/scenarios §2): reserve detection/identification/error draws even when unused, preserving CRN.
  const draws = [rng(), rng(), rng()];
  let index = 0;
  return () => draws[index++];
}
export function makeSensor(state: FieldState, t: number, rng: RandomStream) {
  return (view: MindView, model: PersonalityModel, context: (value: V1Context) => void) => {
    const metadata = patchCues(state);
    const here = state.patches.find((patch) => patch.id === state.position)!;
    const stimuli: Stimulus[] = [];
    for (const patch of state.patches) {
      for (const cue of kindOf(patch).cues) {
        // fixture rule (DESIGN bench/scenarios §2): visible field, proposed d'=4; `present` TAG means proximity, not existence.
        const id = `${patch.id}:${cue.attribute}`;
        stimuli.push({ cue: id, about: patch.id, attribute: cue.attribute, value: cue.value,
          values: data.kinds.map((kind) => kind.cues.find((c) => c.attribute === cue.attribute)!.value),
          kind: "categorical", present: true, channel: "sight", detectability: 4, relevance: { [id]: 1 }, domain: "space" });
      }
      // fixture rule (DESIGN bench/scenarios §2): observable local affordances, proposed d'=40 to keep navigation reliable.
      for (const action of ["move", "inspect", "gather"]) {
        const available = action === "move" ? distance(here, patch) === 1 : action === "inspect" ? distance(here, patch) <= 1 : here.id === patch.id;
        const cue = `${patch.id}:available:${action}`;
        stimuli.push({ cue, about: patch.id, attribute: `available:${action}`, value: available ? "yes" : "no", values: ["no", "yes"],
          kind: "categorical", present: true, channel: "touch", detectability: 40, relevance: { [cue]: 1 }, domain: "space" });
      }
    }
    const cueContext = Object.fromEntries(metadata.map((cue) => [cue.cue, { domain: cue.domain,
      physical: cue.tags.includes("physical"), present: cue.tags.includes("present") }]));
    context({ cues: cueContext });
    // fixture rule (DESIGN bench/scenarios §2): one attention category per cue lets F4/F6 see its own metadata.
    const categories = stimuli.map((cue) => ({ id: cue.cue, base: 1, relevance: { hunger: 1 } }));
    const cues = attentionCues(stimuli);
    const baseline = allocateAttention(cues, categories, view);
    const attention = allocateAttention(cues, categories, view, model.pertinence);
    const interpretation: { cue: string; parameters: ReturnType<PersonalityModel["interpret"]> }[] = [];
    const observations = stimuli.flatMap((cue, i) => {
      const tags = metadata.find((row) => row.cue === cue.cue)?.tags ?? [];
      context({ cues: cueContext, targeted: tags.includes("targeted"), present: tags.includes("present") });
      // fixture rule (DESIGN bench/scenarios §2): public sensory hook uses proposed Weber .1; no objective value enters the hook.
      const parameters = model.interpret({ eta: view.params.eta, alpha0: view.params.alpha0, lambda: view.params.lambda,
        confidence: 1, weberFraction: 0.1, testimonyFloor: 0 }, "space", view);
      interpretation.push({ cue: cue.cue, parameters });
      return perceive([cue], [attention.shares[i]], { k: view.params.k, weberFractions: {
        sight: parameters.weberFraction, sound: parameters.weberFraction, touch: parameters.weberFraction, report: parameters.weberFraction,
      } }, t, categoricalDraws(rng));
    });
    context({ cues: cueContext });
    return { observations, interpretation, attention: { ...attention, cues: stimuli.map((cue) => cue.cue), baselineShares: baseline.shares }, metadata };
  };
}

export function perceiveResult(result: string, t: number, rng: RandomStream) {
  // fixture rule (DESIGN bench/scenarios §2): explicit observed outcome report, proposed d'=40, still through perception.
  return perceive([{ cue: "self:result", about: "self", attribute: "result", value: result,
    values: ["0", "1", "2", "done", "failed"], kind: "categorical", present: true, channel: "touch",
    detectability: 40, relevance: { food: 1 }, domain: "space" }], [1],
  { k: 0, weberFractions: { sight: 0.1, sound: 0.1, touch: 0.1, report: 0.1 } }, t, categoricalDraws(rng));
}
