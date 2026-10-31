import stacks from "../../../personality/eight-function/stacks.json" with { type: "json" };
import formulas from "../../../personality/eight-function/v1/formulas.json" with { type: "json" };
import { validateCandidate } from "../../actions.ts";
import { nullPersonality } from "../../personality.ts";
import type { PersonalityModel } from "../../personality.ts";
import type { Candidate, CategoricalBelief, Domain, MindView } from "../../types.ts";

export type CognitiveFunction = "Se" | "Si" | "Ne" | "Ni" | "Te" | "Ti" | "Fe" | "Fi";
export type PersonalityType = keyof typeof stacks;

/** Subjective tags supplied by the caller, never objective world state. */
export interface V1Context {
  readonly failures?: number;
  readonly cues?: Readonly<Record<string, {
    readonly domain: Domain; readonly physical?: boolean; readonly present?: boolean;
  }>>;
  readonly targeted?: boolean;
  readonly aboutPerson?: boolean;
  readonly present?: boolean;
  readonly testimony?: boolean;
}

/** F9: the host owns precondition semantics and the compound's subjective outcome model.
 * No joint probability, outcome effects, or world transition is invented by personality.
 */
export interface BelievedCompound {
  readonly outcome: string;
  readonly precondition: string;
  readonly candidate: Candidate;
}

/** The compound remains one host candidate, with its two intended steps preserved in traces. */
export interface V1CompoundCandidate extends Candidate {
  readonly steps: readonly [Pick<Candidate, "action" | "target">, Pick<Candidate, "action" | "target">];
}

export interface V1Options {
  /** DESIGN §9 F1 names eta_min but gives no value: required, not a hidden default. */
  readonly etaMin: number;
  /** Proposed absence convention: no extra tags and zero recorded failures. */
  readonly context?: (mind: MindView) => V1Context;
  /** Return only when a's believed outcome satisfies a precondition of b. */
  readonly compound?: (a: Candidate, b: Candidate, mind: MindView) => BelievedCompound | undefined;
  readonly otherMind?: {
    /** Only outcomes dependent on another mind's choice get a believed situation. */
    readonly situation: (candidate: Candidate, mind: MindView) => MindView | undefined;
    /** Run this mind's own policy in that subjective situation and project its choice
     * distribution onto candidate outcomes. The host supplies that projection, not v1.
     * Pass the supplied model to policy; recursive other-mind simulation is disabled.
     */
    readonly ownPolicy: (candidate: Candidate, situation: MindView, model: PersonalityModel) => CategoricalBelief;
  };
}

export interface EightFunctionV1 extends PersonalityModel {
  readonly version: "v1";
  readonly stack: readonly CognitiveFunction[];
  readonly weights: Readonly<Record<CognitiveFunction, number>>;
  readonly tilt: number;
  /** DESIGN §9: explicitly reserved identity hooks, including inline off exceptions. */
  readonly off: Readonly<Record<string, PersonalityModel>>;
}

const functions: readonly CognitiveFunction[] = ["Se", "Si", "Ne", "Ni", "Te", "Ti", "Fe", "Fi"];
// DESIGN §9 F4/F5, FUNCTIONS "Systems vs people" / "Refinement": Fe, Fi, Ti stay off.
const external: Partial<Record<Domain, CognitiveFunction>> = { space: "Se", adaptation: "Ne", meta: "Te" };
const internal: Partial<Record<Domain, CognitiveFunction>> = { space: "Si", adaptation: "Ni" };

function nonnegative(value: number, name: string): number {
  if (!Number.isFinite(value) || value < 0) throw new RangeError(`${name} must be finite and nonnegative`);
  return value;
}

function probability(value: number, name: string): number {
  if (nonnegative(value, name) > 1) throw new RangeError(`${name} must be in [0,1]`);
  return value;
}

/** DESIGN §9, FUNCTIONS "Stack position and confidence" and "Attitudes".
 * Named types have four slots. Shorter distinct diagnostic stacks exercise off-only content;
 * present slots retain their specified ordinal weights; absent functions have weight zero.
 */
export function createEightFunctionV1(
  typeOrStack: PersonalityType | readonly CognitiveFunction[], options: V1Options,
): EightFunctionV1 {
  if (!(probability(options.etaMin, "etaMin") > 0)) throw new RangeError("etaMin must be positive");
  const configured = typeof typeOrStack === "string" ? stacks[typeOrStack] : typeOrStack;
  if (!configured || configured.length < 2 || configured.length > 4 || new Set(configured).size !== configured.length ||
      configured.some((f) => !functions.includes(f as CognitiveFunction))) {
    throw new RangeError("Expected two to four distinct functions or a known type");
  }
  const stack = Object.freeze([...configured] as CognitiveFunction[]);
  if (!stack.some((f) => f.endsWith("e")) || !stack.some((f) => f.endsWith("i"))) {
    throw new RangeError("Both attitudes must be present (DESIGN §9: never pure)");
  }
  const weights = Object.fromEntries(functions.map((f) => [f, 0])) as Record<CognitiveFunction, number>;
  // DESIGN §9 W: linear ordinal weights are crude constants, not in source.
  stack.forEach((f, i) => { weights[f] = (4 - i) / 4; });
  Object.freeze(weights);
  const total = stack.reduce((sum, f) => sum + weights[f], 0);
  const rhoE = stack.reduce((sum, f) => sum + (f.endsWith("e") ? weights[f] : 0), 0) / total;
  // DESIGN §9 DELTA; FUNCTIONS "Attitudes", all four positions count.
  const tilt = rhoE - (1 - rhoE);
  const weight = (map: Partial<Record<Domain, CognitiveFunction>>, domain: Domain) => {
    const f = map[domain];
    return f === undefined ? 0 : weights[f];
  };
  const off = Object.freeze(Object.fromEntries(formulas.filter((f) => f.status === "off").map((f) => [f.id, nullPersonality])));
  const context = (mind: MindView): V1Context => options.context?.(mind) ?? {};
  const model: EightFunctionV1 = {
    id: "eight-function", version: "v1", stack, weights, tilt, off,
    pertinence(base, mind) {
      const tags = context(mind).cues;
      // DESIGN §9 F2, "Attitudes: Mastery and scope"; F4 "Systems vs people";
      // F6 "Se: Domain/Time frame" and THEORY §1 sensation focus. Apply in id order.
      // Log scaling evaluates the stated normalized powers without overflow/underflow.
      const entries = Object.entries(base).map(([id, pi]) => {
        nonnegative(pi, "pertinence");
        return [id, pi === 0 ? -Infinity : (1 - tilt) * Math.log(pi)] as const;
      });
      const max = entries.reduce((m, [, x]) => Math.max(m, x), -Infinity);
      const scaled = entries.map(([id, x]) => [id, max === -Infinity ? 0 : Math.exp(x - max)] as const);
      const sum = scaled.reduce((s, [, x]) => s + x, 0);
      // Proposed zero-mass boundary: preserve zeros (the baseline attention convention).
      return Object.fromEntries(scaled.map(([id, x]) => {
        const cue = tags?.[id];
        const boost = 1 + (cue ? weight(external, cue.domain) : 0);
        const physical = 1 + (cue?.physical && cue.present ? weights.Se : 0);
        return [id, sum === 0 ? 0 : x / sum * boost * physical];
      }));
    },
    interpret(base, domain, mind) {
      const ctx = context(mind);
      const failures = nonnegative(ctx.failures ?? 0, "failures"); // proposed absent-history convention.
      if (!Number.isSafeInteger(failures)) throw new RangeError("failures must be a safe integer");
      // DESIGN §9 F1/F3, FUNCTIONS "Attitudes". N_half=10: crude constant, not in source.
      let eta = Math.max(options.etaMin, Math.min(1, probability(base.eta, "eta") * (1 + tilt)));
      let alpha0 = nonnegative(base.alpha0, "alpha0") * (1 - tilt);
      const lambda = nonnegative(base.lambda, "lambda") * (1 - tilt) *
        (1 - Math.max(tilt, 0) * failures / (failures + 10));
      const person = ctx.aboutPerson ?? domain === "people";
      // DESIGN §9 F6, "Se": targeted precision only; /2 is a crude constant, not in source.
      const weberFraction = nonnegative(base.weberFraction, "weberFraction") * (ctx.targeted ? 1 - weights.Se / 2 : 1);
      if (person && ctx.present) eta += weights.Se * (1 - eta) / 2;
      // DESIGN §9 F7, "Stack position and confidence": off/absent content is identity.
      const ownWeight = Math.max(weight(external, domain), weight(internal, domain));
      const confidence = probability(base.confidence, "confidence") * (ownWeight > 0 ? 0.5 + ownWeight / 2 : 1);
      // DESIGN §9 F12, "Interaction: Se with Ni"; compose with F1, grudge remains off.
      if (person) alpha0 *= 1 + weights.Ni;
      // DESIGN §9 F13, "Te": /2 is a crude constant, not in source.
      const reliability = probability(base.testimonyFloor, "testimony reliability");
      const testimonyFloor = ctx.testimony ? reliability + weights.Te * (1 - reliability) / 2 : reliability;
      nonnegative(alpha0, "modified alpha0");
      nonnegative(lambda, "modified lambda");
      return { ...base, eta, alpha0, lambda, confidence, weberFraction, testimonyFloor };
    },
    generate(candidates, base, mind) {
      // DESIGN §9 F9, "Ne: Mechanism". K=3: crude constant, not in source.
      const k = Math.round(weights.Ne * 3);
      const added: V1CompoundCandidate[] = [];
      if (k > 0 && options.compound) {
        pairs: for (const a of candidates) for (const b of candidates) {
          const link = options.compound(a, b, mind);
          if (!link) continue;
          const outcome = a.outcomes.values.indexOf(link.outcome);
          if (outcome < 0 || a.outcomes.probabilities[outcome] <= 0 ||
              !b.preconditions.some((p) => p.id === link.precondition)) {
            throw new RangeError("Compound must link a possible believed outcome to a declared precondition");
          }
          validateCandidate(link.candidate);
          if ([...candidates, ...added].some((c) => c.action === link.candidate.action && c.target === link.candidate.target)) continue;
          added.push({ ...link.candidate, steps: [
            { action: a.action, target: a.target }, { action: b.action, target: b.target },
          ] });
          if (added.length === k) break pairs;
        }
      }
      let result: readonly Candidate[] = added.length ? [...candidates, ...added] : candidates;
      // DESIGN §9 F10, "Ni: Mechanism" / shared perception [DERIVED].
      if (weights.Ni > 0 && options.otherMind) {
        const adapter = options.otherMind;
        // Proposed recursion boundary: self-simulation runs the same hooks once, without nested F10.
        const self = createEightFunctionV1(stack, { ...options, otherMind: undefined });
        result = result.map((candidate) => {
          const situation = adapter.situation(candidate, mind);
          if (!situation) return candidate;
          const simulated = adapter.ownPolicy(candidate, situation, self);
          if (simulated.values.length !== candidate.outcomes.values.length ||
              simulated.values.some((id, i) => id !== candidate.outcomes.values[i])) {
            throw new RangeError("Self-simulation must use the candidate's outcome order");
          }
          validateCandidate({ ...candidate, outcomes: simulated });
          const updated = { ...candidate, outcomes: { ...candidate.outcomes,
            probabilities: candidate.outcomes.probabilities.map((p, i) =>
              (1 - weights.Ni) * p + weights.Ni * simulated.probabilities[i]),
          } };
          validateCandidate(updated);
          return updated;
        });
      }
      // DESIGN §9 F11, FUNCTIONS "Ne and Ni — fate"; no new action preference.
      const kappa = Math.max(0, nonnegative(base.kappa, "kappa") * (1 + weights.Ni - weights.Ne));
      nonnegative(kappa, "modified kappa");
      return { candidates: result, params: kappa === base.kappa ? base : { ...base, kappa } };
    },
    learning(base, domain, mind) {
      const ctx = context(mind);
      const person = ctx.aboutPerson ?? domain === "people";
      // DESIGN §9 F4/F5, "Systems vs people" / "Refinement". r=1.5: crude constant, not in source.
      const rate = nonnegative(base.rate, "rate") * (1 + weight(external, domain)) * (1 + 1.5 * weight(internal, domain));
      // DESIGN §9 F8, "Si: Mechanism/Accumulation/Time frame"; /2 crude, weakness off.
      const d = nonnegative(base.d, "d") * (domain === "body" || person ? 1 - weights.Si / 2 : 1);
      // Existing learning boundary uses +Infinity to mean no belief drift.
      if (!(base.beliefHalfLife > 0)) throw new RangeError("beliefHalfLife must be positive");
      const beliefHalfLife = base.beliefHalfLife * (person ? 1 + weights.Si : 1);
      nonnegative(rate, "modified rate");
      if (base.beliefHalfLife !== Infinity) nonnegative(beliefHalfLife, "modified beliefHalfLife");
      return rate === base.rate && d === base.d && beliefHalfLife === base.beliefHalfLife
        ? base : { ...base, rate, d, beliefHalfLife };
    },
  };
  return Object.freeze(model);
}
