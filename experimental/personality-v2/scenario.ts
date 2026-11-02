import { createPersonality } from "./select.ts";
import type { AllocationRecord, EightFunctionV2 } from "./v2.ts";
import type { BeliefStore, Candidate, CognitiveFunction, MindView, Observation, PersonalityOperation, PersonalityType } from "../../src/index.ts";

export interface StepMask { t: number; function: CognitiveFunction; operation: string }
export interface ScenarioTrace {
  allocations: AllocationRecord[];
  operations: PersonalityOperation[];
  beliefs: BeliefStore;
  meanings: Record<string, readonly number[]>;
}
/** Subjective host bridge, DESIGN §22. No world values or extra memory store. */
export class ScenarioV2 {
  model: EightFunctionV2;
  t = 0;
  mind = "";
  candidates: readonly Candidate[] = [];
  cues: readonly { cue: string; domain: string; tags: readonly string[] }[] = [];
  shares: readonly number[] = [];
  trace: ScenarioTrace = { allocations: [], operations: [], beliefs: { entries: [] }, meanings: {} };
  constructor(type: PersonalityType, mask?: StepMask) {
    const context = (view: MindView) => ({ ...view, mind: this.mind, t: this.t as Observation["t"],
      candidates: this.candidates, attended: this.cues.map((cue, i) => ({ category: cue.domain, weight: this.shares[i] ?? 0 })),
      trace: this.trace, operations: this.trace.operations });
    this.model = createPersonality({ model: "eight-function", version: "v2", type, options: {
      mask: mask ? [mask] : [], maskActive: () => mask?.t === this.t,
      se: { context, isPresent: obs => this.cues.some(c => c.cue === obs.cue && c.tags.includes("present")),
        probability: (candidate, precondition, observations) => {
          const obs = observations.find(o => o.about === (candidate.target ?? "self") && o.attribute === precondition.id && o.kind === "categorical");
          // The fixtures' available:* predicates mean yes; use sensory reliability, never truth.
          if (!obs || obs.kind !== "categorical" || !precondition.id.startsWith("available:")) return undefined;
          return obs.value === "yes" ? obs.model.q : 1 - obs.model.q;
        } },
      encoding: { context, cue: key => {
        // S1's kind retrieval feature is derived from perceived colour (DESIGN scenarios §2).
        const indices = this.cues.flatMap((cue, i) => key === "kind" && cue.cue.endsWith(":colour") ? [i] : []);
        return { attention: indices.reduce((sum, i) => sum + (this.shares[i] ?? 0), 0), dimension: key === "kind" ? "physical" : "unspecified" };
      } },
    } }) as EightFunctionV2;
  }
  begin(t: number, mind: string) {
    this.t = t; this.mind = mind; this.candidates = [];
    this.trace = { allocations: [], operations: [], beliefs: { entries: [] }, meanings: {} };
  }
  finish(view: MindView, dt: number) {
    this.trace.beliefs = structuredClone(view.beliefs);
    // One experience update per epoch; operation allocation calls do not advance time.
    this.model.advance({ ...view, mind: this.mind, candidates: this.candidates,
      attended: this.cues.map((cue, i) => ({ category: cue.domain, weight: this.shares[i] ?? 0 })), trace: this.trace }, dt);
  }
}
