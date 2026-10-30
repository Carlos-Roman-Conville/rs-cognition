import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { simTime, streams } from "@rex/kernel";
import { allocateAttention } from "../src/attention.ts";
import { categorical, existence, gaussian, updateFromObservation } from "../src/beliefs.ts";
import { attentionCues, detectionModel, identificationProbability, normalCdf, perceive } from "../src/perception.ts";
import type { PerceptionParams } from "../src/perception.ts";
import { DEFAULT_COGNITIVE_PARAMS } from "../src/types.ts";
import type { Channel, Stimulus } from "../src/types.ts";

const mechanism = "cognition.perception.detect";
const t = simTime(1000);
// Proposed verification fixtures, not empirically calibrated channel defaults.
const params: PerceptionParams = { k: 0, weberFractions: { sight: 0.1, sound: 0.2, touch: 0.15, report: 0.3 } };
const cue: Stimulus = {
  cue: "cognition/cue.0001", about: "fixture/object.0001", attribute: "colour", channel: "sight",
  present: true, detectability: 2, relevance: { food: 1 }, domain: "space",
  kind: "categorical", value: "red", values: ["red", "blue", "green"],
};
const real: Stimulus = { ...cue, kind: "real", value: 10 };
const seeded = (seed: number) => streams(seed).get(mechanism, "cognition/mind.0001");
const n = 100_000;

function withinThreeSE(count: number, draws: number, probability: number): void {
  const error = Math.abs(count / draws - probability);
  expect(error).toBeLessThanOrEqual(3 * Math.sqrt(probability * (1 - probability) / draws));
}

describe("equal-variance SDT (DESIGN §2.1, V3; verification, not independent validation)", () => {
  it("Phi matches independent standard-normal reference values and symmetric tails", () => {
    const table = [[0, 0.5], [0.5, 0.6914624612740131], [1, 0.8413447460685429],
      [2, 0.9772498680518208], [3, 0.9986501019683699], [5, 0.9999997133484281]];
    for (const [z, expected] of table) {
      expect(normalCdf(z)).toBeCloseTo(expected, 14);
      expect(normalCdf(-z)).toBeCloseTo(1 - expected, 14);
    }
    expect(normalCdf(Infinity)).toBe(1);
    expect(normalCdf(-Infinity)).toBe(0);
    expect(() => normalCdf(NaN)).toThrow(RangeError);
  });

  it("uses d_eff = d*sqrt(a), with no additional sensory-capacity multiplier (DUP-37)", () => {
    expect(detectionModel(4, 0.25, 0)).toEqual(detectionModel(2, 1, 0));
    expect(detectionModel(2, 1, 0).P_H).toBeCloseTo(0.8413447460685429, 14);
    expect(detectionModel(2, 1, 0).P_FA).toBeCloseTo(0.15865525393145707, 14);
  });

  it("d'=0 gives exactly equal hit and false alarm probabilities for every criterion", () => {
    for (const k of [-100, -2, 0, 0.7, 2, 100]) {
      const model = detectionModel(0, 1, k);
      expect(model.P_H).toBe(model.P_FA);
      expect(model.P_H).toBe(normalCdf(-k));
    }
  });

  it.each([
    // Independent Phi table: k=-1,0,1 on the d'=2 equal-variance ROC.
    [-1, 0.9772498680518208, 0.5],
    [0, 0.8413447460685429, 0.15865525393145707],
    [1, 0.5, 0.022750131948179195],
  ])("100,000 seeded present/absent draws follow the SDT ROC within 3 SE at k=%s", (k, hit, fa) => {
    const detectedStream = seeded(12345);
    const absentStream = seeded(67890);
    let hits = 0;
    let alarms = 0;
    for (let i = 0; i < n; i++) {
      if (perceive([cue], [1], { ...params, k }, t, detectedStream)[0].kind !== "null") hits++;
      if (perceive([{ ...cue, present: false }], [1], { ...params, k }, t, absentStream)[0].kind !== "null") alarms++;
    }
    withinThreeSE(hits, n, hit);
    withinThreeSE(alarms, n, fa);
  });

  it("100,000 seeded d'=0 draws have equal hit and FA rates within 3 SE", () => {
    const stream = seeded(23456);
    let hits = 0;
    let alarms = 0;
    for (let i = 0; i < n; i++) {
      if (perceive([{ ...cue, detectability: 0 }], [1], params, t, stream)[0].kind !== "null") hits++;
      if (perceive([{ ...cue, detectability: 0, present: false }], [1], params, t, stream)[0].kind !== "null") alarms++;
    }
    withinThreeSE(hits, n, 0.5);
    withinThreeSE(alarms, n, 0.5);
  });
});

describe("categorical identification and Weber reports (DESIGN §2.1)", () => {
  it("identification interpolates chance to perfect and handles K=1", () => {
    expect(identificationProbability(0, 3)).toBe(1 / 3);
    expect(identificationProbability(2, 3)).toBeCloseTo(0.8951338619664765, 14);
    expect(identificationProbability(100, 3)).toBe(1);
    expect(identificationProbability(0, 1)).toBe(1);
    const single = { ...cue, value: "red", values: ["red"] };
    expect(perceive([single], [1], { ...params, k: -100 }, t, () => 0.999)[0]).toMatchObject({ value: "red", model: { q: 1 } });
  });

  it.each([0, 2, 100])("100,000 reports have the correct identification rate and uniform errors at d'=%s", (d) => {
    const stream = seeded(34567);
    const counts = { red: 0, blue: 0, green: 0 };
    const q = identificationProbability(d, 3);
    for (let i = 0; i < n; i++) {
      const observation = perceive([{ ...cue, detectability: d }], [1], { ...params, k: -100 }, t, stream)[0];
      if (observation.kind !== "categorical") throw new Error("Expected guaranteed detection");
      counts[observation.value as keyof typeof counts]++;
    }
    withinThreeSE(counts.red, n, q);
    withinThreeSE(counts.blue, n, (1 - q) / 2);
    withinThreeSE(counts.green, n, (1 - q) / 2);
  });

  it.each<[Channel, number, number]>([["sight", 10, 1], ["sound", -10, 0.25], ["touch", 5, 0.5], ["report", 2, 1]])(
    "100,000 Weber draws have mean v and SD w|v|/sqrt(a) within 3 SE: %s", (channel, value, attention) => {
      const stream = seeded(45678);
      const sigma = params.weberFractions[channel] * Math.abs(value) / Math.sqrt(attention);
      let sum = 0;
      let squares = 0;
      for (let i = 0; i < n; i++) {
        const observation = perceive([{ ...real, channel, value }], [attention], { ...params, k: -100 }, t, stream)[0];
        if (observation.kind !== "real") throw new Error("Expected guaranteed detection");
        const error = observation.value - value;
        sum += error;
        squares += error * error;
        if (i === 0) expect(observation.model.sigma).toBe(sigma);
      }
      expect(Math.abs(sum / n)).toBeLessThan(3 * sigma / Math.sqrt(n));
      const sd = Math.sqrt((squares - sum * sum / n) / (n - 1));
      expect(Math.abs(sd - sigma)).toBeLessThan(3 * sigma / Math.sqrt(2 * (n - 1)));
    },
  );

  it("zero value or Weber fraction gives noiseless finite reports; uniform endpoints avoid log(0)", () => {
    for (const value of [0, 10]) {
      const p = value === 0 ? params : { ...params, weberFractions: { ...params.weberFractions, sight: 0 } };
      expect(perceive([{ ...real, value }], [1], p, t, () => 0)[0]).toMatchObject({ value, model: { sigma: 0 } });
    }
    expect(perceive([real], [1], params, t, () => 0)[0]).toMatchObject({ value: 10 });
  });
});

describe("sensory boundary, determinism and integration (DESIGN §1, §2.1–2.3, §7)", () => {
  it("only perception.ts and types.ts under src mention the objective input type", () => {
    function files(dir: string): string[] {
      return readdirSync(dir).flatMap((name) => {
        const path = join(dir, name);
        return statSync(path).isDirectory() ? files(path) : [path];
      });
    }
    const root = join(import.meta.dirname, "..", "src");
    const allowed = [join(root, "perception.ts"), join(root, "types.ts")];
    expect(files(root).filter((file) => !allowed.includes(file) && /Stimulus/.test(readFileSync(file, "utf8")))).toEqual([]);
  });

  it("projects only metadata to attention and feeds attention shares into perception", () => {
    const inputs = [cue, { ...cue, cue: "irrelevant", relevance: {} }];
    const projected = attentionCues(inputs);
    expect(projected[0]).toEqual({ cue: cue.cue, salience: 2, relevance: { food: 1 } });
    const allocation = allocateAttention(projected, [{ id: "food", base: 1, relevance: {} }], {
      beliefs: { entries: [] }, needs: { needs: [], goals: [] }, params: DEFAULT_COGNITIVE_PARAMS,
    });
    expect(allocation.shares).toEqual([1, 0]);
    expect(perceive(inputs, allocation.shares, params, t, () => 0)).toHaveLength(1);
  });

  it("a=0 emits no evidence or draws; attended misses and correct rejections emit explicit nulls", () => {
    expect(perceive([real], [0], params, t, () => { throw new Error("No draw permitted"); })).toEqual([]);
    const inputs = [cue, { ...cue, cue: "absent", present: false }];
    const observations = perceive(inputs, [0.5, 0.5], params, t, () => 0.999999);
    expect(observations.map((observation) => observation.kind)).toEqual(["null", "null"]);
    expect(observations.map((observation) => observation.cue)).toEqual([cue.cue, "absent"]);
    expect(observations.every((observation) => !("value" in observation))).toBe(true);
    expect(JSON.stringify(observations)).not.toContain("NaN");
  });

  it("false alarms use only declared locations and categorical reports ignore absent placeholder truth", () => {
    const absent = { ...cue, present: false, value: "not an actual object" };
    expect(perceive([absent], [1], params, t, () => 0)[0]).toMatchObject({ cue: cue.cue, value: "red" });
    expect(perceive([], [], params, t, () => { throw new Error("No undeclared locations"); })).toEqual([]);
    const phantom = perceive([{ ...real, present: false, value: 12 }], [1], params, t, () => 0)[0];
    expect(phantom).toMatchObject({ kind: "real", value: 12 });
    if (phantom.kind !== "real") throw new Error("Expected real false alarm");
    expect(phantom.model.sigma).toBeCloseTo(1.2, 14);
  });

  it("observations whitelist reported data and their reliability, never objective fields", () => {
    const observation = perceive([cue], [1], params, t, () => 0)[0];
    expect(Object.keys(observation).sort()).toEqual(["about", "attribute", "channel", "cue", "kind", "model", "t", "value"]);
    expect(observation).toMatchObject({ model: { ...detectionModel(2, 1, 0), q: identificationProbability(2, 3) } });
  });

  it("restoring the supplied kernel stream replays reports and leaves other mechanisms/minds untouched", () => {
    const bank = streams(56789);
    const stream = bank.get(mechanism, "cognition/mind.0001");
    bank.get("cognition.memory.retrieve", "cognition/mind.0001")();
    bank.get(mechanism, "cognition/mind.0002")();
    const before = bank.state();
    const run = () => Array.from({ length: 20 }, () => perceive([cue, real], [0.5, 0.5], params, t, stream));
    const first = run();
    const after = bank.state();
    for (const key of Object.keys(before)) {
      if (key !== `${mechanism}@cognition/mind.0001`) expect(after[key]).toBe(before[key]);
    }
    bank.restore(before);
    expect(run()).toEqual(first);
    expect(bank.state()).toEqual(after);
  });

  it("generated detection, identification, real and null evidence update beliefs through beliefs.ts", () => {
    const detected = perceive([cue], [1], params, t, () => 0)[0];
    const posterior = updateFromObservation(categorical(["red", "blue", "green"], [1, 1, 1]), detected, 1);
    if (posterior.kind !== "categorical") throw new Error("Expected categorical belief");
    const q = identificationProbability(2, 3);
    [q, (1 - q) / 2, (1 - q) / 2].forEach((expected, i) => {
      expect(posterior.probabilities[i]).toBeCloseTo(expected, 14);
    });
    const exists = updateFromObservation(existence(0.5), detected, 1);
    if (exists.kind !== "existence") throw new Error("Expected existence belief");
    expect(exists.probability).toBeCloseTo(detectionModel(2, 1, 0).P_H, 14);
    const missed = perceive([cue], [1], params, t, () => 0.999)[0];
    const absent = updateFromObservation(existence(0.5), missed, 1);
    if (absent.kind !== "existence") throw new Error("Expected existence belief");
    expect(absent.probability).toBeCloseTo(detectionModel(2, 1, 0).P_FA, 14);
    const measured = perceive([real], [1], params, t, () => 0)[0];
    expect(updateFromObservation(gaussian(0, 1), measured, 1)).toEqual(gaussian(5, 0.5));
  });

  it("rejects malformed numeric inputs, supports and streams instead of emitting NaN", () => {
    for (const attention of [-1, NaN, Infinity, 1.01]) {
      expect(() => perceive([cue], [attention], params, t, () => 0)).toThrow(RangeError);
    }
    for (const detectability of [-1, Infinity, NaN]) {
      expect(() => perceive([{ ...cue, detectability }], [1], params, t, () => 0)).toThrow(RangeError);
    }
    expect(() => perceive([cue], [], params, t, () => 0)).toThrow(RangeError);
    expect(() => perceive([cue, cue], [1, 1], params, t, () => 0)).toThrow(RangeError);
    expect(() => perceive([cue], [1], { ...params, k: Infinity }, t, () => 0)).toThrow(RangeError);
    for (const value of [NaN, -1, 1]) expect(() => perceive([cue], [1], params, t, () => value)).toThrow(RangeError);
    expect(() => perceive([{ ...cue, values: [] }], [1], params, t, () => 0)).toThrow(RangeError);
    expect(() => perceive([{ ...cue, values: ["blue"] }], [1], params, t, () => 0)).toThrow(RangeError);
    expect(() => perceive([{ ...real, value: Infinity }], [1], params, t, () => 0)).toThrow(RangeError);
    expect(() => perceive([real], [1], { ...params, weberFractions: { ...params.weberFractions, sight: -1 } }, t, () => 0)).toThrow(RangeError);
  });
});
