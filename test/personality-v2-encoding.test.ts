import { describe, expect, it } from "vitest";
import { simTime } from "@rex/kernel";
import { allocateAttention, categorical, encodeEpisode, outcomeExpectations } from "../src/index.ts";
import type { CognitiveFunction, EpisodeInput } from "../src/index.ts";
import { createEightFunctionV2 } from "../experimental/personality-v2/v2.ts";
import { encodeV2 } from "../experimental/personality-v2/encoding.ts";
import type { EncodingContext, EncodingOptions } from "../experimental/personality-v2/encoding.ts";
import { view } from "./decision-fixtures.ts";

function setup() {
  const ctx: EncodingContext = { ...view(), mind: "mind.0001",
    attended: [{ category: "space", weight: 1 }], candidates: [],
    trace: { allocations: [] }, operations: [] };
  const options: EncodingOptions = { context: () => ctx,
    cue: key => ({ attention: key === "place" ? 0.075 : 0.925,
      dimension: key === "place" ? "physical" : "unknown" }) };
  return { ctx, options };
}
const input: EpisodeInput = { t: simTime(0), context: { place: "market", visible: true },
  action: "ask", outcome: "accepted", reward: 1, predictionError: 0,
  attributedCause: "self", domain: "people" };

describe("DESIGN §22.4 attention-weighted encoding", () => {
  it("two configurations given one experience store different features and later predict differently in a context that differs in a feature only one of them stored", () => {
    const { ctx, options } = setup();
    const models = ["ISTJ", "ESTP"].map(type => createEightFunctionV2(type as "ISTJ" | "ESTP", { encoding: options }));
    const episodes = models.map(personality => encodeEpisode(input, {}, { personality, ctx }).episode);
    expect(episodes[0].context).toEqual(input.context);
    expect(episodes[1].context).toEqual({ visible: true });
    expect(episodes[0].strengths).toEqual({ place: 0.15, visible: 0.925 });
    const theory = categorical(["accepted", "refused"], [0.5, 0.5]);
    const predict = (context: EpisodeInput["context"]) => episodes.map(episode =>
      outcomeExpectations([episode], "ask", context, theory, simTime(1000)).distribution.probabilities[0]);
    expect(predict(input.context)[0]).toBe(predict(input.context)[1]);
    const later = predict({ ...input.context, place: "home" });
    expect(later[0]).toBe(0.5);
    expect(later[1]).toBeGreaterThan(later[0]);
    expect(ctx.operations[0]).toMatchObject({ function: "Si", operation: "encoding", executed: true });
    expect(input.context).toEqual({ place: "market", visible: true });
  });

  it("Num-Q1 leaves engine attention a_c unchanged and applies A.att only once", () => {
    const { ctx, options } = setup();
    const model = createEightFunctionV2("ISTJ", { encoding: options });
    const cues = [{ cue: "place", salience: 3, relevance: { space: 1 } },
      { cue: "visible", salience: 37, relevance: { space: 1 } }];
    const categories = [{ id: "space", base: 1, relevance: {} }];
    const baseline = allocateAttention(cues, categories, ctx);
    expect(allocateAttention(cues, categories, ctx, model.pertinence, model)).toEqual(baseline);
    expect(model.pertinence({ space: 1 }, ctx)).toEqual({ space: 1 });
    const row = model.allocation(ctx)[0];
    const before = JSON.stringify({ state: model.state, beliefs: ctx.beliefs, needs: ctx.needs, params: ctx.params });
    for (const share of [0, Number.EPSILON, 0.25, 1]) {
      for (const [f, dimension] of [["Si", "physical"], ["Fi", "valence"], ["Ti", "structural"], ["Fe", "social"]] as const) {
        const controlled = { ...model, allocation: () => [{ ...row, function: f, A: { att: share, eval: 1 - share } }] };
        const result = encodeV2({ x: true }, ctx, controlled, { ...options,
          cue: () => ({ attention: baseline.shares[0], dimension }) });
        expect(result.strengths.x).toBe(baseline.shares[0] * (1 + share));
      }
    }
    expect(JSON.stringify({ state: model.state, beliefs: ctx.beliefs, needs: ctx.needs, params: ctx.params })).toBe(before);
  });

  it("keeps the threshold inclusive, unsupported dimensions neutral, and masks only the encoding contribution", () => {
    const { ctx, options } = setup();
    for (const attention of [0, Number.MIN_VALUE, 0.1 - Number.EPSILON, 0.1, 1]) {
      const model = createEightFunctionV2("ISTJ", { encoding: { ...options,
        cue: () => ({ attention, dimension: "pattern" }) } });
      const result = encodeEpisode(input, {}, { personality: model, ctx });
      expect(result.episode.context).toEqual(attention >= 0.1 ? input.context : {});
      expect(model.encoding!(input.context, ctx).strengths.place).toBe(attention);
    }
    const mask = ["Si", "Fi", "Ti", "Fe"].map(f => ({ function: f as CognitiveFunction, operation: "encoding" }));
    const masked = createEightFunctionV2("ISTJ", { encoding: options, mask });
    ctx.operations.length = 0;
    expect(masked.encoding!(input.context, ctx).strengths.place).toBe(0.075);
    expect(ctx.operations).toEqual([]);
    expect(createEightFunctionV2("ISTJ").encoding).toBeUndefined();
  });

  it("rejects invalid attention shares before trace writes and replays deterministically", () => {
    const { ctx, options } = setup();
    for (const attention of [-1, 1.1, NaN, Infinity]) {
      const model = createEightFunctionV2("ISTJ", { encoding: { ...options,
        cue: () => ({ attention, dimension: "physical" }) } });
      expect(() => model.encoding!(input.context, ctx)).toThrow(RangeError);
    }
    expect(ctx.trace.allocations).toEqual([]);
    expect(ctx.operations).toEqual([]);
    const model = createEightFunctionV2("ISTJ", { encoding: options });
    expect(model.encoding!(input.context, ctx)).toEqual(model.encoding!(input.context, ctx));
    expect(model.encoding!({}, ctx)).toEqual({ strengths: {}, tauEnc: 0.1 });
  });
});
