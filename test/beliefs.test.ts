import { describe, expect, it } from "vitest";
import {
  categorical, createBeliefStore, driftBeliefs, driftCategorical, driftGaussian,
  existence, falsePrior, gaussian, getBelief, givenPrior, ignorancePrior,
  klDivergence, reliabilityMean, setBelief, updateCategorical, updateExistence,
  updateFromObservation, updateGaussian, updateReliability, updateTestimony,
} from "../src/beliefs.ts";
import type { CategoricalBelief, Observation } from "../src/types.ts";

const values = ["weak", "strong"];
const detection = { P_H: 0.8, P_FA: 0.2 };
const cue = { cue: "shape", about: "host/person.0001", attribute: "strength", channel: "sight" as const, t: 1000 };

function vector(actual: CategoricalBelief, expected: readonly number[]): void {
  expect(actual.probabilities).toHaveLength(expected.length);
  actual.probabilities.forEach((p, i) => {
    expect(Number.isFinite(p)).toBe(true);
    expect(p).toBeGreaterThanOrEqual(0);
    expect(p).toBeLessThanOrEqual(1);
    expect(p).toBeCloseTo(expected[i], 12);
  });
  expect(actual.probabilities.reduce((sum, p) => sum + p, 0)).toBeCloseTo(1, 12);
}

describe("priors and ordered store (DESIGN §1, §2.3, §7)", () => {
  it("ignorance is uniform, host-declared wide Gaussian, or even existence odds", () => {
    expect(ignorancePrior({ kind: "categorical", values })).toEqual(categorical(values, [0.5, 0.5]));
    expect(ignorancePrior({ kind: "gaussian", mean: 0, variance: 100 })).toEqual(gaussian(0, 100));
    expect(ignorancePrior({ kind: "existence" })).toEqual(existence(0.5));
  });

  it("given and false priors preserve supplied knowledge without a truth input", () => {
    const belief = categorical(values, [0.99, 0.01]);
    expect(givenPrior(belief)).toEqual(belief);
    expect(falsePrior(belief)).toEqual(belief);
    expect(falsePrior(belief)).not.toBe(belief);
  });

  it("keys are entity/attribute pairs and replacements preserve global insertion order and priors", () => {
    let store = createBeliefStore();
    store = setBelief(store, "a/b", "c", categorical(values, [0.99, 0.01]), "false");
    store = setBelief(store, "a", "b/c", gaussian(1, 4));
    store = setBelief(store, "a/b", "exists", existence(0.5), "ignorance");
    const before = store;
    store = setBelief(store, "a/b", "c", categorical(values, [0.4, 0.6]));
    expect(store.entries.map((e) => [e.about, e.attribute])).toEqual([["a/b", "c"], ["a", "b/c"], ["a/b", "exists"]]);
    expect(store.entries[0].origin).toBe("false");
    expect(store.entries[0].prior).toEqual(categorical(values, [0.99, 0.01]));
    expect(getBelief(before, "a/b", "c")).toEqual(categorical(values, [0.99, 0.01]));
    expect(getBelief(store, "a", "b/c")).toEqual(gaussian(1, 4));
    expect(getBelief(store, "missing", "c")).toBeUndefined();
    expect(JSON.parse(JSON.stringify(store))).toEqual(store);
    expect(() => setBelief(store, "a/b", "c", gaussian(1, 2))).toThrow(RangeError);
  });

  it("store copies caller vectors instead of aliasing mutable input", () => {
    const weights = [0.2, 0.8];
    const labels = [...values];
    const store = setBelief(createBeliefStore(), "a", "x", { kind: "categorical", values: labels, probabilities: weights });
    weights[0] = 0.9;
    labels[0] = "changed";
    expect(getBelief(store, "a", "x")).toEqual(categorical(values, [0.2, 0.8]));
  });
});

describe("categorical conservative Bayes (DESIGN §2.3)", () => {
  it("eta=1 equals hand-computed Bayes", () => {
    vector(updateCategorical(categorical(["a", "b", "c"], [0.2, 0.3, 0.5]), [0.5, 0.2, 0.1], 1), [10 / 21, 6 / 21, 5 / 21]);
  });

  it("eta tempers likelihoods rather than interpolating posteriors", () => {
    vector(updateCategorical(categorical(values, [0.5, 0.5]), [0.81, 0.09], 0.5), [0.75, 0.25]);
  });

  it("eta=0 freezes learning and eta approaching zero tends to the prior", () => {
    const prior = categorical(values, [0.4, 0.6]);
    vector(updateCategorical(prior, [0, 1], 0), [0.4, 0.6]);
    vector(updateCategorical(prior, [0.1, 0.9], 1e-14), [0.4, 0.6]);
  });

  it("a confident false prior survives weak evidence and yields to repeated evidence", () => {
    let belief = categorical(values, [0.99, 0.01]);
    belief = updateCategorical(belief, [0.4, 0.6], 1);
    expect(belief.probabilities[0]).toBeGreaterThan(0.98);
    for (let i = 0; i < 30; i++) belief = updateCategorical(belief, [0.4, 0.6], 1);
    expect(belief.probabilities[1]).toBeGreaterThan(0.999);
  });

  it("zero/one probabilities and impossible evidence never create NaN or invent support", () => {
    vector(updateCategorical(categorical(values, [0, 1]), [1, 1], 1), [0, 1]);
    vector(updateCategorical(categorical(values, [0, 1]), [1, 0], 1), [0, 1]);
    vector(updateCategorical(categorical(values, [0.3, 0.7]), [0, 0], 1), [0.3, 0.7]);
    vector(updateCategorical(categorical(values, [0.3, 0.7]), [1, 0], 1), [1, 0]);
  });

  it("log-space updates survive products that would underflow", () => {
    vector(updateCategorical(categorical(values, [1e-300, 1]), [1e-100, 1e-300], 1), [1e-100, 1]);
    vector(categorical(values, [Number.MAX_VALUE, Number.MAX_VALUE]), [0.5, 0.5]);
    let belief = categorical(["a", "b", "c"], [1, 1, 1]);
    for (let i = 0; i < 500; i++) {
      belief = updateCategorical(belief, [0.01, 0.02, 0.03], 0.1);
      vector(belief, belief.probabilities);
    }
  });
});

describe("Gaussian Kalman update (DESIGN §2.3)", () => {
  it("matches the closed form with inertia and never increases variance", () => {
    const result = updateGaussian(gaussian(10, 4), 16, 9, 0.5);
    expect(result.mean).toBeCloseTo(10 + (4 / 22) * 6, 12);
    expect(result.variance).toBeCloseTo((18 / 22) * 4, 12);
    for (const eta of [0, 1e-12, 0.1, 1]) {
      for (const variance of [0, 1e-100, 1, 1e100]) {
        for (const noise of [0, 1e-100, 1, 1e100]) {
          const posterior = updateGaussian(gaussian(3, variance), 8, noise, eta);
          expect(posterior.variance).toBeLessThanOrEqual(variance);
          expect(posterior.variance).toBeGreaterThanOrEqual(0);
          expect(Number.isFinite(posterior.mean)).toBe(true);
        }
      }
    }
  });

  it("eta=0, point priors, and noiseless observations have defined limits", () => {
    expect(updateGaussian(gaussian(3, 4), 9, 0, 0)).toEqual(gaussian(3, 4));
    expect(updateGaussian(gaussian(3, 0), 9, 0, 1)).toEqual(gaussian(3, 0));
    expect(updateGaussian(gaussian(3, 4), 9, 0, 1)).toEqual(gaussian(9, 0));
    expect(updateGaussian(gaussian(3, 4), 9, 1, 1e-15).mean).toBeCloseTo(3, 12);
  });

  it("finite extreme means and variances do not overflow the convex update", () => {
    const result = updateGaussian(gaussian(-1e308, 1e308), 1e308, 1e308, 1);
    expect(result.mean).toBe(0);
    expect(result.variance).toBe(5e307);
    expect(updateGaussian(gaussian(0, 1), 1, 1e-20, 1).variance).toBeGreaterThan(0);
    const tinyInertia = updateGaussian(gaussian(0, 1e300), 1, 1e-100, 1e-300);
    expect(tinyInertia.variance / 1e200).toBeCloseTo(1, 12);
  });
});

describe("perception and existence evidence (DESIGN §2.1–2.3)", () => {
  it("a detected cue raises existence and an attended miss lowers it by the likelihood ratio", () => {
    expect(updateExistence(existence(0.6), true, detection, 1).probability).toBeCloseTo(6 / 7, 12);
    const missed = updateExistence(existence(0.6), false, detection, 1).probability;
    expect(missed).toBeCloseTo(3 / 11, 12);
    expect(missed / (1 - missed)).toBeCloseTo((0.6 / 0.4) * (0.2 / 0.8), 12);
  });

  it("uninformative detection and impossible endpoint evidence preserve the prior", () => {
    expect(updateExistence(existence(0.7), true, { P_H: 0.5, P_FA: 0.5 }, 1).probability).toBeCloseTo(0.7, 12);
    expect(updateExistence(existence(0), true, { P_H: 1, P_FA: 0 }, 1)).toEqual(existence(0));
    expect(updateExistence(existence(1), false, { P_H: 1, P_FA: 0 }, 1)).toEqual(existence(1));
  });

  it("categorical observations use q and uniform misidentification over K-1", () => {
    const observation: Observation = { ...cue, kind: "categorical", value: "b", model: { ...detection, q: 0.8 } };
    const result = updateFromObservation(categorical(["a", "b", "c"], [1, 1, 1]), observation, 1);
    expect(result.kind).toBe("categorical");
    if (result.kind !== "categorical") throw new Error("Expected categorical update");
    vector(result, [0.1, 0.8, 0.1]);
    expect(updateFromObservation(categorical(["b"], [1]), observation, 1)).toEqual(categorical(["b"], [1]));
  });

  it("real observations square sigma and null observations update only existence", () => {
    const real: Observation = { ...cue, kind: "real", value: 16, model: { ...detection, sigma: 3 } };
    expect(updateFromObservation(gaussian(10, 4), real, 0.5)).toEqual(updateGaussian(gaussian(10, 4), 16, 9, 0.5));
    const absent: Observation = { ...cue, kind: "null", model: detection };
    expect(updateFromObservation(gaussian(10, 4), absent, 1)).toEqual(gaussian(10, 4));
    expect(updateFromObservation(existence(0.6), absent, 1)).toEqual(updateExistence(existence(0.6), false, detection, 1));
  });
});

describe("testimony and Beta reliability (DESIGN §2.3, §2.5)", () => {
  it("r=0 changes nothing and r=1 gives the claimed category all supported mass", () => {
    const prior = categorical(values, [0.4, 0.6]);
    vector(updateTestimony(prior, "weak", { alpha: 0, beta: 1 }, 1), [0.4, 0.6]);
    vector(updateTestimony(prior, "weak", { alpha: 1, beta: 0 }, 1), [1, 0]);
    vector(updateTestimony(prior, "weak", { alpha: 1, beta: 0 }, 0), [0.4, 0.6]);
  });

  it("Beta mean gives the stated likelihood vector and exposed lies reduce reliability", () => {
    const reliability = { alpha: 3, beta: 1 };
    expect(reliabilityMean(reliability)).toBe(0.75);
    vector(updateTestimony(categorical(["a", "b", "c"], [1, 1, 1]), "b", reliability, 1), [1 / 12, 5 / 6, 1 / 12]);
    expect(updateReliability(reliability, false)).toEqual({ alpha: 3, beta: 2 });
    expect(reliabilityMean(updateReliability(reliability, false))).toBeCloseTo(0.6, 12);
    expect(updateReliability(reliability, true, 0.5)).toEqual({ alpha: 3.5, beta: 1 });
    expect(reliabilityMean({ alpha: 1e308, beta: 1e308 })).toBe(0.5);
  });
});

describe("belief drift (DESIGN §2.3)", () => {
  it("Gaussian variance grows by q times seconds, with the mean unchanged", () => {
    expect(driftGaussian(gaussian(4, 0), 2, 1500)).toEqual(gaussian(4, 3));
    expect(driftGaussian(gaussian(4, 2), 0, 1500)).toEqual(gaussian(4, 2));
  });

  it("categorical distance to the prior halves at each half-life, aligned by labels", () => {
    const belief = categorical(values, [0.9, 0.1]);
    const prior = categorical([...values].reverse(), [0.7, 0.3]);
    vector(driftCategorical(belief, prior, 2, 0), [0.9, 0.1]);
    vector(driftCategorical(belief, prior, 2, 2000), [0.6, 0.4]);
    vector(driftCategorical(belief, prior, 2, 4000), [0.45, 0.55]);
    vector(driftCategorical(belief, prior, Infinity, 4000), [0.9, 0.1]);
    vector(driftCategorical(belief, prior, 2, 1e100), [0.3, 0.7]);
    const twice = driftCategorical(driftCategorical(belief, prior, 2, 500), prior, 2, 1500);
    vector(twice, [0.6, 0.4]);
  });

  it("store drift retains false initial priors, insertion order and existence beliefs", () => {
    let store = setBelief(createBeliefStore(), "a", "x", categorical(values, [0.9, 0.1]), "false");
    store = setBelief(store, "a", "x", categorical(values, [0.1, 0.9]));
    store = setBelief(store, "b", "x", gaussian(2, 3));
    store = setBelief(store, "a", "exists", existence(0.7));
    const snapshot = JSON.stringify(store);
    const next = driftBeliefs(store, 1000, () => ({ q: 2, halfLifeSeconds: 1 }));
    expect(next.entries.map((e) => [e.about, e.attribute])).toEqual(store.entries.map((e) => [e.about, e.attribute]));
    expect(getBelief(next, "a", "x")).toEqual(categorical(values, [0.5, 0.5]));
    expect(getBelief(next, "b", "x")).toEqual(gaussian(2, 5));
    expect(getBelief(next, "a", "exists")).toEqual(existence(0.7));
    expect(JSON.stringify(store)).toBe(snapshot);
  });
});

describe("KL attribution readout (DESIGN §2.5)", () => {
  it("categorical KL is posterior || prior in nats, independent of category order", () => {
    const posterior = categorical(values, [0.75, 0.25]);
    const prior = categorical([...values].reverse(), [0.5, 0.5]);
    expect(klDivergence(posterior, prior)).toBeCloseTo(0.75 * Math.log(1.5) + 0.25 * Math.log(0.5), 12);
    expect(klDivergence(posterior, posterior)).toBe(0);
    expect(klDivergence(posterior, prior)).not.toBeCloseTo(klDivergence(prior, posterior), 5);
    expect(klDivergence(existence(0.75), existence(0.5))).toBeCloseTo(klDivergence(posterior, prior), 12);
  });

  it("Gaussian KL matches closed form and is zero for equal distributions", () => {
    expect(klDivergence(gaussian(1, 4), gaussian(0, 9))).toBeCloseTo(0.5 * (Math.log(9 / 4) + 5 / 9 - 1), 12);
    expect(klDivergence(gaussian(1, 4), gaussian(1, 4))).toBe(0);
    expect(klDivergence(gaussian(0, 1e-300), gaussian(0, 1e300))).toBeCloseTo(0.5 * (600 * Math.LN10 - 1), 10);
  });

  it("zero probabilities and singular Gaussians produce defined zero or Infinity", () => {
    expect(klDivergence(existence(0), existence(0))).toBe(0);
    expect(klDivergence(existence(1), existence(0))).toBe(Infinity);
    expect(klDivergence(existence(0), existence(0.5))).toBeCloseTo(Math.LN2, 12);
    expect(klDivergence(gaussian(1, 0), gaussian(1, 0))).toBe(0);
    expect(klDivergence(gaussian(2, 0), gaussian(1, 0))).toBe(Infinity);
    expect(klDivergence(gaussian(1, 0), gaussian(1, 2))).toBe(Infinity);
    expect(klDivergence(gaussian(1, 2), gaussian(1, 0))).toBe(Infinity);
  });
});

describe("invalid inputs fail explicitly instead of producing NaN (DESIGN §10)", () => {
  it("rejects malformed distributions, unsupported categories and incompatible belief kinds", () => {
    for (const weights of [[], [0, 0], [-1, 2], [NaN, 1], [Infinity, 1]]) {
      expect(() => categorical(values, weights)).toThrow(RangeError);
    }
    expect(() => categorical(["same", "same"], [1, 1])).toThrow(RangeError);
    expect(() => gaussian(0, -1)).toThrow(RangeError);
    expect(() => gaussian(Infinity, 1)).toThrow(RangeError);
    expect(() => existence(1.1)).toThrow(RangeError);
    expect(() => updateCategorical(categorical(values, [1, 1]), [1], 1)).toThrow(RangeError);
    expect(() => klDivergence(categorical(values, [1, 1]), categorical(["a", "b"], [1, 1]))).toThrow(RangeError);
    expect(() => klDivergence(existence(0.5), gaussian(0, 1))).toThrow(RangeError);
    expect(() => updateTestimony(categorical(values, [1, 1]), "unknown", { alpha: 1, beta: 1 }, 1)).toThrow(RangeError);
  });

  it("rejects invalid inertia, noise, reliability and drift settings", () => {
    for (const eta of [-1, 2, NaN]) expect(() => updateCategorical(categorical(values, [1, 1]), [1, 1], eta)).toThrow(RangeError);
    expect(() => updateGaussian(gaussian(0, 1), 1, -1, 1)).toThrow(RangeError);
    expect(() => updateExistence(existence(0.5), true, { P_H: 2, P_FA: 0 }, 1)).toThrow(RangeError);
    expect(() => reliabilityMean({ alpha: 0, beta: 0 })).toThrow(RangeError);
    expect(() => reliabilityMean({ alpha: -1, beta: 1 })).toThrow(RangeError);
    expect(() => driftGaussian(gaussian(0, 1), -1, 1000)).toThrow(RangeError);
    expect(() => driftGaussian(gaussian(0, 1), 1, -1000)).toThrow(RangeError);
    for (const halfLife of [0, -1, NaN]) expect(() => driftCategorical(categorical(values, [1, 1]), categorical(values, [1, 1]), halfLife, 1000)).toThrow(RangeError);
  });
});
