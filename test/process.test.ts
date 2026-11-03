import { canonical, defaultOrder, EventBus, Runner, Scheduler, streams } from "@rex/kernel";
import type { KernelEvent, Process, ProcessOrder } from "@rex/kernel";
import { describe, expect, it } from "vitest";
import declaration from "../kernel.json" with { type: "json" };
import { createMindsState, MindsRunner, reduceMinds } from "../src/mind.ts";
import type { MindCommand } from "../src/mind.ts";
import { CognitionProcess } from "../src/process.ts";
import type { CognitionEpoch, CognitionProcessState } from "../src/process.ts";
import { configs, mindInput, observed } from "./composition-fixtures.ts";

// Kernel default phases intentionally have empty process lists; the host declares membership.
const order: ProcessOrder = { phases: defaultOrder.phases,
  order: { ...defaultOrder.order, cognition: ["cognition.tick"], host: ["toy.resolve"] } };
const epoch = (): CognitionEpoch => ({ observations: [], capacityFunctional: 1, context: {},
  needs: { signals: {}, elapsedSeconds: 1, outcomeTags: [], cues: [] } });

function setup(count = 2, commitment = 0) {
  const bus = new EventBus();
  const runner = new MindsRunner(createMindsState(29), configs);
  for (let i = 0; i < count; i++) {
    const input = mindInput();
    runner.run({ type: "addMind", mind: { ...input, params: { ...input.params!, kappa: commitment } } });
  }
  const seen: string[] = [];
  const decoded: string[] = [];
  const process = new CognitionProcess({ runner, bus, period: 1000, outcomeTypes: ["toy.outcome"],
    epoch: (mind, t, _dt, perception) => {
      seen.push(`${t}:${mind.id}:${perception()}`);
      return epoch();
    },
    readOutcome: (event) => { decoded.push(event.id); return { observations: [observed(event.t)] }; },
  });
  const scheduler = new Scheduler({ order, emit: bus.emit });
  scheduler.register(process);
  let cursor = 0;
  const host: Process = { id: "toy.resolve", phase: "host", period: 1000, mechanisms: [], run(ctx) {
    const events = bus.since(cursor, { t: ctx.t, phase: defaultOrder.phases.indexOf("host"), position: 0 });
    for (const event of events) {
      if (event.type === "cognition.intention") ctx.emit("toy.outcome", { perceivedReply: "no" }, event.id);
    }
    cursor += events.length;
  } };
  scheduler.register(host);
  return { bus, runner, process, scheduler, seen, decoded };
}

describe("cognition.tick (DESIGN §4, §7; kernel DESIGN §2.3, §8)", () => {
  it("runs in default cognition/host phase order, resolves event causes and learns on the next epoch", () => {
    const { scheduler, runner, bus, process } = setup();
    scheduler.runUntil(1000);
    const first = bus.since().filter((event) => event.type !== "cognition.decision");
    expect(first.map((event) => event.type)).toEqual(["cognition.intention", "cognition.intention", "toy.outcome", "toy.outcome"]);
    expect(first[2].cause).toBe(first[0].id);
    expect(runner.state.minds.every((mind) => mind.memory.episodes.length === 0)).toBe(true);
    scheduler.runUntil(2000);
    expect(runner.state.minds.every((mind) => mind.memory.episodes.length === 1)).toBe(true);
    expect(runner.state.ignoredOutcomes).toEqual([]);
    const attributions = bus.since().filter((event) => event.type === "cognition.attribution");
    expect(attributions.map((event) => event.cause)).toEqual(first.slice(2).map((event) => event.id));
    expect(bus.since().slice(0, process.state().cursor).filter((event) => event.type !== "cognition.decision")).toHaveLength(4);
    expect(process.state().intentions.map((entry) => entry.event)).toEqual(first.slice(0, 2).map((event) => event.id));
    expect(attributions[0].payload).toMatchObject({ attributedCause: "generosity" });
  });

  it("replays process-issued commands and events without callbacks or functions in the log", () => {
    const { scheduler, runner } = setup();
    scheduler.runUntil(4000);
    const log: MindCommand[] = JSON.parse(JSON.stringify(runner.log));
    const replay = Runner.replay(log, (state, command) => reduceMinds(state, command, configs), undefined, createMindsState(29));
    expect(canonical(replay.state)).toBe(canonical(runner.state));
    expect(canonical(replay.events)).toBe(canonical(runner.events));
    expect(log.filter((command) => command.type === "observe").every((command) => command.perceptionState !== undefined)).toBe(true);
    expect(log.filter((command) => command.type === "tickNeeds").map(command => command.t))
      .toEqual([1000, 1000, 2000, 2000, 3000, 3000, 4000, 4000]);
  });

  it("settles adapter-empty technical feedback without attribution or episodes and decides again at the next epoch", () => {
    const { runner, bus } = setup(1, 10);
    const process = new CognitionProcess({ runner, bus, period: 1000, epoch,
      outcomeTypes: ["toy.technical"], readOutcome: () => ({ observations: [] }) });
    const scheduler = new Scheduler({ order, emit: bus.emit }).register(process);
    scheduler.runUntil(1000);
    const before = structuredClone(runner.state.minds[0]);
    const intention = bus.since().find(event => event.type === "cognition.intention")!;
    bus.emit({ t: 1000, phase: 2, position: 0, source: "toy.resolve", type: "toy.technical",
      payload: { reason: "technical" }, cause: intention.id });
    scheduler.runUntil(2000);
    const after = runner.state.minds[0];
    expect(canonical(after.memory)).toBe(canonical(before.memory));
    expect(after.learning).toEqual([]);
    expect(after.intentions[0].outcomeEvent).toBeDefined();
    expect(after.intentions[0].intention.status).toBe("failed");
    expect(after.current!.id).not.toBe(before.current!.id);
    expect(bus.since().filter(event => event.type === "cognition.intention")).toHaveLength(2);
    expect(bus.since().filter(event => event.type === "cognition.attribution")).toEqual([]);
  });

  it("has canonical-identical scheduler traces on repeat runs and independent sensory/selection streams", () => {
    const two = setup(2);
    const repeated = setup(2);
    const three = setup(3);
    for (const run of [two, repeated, three]) run.scheduler.runUntil(3000);
    expect(canonical(two.bus.state())).toBe(canonical(repeated.bus.state()));
    expect(canonical(two.runner.state)).toBe(canonical(repeated.runner.state));
    expect(three.seen.filter((entry) => !entry.includes("mind.0003"))).toEqual(two.seen);
    for (let i = 0; i < 2; i++) {
      expect(three.runner.state.minds[i].decisions.map((trace) => trace.draw))
        .toEqual(two.runner.state.minds[i].decisions.map((trace) => trace.draw));
    }
    const reference = streams(29);
    expect(two.runner.state.minds[0].decisions[0].draw)
      .toBe(reference.get("cognition.decision.select", "cognition/mind.0001")());
    expect(two.seen.map((entry) => entry.split(":").slice(0, 2).join(":")))
      .toEqual(["1000:mind.0001", "1000:mind.0002", "2000:mind.0001", "2000:mind.0002", "3000:mind.0001", "3000:mind.0002"]);
  });

  it("ignores unknown event causes, including a local intention id masquerading as an event id", () => {
    const { scheduler, bus, runner, decoded } = setup(1);
    scheduler.runUntil(1000);
    for (const cause of ["evt.unknown", runner.state.minds[0].current!.id]) {
      bus.emit({ t: 1000, phase: 2, position: 0, source: "toy.resolve", type: "toy.outcome", payload: null, cause });
    }
    scheduler.runUntil(2000);
    expect(decoded).toHaveLength(1);
    expect(runner.state.minds[0].memory.episodes).toHaveLength(1);
    expect(runner.state.ignoredOutcomes.map((entry) => entry.reason)).toEqual(["unknown cause", "unknown cause"]);
  });

  it("advances past unrelated events and never learns twice from duplicate outcomes", () => {
    const { scheduler, bus, runner, process, decoded } = setup(1);
    scheduler.runUntil(1000);
    const intention = bus.since().find((event) => event.type === "cognition.intention")!;
    bus.emit({ t: 1000, phase: 2, position: 0, source: "toy.resolve", type: "toy.unrelated", payload: {}, cause: intention.id });
    bus.emit({ t: 1000, phase: 2, position: 0, source: "toy.resolve", type: "toy.outcome", payload: {}, cause: intention.id });
    scheduler.runUntil(2000);
    expect(runner.state.minds[0].memory.episodes).toHaveLength(1);
    expect(runner.state.ignoredOutcomes[0].reason).toBe("duplicate outcome");
    expect(decoded).toHaveLength(1);
    expect(bus.since().slice(0, process.state().cursor).filter((event) => event.type !== "cognition.decision")).toHaveLength(4);
  });

  it("does not publish a second intention while commitment remains unresolved", () => {
    const { runner, bus } = setup(1, 10);
    const process = new CognitionProcess({ runner, bus, period: 1000, epoch,
      outcomeTypes: [], readOutcome: () => { throw new Error("No outcomes"); } });
    const scheduler = new Scheduler({ order, emit: bus.emit }).register(process);
    scheduler.runUntil(3000);
    expect(bus.since().filter((event) => event.type === "cognition.intention")).toHaveLength(1);
    expect(runner.state.minds[0].decisions).toHaveLength(3);
    expect(runner.state.minds[0].decisions.slice(1).every((trace) => trace.commitment.kept)).toBe(true);
  });

  it("restores the event cursor and cause mapping alongside Runner and EventBus", () => {
    const original = setup(1);
    original.scheduler.runUntil(2000);
    const restoredBus = new EventBus();
    restoredBus.restore(JSON.parse(JSON.stringify(original.bus.state())));
    const runner = new MindsRunner(JSON.parse(JSON.stringify(original.runner.state)), configs);
    const from: CognitionProcessState = JSON.parse(JSON.stringify(original.process.state()));
    const restored = new CognitionProcess({ runner, bus: restoredBus, period: 1000, from,
      epoch: (_mind, _t, _dt, perception) => { perception(); return epoch(); },
      outcomeTypes: ["toy.outcome"], readOutcome: (event) => ({ observations: [observed(event.t)] }) });
    // Compare before the host's next resolution: both queues contain identical outstanding outcomes.
    const runRestored = new Scheduler({ order, start: 2000, emit: restoredBus.emit }).register(restored);
    runRestored.runUntil(3000);
    original.scheduler.runUntil(3000);
    expect(canonical(runner.state)).toBe(canonical(original.runner.state));
    expect(canonical(restored.state())).toBe(canonical(original.process.state()));
    const withoutNewestHost = original.bus.since().filter((event) => !(event.t === 3000 && event.source === "toy.resolve"));
    expect(canonical(restoredBus.since())).toBe(canonical(withoutNewestHost));
  });

  it("uses host period Δ and rejects a zero period", () => {
    const { runner, bus } = setup(0);
    const options = { runner, bus, epoch, outcomeTypes: [], readOutcome: (_event: KernelEvent) => ({ observations: [] }) };
    expect(() => new CognitionProcess({ ...options, period: 0 })).toThrow("positive");
    const process = new CognitionProcess({ ...options, period: 2345 });
    expect(process.period).toBe(2345);
    expect(process.phase).toBe("cognition");
    expect(defaultOrder.phases.indexOf("cognition")).toBeLessThan(defaultOrder.phases.indexOf("host"));
  });

  it("declares kernel §8 process/port/stream shape, with only owned writes and mechanism-only streams", () => {
    const process = declaration.processes[0];
    expect(process.id).toBe("cognition.tick");
    expect(process.phase).toBe("cognition");
    expect(process.period).toBe("host");
    expect(process.writes).toHaveLength(14);
    expect(new Set(process.writes).size).toBe(14);
    expect(process.reads).toEqual(expect.arrayContaining(["body.detectability", "body.hunger_signal", "body.pain", "body.capacity_functional"]));
    for (const port of declaration.ports) {
      expect(process.mechanisms).toContain(port.mechanism);
      expect(port.direction === "output" ? process.writes : process.reads).toContain(port.quantity);
      expect(port.unit === null ? port.kind : port.unit).toBe(port.unit === null ? "record" : "1");
      if (port.direction === "output") expect(port.quantity.startsWith("mind.")).toBe(true);
    }
    expect(declaration.streams).toEqual(["cognition.perception.detect", "cognition.memory.retrieve", "cognition.decision.select"]);
    for (const id of declaration.streams) {
      expect(process.mechanisms).toContain(id === "cognition.memory.retrieve" ? "cognition.memory.episodic" : id);
      expect(id).not.toMatch(/@|\//);
    }
  });
});
