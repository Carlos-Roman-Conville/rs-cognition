import { describe, expect, it } from "vitest";
import {
  categorical,
  comprehend,
  getBelief,
  nullPersonality,
  observeMemory,
  reconstruct,
  reliabilityMean,
  setBelief,
  updateCategorical,
  updateTestimony,
  type BetaReliability,
  type CategoricalBelief,
  type MemoryState,
  type Message,
  type Observation,
} from "../src/index.ts";
import { view } from "./decision-fixtures.ts";

// Test fiction: invented officials, levies, and ledger labels for IT-RG5 report scenarios only.

const listener = "mind-listener";
const speaker = "reeve-a";
const about = "levy-1";
const attribute = "collected";
const values = ["7", "10"] as const;
const reported = "7";

/** Labelled test prior (not empirical calibration). */
const declaredPrior = categorical([...values], [0.55, 0.45]);

const objectiveMarker = "__RG5_LEDGER_OBJECTIVE_ONLY__";

const ledgerRecord = (collected: string) => ({
  about,
  attribute,
  collected,
  [objectiveMarker]: true,
});

const collectedSeven = {
  id: "7",
  attribute,
  value: { kind: "literal" as const, value: "7" },
};
const meaningPool = reconstruct({}, "levy-tally", collectedSeven, "shire");

const reportMessage = (): Message => ({
  id: "msg.levy-report",
  sender: speaker,
  receivers: [listener],
  medium: "speech",
  t: 100,
  utterances: [{
    act: "assert",
    term: "levy-tally",
    about,
    claim: { attribute, value: reported },
  }],
});

const heardReport = (message: Message): Observation => ({
  kind: "message",
  message,
  context: { bubble: "shire", thetaPre: 0.5, conversation: "assize" },
  cue: "speech",
  about: speaker,
  attribute: "speech",
  channel: "report",
  t: message.t,
  model: { P_H: 1, P_FA: 0 },
});

const memoryWithReliability = (reliability: BetaReliability, prior = declaredPrior): MemoryState => ({
  beliefs: setBelief({ entries: [] }, about, attribute, prior),
  episodes: [],
  reliability: [{ speaker, belief: reliability }],
  meaningPool,
});

const observe = (memory: MemoryState, observations: readonly Observation[], eta = 1) =>
  observeMemory(observations, memory, view().needs, nullPersonality, { ...view().params, eta }, 1000);

/** DESIGN §2.3: L(v') = r·[v' = v] + (1 − r)/K; then conservative Bayes (§2.3, §5.1). */
const expectedPosterior = (
  prior: CategoricalBelief,
  value: string,
  reliability: BetaReliability,
  eta: number,
): CategoricalBelief => {
  const r = reliabilityMean(reliability);
  const likelihood = prior.values.map((v) => (v === value ? r : 0) + (1 - r) / prior.values.length);
  return updateCategorical(prior, likelihood, eta);
};

const l1Move = (before: readonly number[], after: readonly number[]) =>
  before.reduce((sum, p, i) => sum + Math.abs(p - after[i]), 0);

const beliefVector = (memory: MemoryState): readonly number[] => {
  const belief = getBelief(memory.beliefs, about, attribute)!;
  if (belief.kind !== "categorical") throw new Error("fixture");
  return belief.probabilities;
};

describe("IT-RG5 official reports (Cognition half)", () => {
  it("IT-RG5-1 (a) mutating the objective record alone leaves mind state byte-identical", () => {
    const record = ledgerRecord("10");
    const memory = memoryWithReliability({ alpha: 9, beta: 1 });
    const before = JSON.stringify(memory);
    record.collected = "999";
    (record as { [objectiveMarker]: boolean })[objectiveMarker] = false;
    expect(JSON.stringify(memory)).toBe(before);
  });

  it("IT-RG5-1 (b) only a message observation changes beliefs and never imports the ledger marker", () => {
    const record = ledgerRecord("10");
    const memory = memoryWithReliability({ alpha: 9, beta: 1 });
    const beforeBeliefs = JSON.stringify(memory.beliefs);
    const after = observe(memory, [heardReport(reportMessage())]);
    expect(JSON.stringify(after.beliefs)).not.toBe(beforeBeliefs);
    expect(JSON.stringify(after)).not.toContain(objectiveMarker);
    record.collected = "10";
    expect(JSON.stringify(after)).not.toContain(objectiveMarker);
  });

  it("IT-RG5-1 (c) report content is pending testimony from reeve-a, not a direct collected observation", () => {
    const message = reportMessage();
    const after = observe(memoryWithReliability({ alpha: 9, beta: 1 }), [heardReport(message)]);
    expect(after.testimony).toEqual([{
      speaker,
      about,
      attribute,
      value: reported,
      t: message.t,
    }]);
    const direct = after.trace.updates.filter(u => u.about === about && u.attribute === attribute);
    for (const update of direct) {
      expect(update.cue).toBe("speech");
    }
    expect(comprehend(
      memoryWithReliability({ alpha: 9, beta: 1 }),
      message,
      { bubble: "shire", thetaPre: 0.5, conversation: "assize" },
    ).utterances[0].testimony[0].about).toBe(about);
  });

  it("IT-RG5-2 (a) trusted reeve-a (Beta(9, 1)), η = 1: posterior matches L(v') Bayes to 1e-12", () => {
    const reliability = { alpha: 9, beta: 1 };
    const prior = declaredPrior;
    const expected = expectedPosterior(prior, reported, reliability, 1);
    const after = observe(memoryWithReliability(reliability, prior), [heardReport(reportMessage())], 1);
    const belief = getBelief(after.beliefs, about, attribute)!;
    if (belief.kind !== "categorical") throw new Error("fixture");
    belief.probabilities.forEach((p, i) => expect(p).toBeCloseTo(expected.probabilities[i], 12));
    expect(JSON.stringify(belief)).toBe(JSON.stringify(updateTestimony(prior, reported, reliability, 1)));
  });

  it("IT-RG5-2 (b) distrusted reeve-a matches the formula and moves less than the trusted case", () => {
    const prior = declaredPrior;
    const trusted = expectedPosterior(prior, reported, { alpha: 9, beta: 1 }, 1);
    const trustedMove = l1Move(prior.probabilities, trusted.probabilities);
    for (const reliability of [{ alpha: 1, beta: 1 }, { alpha: 1, beta: 9 }] as const) {
      const expected = expectedPosterior(prior, reported, reliability, 1);
      const after = observe(memoryWithReliability(reliability, prior), [heardReport(reportMessage())], 1);
      const belief = getBelief(after.beliefs, about, attribute)!;
      if (belief.kind !== "categorical") throw new Error("fixture");
      belief.probabilities.forEach((p, i) => expect(p).toBeCloseTo(expected.probabilities[i], 12));
      expect(l1Move(prior.probabilities, belief.probabilities)).toBeLessThan(trustedMove);
    }
  });

  it("IT-RG5-2 (c) nearly distrusted speaker: formula move under 1e-3; certain prior on 7 unchanged on matching report", () => {
    const reliability = { alpha: 1, beta: 999 };
    const prior = declaredPrior;
    const expected = expectedPosterior(prior, reported, reliability, 1);
    const formulaMove = l1Move(prior.probabilities, expected.probabilities);
    expect(formulaMove).toBeLessThan(1e-3);
    const after = observe(memoryWithReliability(reliability, prior), [heardReport(reportMessage())], 1);
    expect(l1Move(prior.probabilities, beliefVector(after))).toBeLessThan(1e-3);

    const certain = categorical([...values], [1, 0]);
    const unchanged = updateTestimony(certain, reported, reliability, 1);
    expect(unchanged.probabilities).toEqual([1, 0]);
    const certainMemory = memoryWithReliability(reliability, certain);
    expect(beliefVector(observe(certainMemory, [heardReport(reportMessage())], 1))).toEqual([1, 0]);
  });

  it("IT-RG5-2 (d) direct observation of 10 settles reeve-a's claim and lowers reliability mean", () => {
    const memory = memoryWithReliability({ alpha: 4, beta: 1 });
    const pending = observe(memory, [heardReport(reportMessage())]);
    const before = reliabilityMean(pending.reliability[0].belief);
    const settled = observe(pending, [{
      kind: "categorical",
      cue: "seen",
      about,
      attribute,
      channel: "sight",
      t: 200,
      value: "10",
      model: { P_H: 1, P_FA: 0, q: 0.9 },
    }]);
    expect(reliabilityMean(settled.reliability[0].belief)).toBeLessThan(before);
    expect(settled.testimony ?? []).toHaveLength(0);
  });

  it("IT-RG5-2 (e) posteriors depend only on declared inputs, not on differing objective records", () => {
    const reliability = { alpha: 3, beta: 1 };
    const memory = memoryWithReliability(reliability);
    const observation = heardReport(reportMessage());
    const first = observe(memory, [observation]);
    ledgerRecord("10");
    ledgerRecord("999");
    const second = observe(memory, [observation]);
    expect(JSON.stringify(getBelief(first.beliefs, about, attribute))).toBe(
      JSON.stringify(getBelief(second.beliefs, about, attribute)),
    );
  });
});
