import { describe, expect, it } from "vitest";
import { categorical } from "../src/beliefs.ts";
import { evaluateActions } from "../src/evaluate.ts";
import { encodeEpisode } from "../src/memory.ts";
import { evaluateNeeds } from "../src/needs.ts";
import { nullPersonality } from "../src/personality.ts";
import type { PredictedOutcome } from "../src/types.ts";
import { action, evaluate, generation, scored, view } from "./decision-fixtures.ts";

const gamble = (gain: number, loss: number) => action("gamble", {
  outcomeSpace: [
    { id: "gain", deficits: {}, goalProgress: { goal: 0.5 + gain / 2 }, success: true },
    { id: "loss", deficits: {}, goalProgress: { goal: 0.5 - loss / 2 }, success: false },
  ], naiveModel: () => categorical(["gain", "loss"], [0.5, 0.5]),
});

describe("DESIGN §2.4 evaluation (V4 verification; independent validation pending)", () => {
  it("λ=1 is risk-neutral for a symmetric gamble and λ>1 rejects gain below λ times loss", () => {
    expect(evaluate([gamble(0.4, 0.4)]).candidates[0].expectedUtility).toBeCloseTo(0);
    expect(evaluate([gamble(0.6, 0.4)], view({ lambda: 2 })).candidates[0].expectedUtility).toBeCloseTo(-0.1);
    expect(evaluate([gamble(0.8, 0.4)], view({ lambda: 2 })).candidates[0].expectedUtility).toBeCloseTo(0);
    expect(evaluate([gamble(0.9, 0.4)], view({ lambda: 2 })).candidates[0].expectedUtility).toBeGreaterThan(0);
  });

  it("adds drive reduction and goal progress, subtracts cost inside v, then discounts γ^(dur−1)", () => {
    const ctx = view({ gamma: 0.5, lambda: 2, n: 4, m: 2 });
    const needs = evaluateNeeds([{ id: "need", category: "fixture", source: { signal: "signal" },
      setpoint: 0, weight: 1, salienceTags: [] }], { signals: { signal: 0.8 }, beliefs: ctx.beliefs,
      accumulators: {}, elapsedSeconds: 0, outcomeTags: [], cues: [] });
    const mind = { ...ctx, needs: { ...ctx.needs, needs } };
    const result = evaluate([action("a", { duration: 3, cost: 1,
      outcomeSpace: [{ id: "ok", deficits: { need: 0.2 }, goalProgress: { goal: 0.6 } }] })], mind).candidates[0];
    expect(result.outcomes[0].driveReward).toBeCloseTo(0.8 ** 2 - 0.2 ** 2);
    expect(result.outcomes[0].goalReward).toBeCloseTo(0.2);
    expect(result.outcomes[0].netReward).toBeCloseTo(-0.2);
    expect(result.expectedUtility).toBeCloseTo(-0.1);
    expect(needs[0].deficit).toBe(0.8);
  });

  it("uses memory P_hat and interpret's α0, λ and confidence in the tagged domain", () => {
    const ctx = view();
    const gen = generation([gamble(0.6, 0.4)], ctx);
    const episode = encodeEpisode({ t: 0, context: { place: "x" }, action: "gamble", outcome: "loss",
      reward: -0.4, predictionError: -0.5, attributedCause: "chance", domain: "strategy" }, {}).episode;
    const baseline = evaluateActions(gen, ctx, [episode], { place: "x" }, 1000);
    // At one second B=0 and retrieval probability=0.5: counts [0.5,1].
    expect(baseline.candidates[0].counts).toEqual([0.5, 1]);
    const result = evaluateActions(gen, ctx, [episode], { place: "x" }, 1000, {
      ...nullPersonality, interpret: (base, domain, mind) => {
        expect(domain).toBe("strategy"); expect(mind).toBe(ctx);
        return { ...base, alpha0: 2, lambda: 3, confidence: 0.5 };
      },
    }).candidates[0];
    expect(result.counts).toEqual([1, 1.5]);
    result.memoryDistribution.probabilities.forEach((p, i) => expect(p).toBeCloseTo([0.4, 0.6][i]));
    result.expectedOutcomes.probabilities.forEach((p, i) => expect(p).toBeCloseTo([0.2, 0.8][i]));
    expect(result.expectedUtility).toBeCloseTo(0.2 * 0.6 - 0.8 * 3 * 0.4);
  });

  it("confidence preserves mass with zero prior failure mass and α0=0 uses uniform ignorance", () => {
    const ctx = view({ alpha0: 0 });
    expect(evaluate([gamble(0.5, 0.5)], ctx).candidates[0].expectedOutcomes.probabilities).toEqual([0.5, 0.5]);
    const certain = { ...gamble(0.5, 0.5), naiveModel: () => categorical(["gain", "loss"], [1, 0]) };
    const result = evaluateActions(generation([certain]), view(), [], {}, 1000, {
      ...nullPersonality, interpret: (base) => ({ ...base, confidence: 0.25 }),
    });
    expect(result.candidates[0].expectedOutcomes.probabilities).toEqual([0.25, 0.75]);
  });

  it("γ=0 still values one-epoch actions and zeroes delayed actions; unchanged needs add no penalty", () => {
    expect(evaluate([scored("now", 1), { ...scored("later", 1), duration: 2 }], view({ gamma: 0 })).candidates.map((c) => c.expectedUtility)).toEqual([1, 0, 0]);
    expect(evaluate([]).candidates[0].expectedUtility).toBe(0);
  });

  it("rejects invalid parameters, unknown predicted need/goal keys and ambiguous confidence outcomes", () => {
    for (const params of [{ gamma: -1 }, { gamma: 2 }, { gamma: NaN }, { lambda: -1 }, { alpha0: -1 }]) {
      expect(() => evaluate([], view(params))).toThrow(RangeError);
    }
    const unknownEffects: PredictedOutcome[] = [{ id: "ok", deficits: { unknown: 0 }, goalProgress: {} },
      { id: "ok", deficits: {}, goalProgress: { unknown: 0 } }];
    for (const effect of unknownEffects) {
      expect(() => evaluate([action("a", { outcomeSpace: [effect] })])).toThrow(RangeError);
    }
    for (const confidence of [-1, 2, NaN]) expect(() => evaluateActions(generation([]), view(), [], {}, 1000, {
      ...nullPersonality, interpret: (base) => ({ ...base, confidence }),
    })).toThrow(RangeError);
    expect(() => evaluateActions(generation([scored("a", 1)]), view(), [], {}, 1000, {
      ...nullPersonality, interpret: (base) => ({ ...base, confidence: 0.5 }),
    })).toThrow(RangeError);
  });
});
