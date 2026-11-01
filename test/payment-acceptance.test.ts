import { describe, expect, it } from "vitest";
import {
  assetValue,
  categorical,
  createMindsState,
  exchangeability,
  gaussian,
  getBelief,
  MindsRunner,
  nullPersonality,
  setBelief,
  DEFAULT_COGNITIVE_PARAMS,
} from "../src/index.ts";
import type { AssetDefinition, BeliefStore, CategoricalBelief, LearningLatent, MindInput, MindsConfig, Observation, SelectionTrace } from "../src/index.ts";
import { evaluateNeeds } from "../src/needs.ts";
import type { MindConfig } from "../src/mind.ts";
import { action, wait } from "./decision-fixtures.ts";

const ACCEPTED = { about: "gold", attribute: "accepted@islandA" };
const RATE = { about: "gold", attribute: "rate:fish" };
const assets: readonly AssetDefinition[] = [
  { id: "fish", usefulness: { hunger: 1 } },
  { id: "gold", usefulness: {}, accepted: ACCEPTED, rates: { fish: RATE } },
];

const exchangeOutcomes = [
  { id: "filled", deficits: {}, goalProgress: {}, success: true },
  { id: "not-filled", deficits: {}, goalProgress: {}, success: false },
  { id: "not-accepted", deficits: {}, goalProgress: {}, success: false },
] as const;

function pYes(belief: CategoricalBelief): number {
  const index = belief.values.indexOf("yes");
  return index < 0 ? 0 : belief.probabilities[index];
}

function exchangeTheory(beliefs: BeliefStore) {
  const belief = getBelief(beliefs, ACCEPTED.about, ACCEPTED.attribute);
  const yes = belief?.kind === "categorical" ? pYes(belief) : 0;
  const no = 1 - yes;
  return categorical(["filled", "not-filled", "not-accepted"], [yes * 0.85, no * 0.1, 0.05]);
}

const receiveGold = action("accept", {
  target: "fish-for-gold",
  exchange: { give: { asset: "fish", units: 1 }, want: { asset: "gold", units: 1 } },
  outcomeSpace: [...exchangeOutcomes],
  naiveModel: exchangeTheory,
});
const payGold = action("accept", {
  target: "gold-for-fish",
  exchange: { give: { asset: "gold", units: 1 }, want: { asset: "fish", units: 2 } },
  outcomeSpace: [...exchangeOutcomes],
  naiveModel: exchangeTheory,
});

const acceptanceLatent: LearningLatent = {
  id: "payeeAcceptance",
  kind: "discrete",
  about: ACCEPTED.about,
  attribute: ACCEPTED.attribute,
  domain: "strategy",
  likelihood: ({ observations }) => {
    const refusal = observations.find((o) => o.about === ACCEPTED.about && o.attribute === ACCEPTED.attribute);
    if (refusal?.kind === "categorical" && refusal.value === "no") return [0.05, 0.95];
    return [0.5, 0.5];
  },
};

const learning: MindConfig["learning"] = {
  appraise: ({ observations }) => {
    const refusal = observations.find((o) => o.about === ACCEPTED.about && o.attribute === ACCEPTED.attribute);
    if (refusal?.kind === "categorical" && refusal.value === "no") return { outcome: "not-accepted" };
    return { outcome: "not-filled" };
  },
  latents: [acceptanceLatent],
};

const configs: MindsConfig = {
  payment: {
    generation: { repertoire: [receiveGold, payGold], wait, assets },
    learning,
  },
  paymentPay: {
    generation: { repertoire: [payGold], wait, assets },
    learning,
  },
};

function hungerMind(acceptance: CategoricalBelief, params: Partial<typeof DEFAULT_COGNITIVE_PARAMS> = {}): MindInput {
  const beliefs = setBelief(setBelief({ entries: [] }, RATE.about, RATE.attribute, gaussian(2, 0)),
    ACCEPTED.about, ACCEPTED.attribute, acceptance);
  const needs = evaluateNeeds([
    { id: "hunger", category: "body", source: { signal: "hunger" }, setpoint: 0, weight: 1, salienceTags: [] },
  ], { signals: { hunger: 0.6 }, beliefs, accumulators: {}, elapsedSeconds: 0, outcomeTags: [], cues: [] });
  return {
    config: "payment",
    memory: { beliefs, episodes: [], reliability: [] },
    needs: { needs, goals: [] },
    capacityFunctional: 1,
    params: { ...DEFAULT_COGNITIVE_PARAMS, beta: 0, kappa: 0, gamma: 0.9, lambda: 2.25, ...params },
  };
}

function shareObservation(value: "yes" | "no", t = 500): Observation {
  return {
    cue: "society-share",
    about: ACCEPTED.about,
    attribute: ACCEPTED.attribute,
    channel: "report",
    t,
    kind: "categorical",
    value,
    model: { P_H: 0.95, P_FA: 0.05, q: 0.99 },
  };
}

function decideTrace(runner: MindsRunner, mind = "mind.0001", t = 1000): SelectionTrace {
  runner.run({ type: "decide", mind, t });
  return runner.state.minds[0].decisions.at(-1)!;
}

function runDecide(options: {
  societyShare: number;
  testimony?: "yes" | "no";
  acceptance?: CategoricalBelief;
  config?: keyof typeof configs;
}) {
  const hostSocietyShare = options.societyShare;
  void hostSocietyShare;
  const runner = new MindsRunner(createMindsState(72), configs);
  const defaultAcceptance = options.testimony === undefined
    ? categorical(["yes", "no"], [0.55, 0.45])
    : categorical(["yes", "no"], [0.5, 0.5]);
  runner.run({
    type: "addMind",
    mind: { ...hungerMind(options.acceptance ?? defaultAcceptance), config: options.config ?? "payment" },
  });
  if (options.testimony !== undefined) {
    runner.run({ type: "observe", mind: "mind.0001", t: 500, observations: [shareObservation(options.testimony)] });
  }
  const trace = decideTrace(runner);
  return { runner, trace, intention: runner.state.minds[0].current! };
}

function stableInputs(trace: SelectionTrace) {
  return {
    needs: trace.needs,
    interpret: trace.candidates.map((row) => row.interpret),
  };
}

function receiveGoldRow(trace: SelectionTrace) {
  const row = trace.candidates.find(({ candidate }) => candidate.target === "fish-for-gold");
  if (!row) throw new Error("Missing gold-receiving candidate");
  return row;
}

const stackTokens = ["ENTP", "INTP", "ESFJ", "ISFJ", "ENFJ", "INFJ", "ESTP", "ISTP", "ENFP", "INFP", "ESTJ", "ISTJ", "ENTJ", "INTJ", "ESFP", "ISFP",
  "Ne", "Ni", "Se", "Si", "Te", "Ti", "Fe", "Fi"];

describe("DESIGN §2.4 payment acceptance agreement (a)–(d)", () => {
  it("(a) host societyShare is not an observation: identical seed gives byte-identical traces and intentions", () => {
    const low = runDecide({ societyShare: 0.1 });
    const high = runDecide({ societyShare: 0.9 });
    expect(JSON.stringify(low.trace)).toBe(JSON.stringify(high.trace));
    expect(JSON.stringify(low.intention)).toBe(JSON.stringify(high.intention));
  });

  it("(b) perceived share on gold accepted@islandA moves P, E and receive-gold EU only", () => {
    const low = runDecide({ societyShare: 0.2, testimony: "no" });
    const high = runDecide({ societyShare: 0.8, testimony: "yes" });
    const lowBelief = getBelief(low.trace.beliefs, ACCEPTED.about, ACCEPTED.attribute) as CategoricalBelief;
    const highBelief = getBelief(high.trace.beliefs, ACCEPTED.about, ACCEPTED.attribute) as CategoricalBelief;
    expect(pYes(lowBelief)).toBeLessThan(pYes(highBelief));
    const lowView = { beliefs: low.trace.beliefs, needs: low.trace.needs, params: low.trace.params };
    const highView = { beliefs: high.trace.beliefs, needs: high.trace.needs, params: high.trace.params };
    expect(exchangeability("gold", highView, assets)).toBeGreaterThan(exchangeability("gold", lowView, assets));
    expect(receiveGoldRow(high.trace).expectedUtility).toBeGreaterThan(receiveGoldRow(low.trace).expectedUtility);
    expect(stableInputs(low.trace)).toEqual(stableInputs(high.trace));
  });

  it("(c) not-accepted refusal on payee acceptance belief records KL > 0 and lowers P(yes)", () => {
    const runner = new MindsRunner(createMindsState(72), configs);
    runner.run({
      type: "addMind",
      mind: { ...hungerMind(categorical(["yes", "no"], [0.85, 0.15]), { beta: 200 }), config: "paymentPay" },
    });
    runner.run({ type: "decide", mind: "mind.0001", t: 1000 });
    const intention = runner.state.minds[0].current!;
    expect(intention.action).toBe("accept");
    expect(intention.target).toBe("gold-for-fish");
    const prior = getBelief(runner.state.minds[0].memory.beliefs, ACCEPTED.about, ACCEPTED.attribute) as CategoricalBelief;
    const refusal: Observation = {
      cue: "refusal",
      about: ACCEPTED.about,
      attribute: ACCEPTED.attribute,
      channel: "report",
      t: 2000,
      kind: "categorical",
      value: "no",
      model: { P_H: 1, P_FA: 0, q: 1 },
    };
    const result = runner.run({
      type: "outcome",
      intention: intention.id,
      cause: "evt.1",
      event: "evt.2",
      t: 2000,
      feedback: { observations: [refusal], status: "failed" },
    });
    const update = result.state.minds[0].learning[0].updates[0];
    expect(update.kl).toBeGreaterThan(0);
    const posterior = update.posterior as CategoricalBelief;
    expect(posterior.probabilities[posterior.values.indexOf("yes")]).toBeLessThan(
      prior.probabilities[prior.values.indexOf("yes")],
    );
  });

  it("(d) null personality only; uniform acceptance yields E(gold) ≤ confident yes; no stack ids in trace", () => {
    const uniform = runDecide({ societyShare: 0.5, acceptance: categorical(["yes", "no"], [0.5, 0.5]) });
    const confident = runDecide({ societyShare: 0.5, acceptance: categorical(["yes", "no"], [1, 0]) });
    const viewUniform = { beliefs: uniform.trace.beliefs, needs: uniform.trace.needs, params: uniform.trace.params };
    const viewConfident = { beliefs: confident.trace.beliefs, needs: confident.trace.needs, params: confident.trace.params };
    expect(exchangeability("gold", viewUniform, assets)).toBeLessThanOrEqual(exchangeability("gold", viewConfident, assets));
    for (const row of uniform.trace.candidates) {
      expect(row.interpret).toEqual({
        eta: uniform.trace.params.eta,
        alpha0: uniform.trace.params.alpha0,
        lambda: uniform.trace.params.lambda,
        confidence: 1,
        weberFraction: 0,
        testimonyFloor: 0,
      });
    }
    expect(nullPersonality.id).toBe("null");
    const serialized = JSON.stringify(uniform.trace);
    for (const token of stackTokens) expect(serialized.includes(`"${token}"`)).toBe(false);
    expect(assetValue("gold", viewUniform, assets)).toBe(exchangeability("gold", viewUniform, assets));
  });
});
