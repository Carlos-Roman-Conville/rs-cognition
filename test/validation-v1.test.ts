import { describe, expect, it } from "vitest";
import reference from "../validation/data/v1-reference.json";
import { DELAYS_SECONDS, fitLogPower, fitPower, retentionCurve } from "../validation/forgetting.ts";

describe("V1 independent retention validation (DESIGN §10)", () => {
  it("fits the default engine's unrehearsed single-episode retention from minutes to one year", () => {
    const points = retentionCurve();
    expect(points.map((p) => p.seconds)).toEqual(DELAYS_SECONDS);
    expect(points[0].seconds).toBe(60);
    expect(points.at(-1)!.seconds).toBe(365 * 86400);
    for (let i = 0; i < points.length; i++) {
      expect(points[i].retention).toBeGreaterThan(0);
      expect(points[i].retention).toBeLessThan(1);
      if (i) expect(points[i].retention).toBeLessThan(points[i - 1].retention);
    }
    expect(Number.isFinite(fitPower(points).exponent)).toBe(true);
  });

  it("recovers a known power curve independently of the engine and of the chosen time units", () => {
    const points = DELAYS_SECONDS.map((seconds) => ({ seconds, retention: 0.7 * seconds ** -0.37 }));
    expect(fitPower(points).exponent).toBeCloseTo(0.37, 7);
    expect(fitPower(points).amplitude).toBeCloseTo(0.7, 7);
    expect(fitLogPower(points).exponent).toBeCloseTo(0.37, 12);
    expect(fitPower(points.map((p) => ({ ...p, seconds: p.seconds / 60 }))).exponent).toBeCloseTo(0.37, 7);
  });

  it("meets the Table 4 median power-function R-squared criterion (COG-14)", () => {
    const sorted = reference.powerFit.rows.map((row) => row.rSquared).sort((a, b) => a - b);
    expect(sorted).toHaveLength(51);
    expect(sorted.length).toBe(reference.powerFit.datasetCount);
    const middle = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
    expect(median).toBe(reference.powerFit.medianRSquared);
    const fit = fitPower(retentionCurve());
    expect(fit.rSquared, `V1: R-squared=${fit.rSquared}; Table 4 median=${median}`)
      .toBeGreaterThanOrEqual(median);
    // Wixted & Ebbesen exponents are descriptive only; no empirical exponent tolerance.
  });
});
