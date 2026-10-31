import { simTime } from "@rex/kernel";
import { encodeEpisode, retrievalProbability } from "../src/memory.ts";

export interface RetentionPoint { seconds: number; retention: number }

// DESIGN §10 V1: fixed, proposed sampling schedule, one minute through 365 days.
export const DELAYS_SECONDS = [60, 120, 300, 600, 1200, 3600, 10800, 21600, 43200,
  86400, 172800, 604800, 1209600, 2592000, 7776000, 15552000, 31536000] as const;

export function retentionCurve(): RetentionPoint[] {
  const { episode } = encodeEpisode({ t: simTime(0), context: {}, action: "encode", outcome: "item",
    reward: 0, predictionError: 0, attributedCause: "chance", domain: "none" }, {});
  // Separate untested single episodes at each delay: no intervening retrieval/rehearsal.
  // This is expected retention (the Bernoulli success probability), not noisy sampled counts.
  return DELAYS_SECONDS.map((seconds) => ({ seconds,
    retention: retrievalProbability(episode, simTime(seconds * 1000)) }));
}

/** Raw-scale least squares, Rubin & Wenzel (1996), p.736: minimize Σ(y - A t^-b)^2. */
export function fitPower(points: readonly RetentionPoint[]) {
  if (points.length < 3 || points.some(({ seconds, retention }) =>
    !Number.isFinite(seconds) || seconds <= 0 || !Number.isFinite(retention) || retention <= 0)) {
    throw new RangeError("Power fit needs at least three positive finite observations");
  }
  const scale = Math.min(...points.map((p) => p.seconds));
  const at = (exponent: number) => {
    const weights = points.map((p) => (p.seconds / scale) ** -exponent);
    const scaledAmplitude = weights.reduce((sum, w, i) => sum + w * points[i].retention, 0) /
      weights.reduce((sum, w) => sum + w * w, 0);
    const sse = points.reduce((sum, p, i) => sum + (p.retention - scaledAmplitude * weights[i]) ** 2, 0);
    return { sse, amplitude: scaledAmplitude * scale ** exponent };
  };
  // Numerical search bounds only, NOT an empirical acceptance range. Reject boundary optima.
  const step = 0.01;
  let best = 0;
  for (let i = 1; i <= 1000; i++) if (at(i * step).sse < at(best * step).sse) best = i;
  if (best === 0 || best === 1000) throw new RangeError("Power-fit optimum is outside search interior");
  let lo = (best - 1) * step, hi = (best + 1) * step;
  const ratio = (Math.sqrt(5) - 1) / 2;
  for (let i = 0; i < 90; i++) {
    const left = hi - ratio * (hi - lo), right = lo + ratio * (hi - lo);
    if (at(left).sse < at(right).sse) hi = right; else lo = left;
  }
  const exponent = (lo + hi) / 2, fit = at(exponent);
  const mean = points.reduce((sum, p) => sum + p.retention, 0) / points.length;
  const total = points.reduce((sum, p) => sum + (p.retention - mean) ** 2, 0);
  return { exponent, ...fit, rSquared: 1 - fit.sse / total };
}

/** Sensitivity diagnostic only; R&W p.736 explicitly distinguish transformed from raw fitting. */
export function fitLogPower(points: readonly RetentionPoint[]) {
  const xs = points.map((p) => Math.log(p.seconds)), ys = points.map((p) => Math.log(p.retention));
  const mx = xs.reduce((a, b) => a + b, 0) / xs.length;
  const my = ys.reduce((a, b) => a + b, 0) / ys.length;
  const slope = xs.reduce((sum, x, i) => sum + (x - mx) * (ys[i] - my), 0) /
    xs.reduce((sum, x) => sum + (x - mx) ** 2, 0);
  return { exponent: -slope, amplitude: Math.exp(my - slope * mx) };
}
