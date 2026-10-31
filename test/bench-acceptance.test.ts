import { readFileSync, readdirSync } from "node:fs";
import { canonical, streams } from "@rex/kernel";
import { beforeAll, describe, expect, it } from "vitest";
import { nullPersonality } from "../src/index.ts";
import { attentionOnly, basicChecks, consequenceSatisfied } from "../bench/hungry-pair/acceptance.ts";
import type { Check } from "../bench/hungry-pair/acceptance.ts";
import {
  ACTIONS, chiSquareSurvival, runSeed, comparison, COMPARISON_SEEDS, DIMENSIONS,
  divergence, EPOCHS, interval, renderReport, SYMMETRY_SEEDS, symmetry,
} from "../bench/hungry-pair/report.ts";
import { reportErrors, sourceHash } from "../bench/hungry-pair/report-integrity.ts";
import type { Dimension, SeedResult } from "../bench/hungry-pair/report.ts";
import { mergeLambdaChecks } from "../bench/hungry-pair/lambda.ts";

// C-B1: 16 fixed seeds (1..16) exercise every numerical study path in vitest.
// Population assertions retain 500/200 samples in npm run bench and the report gate.
const SMOKE_SEEDS = 16;
describe("DESIGN §6 hungry-pair acceptance CB-1–CB-7 and P7-3", () => {
  let checks: Check[];
  let rows: SeedResult[];
  let seconds: number;
  beforeAll(async () => {
    const started = performance.now();
    checks = basicChecks();
    rows = Array.from({ length: SMOKE_SEEDS }, (_, i) => runSeed(i + 1));
    seconds = (performance.now() - started) / 1000;
  }, 60_000);

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
  it("CB-3 every intention has exactly one causal outcome and non-horizon outcomes change a need or belief (COG-10)", () => requireCheck("CB-3"));
  it("CB-3 unchanged non-horizon receipts still fail; only actual horizon censoring is exempt", () => {
    const receipt = { t: 1200, payload: { result: "unfinished", reason: "unfinished at horizon" } };
    expect(consequenceSatisfied(false, receipt, 1200)).toBe(true);
    expect(consequenceSatisfied(false, receipt, 2400)).toBe(false);
    expect(consequenceSatisfied(false, { ...receipt, payload: { result: "bad", reason: "refused" } }, 1200)).toBe(false);
    expect(consequenceSatisfied(false, { ...receipt, payload: { result: "unfinished", reason: "interrupted" } }, 1200)).toBe(false);
    expect(consequenceSatisfied(true, receipt, 2400)).toBe(true);
  });
  it("CB-4 every informative outcome has KL>0 and follows its likelihood's Bayesian/Kalman/Beta direction", () => requireCheck("CB-4"));
  it("CB-5a every negative prediction error lowers the action's next EU with context held fixed", () => requireCheck("CB-5a"));
  it("CB-5b learning on vs eta=0/no encoding: common seeds diverge after informative feedback, with the share reported", () => {
    const result = divergence(rows);
    expect(result.pairs).toBe(SMOKE_SEEDS);
    expect(result.eligible).toBe(SMOKE_SEEDS);
    expect(result.count).toBeGreaterThan(0);
    expect(result.share).toBe(result.count / result.eligible);
    expect(result.low).toBeLessThanOrEqual(result.share);
    expect(result.high).toBeGreaterThanOrEqual(result.share);
    // DESIGN specifies no minimum divergence fraction: report it without inventing one.
    expect(renderReport(rows, seconds)).toContain(`${result.count}/${result.eligible} eligible seeds`);
  });
  it("CB-6a identical A/B distribution smoke over 16 seeds; 500-seed inference is in REPORT.md", () => {
    expect(rows.map((row) => row.seed)).toEqual(Array.from({ length: SMOKE_SEEDS }, (_, i) => i + 1));
    const result = symmetry(rows);
    expect(result.minimumExpected).toBeGreaterThan(0);
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
  it.each(Object.keys(DIMENSIONS) as Dimension[])("CB-7 %s: 16 fixed paired seeds, action/outcome frequencies and paired 95%% intervals", (dimension) => {
    const pairs = rows.filter((row) => row.changed);
    expect(pairs.map((row) => row.seed)).toEqual(Array.from({ length: SMOKE_SEEDS }, (_, i) => i + 1));
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
  it("CB-7 COG-19 asserts lambda at every recorded fixed context; population fight + steal is reported only", () => {
    for (const row of rows) for (const values of [row.baseline, row.changed!.lambda])
      expect(values["action:fight+steal"]).toBe(values["action:fight"] + values["action:steal"]);
    const delta = rows.map((row) => row.changed!.lambda["action:fight+steal"] - row.baseline["action:fight+steal"]);
    expect(comparison(rows, "lambda", "action:fight+steal").difference).toEqual(interval(delta));
    const result = mergeLambdaChecks(rows.map((row) => row.lambda));
    expect(result.decisions).toBe(SMOKE_SEEDS * EPOCHS * 3 * (Object.keys(DIMENSIONS).length + 2));
    expect(result.candidates).toBeGreaterThan(result.decisions);
    expect(result.strict).toBeGreaterThan(0);
    expect(result.check.cases).toBe(result.candidates + result.strict + result.equal);
    expect(result.check.failures, result.check.examples.join("\n")).toBe(0);
    requireCheck("CB-7 lambda fixed context");
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
  it("small fixed-seed suite stays under 60 s; bench retains the 500/200 counts", () => {
    expect(SYMMETRY_SEEDS).toBe(500);
    expect(COMPARISON_SEEDS).toBe(200);
    expect(EPOCHS).toBeGreaterThanOrEqual(2); // At least one post-feedback decision.
    expect(seconds, `${seconds.toFixed(2)} s for diagnostics and 16-seed smoke study`).toBeLessThan(60);
  });
  it("report explicitly names all acceptance IDs, limitations, independent-data gap and proposed validation experiment", () => {
    const report = renderReport(rows, seconds, checks);
    for (const id of ["CB-1", "CB-2", "CB-3", "CB-4", "CB-5", "CB-6", "CB-7", "P7-3"]) expect(report).toContain(id);
    expect(report).toContain("What this does not show");
    expect(report).toContain("no independent data");
    expect(report).toContain("consequences of the formulas");
    expect(report).toContain("laboratory scarcity game with a stronger owner");
    expect(report.split("\n").find((line) => line.startsWith("Verdict CB-6:"))).toContain("unit 2672's CHECK.md");
    expect(report).not.toContain("- CB-6b: FAIL");
    expect(report).toContain("reported, not asserted");
  });
});

describe("C-B1 persisted full-study gate", () => {
  it("requires every verdict PASS, DESIGN seed counts, git revision and current src/ hash", () => {
    expect(reportErrors(readFileSync("bench/hungry-pair/REPORT.md", "utf8"))).toEqual([]);
  });
  it("rejects stale evidence when source text changes, without mutating the working tree", () => {
    const report = readFileSync("bench/hungry-pair/REPORT.md", "utf8");
    const changedHash = sourceHash("src", (path) => readFileSync(path, "utf8") + "\n// source changed\n");
    expect(changedHash).not.toBe(sourceHash());
    expect(reportErrors(report, changedHash)).toContain("Stale src/ hash");
  });
  it("rejects failed or missing verdicts and undersized studies", () => {
    const valid = [Array.from({ length: 7 }, (_, i) => `Verdict CB-${i + 1}: PASS (0/1 failures)`).join("\n"),
      "Seed count symmetry: 500", "Seed count paired-per-dimension: 200", "Seed count learning-frozen: 200",
      `Source SHA256: ${sourceHash()}`, `Git commit: ${"a".repeat(40)}`].join("\n");
    expect(reportErrors(valid)).toEqual([]);
    expect(reportErrors(valid.replace("CB-3: PASS", "CB-3: FAIL"))).toContain("CB-3 failed");
    expect(reportErrors(`${valid}\nVerdict CB-8: FAIL`)).toContain("Malformed verdict: Verdict CB-8: FAIL");
    expect(reportErrors(valid.replace("Verdict CB-2:", "Omitted CB-2:"))).toContain("Missing Verdict CB-2");
    for (const [name, count] of [["symmetry", 500], ["paired-per-dimension", 200], ["learning-frozen", 200]] as const)
      expect(reportErrors(valid.replace(`${name}: ${count}`, `${name}: ${count - 1}`)))
        .toContain(`${name} seed count below ${count}`);
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
