import type { RandomStreams } from "@rex/kernel";
import type { Theta, TiResult } from "./run-ti.ts";

export type Feedback = "correct" | "wrong" | null;
export type Regime = "accurate" | "incomplete" | "misleading";
export interface Learner { theta: Theta; baseline: number; received: number }
export function learner(familyTags = true): Learner {
  return { theta: { atom: Array<number>(familyTags ? 9 : 5).fill(0), polarity: 0 }, baseline: 0, received: 0 };
}

/** DESIGN §3: the sole correctness channel; p_miss=.5, p_flip=.3 are design estimates. */
export function feedback(correct: boolean, regime: Regime, rng: RandomStreams): Feedback {
  if (regime === "incomplete" && rng.get("ti.feedback.miss", "experiment")() < 0.5) return null;
  const flip = regime === "misleading" && rng.get("ti.feedback.flip", "experiment")() < 0.3;
  return correct !== flip ? "correct" : "wrong";
}

/** DESIGN §3, Williams (1992): REINFORCE with the mean of *past* rewards.
 * Forced reverse branches have no sampled action and contribute no gradient.
 * Lambda=.05 and unresolved=-.25 are design estimates. */
export function learn(state: Learner, result: TiResult, budget: number, received: Feedback,
  lambda = 0.05): Learner {
  if (received === null) return state;
  if (!Number.isFinite(budget) || budget < result.stepsUsed || budget < 0 ||
      !Number.isFinite(lambda) || lambda < 0) throw new Error("Invalid learning budget or rate");
  const reward = result.conclusion === "unresolved" ? -0.25 : received === "wrong" ? -1 :
    1 - (budget === 0 ? 0 : result.stepsUsed / budget);
  const gradient = state.theta.atom.map(() => 0);
  let polarity = 0;
  for (const d of result.trace) {
    if (d.forced) continue;
    for (let j = 0; j < gradient.length; j++) {
      gradient[j] += d.features[j] - d.candidates.reduce((s, c) => s + c.probability * c.features[j], 0);
    }
    const pTrue = d.value ? d.valueProbability : 1 - d.valueProbability;
    polarity += (Number(d.value) - pTrue) * d.features[3];
  }
  const scale = lambda * (reward - state.baseline);
  return { theta: { atom: state.theta.atom.map((w, j) => w + scale * gradient[j]),
    polarity: state.theta.polarity + scale * polarity }, received: state.received + 1,
    baseline: state.baseline + (reward - state.baseline) / (state.received + 1) };
}
