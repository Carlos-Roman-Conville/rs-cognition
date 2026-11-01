import { simTime } from "@rex/kernel";
import type { SimTime } from "@rex/kernel";
import { validateCandidate } from "./actions.ts";
import type { GenerationResult } from "./actions.ts";
import { outcomeExpectations } from "./memory.ts";
import { assetValue, believedRate } from "./valuation.ts";
import { driveReward, goalReward } from "./needs.ts";
import { nullPersonality } from "./personality.ts";
import type { InterpretParams, PersonalityModel } from "./personality.ts";
import type { AssetDefinition, Candidate, CategoricalBelief, DecisionTrace, Episode, MindView, PredictedOutcome } from "./types.ts";

export interface OutcomeUtility {
  readonly outcome: string;
  readonly probability: number;
  readonly driveReward: number;
  readonly goalReward: number;
  readonly cost: number;
  readonly netReward: number;
  readonly value: number;
}

/** DESIGN §2.4 PA-Q2: keeper's proposed search bound; sourced: false. */
export const R_MAX = 1e6;

export interface Evaluation {
  readonly ratioMin?: number;
  readonly candidate: Candidate;
  readonly interpret: InterpretParams;
  readonly counts: readonly number[];
  /** Memory's unmodified P_hat, then the interpreted distribution used by EU. */
  readonly memoryDistribution: CategoricalBelief;
  readonly expectedOutcomes: CategoricalBelief;
  readonly outcomes: readonly OutcomeUtility[];
  readonly discount: number;
  readonly expectedUtility: number;
}

export interface EvaluationResult {
  readonly ineligible?: DecisionTrace["ineligible"];
  readonly generation: GenerationResult;
  readonly candidates: readonly Evaluation[];
  readonly view: MindView;
  readonly episodes: readonly Episode[];
  readonly context: Episode["context"];
  readonly t: SimTime;
}

function finite(value: number, name: string): number {
  if (!Number.isFinite(value)) throw new RangeError(`${name} must be finite`);
  return value;
}

/** DESIGN §9 F7; proposed mass conservation across host-declared success/failure outcomes. */
function confidenceDistribution(candidate: Candidate, distribution: CategoricalBelief, confidence: number): CategoricalBelief {
  if (finite(confidence, "confidence") < 0 || confidence > 1) throw new RangeError("Confidence must be in [0,1]");
  if (confidence === 1) return distribution; // Identity is byte-identical, without re-normalization.
  if (candidate.effects.some((effect) => effect.success === undefined) ||
      !candidate.effects.some((effect) => effect.success === false)) {
    throw new RangeError("Modified confidence requires explicit success flags and a failure outcome");
  }
  const success = distribution.probabilities.reduce((sum, p, i) => sum + (candidate.effects[i].success ? p : 0), 0);
  const failure = distribution.probabilities.reduce((sum, p, i) => sum + (candidate.effects[i].success ? 0 : p), 0);
  const failureCount = candidate.effects.filter((effect) => !effect.success).length;
  // P_success' = confidence * P_success; move removed mass proportionally to failures.
  // Proposed zero-failure-mass convention: split that mass uniformly across declared failures.
  const removed = success * (1 - confidence);
  return { kind: "categorical", values: distribution.values,
    probabilities: distribution.probabilities.map((p, i) => candidate.effects[i].success
      ? p * confidence : p + removed * (failure === 0 ? 1 / failureCount : p / failure)) };
}

function outcomeUtility(effect: PredictedOutcome, probability: number, candidate: Candidate, ctx: MindView, lambda: number, assets: readonly AssetDefinition[], wantUnits?: number): OutcomeUtility {
  for (const id of Object.keys(effect.deficits)) {
    if (!ctx.needs.needs.some((need) => need.definition.id === id)) throw new RangeError(`Unknown predicted need: ${id}`);
  }
  for (const id of Object.keys(effect.goalProgress)) {
    if (!ctx.needs.goals.some((goal) => goal.id === id)) throw new RangeError(`Unknown predicted goal: ${id}`);
  }
  const after = ctx.needs.needs.map((need) => Object.hasOwn(effect.deficits, need.definition.id)
    ? { ...need, deficit: effect.deficits[need.definition.id] } : need);
  const reward = driveReward(ctx.needs.needs, after, ctx.params.n, ctx.params.m);
  const goals = ctx.needs.goals.reduce((sum, goal) => sum + goalReward(goal,
    Object.hasOwn(effect.goalProgress, goal.id) ? effect.goalProgress[goal.id] : goal.progress), 0);
  // DESIGN §2.4, Kahneman & Tversky (1979), Tversky & Kahneman (1992): v(x)=x or λx.
  let rawReward = reward + goals - candidate.cost;
  if (candidate.exchange && effect.success === true) {
    const { give, want } = candidate.exchange;
    // DESIGN §2.4 payment acceptance: signed holdings value enters before v(x).
    rawReward += -give.units * assetValue(give.asset, ctx, assets) +
      (wantUnits ?? want.units!) * assetValue(want.asset, ctx, assets);
  }
  const netReward = finite(rawReward, "net reward");
  const value = finite(netReward < 0 ? lambda * netReward : netReward, "loss-adjusted value");
  return { outcome: effect.id, probability, driveReward: reward, goalReward: goals, cost: candidate.cost, netReward, value };
}

/** DESIGN §2.4: one-action EU, drive reduction plus goals minus effort, with loss aversion and discount. */
export function evaluateActions(
  generation: GenerationResult, ctx: MindView, episodes: readonly Episode[], context: Episode["context"],
  t: SimTime, personality: PersonalityModel = nullPersonality,
): EvaluationResult {
  simTime(t);
  if (finite(ctx.params.gamma, "gamma") < 0 || ctx.params.gamma > 1) throw new RangeError("Gamma must be in [0,1]");
  const assets = generation.assets ?? [];
  const ineligible: NonNullable<DecisionTrace["ineligible"]>[number][] = [];
  const reject = (candidate: Candidate, reason: string) => ineligible.push({ candidate, eligible: false, reason });
  const rated = generation.candidates.flatMap((candidate): Evaluation[] => {
    validateCandidate(candidate);
    const base: InterpretParams = {
      eta: ctx.params.eta, alpha0: ctx.params.alpha0, lambda: ctx.params.lambda,
      confidence: 1, // proposed identity; §9 F7 applies only when a personality supplies it.
      weberFraction: 0, testimonyFloor: 0, // proposed unused neutral values at this decision-only call site.
    };
    const interpreted = personality.interpret(base, candidate.domain, ctx);
    if (finite(interpreted.lambda, "lambda") < 0) throw new RangeError("Lambda must be nonnegative");
    const expectation = outcomeExpectations(episodes, candidate.action, context, candidate.outcomes, t,
      { ...ctx.params, alpha0: interpreted.alpha0 });
    const expectedOutcomes = confidenceDistribution(candidate, expectation.distribution, interpreted.confidence);
    let wantUnits: number | undefined;
    if (candidate.exchange && candidate.exchange.want.units === undefined) {
      const rate = believedRate(candidate.exchange.give.asset, candidate.exchange.want.asset, ctx, assets);
      if (rate === undefined) { reject(candidate, "No rate belief for offer"); return []; }
      wantUnits = rate * candidate.exchange.give.units;
    }
    const outcomes = candidate.effects.map((effect, i) => outcomeUtility(effect, expectedOutcomes.probabilities[i], candidate, ctx, interpreted.lambda, assets, wantUnits));
    // DESIGN §2.4: EU = γ^(dur-1) Σ_o P_hat(o) v(r + Σ VΔp - cost).
    const discount = ctx.params.gamma ** (candidate.duration - 1);
    const expectedUtility = finite(discount * outcomes.reduce((sum, outcome) => sum + outcome.probability * outcome.value, 0), "expected utility");
    return [{ candidate, interpret: interpreted, counts: expectation.counts, memoryDistribution: expectation.distribution,
      expectedOutcomes, outcomes, discount, expectedUtility }];
  });
  const candidates = rated.flatMap((evaluation): Evaluation[] => {
    const { candidate } = evaluation;
    const exchange = candidate.exchange;
    if (!exchange || exchange.want.units !== undefined) return [evaluation];
    const samePair = (other: Candidate) => other.exchange &&
      ((other.exchange.give.asset === exchange.give.asset && other.exchange.want.asset === exchange.want.asset) ||
       (other.exchange.give.asset === exchange.want.asset && other.exchange.want.asset === exchange.give.asset));
    const alternative = rated.reduce((best, other) => other === evaluation || samePair(other.candidate)
      ? best : Math.max(best, other.expectedUtility), -Infinity);
    // DESIGN §2.4: bisection uses the identical interpreted EU, including failure, cost, loss and discount.
    const eu = (ratio: number) => evaluation.discount * candidate.effects.reduce((sum, effect, i) => {
      const outcome = outcomeUtility(effect, evaluation.expectedOutcomes.probabilities[i], candidate, ctx,
        evaluation.interpret.lambda, assets, ratio * exchange.give.units);
      return sum + outcome.probability * outcome.value;
    }, 0);
    if (eu(R_MAX) < alternative) { reject(candidate, "No reservation ratio within R_MAX"); return []; }
    if (evaluation.expectedUtility < 0) { reject(candidate, "Offer expects a loss at believed rate"); return []; }
    let low = 0;
    let high = R_MAX;
    if (eu(0) >= alternative) high = 0;
    // Relative interval tolerance; zero and subnormal roots terminate at floating-point resolution.
    while (high - low > 1e-9 * high) {
      const middle = low + (high - low) / 2;
      if (middle === low || middle === high) break;
      if (eu(middle) >= alternative) high = middle;
      else low = middle;
    }
    return [{ ...evaluation, ratioMin: high }];
  });
  return { generation, candidates, view: ctx, episodes, context, t,
    ...(ineligible.length === 0 ? {} : { ineligible }) };
}
