import { describe, expect, it } from "vitest";
import { comprehend, reconstruct, selectMeaning } from "../src/index.ts";
import type { ComprehensionView, MeaningPool, Message } from "../src/index.ts";
import { comprehendV2 } from "../experimental/personality-v2/fe.ts";
import type { V2CommunicationContext } from "../experimental/personality-v2/fe.ts";
import { createEightFunctionV2 } from "../experimental/personality-v2/v2.ts";
import type { EightFunctionV2, V2Context } from "../experimental/personality-v2/v2.ts";
import { view } from "./decision-fixtures.ts";

const pool: MeaningPool = { word: [
  { id: "warm", attribute: "tone", value: { kind: "literal", value: "warm" }, counts: { home: 3, a: 9, b: 1 } },
  { id: "cold", attribute: "tone", value: { kind: "literal", value: "cold" }, counts: { home: 7, a: 1, b: 9 } },
] };
const input: ComprehensionView = { beliefs: view().beliefs, reliability: [], meaningPool: pool };
const message: Message = { id: "msg", sender: "speaker", receivers: ["self"], medium: "speech", t: 0,
  utterances: [{ act: "assert", term: "word", about: "subject" }] };
const context: V2CommunicationContext = { bubble: "home", thetaPre: 0.5, poolConcentration: 2,
  audience: [{ listener: "one", bubble: "a" }, { listener: "two", bubble: "b" }] };
const ctx = (domain = "people"): V2Context => ({ ...view(), mind: "self", attended: [],
  candidates: [{ domain }], trace: { allocations: [] } });

describe("FUNCTION-DESIGN §6.4 Fe audience map", () => {
  it("keeps own §5.1 reading byte-identical with and without Fe and returns the hook input as is", () => {
    const model = createEightFunctionV2("ESTP");
    const base = comprehend(input, message, context);
    const result = comprehendV2(input, message, context, model, ctx());
    const { audienceMap: _map, ...own } = result.utterances[0];
    expect(JSON.stringify(own)).toBe(JSON.stringify(base.utterances[0]));
    const dist = base.utterances[0].distribution!;
    expect(model.meaningSelection!(dist, context, ctx())).toBe(dist);
    expect(result.pool).toEqual(base.pool);
    expect(result.readings).toEqual(base.readings);
  });

  it("records two distinct unpooled §5.1 distributions in listener order and snapshots execution", () => {
    const result = comprehendV2(input, message, context, createEightFunctionV2("ESTP"), ctx());
    const map = result.utterances[0].audienceMap!;
    expect(map).toEqual(context.audience!.map(a => ({ ...a,
      distribution: selectMeaning(pool, "word", a.bubble, context.poolConcentration) })));
    expect(map[0].distribution).not.toEqual(map[1].distribution);
    expect(result.operations).toEqual([{ function: "Fe", operation: "meaningSelection", executed: true,
      output: { term: "word", audienceMap: map } }]);
    expect((result.operations![0].output as { audienceMap: unknown }).audienceMap).not.toBe(map);
  });

  it("omits maps and executions without listeners, positive Fe allocation, or an enabled operation", () => {
    const cases: [V2CommunicationContext, EightFunctionV2, V2Context][] = [
      [{ ...context, audience: undefined }, createEightFunctionV2("ESTP"), ctx()],
      [{ ...context, audience: [] }, createEightFunctionV2("ESTP"), ctx()],
      [context, createEightFunctionV2("ESTP"), ctx("space")],
      [context, createEightFunctionV2("ENTJ"), ctx()],
      [context, createEightFunctionV2("ESTP", { mask: [{ function: "Fe", operation: "meaningSelection" }] }), ctx()],
    ];
    for (const [c, model, v] of cases) {
      const result = comprehendV2(input, message, c, model, v);
      expect(result.utterances[0]).not.toHaveProperty("audienceMap");
      expect(result.operations ?? []).toEqual([]);
      expect(JSON.stringify(result)).toBe(JSON.stringify(comprehend(input, message, c)));
    }
  });

  it("replays identically and changes no input or personality state", () => {
    const run = () => {
      const model = createEightFunctionV2("ESTP");
      const before = JSON.stringify({ input, message, context, state: model.state });
      const result = comprehendV2(input, message, context, model, ctx());
      expect(JSON.stringify({ input, message, context, state: model.state })).toBe(before);
      return JSON.stringify(result);
    };
    expect(run()).toBe(run());
  });

  it("uses pool updates at each utterance, preserves same-bubble listeners, and represents unknown terms", () => {
    const declared = { id: "new", attribute: "tone", value: { kind: "literal" as const, value: "new" } };
    const msg = { ...message, utterances: [...message.utterances,
      { ...message.utterances[0], declared }, { ...message.utterances[0], term: "unknown" }] };
    const c = { ...context, audience: [...context.audience!, { listener: "three", bubble: "a" }],
      usage: [{ term: "word", meaning: declared, bubble: "b" }],
      confirmed: [{ term: "word", meaning: "warm", bubble: "a" }] };
    const result = comprehendV2(input, msg, c, createEightFunctionV2("ESTP"), ctx());
    let updated = reconstruct(reconstruct(pool, "word", declared, "b"), "word", pool.word[0], "a");
    for (let i = 0; i < 2; i++) {
      if (i === 1) updated = reconstruct(updated, "word", declared, "home");
      expect(result.utterances[i].audienceMap![0].distribution).toEqual(selectMeaning(updated, "word", "a", 2));
      expect(result.utterances[i].audienceMap![2].distribution).toEqual(result.utterances[i].audienceMap![0].distribution);
    }
    expect(result.utterances[2].audienceMap!.every(a => a.distribution === null)).toBe(true);
  });
});
