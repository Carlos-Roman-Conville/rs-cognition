import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { createMindsState, MindsRunner } from "../src/mind.ts";
import type { CognitionEmission, MindCommand } from "../src/mind.ts";
import type { DecisionRecord } from "../src/index.ts";
import { evaluateNeeds } from "../src/needs.ts";
import { configs, mindInput, observed, offer } from "./composition-fixtures.ts";

const configuration = { baseline: { ...configs.baseline, generation: { ...configs.baseline.generation,
      assets: [{ id: "a", usefulness: {} }, { id: "b", usefulness: {} }],
      repertoire: [{ ...offer, target: "host/owner" }, { ...offer, id: "unpriced", target: "host/market", exchange: { give: { asset: "a", units: 1 }, want: { asset: "b" } } }] } } };

const decisions = (events: readonly CognitionEmission[]) => events.filter(event => event.type === "cognition.decision");
function setup(seed = 72, kappa = 0, count = 2, configuration = configs) {
  const runner = new MindsRunner(createMindsState(seed), configuration);
  for (let i = 0; i < count; i++) {
    const input = mindInput();
    runner.run({ type: "addMind", mind: { ...input, params: { ...input.params!, kappa } } });
  }
  return runner;
}
const decide = (runner: MindsRunner, t: number, mind = "mind.0001") => runner.run({ type: "decide", mind, t });
function outcome(runner: MindsRunner, t: number, mind = "mind.0001", intention = runner.state.minds.find(m => m.id === mind)!.current!.id) {
  return runner.run({ type: "outcome", intention, event: `outcome:${mind}:${t}`, t,
    feedback: { observations: [observed(t)] } });
}

describe("M1a-27 decision event", () => {
  it("(a) emits once per decide per mind, including commitment, before any fresh intention", () => {
    const runner = setup(72, 10);
    for (let t = 1000; t <= 4000; t += 1000) for (const mind of runner.state.minds) {
      const result = decide(runner, t, mind.id);
      expect(decisions(result.events)).toHaveLength(1);
      expect(result.events.map(event => event.type)).toEqual(t === 1000
        ? ["cognition.decision", "cognition.intention"] : ["cognition.decision"]);
      expect(decisions(result.events)[0].payload).toMatchObject({ mind: `cognition/${mind.id}`, t, kept: t > 1000 });
      expect(decisions(result.events)[0].payload.intention).toBe(`cognition/${result.state.minds.find(m => m.id === mind.id)!.current!.id}`);
    }
    expect(decisions(runner.events)).toHaveLength(8);
  });

  it("(b) copies predicted distributions, EUs, effective probabilities, needs and exclusions from stored traces", () => {
    const runner = setup(72, 10, 1, configuration);
    runner.state = { ...runner.state, minds: runner.state.minds.map(mind => ({ ...mind, needs: { goals: [], needs: evaluateNeeds([
      { id: "hunger", category: "body", source: { signal: "hunger" }, setpoint: 0, weight: 1, salienceTags: [] },
    ], { signals: { hunger: 0.6 }, beliefs: mind.memory.beliefs, accumulators: {}, elapsedSeconds: 0, outcomeTags: [], cues: [] }) } })) };
    for (const t of [1000, 2000]) {
      const record: DecisionRecord = decisions(decide(runner, t).events)[0].payload;
      const trace = runner.state.minds[0].decisions.at(-1)!;
      expect(record.candidates).toEqual(trace.candidates.map(c => ({ action: c.candidate.action, target: c.candidate.target,
        pHat: c.expectedOutcomes, eu: c.expectedUtility, p: c.probability })));
      expect(record.needs).toEqual(trace.needs.needs.map(n => ({ id: n.definition.id, deficit: n.deficit, priority: n.priority })));
      expect(record.ineligible).toEqual(trace.ineligible!.map(c => ({ action: c.candidate.action, target: c.candidate.target, reason: c.reason })));
      expect(record.ineligible).toHaveLength(1);
    }
  });

  it("(c) links only the latest applied outcome for this mind and clears it on decide", () => {
    const runner = setup();
    expect(decisions(decide(runner, 1000).events)[0]).not.toHaveProperty("cause");
    const first = runner.state.minds[0].current!.id;
    decide(runner, 1100);
    outcome(runner, 1200, "mind.0001", first);
    outcome(runner, 1300);
    outcome(runner, 1400, "mind.0001", "unknown");
    outcome(runner, 1500, "mind.0001", first); // Duplicate must not replace the applied outcome.
    expect(runner.state.minds[0].lastOutcomeEvent).toBe("outcome:mind.0001:1300");
    expect(decisions(decide(runner, 2000, "mind.0002").events)[0]).not.toHaveProperty("cause");
    expect(decisions(decide(runner, 2000).events)[0].cause).toBe("outcome:mind.0001:1300");
    expect(runner.state.minds[0].lastOutcomeEvent).toBeUndefined();
    expect(decisions(decide(runner, 3000).events)[0]).not.toHaveProperty("cause");
  });

  it("(d) replays byte-identical decision emissions from a mid-run JSON snapshot with a pending cause", () => {
    const original = setup(29, 10);
    decide(original, 1000);
    outcome(original, 1100);
    const restored = new MindsRunner(JSON.parse(JSON.stringify(original.state)), configs);
    const commands: MindCommand[] = [
      { type: "decide", mind: "mind.0001", t: 2000 },
      { type: "decide", mind: "mind.0002", t: 2000 },
      { type: "decide", mind: "mind.0001", t: 3000 },
      { type: "decide", mind: "mind.0002", t: 3000 },
    ];
    const expected = commands.flatMap(command => decisions(original.run(command).events));
    const actual = commands.flatMap(command => decisions(restored.run(command).events));
    expect(JSON.stringify(actual)).toBe(JSON.stringify(expected));
    expect(actual[0].cause).toBe("outcome:mind.0001:1100");
    expect(actual[2].payload.kept).toBe(true);
  });

  it("(e) preserves the pre-change intention sequences with decision events filtered out", () => {
    // SHA256 of full intention emissions captured before this unit, six epochs, two minds, outcomes each epoch.
    const baseline = [
      [1, "c0f6c1a96149a1029ae37a9d469b0076ba52d85e1f069543d1eb0aabe245c73c"],
      [29, "314d104789d62fe649af1f64a4b769d7d3028f60ea9bbe2a4027c9f6a4dc6b4d"],
      [72, "a1f0c0bb2bdca4f585c03780ce81ff8e06d5f31a7ae2bb44170b8f9b4ee47a58"],
    ] as const;
    for (const [seed, hash] of baseline) {
      const runner = setup(seed);
      for (let t = 1000; t <= 6000; t += 1000) for (const mind of runner.state.minds) {
        decide(runner, t, mind.id);
        // Match the pre-change fixture's event label (decision time) and feedback time (t + 1).
        runner.run({ type: "outcome", intention: runner.state.minds.find(m => m.id === mind.id)!.current!.id,
          event: `outcome:${mind.id}:${t}`, t: t + 1, feedback: { observations: [observed(t + 1)] } });
      }
      const intentions = runner.events.filter(event => event.type === "cognition.intention");
      expect(createHash("sha256").update(JSON.stringify(intentions)).digest("hex")).toBe(hash);
    }
  });

  it("(f) exposes only declared trace projection fields, never world or full mind state", () => {
    const runner = setup(72, 0, 1, configuration);
    const needs = evaluateNeeds([{ id: "hunger", category: "body", source: { signal: "hunger" },
      setpoint: 0, weight: 1, salienceTags: [] }], { signals: { hunger: 0.6 }, beliefs: { entries: [] },
      accumulators: {}, elapsedSeconds: 0, outcomeTags: [], cues: [] });
    runner.run({ type: "addMind", mind: mindInput({ needs: { needs, goals: [] } }) });
    const record = decisions(decide(runner, 1000, "mind.0002").events)[0].payload;
    expect(record.needs).toHaveLength(1);
    expect(record.ineligible).toHaveLength(1);
    expect(record.candidates.some(candidate => candidate.target !== undefined)).toBe(true);
    expect(Object.keys(record).sort()).toEqual(["candidates", "ineligible", "intention", "kept", "mind", "needs", "t"]);
    for (const candidate of record.candidates) {
      expect(Object.keys(candidate).sort()).toEqual(candidate.target === undefined
        ? ["action", "eu", "p", "pHat"] : ["action", "eu", "p", "pHat", "target"]);
      expect(Object.keys(candidate.pHat).sort()).toEqual(["kind", "probabilities", "values"]);
    }
    for (const need of record.needs) expect(Object.keys(need).sort()).toEqual(["deficit", "id", "priority"]);
    for (const excluded of record.ineligible) expect(Object.keys(excluded).sort()).toEqual(["action", "reason", "target"]);
  });
});
