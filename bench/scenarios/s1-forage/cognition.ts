import { ScenarioV2 } from "../../../experimental/personality-v2/scenario.ts";
import type { V2State } from "../../../experimental/personality-v2/v2.ts";
import type { ScenarioTrace, StepMask } from "../../../experimental/personality-v2/scenario.ts";
import { createPersonality } from "../../../experimental/personality-v2/select.ts";
// Subjective adapter: public engine state and hooks only; never receives a field, patch kind or true yield.
import { canonical, qualify, Runner, streams } from "@rex/kernel";
import {
  createMindsState, driftBeliefs, getBelief, nullPersonality, reduceMinds,
} from "../../../src/index.ts";
import type {
  CognitionEmission, LearningTrace, MindCommand, MindResult, MindsState, Observation, PersonalityModel,
  PersonalityType, ObservationTrace, SelectionTrace, V1Context,
} from "../../../src/index.ts";
import { ETA_MIN } from "../../personality-models.ts";
import { data, FIXTURE } from "./field.ts";
import { forecast, initialMemory, initialNeeds, makeConfig, PARAMS } from "./models.ts";
import type { Sensor, Sensed } from "./perception.ts";

import { shuffledV1, shuffledV2 } from "../controls.ts";
import type { Control } from "../controls.ts";
export interface Configuration { version: string; stack?: PersonalityType; control?: Control; id?: string }
export interface HookCall {
  hook: "pertinence" | "interpret" | "generate" | "learning";
  domain?: string; changed: string[]; before: unknown; after: unknown;
  // Frozen v1 reports aggregate hook outputs, not causal per-formula diagnostics. Never infer attribution.
  formulaIds: null;
}
const jsonValue = (value: unknown): unknown => JSON.parse(JSON.stringify(value, (_key, v: unknown) => v === Infinity ? "Infinity" : v));
export interface ProcessingTrace {
  v2?: ScenarioTrace;
  attention: Sensed["attention"];
  interpretation: Sensed["interpretation"];
  selection: SelectionTrace;
  candidates: SelectionTrace["inputs"]["generation"]["candidates"];
  evaluation: { action: string; target?: string; expectedUtility: number }[];
  beliefDeltas: LearningTrace["updates"];
  observationBeliefDeltas: ObservationTrace["updates"];
  learning: LearningTrace;
  hooks: HookCall[];
}

export class Forager {
  readonly runner;
  readonly personality: PersonalityModel;
  readonly id: string;
  private v2?: ScenarioV2;
  private context: V1Context = {};
  private hooks: HookCall[] = [];
  private sensed?: Sensed;
  private selection?: SelectionTrace;
  private observationTrace?: ObservationTrace;

  constructor(seed: number, patches: readonly string[], configuration: Configuration = { version: "null" }, override?: PersonalityModel, mask?: StepMask) {
    let model: PersonalityModel = nullPersonality;
    if (configuration.version !== "null") {
      if (!["v1", "v2"].includes(configuration.version) || !configuration.stack) throw new Error(`S1 requires an explicit context adapter for ${configuration.version}`);
      // fixture rule (DESIGN bench/scenarios §2): same frozen factory/etaMin as personality-versions, plus S1 cue metadata.
      if (configuration.version === "v2") {
        this.v2 = new ScenarioV2(configuration.stack, mask); model = this.v2.model;
      } else model = createPersonality({ model: "eight-function", version: "v1", type: configuration.stack,
        options: { etaMin: ETA_MIN, context: () => this.context } });
    }
    if (configuration.control === "shuffled" && this.v2) model = this.v2.model = shuffledV2(model, streams(seed).get("bench.control.shuffle", "scenario"));
    else if (configuration.control === "shuffled") model = shuffledV1(model,
      streams(seed).get("bench.control.shuffle", "scenario"),
      { get: () => this.context, set: (context) => { this.context = context; } });
    if (override) { model = override; this.v2 = undefined; }
    const record = (hook: HookCall["hook"], before: object, after: object, domain?: string) => {
      const b = jsonValue(before) as Record<string, unknown>, a = jsonValue(after) as Record<string, unknown>;
      this.hooks.push({ hook, domain, before: b, after: a, formulaIds: null,
        changed: Object.keys(b).filter((key) => canonical(b[key]) !== canonical(a[key])) });
    };
    this.personality = { ...model, id: model.id, version: model.version,
      pertinence: (base, view) => { const result = model.pertinence(base, view); record("pertinence", base, result); return result; },
      interpret: (base, domain, view) => { const result = model.interpret(base, domain, view); record("interpret", base, result, domain); return result; },
      generate: (candidates, base, view) => { if (this.v2) this.v2.candidates = candidates; const result = model.generate(candidates, base, view);
        record("generate", { candidates, params: base }, result); return result; },
      learning: (base, domain, view) => { const result = model.learning(base, domain, view); record("learning", base, result, domain); return result; },
    };
    const config = { ...makeConfig(patches), personality: this.personality };
    this.runner = new Runner<MindsState, MindCommand, MindResult, CognitionEmission>(createMindsState(seed), (state, command) => {
      if (command.type === "observe") {
        // fixture rule (DESIGN bench/scenarios §2): transient affordances relax over one second; stable cue/yield beliefs do not drift.
        state = { ...state, minds: state.minds.map((mind) => ({ ...mind, memory: { ...mind.memory,
          beliefs: driftBeliefs(mind.memory.beliefs, FIXTURE.epochMs / 1000, (entry) => ({ q: 0,
            halfLifeSeconds: entry.attribute.startsWith("available:") ? 1 : Infinity })),
        } })) };
      }
      const configured = command.type === "decide" ? forecast(config, state.minds[0].needs) : config;
      return reduceMinds(state, command, { forager: configured });
    });
    const memory = initialMemory(patches);
    this.id = this.runner.run({ type: "addMind", mind: { config: "forager", memory, needs: initialNeeds(memory), params: PARAMS,
      capacityFunctional: 1, context: {} } }).added!;
    this.runner.log = [];
    this.runner.events = [];
  }

  snapshot() { return this.v2 ? { core: this.runner.state, personality: structuredClone(this.v2.model.state) } : this.runner.state; }
  restore(state: unknown) {
    if (this.v2) {
      const saved = state as { core: MindsState; personality: V2State };
      this.runner.state = saved.core;
      this.v2.model.state.minds = structuredClone(saved.personality.minds);
    } else this.runner.state = state as MindsState;
    this.runner.log = []; this.runner.events = [];
  }

  decide(sensor: Sensor, hunger: number, t: number, position: string) {
    this.hooks = [];
    this.v2?.begin(t, this.id);
    const mind = this.runner.state.minds[0];
    this.sensed = sensor({ beliefs: mind.memory.beliefs, needs: mind.needs, params: mind.params }, this.personality,
      (context) => { this.context = context; });
    if (this.v2) {
      this.v2.cues = this.sensed.attention.cues.map(cue => this.sensed!.metadata.find(c => c.cue === cue) ?? {
        cue, domain: "space", tags: this.sensed!.observations.some(o => o.cue === cue && o.channel === "touch") ? ["present"] : [],
      });
      this.v2.shares = this.sensed.attention.shares;
    }
    this.observationTrace = this.runner.run({ type: "observe", mind: this.id, t, observations: this.sensed.observations }).observationTrace!;
    this.runner.run({ type: "tickNeeds", mind: this.id, inputs: { signals: { "body.hunger_signal": hunger },
      elapsedSeconds: FIXTURE.epochMs / 1000, outcomeTags: [], cues: [] } });
    // fixture rule (DESIGN bench/scenarios §2): retrieve kind episodes using the most likely perceived colour at own location.
    const colour = getBelief(this.runner.state.minds[0].memory.beliefs, position, "colour");
    const value = colour?.kind === "categorical" ? colour.values[colour.probabilities.indexOf(Math.max(...colour.probabilities))] : undefined;
    const kind = data.kinds.find((kind) => kind.cues.some((cue) => cue.attribute === "colour" && cue.value === value))?.id ?? "unknown";
    this.runner.run({ type: "decide", mind: this.id, t, context: { kind } });
    this.selection = this.runner.state.minds[0].decisions.at(-1)!;
    if (this.v2) { const current = this.runner.state.minds[0]; this.v2.finish({ beliefs: current.memory.beliefs, needs: current.needs, params: current.params }, FIXTURE.epochMs / 1000); }
    return { intention: this.selection.intention, metadata: this.sensed.metadata };
  }

  learn(observations: readonly Observation[], t: number): ProcessingTrace {
    const selection = this.selection!, sensed = this.sensed!;
    this.runner.run({ type: "outcome", event: `s1.outcome.${t}`, cause: qualify("cognition", selection.intention.id),
      intention: selection.intention.id, t, feedback: { observations } });
    const learning = this.runner.state.minds[0].learning.at(-1)!;
    // Host diagnostics live in the epoch log, as in hungry-pair; do not repeatedly clone completed traces.
    this.runner.state = { ...this.runner.state, minds: this.runner.state.minds.map((mind) => ({ ...mind,
      decisions: [], learning: [], intentions: mind.intentions.filter((pending) => pending.outcomeEvent === undefined),
    })) };
    this.runner.log = [];
    this.runner.events = [];
    return { ...(this.v2 ? { v2: structuredClone(this.v2.trace) } : {}), attention: sensed.attention, interpretation: sensed.interpretation, selection,
      candidates: selection.inputs.generation.candidates,
      evaluation: selection.candidates.map((row) => ({ action: row.candidate.action, target: row.candidate.target, expectedUtility: row.expectedUtility })),
      // Copy public subjective diagnostics into the existing host epoch trace.
      beliefDeltas: learning.updates, observationBeliefDeltas: this.observationTrace!.updates, learning, hooks: this.hooks };
  }
}
