import { describe, expect, it } from "vitest";
import { categorical, getBelief, setBelief } from "../src/beliefs.ts";
import { comprehend } from "../src/communication/comprehend.ts";
import { persuasion } from "../src/communication/persuasion.ts";
import type { MeaningPool, Message } from "../src/communication/types.ts";
import { allocateAttention } from "../src/attention.ts";
import { equivocationStimuli, perceive, attentionCues } from "../src/perception.ts";
import { nullPersonality } from "../src/personality.ts";
import { createEightFunctionV1 } from "../src/personality/eight-function/v1.ts";
import { observeMemory, policy } from "../src/policy.ts";
import type { MemoryState, Observation } from "../src/types.ts";
import { learnOutcome } from "../src/learning.ts";
import { evaluateActions } from "../src/evaluate.ts";
import { createMindsState, MindsRunner } from "../src/mind.ts";
import { configs, mindInput } from "./composition-fixtures.ts";
import { action, generation, prePaymentTrace, scored, view, wait } from "./decision-fixtures.ts";

const pool: MeaningPool = { fine: [
  { id: "yes", attribute: "safe", value: { kind: "literal", value: "yes" }, counts: { home: 9, away: 1 } },
  { id: "no", attribute: "safe", value: { kind: "literal", value: "no" }, counts: { home: 1, away: 9 } },
] };
const message: Message = { id: "m", sender: "speaker", receivers: ["listener"], medium: "speech", t: 1,
  utterances: [{ act: "assert", term: "fine", about: "place" }] };
const context = { conversation: "c", bubble: "home", thetaPre: 0.5 };
const initial = (): MemoryState => ({ beliefs: setBelief({ entries: [] }, "place", "safe", categorical(["yes", "no"], [0.5, 0.5])),
  reliability: [], episodes: [], meaningPool: pool });
const heard = (bubble = "home", t = 1): Observation => ({ kind: "message", message: { ...message, t }, context: { ...context, bubble },
  cue: "speech", about: "speaker", attribute: "speech", channel: "report", t, model: { P_H: 1, P_FA: 0 } });
const observe = (o: readonly Observation[], m = initial()) => observeMemory(o, m, view().needs, nullPersonality, view().params, 10);
const direct = (value: string, t = 3): Observation => ({ kind: "categorical", cue: "seen", about: "place", attribute: "safe",
  channel: "sight", t, value, model: { P_H: 1, P_FA: 0, q: 0.8 } });

describe("DESIGN §5.1 credibility and persuasion", () => {
  it("cues undeclared switches, suppresses declared switches, and isolates partners and conversations", () => {
    const first = observe([heard()]);
    const second = observe([heard("away", 2)], first);
    expect(second.trace.comprehension?.[0].equivocation).toEqual({ speaker: "speaker", term: "fine", from: "yes", to: "no" });
    const declared = { ...message, utterances: [{ ...message.utterances[0], declared: pool.fine[1] }] };
    const v = { ...first, termReadings: first.termReadings };
    expect(comprehend(v, declared, { ...context, bubble: "away" }).utterances[0].equivocation).toBeUndefined();
    expect(comprehend(v, message, { ...context, conversation: "other", bubble: "away" }).utterances[0].equivocation).toBeUndefined();
    expect(comprehend(v, { ...message, sender: "other" }, { ...context, bubble: "away" }).utterances[0].equivocation).toBeUndefined();
    expect(first.termReadings?.[0].meaning).toBe("yes");
  });
  it("routes internal equivocation through attention and perception, ignored at zero pertinence", () => {
    const cues = equivocationStimuli([{ speaker: "s", term: "w", from: "a", to: "b" }]);
    const metadata = [...attentionCues(cues), { cue: "food", salience: 1, relevance: { food: 1 } }];
    const categories = [{ id: "equivocation", base: 0, relevance: {} }, { id: "food", base: 1, relevance: {} }];
    const allocation = allocateAttention(metadata, categories, view());
    expect(allocation.shares).toEqual([0, 1]);
    expect(perceive(cues, [allocation.shares[0]], { k: 0, weberFractions: { sight: 0, sound: 0, touch: 0, report: 0 } }, 1, () => 0)).toEqual([]);
    const raised = allocateAttention(metadata, categories, view(), undefined,
      { ...nullPersonality, interpret: base => ({ ...base, equivocationPertinence: 2 }) });
    expect(raised.shares[0]).toBeCloseTo(2 / 3);
    const base = { eta: 1, alpha0: 1, lambda: 1, confidence: 1, weberFraction: 0, testimonyFloor: 0, equivocationPertinence: 7 };
    expect(createEightFunctionV1("INTJ", { etaMin: 0.1 }).interpret(base, "none", view()).equivocationPertinence).toBe(7);
  });
  it("settles all older claims once with confidence-weighted Beta updates and traces KL", () => {
    const pending = observe([heard(), heard("home", 2)]);
    expect(pending.testimony).toHaveLength(2);
    const confirmed = observe([direct("yes")], pending);
    expect(confirmed.reliability[0].belief).toEqual({ alpha: 2.6, beta: 1 });
    expect(confirmed.testimony).toEqual([]);
    expect(confirmed.trace.credibility).toHaveLength(2);
    expect(confirmed.trace.credibility?.[0].kl).toBeGreaterThan(0);
    expect(observe([direct("yes", 4)], confirmed).trace.credibility).toBeUndefined();
    const contradicted = observe([direct("no")], pending);
    expect(contradicted.reliability[0].belief).toEqual({ alpha: 1, beta: 2.6 });
    expect(observe([{ ...direct("no"), channel: "report" }], pending).testimony).toHaveLength(2);
    expect(observe([direct("no", 1)], pending).testimony).toHaveLength(2);
  });
  it("finds the actual naive-model objection one belief at a time and reports a message miss", () => {
    let beliefs = initial().beliefs;
    beliefs = setBelief(beliefs, "place", "pleasant", categorical(["yes", "no"], [0.5, 0.5]));
    const before = { ...view(), beliefs };
    const chosen = action("visit", { outcomeSpace: [
      { id: "ok", deficits: {}, goalProgress: { goal: 1 }, success: true },
      { id: "bad", deficits: {}, goalProgress: { goal: 0 }, success: false }], naiveModel: store => {
        const safe = getBelief(store, "place", "safe")!;
        if (safe.kind !== "categorical") throw new Error("fixture");
        return categorical(["ok", "bad"], safe.probabilities);
      } });
    const inputs = { utterance: message.utterances[0], before,
      after: setBelief(beliefs, "place", "pleasant", categorical(["yes", "no"], [0.9, 0.1])),
      generation: { repertoire: [chosen, scored("stay", 0.5)], wait, body: { capacity_functional: 1 } },
      episodes: [], context: {}, t: 10, action: { action: "visit" },
      claims: [{ about: "place", attribute: "safe", value: "yes" }, { about: "place", attribute: "pleasant", value: "yes" }] };
    const saved = JSON.stringify(before);
    const result = persuasion(inputs);
    expect(result.objection).toEqual({ about: "place", attribute: "safe", reduction: 0.5 });
    expect(result.targets).toEqual([{ about: "place", attribute: "pleasant" }]);
    expect(result.counterfactuals).toHaveLength(1);
    expect(result.hit).toBe(false);
    expect(result.candidates.find(c => c.action === "visit")).toMatchObject({ before: 0, after: 0 });
    expect(persuasion({ ...inputs, after: setBelief(beliefs, "place", "safe", categorical(["yes", "no"], [0.9, 0.1])) }).hit).toBe(true);
    expect(JSON.stringify(before)).toBe(saved);
  });
  it("retains conversation and testimony state through runner decisions and snapshot replay", () => {
    const runner = new MindsRunner(createMindsState(72), configs);
    runner.run({ type: "addMind", mind: mindInput({ memory: initial() }) });
    runner.run({ type: "observe", mind: "mind.0001", t: 1, observations: [heard()] });
    runner.run({ type: "decide", mind: "mind.0001", t: 1 });
    expect(runner.state.minds[0].memory.testimony).toHaveLength(1);
    expect(runner.state.minds[0].memory.termReadings).toHaveLength(1);
    const restored = new MindsRunner(JSON.parse(JSON.stringify(runner.state)), configs);
    const command = { type: "observe" as const, mind: "mind.0001", t: 3, observations: [heard("away", 2), direct("yes")] };
    expect(restored.run(command)).toEqual(runner.run(command));
    expect(restored.state.minds[0].memory.testimony).toEqual([]);
  });
  it("settles direct outcome feedback through the same helper without settling twice", () => {
    const pending = observe([heard()]);
    const evaluation = evaluateActions(generation([action("look")]), view(), [], {}, 1).candidates[0];
    const input = { mind: "mind.1", intention: { id: "int.1", mind: "mind.1", action: "look", t: 1,
      status: "active" as const, expectedOutcomes: evaluation.expectedOutcomes }, evaluation,
      outcome: { cause: "int.1", t: 3, observations: [direct("no")] }, context: {}, domain: "none" as const,
      latents: [], appraise: () => ({ outcome: "ok" }), encode: false };
    const learned = learnOutcome(input, pending, view(), {});
    expect(learned.next.testimony).toEqual([]);
    expect(learned.trace.credibility?.[0].posterior).toEqual({ alpha: 1, beta: 1.8 });
    expect(learnOutcome(input, learned.next, view(), {}).trace.credibility).toBeUndefined();
  });
  it("preserves the captured no-message null-personality trace byte for byte", () => {
    const v = view();
    const result = policy([], { beliefs: v.beliefs, episodes: [], reliability: [], decision: {
      mind: "mind.0001", counters: {}, context: {}, generation: { repertoire: [scored("a", 0.75)], wait,
        body: { capacity_functional: 1 } },
    } }, v.needs, nullPersonality, v.params, () => 0.25, 1000);
    expect(JSON.stringify(result.trace)).toBe(prePaymentTrace);
    expect(result.next).not.toHaveProperty("testimony");
  });
});
