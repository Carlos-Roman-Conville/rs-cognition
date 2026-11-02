import type { EightFunctionV2 } from "../../experimental/personality-v2/v2.ts";
import type { CognitiveFunction } from "../../src/index.ts";
import type { RandomStream } from "@rex/kernel";
import { nullPersonality } from "../../src/index.ts";
import type { Domain, PersonalityModel, V1Context } from "../../src/index.ts";

export type Control = "none" | "random-theta" | "shuffled";
export interface Theta {
  eta: number; alpha0: number; lambda: number; confidence: number;
  kappa: number; rate: number; pertinence: Record<string, number>;
}
export interface Calibration {
  interpret: readonly Pick<Theta, "eta" | "alpha0" | "lambda" | "confidence">[];
  generate: readonly { kappa: number }[];
  learning: readonly { rate: number }[];
  /** Hook output / input, in cue mint order (zero input has identity multiplier). */
  pertinence: readonly Record<string, number>[];
}

/** DESIGN scenarios §10.3: extrema of the sixteen same-seed trajectories, then
 * one independent uniform draw per parameter and cue. Caller supplies the kernel
 * bench.control.theta stream scoped to the mind; no draws occur during hooks. */
export function randomTheta(calibration: Calibration, rng: RandomStream): Theta {
  const draw = (values: readonly number[]) => {
    if (!values.length || values.some((x) => !Number.isFinite(x))) throw new Error("Invalid control calibration");
    const min = values.reduce((a, b) => Math.min(a, b)), max = values.reduce((a, b) => Math.max(a, b));
    return min + (max - min) * rng();
  };
  return {
    eta: draw(calibration.interpret.map((p) => p.eta)),
    alpha0: draw(calibration.interpret.map((p) => p.alpha0)),
    lambda: draw(calibration.interpret.map((p) => p.lambda)),
    confidence: draw(calibration.interpret.map((p) => p.confidence)),
    kappa: draw(calibration.generate.map((p) => p.kappa)),
    rate: draw(calibration.learning.map((p) => p.rate)),
    pertinence: Object.fromEntries(Object.keys(calibration.pertinence[0] ?? {}).map((cue) =>
      [cue, draw(calibration.pertinence.map((p) => p[cue]))])),
  };
}

/** Null structure with fixed, calibrated hook-reachable parameters (§10.3). */
export function thetaPersonality(theta: Theta): PersonalityModel {
  return { ...nullPersonality,
    pertinence: (base) => Object.fromEntries(Object.entries(base).map(([cue, value]) => [cue, value * (theta.pertinence[cue] ?? 1)])),
    interpret: (base) => ({ ...base, eta: theta.eta, alpha0: theta.alpha0, lambda: theta.lambda, confidence: theta.confidence }),
    generate: (candidates) => ({ candidates, params: { kappa: theta.kappa } }),
    learning: (base) => ({ ...base, rate: theta.rate }),
  };
}

const domains: readonly Domain[] = ["space", "adaptation", "meta", "cohesion"];
/** V1 owns its cue metadata closure. Hosts using cue ids rather than domain keys
 * supply this bridge so the wrapper can relabel categories without editing V1. */
export interface CueContextBridge { get(): V1Context; set(context: V1Context): void }

export function shuffledV1(v1Model: PersonalityModel, rng: RandomStream, context?: CueContextBridge): PersonalityModel {
  // DESIGN scenarios §10.3: uniform Fisher-Yates permutation, once per seed,
  // from the caller's bench.control.shuffle kernel stream.
  const permutation = [...domains];
  for (let i = permutation.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [permutation[i], permutation[j]] = [permutation[j], permutation[i]];
  }
  const map = (domain: Domain) => permutation[domains.indexOf(domain)] ?? domain;
  const unmap = (domain: Domain) => domains[permutation.indexOf(domain)] ?? domain;
  return { id: v1Model.id, version: v1Model.version,
    pertinence(base, view) {
      const previous = context?.get();
      if (previous) context!.set({ ...previous, cues: previous.cues && Object.fromEntries(
        Object.entries(previous.cues).map(([id, cue]) => [id, { ...cue, domain: map(cue.domain) }])) });
      try {
        // Domain-key categories are relabelled into V1's coordinates, then back.
        // Cue-id categories use the bridge above, including unequal/absent groups.
        const input = Object.fromEntries(Object.entries(base).map(([key, value]) => [map(key as Domain), value]));
        const output = v1Model.pertinence(input, view);
        return Object.fromEntries(Object.entries(output).map(([key, value]) => [unmap(key as Domain), value]));
      } finally { if (previous) context!.set(previous); }
    },
    interpret: (base, domain, view) => v1Model.interpret(base, map(domain), view),
    generate(candidates, base, view) {
      const result = v1Model.generate(candidates.map((c) => ({ ...c, domain: map(c.domain) })), base, view);
      return { ...result, candidates: result.candidates.map((c) => ({ ...c, domain: unmap(c.domain) })) };
    },
    learning: (base, domain, view) => v1Model.learning(base, map(domain), view),
  };
}

export function shuffledV2(v2Model: PersonalityModel, rng: RandomStream): EightFunctionV2 {
  const model = v2Model as EightFunctionV2;
  if (model.version !== "v2" || !model.relabel) throw new Error("Expected Personality V2");
  // DESIGN scenarios §10.3: permute all eight labels, preserving position weights.
  const labels: CognitiveFunction[] = ["Se", "Si", "Ne", "Ni", "Te", "Ti", "Fe", "Fi"];
  const shuffled = [...labels];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return model.relabel(Object.fromEntries(labels.map((f, i) => [f, shuffled[i]])) as Record<CognitiveFunction, CognitiveFunction>);
}
