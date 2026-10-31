import { describe, expect, it, vi } from "vitest";
import data from "../validation/data/tpt-2010.json";
import { choiceView, experienceCandidates, PROTOCOL, simulateProblem, summarizeProblems } from "../validation/repeated-choice.ts";
import { DEFAULT_COGNITIVE_PARAMS } from "../src/types.ts";
import * as evaluator from "../src/evaluate.ts";
import * as memory from "../src/memory.ts";

describe("V2 tournament adapter verification (empirical results are in validation/V2-repeated-choice.md)", () => {
  it("loads all 120 published problems, preserving payoff signs and the repeated-choice column", () => {
    for (const set of ["estimation", "competition"]) {
      const problems = data.problems.filter((p) => p.set === set);
      expect(problems.map((p) => p.id)).toEqual(Array.from({ length: 60 }, (_, i) => i + 1));
      for (const p of problems) {
        expect(p.H).toBeGreaterThanOrEqual(p.L);
        expect(p.pH).toBeGreaterThan(0);
        expect(p.pH).toBeLessThan(1);
        expect(p.humanRiskRate).toBeGreaterThanOrEqual(0);
        expect(p.humanRiskRate).toBeLessThanOrEqual(1);
        if (p.id <= 20) expect(Math.max(p.H, p.L, p.M)).toBeLessThan(0);
        if (p.id > 40) expect(Math.min(p.H, p.L, p.M)).toBeGreaterThan(0);
      }
    }
    expect(data.problems[0]).toMatchObject({ H: -0.3, pH: 0.96, L: -2.1, M: -0.3, humanRiskRate: 0.33 });
    expect(data.problems[73].humanRiskRate).toBe(0.21); // Erev Table 1b; G&D B2 differs (.20).
  });

  it("starts both buttons ignorant and lets only chosen feedback extend subjective payoff support", () => {
    expect(choiceView.params).toBe(DEFAULT_COGNITIVE_PARAMS);
    expect(experienceCandidates([]).candidates.map((c) => c.outcomes)).toEqual([
      { kind: "categorical", values: ["0"], probabilities: [1] },
      { kind: "categorical", values: ["0"], probabilities: [1] },
    ]);
    const episode = memory.encodeEpisode({ t: 0, context: {}, action: "A", outcome: "-2", reward: -2,
      predictionError: -2, attributedCause: "chance", domain: "none" }, {}).episode;
    const generation = experienceCandidates([episode]);
    const evaluated = evaluator.evaluateActions(generation, choiceView, [episode], {}, 1000);
    expect(generation.candidates[0].outcomes.values).toEqual(["0", "-2"]);
    expect(generation.candidates[1].outcomes.values).toEqual(["0"]);
    expect(evaluated.candidates[0].expectedUtility).toBeLessThan(0);
    expect(evaluated.candidates[1].expectedUtility).toBe(0);
  });

  it("runs 100 real evaluations and one chosen episode per participant, deterministically", () => {
    const evaluate = vi.spyOn(evaluator, "evaluateActions");
    const encode = vi.spyOn(memory, "encodeEpisode");
    try {
      const first = simulateProblem(data.problems[0], 2);
      expect(evaluate).toHaveBeenCalledTimes(2 * PROTOCOL.trials);
      expect(encode).toHaveBeenCalledTimes(2 * PROTOCOL.trials);
      expect(first.trialRates).toHaveLength(100);
      for (const [input] of encode.mock.calls) expect([-0.3, -2.1]).toContain(input.reward);
      expect(simulateProblem(data.problems[0], 2)).toEqual(first);
    } finally { evaluate.mockRestore(); encode.mockRestore(); }
  });

  it("scores across problems and distinguishes the trial-MSD lower bound from an actual trial score", () => {
    const row = { set: "competition", id: 1, humanRiskRate: 0.2, modelRiskRate: 0.4,
      monteCarloSE: 0, squaredDeviation: 0.04, trialRates: [] };
    const result = summarizeProblems([row, { ...row, id: 2, humanRiskRate: 0.6 }]);
    expect(result.problemMSD).toBeCloseTo(0.04);
    expect(result.trialMSDLowerBoundAllowingRounding).toBe(0);
    expect(() => summarizeProblems([])).toThrow();
  });
});
