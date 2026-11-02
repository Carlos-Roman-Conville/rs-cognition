// Subjective adapter: public engine state and hooks only; never receives workshop state or hidden defects.
import { canonical, qualify, Runner, streams } from "@rex/kernel";
import {
  createEightFunctionV1, createMindsState, driftBeliefs, nullPersonality, reduceMinds,
} from "../../../src/index.ts";
import type {
  CognitionEmission, LearningTrace, MindCommand, MindResult, MindsState, Observation, PersonalityModel,
  PersonalityType, ObservationTrace, SelectionTrace, V1Context,
} from "../../../src/index.ts";
import { ETA_MIN } from "../../personality-models.ts";
import { FIXTURE } from "./models.ts";
import { forecast, initialMemory, initialNeeds, makeConfig, PARAMS } from "./models.ts";
import type { Sensor, Sensed } from "./perception.ts";

import { shuffledV1 } from "../controls.ts";
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

export class Worker {
  readonly runner;
  readonly personality: PersonalityModel;
  readonly id: string;
  private context: V1Context = {};
  private hooks: HookCall[] = [];
  private sensed?: Sensed;
  private selection?: SelectionTrace;
  private observationTrace?: ObservationTrace;

  constructor(seed: number, tasks: readonly string[], configuration: Configuration = { version: "null" }, override?: PersonalityModel, kappa = 0) {
    let model: PersonalityModel = nullPersonality;
    if (configuration.version !== "null") {
      if (configuration.version !== "v1" || !configuration.stack) throw new Error(`S3 requires an explicit context adapter for ${configuration.version}`);
      // fixture rule (DESIGN bench/scenarios section 4): same frozen factory/etaMin as personality-versions, plus S3 cue metadata.
      model = createEightFunctionV1(configuration.stack, { etaMin: ETA_MIN, context: () => this.context });
    }
    if (configuration.control === "shuffled") model = shuffledV1(model,
      streams(seed).get("bench.control.shuffle", "scenario"),
      { get: () => this.context, set: (context) => { this.context = context; } });
    if (override) model = override;
    const record = (hook: HookCall["hook"], before: object, after: object, domain?: string) => {
      const b = jsonValue(before) as Record<string, unknown>, a = jsonValue(after) as Record<string, unknown>;
      this.hooks.push({ hook, domain, before: b, after: a, formulaIds: null,
        changed: Object.keys(b).filter((key) => canonical(b[key]) !== canonical(a[key])) });
    };
    this.personality = { id: model.id, version: model.version,
      pertinence: (base, view) => { const result = model.pertinence(base, view); record("pertinence", base, result); return result; },
      interpret: (base, domain, view) => { const result = model.interpret(base, domain, view); record("interpret", base, result, domain); return result; },
      generate: (candidates, base, view) => { const result = model.generate(candidates, base, view);
        record("generate", { candidates, params: base }, result); return result; },
      learning: (base, domain, view) => { const result = model.learning(base, domain, view); record("learning", base, result, domain); return result; },
    };
    const config = { ...makeConfig(tasks), personality: this.personality };
    this.runner = new Runner<MindsState, MindCommand, MindResult, CognitionEmission>(createMindsState(seed), (state, command) => {
      if (command.type === "observe") {
        // fixture rule (DESIGN bench/scenarios section 4): proposed transient affordance/progress half-life .01s; quality/readiness priors do not drift.
        state = { ...state, minds: state.minds.map((mind) => ({ ...mind, memory: { ...mind.memory,
          beliefs: driftBeliefs(mind.memory.beliefs, FIXTURE.epochMs / 1000, (entry) => ({ q: 0,
            halfLifeSeconds: entry.attribute.startsWith("available:") || entry.attribute === "progress" ? 0.01 : Infinity })),
        } })) };
      }
      const configured = command.type === "decide" ? forecast(config, state.minds[0].needs) : config;
      return reduceMinds(state, command, { worker: configured });
    });
    const memory = initialMemory(tasks);
    this.id = this.runner.run({ type: "addMind", mind: { config: "worker", memory, needs: initialNeeds(memory), params: { ...PARAMS, kappa },
      capacityFunctional: 1, context: {} } }).added!;
    this.runner.log = [];
    this.runner.events = [];
  }

  snapshot() { return this.runner.state; }
  restore(state: unknown) { this.runner.state = state as MindsState; this.runner.log = []; this.runner.events = []; }

  decide(sensor: Sensor, hunger: number, t: number, _position: string) {
    this.hooks = [];
    const mind = this.runner.state.minds[0];
    this.sensed = sensor({ beliefs: mind.memory.beliefs, needs: mind.needs, params: mind.params }, this.personality,
      (context) => { this.context = context; });
    this.observationTrace = this.runner.run({ type: "observe", mind: this.id, t, observations: this.sensed.observations }).observationTrace!;
    this.runner.run({ type: "tickNeeds", mind: this.id, inputs: { signals: { "body.hunger_signal": hunger },
      elapsedSeconds: FIXTURE.epochMs / 1000, outcomeTags: [], cues: [] } });
    this.runner.run({ type: "decide", mind: this.id, t, context: {} });
    this.selection = this.runner.state.minds[0].decisions.at(-1)!;
    return { intention: this.selection.intention, metadata: this.sensed.metadata, testimony: this.sensed.testimony };
  }

  learn(observations: readonly Observation[], t: number, ongoing = false): ProcessingTrace {
    const selection = this.selection!, sensed = this.sensed!;
    this.runner.run({ type: "outcome", event: `s3.outcome.${t}`, cause: qualify("cognition", selection.intention.id),
      intention: selection.intention.id, t, feedback: { observations } });
    const learning = this.runner.state.minds[0].learning.at(-1)!;
    // section 4 host multi-step adapter: renew the active continuation after step feedback;
    // retain its pending trace so the unchanged engine can keep it under kappa on the next epoch.
    // Host diagnostics live in the epoch log, as in hungry-pair; do not repeatedly clone completed traces.
    this.runner.state = { ...this.runner.state, minds: this.runner.state.minds.map((mind) => ({ ...mind,
      current: ongoing && mind.current ? { ...mind.current, status: "active" as const } : mind.current,
      decisions: [], learning: [], intentions: ongoing ? [{ intention: { ...selection.intention, status: "active" as const }, trace: selection }] : [],
    })) };
    this.runner.log = [];
    this.runner.events = [];
    return { attention: sensed.attention, interpretation: sensed.interpretation, selection,
      candidates: selection.inputs.generation.candidates,
      evaluation: selection.candidates.map((row) => ({ action: row.candidate.action, target: row.candidate.target, expectedUtility: row.expectedUtility })),
      // Copy public subjective diagnostics into the existing host epoch trace.
      beliefDeltas: learning.updates, observationBeliefDeltas: this.observationTrace!.updates, learning, hooks: this.hooks };
  }
}
