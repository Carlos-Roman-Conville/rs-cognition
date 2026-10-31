import { describe, expect, it } from "vitest";
import { interval, paired, ranking, stabilization, summarizePersonality } from "../bench/personality-metrics.ts";
import { runHungryPair, FIXTURE } from "../bench/hungry-pair/world.ts";

describe("T-3 learning measurement and clustered intervals", () => {
  it("requires three consecutive final ranks after feedback and rejects temporary plateaus", () => {
    const rows = (ranks: (string | null)[]) => ranks.map((rank, i) => ({ rank, t: (i + 1) * FIXTURE.epochMs }));
    expect(stabilization(rows(["a", "a", "a", "b"]), 0)).toBeNull();
    expect(stabilization(rows(["a", "b", "b", "b"]), FIXTURE.epochMs)).toBe(1);
    expect(stabilization(rows(["a", "a", "a"]), FIXTURE.epochMs)).toBeNull();
    expect(stabilization(rows([null, null, null]), 0)).toBeNull();
    expect(stabilization([{ t: 1, rank: "a" }, { t: 2, rank: "a" }, { t: 3, rank: "a" }], 0)).toBeNull();
  });
  it("uses paired differences, preserves missingness, and does not invent one-seed intervals", () => {
    expect(interval([0, 0, 0])).toEqual({ mean: 0, low: 0, high: 0, n: 3 });
    expect(interval([])).toBeNull();
    expect(interval([3])).toEqual({ mean: 3, low: null, high: null, n: 1 });
    expect(paired([{ x: 2 }, { x: null }, { x: 6 }], [{ x: 1 }, { x: 7 }, { x: 5 }], "x"))
      .toEqual({ mean: 1, low: 1, high: 1, n: 2 });
    expect(() => paired([], [{ x: 1 }], "x")).toThrow();
  });
  it("maps qualified receipt IDs to action domains and censors short runs without claiming zero learning time", () => {
    const run = runHungryPair({ seed: 1, epochs: 2 });
    const values = summarizePersonality(run);
    for (const role of ["A", "B", "O"]) {
      expect(values[`${role}/people/receipts`]).toBeGreaterThan(0);
      expect(values[`${role}/people/learning-epochs`]).toBeNull();
      expect(values[`${role}/space/informative`]).toBe(0);
      expect(values[`${role}/space/censored`]).toBe(0);
      expect(values[`${role}/space/learning-epochs`]).toBeNull();
      const frequencies = Object.entries(values).filter(([key]) => key.startsWith(`${role}/`) && key.includes("action:")).map(([, v]) => v!);
      expect(frequencies.reduce((a, b) => a + b, 0)).toBeCloseTo(1);
    }
    expect(ranking(run.decisions[0], "space")).toBeNull();
    const trace = run.decisions[0];
    const reversed = { ...trace, candidates: [...trace.candidates].reverse() };
    expect(ranking(trace, "people")).toBe(ranking(reversed, "people"));
  });
});
