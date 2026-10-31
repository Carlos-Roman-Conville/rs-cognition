import { describe, expect, it } from "vitest";
import { evaluateActions, selectAction, softmax } from "../src/index.ts";
import { categorical } from "../src/beliefs.ts";
import { action, generation, scored, view } from "./decision-fixtures.ts";
import { expectedLoss, fightPoints, lambdaChecks, lambdaProbe } from "../bench/hungry-pair/lambda.ts";
import type { SelectionTrace } from "../src/index.ts";

function trace(beta = 1, equal = false, gamma = 0.5): SelectionTrace {
  const ctx = view({ gamma, lambda: 2.25, beta });
  // Goal value=2. Net rewards after cost are +0.5/-0.5, P=1/2 each.
  const gamble = action("fight", { duration: 3, cost: 0.1,
    outcomeSpace: [{ id: "gain", deficits: {}, goalProgress: { goal: 0.8 } },
      { id: "loss", deficits: {}, goalProgress: { goal: 0.3 } }],
    naiveModel: () => categorical(["gain", "loss"], [0.5, 0.5]) });
  const gen = generation(equal ? [scored("zero", 0)] : [gamble, scored("loss", -0.2)], ctx);
  const evaluation = evaluateActions(gen, ctx, [], {}, 1000);
  return selectAction(evaluation, { mind: "cognition/mind.0001", counters: {} }, () => 0).trace;
}

describe("C-B2 / DESIGN §2.4 fixed-context lambda verification", () => {
  it("hand-computed mixed gain/loss, effort, discount and zero-loss candidates obey the exact lambda slope", () => {
    const decision = trace(), probe = lambdaProbe(decision);
    probe.losses.forEach((loss, i) => expect(loss).toBeCloseTo([0.0625, 0.2, 0][i], 14));
    expect(probe.baseline[0].expectedUtility).toBeCloseTo(-0.078125, 14);
    expect(probe.changed[0].expectedUtility).toBeCloseTo(-0.21875, 14);
    expect(probe.baseline[1].expectedUtility).toBeCloseTo(-0.45, 14);
    expect(probe.changed[1].expectedUtility).toBeCloseTo(-0.9, 14);
    expect(probe.changed.map((row, i) => row.expectedUtility - probe.baseline[i].expectedUtility))
      .toEqual(expect.arrayContaining([expect.closeTo(-0.140625, 14), expect.closeTo(-0.45, 14), 0]));
    const pLow = Math.exp(-0.45) / (Math.exp(-0.078125) + Math.exp(-0.45) + 1);
    const pHigh = Math.exp(-0.9) / (Math.exp(-0.21875) + Math.exp(-0.9) + 1);
    expect(probe.before[1]).toBeCloseTo(pLow, 14);
    expect(probe.after[1]).toBeCloseTo(pHigh, 14);
    expect(pHigh).toBeLessThan(pLow);
    expect(lambdaChecks([decision], "hand calculation").check.failures).toBe(0);
    expect(fightPoints([decision])[0]).toMatchObject({ loss: 0.0625, alternatives: 2, movingAlternatives: 2, kept: false, sameDrawFight: true });
  });

  it("holds episodes, needs, beliefs, repertoire and time fixed without mutating the trace", () => {
    const decision = trace();
    const withMemory: SelectionTrace = { ...decision, inputs: { ...decision.inputs, episodes: [{
      id: "ep.probe", t: 0, retrievals: [], context: {}, action: "fight", outcome: "loss",
      reward: -0.5, predictionError: -0.5, attributedCause: "chance", domain: "strategy",
    }] } };
    const saved = JSON.stringify(withMemory), probe = lambdaProbe(withMemory);
    expect(probe.baseline[0].expectedOutcomes).toEqual(probe.changed[0].expectedOutcomes);
    expect(probe.baseline[0].expectedOutcomes.probabilities[1]).toBeGreaterThan(0.5);
    expect(probe.changed[0].expectedUtility - probe.baseline[0].expectedUtility)
      .toBeCloseTo(-2.25 * expectedLoss(probe.baseline[0]), 14);
    expect(JSON.stringify(withMemory)).toBe(saved);
  });

  it("checks equality for beta=0 or equal losses and handles zero discounted loss", () => {
    for (const decision of [trace(0), trace(1, true), trace(1, false, 0)]) {
      const result = lambdaChecks([decision], "boundary");
      expect(result.check.failures, result.check.examples.join("\n")).toBe(0);
      expect(result.check.cases).toBe(result.candidates + result.strict + result.equal);
    }
    expect(lambdaChecks([trace(0)], "uniform").equal).toBe(1);
    expect(lambdaChecks([trace(1, true)], "equal").equal).toBe(2);
    expect(lambdaProbe(trace(0)).before).toEqual(softmax([0, 0, 0], 0));
    expect(() => lambdaProbe(trace(), 4.5, 2.25)).toThrow(RangeError);
  });
});
