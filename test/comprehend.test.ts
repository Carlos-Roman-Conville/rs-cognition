import { describe, expect, it } from "vitest";
import { categorical, getBelief, setBelief, updateCategorical, updateTestimony } from "../src/beliefs.ts";
import { comprehend, reconstruct, reinforce, selectMeaning } from "../src/communication/comprehend.ts";
import { bubbleExposure } from "../src/communication/exposure.ts";
import type { MeaningCandidate, MeaningPool, Message } from "../src/communication/types.ts";
import { perceive } from "../src/perception.ts";
import { observeMemory, policy } from "../src/policy.ts";
import { nullPersonality } from "../src/personality.ts";
import { createEightFunctionV1 } from "../src/personality/eight-function/v1.ts";
import { DEFAULT_COGNITIVE_PARAMS } from "../src/types.ts";
import type { Episode, MemoryState, Stimulus } from "../src/types.ts";
import { prePaymentTrace, scored, view, wait } from "./decision-fixtures.ts";
import { configs, mindInput } from "./composition-fixtures.ts";
import { createMindsState, MindsRunner } from "../src/mind.ts";

const yes: MeaningCandidate = { id: "yes", attribute: "generosity", value: { kind: "literal", value: "yes" } };
const no: MeaningCandidate = { id: "no", attribute: "generosity", value: { kind: "literal", value: "no" } };
const pool: MeaningPool = { fine: [{ ...yes, counts: { home: 3, work: 1 } }, { ...no, counts: { home: 1, work: 5 } }] };
const message: Message = { id: "msg.1", sender: "speaker", receivers: ["listener"], medium: "speech", t: 1000,
  utterances: [{ act: "assert", term: "fine", about: "host/owner", claim: { attribute: "generosity", value: "no" } }] };
const context = { bubble: "home", thetaPre: 0.5 };
const memory = (p = 0.8, meaningPool: MeaningPool = pool): MemoryState => ({
  beliefs: setBelief({ entries: [] }, "host/owner", "generosity", categorical(["yes", "no"], [p, 1 - p])),
  episodes: [], reliability: [{ speaker: "speaker", belief: { alpha: 3, beta: 1 } }], meaningPool,
});
const stimulus: Stimulus = { kind: "message", message, context, cue: "speech", about: "speaker", attribute: "speech",
  channel: "report", present: true, detectability: 100, relevance: {}, domain: "people" };
const sensory = { k: 0, weberFractions: { report: 0, sight: 0, sound: 0, touch: 0 } };

describe("DESIGN section 5.1 comprehension", () => {
  it("uses the hand-computed two-level Dirichlet and falls back in unfamiliar bubbles", () => {
    const selected = selectMeaning(pool, "fine", "home", 2)!;
    expect(selected.probabilities[0]).toBeCloseTo(3.8 / 6, 14);
    expect(selected.probabilities[1]).toBeCloseTo(2.2 / 6, 14);
    expect(selectMeaning(pool, "fine", "alien", 2)?.probabilities).toEqual([0.4, 0.6]);
    expect(selectMeaning({}, "unknown", "home")).toBeUndefined();
    expect(selectMeaning({ fine: [{ ...yes, counts: {} }] }, "fine", "home")).toBeUndefined();
    expect(() => selectMeaning(pool, "fine", "home", 0)).toThrow();
    expect(() => selectMeaning({ fine: [{ ...yes, counts: { home: -1 } }] }, "fine", "home")).toThrow();
    const extreme: MeaningPool = { fine: [{ ...yes, counts: { a: 1e308, b: 1e308 } }, { ...no, counts: { a: 1e308 } }] };
    expect(selectMeaning(extreme, "fine", "alien")?.probabilities).toEqual([2 / 3, 1 / 3]);
  });
  it("reduces to testimony exactly for one meaning and mixes multiple readings", () => {
    const single = memory(0.8, reconstruct({}, "fine", yes, "home"));
    const result = comprehend(single, message, context).utterances[0];
    expect(result.testimony[0].likelihood).toEqual([0.875, 0.125]);
    const prior = getBelief(single.beliefs, "host/owner", "generosity")!;
    if (prior.kind !== "categorical") throw new Error("fixture");
    for (const eta of [0, 0.3, 1]) expect(JSON.stringify(updateCategorical(prior, result.testimony[0].likelihood, eta)))
      .toBe(JSON.stringify(updateTestimony(prior, "yes", single.reliability[0].belief, eta)));
    const mixed = comprehend(memory(), message, { ...context, poolConcentration: 2 }).utterances[0];
    expect(mixed.testimony[0].likelihood[0]).toBeCloseTo((3.8 * 0.875 + 2.2 * 0.125) / 6);
  });
  it("records low fit and missing-pool confusion, but no high-fit cue", () => {
    const single = reconstruct({}, "fine", yes, "home");
    const cue = comprehend(memory(0.1, single), message, context).utterances[0].confusion;
    expect(cue).toMatchObject({ speaker: "speaker", term: "fine" });
    expect(cue?.F).toBeCloseTo(0.1, 14);
    expect(comprehend(memory(0.9, single), message, context).utterances[0].confusion).toBeUndefined();
    expect(comprehend(memory(0.9, {}), message, context).utterances[0].confusion?.F).toBe(0);
  });
  it("adds one count for declarations, usage and confirmed reinforcement without mutating inputs", () => {
    const original = JSON.stringify(pool);
    const declared = { ...message, utterances: [{ ...message.utterances[0], declared: yes }] };
    const result = comprehend(memory(), declared, context);
    expect(result.pool.fine[0].counts.home).toBe(4);
    expect(result.utterances[0].distribution?.probabilities[0]).toBeLessThan(1);
    const used = comprehend(memory(), message, { ...context, usage: [{ term: "new", meaning: yes, bubble: "work" }],
      confirmed: [{ term: "fine", meaning: "no", bubble: "home" }] });
    expect(used.pool.new[0].counts.work).toBe(1);
    expect(used.pool.fine[1].counts.home).toBe(2);
    expect(reinforce(pool, "fine", "yes", "home").fine[0].counts.home).toBe(4);
    expect(JSON.stringify(pool)).toBe(original);
    expect(() => reinforce(pool, "fine", "absent", "home")).toThrow();
  });
  it("splits a shared episode once when deriving normalized bubble exposure", () => {
    const episode: Episode = { id: "ep.1", t: 0, retrievals: [], context: { "bubble:a": true, "bubble:b": true },
      action: "talk", outcome: "ok", reward: 0, predictionError: 0, attributedCause: "self", domain: "people" };
    expect(bubbleExposure([episode, { ...episode, id: "ep.2", context: { "bubble:a": true } }], 1000, DEFAULT_COGNITIVE_PARAMS))
      .toEqual({ a: 0.75, b: 0.25 });
    expect(bubbleExposure([], 1000, DEFAULT_COGNITIVE_PARAMS)).toEqual({});
  });
  it("reuses perception detection and the mind observe update, retaining pools through decisions", () => {
    expect(perceive([stimulus], [0], sensory, 1000, () => 0)).toEqual([]);
    expect(perceive([{ ...stimulus, detectability: 0 }], [1], sensory, 1000, () => 0.9)[0].kind).toBe("null");
    const observations = perceive([stimulus], [1], sensory, 1000, () => 0);
    const runner = new MindsRunner(createMindsState(72), configs);
    const initial = memory(0.1, reconstruct({}, "fine", yes, "home"));
    runner.run({ type: "addMind", mind: mindInput({ memory: initial }) });
    const result = runner.run({ type: "observe", mind: "mind.0001", t: 1000, observations });
    expect(result.observationTrace?.updates).toHaveLength(1);
    expect(result.observationTrace?.comprehension?.[0].F).toBeCloseTo(0.1, 14);
    expect(runner.state.minds[0].memory.confusionCues).toHaveLength(1);
    runner.run({ type: "decide", mind: "mind.0001", t: 1000 });
    expect(runner.state.minds[0].memory.meaningPool).toEqual(initial.meaningPool);
    const frozen = observeMemory(observations, initial, { needs: [], goals: [] }, nullPersonality,
      { ...DEFAULT_COGNITIVE_PARAMS, eta: 0 }, 1000);
    const prior = getBelief(initial.beliefs, "host/owner", "generosity")!;
    if (prior.kind !== "categorical") throw new Error("fixture");
    expect(frozen.beliefs).toEqual(setBelief(initial.beliefs, "host/owner", "generosity",
      updateTestimony(prior, "yes", initial.reliability[0].belief, 0)));
  });
  it("passes concentration through null and personality v1 without modifying its value", () => {
    const base = { eta: 1, alpha0: 1, lambda: 1, confidence: 1, weberFraction: 0, testimonyFloor: 0, poolConcentration: 7 };
    for (const personality of [nullPersonality, createEightFunctionV1("INTJ", { etaMin: 0.1 })]) {
      expect(personality.interpret(base, "none", view()).poolConcentration).toBe(7);
    }
    let concentration: number | undefined;
    observeMemory(perceive([stimulus], [1], sensory, 1000, () => 0), memory(), view().needs,
      { ...nullPersonality, interpret: (base) => { concentration = base.poolConcentration; return base; } },
      DEFAULT_COGNITIVE_PARAMS, 1000);
    expect(concentration).toBe(1);
  });
  it("leaves a no-message decision trace byte-identical to the captured legacy trace", () => {
    const v = view();
    const result = policy([], { beliefs: v.beliefs, episodes: [], reliability: [], decision: {
      mind: "mind.0001", counters: {}, context: {}, generation: { repertoire: [scored("a", 0.75)], wait,
        body: { capacity_functional: 1 } },
    } }, v.needs, nullPersonality, v.params, () => 0.25, 1000);
    expect(JSON.stringify(result.trace)).toBe(prePaymentTrace);
  });
});
