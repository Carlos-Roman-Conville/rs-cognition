import { describe, expect, it } from "vitest";
import { canonical } from "@rex/kernel";
import { createHash } from "node:crypto";
import { comparisonV1, FORMULAS, TYPES } from "../bench/personality-models.ts";
import { runPersonalitySeed, renderReport } from "../bench/personality-versions.ts";
import { runHungryPair, HungryPairWorld } from "../bench/hungry-pair/world.ts";

describe("DESIGN §9 T-3 public API integration", () => {
  it("preserves identical personality configuration for A, B and O", () => {
    const personality = comparisonV1("ENFJ");
    const world = new HungryPairWorld({ seed: 1, epochs: 2, personality });
    expect(Object.values(world.configs).every((config) => config.personality === personality)).toBe(true);
    expect(new HungryPairWorld({ seed: 1, epochs: 2 }).options.personality).toBeUndefined();
  });
  it("checks all 16 stacks and every ablation; shared executions match independent full traces", () => {
    const row = runPersonalitySeed(1, 2);
    expect(row.nullRepeat).toBe(true);
    expect(row.allOff).toBe(16);
    expect(row.equivalent).toBeGreaterThan(0);
    for (const type of TYPES) {
      expect(row.hashes[`v1/${type}/all-off`]).toBe(row.hashes.null);
      for (const f of FORMULAS) expect(row.metrics[`v1/${type}/off:${f}`]).toBeDefined();
    }
    for (const [type, disabled] of [["ESFP", []], ["ESTP", ["F3"]], ["INTJ", ["F1"]], ["ISFJ", FORMULAS]] as const) {
      const run = runHungryPair({ seed: 1, epochs: 2, personality: comparisonV1(type, disabled) });
      const key = `v1/${type}${disabled.length === 13 ? "/all-off" : disabled.length ? `/off:${disabled[0]}` : ""}`;
      expect(createHash("sha256").update(canonical(run)).digest("hex")).toBe(row.hashes[key]);
    }
    expect(() => renderReport([row], 2)).toThrow("ordered seeds");
    // Synthetic in-memory report-input fixture only; never write it as measured evidence.
    const fixture = Array.from({ length: 200 }, (_, i) => ({ ...row, seed: i + 1 }));
    const incomplete = { ...row.metrics };
    delete incomplete["v1/ENFJ/off:F13"];
    fixture[0] = { ...fixture[0], metrics: incomplete };
    expect(() => renderReport(fixture, 2)).toThrow("Missing v1/ENFJ/off:F13 evidence");
  }, 60_000);
});
