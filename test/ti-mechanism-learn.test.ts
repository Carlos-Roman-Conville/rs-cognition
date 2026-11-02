import { describe, expect, it } from "vitest";
import { streams } from "@rex/kernel";
import { feedback, learn, learner } from "../experimental/ti-mechanism/learn.ts";
import { confidence, recordConfidence, updateConfidence } from "../experimental/ti-mechanism/confidence.ts";
import { runTi } from "../experimental/ti-mechanism/run-ti.ts";
import { defaults, runExperiment, type Arm } from "../experimental/ti-mechanism/experiment.ts";
import { interval, renderReport } from "../experimental/ti-mechanism/report.ts";

const factors = { knowledge: "none", history: 12, regime: "accurate", c_d: 1 } as const;
const settings = { ...defaults, seeds: [1, 2], budgets: [50, 200], trainingBudget: 200,
  testCount: 4, n: 8, trainMixes: [["parity"]], transferMixes: [["chain", "parity"]] } satisfies typeof defaults;
const example = () => runTi({ n: 3, clauses: [[1, 2, 3], [1, 2]], tags: [[], [], [], []] }, [],
  learner().theta, 100, { c_d: 1 }, streams(4));

describe("Ti DESIGN §§3–5 learning and experiment", () => {
  it("§3 REINFORCE uses the past baseline, softmax and polarity gradients; no feedback means no update", () => {
    const state = learner(), result = example(), original = JSON.stringify(state);
    expect(learn(state, result, 100, null)).toBe(state);
    const updated = learn(state, result, 100, "correct");
    expect(JSON.stringify(state)).toBe(original);
    expect(updated.theta).not.toEqual(state.theta);
    const reward = 1 - result.stepsUsed / 100;
    expect(updated.baseline).toBeCloseTo(reward);
    for (let j = 0; j < 9; j++) {
      const g = result.trace.filter(d => !d.forced).reduce((s, d) => s + d.features[j] -
        d.candidates.reduce((t, c) => t + c.probability * c.features[j], 0), 0);
      expect(updated.theta.atom[j]).toBeCloseTo(0.05 * reward * g);
    }
    const second = learn(updated, result, 100, "wrong");
    expect(second.baseline).toBeCloseTo((reward - 1) / 2);
    const polarityGradient = result.trace.filter(d => !d.forced).reduce((s, d) => s +
      (Number(d.value) - (d.value ? d.valueProbability : 1 - d.valueProbability)) * d.features[3], 0);
    expect(updated.theta.polarity).toBeCloseTo(0.05 * reward * polarityGradient);
    expect(second.theta.polarity).toBeCloseTo(updated.theta.polarity + 0.05 * (-1 - reward) * polarityGradient);
    const unresolved = learn(state, { ...result, conclusion: "unresolved" }, 100, "correct");
    expect(unresolved.baseline).toBe(-0.25);
    expect(learn(state, { ...result, conclusion: "unresolved" }, 100, "wrong")).toEqual(unresolved);
    const forced = { ...result, trace: result.trace.map(d => ({ ...d, forced: true })) };
    expect(learn(state, forced, 100, "wrong").theta).toEqual(state.theta);
    expect(learn(state, { ...result, stepsUsed: 100 }, 100, "correct").theta).toEqual(state.theta);
    expect(() => learn(state, result, -1, "correct")).toThrow();
  });

  it("§3 misleading feedback reverses the initial update on flipped definite items; incomplete can withhold", () => {
    let flips = 0, misses = 0;
    for (let seed = 1; seed <= 50; seed++) {
      const got = feedback(true, "misleading", streams(seed));
      const expectedFlip = streams(seed).get("ti.feedback.flip", "experiment")() < 0.3;
      expect(got).toBe(expectedFlip ? "wrong" : "correct");
      if (got === "wrong") {
        flips++;
        const positive = learn(learner(), example(), 100, "correct");
        const negative = learn(learner(), example(), 100, got);
        const dot = positive.theta.atom.reduce((s, w, i) => s + w * negative.theta.atom[i], 0) +
          positive.theta.polarity * negative.theta.polarity;
        expect(dot).toBeLessThan(0);
      }
      const absent = feedback(true, "incomplete", streams(seed));
      if (absent === null) misses++;
      expect(feedback(false, "accurate", streams(seed))).toBe("wrong");
    }
    expect(flips).toBeGreaterThan(0); expect(misses).toBeGreaterThan(0);
  });

  it("§3 confidence is captured before feedback and method confidence never allocates", () => {
    const state = confidence(), before = recordConfidence(state, "consistent", "parity");
    updateConfidence(state, "consistent", "parity", "correct");
    expect(before).toEqual({ answer: 0.5, method: 0.5 });
    expect(recordConfidence(state, "consistent", "parity")).toEqual({ answer: 2 / 3, method: 2 / 3 });
    updateConfidence(state, "consistent", "parity", null);
    expect(state.answer.consistent).toEqual({ alpha: 2, beta: 1 });
    expect(recordConfidence(state, "unresolved", "new").answer).toBeNull();
  });

  it("§4 zero history preserves zero-policy attribution across knowledge, feedback and cost settings", () => {
    for (const knowledge of ["none", "accurate", "partly-false"] as const) {
      for (const regime of ["accurate", "incomplete", "misleading"] as const) {
        const run = runExperiment("trained", { knowledge, regime, history: 0, c_d: 4 }, settings);
        expect(run.records.some(r => r.phase === "training" || r.phase === "shared")).toBe(false);
        for (const row of run.records.filter(r => r.phase === "fresh" || r.phase === "transfer")) {
          const baseline = run.records.find(r => r.seed === row.seed && r.budget === row.budget &&
            r.phase === "attribution" && r.problem === row.problem)!;
          expect(row.mind).toEqual(baseline.mind);
        }
      }
    }
  });

  it("§§4–5 tiny two-seed arms replay exactly, keep truth outside mind, and report learning honestly", () => {
    const summaries = [];
    for (const arm of ["trained", "no-family-tags", "shuffled", "memorise"] as Arm[]) {
      const run = runExperiment(arm, factors, settings);
      expect(JSON.stringify(run)).toBe(JSON.stringify(runExperiment(arm, factors, settings)));
      summaries.push(run.summary);
      for (const seed of settings.seeds) {
        const rows = run.records.filter(r => r.seed === seed);
        const training = rows.filter(r => r.phase === "training");
        expect(training[0].mind.confidence.answer).toBe(0.5);
        const beliefs = confidence();
        for (const row of training) {
          expect(row.mind.confidence).toEqual(recordConfidence(beliefs, row.mind.result.conclusion, row.mix));
          updateConfidence(beliefs, row.mind.result.conclusion, row.mix, row.mind.feedback);
        }
        const keys = new Set(training.map(r => r.problem));
        for (const row of rows.filter(r => ["baseline", "fresh", "transfer"].includes(r.phase))) expect(keys.has(row.problem)).toBe(false);
      }
      for (const row of run.records) {
        expect(Object.keys(row.mind).sort()).toEqual(["confidence", "feedback", "result"]);
        expect(JSON.stringify(row.mind)).not.toMatch(/"(?:label|correct|competence|combinedLabel)"\s*:/);
        if (row.phase !== "training") expect(row.mind.feedback).toBeNull();
        expect(row.mind.result.stepsUsed).toBeLessThanOrEqual(row.budget);
        if (arm === "no-family-tags") for (const d of row.mind.result.trace) expect(d.features).toHaveLength(5);
      }
      if (arm === "trained") {
        const trained = run.summary.seeds.filter(r => r.phase === "fresh" && r.budget === 200).map(r => r.metrics.definiteSteps);
        const baseline = run.summary.seeds.filter(r => r.phase === "attribution-fresh" && r.budget === 200).map(r => r.metrics.definiteSteps);
        console.info(`Tiny fixed-parity definite steps, trained=${interval(trained)}; zero=${interval(baseline)}. Descriptive only; improvement is not asserted.`);
      }
    }
    const report = renderReport(summaries);
    expect(report).toContain("Trained, no family tags");
    expect(report).toContain("Memorise shared");
    expect(report).toContain("not confidence intervals");
    expect(interval([null, null])).toBe("NA (0/2)");
  });
});
