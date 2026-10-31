import { describe, expect, it } from "vitest";
import { FORMULAS, TYPES, interval, paired, renderReport } from "../bench/personality-report.ts";
import type { SeedResult } from "../bench/personality-versions.ts";
import type { Metrics } from "../bench/personality-metrics.ts";

// Synthetic report-input fixture only. It is never written as empirical/benchmark evidence.
function inputs(): SeedResult[] {
  const metric = "A/people/action:ask";
  const baseline: Metrics = { [metric]: 0.5, "A/people/learning-epochs": null };
  const changed: Metrics = { ...baseline, [metric]: 0.6 };
  const metrics: Record<string, Metrics> = { null: baseline };
  const hashes: Record<string, string> = { null: "a".repeat(64) };
  for (const type of TYPES) for (const suffix of ["", "/all-off", ...FORMULAS.map((id) => `/off:${id}`)]) {
    const key = `v1/${type}${suffix}`;
    const move = type === "ENFJ" && suffix !== "/all-off" && suffix !== "/off:F1";
    metrics[key] = move ? changed : baseline;
    hashes[key] = (move ? "b" : "a").repeat(64);
  }
  return Array.from({ length: 200 }, (_, i) => ({ seed: i + 1, epochs: 12, metrics, hashes,
    executions: 3, equivalent: 239, nullRepeat: true, allOff: 16 }));
}

describe("T-3 evidence rendering independent of a live engine", () => {
  it("reports paired formula interventions, zero-effect coverage and missing learning times", () => {
    const report = renderReport(inputs());
    expect(report).toContain("single-formula removal of: F1.");
    expect(report).toContain("F1 (interpret): 0.1000 [0.1000, 0.1000]; n=200");
    expect(report).toContain("| v1/ENFJ | F1 (interpret) | 200 | 200 |");
    expect(report).toContain("| v1/ENFJ | F13 (interpret) | 0 | 0 |");
    expect(report).toContain("| A/people/learning-epochs | N/A (n=0) |");
    expect(report).toContain("## What this does not show");
    expect(report).toContain("McCrae & Costa (1989)");
    expect(report).not.toContain("NaN");
  });
  it("rejects missing ablations, failed all-off controls, seed duplication and mixed horizons", () => {
    const missing = inputs();
    missing[0] = { ...missing[0], metrics: { ...missing[0].metrics } };
    delete missing[0].metrics["v1/ENFJ/off:F13"];
    expect(() => renderReport(missing)).toThrow("Missing v1/ENFJ/off:F13 evidence");
    const failed = inputs();
    failed[0] = { ...failed[0], hashes: { ...failed[0].hashes, "v1/ENFJ/all-off": "c".repeat(64) } };
    expect(() => renderReport(failed)).toThrow("Failed all-off control");
    const duplicate = inputs(); duplicate[1] = { ...duplicate[1], seed: 1 };
    expect(() => renderReport(duplicate)).toThrow("ordered seeds");
    const horizon = inputs(); horizon[0] = { ...horizon[0], epochs: 2 };
    expect(() => renderReport(horizon)).toThrow("ordered seeds");
  });
  it("uses seed-paired complete cases and conservative small-sample t intervals", () => {
    expect(paired([{ x: 2 }, { x: null }, { x: 5 }], [{ x: 1 }, { x: 7 }, { x: 4 }], "x"))
      .toEqual({ mean: 1, low: 1, high: 1, n: 2 });
    expect(interval([0, 2])!.low).toBeCloseTo(1 - 12.707);
    expect(interval([0, 2])!.high).toBeCloseTo(1 + 12.707);
  });
});
