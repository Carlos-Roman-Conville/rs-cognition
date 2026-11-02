// Objective values stop at this adapter. Hooks receive subjective metadata only.
import { allocateAttention, attentionCues, perceive } from "../../../src/index.ts";
import type { MindView, PersonalityModel, Stimulus, V1Context } from "../../../src/index.ts";
import type { RandomStream } from "@rex/kernel";
import type { WorkshopState, HostOutcome } from "./world.ts";
export interface CueMetadata { cue: string; about: string; attribute: string; domain: "meta"; tags: string[] }
export type Sensor = ReturnType<typeof makeSensor>;
export type Sensed = ReturnType<Sensor>;
const parameters = { k: 0, weberFractions: { sight: 0.1, sound: 0.1, touch: 0.1, report: 0.1 } }; // section 4 proposed reliable visible counters.
function stimulus(about: string, attribute: string, value: string, values: string[]): Stimulus {
  return { cue: `${about}:${attribute}`, about, attribute, value, values, kind: "categorical", present: true, channel: "report", detectability: 40, relevance: { work: 1 }, domain: "meta" };
}
export function makeSensor(state: WorkshopState, t: number, rng: RandomStream) {
  // section 4 instructions precede each attempted step; ask requests the same instruction again.
  // Context alternates by local step, not by epoch, and never reports hidden quality.
  const task = state.tasks.find(task => task.id === state.active)!;
  const tag = task.steps % 2 === 0 ? "procedural" : "opinion";
  const stimuli = state.tasks.flatMap(task => [
    stimulus(task.id, "available:continue", task.id === state.active && !task.finished ? "yes" : "no", ["no", "yes"]),
    stimulus(task.id, "available:switch", task.id !== state.active && !task.finished ? "yes" : "no", ["no", "yes"]),
    stimulus(task.id, "progress", String(task.steps), ["0", "1", "2", "3", "4"]),
  ]);
  stimuli.push(stimulus("self", "available:verify", task.steps > 0 ? "yes" : "no", ["no", "yes"]));
  const instruction = stimulus(task.id, "ready", state.instruction ? "yes" : "no", ["no", "yes"]);
  stimuli.push(instruction);
  return (view: MindView, model: PersonalityModel, context: (value: V1Context) => void) => {
    const metadata: CueMetadata[] = stimuli.map(cue => ({ cue: cue.cue, about: cue.about, attribute: cue.attribute, domain: "meta", tags: cue === instruction ? ["testimony", tag] : [] }));
    const cues = Object.fromEntries(metadata.map(cue => [cue.cue, { domain: cue.domain }]));
    context({ cues });
    const categories = stimuli.map(cue => ({ id: cue.cue, base: 1, relevance: { competence: 1 } }));
    // section 4 one category per cue, as S1; stimuli relevance must address those categories.
    const visible = stimuli.map(cue => ({ ...cue, relevance: { [cue.cue]: 1 } }));
    const baseline = allocateAttention(attentionCues(visible), categories, view);
    const attention = allocateAttention(attentionCues(visible), categories, view, model.pertinence);
    const interpretation: { cue: string; parameters: ReturnType<PersonalityModel["interpret"]> }[] = [];
    let effectiveReliability = state.reliability;
    const observations = visible.flatMap((cue, i) => {
      const testimony = i === visible.length - 1;
      // V1's documented boolean input: procedural instructions exercise F13; opinion does not.
      context({ cues, testimony: testimony && tag === "procedural" });
      const interpreted = model.interpret({ eta: view.params.eta, alpha0: view.params.alpha0, lambda: view.params.lambda,
        confidence: 1, weberFraction: 0.1, testimonyFloor: testimony ? state.reliability : 0 }, "meta", view);
      interpretation.push({ cue: cue.cue, parameters: interpreted });
      const observed = perceive([cue], [attention.shares[i]], parameters, t, rng);
      if (!testimony) return observed;
      effectiveReliability = interpreted.testimonyFloor;
      // section 4 proposed acceptance convention: adopt reports more reliable than chance; rejected reports add no evidence.
      return effectiveReliability > 0.5 ? observed.map(o => o.kind === "categorical" ? { ...o, model: { ...o.model, q: effectiveReliability } } : o) : [];
    });
    context({ cues });
    return { observations, metadata, interpretation, testimony: { context: tag, reliability: state.reliability, effectiveReliability, accepted: effectiveReliability > 0.5 },
      attention: { ...attention, cues: visible.map(cue => cue.cue), baselineShares: baseline.shares } };
  };
}
export function perceiveResult(outcome: HostOutcome, t: number, rng: RandomStream) {
  const stimuli = [stimulus("self", "result", outcome.result, ["done", "failed"]),
    stimulus("self", "competence", outcome.success ? "yes" : "no", ["no", "yes"])];
  // section 4 the only sensory path from hidden defects is explicit verification.
  if (outcome.revealed !== null) stimuli.push(stimulus(outcome.task, "quality", outcome.revealed ? "bad" : "good", ["bad", "good"]));
  return perceive(stimuli, stimuli.map(() => 1 / stimuli.length), parameters, t, rng);
}
