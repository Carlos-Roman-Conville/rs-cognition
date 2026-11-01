import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { canonical } from "@rex/kernel";
import { comparisonV1 } from "../bench/personality-models.ts";
import { adapter, FUNCTIONS, HOOKS, rerunAblation } from "../bench/diagnostics/ablation.ts";
import { buildLedger, emptyTotals, addTotals, localRecord, margin } from "../bench/diagnostics/ledger.ts";
import type { Ledger } from "../bench/diagnostics/ledger.ts";
import { buildReport, reportJSON, reportMarkdown, seedInterval } from "../bench/diagnostics/report.ts";
import { ForageWorld, runForage } from "../bench/scenarios/s1-forage/world.ts";
import { parseArgs, runRecord } from "../bench/scenarios/s1-forage/run.ts";

describe("Function Activation Ledger (DESIGN diagnostics §4)", () => {
  it("partitions every function/hook/epoch and matches hook-output changes over eight seeds, frozen v1 and two stacks", () => {
    const ledgers: Ledger[] = [];
    for (let seed = 1; seed <= 8; seed++) for (const stack of ["ESTP", "ISTJ"] as const) {
      // Three consecutive epochs exercise feedback and rerun divergence; the existing S1 gate uses all 12.
      const run = runForage({ seed, epochs: 3, configuration: { version: "v1", stack } });
      const original = canonical(run);
      const detailed = buildLedger(run, "detailed");
      ledgers.push(detailed);
      expect(canonical(run)).toBe(original);
      expect(detailed.records).toHaveLength(3 * 8 * 4);
      expect(detailed.totals.activations).toBe(detailed.records!.filter((row) => row.changedHookCalls > 0).length);
      expect(Object.values(detailed.totals.eligibility).reduce((sum, n) => sum + n, 0)).toBe(3 * 8 * 4);
      for (const record of detailed.records!) {
        expect(record.activation).toBe(Number(record.changedHookCalls > 0));
        expect(record.eligibility === "activated").toBe(record.activation === 1);
        expect(record.chosenAction).toEqual({ action: run.hostInputLog[record.epoch - 1].intention.action,
          target: run.hostInputLog[record.epoch - 1].intention.target });
        expect(record.needPriorities.length).toBeGreaterThan(0);
        expect(record.observationBeliefDeltas).toEqual(record.hook === "pertinence" || record.hook === "interpret"
          ? run.hostInputLog[record.epoch - 1].trace.observationBeliefDeltas : null);
      }
      const sum = emptyTotals();
      for (const row of detailed.summary) addTotals(sum, row);
      expect(sum.activations).toBe(detailed.totals.activations);
      expect(sum.deltaUSum).toBeCloseTo(detailed.totals.deltaUSum, 12);
      expect(sum.learningContribution).toBeCloseTo(detailed.totals.learningContribution, 12);
      // Generation F11 has kappa=0; F9/F10 have no adapter. No invented generation activations.
      expect(detailed.records!.filter((row) => row.hook === "generate").every((row) => row.activation === 0)).toBe(true);
      if (seed === 1) {
        const summary = buildLedger(run);
        expect(summary.records).toBeUndefined();
        const { records: _records, ...withoutDetails } = detailed;
        expect(summary).toEqual(withoutDetails);
        const world = new ForageWorld({ seed, epochs: 3, configuration: run.configuration });
        world.run();
        expect(JSON.stringify(buildLedger(world.replay(), "detailed"))).toBe(JSON.stringify(detailed));
      }
    }
    const report = buildReport(ledgers);
    expect(report.seedCount).toBe(8);
    expect(report.byFunction).toHaveLength(8);
    expect(report.byStack).toHaveLength(16);
    expect(report.byFunction.every((row) => row.seeds === 8 && row.interval95 !== null)).toBe(true);
    expect(report.observedRelevanceMap.some((row) => row.key === "Se/space")).toBe(true);
    expect(report.byDevelopmentalStage).toEqual([]);
    expect(report.byUpbringing).toEqual([]);
    expect(JSON.parse(reportJSON(report))).toEqual(report);
    expect(reportMarkdown(report)).toContain("95% seed interval");
  }, 240_000);

  it("gives the null control zero effects while retaining measured opportunities and complete eligibility", () => {
    for (let seed = 1; seed <= 8; seed++) {
      const run = runForage({ seed, epochs: 2 });
      const ledger = buildLedger(run, "detailed");
      expect(ledger.totals.activations).toBe(0);
      expect(ledger.totals.deltaUSum).toBe(0);
      expect(ledger.totals.attentionMoved).toBe(0);
      expect(ledger.totals.interpretationMagnitude).toBe(0);
      expect(ledger.totals.learningContribution).toBe(0);
      expect(ledger.totals.eligibility["eligible-not-activated"]).toBeGreaterThan(0);
      expect(ledger.records!.every((row) => row.formulas.length === 0 && row.deltaU === 0)).toBe(true);
    }
  }, 30_000);

  it("shares initial snapshots and random streams, and never-active ablations reproduce complete run bytes", () => {
    for (const stack of ["ESTP", "ISTJ"] as const) {
      const run = runForage({ seed: 8, epochs: 3, configuration: { version: "v1", stack } });
      const { replayed: _replayed, ...base } = run;
      // Fe has no generation formula in frozen v1, including when it is in ESTP's stack.
      expect(canonical(rerunAblation(run, { function: "Fe", hook: "generate" }))).toBe(canonical(base));
      const off = rerunAblation(run, { function: "Se", hook: "pertinence" });
      expect(off.seed).toBe(run.seed);
      expect(off.initial).toEqual(run.initial);
      expect(off.rng).toEqual(run.rng);
      expect(off.hostInputLog.map((row) => row.trace.selection.draw)).toEqual(run.hostInputLog.map((row) => row.trace.selection.draw));
      expect(canonical(rerunAblation(run, { function: "Se", hook: "pertinence" }))).toBe(canonical(off));
    }
  }, 30_000);

  it("uses actual hook-output changes, including scale-only attention changes, rather than action changes", () => {
    const run = runForage({ seed: 1, epochs: 1, configuration: { version: "v1", stack: "ESTP" } });
    const disabled = { function: "Ti" as const, hook: "pertinence" as const };
    const off = rerunAblation(run, disabled);
    const baseHook = run.hostInputLog[0].trace.hooks.find((call) => call.hook === "pertinence")!;
    const offHook = off.hostInputLog[0].trace.hooks.find((call) => call.hook === "pertinence")!;
    expect(baseHook.after).not.toEqual(offHook.after);
    const record = localRecord(run.hostInputLog[0], adapter(run.configuration, disabled), disabled);
    expect(record.activation).toBe(1);
    expect(record.changedHookCalls).toBe(1);
    expect(record.attentionMoved).toBeLessThan(1e-12);
    expect(off.hostInputLog[0].intention).toEqual(run.hostInputLog[0].intention);
    // Independent oracle: Ti disables only collective F1/F3 at interpretation, matching the old switch mechanism.
    const a = adapter(run.configuration, { function: "Ti", hook: "interpret" });
    const call = run.hostInputLog[0].trace.hooks.find((call) => call.hook === "interpret")!;
    const old = comparisonV1("ESTP", ["F1", "F3"]);
    const base = call.before as Parameters<typeof old.interpret>[0];
    expect(a.transform("interpret", base, call.after, "space"))
      .toEqual(old.interpret(base, "space", {} as Parameters<typeof old.interpret>[2]));
    expect(() => buildLedger({ ...run, configuration: { version: "v999", stack: "ESTP" } })).toThrow("No ledger ablation");
  });

  it("restores custom-layout snapshots with the same configured action repertoire", () => {
    const run = runForage({ seed: 9, epochs: 2, configuration: { version: "v1", stack: "ESTP" }, patches: [
      { id: "a", x: 0, y: 0, kind: "berry-red" }, { id: "b", x: 1, y: 0, kind: "fungus-pale" },
    ] });
    const { replayed: _replayed, ...base } = run;
    expect(canonical(rerunAblation(run, { function: "Fe", hook: "generate" }))).toBe(canonical(base));
    const off = rerunAblation(run, { function: "Se", hook: "pertinence" });
    expect(off.initial).toEqual(run.initial);
    expect(off.final.patches).toEqual(run.final.patches);
    expect(off.rng).toEqual(run.rng);
  });

  it("defines ΔU against the original chosen action and excludes missing margins", () => {
    const run = runForage({ seed: 3, epochs: 2, configuration: { version: "v1", stack: "ESTP" } });
    const ablated = rerunAblation(run, { function: "Se", hook: "interpret" });
    const ledger = buildLedger(run, "detailed");
    const record = ledger.records!.find((row) => row.epoch === 2 && row.function === "Se" && row.hook === "interpret")!;
    const a = margin(run.hostInputLog[1], record.chosenAction), b = margin(ablated.hostInputLog[1], record.chosenAction);
    expect(record.deltaU).toBe(a === null || b === null ? null : a - b);
    expect(margin(run.hostInputLog[0], { action: "absent" })).toBeNull();
    expect(seedInterval([1])).toBeNull();
    expect(seedInterval([3, 3, 3])).toEqual([3, 3]);
    const ci = seedInterval([1, 2, 3, 4, 5, 6, 7, 8])!;
    expect(ci[1] - 4.5).toBeCloseTo(2.364624 * Math.sqrt(6 / 8), 6);
  }, 30_000);

  it("clusters intervals over seeds, not repeated decisions, and keeps unavailable influence explicit", () => {
    const source = buildLedger(runForage({ seed: 1, epochs: 1 }));
    const report = buildReport([source, source]);
    expect(report.byFunction.every((row) => row.seeds === 1 && row.interval95 === null)).toBe(true);
    const run = runForage({ seed: 2, epochs: 1 });
    const row = run.hostInputLog[0];
    row.trace.evaluation = row.trace.evaluation.filter((value) => value.action === row.intention.action && value.target === row.intention.target);
    expect(buildLedger(run).totals.meanDeltaU).toBeNull();
  });

  it("never imports or reads the intended relevance map, and uses only public engine imports", () => {
    for (const file of readdirSync(`${import.meta.dirname}/../bench/diagnostics`).filter((file) => file.endsWith(".ts"))) {
      const source = readFileSync(`${import.meta.dirname}/../bench/diagnostics/${file}`, "utf8");
      expect(source).not.toMatch(/INTENDED-RELEVANCE|readFileSync|readFile\s*\(|fetch\s*\(/);
      for (const match of source.matchAll(/from\s+["']([^"']+)["']/g)) {
        if (match[1].includes("src/")) expect(match[1]).toBe("../../src/index.ts");
      }
    }
    expect(FUNCTIONS).toHaveLength(8);
    expect(HOOKS).toHaveLength(4);
  });

  it("supports summary by default, detailed and off flags without changing the S1 host trace", () => {
    expect(parseArgs(["--ledger", "detailed"]).ledger).toBe("detailed");
    expect(parseArgs(["--ledger", "off"]).ledger).toBe("off");
    expect(() => parseArgs(["--ledger", "unknown"])).toThrow("Usage");
    const off = runRecord(1, { version: "null" }, "off");
    const summary = runRecord(1, { version: "null" });
    expect(off.ledger).toBeUndefined();
    expect(summary.ledger?.records).toBeUndefined();
    expect(summary.ledger?.schema).toBe("function-ledger/v1");
    expect(canonical(summary.hostInputLog)).toBe(canonical(off.hostInputLog));
  }, 30_000);
});
