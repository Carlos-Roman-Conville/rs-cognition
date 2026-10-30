import { describe, expect, it } from "vitest";
import human from "../data/needs.human.json";
import { allocateAttention } from "../src/attention.ts";
import { categorical, createBeliefStore, existence, gaussian, setBelief } from "../src/beliefs.ts";
import { drive, driveReward, evaluateNeeds, goalReward } from "../src/needs.ts";
import type { NeedInputs } from "../src/needs.ts";
import { DEFAULT_COGNITIVE_PARAMS } from "../src/types.ts";
import type { NeedDefinition } from "../src/types.ts";

// JSON strings are widened by TS; evaluation exercises the actual species data.
const definitions = human.needs as readonly NeedDefinition[];
const beliefs = setBelief(createBeliefStore(), "self", "serious_harm", categorical(["yes", "no"], [0.2, 0.8]));
const input = (hunger = 0.2): NeedInputs => ({
  signals: { "body.hunger_signal": hunger }, beliefs,
  accumulators: { social_connection: 0.2 }, elapsedSeconds: 0, outcomeTags: [], cues: [],
});
const signal = (id: string, weight = 1, setpoint = 0): NeedDefinition => ({
  id, category: "fixture", source: { signal: id }, setpoint, weight, salienceTags: [],
});
const single = (deficit: number) => evaluateNeeds([signal("x")], { ...input(), signals: { x: deficit } });

describe("DESIGN §2.2 needs (level-4 model verification, not empirical validation)", () => {
  it("reads the benchmark hunger signal, belief appraisal, and social accumulator in data order", () => {
    const result = evaluateNeeds(definitions, input());
    expect(result.map((need) => need.definition.id)).toEqual(["hunger", "safety", "social_connection"]);
    expect(result.map((need) => need.deficit)).toEqual([0.2, 0.2, 0.2]);
    expect(result.map((need) => need.priority)).toEqual([1 / 3, 1 / 3, 1 / 3]);
  });

  it("computes S=1+sum a*eta, M=w*D*S and priorities following pressure and summing to one", () => {
    const result = evaluateNeeds(definitions, { ...input(), cues: [
      { attention: 0.5, relevance: { food: 1 } }, { attention: 0.25, relevance: { food: 0.4 } },
    ] });
    expect(result[0].salience).toBeCloseTo(1.6);
    expect(result[0].pressure).toBeCloseTo(0.32);
    expect(result[0].priority).toBeCloseTo(0.32 / 0.72);
    expect(result[0].priority).toBeGreaterThan(result[1].priority);
    expect(result.reduce((sum, need) => sum + need.priority, 0)).toBeCloseTo(1);
    const weighted = evaluateNeeds([signal("x", 2), signal("y")], { ...input(), signals: { x: 0.5, y: 0.5 } });
    expect(weighted.map((need) => need.priority)).toEqual([2 / 3, 1 / 3]);
  });

  it("adds thirst as a fourth data row; categories never affect priority or drive", () => {
    const rows = [...definitions, signal("thirst")];
    const inputs = { ...input(), signals: { ...input().signals, thirst: 0.6 } };
    const result = evaluateNeeds(rows, inputs);
    expect(result[3].priority).toBeCloseTo(0.5);
    const renamed = evaluateNeeds(rows.map((row) => ({ ...row, category: "growth" })), inputs);
    expect(renamed.map((need) => need.priority)).toEqual(result.map((need) => need.priority));
    expect(drive(renamed)).toBe(drive(result));
  });

  it("passes Reality's deficit through even with a nonzero setpoint; it infers no biological state", () => {
    const result = evaluateNeeds([signal("body.thirst", 1, 0.4)], { ...input(), signals: { "body.thirst": 0.3 } });
    expect(result[0].deficit).toBe(0.3);
    expect(result[0].level).toBe(0.7);
  });

  it("appraises subjective categorical, existence and real beliefs without inspecting truth", () => {
    for (const belief of [existence(0.8), gaussian(0.8, 0.01)]) {
      const store = setBelief(createBeliefStore(), "self", "danger", belief, "false");
      const row = { ...signal("safety", 1, 0.1), source: { appraisal: { about: "self", attribute: "danger" } } };
      expect(evaluateNeeds([row], { ...input(), beliefs: store })[0].deficit).toBeCloseTo(0.7);
    }
  });

  it("accumulates in seconds, saturates, resets on matching outcomes, and preserves inputs", () => {
    const inputs = { ...input(), elapsedSeconds: 1800 };
    const snapshot = JSON.stringify(inputs);
    expect(evaluateNeeds(definitions, inputs)[2].level).toBeCloseTo(0.7);
    expect(JSON.stringify(inputs)).toBe(snapshot);
    expect(evaluateNeeds(definitions, { ...inputs, elapsedSeconds: 10000 })[2].level).toBe(1);
    expect(evaluateNeeds(definitions, { ...inputs, outcomeTags: ["positive_interaction"] })[2].level).toBe(0);
    expect(evaluateNeeds(definitions, { ...inputs, outcomeTags: ["unrelated"] })[2].level).toBeCloseTo(0.7);
  });

  it("D is zero at setpoints and increases with any deficit; implements the weighted power formula", () => {
    expect(drive(single(0))).toBe(0);
    expect(drive(single(0.8))).toBeCloseTo((0.8 ** 4) ** (1 / 3));
    const rows = [signal("x", 2), signal("y", 3)];
    const state = (x: number, y: number) => evaluateNeeds(rows, { ...input(), signals: { x, y } });
    const baseline = drive(state(0.2, 0.3));
    expect(baseline).toBeCloseTo((2 * 0.2 ** 4 + 3 * 0.3 ** 4) ** (1 / 3));
    expect(drive(state(0.3, 0.3))).toBeGreaterThan(baseline);
    expect(drive(state(0.2, 0.4))).toBeGreaterThan(baseline);
    expect(drive(state(0.2, 0.3), 3, 2)).toBeCloseTo((2 * 0.2 ** 3 + 3 * 0.3 ** 3) ** 0.5);
  });

  it("food dominates when starving: documented model consequence for otherwise equal weights and salience, not validated data", () => {
    const starving = evaluateNeeds(definitions, input(1));
    expect(starving[0].priority).toBeGreaterThan(starving[1].priority);
    expect(starving[0].priority).toBeGreaterThan(starving[2].priority);
    expect(driveReward(single(0.9), single(0.8))).toBeGreaterThan(driveReward(single(0.2), single(0.1)));
    expect(driveReward(single(0.9), single(0.8))).toBe(drive(single(0.9)) - drive(single(0.8)));
    expect(driveReward(single(0.1), single(0.2))).toBeLessThan(0);
  });

  it("zero deficits and zero weights give uniform priorities without NaN; empty needs give zero drive", () => {
    const rows = [signal("x"), signal("y")];
    for (const [definitions, signals] of [
      [rows, { x: 0, y: 0 }], [rows.map((row) => ({ ...row, weight: 0 })), { x: 1, y: 1 }],
    ] as const) {
      const result = evaluateNeeds(definitions, { ...input(), signals });
      expect(result.map((need) => need.priority)).toEqual([0.5, 0.5]);
      expect(drive(result)).toBe(0);
    }
    expect(evaluateNeeds([], input())).toEqual([]);
    expect(drive([])).toBe(0);
    const huge = evaluateNeeds([signal("x", Number.MAX_VALUE), signal("y", Number.MAX_VALUE)], { ...input(), signals: { x: 1, y: 1 } });
    expect(huge.map((need) => need.priority)).toEqual([0.5, 0.5]);
    expect(Number.isFinite(drive(huge))).toBe(true);
  });

  it("a goal step adds exactly V_g Δp_g, including regression and no progress", () => {
    const goal = { id: "keep_stock", value: 8, progress: 0.25 };
    expect(goalReward(goal, 0.75)).toBe(4);
    expect(goalReward(goal, 0)).toBe(-2);
    expect(goalReward(goal, 0.25)).toBe(0);
    const reward = driveReward(single(0.8), single(0.7));
    expect(reward + goalReward(goal, 0.75) - reward).toBeCloseTo(4);
  });

  it("integrates needs → attention pertinence with stronger hunger attracting food attention", () => {
    const needs = evaluateNeeds(definitions, input(0.8));
    const result = allocateAttention([
      { cue: "food", salience: 1, relevance: { food: 1 } },
      { cue: "threat", salience: 1, relevance: { threat: 1 } },
    ], [
      { id: "food", base: 0, relevance: { hunger: 1 } },
      { id: "threat", base: 0, relevance: { safety: 1 } },
    ], { beliefs, needs: { needs, goals: [] }, params: DEFAULT_COGNITIVE_PARAMS });
    expect(result.pertinence.food).toBe(needs[0].priority);
    expect(result.shares[0]).toBeCloseTo(0.8);
  });

  it("rejects missing inputs, invalid domains, duplicate ids and invalid drive exponents", () => {
    expect(() => evaluateNeeds(definitions, { ...input(), signals: {} })).toThrow();
    expect(() => evaluateNeeds(definitions, { ...input(), beliefs: createBeliefStore() })).toThrow();
    expect(() => evaluateNeeds(definitions, { ...input(), accumulators: {} })).toThrow();
    expect(() => evaluateNeeds([signal("x"), signal("x")], input())).toThrow();
    for (const value of [-1, 2, NaN, Infinity]) expect(() => single(value)).toThrow();
    expect(() => evaluateNeeds(definitions, { ...input(), elapsedSeconds: -1 })).toThrow();
    expect(() => evaluateNeeds(definitions, { ...input(), cues: [{ attention: 2, relevance: {} }] })).toThrow();
    expect(() => evaluateNeeds([{ ...signal("x"), weight: -1 }], { ...input(), signals: { x: 0 } })).toThrow();
    for (const [n, m] of [[3, 3], [4, 0], [NaN, 3], [4, Infinity]]) expect(() => drive(single(0), n, m)).toThrow();
    expect(() => goalReward({ id: "g", value: Infinity, progress: 0 }, 1)).toThrow();
    expect(() => goalReward({ id: "g", value: 1, progress: 0 }, 2)).toThrow();
  });
});
