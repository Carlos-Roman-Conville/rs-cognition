import { describe, expect, it } from "vitest";
import { analyzeStudy, renderStudyReport, controlAttribution } from "../bench/scenarios/s3-workshop/analyze.ts";
import type { StudyRecord } from "../bench/scenarios/s3-workshop/analyze.ts";
import { classifyBehaviour, classifyMechanisms } from "../bench/scenarios/classify.ts";
import { summarizeWorkshop } from "../bench/scenarios/s3-workshop/metrics.ts";
import { emptyTotals } from "../bench/diagnostics/ledger.ts";
import type { Ledger } from "../bench/diagnostics/ledger.ts";
import { FUNCTIONS } from "../bench/diagnostics/ablation.ts";

const exposure = [{ key: "Te", o_f: 1 }];
function fixture(seeds = [1, 2]) {
  const records: StudyRecord[] = seeds.flatMap(seed => (["none", "random-theta", "shuffled"] as const).flatMap(control =>
    ([{ version: "null" }, { version: "v1", stack: "ENTJ" }] as const).map(configuration => {
      const metrics = summarizeWorkshop({ hostInputLog: [] });
      if (configuration.version === "v1") {
        metrics.completionRate = 1;
        metrics.trace.hooks.interpret.changedCalls = 1;
      }
      return { scenario: "s3-workshop", seed, configuration: { ...configuration, control }, metrics, replayed: true };
    })));
  const runs: Ledger[] = records.filter(r => r.configuration.control === "none").map(r => ({
    schema: "function-ledger/v1", scenario: r.scenario, seed: r.seed, configuration: r.configuration,
    method: "FL-1/formula-group-ablation", limitations: [], developmentalStage: null, upbringing: null,
    totals: emptyTotals(), domains: [], summary: FUNCTIONS.map(f => ({ ...emptyTotals(), mind: "worker", function: f,
      hook: "interpret", stackPosition: null, changedHookCalls: f === "Te" ? 1 : 0, deltaUSum: f === "Te" ? 1 : 0, deltaUCount: 1 })),
    ownOpportunities: { byFunction: FUNCTIONS.map(key => ({ key, counts: { input: key === "Te" ? 1 : 0, total: 1 } })),
      shared: { input: 1, total: 1 }, sharedGroup: "Fi" },
  }));
  return { records, runs };
}
describe("S3 report under DESIGN §10.1/§10.5", () => {
  it("classifies hand-built stable, context-dependent, none and not exercised evidence", () => {
    expect(classifyBehaviour([1, 1, 1, 1], exposure).classification).toBe("stable");
    expect(classifyBehaviour([1, 1, 0, 0], exposure).classification).toBe("context-dependent");
    expect(classifyBehaviour([0, 0, 0, 0], exposure).classification).toBe("none");
    expect(classifyBehaviour([1, 1, 1, 1], []).classification).toBe("not exercised");
    const result = classifyMechanisms(["Te", "Fi"].map(key => ({ key,
      eligibility: { activated: 4, "eligible-not-activated": 0, "no-relevant-input": 0 },
      ownCounts: { input: key === "Te" ? 4 : 0, total: 4 }, seedEffects: [1, 1, 1, 1] })),
    { opportunity: "own", shared: { counts: { input: 4, total: 4 }, seedEffects: [1, 1, 1, 1] } });
    expect(result.map(r => r.classification)).toEqual(["stable", "not exercised", "stable"]);
  });
  it("renders every required section from two synthetic seeds, preserving absent own input", () => {
    const { records, runs } = fixture();
    const analysis = analyzeStudy(records.reverse(), runs);
    const report = renderStudyReport(analysis, { source: "synthetic", commits: "synthetic", inputs: [], commitment: { seed: 1, medianGap: 4, kappa: 1 } });
    for (const section of ["Metrics by configuration", "Paired differences from null", "Classification", "Function ledger", "Controls", "Interpretation limits"]) expect(report).toContain(`## ${section}`);
    expect(report).toContain("Records: 4 (2 seeds × 2 configurations)");
    expect(report).toContain("κ = 1");
    expect(report).toContain("shared attitude (F1–F3)");
    expect(analysis.mechanisms.find(r => r.key === "Fi")!.classification).toBe("not exercised");
    expect(analysis.paired[0].all.mean).toBe(1);
    expect(analysis.paired[0].first.interval95).toBeNull();
  });
  it("labels a same-direction control-confirmed effect not attributable", () => {
    const { records, runs } = fixture([1, 2, 3, 4]);
    const result = analyzeStudy(records, runs).paired.find(r => r.metric === "completionRate")!;
    expect(result.classification).toBe("stable");
    expect(result.attribution).toBe("not attributable to function structure");
    expect(controlAttribution(result, [classifyBehaviour([-1, -1, -1, -1], exposure)])).not.toBe("not attributable to function structure");
  });
  it("rejects missing paired records, duplicate records and incomplete ledger coverage", () => {
    const { records, runs } = fixture();
    expect(() => analyzeStudy(records.slice(1), runs)).toThrow("Unpaired");
    expect(() => analyzeStudy([...records, records[0]], runs)).toThrow("Duplicate");
    expect(() => analyzeStudy(records, runs.slice(1))).toThrow("Unpaired ledger");
  });
});
