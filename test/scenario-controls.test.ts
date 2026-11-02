import { describe, expect, it } from "vitest";
import { qualify, streams } from "@rex/kernel";
import { createEightFunctionV1, nullPersonality } from "../src/index.ts";
import type { Domain, MindView, V1Context } from "../src/index.ts";
import { randomTheta, shuffledV1, shuffledV2 } from "../bench/scenarios/controls.ts";
import { calibrate, parseArgs, runRecord } from "../bench/scenarios/s1-forage/run.ts";

const interpret = { eta: 0.5, alpha0: 1, lambda: 1, confidence: 1, weberFraction: 0.1, testimonyFloor: 0 };
const learning = { rate: 1, d: 0.5, beliefHalfLife: Infinity };
const view = {} as MindView; // Frozen V1 reads only its supplied context for these hooks.

describe("T-1 controls (scenarios DESIGN §10.3)", () => {
  it("keeps explicit none byte-identical to the omitted flag for two seeds", () => {
    expect(parseArgs(["--control", "none"]).control).toBe("none");
    expect(() => parseArgs(["--control", "invalid"])).toThrow("Usage");
    for (const seed of [1, 2]) for (const configuration of [{ version: "null" }, { version: "v1", stack: "ESTP" as const }]) {
      expect(JSON.stringify(runRecord(seed, configuration, "off", parseArgs(["--control", "none"]).control)))
        .toBe(JSON.stringify(runRecord(seed, configuration, "off")));
    }
  }, 60_000);

  it("draws every random-theta parameter within the sixteen-stack calibration and replays from each seed", () => {
    for (const seed of [1, 2]) {
      const calibration = calibrate(seed);
      const draw = () => randomTheta(calibration, streams(seed).get("bench.control.theta", qualify("cognition", "mind.0001")));
      const theta = draw();
      expect(theta).toEqual(draw());
      const inside = (value: number, values: number[]) => {
        expect(value).toBeGreaterThanOrEqual(values.reduce((a, b) => Math.min(a, b)));
        expect(value).toBeLessThanOrEqual(values.reduce((a, b) => Math.max(a, b)));
      };
      for (const key of ["eta", "alpha0", "lambda", "confidence"] as const) inside(theta[key], calibration.interpret.map((p) => p[key]));
      inside(theta.kappa, calibration.generate.map((p) => p.kappa));
      inside(theta.rate, calibration.learning.map((p) => p.rate));
      for (const [cue, multiplier] of Object.entries(theta.pertinence)) inside(multiplier, calibration.pertinence.map((p) => p[cue]));
      const run = runRecord(seed, { version: "v1", stack: "ESTP" }, "summary", "random-theta", calibration);
      expect(run.configuration.id).toBe("v1/ESTP+random-theta");
      expect(run.controlTheta).toEqual(theta);
      expect(run.replayed).toBe(true);
      expect(run.ledger!.summary).toEqual([]);
      for (const row of run.hostInputLog) for (const call of row.trace.hooks) {
        if (call.hook === "interpret") expect(call.after).toMatchObject({ eta: theta.eta, alpha0: theta.alpha0, lambda: theta.lambda, confidence: theta.confidence });
        if (call.hook === "generate") expect(call.after).toMatchObject({ params: { kappa: theta.kappa } });
        if (call.hook === "learning") expect(call.after).toMatchObject({ rate: theta.rate });
      }
    }
  }, 120_000);

  it("makes an identity shuffle equal plain V1 at every hook", () => {
    const context: V1Context = { cues: { physical: { domain: "space", physical: true, present: true } } };
    const v1 = createEightFunctionV1("ESTP", { etaMin: 0.01, context: () => context });
    const shuffled = shuffledV1(v1, () => 0.999);
    const base = { physical: 0.7, meta: 0.3 };
    expect(shuffled.pertinence(base, view)).toEqual(v1.pertinence(base, view));
    for (const domain of ["space", "adaptation", "meta", "cohesion", "none"] as const) {
      expect(shuffled.interpret(interpret, domain, view)).toEqual(v1.interpret(interpret, domain, view));
      expect(shuffled.learning(learning, domain, view)).toEqual(v1.learning(learning, domain, view));
    }
    expect(shuffled.generate([], { kappa: 1 }, view)).toEqual(v1.generate([], { kappa: 1 }, view));
  });

  it("routes non-identity domains and cue categories consistently without editing V1", () => {
    const received: Domain[] = [];
    const spy = { ...nullPersonality, interpret: (base: typeof interpret, domain: Domain) => { received.push(domain); return base; } };
    shuffledV1(spy, () => 0).interpret(interpret, "space", view);
    expect(received).toEqual(["adaptation"]);
    let context: V1Context = { cues: { a: { domain: "space" }, b: { domain: "meta" } } };
    const original = context;
    const v1 = createEightFunctionV1("ESTP", { etaMin: 0.01, context: () => context });
    const shuffled = shuffledV1(v1, () => 0, { get: () => context, set: (next) => { context = next; } });
    const actual = shuffled.pertinence({ a: 1, b: 1 }, view);
    const expected = createEightFunctionV1("ESTP", { etaMin: 0.01, context: () => ({ cues: {
      a: { domain: "adaptation" }, b: { domain: "cohesion" },
    } }) }).pertinence({ a: 1, b: 1 }, view);
    expect(actual).toEqual(expected);
    expect(context).toBe(original);
    expect(actual).not.toEqual(v1.pertinence({ a: 1, b: 1 }, view));
    for (const seed of [1, 2]) {
      const run = runRecord(seed, { version: "v1", stack: "ESTP" }, "summary", "shuffled");
      expect(run.configuration.id).toBe("v1/ESTP+shuffled");
      expect(run.replayed).toBe(true);
    }
    expect(() => shuffledV2(nullPersonality, () => 0)).toThrow("Personality V2 not built");
  }, 60_000);
});
