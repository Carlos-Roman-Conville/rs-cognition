import { readFileSync, readdirSync } from "node:fs";
import { canonical, streams } from "@rex/kernel";
import { beforeAll, describe, expect, it } from "vitest";
import { nullPersonality } from "../src/index.ts";
import { attentionOnly, basicChecks } from "../bench/hungry-pair/acceptance.ts";
import type { Check } from "../bench/hungry-pair/acceptance.ts";
import {
  ACTIONS, chiSquareSurvival, collectStudy, comparison, COMPARISON_SEEDS, DIMENSIONS,
  divergence, EPOCHS, interval, renderReport, SYMMETRY_SEEDS, symmetry,
} from "../bench/hungry-pair/report.ts";
import type { Dimension, SeedResult } from "../bench/hungry-pair/report.ts";

// DESIGN §6 is the oracle. Do not mark failures as expected, omit censored outcomes,
// relax "all cases", reduce the required seed counts, or select favorable seeds.
describe("DESIGN §6 hungry-pair acceptance CB-1–CB-7 and P7-3", () => {
  let checks: Check[];
  let rows: SeedResult[];
  let seconds: number;
  beforeAll(async () => {
    const started = performance.now();
    checks = basicChecks();
    rows = await collectStudy();
    seconds = (performance.now() - started) / 1000;
  }, 240_000); // Allows reporting all counterexamples; the 60 s requirement is asserted below.

  const requireCheck = (id: string) => {
    const check = checks.find((entry) => entry.id === id)!;
    expect(check, `Missing ${id} diagnostic`).toBeDefined();
    expect(check.cases, `${id} must not pass vacuously`).toBeGreaterThan(0);
    expect(check.failures, check.examples.join("\n")).toBe(0);
  };

  it("CB-1 same-seed canonical bytes and initial-snapshot Kernel input-log replay; different seeds affect only stream descendants", () => {
    requireCheck("CB-1");
    // Explicit §7 isolation: unrelated draws must not change this mind's stream.
    const rng = streams(1), control = streams(1);
    const draw = rng.get("cognition.decision.select", "cognition/mind.0001");
    const other = rng.get("cognition.perception.detect", "cognition/mind.0002");
    for (let i = 0; i < 25; i++) other();
    expect(draw()).toBe(control.get("cognition.decision.select", "cognition/mind.0001")());
  });
  it("CB-2 every committed intention has >=2 candidates, normalized probabilities and a choice matching its draw", () => requireCheck("CB-2"));
  it("CB-3 every intention has exactly one causal outcome and every outcome changes a need or belief, including horizon receipts", () => requireCheck("CB-3"));
  it("CB-4 every informative outcome has KL>0 and follows its likelihood's Bayesian/Kalman/Beta direction", () => requireCheck("CB-4"));
  it("CB-5a every negative prediction error lowers the action's next EU with context held fixed", () => requireCheck("CB-5a"));
  it("CB-5b learning on vs eta=0/no encoding: common seeds diverge after informative feedback, with the share reported", () => {
    const result = divergence(rows);
    expect(result.pairs).toBe(COMPARISON_SEEDS);
    expect(result.eligible).toBe(COMPARISON_SEEDS);
    expect(result.count).toBeGreaterThan(0);
    expect(result.share).toBe(result.count / result.eligible);
    expect(result.low).toBeLessThanOrEqual(result.share);
    expect(result.high).toBeGreaterThanOrEqual(result.share);
    // DESIGN specifies no minimum divergence fraction: report it without inventing one.
    expect(renderReport(rows, seconds)).toContain(`${result.count}/${result.eligible} eligible seeds`);
  });
  it("CB-6a identical A/B action distributions over exactly 500 seeds: Pearson chi-square p>0.01", () => {
    expect(rows.map((row) => row.seed)).toEqual(Array.from({ length: 500 }, (_, i) => i + 1));
    const result = symmetry(rows);
    expect(result.minimumExpected).toBeGreaterThanOrEqual(5);
    expect(result.df).toBe(ACTIONS.length - 1);
    expect(result.p, `chi-square=${result.statistic}, df=${result.df}`).toBeGreaterThan(0.01);
  });
  it("CB-6a actually swapping A/B ids swaps the complete traces exactly", () => requireCheck("CB-6a exact ID swap"));
  it("CB-6b limited source guard: no literal agent-id equality branch prescribing an action/outcome (independent audit still required)", () => {
    const files = [...readdirSync("src").filter((name) => name.endsWith(".ts")).map((name) => `src/${name}`),
      "bench/hungry-pair/models.ts", "bench/hungry-pair/world.ts"];
    for (const file of files) {
      const source = readFileSync(file, "utf8");
      expect(source, file).not.toMatch(/(?:===?|!==?)\s*["'](?:cognition\/)?mind\.\d+["']/);
      expect(source, file).not.toMatch(/case\s+["'](?:cognition\/)?mind\.\d+["']/);
    }
    // Parameter boundary checks and role/action dispatch are lawful; regex cannot certify
    // their semantic use. DESIGN assigns the complete source audit to a separate check unit.
  });
  it("CB-6c default runs produce more than one action sequence across seeds", () => {
    expect(new Set(rows.map((row) => row.sequence)).size).toBeGreaterThan(1);
  });
  it.each(Object.keys(DIMENSIONS) as Dimension[])("CB-7 %s: exactly 200 paired seeds, action/outcome frequencies and paired 95%% intervals", (dimension) => {
    const pairs = rows.filter((row) => row.changed);
    expect(pairs.map((row) => row.seed)).toEqual(Array.from({ length: 200 }, (_, i) => i + 1));
    for (const row of pairs) {
      const changed = row.changed![dimension];
      for (const values of [row.baseline, changed]) {
        expect(ACTIONS.reduce((sum, action) => sum + values[`action:${action}`], 0)).toBeCloseTo(1, 12);
        expect(["good", "bad", "unfinished"].reduce((sum, outcome) => sum + values[`outcome:${outcome}`], 0)).toBeCloseTo(1, 12);
        expect(Object.values(values).every(Number.isFinite)).toBe(true);
      }
    }
    for (const metric of Object.keys(pairs[0].baseline)) {
      const result = comparison(rows, dimension, metric);
      expect(result.difference.mean).toBeCloseTo(result.changed.mean - result.baseline.mean, 12);
      for (const ci of Object.values(result)) {
        expect(ci.low).toBeLessThanOrEqual(ci.mean);
        expect(ci.high).toBeGreaterThanOrEqual(ci.mean);
      }
    }
  });
  it.each(["fight", "steal"])("CB-7 higher lambda yields fewer %s choices", (action) => {
    expect(comparison(rows, "lambda", `action:${action}`).difference.mean).toBeLessThan(0);
  });
  it("CB-7 higher beta yields lower choice entropy", () => {
    expect(comparison(rows, "beta", "entropy").difference.mean).toBeLessThan(0);
  });
  it("CB-7 higher kappa yields fewer intention switches", () => {
    expect(comparison(rows, "kappa", "switches").difference.mean).toBeLessThan(0);
  });
  it("CB-7 higher d reduces an early loss's effect on late choices in the same context", () => {
    const result = comparison(rows, "d", "earlyLossEffect");
    expect(result.baseline.mean).toBeGreaterThan(0);
    expect(result.difference.mean).toBeLessThan(0);
  });
  it("P7-3 replacing only pertinence changes the integrated traces; remaining hooks are exactly null", () => {
    for (const hook of ["interpret", "generate", "learning"] as const) expect(attentionOnly[hook]).toBe(nullPersonality[hook]);
    requireCheck("P7-3");
  });
  it("acceptance runtime stays under 60 s without reducing the 500/200 seed counts", () => {
    expect(SYMMETRY_SEEDS).toBe(500);
    expect(COMPARISON_SEEDS).toBe(200);
    expect(EPOCHS).toBeGreaterThanOrEqual(2); // At least one post-feedback decision.
    expect(seconds, `${seconds.toFixed(2)} s for diagnostics and required study`).toBeLessThan(60);
  });
  it("report explicitly names all acceptance IDs, limitations, independent-data gap and proposed validation experiment", () => {
    const report = renderReport(rows, seconds);
    for (const id of ["CB-1", "CB-2", "CB-3", "CB-4", "CB-5", "CB-6", "CB-7", "P7-3"]) expect(report).toContain(id);
    expect(report).toContain("What this does not show");
    expect(report).toContain("no independent data");
    expect(report).toContain("consequences of the formulas");
    expect(report).toContain("laboratory scarcity game with a stronger owner");
  });
});

describe("acceptance statistics verification", () => {
  it("chi-square survival matches exact df=2/4 identities and the df=1 1% critical value", () => {
    expect(chiSquareSurvival(0, 9)).toBe(1);
    for (const x of [0.1, 2, 10, 50]) {
      expect(chiSquareSurvival(x, 2)).toBeCloseTo(Math.exp(-x / 2), 12);
      expect(chiSquareSurvival(x, 4)).toBeCloseTo(Math.exp(-x / 2) * (1 + x / 2), 12);
    }
    expect(chiSquareSurvival(6.634896601, 1)).toBeCloseTo(0.01, 9);
  });
  it("seed-level paired intervals preserve a constant difference and retain between-seed variance", () => {
    expect(canonical(interval([3, 3, 3]))).toBe(canonical({ mean: 3, low: 3, high: 3 }));
    const result = interval([0, 1, 2]);
    expect(result.mean).toBe(1);
    expect(result.high - result.mean).toBeCloseTo(1.972 / Math.sqrt(3), 12);
  });
});
