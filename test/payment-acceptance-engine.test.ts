import { describe, expect, it } from "vitest";
import { generateActions } from "../src/actions.ts";
import { categorical, setBelief } from "../src/beliefs.ts";
import { evaluateActions, R_MAX } from "../src/evaluate.ts";
import { evaluateNeeds } from "../src/needs.ts";
import { selectAction } from "../src/select.ts";
import { assetValue, directUsefulness, exchangeability } from "../src/valuation.ts";
import type { AssetDefinition, MindView } from "../src/types.ts";
import { action, evaluate, prePaymentTrace, scored, view, wait } from "./decision-fixtures.ts";

const rate = { about: "token", attribute: "rate:food" };
const accepted = { about: "token", attribute: "accepted@market" };
const genuine = { about: "token", attribute: "genuine" };
const assets: readonly AssetDefinition[] = [
  { id: "token", usefulness: {}, accepted, genuine, rates: { food: rate } },
  { id: "food", usefulness: { hunger: 1 } },
];
function context(): MindView {
  let beliefs = view().beliefs;
  beliefs = setBelief(beliefs, rate.about, rate.attribute, { kind: "gaussian", mean: 2, variance: 0 });
  beliefs = setBelief(beliefs, accepted.about, accepted.attribute, categorical(["yes", "no"], [0.5, 0.5]));
  beliefs = setBelief(beliefs, genuine.about, genuine.attribute, categorical(["yes", "no"], [0.8, 0.2]));
  const needs = evaluateNeeds([{ id: "hunger", category: "body", source: { signal: "hunger" },
    setpoint: 0, weight: 1, salienceTags: [] }], { signals: { hunger: 1 }, beliefs,
    accumulators: {}, elapsedSeconds: 0, outcomeTags: [], cues: [] });
  return { ...view({ gamma: 0.5, lambda: 2.25 }), beliefs, needs: { needs, goals: view().needs.goals } };
}
const offer = (units?: number) => action("offer", {
  exchange: { give: { asset: "token", units: 2 }, want: { asset: "food", ...(units === undefined ? {} : { units }) } },
  terms: { ratioMin: 99, giveUnits: 99, host: 3 }, cost: 0.1,
  outcomeSpace: [{ id: "filled", deficits: {}, goalProgress: {}, success: true },
    { id: "unfilled", deficits: {}, goalProgress: {}, success: false }],
  naiveModel: () => categorical(["filled", "unfilled"], [0.75, 0.25]),
});
function run(repertoire = [offer()], ctx = context(), definitions = assets) {
  return evaluateActions(generateActions({ repertoire, wait, assets: definitions,
    body: { capacity_functional: 1 } }, ctx), ctx, [], {}, 1000);
}

describe("DESIGN §2.4 payment acceptance in the existing evaluator", () => {
  it("matches hand-computed two-asset D, E and V and floors deficits at zero", () => {
    const ctx = context();
    expect(directUsefulness("food", ctx, assets)).toBe(1);
    expect(directUsefulness("token", ctx, assets)).toBe(0);
    expect(exchangeability("token", ctx, assets)).toBeCloseTo(0.5 * 0.8 * 0.5 * 2);
    expect(assetValue("token", ctx, assets)).toBeCloseTo(0.4);
    expect(assetValue("food", ctx, assets)).toBe(1);
    expect(directUsefulness("food", ctx, [{ id: "food", usefulness: { hunger: 2 } }])).toBe(1);
    const changed = { ...ctx, beliefs: setBelief(ctx.beliefs, accepted.about, accepted.attribute,
      categorical(["yes", "no"], [1, 0])) };
    expect(exchangeability("token", changed, assets)).toBeCloseTo(0.8);
    expect(changed.needs).toBe(ctx.needs);
    expect(changed.params).toBe(ctx.params);
  });

  it("ignorance gives E=0; missing genuine key gives 1, missing genuine belief gives 0", () => {
    const ctx = context();
    expect(exchangeability("token", { ...ctx, beliefs: { entries: [] } }, assets)).toBe(0);
    expect(exchangeability("token", ctx, [{ ...assets[0], genuine: undefined }, assets[1]])).toBe(0.5);
    expect(exchangeability("token", ctx, [{ ...assets[0], genuine: { about: "unknown", attribute: "genuine" } }, assets[1]])).toBe(0);
    expect(exchangeability("token", ctx, [{ ...assets[0], rates: { food: { about: "missing", attribute: "rate" } } }, assets[1]])).toBe(0);
  });

  it("keeps an existing non-exchange trace byte-identical to the pre-change fixture", () => {
    const result = selectAction(evaluate([scored("a", 0.75)]), { mind: "mind.0001", counters: {} }, () => 0.25);
    expect(JSON.stringify(result.trace)).toBe(prePaymentTrace);
  });

  it("r* equates EU to the best other-pair alternative using the same evaluator", () => {
    const evaluated = run([offer(), scored("alternative", 0.5)]);
    const row = evaluated.candidates[0];
    const atReservation = run([offer(row.ratioMin! * 2)]).candidates[0];
    expect(Math.abs(atReservation.expectedUtility - 0.5)).toBeLessThan(1e-9);
    expect(row.outcomes[0].netReward).toBeCloseTo(-0.1 - 2 * 0.4 + 2 * 2);
    expect(row.outcomes[1].netReward).toBe(-0.1);
    const result = selectAction(evaluated, { mind: "mind.0001", counters: {} }, () => 0);
    expect(result.intention.terms).toEqual({ ratioMin: row.ratioMin, giveUnits: 2, host: 3 });
    expect(Object.isFrozen(row.candidate.exchange)).toBe(true);
    const samePair = run([offer(), { ...offer(100), id: "accept" }]).candidates[0];
    expect(Math.abs(run([offer(samePair.ratioMin! * 2)]).candidates[0].expectedUtility)).toBeLessThan(1e-9);
  });

  it("drops offers without rate beliefs and records an ineligible decision trace reason", () => {
    const evaluated = run([offer()], { ...context(), beliefs: { entries: [] } });
    expect(evaluated.candidates.map((row) => row.candidate.action)).toEqual(["wait"]);
    const { trace } = selectAction(evaluated, { mind: "mind.0001", counters: {} }, () => 0);
    expect(trace.ineligible).toMatchObject([{ eligible: false, reason: "No rate belief for offer" }]);
  });

  it("drops offers beyond the keeper bound and offers expecting a loss", () => {
    expect(run([{ ...offer(), cost: R_MAX * 4 }]).ineligible?.[0].reason).toContain("R_MAX");
    expect(run([{ ...offer(), cost: 10 }]).ineligible?.[0].reason).toContain("expects a loss");
    const zero = run([{ ...offer(), outcomeSpace: offer().outcomeSpace.map((o) => ({ ...o, goalProgress: { goal: 1 } })) }]);
    expect(zero.candidates[0].ratioMin).toBe(0);
  });

  it("giving applies lambda to the net loss, only on success", () => {
    const row = run([offer(0.1)]).candidates[0];
    expect(row.outcomes[0].netReward).toBeCloseTo(-0.8);
    expect(row.outcomes[0].value).toBeCloseTo(-0.8 * 2.25);
    expect(row.outcomes[1].value).toBeCloseTo(-0.1 * 2.25);
  });

  it("rejects invalid exchange units and identical assets even when infeasible", () => {
    for (const units of [0, -1, Infinity, NaN]) {
      for (const capacityRequired of [0, 2]) {
        expect(() => run([{ ...offer(units), capacityRequired }])).toThrow("Exchange units");
        expect(() => run([{ ...offer(), exchange: { give: { asset: "token", units }, want: { asset: "food" } }, capacityRequired }])).toThrow("Exchange units");
      }
    }
    expect(() => run([{ ...offer(), exchange: { give: { asset: "food", units: 1 }, want: { asset: "food" } } }])).toThrow("assets must differ");
  });
});
