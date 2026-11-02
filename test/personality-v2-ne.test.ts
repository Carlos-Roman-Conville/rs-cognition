import { describe, expect, it } from "vitest";
import { simTime, streams } from "@rex/kernel";
import { generateActions } from "../src/index.ts";
import type { Episode, V1CompoundCandidate } from "../src/index.ts";
import { createEightFunctionV2 } from "../experimental/personality-v2/v2.ts";
import { generateNe, neNovelty, NE_STREAM } from "../experimental/personality-v2/ne.ts";
import type { NeContext, NeOptions } from "../experimental/personality-v2/ne.ts";
import { action, generation, view, wait } from "./decision-fixtures.ts";

const repertoire = [action("a"), action("b")];
const episode = (action: string, context: Episode["context"] = { place: "here" }): Episode => ({
  id: "ep.1", t: simTime(0), retrievals: [], action, context, outcome: "ok", reward: 0,
  predictionError: 0, attributedCause: "unknown", domain: "strategy",
});
function setup(episodes: readonly Episode[] = [], seed = 17) {
  const ctx: NeContext = { ...view(), mind: "mind.0001", attended: [],
    candidates: [{ domain: "adaptation" }], trace: { allocations: [] },
    episodes, context: { place: "here" }, random: streams(seed), operations: [] };
  const options: NeOptions = { context: () => ctx, compound: (a, b) => {
    if (a.action === "wait" || b.action === "wait") return undefined;
    return { ...a, action: `${a.action}+${b.action}`, duration: a.duration + b.duration };
  } };
  const model = createEightFunctionV2("ENTP", { ne: options });
  return { ctx, options, model };
}

describe("DESIGN §22.4 Ne branching", () => {
  it("Ne adds untried combinations; when all have been tried, it adds the least-tried", () => {
    for (const [history, expected] of [
      [["a+a", "a+b"], ["b+a", "b+b"]],
      [["a+a", "a+a", "a+a", "a+b", "a+b", "b+a", "b+b"], ["b+a", "b+b"]],
    ] as const) {
      const { ctx, model } = setup(history.map(a => episode(a)));
      const before = generation(repertoire, ctx).candidates;
      const result = generateActions({ repertoire, wait, body: { capacity_functional: 1 } }, ctx, model);
      expect(result.candidates.slice(0, before.length)).toEqual(before);
      const added = result.candidates.slice(before.length) as V1CompoundCandidate[];
      expect(added.map(c => c.action)).toEqual(expected);
      expect(added.every(c => c.steps.length === 2 && c.steps.every(s => before.some(
        original => original.action === s.action && original.target === s.target)))).toBe(true);
      expect(result.params.kappa).toBe(ctx.params.kappa);
      expect(ctx.operations[0]).toMatchObject({ function: "Ne", operation: "generate", executed: true });
    }
  });

  it("counts only the ordered pair in matching subjective contexts, once per episode", () => {
    const { ctx } = setup([episode("a+b"), { ...episode("a+b"), retrievals: [simTime(1), simTime(2)] },
      episode("b+a"), episode("a+b", { place: "elsewhere" }),
      episode("a+b", { place: "here", extra: true })]);
    expect(neNovelty("a+b", ctx)).toBe(1 / 3);
    expect(neNovelty("b+a", ctx)).toBe(1 / 2);
    expect(neNovelty("b+b", ctx)).toBe(1);
    expect(neNovelty("a+b", { ...ctx, context: { place: "elsewhere" } })).toBe(1 / 2);
    const encoded = { ...episode("a+b", {}), strengths: {} };
    expect(neNovelty("a+b", { ...ctx, episodes: [encoded] })).toBe(1 / 2);
  });

  it("Num-Q1 uses seeded stochastic rounding of 2*A and deterministic replay", () => {
    const run = (seed: number, allocation: number) => {
      const { ctx, model, options } = setup([], seed);
      const record = model.allocation(ctx)[0];
      const controlled = { ...model, allocation: () => [{ ...record, function: "Ne" as const,
        A: { att: allocation, eval: allocation } }] };
      const before = generation(repertoire).candidates;
      const result = generateNe(before, { kappa: 7 }, ctx, controlled, options);
      return { added: result.candidates.length - before.length, operations: ctx.operations,
        next: ctx.random.get(NE_STREAM, ctx.mind)() };
    };
    const counts = new Set<number>();
    for (let seed = 1; seed <= 100; seed++) {
      for (const allocation of [0, 0.001, 0.249, 0.251, 0.5, 0.6, 1]) {
        const random = streams(seed).get(NE_STREAM, "mind.0001");
        const expected = 2 * allocation;
        const fraction = expected % 1;
        const count = Math.floor(expected) + (fraction > 0 && random() < fraction ? 1 : 0);
        const result = run(seed, allocation);
        expect(result.added).toBe(count);
        expect(result.next).toBe(random());
      }
      counts.add(run(seed, 0.6).added);
    }
    expect([...counts].sort()).toEqual([1, 2]);
    expect(run(41, 0.6)).toEqual(run(41, 0.6));
  });

  it("mask and absent Ne are inert and consume no random draw", () => {
    for (const masked of [false, true]) {
      const { ctx, options } = setup([], 9);
      const model = createEightFunctionV2(masked ? "ENTP" : "ENTJ", { ne: options,
        mask: masked ? [{ function: "Ne", operation: "generate" }] : [] });
      const candidates = generation(repertoire).candidates;
      expect(model.generate(candidates, { kappa: 3 }, ctx).candidates).toBe(candidates);
      expect(ctx.operations).toEqual([]);
      expect(ctx.random.get(NE_STREAM, ctx.mind)()).toBe(streams(9).get(NE_STREAM, ctx.mind)());
    }
  });

  it("preserves inputs, deduplicates identities and caps additions at supported compositions", () => {
    const { ctx, model, options } = setup();
    const candidates = generation(repertoire).candidates;
    const snapshot = JSON.stringify({ candidates, needs: ctx.needs, episodes: ctx.episodes, state: model.state });
    const base = { kappa: 3 };
    for (const compound of [() => undefined, () => candidates[0]]) {
      const result = generateNe(candidates, base, ctx, model, { ...options, compound });
      expect(result.candidates).toBe(candidates);
      expect(result.params).toBe(base);
    }
    const result = generateNe(candidates, base, ctx, model, { ...options,
      compound: () => ({ ...candidates[0], action: "same" }) });
    expect(result.candidates).toHaveLength(candidates.length + 1);
    expect(JSON.stringify({ candidates, needs: ctx.needs, episodes: ctx.episodes, state: model.state })).toBe(snapshot);
  });

  it("Te and Ne compose only original entries and Ne skips Te additions", () => {
    const { ctx, options } = setup();
    const teContext = { ...ctx, activeGoal: "goal", candidates: [{ domain: "meta" }] };
    const model = createEightFunctionV2("ENFP", { ne: options, te: {
      context: () => teContext, compound: (a, b, mind) => {
        const candidate = options.compound(a, b, mind);
        return candidate && { ...candidate, effects: [{ id: "ok", deficits: {}, goalProgress: { goal: 1 } }] };
      },
    } });
    const before = generation(repertoire).candidates;
    const result = model.generate(before, { kappa: 3 }, ctx);
    const added = result.candidates.slice(before.length) as V1CompoundCandidate[];
    expect(added.map(c => c.action)).toEqual(["a+a", "a+b", "b+a", "b+b"]);
    expect(added.every(c => c.steps.every(s => ["a", "b"].includes(s.action)))).toBe(true);
    expect(ctx.operations.map(o => o.function)).toEqual(["Te", "Ne"]);
  });
});
