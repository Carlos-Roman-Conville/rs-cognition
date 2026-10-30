import { describe, expect, it, vi } from "vitest";
import { streams } from "@rex/kernel";
import {
  attributeCause, categorical, createBeliefStore, existence, gaussian, getBelief, klDivergence,
  learnOutcome, LEARNING_LIKELIHOOD_FLOOR, nullPersonality, reliabilityKLDivergence,
  reliabilityMean, setBelief, updateCategorical, updateTestimony,
} from "../src/index.ts";
import type { LearningInputs, LearningLatent } from "../src/learning.ts";
import type { PersonalityModel } from "../src/personality.ts";
import type { BeliefStore, CategoricalBelief, MemoryState, Observation } from "../src/types.ts";
import { evaluateActions } from "../src/evaluate.ts";
import { selectAction, softmax } from "../src/select.ts";
import { action, generation, view } from "./decision-fixtures.ts";

// Proposed verification fixtures, not independent validation: V2 belongs to unit 2671.
const prior = categorical(["low", "high"], [0.5, 0.5]);
const observation: Observation = { cue: "feedback", about: "owner", attribute: "answer", channel: "report",
  t: 2000, kind: "categorical", value: "bad", model: { P_H: 1, P_FA: 0, q: 1 } };
const memory = (): MemoryState => ({ beliefs: setBelief(createBeliefStore(), "owner", "generosity", prior),
  episodes: [], reliability: [{ speaker: "owner", belief: { alpha: 3, beta: 1 } }] });
const discrete = (overrides: Partial<Extract<LearningLatent, { kind: "discrete" }>> = {}): LearningLatent => ({
  id: "generosity", kind: "discrete", about: "owner", attribute: "generosity", domain: "people",
  likelihood: () => [0.9, 0.1], ...overrides,
});
const input = (overrides: Partial<LearningInputs> = {}): LearningInputs => ({
  mind: "mind.0001", intention: { id: "int.0001", mind: "mind.0001", action: "ask", target: "owner", t: 1000,
    expectedOutcomes: categorical(["good", "bad"], [0.5, 0.5]), status: "active" },
  expectedUtility: 0.5, outcome: { cause: "int.0001", observations: [observation], t: 2000 },
  context: { target: "owner" }, domain: "people", appraise: ({ observations }) => {
    const observed = observations[0];
    if (observed.kind !== "categorical") throw new RangeError("Fixture requires a reported category");
    return { outcome: observed.value, reward: observed.value === "good" ? 1 : 0 };
  }, latents: [discrete()], ...overrides,
});
const run = (inputs = input(), state = memory(), eta = 1, personality = nullPersonality) =>
  learnOutcome(inputs, state, view({ eta }), { ep: 4 }, personality);

describe("learning formulas and causality (DESIGN §2.5)", () => {
  it("records r_obs minus the saved intention EU and encodes exactly one immutable episode", () => {
    const state = memory();
    const snapshot = JSON.stringify(state);
    const result = run(input(), state);
    expect(result.trace.predictionError).toBe(-0.5);
    expect(result.episode).toEqual({ id: "ep.0005", t: 2000, retrievals: [], context: { target: "owner" },
      action: "ask", outcome: "bad", reward: 0, predictionError: -0.5, domain: "people", attributedCause: "generosity" });
    expect(result.next.episodes).toEqual([result.episode]);
    expect(result.counters).toEqual({ ep: 5 });
    expect(JSON.stringify(state)).toBe(snapshot);
    expect(result.trace.observations).toEqual([observation]);
    expect(JSON.parse(JSON.stringify(result.trace))).toEqual(result.trace);
  });

  it("eta=1 is one Bayesian update and attribution never updates it twice", () => {
    const likelihood = vi.fn(() => [0.9, 0.1]);
    const result = run(input({ latents: [discrete({ likelihood })] }));
    expect(likelihood).toHaveBeenCalledTimes(1);
    const posterior = getBelief(result.next.beliefs, "owner", "generosity") as CategoricalBelief;
    const expected = updateCategorical(prior, [0.9, 0.1], 1);
    posterior.probabilities.forEach((p, i) => expect(p).toBeCloseTo(expected.probabilities[i], 14));
    expect(result.trace.updates[0].posterior).toBe(posterior);
    expect(result.trace.updates[0].kl).toBeCloseTo(0.9 * Math.log(1.8) + 0.1 * Math.log(0.2), 12);
    expect(result.next.beliefs.entries[0].prior).toEqual(prior);
  });

  it("interpret and learning compose a tempered likelihood once, using each latent's domain", () => {
    const interpret = vi.fn<PersonalityModel["interpret"]>((base) => ({ ...base, eta: 0.25 }));
    const learning = vi.fn<PersonalityModel["learning"]>((base) => ({ ...base, rate: 2 }));
    const personality: PersonalityModel = { ...nullPersonality, interpret, learning };
    const result = run(input({ latents: [discrete({ likelihood: () => [0.81, 0.09] })] }), memory(), 1, personality);
    expect(result.trace.updates[0].eta).toBe(0.5);
    expect((result.trace.updates[0].posterior as CategoricalBelief).probabilities[0]).toBeCloseTo(0.75, 12);
    expect(interpret.mock.calls[0][1]).toBe("people");
    expect(learning.mock.calls[0][1]).toBe("people");
    const capped = run(input(), memory(), 1, { ...personality, learning: (base) => ({ ...base, rate: 20 }) });
    expect(capped.trace.updates[0].eta).toBe(1);
    expect(run()).toEqual(run(input(), memory(), 1, nullPersonality));
  });

  it("uses the same pre-update memory for every naive likelihood and preserves store order", () => {
    let state = memory();
    state = { ...state, beliefs: setBelief(state.beliefs, "owner", "strength", prior) };
    const likelihood = vi.fn(({ view: ctx, memory: snapshot }) => {
      expect(ctx.beliefs).toBe(state.beliefs);
      expect(snapshot).toBe(state);
      expect(getBelief(ctx.beliefs, "owner", "generosity")).toEqual(prior);
      return [0.2, 0.8];
    });
    const result = run(input({ latents: [discrete(), discrete({ id: "strength", attribute: "strength", likelihood })] }), state);
    expect(likelihood).toHaveBeenCalledTimes(1);
    expect(result.next.beliefs.entries.map((entry) => entry.attribute)).toEqual(["generosity", "strength"]);
  });

  it("updates existence and conjugate Gaussian latents with the existing conservative rules", () => {
    const state = { ...memory(), beliefs: setBelief(setBelief(createBeliefStore(), "owner", "exists", existence(0.6)),
      "owner", "strength", gaussian(10, 4)) };
    const result = run(input({ latents: [discrete({ id: "exists", attribute: "exists", likelihood: () => [0.8, 0.2] }),
      { id: "strength", kind: "gaussian", about: "owner", attribute: "strength", domain: "body",
        likelihood: () => ({ mean: 16, variance: 9 }) }] }), state, 0.5);
    const exists = getBelief(result.next.beliefs, "owner", "exists");
    expect(exists?.kind).toBe("existence");
    if (exists?.kind !== "existence") throw new Error("Expected existence");
    expect(exists.probability).toBeCloseTo(0.75, 14);
    const posterior = getBelief(result.next.beliefs, "owner", "strength");
    expect(posterior?.kind).toBe("gaussian");
    if (posterior?.kind !== "gaussian") throw new Error("Expected Gaussian");
    expect(posterior.mean).toBeCloseTo(10 + 4 / 22 * 6, 12);
    expect(posterior.variance).toBeCloseTo(18 / 22 * 4, 12);
    expect(result.trace.updates[1].kl).toBe(klDivergence(posterior, gaussian(10, 4)));
  });

  it("an exposed broken promise tempers Beta-Bernoulli evidence and reduces speaker reliability", () => {
    const latent: LearningLatent = { id: "reliability", kind: "reliability", speaker: "owner", domain: "people",
      likelihood: ({ observations }) => ({ reliable: observations[0].kind === "categorical" && observations[0].value === "good", weight: 1 }) };
    const result = run(input({ latents: [latent] }), memory(), 0.5);
    expect(result.next.reliability[0].belief).toEqual({ alpha: 3, beta: 1.5 });
    expect(reliabilityMean(result.next.reliability[0].belief)).toBeLessThan(0.75);
    expect(result.trace.attributedCause).toBe("reliability");
    expect(result.trace.updates[0].kl).toBe(reliabilityKLDivergence({ alpha: 3, beta: 1.5 }, { alpha: 3, beta: 1 }));
    const good = { ...observation, value: "good" } as Observation;
    const kept = run(input({ latents: [latent], outcome: { cause: "int.0001", t: 2000, observations: [good] } }));
    expect(kept.next.reliability[0].belief).toEqual({ alpha: 4, beta: 1 });
  });

  it("eta=0 with encoding off preserves the entire state and counters, even with nonidentity hooks (CB-5b)", () => {
    const state = memory();
    const counters = { ep: 9 };
    const personality: PersonalityModel = { ...nullPersonality, interpret: (base) => ({ ...base, eta: 1 }),
      learning: (base) => ({ ...base, rate: 10 }) };
    const result = learnOutcome(input({ encode: false, latents: [discrete(), { id: "reliability", kind: "reliability",
      speaker: "owner", domain: "people", likelihood: () => ({ reliable: false, weight: 1 }) }] }), state, view({ eta: 0 }), counters, personality);
    expect(result.next).toBe(state);
    expect(result.counters).toBe(counters);
    expect(result.episode).toBeUndefined();
    expect(result.trace.updates.every((update) => update.kl === 0)).toBe(true);
    expect(result.trace.attributedCause).toBe("chance");
    expect(run(input(), state, 0).next.episodes).toHaveLength(1); // memory is a separate channel.
  });
});

describe("attribution is an ordered KL read-out (DESIGN §2.5)", () => {
  it("selects the largest actual posterior move and ties by declared latent order, not store order", () => {
    const state = { ...memory(), beliefs: setBelief(memory().beliefs, "owner", "strength", prior) };
    const strength = discrete({ id: "strength", attribute: "strength", likelihood: () => [0.99, 0.01] });
    const result = run(input({ latents: [discrete(), strength] }), state);
    expect(result.trace.attributedCause).toBe("strength");
    const equal = discrete({ id: "strength", attribute: "strength" });
    expect(run(input({ latents: [equal, discrete()] }), state).trace.attributedCause).toBe("strength");
    expect(run(input({ latents: [discrete(), equal] }), state).trace.attributedCause).toBe("generosity");
  });

  it("attributes chance for empty, zero, below-threshold and exactly-threshold moves", () => {
    expect(attributeCause([])).toBe("chance");
    expect(attributeCause([{ id: "x", kl: 0 }], 0)).toBe("chance");
    expect(attributeCause([{ id: "x", kl: 0.1 }], 0.1)).toBe("chance");
    expect(attributeCause([{ id: "x", kl: 0.09 }], 0.1)).toBe("chance");
    expect(attributeCause([{ id: "x", kl: Infinity }, { id: "y", kl: Infinity }])).toBe("x");
    expect(run(input({ latents: [] })).trace.attributedCause).toBe("chance");
  });

  it("full Beta KL matches analytic values, distinguishes concentration, and defines point limits", () => {
    expect(reliabilityKLDivergence({ alpha: 1, beta: 2 }, { alpha: 1, beta: 1 })).toBeCloseTo(Math.LN2 - 0.5, 11);
    expect(reliabilityKLDivergence({ alpha: 2, beta: 1 }, { alpha: 1, beta: 1 })).toBeCloseTo(Math.LN2 - 0.5, 11);
    expect(reliabilityKLDivergence({ alpha: 1, beta: 1 }, { alpha: 1, beta: 2 })).toBeCloseTo(1 - Math.LN2, 11);
    expect(reliabilityKLDivergence({ alpha: 2, beta: 2 }, { alpha: 1, beta: 1 })).toBeCloseTo(Math.log(6) - 5 / 3, 11);
    expect(reliabilityKLDivergence({ alpha: 0, beta: 2 }, { alpha: 0, beta: 1 })).toBe(0);
    expect(reliabilityKLDivergence({ alpha: 1, beta: 2 }, { alpha: 0, beta: 1 })).toBe(Infinity);
    for (const size of [0.01, 0.5, 1, 10, 1000]) {
      expect(reliabilityKLDivergence({ alpha: size, beta: size + 0.5 }, { alpha: size, beta: size })).toBeGreaterThanOrEqual(0);
    }
  });
});

describe("numerical and input boundaries (DESIGN §10)", () => {
  it("proposed likelihood floor makes all-zero evidence uninformative and keeps certain priors supported", () => {
    const result = run(input({ latents: [discrete({ likelihood: () => [0, 0] })] }));
    expect(result.trace.likelihoodFloor).toBe(LEARNING_LIKELIHOOD_FLOOR);
    expect(getBelief(result.next.beliefs, "owner", "generosity")).toEqual(prior);
    expect(result.trace.attributedCause).toBe("chance");
    const state = { ...memory(), beliefs: setBelief(createBeliefStore(), "owner", "generosity", categorical(["low", "high"], [0, 1])) };
    const certain = run(input({ latents: [discrete({ likelihood: () => [1, 0] })] }), state);
    expect(getBelief(certain.next.beliefs, "owner", "generosity")).toEqual(categorical(["low", "high"], [0, 1]));
    const mixed = run(input({ latents: [discrete({ likelihood: () => [0, 1] })] }));
    expect((mixed.trace.updates[0].posterior as CategoricalBelief).probabilities[0]).toBeCloseTo(1e-12 / (1 + 1e-12), 24);
  });

  it("a noiseless Gaussian likelihood preserves singular KL explicitly in a JSON trace", () => {
    const state = { ...memory(), beliefs: setBelief(createBeliefStore(), "owner", "strength", gaussian(1, 4)) };
    const result = run(input({ latents: [{ id: "strength", kind: "gaussian", about: "owner", attribute: "strength",
      domain: "body", likelihood: () => ({ mean: 2, variance: 0 }) }] }), state);
    expect(result.trace.updates[0].kl).toBe("Infinity");
    expect(result.trace.attributedCause).toBe("strength");
    expect(JSON.parse(JSON.stringify(result.trace))).toEqual(result.trace);
  });

  it("rejects wrong cause/mind, invalid chronology, unknown outcomes and nonfinite rewards", () => {
    expect(() => run(input({ mind: "someone-else" }))).toThrow(/mind/);
    expect(() => run(input({ outcome: { ...input().outcome, cause: "int.other" } }))).toThrow(/cause/);
    expect(() => run(input({ outcome: { ...input().outcome, t: 999 } }))).toThrow(/predates/);
    expect(() => run(input({ outcome: { ...input().outcome, observations: [{ ...observation, t: 3000 }] } }))).toThrow(/interval/);
    expect(() => run(input({ appraise: () => ({ outcome: "missing", reward: 0 }) }))).toThrow(/outcome space/);
    expect(() => run(input({ appraise: () => ({ outcome: "bad", reward: NaN }) }))).toThrow(/finite/);
    expect(() => run(input({ expectedUtility: Infinity }))).toThrow(/finite/);
  });

  it("rejects duplicate targets, reserved ids, absent priors, malformed likelihoods and invalid hooks", () => {
    expect(() => run(input({ latents: [discrete(), discrete({ id: "other" })] }))).toThrow(/unique/);
    expect(() => run(input({ latents: [discrete({ id: "chance" })] }))).toThrow(/nonreserved/);
    expect(() => run(input({ latents: [discrete({ attribute: "missing" })] }))).toThrow(/prior/);
    for (const likelihood of [[NaN, 1], [-1, 1], [2, 1], [1]]) {
      expect(() => run(input({ latents: [discrete({ likelihood: () => likelihood })] }))).toThrow(RangeError);
    }
    for (const eta of [-1, 2, NaN]) expect(() => run(input(), memory(), eta)).toThrow(RangeError);
    expect(() => run(input({ epsilonAttribution: -1 }))).toThrow(RangeError);
    expect(() => run(input(), memory(), 1, { ...nullPersonality, learning: (base) => ({ ...base, rate: -1 }) })).toThrow(RangeError);
    expect(() => attributeCause([{ id: "x", kl: NaN }])).toThrow(RangeError);
  });
});

describe("learning → beliefs/memory → evaluation → choice (DESIGN CB-5a, CB-5b)", () => {
  it.each(["refusal", "lost fight", "broken promise"])("%s lowers the relevant belief and next EU/choice probability after negative prediction error", (scenario) => {
    const attribute = scenario === "refusal" ? "generosity" : "relativeStrength";
    const stronger = scenario === "lost fight";
    const isPromise = scenario === "broken promise";
    const state: MemoryState = { ...memory(), beliefs: setBelief(createBeliefStore(), "owner", attribute, prior) };
    // A fresh identical testimony is read under the current Beta reliability; the action itself reads only beliefs.
    const beliefView = (state: MemoryState): BeliefStore => isPromise
      ? setBelief(state.beliefs, "owner", "promise", updateTestimony(categorical(["kept", "broken"], [1, 1]), "kept", state.reliability[0].belief, 1))
      : state.beliefs;
    const definition = action(scenario, { target: "owner", targetKind: "person", domain: "people",
      outcomeSpace: [
        { id: "good", deficits: {}, goalProgress: { goal: 1 }, success: true },
        { id: "bad", deficits: {}, goalProgress: { goal: 0.5 }, success: false },
      ], naiveModel: (beliefs) => {
        const belief = getBelief(beliefs, "owner", isPromise ? "promise" : attribute) as CategoricalBelief;
        const p = belief.probabilities[isPromise || stronger ? 0 : 1];
        return categorical(["good", "bad"], [p, 1 - p]);
      } });
    const evaluate = (state: MemoryState, eta = 1, episodes = state.episodes) => {
      const ctx = { ...view({ eta }), beliefs: beliefView(state) };
      return evaluateActions(generation([definition], ctx), ctx, episodes, { target: "owner" }, 3000);
    };
    const before = evaluate(state);
    const selected = selectAction(before, { mind: "mind.0001", counters: {} }, streams(42).get("cognition.decision.select", "mind.0001"));
    // Use the actual decision path with a deterministic draw selecting the first candidate.
    const choice = selectAction(before, { mind: "mind.0001", counters: selected.counters }, () => 0);
    const latent: LearningLatent = isPromise ? { id: "reliability", kind: "reliability", speaker: "owner", domain: "people",
      likelihood: ({ observations }) => ({ reliable: observations[0].kind === "categorical" && observations[0].value === "good", weight: 1 }) }
      : discrete({ id: attribute, attribute, likelihood: ({ view: ctx, observations }) => prior.values.map((value) => {
        // Evaluate the SAME action naive model under each latent hypothesis, then apply the observed q.
        const hypothetical = setBelief(ctx.beliefs, "owner", attribute, categorical(prior.values, prior.values.map((v) => v === value ? 1 : 0)));
        const theory = definition.naiveModel(hypothetical);
        const obs = observations[0];
        if (obs.kind !== "categorical") throw new Error("Expected categorical feedback");
        return theory.probabilities.reduce((sum, p, i) => sum + p * (theory.values[i] === obs.value ? obs.model.q : 1 - obs.model.q), 0);
      }) });
    const feedback = input({ intention: choice.intention, expectedUtility: before.candidates[0].expectedUtility,
      outcome: { cause: choice.intention.id, t: 4000, observations: [{ ...observation, t: 4000 }] }, latents: [latent] });
    const result = learnOutcome(feedback, state, before.view, choice.counters);
    expect(result.trace.predictionError).toBeLessThan(0);
    if (isPromise) expect(reliabilityMean(result.next.reliability[0].belief)).toBeLessThan(reliabilityMean(state.reliability[0].belief));
    else {
      const afterBelief = getBelief(result.next.beliefs, "owner", attribute) as CategoricalBelief;
      if (stronger) expect(afterBelief.probabilities[1]).toBeGreaterThan(0.5);
      else expect(afterBelief.probabilities[1]).toBeLessThan(0.5);
    }
    const later = (next: MemoryState, episodes = next.episodes) => {
      const ctx = { ...before.view, beliefs: beliefView(next) };
      return evaluateActions(generation([definition], ctx), ctx, episodes, { target: "owner" }, 5000);
    };
    const after = later(result.next);
    expect(after.candidates[0].expectedUtility).toBeLessThan(before.candidates[0].expectedUtility);
    const probability = (evaluation: typeof before) => softmax(evaluation.candidates.map((c) => c.expectedUtility), evaluation.view.params.beta)[0];
    expect(probability(after)).toBeLessThan(probability(before));
    expect(later(result.next, []).candidates[0].expectedUtility).toBeLessThan(before.candidates[0].expectedUtility); // belief channel alone
    expect(later({ ...state, episodes: result.next.episodes }).candidates[0].expectedUtility).toBeLessThan(before.candidates[0].expectedUtility); // memory alone
    const frozen = learnOutcome({ ...feedback, encode: false }, state, { ...before.view, params: { ...before.view.params, eta: 0 } }, choice.counters);
    expect(frozen.next).toBe(state);
    expect(probability(later(frozen.next))).toBe(probability(before));
  });
});
