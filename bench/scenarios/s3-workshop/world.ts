// Host outcomes only: no belief or policy reads.
import { canonical, restore, streams, take } from "@rex/kernel";
import type { Snapshot } from "@rex/kernel";
import type { Intention, PersonalityModel } from "../../../src/index.ts";
import { Worker } from "./cognition.ts";
import type { Configuration, ProcessingTrace } from "./cognition.ts";
import { FIXTURE, clamp } from "./models.ts";
import { makeSensor, perceiveResult } from "./perception.ts";
import type { CueMetadata, Sensed } from "./perception.ts";
export interface Task { id: string; steps: number; defects: boolean[]; finished: boolean }
export interface WorkshopState { epoch: number; tasks: Task[]; active: string; hunger: number; reliability: number; instruction: boolean }
export interface HostOutcome { action: string; target?: string; task: string; success: boolean; result: string; revealed: boolean | null; completed: boolean; switched: boolean; ongoing: boolean }
export interface EpochLog { mind: string; epoch: number; t: number; before: WorkshopState; after: WorkshopState; cues: CueMetadata[]; intention: Intention; outcome: HostOutcome; testimony: Sensed["testimony"]; trace: ProcessingTrace }
export interface RunOptions { seed: number; epochs?: number; configuration?: Configuration; personality?: PersonalityModel; kappa?: number; taskIds?: [string, string]; label?: string }
export class WorkshopWorld {
  readonly random;
  readonly agent: Worker;
  readonly initial: Snapshot;
  readonly hostInputLog: EpochLog[] = [];
  state: WorkshopState;
  readonly options: RunOptions;
  constructor(options: RunOptions) {
    this.options = options;
    if (!Number.isSafeInteger(options.seed) || !Number.isSafeInteger(options.epochs ?? 16) || (options.epochs ?? 16) < 1) throw new RangeError("Invalid seed/epochs");
    this.random = streams(options.seed);
    const taskIds = options.taskIds ?? ["A", "B"];
    if (new Set(taskIds).size !== 2) throw new RangeError("Two distinct tasks required");
    // section 10.4 Bernoulli half probability, not forced balance in small samples. Stable slot stream preserves id-swap symmetry.
    const reliability = this.random.get("s3.foreman", "workshop")() < 0.5 ? 0.9 : 0.4;
    this.state = { epoch: 0, tasks: taskIds.map(id => ({ id, steps: 0, defects: [], finished: false })), active: taskIds[0], hunger: FIXTURE.hunger, reliability, instruction: true };
    this.agent = new Worker(options.seed, taskIds, options.configuration, options.personality, options.kappa ?? 0);
    this.initial = take(this.participants(), { version: 2, t: 0, epoch: null, epochLabel: "s3-workshop", catalogue_hash: null, seed: options.seed, eventCounter: 0, rng: this.random.state() });
  }
  private participants() {
    return [{ id: "world", snapshot: () => this.state, restore: (s: unknown) => { this.state = s as WorkshopState; } },
      { id: "minds", snapshot: () => this.agent.snapshot(), restore: (s: unknown) => this.agent.restore(s) }];
  }
  resolve(intention: Pick<Intention, "action" | "target">, defects: readonly boolean[]): HostOutcome {
    const task = this.state.tasks.find(task => task.id === this.state.active)!;
    const target = this.state.tasks.find(task => task.id === intention.target);
    let success = false, revealed: boolean | null = null, completed = false, switched = false;
    if (intention.action === "continue" && target === task && !task.finished) {
      task.defects.push(defects[this.state.tasks.indexOf(task)]); task.steps++; success = true;
      // section 4 proposed contract: pay on delivery after four attempted steps. Hidden quality does not leak via payment.
      if (task.steps === FIXTURE.steps) { task.finished = true; completed = true; this.state.hunger = clamp(this.state.hunger - FIXTURE.relief); }
    } else if (intention.action === "switch" && target && target !== task && !target.finished) {
      this.state.active = target.id; success = true; switched = true;
    } else if (intention.action === "verify" && task.steps > 0) {
      revealed = task.defects[task.steps - 1]; success = true;
      // section 4 proposed repair semantics: verification flags the last defect; a subsequent continue retries it.
      if (revealed && !task.finished) { task.steps--; task.defects.pop(); }
    } else if (intention.action === "ask" && intention.target === "foreman" || intention.action === "wait") success = true;
    return { action: intention.action, target: intention.target, task: task.id, success, revealed, completed, switched,
      result: success ? "done" : "failed", ongoing: intention.action === "continue" && success && !task.finished };
  }
  step() {
    const before = structuredClone(this.state);
    this.state.epoch++;
    const t = this.state.epoch * FIXTURE.epochMs;
    // section 4 proposed hunger accrual .01/epoch; fixed per-slot draws preserve common random numbers.
    this.state.hunger = clamp(this.state.hunger + 0.01);
    const rngDefect = this.random.get("s3.defect", "workshop");
    const defects = this.state.tasks.map(() => rngDefect() < FIXTURE.pDefect);
    this.state.instruction = this.random.get("s3.foreman", "workshop")() < this.state.reliability;
    const rng = this.random.get("cognition.perception.detect", "workshop");
    const decision = this.agent.decide(makeSensor(this.state, t, rng), this.state.hunger, t, this.state.active);
    const outcome = this.resolve(decision.intention, defects);
    const trace = this.agent.learn(perceiveResult(outcome, t, rng), t, outcome.ongoing);
    this.hostInputLog.push({ mind: this.options.label ?? "worker", epoch: this.state.epoch, t, before, after: structuredClone(this.state), cues: decision.metadata,
      intention: decision.intention, testimony: decision.testimony, outcome, trace });
  }
  run() {
    while (this.state.epoch < (this.options.epochs ?? FIXTURE.epochs)) this.step();
    return { scenario: "s3-workshop", seed: this.options.seed, configuration: this.options.configuration ?? { version: "null" },
      header: { kappa: this.options.kappa ?? 0 }, initial: this.initial, hostInputLog: this.hostInputLog, final: this.state, rng: this.random.state() };
  }
  replay(initial = this.initial) {
    const replay = new WorkshopWorld(this.options);
    replay.random.restore(restore(replay.participants(), initial).rng);
    const result = replay.run();
    if (JSON.stringify(result.hostInputLog) !== JSON.stringify(this.hostInputLog) || canonical(result.rng) !== canonical(this.random.state()) || canonical(replay.agent.snapshot()) !== canonical(this.agent.snapshot())) throw new Error("S3 initial-snapshot replay mismatch");
    return result;
  }
}
export function runWorkshop(options: RunOptions) { const world = new WorkshopWorld(options); const run = world.run(); world.replay(); return { ...run, replayed: true }; }
