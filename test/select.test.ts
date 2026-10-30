import { describe, expect, it } from "vitest";
import { streams } from "@rex/kernel";
import { generateActions } from "../src/actions.ts";
import { categorical, getBelief, setBelief, updateFromObservation } from "../src/beliefs.ts";
import { evaluateActions } from "../src/evaluate.ts";
import { encodeEpisode } from "../src/memory.ts";
import { evaluateNeeds } from "../src/needs.ts";
import { perceive } from "../src/perception.ts";
import { nullPersonality } from "../src/personality.ts";
import { selectAction, softmax } from "../src/select.ts";
import type { Intention } from "../src/types.ts";
import { action, evaluate, scored, view, wait } from "./decision-fixtures.ts";

const mechanism = "cognition.decision.select";
const inputs = { mind: "mind.0001", counters: {} };
const current: Intention = { id: "int.0001", mind: inputs.mind, action: "a", t: 0,
  expectedOutcomes: categorical(["ok"], [1]), status: "active" };

describe("DESIGN §2.4 Luce selection (level 2 form) and commitment (level 5 hypothesis)", () => {
  it("β=0 is uniform, equal EUs tie, large β approaches argmax, and ±1e6 remain stable", () => {
    expect(softmax([-1e6, 0, 1e6], 0)).toEqual([1 / 3, 1 / 3, 1 / 3]);
    expect(softmax([1e6, 1e6, 1e6], 100)).toEqual([1 / 3, 1 / 3, 1 / 3]);
    expect(softmax([-1e6, 0, 1e6], 1e6)).toEqual([0, 0, 1]);
    expect(softmax([1, 2, 3], 1000)).toEqual([0, 0, 1]);
    expect(softmax([-Number.MAX_VALUE, Number.MAX_VALUE], Number.MAX_VALUE)).toEqual([0, 1]);
    const tiny = softmax([-Number.MAX_VALUE, Number.MAX_VALUE], 1e-308);
    expect(tiny[0]).toBeGreaterThan(0); expect(tiny.reduce((a, b) => a + b)).toBeCloseTo(1);
    expect(softmax([0, 1, 2], 1)).toEqual(softmax([100, 101, 102], 1));
  });

  it("100,000 kernel-stream selections match each softmax probability within 3 SE", () => {
    const ctx = view({ beta: 1.4 });
    const evaluated = evaluate([scored("a", -0.5), scored("b", 0.75)], ctx);
    const expected = [-0.5, 0.75, 0].map((u) => Math.exp(1.4 * u));
    const total = expected.reduce((a, b) => a + b);
    const probabilities = expected.map((p) => p / total);
    const random = streams(12345).get(mechanism, inputs.mind);
    const counts = [0, 0, 0];
    const ids = ["a", "b", "wait"];
    for (let i = 0; i < 100_000; i++) counts[ids.indexOf(selectAction(evaluated, inputs, random).intention.action)]++;
    probabilities.forEach((p, i) => expect(Math.abs(counts[i] / 100_000 - p)).toBeLessThanOrEqual(3 * Math.sqrt(p * (1 - p) / 100_000)));
  });

  it("κ=0 re-chooses every epoch even at an equal-EU tie, minting a new intention", () => {
    let draws = 0;
    const result = selectAction(evaluate([action("a")]), { ...inputs, current, counters: { int: 1 } }, () => { draws++; return 0.9; });
    expect(result.intention.action).toBe("wait");
    expect(result.intention.id).toBe("int.0002");
    expect(result.trace.commitment.kept).toBe(false);
    expect(draws).toBe(1);
    expect(result.counters).toEqual({ int: 2 });
  });

  it("large κ retains the active intention without RNG or reminting; effective P is a point mass", () => {
    const result = selectAction(evaluate([scored("a", -0.5), scored("b", 1)], view({ kappa: 10 })),
      { ...inputs, current }, () => { throw new Error("No draw when committed"); });
    expect(result.intention).toBe(current);
    expect(result.counters).toBe(inputs.counters);
    expect(result.trace.candidates.map((candidate) => candidate.probability)).toEqual([1, 0, 0]);
    expect(result.trace.candidates[1].softmaxProbability).toBeGreaterThan(result.trace.candidates[0].softmaxProbability);
    expect(result.trace.commitment).toEqual({ kappa: 10, kept: true, advantage: 1.5 });
  });

  it("commitment keeps at the threshold, breaks strictly above it, and uses generate's κ", () => {
    const ctx = view({ kappa: 0 });
    const gen = generateActions({ repertoire: [scored("a", 0), scored("b", 1)], wait, body: { capacity_functional: 1 } }, ctx, {
      ...nullPersonality, generate: (candidates) => ({ candidates, params: { kappa: 1 } }),
    });
    const evaluated = evaluateActions(gen, ctx, [], {}, 1000);
    expect(selectAction(evaluated, { ...inputs, current }, () => 0.99).trace.commitment.kept).toBe(true);
    const changed = { ...evaluated, generation: { ...gen, params: { kappa: 0.999 } } };
    expect(selectAction(changed, { ...inputs, current }, () => 0.99).trace.commitment.kept).toBe(false);
  });

  it("completed, failed, impossible or no-longer-feasible intentions release commitment; targets must match", () => {
    const evaluated = evaluate([action("a")], view({ kappa: 1e6 }));
    for (const status of ["completed", "failed", "impossible"] as const) {
      expect(selectAction(evaluated, { ...inputs, current: { ...current, status } }, () => 0.99).trace.commitment.kept).toBe(false);
    }
    expect(selectAction(evaluate([], view({ kappa: 1e6 })), { ...inputs, current }, () => 0).trace.commitment.kept).toBe(false);
    expect(selectAction(evaluated, { ...inputs, current: { ...current, target: "other" } }, () => 0).trace.commitment.kept).toBe(false);
  });

  it("an empty repertoire selects only wait and the inverse CDF never selects zero probability", () => {
    expect(selectAction(evaluate([]), inputs, () => 0.999999).intention.action).toBe("wait");
    const evaluated = evaluate([scored("a", -1), scored("b", 1)], view({ beta: 1e6 }));
    for (const draw of [0, 0.5, 1 - Number.EPSILON]) expect(selectAction(evaluated, inputs, () => draw).intention.action).toBe("b");
  });

  it("snapshot replay is byte-identical and other minds and mechanisms do not perturb selection", () => {
    const evaluated = evaluate([scored("a", 0.2), scored("b", -0.3)]);
    const random = streams(8456);
    const snapshot = random.state();
    const run = (interleave: boolean) => Array.from({ length: 50 }, () => {
      if (interleave) { random.get(mechanism, "other")(); random.get("cognition.memory.retrieve", inputs.mind)(); }
      return JSON.stringify(selectAction(evaluated, inputs, random.get(mechanism, inputs.mind)));
    });
    const first = run(false);
    random.restore(snapshot);
    expect(run(true)).toEqual(first);
  });

  it("rejects nonfinite/empty utilities, invalid β/κ/draws and mismatched current minds", () => {
    for (const beta of [-1, NaN, Infinity]) expect(() => softmax([0], beta)).toThrow(RangeError);
    for (const utilities of [[], [NaN], [Infinity]]) expect(() => softmax(utilities, 1)).toThrow(RangeError);
    for (const draw of [-1, 1, NaN]) expect(() => selectAction(evaluate([]), inputs, () => draw)).toThrow(RangeError);
    expect(() => selectAction(evaluate([]), { ...inputs, current: { ...current, mind: "other" } }, () => 0)).toThrow();
    expect(() => selectAction(evaluate([]), { ...inputs, current: { ...current, t: 1001 } }, () => 0)).toThrow();
    const evaluated = evaluate([]);
    expect(() => selectAction({ ...evaluated, generation: { ...evaluated.generation, params: { kappa: -1 } } }, inputs, () => 0)).toThrow();
  });
});

it("DESIGN §10 integration: observation → belief → memory → needs → candidates → EU → intention with named trace inputs", () => {
  const random = streams(77);
  const observations = perceive([{ cue: "cue.1", about: "object", attribute: "available", channel: "sight",
    present: true, detectability: 20, relevance: { resource: 1 }, domain: "space", kind: "categorical",
    value: "yes", values: ["yes", "no"] }], [1], { k: 0, weberFractions: { sight: 0, sound: 0, touch: 0, report: 0 } },
  0, random.get("cognition.perception.detect", inputs.mind));
  const beliefs = setBelief(view().beliefs, "object", "available",
    updateFromObservation(categorical(["yes", "no"], [0.5, 0.5]), observations[0], 1));
  const episode = encodeEpisode({ t: 0, context: { location: "here" }, action: "obtain", outcome: "no",
    reward: 0, predictionError: -0.5, attributedCause: "chance", domain: "space" }, {}).episode;
  const needs = evaluateNeeds([{ id: "resource", category: "fixture", source: { signal: "body.signal" },
    setpoint: 0, weight: 1, salienceTags: ["resource"] }], { signals: { "body.signal": 0.8 }, beliefs,
    accumulators: {}, elapsedSeconds: 0, outcomeTags: [], cues: [{ attention: 1, relevance: { resource: 1 } }] });
  const ctx = { ...view(), beliefs, needs: { needs, goals: [] } };
  const hostAction = action("obtain", { domain: "space", target: "object", targetKind: "resource", capacityRequired: 0.4,
    preconditions: [{ id: "available", probability: (store) => {
      const belief = getBelief(store, "object", "available");
      return belief?.kind === "categorical" ? belief.probabilities[0] : 0;
    } }], outcomeSpace: [{ id: "yes", deficits: { resource: 0 }, goalProgress: {}, success: true },
      { id: "no", deficits: {}, goalProgress: {}, success: false }], naiveModel: (store) => {
      const belief = getBelief(store, "object", "available");
      if (belief?.kind !== "categorical") throw new Error("Expected subjective distribution");
      return belief;
    } });
  const generated = generateActions({ repertoire: [hostAction], wait, body: { capacity_functional: 0.5 } }, ctx);
  const evaluated = evaluateActions(generated, ctx, [episode], { location: "here" }, 1000);
  const { trace, intention } = selectAction(evaluated, inputs, random.get(mechanism, inputs.mind));
  expect(trace.beliefs.entries[0].belief).toEqual(categorical(["yes", "no"], [1, 0]));
  expect(trace.needs.needs[0]).toMatchObject({ deficit: 0.8, pressure: 1.6, salience: 2, priority: 1 });
  expect(trace.inputs.episodes).toEqual([episode]);
  expect(trace.inputs.context).toEqual({ location: "here" });
  expect(trace.inputs.generation.checks[0]).toMatchObject({ action: "obtain", eligible: true, capacityRequired: 0.4,
    preconditions: [{ id: "available", probability: 1 }] });
  expect(trace.candidates[0].counts).toEqual([1, 0.5]);
  expect(trace.candidates[0].expectedUtility).toBeCloseTo((2 / 3) * 0.8 ** (4 / 3));
  expect(trace.candidates.reduce((sum, c) => sum + c.probability, 0)).toBeCloseTo(1);
  expect(intention.expectedOutcomes).toEqual(trace.candidates.find((c) => c.candidate.action === intention.action)?.expectedOutcomes);
  expect(trace.params).toBe(ctx.params);
  expect(JSON.stringify(trace)).not.toContain('"present"');
  expect(JSON.parse(JSON.stringify(trace))).toMatchObject({ mind: inputs.mind, intention: { id: "int.0001" } });
});
