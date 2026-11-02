import { describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import { simTime, streams } from "@rex/kernel";
import { generateActions, evaluateActions, selectAction } from "../src/index.ts";
import type { Observation } from "../src/index.ts";
import { createEightFunctionV2 } from "../experimental/personality-v2/v2.ts";
import type { SeContext } from "../experimental/personality-v2/se.ts";
import { buildV2Ledger, influence } from "../bench/diagnostics/v2-ledger.ts";
import type { V2Epoch } from "../bench/diagnostics/v2-ledger.ts";
import { renderComparison } from "../bench/diagnostics/v2-comparison.ts";
import { runForage } from "../bench/scenarios/s1-forage/world.ts";
import { runWorkshop } from "../bench/scenarios/s3-workshop/world.ts";
import { configurations, parseArgs } from "../bench/scenarios/s1-forage/run.ts";
import { shuffledV2 } from "../bench/scenarios/controls.ts";
import { scored, view, wait } from "./decision-fixtures.ts";

// Real Se -> generation -> evaluation -> selection, with seeded common draws.
function decision(seed: number, beliefP: number, masked = false): V2Epoch {
  const ctx: SeContext = { ...view({ beta: 100 }), mind: "mind.0001", t: simTime(1000),
    attended: [{ category: "space", weight: 1 }], candidates: [], trace: { allocations: [] }, operations: [] };
  const cue: Observation = { kind: "categorical", cue: "door", about: "door", attribute: "open", value: "yes",
    channel: "touch", t: ctx.t, model: { P_H: 1, P_FA: 0, q: 0.9 } };
  const model = createEightFunctionV2("ESTP", { mask: masked ? [{ function: "Se", operation: "preconditionEvidence" }] : [],
    se: { context: () => ctx, isPresent: () => true, probability: () => 0.9 } });
  const generation = generateActions({ repertoire: [{ ...scored("enter", 1), preconditions: [{ id: "open", probability: () => beliefP }] }],
    wait, body: { capacity_functional: 1 } }, ctx, model, [cue]);
  const evaluation = evaluateActions(generation, ctx, [], {}, ctx.t, model);
  const selected = selectAction(evaluation, { mind: ctx.mind, counters: {} }, streams(seed).get("cognition.decision.select", ctx.mind));
  // Unused host fields come from a real one-step fixture; measured fields use this decision.
  const row = runWorkshop({ seed, epochs: 1 }).hostInputLog[0];
  return { ...row, intention: selected.intention, trace: { ...row.trace, selection: selected.trace,
    evaluation: selected.trace.candidates.map(r => ({ action: r.candidate.action, expectedUtility: r.expectedUtility })),
    v2: { allocations: ctx.trace.allocations, operations: ctx.operations, beliefs: ctx.beliefs, meanings: {} } } };
}

describe("DESIGN §22.5 allocation, execution and influence", () => {
  for (const seed of [1, 2]) {
    it(`seed ${seed}: executed identity has zero influence; a masked decision change is reported`, () => {
      const base = decision(seed, 0.9), off = decision(seed, 0.9, true);
      expect(base.trace.v2!.operations).toHaveLength(1);
      expect(off.trace.v2!.operations).toHaveLength(0);
      expect(influence(base, off).changed).toBe(false);
      expect(influence(base, off).decision.deltaMargin).toBe(0);
      const changed = decision(seed, 0.1), masked = decision(seed, 0.1, true);
      const ledger = buildV2Ledger({ scenario: "test", seed, configuration: { version: "v2", stack: "ESTP" }, hostInputLog: [changed] }, "detailed", () => masked);
      expect(ledger.records![0].influence.decision.changed).toBe(true);
      expect(ledger.records![0].influence.candidates.added).toHaveLength(1);
      expect(ledger.records![0].influence.decision.maskedMargin).toBeNull();
      expect(ledger.summary.find(r => r.function === "Se")!.influenceShare).toBe(1);
    });
    it(`seed ${seed}: S1/S3 V2 replay and same-prefix masking`, () => {
      for (const execute of [runForage, runWorkshop]) {
        const run = execute({ seed, epochs: 2, configuration: { version: "v2", stack: "ISTJ" } });
        expect(run.replayed).toBe(true);
        const ledger = buildV2Ledger(run, "detailed", (v2Mask, epochs) => {
          const off = execute({ seed, epochs, configuration: run.configuration, v2Mask });
          expect(off.hostInputLog.slice(0, -1)).toEqual(run.hostInputLog.slice(0, epochs - 1));
          return off.hostInputLog.at(-1)!;
        });
        expect(ledger.sharedParameters.every(r => r.changes.length === 0)).toBe(true);
        expect(ledger.summary).toHaveLength(8);
        expect(run.hostInputLog.every(r => r.trace.v2!.allocations.length > 0)).toBe(true);
      }
    }, 60_000);
  }
  it("explicit --personality v1 preserves default runner bytes on two seeds", () => {
    for (const scenario of ["s1-forage", "s3-workshop"]) {
      const args = ["--experimental-strip-types", `bench/scenarios/${scenario}/run.ts`, "--seeds", "2", "--stacks", "null", "--ledger", "off"];
      const run = (extra: string[]) => execFileSync("node", [...args, ...extra], { encoding: "utf8", maxBuffer: 128 * 1024 * 1024 } as { encoding: "utf8" });
      expect(run(["--personality", "v1"])).toBe(run([]));
    }
    expect(parseArgs(["--personality", "v1"])).toEqual(parseArgs([]));
    expect(configurations("all", "v1")).toEqual(configurations("all"));
    expect(configurations("all", "both")).toHaveLength(33);
  }, 60_000);
  it("shuffled V2 permutes labels and preserves position weights deterministically", () => {
    const model = createEightFunctionV2("ESTP");
    const identity = shuffledV2(model, () => 0.999);
    expect(identity.stack).toEqual(model.stack);
    const shuffled = shuffledV2(model, streams(1).get("bench.control.shuffle", "scenario"));
    expect(shuffled.stack).not.toEqual(model.stack);
    expect(shuffled.stack).toEqual(shuffledV2(model, streams(1).get("bench.control.shuffle", "scenario")).stack);
    const ctx = { ...view(), mind: "m", attended: [], candidates: [], trace: { allocations: [] } };
    expect(shuffled.allocation(ctx).map(r => r.B)).toEqual(model.allocation(ctx).map(r => r.B));
  });
  it("comparison pairs by seed and stack and reports absent mechanism evidence", () => {
    const rows = [1, 2].flatMap(seed => ["v1", "v2"].map(version => ({ seed, configuration: { version, stack: "ESTP" }, metrics: { food: seed + (version === "v2" ? 2 : 0) } })));
    const report = renderComparison(rows, ["food"]);
    expect(report).toContain("## V1 against V2");
    expect(report).toContain("| 2 | ESTP | food | 2 | 4 | 2 |");
    expect(report).toContain("V2 ledger unavailable");
    expect(() => renderComparison(rows.slice(1), ["food"])).toThrow("Expected one V1 pair");
  });
});
