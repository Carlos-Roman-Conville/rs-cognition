import { describe, expect, it } from "vitest";
import {
  assessConversation,
  categorical,
  comprehend,
  conversation,
  evaluateActions,
  generateActions,
  nullPersonality,
  observeMemory,
  persuasion,
  reconstruct,
  reliabilityMean,
  selectMeaning,
  setBelief,
  type Episode,
  type MeaningPool,
  type MemoryState,
  type Message,
  type Observation,
} from "../src/index.ts";
import { action, scored, view, wait } from "./decision-fixtures.ts";

// Test fiction: invented speakers, places, and terms for DESIGN §5.1 level-5 scenarios only.

const speaker = "captain-vela";
const listener = "mind-listener";

const treasureMessage = (): Message => ({
  id: "msg.treasure",
  sender: speaker,
  receivers: [listener],
  medium: "speech",
  t: 500,
  utterances: [{
    act: "assert",
    term: "buried treasure",
    about: "cove-cache",
    claim: { attribute: "present", value: "yes" },
  }],
});

const heardTreasure = (message: Message): Observation => ({
  kind: "message",
  message,
  context: { bubble: "harbor", thetaPre: 0.5, conversation: "voyage-chat" },
  cue: "speech",
  about: speaker,
  attribute: "speech",
  channel: "report",
  t: message.t,
  model: { P_H: 1, P_FA: 0 },
});

const loyaltyUtterance = (): Message => ({
  id: "msg.loyalty",
  sender: "harbor-master",
  receivers: [listener],
  medium: "speech",
  t: 20,
  utterances: [{ act: "assert", term: "loyalty", about: "crewmate-zara" }],
});

const observe = (observations: readonly Observation[], memory: MemoryState) =>
  observeMemory(observations, memory, view().needs, nullPersonality, view().params, 1000);

describe("DESIGN §5.1 communication scenarios (level 5)", () => {
  it("(1) stranger confusion vs close friend clarity on buried treasure", () => {
    const message = treasureMessage();
    const beliefs = setBelief({ entries: [] }, "cove-cache", "present", categorical(["yes", "no"], [0.9, 0.1]));
    const stranger: MemoryState = {
      beliefs,
      episodes: [],
      reliability: [{ speaker, belief: { alpha: 2, beta: 1 } }],
      meaningPool: {},
    };
    const strangerResult = observe([heardTreasure(message)], stranger);
    expect(strangerResult.trace.comprehension?.[0].confusion).toMatchObject({ speaker, term: "buried treasure" });
    expect(strangerResult.confusionCues?.length).toBeGreaterThan(0);

    const treasureSense = {
      id: "yes",
      attribute: "present",
      value: { kind: "literal" as const, value: "yes" },
      counts: { harbor: 8 },
    };
    const friend: MemoryState = {
      beliefs,
      episodes: [],
      reliability: [{ speaker, belief: { alpha: 2, beta: 1 } }],
      meaningPool: reconstruct({}, "buried treasure", treasureSense, "harbor"),
      conversations: [{
        partner: speaker,
        sharedContext: [{ about: "cove-cache", attribute: "present" }],
        turns: 0,
      }],
    };
    const friendResult = observe([heardTreasure(message)], friend);
    expect(friendResult.trace.comprehension?.[0].confusion).toBeUndefined();
    expect(friendResult.confusionCues ?? []).toHaveLength(0);
  });

  it("(2) different bubble histories resolve loyalty differently in the same bubble", () => {
    const steadfast = { id: "steadfast", attribute: "allegiance", value: { kind: "literal" as const, value: "high" } };
    const fickle = { id: "fickle", attribute: "allegiance", value: { kind: "literal" as const, value: "low" } };
    const poolForMariner: MeaningPool = {
      loyalty: [{ ...steadfast, counts: { dock: 9 } }, { ...fickle, counts: { dock: 1 } }],
    };
    const poolForMerchant: MeaningPool = {
      loyalty: [{ ...steadfast, counts: { dock: 1 } }, { ...fickle, counts: { dock: 9 } }],
    };
    const top = (pool: MeaningPool) => {
      const belief = selectMeaning(pool, "loyalty", "dock")!;
      const index = belief.probabilities.reduce((best, p, i) => (p > belief.probabilities[best] ? i : best), 0);
      return belief.values[index];
    };
    expect(top(poolForMariner)).toBe("steadfast");
    expect(top(poolForMerchant)).toBe("fickle");
    const message = loyaltyUtterance();
    const context = { bubble: "dock", thetaPre: 0.5, conversation: "wharf" };
    const mariner = comprehend({ beliefs: { entries: [] }, reliability: [], meaningPool: poolForMariner },
      message, context).utterances[0].distribution!;
    const merchant = comprehend({ beliefs: { entries: [] }, reliability: [], meaningPool: poolForMerchant },
      message, context).utterances[0].distribution!;
    const argmax = (belief: typeof mariner) => {
      const index = belief.probabilities.reduce((best, p, i) => (p > belief.probabilities[best] ? i : best), 0);
      return belief.values[index];
    };
    expect(argmax(mariner)).not.toBe(argmax(merchant));
  });

  it("(3) undeclared fine switch cues equivocation; declared repair does not", () => {
    const pool: MeaningPool = {
      fine: [
        { id: "calm", attribute: "mood", value: { kind: "literal", value: "calm" }, counts: { galley: 9, deck: 1 } },
        { id: "storm", attribute: "mood", value: { kind: "literal", value: "storm" }, counts: { galley: 1, deck: 9 } },
      ],
    };
    const message: Message = {
      id: "msg.fine",
      sender: "cook",
      receivers: [listener],
      medium: "speech",
      t: 1,
      utterances: [{ act: "assert", term: "fine", about: "sea-state" }],
    };
    const memory: MemoryState = {
      beliefs: setBelief({ entries: [] }, "sea-state", "mood", categorical(["calm", "storm"], [0.5, 0.5])),
      episodes: [],
      reliability: [],
      meaningPool: pool,
    };
    const context = { conversation: "mess", bubble: "galley", thetaPre: 0.5 };
    const first = observe([{
      kind: "message",
      message,
      context,
      cue: "speech",
      about: "cook",
      attribute: "speech",
      channel: "report",
      t: 1,
      model: { P_H: 1, P_FA: 0 },
    }], memory);
    const second = observe([{
      kind: "message",
      message: { ...message, t: 2 },
      context: { ...context, bubble: "deck" },
      cue: "speech",
      about: "cook",
      attribute: "speech",
      channel: "report",
      t: 2,
      model: { P_H: 1, P_FA: 0 },
    }], first);
    expect(second.trace.comprehension?.[0].equivocation).toEqual({ speaker: "cook", term: "fine", from: "calm", to: "storm" });

    const declared = comprehend(first, { ...message, t: 3, utterances: [{ ...message.utterances[0], declared: pool.fine[1] }] },
      { ...context, bubble: "deck" }).utterances[0];
    expect(declared.equivocation).toBeUndefined();
  });

  it("(4) contradicted testimony lowers the speaker credibility mean", () => {
    const pool: MeaningPool = {
      beacon: [{
        id: "lit",
        attribute: "lit",
        value: { kind: "literal", value: "yes" },
        counts: { shore: 3 },
      }],
    };
    const message: Message = {
      id: "msg.beacon",
      sender: "lookout",
      receivers: [listener],
      medium: "speech",
      t: 10,
      utterances: [{ act: "assert", term: "beacon", about: "north-tower", claim: { attribute: "lit", value: "yes" } }],
    };
    const memory: MemoryState = {
      beliefs: setBelief({ entries: [] }, "north-tower", "lit", categorical(["yes", "no"], [0.5, 0.5])),
      episodes: [],
      reliability: [{ speaker: "lookout", belief: { alpha: 4, beta: 1 } }],
      meaningPool: pool,
    };
    const pending = observe([{
      kind: "message",
      message,
      context: { bubble: "shore", thetaPre: 0.5, conversation: "watch" },
      cue: "speech",
      about: "lookout",
      attribute: "speech",
      channel: "report",
      t: 10,
      model: { P_H: 1, P_FA: 0 },
    }], memory);
    const before = reliabilityMean(pending.reliability[0].belief);
    const settled = observe([{
      kind: "categorical",
      cue: "seen",
      about: "north-tower",
      attribute: "lit",
      channel: "sight",
      t: 20,
      value: "no",
      model: { P_H: 1, P_FA: 0, q: 0.9 },
    }], pending);
    const after = reliabilityMean(settled.reliability[0].belief);
    expect(after).toBeLessThan(before);
  });

  it("(5) persuasion reports a miss when the moved belief is not the action objection", () => {
    const message: Message = {
      id: "msg.course",
      sender: "navigator",
      receivers: [listener],
      medium: "speech",
      t: 30,
      utterances: [{ act: "assert", term: "course", about: "vessel", claim: { attribute: "heading", value: "north" } }],
    };
    let beliefs = setBelief({ entries: [] }, "vessel", "heading", categorical(["north", "south"], [0.5, 0.5]));
    beliefs = setBelief(beliefs, "vessel", "cargo-worth", categorical(["high", "low"], [0.5, 0.5]));
    const before = { ...view(), beliefs };
    const visit = action("sail-north", {
      outcomeSpace: [
        { id: "ok", deficits: {}, goalProgress: { goal: 1 }, success: true },
        { id: "bad", deficits: {}, goalProgress: { goal: 0 }, success: false },
      ],
      naiveModel: store => {
        const heading = store.entries.find(e => e.about === "vessel" && e.attribute === "heading")!.belief;
        if (heading.kind !== "categorical") throw new Error("fixture");
        return categorical(["ok", "bad"], heading.probabilities);
      },
    });
    const result = persuasion({
      utterance: message.utterances[0],
      before,
      after: setBelief(beliefs, "vessel", "cargo-worth", categorical(["high", "low"], [0.9, 0.1])),
      generation: { repertoire: [visit, scored("stay", 0.5)], wait, body: { capacity_functional: 1 } },
      episodes: [],
      context: {},
      t: 40,
      action: { action: "sail-north" },
      claims: [
        { about: "vessel", attribute: "heading", value: "north" },
        { about: "vessel", attribute: "cargo-worth", value: "high" },
      ],
    });
    expect(result.hit).toBe(false);
    expect(result.objection).toEqual({ about: "vessel", attribute: "heading", reduction: expect.any(Number) });
    expect(result.targets).toEqual([{ about: "vessel", attribute: "cargo-worth" }]);
  });

  it("(6) tolerance falls as leave EU rises and rises after positive partner episodes", () => {
    const spec = { partner: "old-friend", turns: [{ action: "say" }], leave: { action: "leave" } };
    const partnerContext = { partner: "old-friend" };
    const sayWithHistory = action("say", {
      outcomeSpace: [
        { id: "ok", deficits: {}, goalProgress: { goal: 1 }, success: true },
        { id: "bad", deficits: {}, goalProgress: { goal: 0 }, success: false },
      ],
      naiveModel: () => categorical(["ok", "bad"], [0.5, 0.5]),
    });
    const repertoire = [sayWithHistory, scored("leave", 0.25)];
    const gen = generateActions({ repertoire, wait, body: { capacity_functional: 1 } }, view());
    const baseline = evaluateActions(gen, view(), [], partnerContext, 1000);
    const costlyLeave = evaluateActions(
      generateActions({ repertoire: [sayWithHistory, scored("leave", 1)], wait, body: { capacity_functional: 1 } }, view()),
      view(),
      [],
      partnerContext,
      1000,
    );
    const record = conversation([], "old-friend");
    const tolerant = assessConversation(record, baseline, spec).conversationTolerance!;
    const strained = assessConversation(record, costlyLeave, spec).conversationTolerance!;
    expect(strained).toBeLessThan(tolerant);

    const positiveEpisode: Episode = {
      id: "ep.friendship",
      t: 0,
      retrievals: [],
      context: partnerContext,
      action: "say",
      outcome: "ok",
      reward: 2,
      predictionError: 0,
      attributedCause: "self",
      domain: "people",
    };
    const warmed = evaluateActions(gen, view(), [positiveEpisode], partnerContext, 1000);
    const afterHistory = assessConversation(record, warmed, spec).conversationTolerance!;
    expect(afterHistory).toBeGreaterThan(tolerant);
  });
});
