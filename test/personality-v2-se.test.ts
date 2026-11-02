import { describe, expect, it } from "vitest";
import { simTime } from "@rex/kernel";
import { generateActions } from "../src/index.ts";
import type { Observation } from "../src/index.ts";
import { createEightFunctionV2 } from "../experimental/personality-v2/v2.ts";
import { seEvidence } from "../experimental/personality-v2/se.ts";
import type { SeContext, SeOptions } from "../experimental/personality-v2/se.ts";
import { action, generation, view, wait } from "./decision-fixtures.ts";

const cue: Observation = { kind: "categorical", cue: "present", about: "door", attribute: "open",
  channel: "sight", t: simTime(1000), value: "yes", model: { P_H: 1, P_FA: 0, q: 0.9 } };
const repertoire = [action("enter", { preconditions: [{ id: "open", probability: () => 0.1 }] })];
function setup() {
  const ctx: SeContext = { ...view(), mind: "mind.0001", t: cue.t,
    attended: [{ category: "space", weight: 1 }], candidates: [{ domain: "meta" }],
    trace: { allocations: [] }, operations: [] };
  const options: SeOptions = { context: () => ctx, isPresent: obs => obs.cue === "present",
    probability: (_candidate, precondition, observations) => {
      const obs = observations.find(o => o.about === "door" && o.attribute === precondition.id);
      return obs?.kind === "categorical" ? (obs.value === "yes" ? obs.model.q : 1 - obs.model.q) : undefined;
    } };
  const model = createEightFunctionV2("ESTP", { se: options });
  const run = (observations: readonly Observation[], personality = model) => generateActions(
    { repertoire, wait, body: { capacity_functional: 1 } }, ctx, personality, observations);
  return { ctx, options, model, run };
}

describe("DESIGN §22.4 Se immediate response", () => {
  it("a candidate ineligible under a stale belief becomes eligible when a present cue supports it; with no present cue, nothing changes", () => {
    const { ctx, model, run } = setup();
    const before = JSON.stringify({ beliefs: ctx.beliefs, needs: ctx.needs, params: ctx.params, state: model.state });
    expect(run([]).candidates.map(c => c.action)).toEqual(["wait"]);
    expect(run([cue]).candidates.map(c => c.action)).toEqual(["enter", "wait"]);
    expect(run([]).checks).toEqual(generation(repertoire, ctx).checks);
    expect(ctx.operations).toHaveLength(1);
    expect(ctx.operations[0]).toMatchObject({ function: "Se", operation: "preconditionEvidence", executed: true,
      output: { beliefP: 0.1, presentP: 0.9, psi: 1, probability: 0.9 } });
    expect(JSON.stringify({ beliefs: ctx.beliefs, needs: ctx.needs, params: ctx.params, state: model.state })).toBe(before);
  });

  it("counts only present-tagged observations from this epoch and matching preconditions", () => {
    const { ctx, run } = setup();
    for (const obs of [{ ...cue, t: simTime(0) }, { ...cue, t: simTime(2000) },
      { ...cue, cue: "remembered" }, { ...cue, about: "other" }, { ...cue, attribute: "other" }]) {
      expect(run([obs]).checks[0].preconditions[0].probability).toBe(0.1);
    }
    expect(ctx.operations).toEqual([]);
    expect(run([{ ...cue, t: simTime(0), value: "no" }, cue]).checks[0].eligible).toBe(true);
  });

  it("Num-Q1 blends by attention share alone, including endpoints and tiny shares", () => {
    const { ctx, options, model } = setup();
    const candidate = generation([action("enter")]).candidates[0];
    const row = model.allocation(ctx).find(r => r.function === "Se")!;
    for (const psi of [0, Number.EPSILON, 0.25, 0.75, 1]) {
      const controlled = { ...model, allocation: () => [{ ...row, A: { att: psi, eval: 1 - psi } }] };
      for (const presentP of [0, 0.9, 1]) {
        const result = seEvidence(candidate, { id: "open", probability: 0.1 }, 0.1, [cue], ctx,
          controlled, { ...options, probability: () => presentP });
        expect(result).toBe((1 - psi) * 0.1 + psi * presentP);
        expect(Number.isFinite(result)).toBe(true);
      }
    }
  });

  it("masked, absent and zero-allocation Se are inert; unsupported probabilities fail", () => {
    const { ctx, options, model, run } = setup();
    for (const inert of [createEightFunctionV2("ESTP", { se: options,
      mask: [{ function: "Se", operation: "preconditionEvidence" }] }),
    createEightFunctionV2("ENTP", { se: options }), createEightFunctionV2("ESTP")]) {
      expect(run([cue], inert).checks[0].eligible).toBe(false);
    }
    const zero = createEightFunctionV2("ESTP", { se: { ...options,
      context: () => ({ ...ctx, attended: [{ category: "meta", weight: 1 }] }) } });
    expect(run([cue], zero).checks[0].eligible).toBe(false);
    expect(ctx.operations).toEqual([]);
    for (const invalid of [-0.1, 1.1, NaN, Infinity]) {
      expect(() => run([cue], createEightFunctionV2("ESTP", {
        se: { ...options, probability: () => invalid } }))).toThrow(RangeError);
    }
    const first = run([cue], model);
    expect(run([cue], model)).toEqual(first);
  });
});
