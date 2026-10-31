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

  it("places the fitted exponent inside a sourced Rubin & Wenzel range for comparable materials", () => {
    const exponent = fitPower(retentionCurve()).exponent;
    const range = reference.exponentRange as readonly [number, number] | null;
    // Deliberately fails closed; no invented bounds, skip, or expected-failure marker.
    expect(range, `V1 PARKED: fitted exponent=${exponent}. ${reference.blockedReason}`).not.toBeNull();
    if (range === null) throw new Error(reference.blockedReason);
    expect(exponent).toBeGreaterThanOrEqual(range[0]);
    expect(exponent).toBeLessThanOrEqual(range[1]);
  });
});
