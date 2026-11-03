import { canonical, Runner } from "@rex/kernel";
import { describe, expect, it } from "vitest";
import { createMindsState, MindsRunner, reduceMinds } from "../src/mind.ts";
import type { MindCommand } from "../src/mind.ts";
import { evaluateNeeds } from "../src/needs.ts";
import { configs, mindInput, observed, offer } from "./composition-fixtures.ts";

function setup(count = 1) {
  const runner = new MindsRunner(createMindsState(72), configs);
  for (let i = 0; i < count; i++) runner.run({ type: "addMind", mind: mindInput() });
  return runner;
}
const decide = (runner: MindsRunner, mind = "mind.0001", t = 1000) => runner.run({ type: "decide", mind, t });
function outcome(runner: MindsRunner, intention = runner.state.minds[0].current!.id, event = "evt.2") {
  return runner.run({ type: "outcome", intention, cause: "evt.1", event, t: 2000,
    feedback: { observations: [observed(2000)] } });
}

describe("population reducer (DESIGN §4, §7)", () => {
  it("mints mind, belief, intention and episode ids once in population order", () => {
    const runner = setup(2);
    expect(runner.state.minds.map((mind) => mind.id)).toEqual(["mind.0001", "mind.0002"]);
    expect(runner.state.minds.map((mind) => mind.beliefIds[0].id)).toEqual(["bel.0001", "bel.0002"]);
    const first = decide(runner).events.find((event) => event.type === "cognition.intention");
    expect(first).toMatchObject({ type: "cognition.intention", payload: { id: "cognition/int.0001", mind: "cognition/mind.0001" } });
    decide(runner, "mind.0002");
    const learned = outcome(runner);
    expect(learned.events[0]).toMatchObject({ type: "cognition.attribution", cause: "evt.2" });
    expect(runner.state.minds[0].memory.episodes[0].id).toBe("ep.0001");
    expect(runner.state.counters).toEqual({ mind: 2, bel: 2, int: 2, ep: 1 });
  });

  it("replays the JSON-roundtripped Runner log from initial state canonically, including ignored outcomes", () => {
    const initial = createMindsState(72);
    const runner = setup();
    runner.run({ type: "observe", mind: "mind.0001", t: 500, observations: [observed(500)], perceptionState: 42 });
    decide(runner);
    outcome(runner);
    outcome(runner, "int.unknown", "evt.unknown");
    decide(runner, "mind.0001", 3000);
    const log: MindCommand[] = JSON.parse(JSON.stringify(runner.log));
    const replay = Runner.replay(log, (state, command) => reduceMinds(state, command, configs), undefined, initial);
    expect(canonical(replay.state)).toBe(canonical(runner.state));
    expect(canonical(replay.events)).toBe(canonical(runner.events));
  });

  it("adding a third mind leaves the first two decision draws and stream states unchanged", () => {
    const two = setup(2);
    const three = setup(3);
    for (let t = 1000; t <= 8000; t += 1000) {
      for (const runner of [two, three]) for (const mind of runner.state.minds) decide(runner, mind.id, t);
    }
    for (let i = 0; i < 2; i++) {
      expect(three.state.minds[i].decisions.map((trace) => trace.draw)).toEqual(two.state.minds[i].decisions.map((trace) => trace.draw));
      expect(three.state.minds[i].decisions.map((trace) => trace.intention.action)).toEqual(two.state.minds[i].decisions.map((trace) => trace.intention.action));
      const key = `cognition.decision.select@cognition/mind.000${i + 1}`;
      expect(three.state.streams[key]).toBe(two.state.streams[key]);
    }
  });

  it("ignores and logs an unknown cause without applying feedback, counters or RNG", () => {
    const runner = setup();
    decide(runner);
    const before = structuredClone(runner.state);
    const result = outcome(runner, "int.unknown");
    expect(result.events).toEqual([]);
    expect(result.state.minds).toEqual(before.minds);
    expect(result.state.counters).toEqual(before.counters);
    expect(result.state.streams).toEqual(before.streams);
    expect(result.state.ignoredOutcomes).toEqual([{ event: "evt.2", cause: "evt.1", reason: "unknown cause" }]);
  });

  it("applies at most one outcome per intention and rejects reuse of an outcome event", () => {
    const runner = setup(2);
    decide(runner);
    decide(runner, "mind.0002");
    outcome(runner);
    const learned = canonical(runner.state.minds);
    expect(outcome(runner).events).toEqual([]);
    expect(outcome(runner, "int.0001", "evt.other").events).toEqual([]);
    expect(outcome(runner, "int.0002").events).toEqual([]);
    expect(canonical(runner.state.minds)).toBe(learned);
    expect(runner.state.ignoredOutcomes.every((entry) => entry.reason === "duplicate outcome")).toBe(true);
  });

  it("learns a delayed outcome against the original intention and leaves a replacement active", () => {
    const runner = setup();
    decide(runner);
    const first = runner.state.minds[0].current!;
    decide(runner, "mind.0001", 1500);
    const replacement = runner.state.minds[0].current!;
    outcome(runner, first.id);
    expect(runner.state.minds[0].current).toEqual(replacement);
    expect(runner.state.minds[0].intentions[0].intention.status).toBe("completed");
    expect(runner.state.minds[0].learning[0].intention).toBe(first.id);
  });

  it("preserves a committed intention's original EU, emits it once and re-chooses after completion", () => {
    const configured = { baseline: { ...configs.baseline, generation: { ...configs.baseline.generation,
      repertoire: [{ ...offer, outcomeSpace: offer.outcomeSpace.map((effect, i) => ({ ...effect, goalProgress: { goal: i === 0 ? 1 : 0 } })) }] } } };
    const runner = new MindsRunner(createMindsState(72), configured);
    const input = mindInput({ needs: { needs: [], goals: [{ id: "goal", value: 1, progress: 0 }] } });
    runner.run({ type: "addMind", mind: { ...input, params: { ...input.params!, beta: 100, kappa: 10 } } });
    decide(runner);
    const original = runner.state.minds[0].intentions[0];
    runner.run({ type: "observe", mind: "mind.0001", observations: [observed(1500)], t: 1500 });
    expect(decide(runner, "mind.0001", 1500).events.filter((event) => event.type === "cognition.intention")).toEqual([]);
    expect(runner.state.minds[0].intentions[0]).toEqual(original);
    expect(original.trace.candidates[0].expectedUtility).toBeCloseTo(0.5);
    expect(runner.state.minds[0].decisions[1].candidates[0].expectedUtility).toBeCloseTo(0.1);
    outcome(runner);
    expect(runner.state.minds[0].learning[0].predictionError).toBeCloseTo(-0.5);
    expect(decide(runner, "mind.0001", 3000).events.filter((event) => event.type === "cognition.intention")).toHaveLength(1);
    expect(runner.state.minds[0].current!.id).toBe("int.0002");
  });

  it("updates only host-observed goal progress and rejects unknown or out-of-range goals", () => {
    const runner = new MindsRunner(createMindsState(1), configs);
    runner.run({ type: "addMind", mind: mindInput({ needs: { needs: [], goals: [{ id: "goal", progress: 0, value: 2 }] } }) });
    const command = { type: "tickNeeds", mind: "mind.0001", inputs: {
      signals: {}, elapsedSeconds: 1, outcomeTags: [], cues: [],
    } } as const;
    runner.run({ ...command, goalProgress: { goal: 0.75 } });
    expect(runner.state.minds[0].needs.goals[0].progress).toBe(0.75);
    expect(() => runner.run({ ...command, goalProgress: { missing: 1 } })).toThrow("Unknown goal");
    expect(() => runner.run({ ...command, goalProgress: { goal: 2 } })).toThrow("[0,1]");
  });

  it("tickNeeds uses supplied body signals and persists cognitive accumulator levels", () => {
    const inputs = { signals: { hunger: 0.2 }, beliefs: { entries: [] }, accumulators: { social: 0.2 },
      elapsedSeconds: 0, outcomeTags: [], cues: [] };
    const needs = evaluateNeeds([
      { id: "hunger", category: "body", source: { signal: "hunger" }, setpoint: 0, weight: 1, salienceTags: [] },
      { id: "social", category: "social", source: { accumulator: { rate: 0.1, reset_on: ["positive"] } }, setpoint: 0, weight: 1, salienceTags: [] },
    ], inputs);
    const runner = new MindsRunner(createMindsState(1), configs);
    runner.run({ type: "addMind", mind: mindInput({ needs: { needs, goals: [] } }) });
    runner.run({ type: "tickNeeds", mind: "mind.0001", inputs: { ...inputs, elapsedSeconds: 2, signals: { hunger: 0.8 } } });
    expect(runner.state.minds[0].needs.needs.map((need) => need.deficit)).toEqual([0.8, 0.4]);
    runner.run({ type: "tickNeeds", mind: "mind.0001", inputs: { ...inputs, elapsedSeconds: 1, outcomeTags: ["positive"] } });
    expect(runner.state.minds[0].needs.needs[1].level).toBe(0);
  });

  it("observes exactly once before decide and leaves Runner untouched on invalid input", () => {
    const runner = setup();
    runner.run({ type: "observe", mind: "mind.0001", observations: [observed()], t: 1000 });
    const belief = structuredClone(runner.state.minds[0].memory.beliefs);
    decide(runner);
    expect(runner.state.minds[0].memory.beliefs).toEqual(belief);
    const snapshot = canonical({ state: runner.state, log: runner.log, events: runner.events });
    expect(() => runner.run({ type: "decide", mind: "mind.0001", t: 2000, capacityFunctional: -1 })).toThrow();
    expect(canonical({ state: runner.state, log: runner.log, events: runner.events })).toBe(snapshot);
  });
});
