import { describe, expect, it } from "vitest";
import { allocateAttention, identityPertinence } from "../src/attention.ts";
import type { AttentionCategory, AttentionCue } from "../src/attention.ts";
import { DEFAULT_COGNITIVE_PARAMS } from "../src/types.ts";
import type { FeltNeed, MindView } from "../src/types.ts";

const need = (id: string, priority: number): FeltNeed => ({
  definition: { id, category: "fixture", source: { signal: id }, setpoint: 0, weight: 1, salienceTags: [] },
  level: 1, deficit: 1, salience: 1, pressure: priority, priority,
});
const ctx: MindView = {
  beliefs: { entries: [] }, needs: { needs: [need("hunger", 0.75), need("safety", 0.25)], goals: [] },
  params: DEFAULT_COGNITIVE_PARAMS,
};
const categories: AttentionCategory[] = [
  { id: "food", base: 0.25, relevance: { hunger: 1, safety: 0 } },
  { id: "threat", base: 0.25, relevance: { safety: 1 } },
];
const cues: AttentionCue[] = [
  { cue: "c1", salience: 2, relevance: { food: 1, threat: 0.5 } },
  { cue: "c2", salience: 1, relevance: { threat: 1 } },
  { cue: "c3", salience: 100, relevance: { food: 0, threat: 0, irrelevant: 1 } },
];

describe("TVA allocation (DESIGN §2.1)", () => {
  it("computes pi0 + sum priority*rel, TVA weights, and shares summing to one", () => {
    const result = allocateAttention(cues, categories, ctx);
    expect(result.pertinence).toEqual({ food: 1, threat: 0.5 });
    expect(result.weights).toEqual([2.5, 0.5, 0]);
    [5 / 6, 1 / 6, 0].forEach((expected, i) => expect(result.shares[i]).toBeCloseTo(expected, 15));
    expect(result.shares.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 15);
  });

  it("eta=0 for every pertinent category gives zero share regardless of salience", () => {
    expect(allocateAttention(cues, categories, ctx).shares[2]).toBe(0);
  });

  it("applies the personality hook to pertinence with subjective context; null is identity", () => {
    const before = JSON.stringify({ cues, categories, ctx });
    const baseline = allocateAttention(cues, categories, ctx);
    expect(allocateAttention(cues, categories, ctx, identityPertinence)).toEqual(baseline);
    const modified = allocateAttention(cues, categories, ctx, (base, context) => {
      expect(context).toBe(ctx);
      expect(base).toEqual({ food: 1, threat: 0.5 });
      base.threat *= 4;
      return base;
    });
    expect(modified.weights).toEqual([4, 2, 0]);
    expect(modified.shares).toEqual([2 / 3, 1 / 3, 0]);
    expect(JSON.stringify({ cues, categories, ctx })).toBe(before);
  });

  it("zero weights, empty categories and empty cues never invent attention or NaN", () => {
    expect(allocateAttention(cues, [], ctx).shares).toEqual([0, 0, 0]);
    expect(allocateAttention(cues, categories, ctx, () => ({ food: 0, threat: 0 })).shares).toEqual([0, 0, 0]);
    expect(allocateAttention(cues.map((cue) => ({ ...cue, salience: 0 })), categories, ctx).shares).toEqual([0, 0, 0]);
    expect(allocateAttention([], categories, ctx).shares).toEqual([]);
  });

  it("preserves host order and handles large finite weights without sum overflow", () => {
    const input = ["z", "a"].map((cue) => ({ cue, salience: Number.MAX_VALUE, relevance: { food: 1 } }));
    expect(allocateAttention(input, [{ id: "food", base: 1, relevance: {} }], ctx).shares).toEqual([0.5, 0.5]);
    const result = allocateAttention([...cues].reverse(), categories, ctx);
    expect(result.weights).toEqual([0, 0.5, 2.5]);
  });

  it("supports category identifiers that are also JavaScript prototype names", () => {
    const result = allocateAttention([{ cue: "x", salience: 1, relevance: { ["__proto__"]: 1 } }],
      [{ id: "__proto__", base: 1, relevance: {} }], ctx);
    expect(result.shares).toEqual([1]);
  });

  it("rejects negative, nonfinite, out-of-range and incomplete inputs", () => {
    for (const salience of [-1, NaN, Infinity]) {
      expect(() => allocateAttention([{ ...cues[0], salience }], categories, ctx)).toThrow(RangeError);
    }
    for (const relevance of [-1, 1.1, NaN]) {
      expect(() => allocateAttention([{ ...cues[0], relevance: { food: relevance } }], categories, ctx)).toThrow(RangeError);
    }
    expect(() => allocateAttention(cues, [...categories, categories[0]], ctx)).toThrow(RangeError);
    expect(() => allocateAttention(cues, categories, ctx, () => ({ food: 1 }))).toThrow(RangeError);
    expect(() => allocateAttention(cues, categories, ctx, () => ({ food: -1, threat: 1 }))).toThrow(RangeError);
    expect(() => allocateAttention(cues, [{ ...categories[0], base: Infinity }], ctx)).toThrow(RangeError);
    expect(() => allocateAttention(cues, [{ ...categories[0], relevance: { hunger: 2 } }], ctx)).toThrow(RangeError);
  });
});
