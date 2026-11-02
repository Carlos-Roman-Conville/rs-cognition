import { describe, expect, it } from "vitest";
import { streams } from "@rex/kernel";
import { nullPersonality } from "../src/index.ts";
import { WorkshopWorld, runWorkshop } from "../bench/scenarios/s3-workshop/world.ts";
import { commitmentCalibration, configurations, parseArgs, runRecord } from "../bench/scenarios/s3-workshop/run.ts";
import { makeSensor, perceiveResult } from "../bench/scenarios/s3-workshop/perception.ts";
import { initialMemory, initialNeeds, PARAMS } from "../bench/scenarios/s3-workshop/models.ts";
import { analyze, renderReport } from "../bench/scenarios/s3-workshop/analyze.ts";

describe("S3 Workshop: DESIGN sections 4, 9, 10.4", () => {
  it("replays both seeds byte-identically, including full processing traces and restored kernel streams", () => {
    for (const seed of [1, 2]) for (const configuration of [{ version: "null" }, { version: "v1", stack: "ENTJ" as const }]) {
      const a = runRecord(seed, configuration, "off"), b = runRecord(seed, configuration, "off");
      expect(JSON.stringify(a)).toBe(JSON.stringify(b));
      expect(a.replayed).toBe(true);
      expect(a.hostInputLog).toHaveLength(16);
      expect(a.header.kappa).toBeGreaterThan(0);
      for (const row of a.hostInputLog) {
        expect(row.trace.candidates).toEqual(row.trace.selection.inputs.generation.candidates);
        expect(row.trace.evaluation).toHaveLength(row.trace.candidates.length);
        expect(row.trace.attention.shares.reduce((a, b) => a + b, 0)).toBeCloseTo(1);
        expect(row.trace.observationBeliefDeltas.length).toBeGreaterThan(0);
        expect(row.trace.learning.updates).toHaveLength(3);
        expect(row.trace.selection.needs.needs.map(n => n.definition.id)).toEqual(["hunger", "competence"]);
      }
      const world = new WorkshopWorld({ seed, kappa: a.header.kappa });
      world.run();
      expect(JSON.stringify(world.replay().hostInputLog)).toBe(JSON.stringify(world.hostInputLog));
      const altered = structuredClone(world.initial);
      (altered.engines.world as { hunger: number }).hunger = 0;
      expect(() => world.replay(altered)).toThrow("replay mismatch");
    }
  });

  it("preserves CB-6 identical A/B workers and task-id swaps on both seeds", () => {
    // One-worker worlds: compare independent identical slots, not competing agents absent from the design.
    for (const seed of [1, 2]) {
      const a = runWorkshop({ seed, label: "A", kappa: commitmentCalibration().kappa });
      const b = runWorkshop({ seed, label: "B", kappa: commitmentCalibration().kappa });
      const withoutLabel = (rows: typeof a.hostInputLog) => rows.map(({ mind: _mind, ...row }) => row);
      expect(withoutLabel(a.hostInputLog)).toEqual(withoutLabel(b.hostInputLog));
      const swapped = runWorkshop({ seed, taskIds: ["B", "A"], kappa: commitmentCalibration().kappa });
      const rename = (value: unknown) => JSON.stringify(value).replace(/([":])A(?=[":])/g, '$1TEMP').replace(/([":])B(?=[":])/g, '$1A').replace(/([":])TEMP(?=[":])/g, '$1B');
      expect(rename(withoutLabel(a.hostInputLog)) === JSON.stringify(withoutLabel(swapped.hostInputLog))).toBe(true);
      expect(rename(a.final)).toBe(JSON.stringify(swapped.final));
      expect(a.rng).toEqual(swapped.rng);
    }
  });

  it("records exactly one positive seed-1 null median-gap calibration and exercises commitment", () => {
    const calibration = commitmentCalibration();
    const gaps = runWorkshop({ seed: 1, kappa: 0 }).hostInputLog.map(row => {
      const values = row.trace.evaluation.map(c => c.expectedUtility).sort((a, b) => b - a);
      return values[0] - values[1];
    }).sort((a, b) => a - b);
    expect(calibration.medianGap).toBe((gaps[7] + gaps[8]) / 2);
    expect(calibration.kappa).toBe(calibration.medianGap * 0.25);
    expect(calibration.kappa).toBeGreaterThan(0);
    expect(commitmentCalibration()).toBe(calibration);
    const run = runRecord(1, { version: "null" }, "off");
    expect(run.header.commitment).toEqual(calibration);
    expect(run.hostInputLog.some(r => r.trace.selection.commitment.kept)).toBe(true);
  });

  it("reveals hidden defects only by verify and retries a flagged unfinished step", () => {
    for (const seed of [1, 2]) {
      const clean = new WorkshopWorld({ seed }), defective = new WorkshopWorld({ seed });
      const a = clean.resolve({ action: "continue", target: "A" }, [false, false]);
      const b = defective.resolve({ action: "continue", target: "A" }, [true, false]);
      expect(a).toEqual(b);
      const memory = initialMemory(["A", "B"]), view = { beliefs: memory.beliefs, needs: initialNeeds(memory), params: PARAMS };
      const sensor = (world: WorkshopWorld) => makeSensor(world.state, 1000, streams(seed).get("test", "sensor"))(view, nullPersonality, () => {});
      expect(sensor(clean)).toEqual(sensor(defective));
      expect(perceiveResult(a, 1000, streams(seed).get("test", "result"))).toEqual(perceiveResult(b, 1000, streams(seed).get("test", "result")));
      expect(defective.resolve({ action: "ask", target: "foreman" }, [false, false]).revealed).toBeNull();
      expect(defective.resolve({ action: "wait" }, [false, false]).revealed).toBeNull();
      const checked = defective.resolve({ action: "verify" }, [false, false]);
      expect(checked.revealed).toBe(true);
      expect(defective.state.tasks[0].steps).toBe(0);
      expect(perceiveResult(checked, 2000, streams(seed).get("test", "verify")).some(o => o.attribute === "quality" && o.kind === "categorical" && o.value === "bad")).toBe(true);
      expect(defective.resolve({ action: "continue", target: "B" }, [false, false]).success).toBe(false);
    }
  });

  it("uses unchanged V1 procedural context and null low-reliability opinion acceptance never exceeds procedural", () => {
    for (const seed of [1, 2]) {
      const world = new WorkshopWorld({ seed });
      world.state.reliability = 0.4;
      const memory = initialMemory(["A", "B"]), view = { beliefs: memory.beliefs, needs: initialNeeds(memory), params: PARAMS };
      const sample = () => makeSensor(world.state, 1000, streams(seed).get("test", "testimony"))(view, nullPersonality, () => {});
      const procedural = sample();
      world.resolve({ action: "continue", target: "A" }, [false, false]);
      const opinion = sample();
      expect(procedural.testimony.context).toBe("procedural");
      expect(opinion.testimony.context).toBe("opinion");
      expect(Number(opinion.testimony.accepted)).toBeLessThanOrEqual(Number(procedural.testimony.accepted));
      const run = runRecord(seed, { version: "v1", stack: "ENTJ" }, "off");
      for (const row of run.hostInputLog) {
        if (row.testimony.context === "procedural") expect(row.testimony.effectiveReliability).toBeGreaterThan(row.testimony.reliability);
        else expect(row.testimony.effectiveReliability).toBe(row.testimony.reliability);
      }
    }
  });

  it("supports V1/control/ledger options, shared exogenous draws, and section 10 tables", () => {
    expect(configurations("all")).toHaveLength(17);
    expect(parseArgs(["--seeds", "2", "--stacks", "all", "--personality", "v1", "--control", "shuffled", "--ledger", "summary"]))
      .toEqual({ seeds: 2, stacks: "all", personality: "v1", control: "shuffled", ledger: "summary" });
    for (const args of [["--personality", "v2"], ["--seeds", "0"], ["--control", "bad"]]) expect(() => parseArgs(args)).toThrow("Usage");
    const records = [1, 2].flatMap(seed => [runRecord(seed, { version: "null" }), runRecord(seed, { version: "v1", stack: "ENTJ" }, "detailed")]);
    const report = analyze(records);
    expect(report.groups.find(g => g.key === "v1/none")!.mechanisms).toHaveLength(8);
    expect(report.groups.find(g => g.key === "v1/none")!.behaviour).toHaveLength(5);
    expect(renderReport(report)).toContain("First half");
    for (const record of records) {
      expect(record.ledger!.summary.length).toBe(32);
      expect(record.rng["s3.defect@workshop"]).toBe(records.find(r => r.seed === record.seed)!.rng["s3.defect@workshop"]);
    }
    const shuffled = runRecord(1, { version: "v1", stack: "ENTJ" }, "summary", "shuffled");
    expect(shuffled.ledger!.limitations.join(" ")).toContain("attribution unavailable");
    const theta = runRecord(1, { version: "null" }, "off", "random-theta");
    expect(theta.controlTheta).toBeDefined();
    expect(theta.rng["s3.defect@workshop"]).toEqual(records[0].rng["s3.defect@workshop"]);
    expect(analyze([records[0], shuffled, theta]).groups).toHaveLength(3);
  }, 60_000);
});
