import { canonical, streams } from "@rex/kernel";
import { describe, expect, it } from "vitest";
import { existence, setBelief } from "../src/beliefs.ts";
import { nullPersonality } from "../src/personality.ts";
import { policy } from "../src/policy.ts";
import type { PolicyMemoryState } from "../src/policy.ts";
import type { Stimulus } from "../src/types.ts";
import { configs, mindInput, observed } from "./composition-fixtures.ts";

function inputs(): PolicyMemoryState {
  const mind = mindInput();
  return { ...mind.memory, decision: { mind: "cognition/mind.0001", counters: {}, context: {},
    generation: { ...configs.baseline.generation, body: { capacity_functional: 1 } } } };
}
const draw = () => streams(7).get("cognition.decision.select", "cognition/mind.0001");

describe("policy composition (DESIGN §3)", () => {
  it("is pure for the same subjective inputs and stream state; returns serializable memory", () => {
    const m = inputs();
    const before = canonical({ beliefs: m.beliefs, episodes: m.episodes, reliability: m.reliability });
    const mind = mindInput();
    const run = () => policy([observed()], m, mind.needs, nullPersonality, mind.params!, draw(), 1000);
    const first = run();
    expect(canonical(first)).toBe(canonical(run()));
    expect(canonical({ beliefs: m.beliefs, episodes: m.episodes, reliability: m.reliability })).toBe(before);
    expect(structuredClone(first)).toEqual(first);
    expect(first.intention.id).toBe("int.0001");
    expect(first.counters).toEqual({ int: 1 });
  });

  it("updates beliefs before host generation and records the beliefs used by EU", () => {
    const mind = mindInput();
    const result = policy([observed()], inputs(), mind.needs, nullPersonality, mind.params!, draw(), 1000);
    expect(result.trace.candidates[0].candidate.outcomes.probabilities[0]).toBeCloseTo(0.1);
    expect(result.trace.beliefs).toEqual(result.next.beliefs);
    expect(result.trace.candidates.map((candidate) => candidate.probability)).toEqual([0.5, 0.5]);
  });

  it("applies null detection evidence to existence while retaining attribute knowledge", () => {
    const m = inputs();
    const memory = { ...m, beliefs: setBelief(m.beliefs, "host/owner", "exists", existence(0.5)) };
    const mind = mindInput();
    const result = policy([{ cue: "empty", about: "host/owner", attribute: "generosity", channel: "sight", t: 1000,
      kind: "null", model: { P_H: 0.9, P_FA: 0.1 } }], memory, mind.needs, nullPersonality, mind.params!, draw(), 1000);
    expect(result.next.beliefs.entries[0].belief).toEqual(m.beliefs.entries[0].belief);
    expect(result.next.beliefs.entries[1].belief).toEqual({ kind: "existence", probability: expect.closeTo(0.1) });
  });

  it("retains commitment without drawing and never rehearses episodes during expectation reads", () => {
    const mind = mindInput();
    const params = { ...mind.params!, kappa: 1 };
    const initial = policy([], inputs(), mind.needs, nullPersonality, params, draw(), 1000);
    const m = inputs();
    const result = policy([], { ...m, decision: { ...m.decision, counters: initial.counters, current: initial.intention } },
      mind.needs, nullPersonality, params, () => { throw new Error("Must not draw"); }, 2000);
    expect(result.intention).toEqual(initial.intention);
    expect(result.counters).toEqual(initial.counters);
    expect(result.trace.commitment.kept).toBe(true);
    expect(result.next.episodes).toEqual(m.episodes);
  });

  it("honors eta=0 even when the interpret hook requests learning", () => {
    const mind = mindInput();
    const m = inputs();
    const result = policy([observed()], m, mind.needs, { ...nullPersonality,
      interpret: (base) => ({ ...base, eta: 1 }) }, { ...mind.params!, eta: 0 }, draw(), 1000);
    expect(result.next.beliefs).toEqual(m.beliefs);
  });

  it("rejects future observations without altering inputs", () => {
    const mind = mindInput();
    expect(() => policy([observed(2000)], inputs(), mind.needs, nullPersonality, mind.params!, draw(), 1000))
      .toThrow("future");
  });

  it("never accepts a Stimulus at the policy boundary (compile-time fence)", () => {
    const typecheck = (stimulus: Stimulus) => {
      const mind = mindInput();
      // @ts-expect-error Objective input lacks the observation reliability model and timestamp.
      policy([stimulus], inputs(), mind.needs, nullPersonality, mind.params!, draw(), 1000);
    };
    expect(typeof typecheck).toBe("function");
  });
});
