import { describe, expect, it } from "vitest";
import { createEightFunctionV2 } from "../experimental/personality-v2/v2.ts";
import type { FunctionValues, V2Context } from "../experimental/personality-v2/v2.ts";
import data from "../experimental/personality-v2/data.json" with { type: "json" };
import { view } from "./decision-fixtures.ts";

// Proposed fixtures: inverse baseline weights make B * R equal for every
// ESTP function, isolating the habit contribution in both allocation phases.
const domains = ["space", "meta", "people", "strategy"];
const counts = [3, 4, 6, 12];
const ctx = (): V2Context => ({ ...view(), mind: "habit",
  attended: domains.map((category, i) => ({ category, weight: counts[i] })),
  candidates: domains.flatMap((domain, i) => Array.from({ length: counts[i] }, () => ({ domain }))),
  trace: { allocations: [] },
});
const state = (E: Partial<FunctionValues>) => ({ minds: { habit: { E } } });
const experiences = [0, 1e-12, 0.1, 1, 22, 66, 220, 1e6, Number.MAX_VALUE];

describe("FUNCTION-DESIGN §4.6 saturating V2 habit", () => {
  it("has H = 1 with no experience", () => {
    const rows = createEightFunctionV2("ESTP").allocation(ctx());
    rows.forEach(r => { expect(r.E).toBe(0); expect(r.H).toBe(1); });
  });

  it("matches the saturating curve, rises monotonically, and never exceeds 1 + h", () => {
    expect(data.habit.h).toMatchObject({ value: 1, status: "estimate", sourced: false });
    expect(data.habit.E_0).toMatchObject({ value: 22, status: "estimate", sourced: false });
    let previous = 1;
    for (const E of experiences) {
      const row = createEightFunctionV2("ESTP", { state: state({ Se: E }) }).allocation(ctx())[0];
      expect(row.H).toBeCloseTo(1 + (1 - Math.exp(-E / 22)), 14);
      expect(row.H).toBeGreaterThanOrEqual(previous);
      if (E > 0 && E <= 220) expect(row.H).toBeGreaterThan(previous);
      expect(row.H).toBeLessThanOrEqual(1 + data.habit.h.value);
      previous = row.H;
    }
  });

  it("bounds allocation ratios from habit alone by 1 + h (principle 9)", () => {
    for (const E of experiences) {
      const rows = createEightFunctionV2("ESTP", { state: state({ Se: E }) }).allocation(ctx());
      for (const phase of ["att", "eval"] as const) {
        rows.forEach(r => expect(r.B * r.R[phase]).toBeCloseTo(rows[0].B * rows[0].R[phase], 14));
        for (const f of rows) for (const j of rows) {
          expect(f.M).toBe(1);
          expect(f.A[phase] / j.A[phase]).toBeLessThanOrEqual(1 + data.habit.h.value + 1e-14);
          expect(f.A[phase] / j.A[phase]).toBeCloseTo(f.H / j.H, 14);
        }
      }
    }
  });

  it("lets a sufficiently relevant inferior function lead despite saturated dominant habit", () => {
    const p = createEightFunctionV2("ESTP", { state: state({ Se: Number.MAX_VALUE }) });
    const c = ctx();
    const rows = p.allocation({ ...c,
      attended: [{ category: "space", weight: 1 }, { category: "strategy", weight: 9 }],
      candidates: [{ domain: "space" }, ...Array.from({ length: 9 }, () => ({ domain: "strategy" }))],
    });
    expect(rows[0].H).toBe(2);
    expect(rows[3].function).toBe("Ni");
    expect(rows[3].H).toBe(1);
    for (const phase of ["att", "eval"] as const) {
      expect(rows[3].A[phase]).toBeGreaterThan(rows[0].A[phase]);
      expect(rows[3].A[phase]).toBe(Math.max(...rows.map(r => r.A[phase])));
    }
  });

  it("keeps equal experience allocation identical and exposes no competence or gain", () => {
    const initial = state({ Se: 22, Ti: 66, Fe: 1, Ni: 220 });
    const a = createEightFunctionV2("ESTP", { state: initial }).allocation(ctx());
    const b = createEightFunctionV2("ESTP", { state: initial }).allocation(ctx());
    [...a, ...b].forEach(r => expect(r).not.toHaveProperty("C"));
    expect(a.map(r => r.A)).toEqual(b.map(r => r.A));
    expect(a.map(r => r.E)).toEqual(b.map(r => r.E));
    expect(a.map(r => r.H)).toEqual(b.map(r => r.H));
    [...a, ...b].forEach(r => expect(r).not.toHaveProperty("g"));
  });

  it("replays V2 state and allocation traces byte-identically, including snapshot continuation", () => {
    const run = () => {
      const p = createEightFunctionV2("ESTP");
      const c = ctx();
      for (const dt of [0, 1, 22, 66, 220]) p.advance(c, dt);
      const resumed = createEightFunctionV2("ESTP", { state: p.state });
      const continuation = ctx();
      p.advance(c, 7);
      resumed.advance(continuation, 7);
      expect(JSON.stringify(resumed.state)).toBe(JSON.stringify(p.state));
      expect(JSON.stringify(continuation.trace.allocations)).toBe(JSON.stringify(c.trace.allocations.slice(-4)));
      return JSON.stringify({ state: p.state, trace: c.trace });
    };
    expect(run()).toBe(run());
  });
});
