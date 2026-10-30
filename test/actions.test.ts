import { describe, expect, it } from "vitest";
import { generateActions } from "../src/actions.ts";
import { categorical, getBelief, setBelief } from "../src/beliefs.ts";
import { nullPersonality } from "../src/personality.ts";
import { action, generation, view, wait } from "./decision-fixtures.ts";

describe("DESIGN §2.4 host-data generation", () => {
  it("filters below θ_pre and above body.capacity_functional, including exact boundaries", () => {
    const definitions = [0.4999, 0.5, 0.8].flatMap((probability, i) => [0.4, 0.5, 0.6].map((capacity, j) =>
      action(`host.${i}.${j}`, { capacityRequired: capacity,
        preconditions: [{ id: "condition", probability: () => probability }] })));
    const result = generateActions({ repertoire: definitions, wait, body: { capacity_functional: 0.5 } }, view());
    expect(result.candidates.map((candidate) => candidate.action)).toEqual(["host.1.0", "host.1.1", "host.2.0", "host.2.1", "wait"]);
    expect(result.checks.filter((check) => !check.eligible)).toHaveLength(5);
    expect(result.thetaPre).toBe(0.5);
    expect(result.capacityFunctional).toBe(0.5);
    expect(generateActions({ repertoire: definitions, wait, body: { capacity_functional: 0 }, thetaPre: 1 }, view()).candidates).toHaveLength(1);
  });

  it("evaluates preconditions and the pure naive model on the supplied beliefs only", () => {
    const beliefs = setBelief(view().beliefs, "object", "present", categorical(["yes", "no"], [0.7, 0.3]));
    const probability = (store: typeof beliefs) => {
      expect(store).toBe(beliefs);
      const belief = getBelief(store, "object", "present");
      return belief?.kind === "categorical" ? belief.probabilities[0] : 0;
    };
    const host = action("arbitrary.host.id", { preconditions: [{ id: "seen", probability }],
      outcomeSpace: [{ id: "yes", deficits: {}, goalProgress: {} }, { id: "no", deficits: {}, goalProgress: {} }],
      naiveModel: (store) => categorical(["yes", "no"], [probability(store), 1 - probability(store)]) });
    const generated = generation([host], { ...view(), beliefs });
    expect(generated.candidates[0].outcomes.probabilities[0]).toBeCloseTo(0.7);
    expect(generated.candidates[0].preconditions).toEqual([{ id: "seen", probability: 0.7 }]);
  });

  it("an empty repertoire always yields the host-named wait even at zero capacity", () => {
    const result = generateActions({ repertoire: [], wait: action("host.idle.918"), body: { capacity_functional: 0 } }, view());
    expect(result.candidates.map((candidate) => candidate.action)).toEqual(["host.idle.918"]);
  });

  it("the generate hook reorders/adds feasible compounds, changes κ, and cannot remove the fallback", () => {
    const ctx = view();
    const result = generateActions({ repertoire: [action("a"), action("b")], wait, body: { capacity_functional: 1 } }, ctx, {
      ...nullPersonality, generate: (candidates, base, mind) => {
        expect(mind).toBe(ctx);
        expect(base).toEqual({ kappa: 0 });
        return { candidates: [candidates[1], { ...candidates[0], action: "compound", duration: 2 },
          { ...candidates[0], action: "too.hard", capacityRequired: 2 },
          { ...candidates[0], action: "not.believed", preconditions: [{ id: "x", probability: 0.4 }] }], params: { kappa: 8 } };
      },
    });
    expect(result.candidates.map((candidate) => candidate.action)).toEqual(["b", "compound", "wait"]);
    expect(result.params.kappa).toBe(8);
  });

  it("all believed prerequisites must pass without multiplying correlated probabilities", () => {
    expect(generation([action("a", { preconditions: [
      { id: "x", probability: () => 0.6 }, { id: "y", probability: () => 0.6 },
    ] })]).candidates).toHaveLength(2);
  });

  it("rejected affordances do not evaluate naive models whose prerequisites are absent", () => {
    const result = generation([action("blocked", {
      preconditions: [{ id: "known", probability: () => 0 }],
      naiveModel: () => { throw new Error("Absent belief must not be queried"); },
    })]);
    expect(result.candidates.map((candidate) => candidate.action)).toEqual(["wait"]);
  });

  it("rejects invalid host data, ambiguous ids, and invalid hook parameters", () => {
    for (const overrides of [{ duration: 0 }, { duration: 1.5 }, { cost: -1 }, { capacityRequired: NaN },
      { preconditions: [{ id: "x", probability: () => 1.1 }] }, { outcomeSpace: [] },
      { outcomeSpace: [{ id: "mismatch", deficits: {}, goalProgress: {} }] },
      { outcomeSpace: [{ id: "ok", deficits: { x: Infinity }, goalProgress: {} }] }]) {
      expect(() => generation([action("a", overrides)])).toThrow(RangeError);
    }
    expect(() => generation([wait])).toThrow(RangeError);
    expect(() => generateActions({ repertoire: [], wait: action("wait", { cost: 1 }), body: { capacity_functional: 1 } }, view())).toThrow();
    for (const thetaPre of [-1, 2, NaN]) expect(() => generateActions({ repertoire: [], wait, thetaPre, body: { capacity_functional: 1 } }, view())).toThrow();
    expect(() => generateActions({ repertoire: [], wait, body: { capacity_functional: -1 } }, view())).toThrow();
    expect(() => generateActions({ repertoire: [], wait, body: { capacity_functional: 1 } }, view(), {
      ...nullPersonality, generate: (candidates) => ({ candidates, params: { kappa: -1 } }),
    })).toThrow();
  });
});
