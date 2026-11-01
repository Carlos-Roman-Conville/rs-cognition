import { describe, expect, it } from "vitest";
import { qualify, streams } from "@rex/kernel";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { data, drawYield, FIXTURE, makeGrid } from "../bench/scenarios/s1-forage/field.ts";
import type { Patch } from "../bench/scenarios/s1-forage/field.ts";
import { initialMemory } from "../bench/scenarios/s1-forage/models.ts";
import { patchCues } from "../bench/scenarios/s1-forage/perception.ts";
import { behaviorMetrics, summarizeForage } from "../bench/scenarios/s1-forage/metrics.ts";
import { configurations, parseArgs, runRecord } from "../bench/scenarios/s1-forage/run.ts";
import { ForageWorld, runForage } from "../bench/scenarios/s1-forage/world.ts";
import type { HostOutcome } from "../bench/scenarios/s1-forage/world.ts";

const square: Patch[] = [
  { id: "a", x: 0, y: 0, kind: "berry-red" }, { id: "b", x: 1, y: 0, kind: "fungus-pale" },
  { id: "c", x: 0, y: 1, kind: "root-brown" }, { id: "d", x: 1, y: 1, kind: "berry-red" },
];

describe("S1 forage fixture (DESIGN bench/scenarios §2)", () => {
  // CB-6 id-swap symmetry is inapplicable: this scenario contains exactly one mind, with no agent-order competition.
  it("preserves kind shares and seed determinism, and initializes only familiar episodes", () => {
    const grid = (seed: number) => makeGrid(streams(seed).get("fixture.s1.layout", qualify("cognition", "mind.0001")));
    expect(grid(4)).toEqual(grid(4));
    expect(grid(4)).not.toEqual(grid(5));
    expect(grid(4)).toHaveLength(36);
    for (const kind of data.kinds) expect(grid(4).filter((patch) => patch.kind === kind.id)).toHaveLength(12);
    expect(makeGrid(streams(1).get("fixture.s1.layout", "test"), 2, 2).map((p) => p.kind).sort())
      .toEqual(["berry-red", "berry-red", "fungus-pale", "root-brown"]);
    const memory = initialMemory(square.map((patch) => patch.id));
    for (const kind of data.kinds) expect(memory.episodes.filter((e) => e.context.kind === kind.id))
      .toHaveLength(kind.novel ? 0 : data.episodes.perKind);
    expect(drawYield(square[0], 0.449)).toBe(0);
    expect(drawYield(square[0], 0.45)).toBe(1);
    expect(drawYield(square[0], 0.9)).toBe(2);
  });

  it("runs nullPersonality end to end for eight seeds and replays every complete host log byte-identically", () => {
    for (let seed = 1; seed <= 8; seed++) {
      const first = runRecord(seed, { version: "null" });
      const second = runRecord(seed, { version: "null" });
      expect(JSON.stringify(first)).toBe(JSON.stringify(second));
      expect(first.replayed).toBe(true);
      expect(first.initial.kernel.version).toBe(2);
      expect(first.hostInputLog).toHaveLength(12);
      expect(first.final.hunger).toBeGreaterThanOrEqual(0);
      expect(first.final.hunger).toBeLessThanOrEqual(1);
      expect(first.metrics.foodGathered).toBe(first.final.food);
      expect(first.metrics.trace.changedCueShares).toBe(0);
      for (const hook of Object.values(first.metrics.trace.hooks)) expect(hook.changedCalls).toBe(0);
      expect(Object.keys(first.rng).every((key) => key.endsWith(`@${qualify("cognition", "mind.0001")}`))).toBe(true);
    }
  }, 60_000);

  it("restores the initial snapshot instead of trusting the current world state", () => {
    const world = new ForageWorld({ seed: 13, epochs: 3 });
    world.run();
    const initial = JSON.parse(JSON.stringify(world.initial));
    expect(JSON.stringify(world.replay(initial).hostInputLog)).toBe(JSON.stringify(world.hostInputLog));
    initial.engines.world.hunger = 0;
    expect(() => world.replay(initial)).toThrow("replay mismatch");
  });

  it("tags only on/adjacent patches present, inspected patches targeted, and previously visited patches remembered", () => {
    const world = new ForageWorld({ seed: 1, patches: square });
    const tags = (patch: string) => patchCues(world.state).find((cue) => cue.about === patch)!.tags;
    expect(tags("a")).toEqual(["physical", "present", "remembered"]);
    expect(tags("b")).toEqual(["physical", "present"]);
    expect(tags("c")).toEqual(["physical", "present"]);
    expect(tags("d")).toEqual(["physical"]);
    world.resolve({ action: "inspect", target: "d" }, [0, 0, 0, 0]);
    expect(tags("d")).not.toContain("targeted");
    world.resolve({ action: "inspect", target: "b" }, [0, 0, 0, 0]);
    expect(tags("b")).toContain("targeted");
    expect(tags("b")).not.toContain("remembered");
    world.resolve({ action: "move", target: "b" }, [0, 0, 0, 0]);
    expect(tags("b")).toContain("remembered");
    expect(tags("b")).not.toContain("targeted");
    expect(tags("c")).not.toContain("present");
    for (const row of runForage({ seed: 10 }).hostInputLog) for (const cue of row.cues) {
      const here = row.before.patches.find((p) => p.id === row.before.position)!;
      const patch = row.before.patches.find((p) => p.id === cue.about)!;
      expect(cue.domain).toBe("space");
      expect(cue.tags.includes("present")).toBe(Math.abs(here.x - patch.x) + Math.abs(here.y - patch.y) <= 1);
      expect(cue.tags.includes("remembered")).toBe(row.before.visited.includes(cue.about));
      expect(cue.tags.includes("targeted")).toBe(row.before.targeted === cue.about);
    }
  });

  it("resolves legal actions and hunger relief solely in the host, rejecting unreachable intentions", () => {
    const world = new ForageWorld({ seed: 1, patches: square });
    expect(world.resolve({ action: "gather", target: "b" }, [2, 2, 2, 2]).success).toBe(false);
    expect(world.resolve({ action: "move", target: "d" }, [2, 2, 2, 2]).success).toBe(false);
    expect(world.resolve({ action: "gather", target: "a" }, [2, 2, 2, 2]).food).toBe(2);
    expect(world.state.hunger).toBeCloseTo(FIXTURE.hunger - 2 * FIXTURE.relief);
    expect(world.state.food).toBe(2);
  });

  it("calculates all four metrics on a hand-built 2 × 2 grid without looking ahead", () => {
    const outcomes: HostOutcome[] = [];
    let position = "a";
    const action = (action: string, target: string, food = 0) => {
      const from = position;
      if (action === "move") position = target;
      outcomes.push({ action, target, food, success: true, from, to: position, visit: action === "move",
        novelVisit: target === "b", result: action === "gather" ? String(food) : "done" });
    };
    action("inspect", "a"); action("gather", "a", 2); action("move", "b"); action("gather", "b", 0);
    action("move", "a"); action("gather", "a", 1); action("move", "c");
    const result = behaviorMetrics(square, "a", outcomes);
    expect(result.inspectBeforeGatherShare).toBeCloseTo(1 / 3);
    expect(result.novelPatchVisitShare).toBeCloseTo(1 / 3);
    expect(result.bestKnownReturnRate).toBeCloseTo(1 / 3);
    expect(result.foodGathered).toBe(3);
    expect(result.counts).toEqual({ gathers: 3, inspectedGathers: 1, visits: 3, novelVisits: 1, returnOpportunities: 3, bestReturns: 1 });
    const empty = behaviorMetrics(square, "a", []);
    expect([empty.inspectBeforeGatherShare, empty.novelPatchVisitShare, empty.bestKnownReturnRate, empty.foodGathered]).toEqual([0, 0, 0, 0]);
  });

  it("records all available processing fields every epoch, with explicit nulls for unavailable engine diagnostics", () => {
    for (const row of runForage({ seed: 7, configuration: { version: "v1", stack: "ESTP" } }).hostInputLog) {
      expect(row.mind).toBe(qualify("cognition", "mind.0001"));
      const trace = row.trace;
      expect(trace.attention.cues).toHaveLength(36 * 5);
      expect(trace.attention.shares).toHaveLength(trace.attention.cues.length);
      expect(trace.attention.shares.reduce((a, b) => a + b, 0)).toBeCloseTo(1);
      expect(trace.interpretation).toHaveLength(trace.attention.cues.length);
      for (const cue of row.cues) {
        const parameters = trace.interpretation.find((entry) => entry.cue === cue.cue)!.parameters;
        // Frozen ESTP has dominant Se; targeted F6 halves the public Weber parameter (categorical limitation is documented).
        expect(parameters.weberFraction).toBe(cue.tags.includes("targeted") ? 0.05 : 0.1);
      }
      expect(trace.candidates).toEqual(trace.selection.inputs.generation.candidates);
      expect(trace.evaluation).toHaveLength(trace.candidates.length);
      expect(trace.selection.intention).toEqual(row.intention);
      expect(trace.learning.intention).toBe(row.intention.id);
      expect(trace.learning.updates).toHaveLength(36);
      expect(trace.beliefDeltas).toEqual(trace.learning.updates);
      expect(trace.observationBeliefDeltas).not.toBeNull();
      expect(trace.observationBeliefDeltas.length).toBeGreaterThan(0);
      expect(new Set(trace.hooks.map((hook) => hook.hook))).toEqual(new Set(["pertinence", "interpret", "generate", "learning"]));
      expect(trace.hooks.every((hook) => hook.formulaIds === null)).toBe(true);
      expect(trace.selection.inputs.generation.checks.some((check) => !check.eligible)).toBe(true);
    }
  });

  it("enumerates the frozen stacks, records active hooks, and shares layout/yield streams across configurations", () => {
    expect(parseArgs([])).toEqual({ seeds: 200, stacks: "all" });
    expect(parseArgs(["--seeds", "8", "--stacks", "null"])).toEqual({ seeds: 8, stacks: "null" });
    for (const args of [["--seeds", "0"], ["--stacks", "bad"], ["--seeds"], ["--unknown", "1"]]) expect(() => parseArgs(args)).toThrow("Usage");
    expect(configurations("null")).toEqual([{ version: "null" }]);
    const configs = configurations("all");
    expect(configs).toHaveLength(17);
    const baseline = runForage({ seed: 3, epochs: 2 });
    for (const configuration of configs.slice(1)) {
      const run = runForage({ seed: 3, epochs: 2, configuration });
      expect(run.final.patches).toEqual(baseline.final.patches);
      const key = `fixture.s1.yield@${qualify("cognition", "mind.0001")}`;
      expect(run.rng[key]).toBe(baseline.rng[key]);
      const sensoryKey = `cognition.perception.detect@${qualify("cognition", "mind.0001")}`;
      expect(run.rng[sensoryKey]).toBe(baseline.rng[sensoryKey]);
      const metrics = summarizeForage(run);
      expect(metrics.trace.hooks.interpret.changedCalls).toBeGreaterThan(0);
      expect(metrics.trace.byFormula).toBeNull();
    }
  }, 30_000);

  it("keeps the objective/subjective fence and imports engine functionality only through its public API", () => {
    const directory = join(import.meta.dirname, "../bench/scenarios/s1-forage");
    for (const file of readdirSync(directory).filter((file) => file.endsWith(".ts"))) {
      const source = readFileSync(join(directory, file), "utf8");
      const imports = [...source.matchAll(/import[\s\S]*?from\s+["']([^"']+)["']/g)];
      for (const match of imports) {
        if (match[1].includes("src/")) expect(match[1]).toBe("../../../src/index.ts");
        if (file !== "perception.ts") expect(match[0]).not.toMatch(/\bStimulus\b/);
      }
      expect(source).not.toMatch(/Math\.random|Date\.now/);
    }
    const world = readFileSync(join(directory, "world.ts"), "utf8");
    expect(world).not.toMatch(/\.(?:beliefs|params|memory|needs|minds)\b/);
    // Even deliberately opaque cognition snapshot data cannot affect host outcome resolution.
    const first = new ForageWorld({ seed: 1, patches: square }), second = new ForageWorld({ seed: 1, patches: square });
    second.agent.restore({ forbidden: true });
    expect(first.resolve({ action: "gather", target: "a" }, [2, 0, 0, 0]))
      .toEqual(second.resolve({ action: "gather", target: "a" }, [2, 0, 0, 0]));
  });
});
