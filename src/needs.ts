import { getBelief } from "./beliefs.ts";
import { DEFAULT_COGNITIVE_PARAMS } from "./types.ts";
import type { BeliefStore, FeltNeed, Goal, NeedDefinition, Relevance } from "./types.ts";

export interface NeedInputs {
  readonly signals: Readonly<Record<string, number>>;
  readonly beliefs: BeliefStore;
  /** Accumulator levels at the beginning of this interval, keyed by need id. */
  readonly accumulators: Readonly<Record<string, number>>;
  readonly elapsedSeconds: number;
  /** Outcomes at the end of the interval; matching tags reset to the setpoint. */
  readonly outcomeTags: readonly string[];
  readonly cues: readonly { readonly attention: number; readonly relevance: Relevance }[];
}

function nonnegative(x: number, name: string): number {
  if (!Number.isFinite(x) || x < 0) throw new RangeError(`${name} must be finite and nonnegative`);
  return x;
}

function unit(x: number, name: string): number {
  if (nonnegative(x, name) > 1) throw new RangeError(`${name} must be <= 1`);
  return x;
}

function required(values: Readonly<Record<string, number>>, key: string): number {
  if (!Object.hasOwn(values, key)) throw new RangeError(`Missing need input: ${key}`);
  return unit(values[key], key);
}

/** DESIGN §2.2: level-4 proposed pressure model; definitions remain in host mint order. */
export function evaluateNeeds(definitions: readonly NeedDefinition[], inputs: NeedInputs): FeltNeed[] {
  if (new Set(definitions.map((need) => need.id)).size !== definitions.length) {
    throw new RangeError("Need ids must be unique");
  }
  nonnegative(inputs.elapsedSeconds, "elapsed seconds");
  const needs = definitions.map((definition) => {
    const { source, setpoint, weight } = definition;
    unit(setpoint, "setpoint");
    nonnegative(weight, "weight");
    let level: number;
    let deficit: number;
    if ("signal" in source) {
      // DESIGN §0, §2.2 boundary: Reality supplies the deficit, never infer physiology.
      deficit = required(inputs.signals, source.signal);
      level = setpoint + deficit;
    } else {
      if ("appraisal" in source) {
        const query = source.appraisal;
        const belief = getBelief(inputs.beliefs, query.about, query.attribute);
        if (!belief) throw new RangeError(`Missing appraisal belief: ${definition.id}`);
        if (belief.kind === "categorical") {
          const index = belief.values.indexOf(query.value ?? "");
          if (index < 0) throw new RangeError("Appraisal requires a known categorical value");
          level = unit(belief.probabilities[index], "appraisal");
        } else {
          if (query.value !== undefined) throw new RangeError("Only categorical appraisals take a value");
          level = unit(belief.kind === "existence" ? belief.probability : belief.mean, "appraisal");
        }
      } else {
        const { rate, reset_on } = source.accumulator;
        nonnegative(rate, "accumulator rate");
        const previous = required(inputs.accumulators, definition.id);
        // DESIGN §2.2: dh/dt = rate; proposed saturation at 1 and full reset on a positive outcome.
        level = reset_on.some((tag) => inputs.outcomeTags.includes(tag))
          ? setpoint : Math.min(1, previous + rate * inputs.elapsedSeconds);
      }
      // DESIGN §2.2: D_i = |h*_i - h_i| for cognitive appraisals/accumulators.
      deficit = Math.abs(setpoint - level);
    }
    let salience = 1; // DESIGN §2.2 proposed neutral salience.
    for (const cue of inputs.cues) {
      // Proposed tag mapping: maximum membership avoids counting overlapping tags twice.
      let relevance = 0;
      for (const tag of definition.salienceTags) {
        relevance = Math.max(relevance, unit(Object.hasOwn(cue.relevance, tag) ? cue.relevance[tag] : 0, "relevance"));
      }
      // DESIGN §2.2: S_i = 1 + sum_c a_c eta(c,i).
      salience += unit(cue.attention, "attention") * relevance;
    }
    // DESIGN §2.2: M_i = w_i D_i S_i; category is descriptive only.
    const pressure = nonnegative(weight * deficit * salience, "pressure");
    return { definition, level, deficit, salience, pressure, priority: 0 };
  });
  let max = 0;
  for (const need of needs) max = Math.max(max, need.pressure);
  const total = needs.reduce((sum, need) => sum + (max === 0 ? 0 : need.pressure / max), 0);
  // DESIGN §2.2: M_i / sum M, scaled against overflow; zero pressure -> priority 0 (PLAN A.10 CN-1, Rex 2026-11-03)
  return needs.map((need) => ({ ...need, priority: max === 0 ? 0 : (need.pressure / max) / total }));
}

/** DESIGN §2.2, Keramati & Gutkin (2014), level 4; defaults n=4, m=3 from the shared parameters. */
export function drive(needs: readonly FeltNeed[], n = DEFAULT_COGNITIVE_PARAMS.n, m = DEFAULT_COGNITIVE_PARAMS.m): number {
  if (!Number.isFinite(n) || !Number.isFinite(m) || m < 1 || n <= m) throw new RangeError("Require n > m >= 1");
  // D = (sum w_k |h*_k - h_k|^n)^(1/m); signal deficits already come from Reality.
  const terms = needs.map((need) => nonnegative(need.definition.weight, "weight") * unit(need.deficit, "deficit") ** n);
  let max = 0;
  for (const term of terms) max = Math.max(max, term);
  if (max === 0) return 0;
  return nonnegative(max ** (1 / m) * terms.reduce((sum, term) => sum + term / max, 0) ** (1 / m), "drive");
}

/** DESIGN §2.2, Keramati & Gutkin (2014): r = D(h) - D(h'). */
export function driveReward(before: readonly FeltNeed[], after: readonly FeltNeed[], n = DEFAULT_COGNITIVE_PARAMS.n, m = DEFAULT_COGNITIVE_PARAMS.m): number {
  return drive(before, n, m) - drive(after, n, m);
}

/** DESIGN §2.2: one goal step contributes exactly V_g Δp_g; deadlines are host metadata. */
export function goalReward(goal: Goal, nextProgress: number): number {
  if (!Number.isFinite(goal.value)) throw new RangeError("Goal value must be finite");
  return goal.value * (unit(nextProgress, "next progress") - unit(goal.progress, "progress"));
}
