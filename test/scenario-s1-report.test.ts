import { describe, expect, it } from "vitest";
import { analyze, classify, METRICS, HOOKS, renderReport, summarize } from "../bench/scenarios/s1-forage/analyze.ts";
import type { MetricRecord } from "../bench/scenarios/s1-forage/analyze.ts";
import type { Report } from "../bench/diagnostics/report.ts";

function fixture(seeds = 3): MetricRecord[] {
  return Array.from({ length: seeds }, (_, i) => i + 1).flatMap((seed) => ["null", "same", "offset"].map((stack) => ({
    scenario: "s1-forage", seed, configuration: stack === "null" ? { version: "null" } : { version: "v1", stack }, replayed: true,
    metrics: { inspectBeforeGatherShare: seed / 10 + (stack === "offset" ? 0.25 : 0), novelPatchVisitShare: 0,
      bestKnownReturnRate: 0, foodGathered: seed + (stack === "offset" ? 2 : 0),
      trace: { hooks: Object.fromEntries(HOOKS.map((h) => [h, { calls: 2, changedCalls: stack === "offset" ? 1 : 0, changedParameters: (stack === "offset" ? { example: 1 } : {}) as Record<string, number> }])), changedCueShares: 0, byFormula: null } },
  })));
}
const ledger: Report = { schema: "function-ledger-report/v1", seedCount: 24, limitations: [], byFunction: [], byStack: [], byScenario: [], byDomain: [], observedRelevanceMap: [], byDevelopmentalStage: [], byUpbringing: [] };
describe("S1 report arithmetic and seed independence", () => {
  it("computes equal-seed means, paired constant intervals and identical vector pairs on 3 × 3 records", () => {
    const a = analyze(fixture(), 2);
    expect(a.configurations.find((c) => c.name === "null")!.means.foodGathered).toBe(2);
    expect(a.configurations.find((c) => c.name === "v1/offset")!.means.foodGathered).toBe(4);
    const offset = a.paired.find((p) => p.name === "v1/offset" && p.metric === "foodGathered")!;
    expect(offset.all).toEqual({ n: 3, mean: 2, interval95: [2, 2] });
    expect(offset.differingSeeds).toBe(3);
    expect(a.vectors).toEqual({ distinct: 2, identicalPairs: 0 }); // null excluded from stack pairs
    expect(a.vectorsByMetric.novelPatchVisitShare).toEqual({ distinct: 1, identicalPairs: 1 });
    for (const p of a.paired.filter((p) => p.name === "v1/same")) {
      expect(p.all).toEqual({ n: 3, mean: 0, interval95: [0, 0] }); expect(p.differingSeeds).toBe(0); expect(p.classification).toBe("none");
    }
    expect(a.configurations.find((c) => c.name === "v1/offset")!.hooks.interpret).toEqual({ calls: 6, changedCalls: 3, changedParameters: { example: 3 } });
    // df=2, sample variance=1, t=4.302653. This checks nonzero uncertainty independently.
    const interval = summarize([1, 2, 3]).interval95!;
    expect(interval[0]).toBeCloseTo(2 - 4.302653 / Math.sqrt(3), 12);
    expect(interval[1]).toBeCloseTo(2 + 4.302653 / Math.sqrt(3), 12);
    expect(summarize([1]).interval95).toBeNull();
  });
  it("classifies constant offsets stable with two disjoint three-seed halves (df=2 each; all df=5)", () => {
    // Extend the same hand-built 3 × 3 fixture to six seeds to avoid overlapping halves or pseudoreplication.
    const a = analyze(fixture(6), 3);
    const p = a.paired.find((p) => p.name === "v1/offset" && p.metric === "foodGathered")!;
    expect(p.classification).toBe("stable"); expect(p.first.n).toBe(3); expect(p.second.n).toBe(3);
    expect(p.first.interval95).toEqual([2, 2]); expect(p.second.interval95).toEqual([2, 2]);
    expect(a.paired.filter((p) => p.name === "v1/same").every((p) => p.classification === "none")).toBe(true);
    expect(analyze([...fixture(6)].reverse(), 3)).toEqual(a);
  });
  it("handles one-half and disagreeing-sign context-dependent evidence", () => {
    const positive = summarize([2, 2, 2]), negative = summarize([-1, -1, -1]), zero = summarize([0, 0, 0]);
    expect(classify(positive, positive, zero)).toBe("context-dependent");
    expect(classify(positive, positive, negative)).toBe("context-dependent");
    expect(classify(zero, positive, negative)).toBe("none");
    expect(classify(positive, positive, summarize([2]))).toBe("context-dependent");
  });
  it("rejects duplicate or unpaired seeds", () => {
    expect(() => analyze([...fixture(), fixture()[0]])).toThrow("Duplicate");
    expect(() => analyze(fixture().slice(1))).toThrow("Unpaired");
  });
  it("renders every table row on one line without reading out/", () => {
    const report = renderReport(analyze(fixture(6), 3), ledger, { source: "fixture", inputs: [] });
    expect(report).toContain("## Classification"); expect(report).toContain("## Controls");
    expect(report).not.toContain("all observed stack?null metric differences are zero");
    expect(report).toContain("Differences for the next control unit: v1/offset");
    expect(report).not.toMatch(/^[ \t]+\|/m);
    for (const line of report.split("\n").filter((line) => line.startsWith("|"))) expect(line.endsWith(" |" )).toBe(true);
    const classification = report.split("## Classification")[1].split("## Function ledger")[0];
    expect(classification.split("\n").filter((line) => line.startsWith("| v1/"))).toHaveLength(2 * METRICS.length);
  });
});
