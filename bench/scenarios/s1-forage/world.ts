// Host world only. Cognition selects intentions; this file resolves them without reading subjective state.
import { canonical, qualify, restore, streams, take } from "@rex/kernel";
import type { Snapshot } from "@rex/kernel";
import type { Intention, PersonalityModel } from "../../../src/index.ts";
import { Forager } from "./cognition.ts";
import type { Configuration, ProcessingTrace } from "./cognition.ts";
import { clamp, distance, drawYield, FIXTURE, kindOf, makeGrid } from "./field.ts";
import type { FieldState, Patch } from "./field.ts";
import { makeSensor, perceiveResult } from "./perception.ts";
import type { CueMetadata } from "./perception.ts";

export interface RunOptions { seed: number; epochs?: number; configuration?: Configuration; patches?: Patch[]; personality?: PersonalityModel }
export interface HostOutcome {
  action: string; target?: string; success: boolean; food: number; result: string;
  from: string; to: string; novelVisit: boolean; visit: boolean;
}
export interface EpochLog {
  mind: string; epoch: number; t: number; before: FieldState; after: FieldState;
  cues: CueMetadata[]; intention: Intention; outcome: HostOutcome; trace: ProcessingTrace;
}

export class ForageWorld {
  readonly random;
  readonly agent: Forager;
  readonly initial: Snapshot;
  readonly options: RunOptions;
  readonly hostInputLog: EpochLog[] = [];
  state: FieldState;
  constructor(options: RunOptions) {
    if (!Number.isSafeInteger(options.seed) || !Number.isSafeInteger(options.epochs ?? FIXTURE.epochs) || (options.epochs ?? FIXTURE.epochs) < 1) throw new RangeError("Invalid seed/epochs");
    this.options = options;
    this.random = streams(options.seed);
    // fixture rule (DESIGN bench/scenarios §2): one forager, top-left start, initial placement counts as a visit.
    const id = qualify("cognition", "mind.0001");
    const patches = structuredClone(options.patches ?? makeGrid(this.random.get("fixture.s1.layout", id)));
    if (!patches.length || new Set(patches.map((p) => p.id)).size !== patches.length || new Set(patches.map((p) => `${p.x},${p.y}`)).size !== patches.length) throw new RangeError("Invalid patches");
    patches.forEach(kindOf);
    this.state = { epoch: 0, patches, position: patches[0].id, visited: [patches[0].id], hunger: FIXTURE.hunger, food: 0 };
    this.agent = new Forager(options.seed, patches.map((p) => p.id), options.configuration, options.personality);
    this.initial = take(this.participants(), { version: 2, t: 0, epoch: null, epochLabel: "s1-forage", catalogue_hash: null,
      seed: options.seed, eventCounter: 0, rng: this.random.state() });
  }

  private participants() {
    return [{ id: "world", snapshot: () => this.state, restore: (state: unknown) => { this.state = state as FieldState; } },
      { id: "minds", snapshot: () => this.agent.snapshot(), restore: (state: unknown) => this.agent.restore(state) }];
  }

  resolve(intention: Pick<Intention, "action" | "target">, yields: readonly number[]): HostOutcome {
    const from = this.state.position;
    const here = this.state.patches.find((p) => p.id === from)!;
    const target = this.state.patches.find((p) => p.id === intention.target);
    let success = false, food = 0, visit = false;
    this.state.targeted = undefined;
    // fixture rule (DESIGN bench/scenarios §2): only legal host moves/inspections/gathers succeed, even under mistaken beliefs.
    if (intention.action === "move" && target && distance(here, target) === 1) {
      this.state.position = target.id; success = true; visit = true;
    } else if (intention.action === "inspect" && target && distance(here, target) <= 1) {
      this.state.targeted = target.id; success = true;
    } else if (intention.action === "gather" && target?.id === here.id) {
      food = yields[this.state.patches.indexOf(target)]; success = true;
      // fixture rule (DESIGN bench/scenarios §2): consume gathered food immediately, applying DESIGN §6's relief per unit.
      this.state.food += food; this.state.hunger = clamp(this.state.hunger - FIXTURE.relief * food);
    } else if (intention.action === "wait") success = true;
    if (success && target && ["move", "gather"].includes(intention.action) && !this.state.visited.includes(target.id)) this.state.visited.push(target.id);
    return { action: intention.action, target: intention.target, from, to: this.state.position, success, food, visit,
      novelVisit: visit && !!target && kindOf(target).novel,
      result: success ? intention.action === "gather" ? String(food) : "done" : "failed" };
  }

  step() {
    const before = structuredClone(this.state);
    this.state.epoch++;
    const t = this.state.epoch * FIXTURE.epochMs;
    const mind = qualify("cognition", this.agent.id);
    // fixture rule (DESIGN bench/scenarios §2): hunger increases by Δ/day; no other body needs.
    this.state.hunger = clamp(this.state.hunger + FIXTURE.epochMs / FIXTURE.dayMs);
    // fixture rule (DESIGN bench/scenarios §2): draw every patch every epoch, regardless of chosen action (common random numbers).
    const yieldRng = this.random.get("fixture.s1.yield", mind);
    const yields = this.state.patches.map((patch) => drawYield(patch, yieldRng()));
    const rng = this.random.get("cognition.perception.detect", mind);
    const decision = this.agent.decide(makeSensor(this.state, t, rng), this.state.hunger, t, this.state.position);
    const outcome = this.resolve(decision.intention, yields);
    const trace = this.agent.learn(perceiveResult(outcome.result, t, rng), t);
    this.hostInputLog.push({ mind, epoch: this.state.epoch, t, before, after: structuredClone(this.state),
      cues: decision.metadata, intention: decision.intention, outcome, trace });
  }

  run() {
    while (this.state.epoch < (this.options.epochs ?? FIXTURE.epochs)) this.step();
    return { scenario: "s1-forage", seed: this.options.seed, configuration: this.options.configuration ?? { version: "null" },
      initial: this.initial, hostInputLog: this.hostInputLog, final: this.state, rng: this.random.state() };
  }

  replay(initial: Snapshot = this.initial) {
    const replay = new ForageWorld(this.options);
    const kernel = restore(replay.participants(), initial);
    replay.random.restore(kernel.rng);
    const result = replay.run();
    if (JSON.stringify(result.hostInputLog) !== JSON.stringify(this.hostInputLog) || canonical(result.final) !== canonical(this.state) ||
        canonical(result.rng) !== canonical(this.random.state()) || canonical(replay.agent.snapshot()) !== canonical(this.agent.snapshot())) {
      throw new Error("S1 initial-snapshot replay mismatch");
    }
    return result;
  }
}

export function runForage(options: RunOptions) {
  const world = new ForageWorld(options);
  const result = world.run();
  world.replay();
  return { ...result, replayed: true };
}
