import { describe, expect, it } from "vitest";
import { comparisonV1, discoverVersions, DOMAINS, FORMULAS, TYPES } from "../bench/personality-models.ts";
import { createEightFunctionV1, nullPersonality } from "../src/index.ts";
import { generation, action, view } from "./decision-fixtures.ts";

const base = { eta: 0.9, alpha0: 2, lambda: 3, confidence: 0.8, weberFraction: 0.2, testimonyFloor: 0.3 };
const memory = { rate: 0.7, d: 0.5, beliefHalfLife: 20 };

describe("DESIGN §9 T-3 comparison adapters", () => {
  it("discovers the frozen v1 manifest and all 16 stacks without changing the default", () => {
    expect(discoverVersions().map((v) => v.id)).toEqual(["v1"]);
    expect(TYPES).toHaveLength(16);
    expect(nullPersonality.id).toBe("null");
    expect(() => comparisonV1("ENFJ", ["F99"])).toThrow();
  });

  it.each(TYPES)("%s all hook formulas off is identity in every domain; full adapter matches frozen v1", (type) => {
    const full = comparisonV1(type), frozen = createEightFunctionV1(type, { etaMin: 0.01 });
    const off = comparisonV1(type, FORMULAS), ctx = view();
    const candidates = generation([action("candidate")]).candidates;
    expect(off.pertinence({ food: 2, person: 1 }, ctx)).toEqual({ food: 2, person: 1 });
    expect(full.pertinence({ food: 2, person: 1 }, ctx)).toEqual(frozen.pertinence({ food: 2, person: 1 }, ctx));
    expect(off.generate(candidates, { kappa: 0.3 }, ctx)).toEqual({ candidates, params: { kappa: 0.3 } });
    for (const domain of DOMAINS) {
      expect(off.interpret(base, domain, ctx)).toEqual(base);
      expect(off.learning(memory, domain, ctx)).toEqual(memory);
      expect(full.interpret(base, domain, ctx)).toEqual(frozen.interpret(base, domain, ctx));
      expect(full.learning(memory, domain, ctx)).toEqual(frozen.learning(memory, domain, ctx));
    }
  });

  it("F1/F12 ablations preserve the other formula after eta saturation", () => {
    const ctx = view();
    const full = comparisonV1("ENFJ").interpret(base, "people", ctx);
    const noF1 = comparisonV1("ENFJ", ["F1"]).interpret(base, "people", ctx);
    const noF12 = comparisonV1("ENFJ", ["F12"]).interpret(base, "people", ctx);
    expect(full.eta).toBe(1);
    expect(noF1.eta).toBe(base.eta);
    expect(noF1.alpha0).toBe(3.5);
    expect(noF12.alpha0).toBeCloseTo(1.6);
    expect(noF1.lambda).toBe(full.lambda);
    expect(noF12.eta).toBe(full.eta);
  });

  it("F4/F5 ablations remove only their learning multiplier and F8 only its retention controls", () => {
    const ctx = view();
    const full = comparisonV1("ENTP").learning(memory, "adaptation", ctx);
    expect(full.rate).toBeCloseTo(1.4);
    expect(comparisonV1("ENTP", ["F4"]).learning(memory, "adaptation", ctx).rate).toBe(memory.rate);
    expect(comparisonV1("INTJ", ["F5"]).learning(memory, "adaptation", ctx).rate).toBe(memory.rate);
    expect(comparisonV1("ISFJ", ["F8"]).learning(memory, "people", ctx)).toEqual(memory);
  });
});
