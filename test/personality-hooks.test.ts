import { createMindsState, MindsRunner } from "../src/mind.ts";
import { mindInput } from "./composition-fixtures.ts";
import { describe, expect, it } from "vitest";
import { generateActions } from "../src/actions.ts";
import { evaluateActions } from "../src/evaluate.ts";
import { selectAction } from "../src/select.ts";
import { nullPersonality } from "../src/personality.ts";
import type { PersonalityModel } from "../src/personality.ts";
import { encodeEpisode, outcomeExpectations } from "../src/memory.ts";
import { comprehend } from "../src/communication/comprehend.ts";
import { categorical, setBelief } from "../src/beliefs.ts";
import { learnOutcome } from "../src/learning.ts";
import { policy } from "../src/policy.ts";
import type { Observation } from "../src/types.ts";
import { action, scored, view, wait } from "./decision-fixtures.ts";

const ctx = view();
const inputs = { repertoire: [scored("a", -0.5), scored("b", 0.75)], wait, body: { capacity_functional: 1 } };
const stub = (hooks: Partial<PersonalityModel>): PersonalityModel => ({ ...nullPersonality, id: "stub", ...hooks });
const evaluate = (p = nullPersonality) => evaluateActions(generateActions(inputs, ctx, p), ctx, [], {}, 1000, p);
const episodeInput = { t: 1000, context: { physical: "red", social: "alone" }, action: "a", outcome: "yes",
  reward: 1, predictionError: 0, attributedCause: "chance", domain: "none" as const };
const memory = { beliefs: setBelief(ctx.beliefs, "peer", "kind", categorical(["yes", "no"], [0.8, 0.2])),
  episodes: [], reliability: [], meaningPool: { fine: [
    { id: "yes", attribute: "kind", value: { kind: "literal" as const, value: "yes" }, counts: { home: 1 } },
    { id: "no", attribute: "kind", value: { kind: "literal" as const, value: "no" }, counts: { home: 1 } },
  ] } };
const message = { id: "m", sender: "speaker", receivers: ["self"], medium: "speech", t: 1000,
  utterances: [{ act: "assert", term: "fine", about: "peer" }] };
const context = { bubble: "home", thetaPre: 0.5 };

describe("DESIGN §22.4 optional engine hooks", () => {
  it("adds every labeled term after base EU and carries raw execution into selection", () => {
    const p = stub({ evaluationTerms: candidates => candidates.map((_, i) => i === 0
      ? [{ label: "coherence", function: "Ti", value: 2 }, { label: "reference", function: "Si", value: -0.25 }] : []) });
    const result = evaluate(p);
    expect(result.candidates.map(c => c.expectedUtility)).toEqual([1.25, 0.75, 0]);
    expect(result.candidates[0].terms?.map(t => t.label)).toEqual(["coherence", "reference"]);
    const selected = selectAction(result, { mind: "self", counters: {} }, () => 0);
    expect(selected.trace.operations).toMatchObject([{ function: "stub", operation: "evaluationTerms", executed: true }]);
    expect(evaluate().candidates.map(c => c.expectedUtility)).toEqual([-0.5, 0.75, 0]);
    expect(() => evaluate(stub({ evaluationTerms: () => [] }))).toThrow();
    expect(() => evaluate(stub({ evaluationTerms: c => c.map(() => [{ label: "bad", value: Infinity }]) }))).toThrow();
  });

  it("applies evidence before thetaPre, passes current observations, and preserves the capacity fence", () => {
    const repertoire = [action("stale", { preconditions: [{ id: "ready", probability: () => 0.1 }] }),
      action("too-heavy", { capacityRequired: 2, preconditions: [{ id: "ready", probability: () => 0.1 }] })];
    const observations: Observation[] = [{ kind: "categorical", cue: "ready", about: "peer", attribute: "ready", t: 1000,
      channel: "sight", value: "yes", model: { P_H: 1, P_FA: 0, q: 1 } }];
    const p = stub({ preconditionEvidence: (_c, condition, belief, obs) => {
      expect(condition.id).toBe("ready"); expect(belief).toBe(0.1);
      return obs.length ? 0.5 : belief;
    } });
    const generation = { ...inputs, repertoire };
    expect(generateActions(generation, ctx, p).candidates.map(c => c.action)).toEqual(["wait"]);
    const result = policy(observations, { beliefs: ctx.beliefs, episodes: [], reliability: [], decision: {
      mind: "self", counters: {}, generation, context: {},
    } }, ctx.needs, p, ctx.params, () => 0, 1000);
    expect(result.trace.candidates.map(c => c.candidate.action)).toEqual(["stale", "wait"]);
    expect(result.trace.operations).toHaveLength(2);
    expect(() => generateActions(generation, ctx, stub({ preconditionEvidence: () => 1.1 }))).toThrow();
  });

  it("modifies selected P(m) before fit, testimony and pending reading, without altering pools", () => {
    const before = JSON.stringify(memory);
    const p = stub({ meaningSelection: (dist, c, v) => {
      expect(dist.probabilities).toEqual([0.5, 0.5]); expect(c).toBe(context); expect(v).toBe(ctx);
      return { ...dist, probabilities: [0, 1] };
    } });
    const result = comprehend(memory, message, context, { personality: p, ctx });
    expect(result.utterances[0].F).toBe(0.2);
    expect(result.utterances[0].pending?.value).toBe("no");
    expect(result.utterances[0].testimony[0].likelihood).toEqual([0.25, 0.75]);
    expect(result.operations?.[0].operation).toBe("meaningSelection");
    expect(JSON.stringify(memory)).toBe(before);
    expect(() => comprehend(memory, message, context, { personality: stub({ meaningSelection: d => ({ ...d, probabilities: [1, 1] }) }), ctx })).toThrow();
    const observation: Observation = { kind: "message", cue: "speech", about: "speaker", attribute: "speech", t: 1000, message, context, channel: "report", model: { P_H: 1, P_FA: 0 } };
    const integrated = policy([observation], { ...memory, decision: { mind: "self", counters: {}, generation: inputs, context: {} } },
      ctx.needs, stub({ meaningSelection: d => ({ ...d, probabilities: [0, 1] }) }), ctx.params, () => 0, 1000);
    expect(integrated.trace.operations?.map(o => o.operation)).toEqual(["meaningSelection"]);
  });

  it("stores strengths at the threshold, drops weaker cues, and conditions counts on stored features only", () => {
    const p = stub({ encoding: () => ({ strengths: { physical: 0.1, social: 0.09 }, tauEnc: 0.1 }) });
    const encoded = encodeEpisode(episodeInput, {}, { personality: p, ctx });
    expect(encoded.episode.context).toEqual({ physical: "red" });
    expect(encoded.episode.strengths).toEqual({ physical: 0.1 });
    expect(encoded.operations?.[0].operation).toBe("encoding");
    const theory = categorical(["yes", "no"], [0.5, 0.5]);
    const changed = { physical: "red", social: "crowd" };
    expect(outcomeExpectations([encoded.episode], "a", changed, theory, 1000).counts).toEqual([1.5, 0.5]);
    expect(outcomeExpectations([encoded.episode], "a", { ...changed, physical: "blue" }, theory, 1000).counts).toEqual([0.5, 0.5]);
    const legacy = encodeEpisode(episodeInput, {}).episode;
    expect(outcomeExpectations([legacy], "a", changed, theory, 1000).counts).toEqual([0.5, 0.5]);
    expect(() => encodeEpisode(episodeInput, {}, { personality: stub({ encoding: () => ({ strengths: {}, tauEnc: 0.1 }) }), ctx })).toThrow();
  });

  it("carries observed meaning operations into the reducer epoch without double comprehension or stale evidence", () => {
    let comprehensionCalls = 0;
    const evidenceCounts: number[] = [];
    const p = stub({ meaningSelection: d => { comprehensionCalls++; return d; },
      preconditionEvidence: (_c, _pre, belief, obs) => { evidenceCounts.push(obs.length); return belief; } });
    const runner = new MindsRunner(createMindsState(7), { baseline: {
      personality: p, generation: { wait, repertoire: [action("ready", { preconditions: [{ id: "ready", probability: () => 1 }] })] },
      learning: { appraise: () => ({ outcome: "ok" }), latents: [] },
    } });
    runner.run({ type: "addMind", mind: mindInput({ memory }) });
    runner.run({ type: "observe", mind: "mind.0001", t: 1000, observations: [{ kind: "message", cue: "speech", about: "speaker",
      attribute: "speech", t: 1000, message, context, channel: "report", model: { P_H: 1, P_FA: 0 } }] });
    runner.run({ type: "decide", mind: "mind.0001", t: 1000 });
    expect(comprehensionCalls).toBe(1);
    expect(runner.state.minds[0].decisions[0].operations?.map(o => o.operation)).toEqual(["meaningSelection", "preconditionEvidence"]);
    runner.run({ type: "decide", mind: "mind.0001", t: 2000 });
    expect(evidenceCounts).toEqual([1, 0]);
    expect(runner.state.minds[0].decisions[1].operations?.map(o => o.operation)).toEqual(["preconditionEvidence"]);
  });

  it("encodes through outcome learning once, and the encode=false control never runs the hook", () => {
    let calls = 0;
    const p = stub({ encoding: () => { calls++; return { strengths: { physical: 1, social: 0 }, tauEnc: 0.1 }; } });
    const evaluated = evaluate();
    const selected = selectAction(evaluated, { mind: "self", counters: {} }, () => 0);
    const input = { mind: "self", intention: selected.intention, evaluation: evaluated.candidates[0],
      outcome: { cause: selected.intention.id, t: 2000, observations: [] }, context: episodeInput.context,
      domain: "none" as const, appraise: () => ({ outcome: "ok" }), latents: [] };
    const learned = learnOutcome(input, memory, ctx, {}, p);
    expect(calls).toBe(1);
    expect(learned.next.episodes[0].context).toEqual({ physical: "red" });
    expect(learned.trace.operations?.[0].operation).toBe("encoding");
    const skipped = learnOutcome({ ...input, encode: false }, memory, ctx, {}, p);
    expect(calls).toBe(1);
    expect(skipped.trace.operations).toEqual([]);
    expect(skipped.episode).toBeUndefined();
  });

  it("absent hooks expose empty operations and leave serialized outputs and contexts unchanged", () => {
    const p = stub({});
    expect(JSON.stringify(evaluate(p))).toBe(JSON.stringify(evaluate()));
    expect(evaluate(p).operations).toEqual([]);
    expect(JSON.stringify(encodeEpisode(episodeInput, {}, { personality: p, ctx }))).toBe(JSON.stringify(encodeEpisode(episodeInput, {})));
    expect(JSON.stringify(comprehend(memory, message, context, { personality: p, ctx }))).toBe(JSON.stringify(comprehend(memory, message, context)));
    expect(selectAction(evaluate(), { mind: "self", counters: {} }, () => 0).trace.operations).toEqual([]);
  });
});
