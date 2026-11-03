import { createMindsState, reduceMinds } from "../src/mind.ts";
import { describe, expect, it } from "vitest";
import { categorical, setBelief } from "../src/beliefs.ts";
import { encode } from "../src/communication/encode.ts";
import { assessConversation, conversation, conversationTurn } from "../src/communication/conversation.ts";
import type { EncodePlan, MeaningPool } from "../src/communication/types.ts";
import type { Intention, MemoryState, Observation } from "../src/types.ts";
import { observeMemory, policy } from "../src/policy.ts";
import { nullPersonality } from "../src/personality.ts";
import { evaluate, prePaymentTrace, scored, view, wait } from "./decision-fixtures.ts";

const yes = { id: "yes", attribute: "quality", value: { kind: "literal" as const, value: "yes" } };
const no = { id: "no", attribute: "quality", value: { kind: "literal" as const, value: "no" } };
const pool: MeaningPool = {
  fine: [{ ...yes, counts: { home: 9, work: 1 } }, { ...no, counts: { home: 1, work: 9 } }],
  good: [{ ...yes, counts: { home: 1, work: 9 } }, { ...no, counts: { home: 9, work: 1 } }],
};
const memory: MemoryState = { beliefs: setBelief({ entries: [] }, "thing", "quality", categorical(["yes", "no"], [0.9, 0.1])),
  episodes: [], reliability: [], meaningPool: pool };
const intention: Intention = { id: "int.1", mind: "speaker", action: "say", t: 1000, status: "active", expectedOutcomes: categorical(["ok"], [1]) };
const plan: EncodePlan = { action: "say", receivers: ["listener"], medium: "speech", capacity: 10,
  bubble: "home", conversation: "chat", terms: ["fine", "good"], details: [{ act: "pitch", about: "thing", attribute: "quality" }] };
const model = { prior: categorical(["help", "pitch"], [1, 1]), likelihoods: { pitch: [0.1, 0.9] } };
const spec = { partner: "listener", turns: [{ action: "say" }], leave: { action: "leave" } };

describe("DESIGN section 5.1 encode and conversation", () => {
  it("encodes the honest mode using the speaker's bubble and host-order ties", () => {
    expect(encode(intention, memory, plan).message.utterances[0]).toMatchObject({ term: "fine", claim: { value: "yes" } });
    expect(encode(intention, memory, { ...plan, bubble: "work" }).message.utterances[0].term).toBe("good");
    expect(encode(intention, memory, { ...plan, bubble: "unknown", terms: ["good", "fine"] }).message.utterances[0].term).toBe("good");
    expect(encode(intention, memory, { ...plan, details: [{ ...plan.details[0], value: "no" }] }).message.utterances[0]).toMatchObject({ term: "good", claim: { value: "no" } });
    expect(() => encode({ ...intention, action: "wait" }, memory, plan)).toThrow();
  });
  it("retains ordered detail by articulability then truncates to medium capacity", () => {
    const details = ["first", "second", "third", "fourth"].map(about => ({ ...plan.details[0], about, value: "yes" }));
    expect(encode(intention, memory, { ...plan, details, articulability: 0.75, capacity: 2 }).message.utterances.map(u => u.about)).toEqual(["first", "second"]);
    expect(encode(intention, memory, { ...plan, articulability: 0 }).message.utterances).toEqual([]);
    expect(encode(intention, memory, { ...plan, capacity: 0 }).readings).toEqual([]);
    expect(() => encode(intention, memory, { ...plan, articulability: 2 })).toThrow();
    expect(() => encode(intention, memory, { ...plan, capacity: -1 })).toThrow();
  });
  it("keeps term bindings within a conversation and permits an explicit repair", () => {
    const first = encode(intention, memory, plan);
    const next = { ...memory, termReadings: first.readings };
    const changed = { ...plan, terms: ["fine"], details: [{ ...plan.details[0], value: "no" }] };
    expect(() => encode(intention, next, changed)).toThrow();
    expect(encode(intention, next, { ...changed, details: [{ ...changed.details[0], declared: no }] }).readings[0].meaning).toBe("no");
    expect(encode(intention, next, { ...changed, conversation: "later" }).message.utterances[0].claim?.value).toBe("no");
  });
  it("grows subjective shared context and raises confusion only outside it without a link", () => {
    const utterance = encode(intention, memory, plan).message.utterances[0];
    const topics = [{ about: "thing", attribute: "quality" }];
    const first = conversationTurn(conversation([], "speaker"), utterance, topics, {}, 1, true);
    expect(first.confusion).toBeDefined();
    expect(first.record.sharedContext).toEqual(topics);
    expect(conversationTurn(first.record, utterance, topics, {}, 1, true).confusion).toBeUndefined();
    const linked = conversationTurn(first.record, utterance, [{ about: "new", attribute: "quality" }], { links: topics }, 1, true);
    expect(linked.confusion).toBeUndefined();
    expect(linked.record.sharedContext).toHaveLength(2);
    expect(conversation([], "other").sharedContext).toEqual([]);
  });
  it("updates perceived pitch through the existing categorical Bayes rule on reception", () => {
    const message = encode(intention, memory, plan).message;
    const observation: Observation = { kind: "message", message, context: { bubble: "home", thetaPre: 0, intentionModel: model },
      cue: "heard", about: "speaker", attribute: "speech", channel: "report", t: 1000, model: { P_H: 1, P_FA: 0 } };
    const result = observeMemory([observation], memory, view().needs, nullPersonality, view().params, 1000);
    expect(result.conversations?.[0].perceivedIntention?.probabilities[1]).toBeCloseTo(0.9);
    expect(result.conversations?.[0].sharedContext).toEqual([{ about: "thing", attribute: "quality" }]);
    expect(result.confusionCues).toHaveLength(1);
    const again = observeMemory([observation], result, view().needs, nullPersonality, view().params, 1000);
    expect(again.confusionCues).toEqual([]);
    expect(again.conversations?.[0].perceivedIntention?.probabilities[1]).toBeGreaterThan(0.9);
  });
  it("derives tolerance and initial willingness from the existing EU gap", () => {
    const record = conversation([], "listener");
    const low = assessConversation(record, evaluate([scored("say", 0.75), scored("leave", 0.25)], view({ beta: 2 })), spec);
    expect(low.conversationTolerance).toBeCloseTo(1 / (1 + Math.exp(-1)));
    expect(low.engagementWillingness).toBe(low.conversationTolerance);
    const high = assessConversation({ ...low, turns: 1 }, evaluate([scored("say", 0.75), scored("leave", 1)], view({ beta: 2 })), spec);
    expect(high.conversationTolerance).toBeLessThan(low.conversationTolerance!);
    expect(high.engagementWillingness).toBe(low.engagementWillingness);
    expect(assessConversation(record, evaluate([scored("say", 1), scored("leave", -1)], view({ beta: 0 })), spec).conversationTolerance).toBe(0.5);
    expect(assessConversation(record, evaluate([scored("say", 1), scored("leave", -1)], view({ beta: 1e308 })), spec).conversationTolerance).toBe(1);
  });
  it("returns world.message to the host after selection and traces both assessments", () => {
    const result = policy([], { ...memory, decision: { mind: "speaker", counters: {}, context: {},
      generation: { repertoire: [scored("say", 0.75), scored("leave", 0)], wait, body: { capacity_functional: 1 } },
      communication: { encode: [plan], conversations: [spec] } } }, view().needs, nullPersonality, view().params, () => 0, 1000);
    expect(result.intention.action).toBe("say");
    expect(result.message?.sender).toBe("speaker");
    expect(result.trace.conversations?.[0].engagementWillingness).toBe(result.trace.conversations?.[0].conversationTolerance);
    expect(result.next.conversations?.[0].sharedContext).toHaveLength(1);
    expect(result.next.termReadings).toHaveLength(1);
  });
  it("persists conversation state in the reducer and hands one fresh message to the host", () => {
    const config = { chat: { generation: { repertoire: [scored("say", 0.75), scored("leave", 0)], wait },
      communication: { encode: [plan], conversations: [spec] }, learning: { appraise: () => ({ outcome: "ok" }), latents: [] } } };
    const added = reduceMinds(createMindsState(42), { type: "addMind", mind: {
      config: "chat", memory, needs: view().needs, params: view({ beta: 1000, kappa: 1 }).params, capacityFunctional: 1,
    } }, config);
    const chosen = reduceMinds(added.state, { type: "decide", mind: added.added!, t: 1000 }, config);
    expect(chosen.message?.utterances).toHaveLength(1);
    expect(chosen.state.minds[0].memory.conversations?.[0].sharedContext).toHaveLength(1);
    expect(chosen.events.map(e => e.type)).toEqual(["cognition.decision", "cognition.intention"]);
    const kept = reduceMinds(chosen.state, { type: "decide", mind: added.added!, t: 1001 }, config);
    expect(kept.message).toBeUndefined();
    expect(kept.state.minds[0].memory.conversations?.[0].turns).toBe(1);
    const heard: Observation = { kind: "message", message: { ...chosen.message!, sender: "visitor" },
      context: { bubble: "home", thetaPre: 0, intentionModel: model }, cue: "heard", about: "visitor",
      attribute: "speech", channel: "report", t: 1001, model: { P_H: 1, P_FA: 0 } };
    const observed = reduceMinds(kept.state, { type: "observe", mind: added.added!, t: 1001, observations: [heard] }, config);
    expect(observed.state.minds[0].memory.conversations?.map(c => c.partner)).toEqual(["listener", "visitor"]);
    expect(observed.observationTrace?.conversations?.[1].perceivedIntention?.probabilities[1]).toBeCloseTo(0.9);
  });
  it("keeps no-message traces byte-identical to the captured baseline", () => {
    const result = policy([], { beliefs: { entries: [] }, episodes: [], reliability: [], decision: {
      mind: "mind.0001", counters: {}, context: {}, generation: { repertoire: [scored("a", 0.75)], wait, body: { capacity_functional: 1 } },
    } }, view().needs, nullPersonality, view().params, () => 0.25, 1000);
    expect(JSON.stringify(result.trace)).toBe(prePaymentTrace);
    expect(result.next.conversations).toBeUndefined();
  });
});
