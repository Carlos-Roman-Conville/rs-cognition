import { describe, expect, it } from "vitest";
import { simTime, streams } from "@rex/kernel";
import { categorical } from "../src/beliefs.ts";
import {
  baseLevelActivation, contextMatches, encodeEpisode, outcomeExpectations, retrievalProbability, retrieveEpisode,
} from "../src/index.ts";
import type { EpisodeInput, ExpectationParams } from "../src/memory.ts";
import type { Episode } from "../src/types.ts";

// Proposed verification fixtures; independent empirical retention validation belongs to unit 2671 (V1).
const params: ExpectationParams = { d: 0.5, tau: 0, s: 0.4, alpha0: 1 };
const input: EpisodeInput = {
  t: simTime(0), context: { place: "market", witnesses: 2, visible: true },
  action: "ask", outcome: "accepted", reward: 2, predictionError: 1,
  attributedCause: "generosity", domain: "people",
};
const makeEpisode = (overrides: Partial<EpisodeInput> = {}): Episode => encodeEpisode({ ...input, ...overrides }, {}).episode;
const theory = categorical(["accepted", "refused"], [0.25, 0.75]);
const predict = (episodes: readonly Episode[], t = 1000, alpha0 = 1) =>
  outcomeExpectations(episodes, input.action, input.context, theory, simTime(t), { ...params, alpha0 });
const mechanism = "cognition.memory.retrieve";
const mind = "cognition/mind.0001";

describe("episode encoding (DESIGN §2.3, §4)", () => {
  it("mints ep ids sequentially with kernel counters and copies subjective experience", () => {
    const counters = { mind: 3, ep: 8 };
    const context = { ...input.context };
    const first = encodeEpisode({ ...input, context }, counters);
    const second = encodeEpisode(input, first.counters);
    expect(first.episode).toEqual({ ...input, id: "ep.0009", retrievals: [] });
    expect(second.episode.id).toBe("ep.0010");
    expect(counters).toEqual({ mind: 3, ep: 8 });
    expect(second.counters).toEqual({ mind: 3, ep: 10 });
    context.place = "changed";
    expect(first.episode.context.place).toBe("market");
    expect(JSON.parse(JSON.stringify(first.episode))).toEqual(first.episode);
  });

  it("rejects invalid timestamps, context values, rewards and prediction errors", () => {
    for (const t of [-1, 0.1, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
      expect(() => makeEpisode({ t })).toThrow();
    }
    expect(() => makeEpisode({ reward: Infinity })).toThrow(RangeError);
    expect(() => makeEpisode({ predictionError: NaN })).toThrow(RangeError);
    expect(() => makeEpisode({ context: { x: NaN } })).toThrow(RangeError);
    expect(makeEpisode({ reward: -3, predictionError: -4 }).reward).toBe(-3);
  });
});

describe("ACT-R activation (DESIGN §2.3; Anderson & Lebiere 1998)", () => {
  it("one presentation gives -d ln delta in seconds and is finite after 1 ms", () => {
    const episode = makeEpisode({ t: 5000 });
    for (const delta of [1, 10, 1000, 4000, 100_000]) {
      expect(baseLevelActivation(episode, 5000 + delta)).toBeCloseTo(-0.5 * Math.log(delta / 1000), 12);
      expect(Number.isFinite(baseLevelActivation(episode, 5000 + delta))).toBe(true);
    }
  });

  it("activation and retrieval probability fall monotonically with elapsed time", () => {
    const episode = makeEpisode();
    const delays = [1, 10, 100, 1000, 10_000, 100_000];
    for (let i = 1; i < delays.length; i++) {
      expect(baseLevelActivation(episode, delays[i])).toBeLessThan(baseLevelActivation(episode, delays[i - 1]));
      expect(retrievalProbability(episode, delays[i])).toBeLessThan(retrievalProbability(episode, delays[i - 1]));
    }
  });

  it("sums encoding and each retrieval, including multiple presentations at the same time", () => {
    const original = makeEpisode();
    const once = { ...original, retrievals: [1000] };
    const twice = { ...original, retrievals: [1000, 1000] };
    expect(baseLevelActivation(twice, 5000)).toBeCloseTo(Math.log(5 ** -0.5 + 2 * 4 ** -0.5), 12);
    expect(baseLevelActivation(once, 5000)).toBeGreaterThan(baseLevelActivation(original, 5000));
    expect(baseLevelActivation(twice, 5000)).toBeGreaterThan(baseLevelActivation(once, 5000));
  });

  it("uses the zero-delay limit and returns finite activation one millisecond after retrieval", () => {
    const episode = makeEpisode();
    expect(baseLevelActivation(episode, 0)).toBe(Infinity);
    expect(retrievalProbability(episode, 0)).toBe(1);
    const result = retrieveEpisode(episode, 0, () => 0.99);
    expect(result.episode.retrievals).toEqual([0]);
    expect(baseLevelActivation(result.episode, 1)).toBeCloseTo(Math.log(2 * 0.001 ** -0.5), 12);
  });

  it("log-sum-exp avoids power underflow and overflow at finite positive delays", () => {
    const episode = { ...makeEpisode(), retrievals: [0] };
    expect(baseLevelActivation(episode, 1, 1000)).toBeCloseTo(Math.LN2 - 1000 * Math.log(0.001), 10);
    expect(baseLevelActivation(episode, 1_000_000, 1000)).toBeCloseTo(Math.LN2 - 1000 * Math.log(1000), 10);
  });

  it("rejects nonpositive decay, time travel and malformed presentation histories", () => {
    for (const d of [0, -1, NaN, Infinity]) expect(() => baseLevelActivation(makeEpisode(), 1000, d)).toThrow();
    expect(() => baseLevelActivation(makeEpisode({ t: 1000 }), 999)).toThrow();
    for (const retrievals of [[-1], [0.5], [2000], [500, 400]]) {
      expect(() => baseLevelActivation({ ...makeEpisode(), retrievals }, 1000)).toThrow();
    }
    // A zero-age presentation must not hide invalid later history.
    expect(() => baseLevelActivation({ ...makeEpisode(), retrievals: [1] }, 0)).toThrow();
  });
});

describe("logistic retrieval and replay (DESIGN §2.3, §7)", () => {
  it("P is 0.5 when B=tau, follows the stated logistic and handles saturated tails", () => {
    const episode = makeEpisode();
    const activation = baseLevelActivation(episode, 4000);
    expect(retrievalProbability(episode, 4000, { ...params, tau: activation })).toBe(0.5);
    expect(retrievalProbability(episode, 4000, params)).toBeCloseTo(1 / (1 + Math.exp(-activation / params.s)), 14);
    expect(retrievalProbability(episode, 1000, { ...params, tau: -1e300 })).toBe(1);
    expect(retrievalProbability(episode, 1000, { ...params, tau: 1e300 })).toBe(0);
    const extreme = { d: 1e308, tau: -1.5e308, s: 1e308 };
    expect(retrievalProbability(episode, 500, extreme)).toBeCloseTo(1 / (1 + Math.exp(-(Math.LN2 + 1.5))), 14);
  });

  it("success adds exactly one presentation immutably; failure leaves history unchanged", () => {
    const episode = makeEpisode();
    const before = JSON.stringify(episode);
    let draws = 0;
    const result = retrieveEpisode(episode, 1000, () => { draws++; return 0.49; }, params);
    expect(result).toEqual({ episode: { ...episode, retrievals: [1000] }, retrieved: true, probability: 0.5 });
    expect(draws).toBe(1);
    expect(JSON.stringify(episode)).toBe(before);
    const failure = retrieveEpisode(episode, 1000, () => 0.5, params);
    expect(failure.retrieved).toBe(false);
    expect(failure.episode).toBe(episode);
    expect(retrievalProbability(result.episode, 2000)).toBeGreaterThan(retrievalProbability(episode, 2000));
  });

  it("seeded retrieval follows P within three standard errors without reinforcing independent trials", () => {
    const stream = streams(12345).get(mechanism, mind);
    const episode = makeEpisode();
    const probability = retrievalProbability(episode, 4000, params);
    const n = 20_000;
    let successes = 0;
    for (let i = 0; i < n; i++) if (retrieveEpisode(episode, 4000, stream, params).retrieved) successes++;
    expect(Math.abs(successes / n - probability)).toBeLessThan(3 * Math.sqrt(probability * (1 - probability) / n));
  });

  it("kernel stream snapshots replay evolving history and other minds/mechanisms do not perturb it", () => {
    const random = streams(789);
    const snapshot = random.state();
    function run(interleave: boolean) {
      let episode = makeEpisode();
      const trace = [];
      for (let t = 1000; t <= 20_000; t += 1000) {
        if (interleave) {
          random.get(mechanism, "cognition/mind.0002")();
          random.get("cognition.decision.select", mind)();
        }
        const result = retrieveEpisode(episode, t, random.get(mechanism, mind), params);
        episode = result.episode;
        trace.push(result);
      }
      return JSON.stringify(trace);
    }
    const first = run(false);
    random.restore(snapshot);
    expect(run(true)).toBe(first);
  });

  it("rejects invalid noise, thresholds and stream draws", () => {
    for (const s of [0, -1, NaN, Infinity]) expect(() => retrievalProbability(makeEpisode(), 1000, { ...params, s })).toThrow();
    expect(() => retrievalProbability(makeEpisode(), 1000, { ...params, tau: NaN })).toThrow();
    for (const draw of [-0.1, 1, Infinity, NaN]) expect(() => retrieveEpisode(makeEpisode(), 1000, () => draw)).toThrow();
  });
});

describe("outcome expectations (DESIGN §2.3, §2.5)", () => {
  it("counts equal theory pseudo-counts plus retrieval-weighted matching outcomes", () => {
    const episodes = [makeEpisode(), makeEpisode({ outcome: "refused" }), makeEpisode()];
    const result = predict(episodes, 1000, 2);
    expect(result.counts).toEqual([1.5, 2]);
    expect(result.distribution.values).toEqual(theory.values);
    expect(result.distribution.probabilities[0]).toBeCloseTo(3 / 7, 14);
    expect(result.distribution.probabilities[1]).toBeCloseTo(4 / 7, 14);
    expect(result.counts.every((count) => count >= 0)).toBe(true);
  });

  it("zero theory strength and no episodes gives uniform finite probabilities and zero counts", () => {
    expect(predict([], 1000, 0)).toEqual({ counts: [0, 0], distribution: categorical(theory.values, [1, 1]) });
    expect(predict([], 1000, 2).distribution).toEqual(theory);
    const forgotten = outcomeExpectations([makeEpisode()], input.action, input.context, theory, 1000, { ...params, alpha0: 0, tau: 1e300 });
    expect(forgotten.distribution.probabilities).toEqual([0.5, 0.5]);
  });

  it("as alpha0 grows prediction tends to theory while zero strength follows experience", () => {
    const episodes = [makeEpisode()];
    expect(predict(episodes, 1000, 0).distribution.probabilities).toEqual([1, 0]);
    let previous = Infinity;
    for (const alpha0 of [1, 10, 100, 1e12]) {
      const distance = Math.abs(predict(episodes, 1000, alpha0).distribution.probabilities[0] - 0.25);
      expect(distance).toBeLessThan(previous);
      previous = distance;
    }
    expect(previous).toBeLessThan(1e-12);
  });

  it("encoding an observed outcome changes prediction only for its action and exact context", () => {
    const before = predict([]).distribution.probabilities[0];
    const encoded = encodeEpisode(input, {}).episode;
    expect(predict([encoded]).distribution.probabilities[0]).toBeGreaterThan(before);
    const ignored = [
      makeEpisode({ action: "wait" }), makeEpisode({ context: { ...input.context, place: "home" } }),
      makeEpisode({ context: { ...input.context, extra: true } }), makeEpisode({ context: { place: "market" } }),
    ];
    expect(predict(ignored).distribution).toEqual(theory);
    expect(contextMatches(input.context, { visible: true, witnesses: 2, place: "market" })).toBe(true);
    expect(contextMatches({ x: 2 }, { x: "2" })).toBe(false);
    expect(contextMatches({ x: false }, { x: 0 })).toBe(false);
    expect(contextMatches({}, {})).toBe(true);
    expect(contextMatches({ toString: "x" }, { different: "x" })).toBe(false);
  });

  it("forgotten episodes contribute less and prediction reads do not rehearse memory", () => {
    const episode = makeEpisode();
    const before = JSON.stringify(episode);
    const recent = predict([episode], 1000);
    const old = predict([episode], 100_000);
    expect(old.counts[0]).toBeLessThan(recent.counts[0]);
    expect(old.distribution.probabilities[0]).toBeLessThan(recent.distribution.probabilities[0]);
    expect(predict([episode], 1000)).toEqual(recent);
    expect(JSON.stringify(episode)).toBe(before);
  });

  it("retains declared outcome order and supports large prior strength without normalization overflow", () => {
    const reversed = categorical(["refused", "accepted"], [0.75, 0.25]);
    const result = outcomeExpectations([makeEpisode()], input.action, input.context, reversed, 1000, params);
    expect(result.distribution.values).toEqual(["refused", "accepted"]);
    expect(result.counts).toEqual([0.75, 0.75]);
    const large = predict([], 1000, Number.MAX_VALUE).distribution.probabilities;
    expect(large[0]).toBeCloseTo(0.25, 14);
    expect(large[1]).toBeCloseTo(0.75, 14);
  });

  it("rejects negative prior strength, malformed theory and matching outcomes outside its support", () => {
    for (const alpha0 of [-1, NaN, Infinity]) expect(() => predict([], 1000, alpha0)).toThrow(RangeError);
    expect(() => predict([makeEpisode({ outcome: "unknown" })])).toThrow(RangeError);
    const malformed = { ...theory, probabilities: [-1, 2] };
    expect(() => outcomeExpectations([], input.action, input.context, malformed, 1000, params)).toThrow(RangeError);
    expect(() => outcomeExpectations([], input.action, input.context, { ...theory, values: [], probabilities: [] }, 1000, params)).toThrow(RangeError);
  });
});
