import { describe, expect, it } from "vitest";
import { streams } from "@rex/kernel";
import { generateActions } from "../src/index.ts";
import type { Candidate, V1CompoundCandidate } from "../src/index.ts";
import { createEightFunctionV2 } from "../experimental/personality-v2/v2.ts";
import { generateTe, teEfficiency, TE_STREAM } from "../experimental/personality-v2/te.ts";
import type { TeContext, TeOptions } from "../experimental/personality-v2/te.ts";
import { action, generation, view, wait } from "./decision-fixtures.ts";

const outcomeSpace = [{ id: "ok", deficits: {}, goalProgress: { goal: 0.6 } }];
const repertoire = [action("slow", { domain: "meta", cost: 4, duration: 4, outcomeSpace }),
  action("fast", { domain: "meta", cost: 1, duration: 1, outcomeSpace })];
function setup(seed = 17, masked = false) {
  const ctx: TeContext = { ...view(), mind: "mind.0001", attended: [],
    candidates: [{ domain: "meta" }], trace: { allocations: [] },
    activeGoal: "goal", random: streams(seed), operations: [] };
  const options: TeOptions = { context: () => ctx, compound: (a, b) => {
    if (a.action === "wait" || b.action === "wait") return undefined;
    return { ...a, action: `${a.action}+${b.action}`, cost: a.cost + b.cost,
      duration: a.duration + b.duration,
      effects: [{ id: "ok", deficits: {}, goalProgress: { goal: 1 } }] };
  } };
  const model = createEightFunctionV2("ENTJ", { te: options,
    mask: masked ? [{ function: "Te", operation: "generate" }] : [] });
  return { ctx, options, model };
}

describe("DESIGN §22.4 Te external reconfiguration", () => {
  it("Te adds an arrangement more efficient under the mind's beliefs that was absent before, and never one built from outside the repertoire", () => {
    const { ctx, model } = setup();
    const before = generation(repertoire, ctx).candidates;
    const result = generateActions({ repertoire, wait, body: { capacity_functional: 1 } }, ctx, model);
    expect(result.candidates.slice(0, before.length)).toEqual(before);
    const added = result.candidates.slice(before.length) as V1CompoundCandidate[];
    expect(added).toHaveLength(2);
    expect(added[0].action).toBe("fast+fast");
    expect(teEfficiency(added[0], ctx.needs.goals[0])).toBeGreaterThan(
      Math.max(...before.map(c => teEfficiency(c, ctx.needs.goals[0]))));
    expect(added[1].action).toBe("slow+fast"); // equal efficiency: repertoire order
    expect(teEfficiency(added[0], ctx.needs.goals[0])).toBeGreaterThan(teEfficiency(added[1], ctx.needs.goals[0]));
    for (const candidate of added) {
      expect(before.some(c => c.action === candidate.action)).toBe(false);
      expect(candidate.steps.every(s => before.some(c => c.action === s.action && c.target === s.target))).toBe(true);
    }
    expect(result.params.kappa).toBe(ctx.params.kappa);
    expect(ctx.operations[0]).toMatchObject({ function: "Te", operation: "generate", executed: true });
  });

  it("ranks subjective expected progress for only the active goal, including cost and duration", () => {
    const base = generation(repertoire).candidates[0];
    const candidate: Candidate = { ...base, cost: 2, duration: 3,
      outcomes: { kind: "categorical", values: ["yes", "no"], probabilities: [0.25, 0.75] },
      effects: [{ id: "yes", deficits: {}, goalProgress: { goal: 1, other: 0 } },
        { id: "no", deficits: {}, goalProgress: { other: 1 } }] };
    expect(teEfficiency(candidate, { id: "goal", progress: 0.5 })).toBeCloseTo(0.125 / 6);
    expect(teEfficiency({ ...candidate, cost: 0 }, { id: "goal", progress: 0.5 })).toBe(Infinity);
    expect(teEfficiency(candidate, { id: "missing", progress: 0 })).toBe(0);
    expect(teEfficiency(candidate, { id: "goal", progress: 1 })).toBe(0);
  });

  it("Num-Q1 rounds 2*A using the named kernel stream and replays exactly", () => {
    const run = (seed: number, allocation: number) => {
      const { ctx, model, options } = setup(seed);
      const record = model.allocation(ctx)[0];
      const controlled = { ...model, allocation: () => [{ ...record, function: "Te" as const,
        A: { att: allocation, eval: allocation } }] };
      const before = generation(repertoire).candidates;
      const result = generateTe(before, { kappa: 7 }, ctx, controlled, options);
      return { added: result.candidates.length - before.length, operations: ctx.operations };
    };
    const counts = new Set<number>();
    for (let seed = 1; seed <= 100; seed++) {
      const draw = streams(seed).get(TE_STREAM, "mind.0001")();
      for (const allocation of [0, 0.001, 0.249, 0.251, 0.5, 0.6, 1]) {
        const expected = 2 * allocation;
        expect(run(seed, allocation).added).toBe(Math.floor(expected) + (draw < expected % 1 ? 1 : 0));
      }
      counts.add(run(seed, 0.6).added);
    }
    expect([...counts].sort()).toEqual([1, 2]);
    expect(run(41, 0.6)).toEqual(run(41, 0.6));
  });

  it("mask, absent goal and absent Te preserve the candidates and consume no random draw", () => {
    for (const mode of ["mask", "goal", "stack"] as const) {
      const { ctx, options, model } = setup(9, mode === "mask");
      const context = mode === "goal" ? { ...ctx, activeGoal: undefined } : ctx;
      const p = mode === "stack" ? createEightFunctionV2("ENFJ", { te: options }) : model;
      const candidates = generation(repertoire).candidates;
      const result = generateTe(candidates, { kappa: 3 }, context, p, { ...options, context: () => context });
      expect(result.candidates).toBe(candidates);
      expect(context.operations).toEqual([]);
      expect(ctx.random.get(TE_STREAM, ctx.mind)()).toBe(streams(9).get(TE_STREAM, ctx.mind)());
    }
  });

  it("does not add duplicate identities, invent missing compositions or mutate inputs", () => {
    const { ctx, model, options } = setup();
    const candidates = generation(repertoire).candidates;
    const snapshot = JSON.stringify({ candidates, needs: ctx.needs, state: model.state });
    const base = { kappa: 3 };
    const none = generateTe(candidates, base, ctx, model, { ...options, compound: () => undefined });
    expect(none.candidates).toBe(candidates);
    expect(none.params).toBe(base);
    const duplicate = generateTe(candidates, base, ctx, model, { ...options, compound: () => candidates[0] });
    expect(duplicate.candidates).toBe(candidates);
    const one = generateTe(candidates, base, ctx, model, { ...options,
      compound: () => ({ ...candidates[0], action: "same", effects: [{ id: "ok", deficits: {}, goalProgress: { goal: 1 } }] }) });
    expect(one.candidates).toHaveLength(candidates.length + 1);
    expect(JSON.stringify({ candidates, needs: ctx.needs, state: model.state })).toBe(snapshot);
  });
});
