import { withOperations } from "./personality-operations.ts";
import { mint } from "@rex/kernel";
import type { Counters, RandomStream } from "@rex/kernel";
import type { Evaluation, EvaluationResult } from "./evaluate.ts";
import type { DecisionTrace, Intention } from "./types.ts";

/** DESIGN §2.4, Luce (1959), level 2: stable softmax in declared candidate order. */
export function softmax(utilities: readonly number[], beta: number): number[] {
  if (!Number.isFinite(beta) || beta < 0 || utilities.length === 0 || !utilities.every(Number.isFinite)) {
    throw new RangeError("Softmax requires finite utilities, a nonempty list and finite beta >= 0");
  }
  if (beta === 0) return utilities.map(() => 1 / utilities.length);
  const maximum = utilities.reduce((max, value) => Math.max(max, value), -Infinity);
  // Subtract before multiplying, so even β*max overflow cannot produce Infinity-Infinity.
  const weights = utilities.map((value) => {
    const difference = value - maximum;
    const exponent = Number.isFinite(difference) ? beta * difference : beta * value - beta * maximum;
    return Math.exp(exponent);
  });
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  return weights.map((weight) => weight / total);
}

export interface SelectionTrace extends DecisionTrace {
  readonly conversations?: readonly import("./communication/types.ts").ConversationRecord[];
  readonly message?: import("./communication/types.ts").Message;
  readonly candidates: readonly (Evaluation & {
    /** Effective selection probability, including a commitment point mass. */
    readonly probability: number;
    readonly softmaxProbability: number;
  })[];
  readonly inputs: {
    readonly generation: EvaluationResult["generation"];
    readonly episodes: EvaluationResult["episodes"];
    readonly context: EvaluationResult["context"];
    readonly previousIntention?: Intention;
  };
  readonly commitment: { readonly kappa: number; readonly kept: boolean; readonly advantage?: number };
  /** Exactly one selection-stream draw per re-choice, none when keeping an intention. */
  readonly draw?: number;
}

export interface SelectionInputs {
  readonly mind: string;
  readonly counters: Counters;
  readonly current?: Intention;
}

/**
 * DESIGN §2.4, §7: caller supplies streams.get("cognition.decision.select", mind).
 * Commitment: Bratman (1987), Cohen & Levesque (1990); quantitative threshold level 5.
 * Emits intention data for the reducer to wrap in a kernel event, never a resolved outcome.
 */
export function selectAction(
  evaluation: EvaluationResult, inputs: SelectionInputs, stream: RandomStream,
): { intention: Intention; trace: SelectionTrace; counters: Counters } {
  const { candidates, view, t, generation } = evaluation;
  const probabilities = softmax(candidates.map((candidate) => candidate.expectedUtility), view.params.beta);
  const kappa = generation.params.kappa; // DESIGN §9: selection reads the generate hook's κ.
  if (!Number.isFinite(kappa) || kappa < 0) throw new RangeError("Kappa must be finite and nonnegative");
  const current = inputs.current;
  if (current && (current.mind !== inputs.mind || current.t > t)) throw new RangeError("Current intention must belong to this mind and not the future");
  const currentIndex = current?.status === "active"
    ? candidates.findIndex(({ candidate }) => candidate.action === current.action && candidate.target === current.target) : -1;
  const maximum = candidates.reduce((max, candidate) => Math.max(max, candidate.expectedUtility), -Infinity);
  const advantage = currentIndex < 0 ? undefined : maximum - candidates[currentIndex].expectedUtility;
  // DESIGN §10 explicitly requires κ=0 to re-choose, including equal-EU ties (boundary convention).
  const kept = kappa > 0 && advantage !== undefined && advantage <= kappa;
  let draw: number | undefined;
  let index = currentIndex;
  let counters = inputs.counters;
  let intention: Intention;
  if (kept) {
    intention = current!;
  } else {
    draw = stream();
    if (!Number.isFinite(draw) || draw < 0 || draw >= 1) throw new RangeError("Stream draw must be in [0,1)");
    let cumulative = 0;
    // Rounding fallback is the last positive-probability entry, never a zero-mass tail.
    index = probabilities.length - 1;
    while (probabilities[index] === 0) index--;
    for (let i = 0; i < probabilities.length; i++) {
      cumulative += probabilities[i];
      if (draw < cumulative) { index = i; break; }
    }
    const chosen = candidates[index];
    const minted = mint(counters, "int");
    counters = minted.counters;
    intention = { id: minted.id, mind: inputs.mind, action: chosen.candidate.action, target: chosen.candidate.target,
      ...(chosen.candidate.terms === undefined ? {} : { terms: chosen.candidate.terms }),
      ...(chosen.ratioMin === undefined ? {} : { terms: { ...chosen.candidate.terms,
        ratioMin: chosen.ratioMin, giveUnits: chosen.candidate.exchange!.give.units } }),
      t, expectedOutcomes: chosen.expectedOutcomes, status: "active" };
  }
  const trace: SelectionTrace = {
    ...(evaluation.ineligible === undefined ? {} : { ineligible: evaluation.ineligible }),
    mind: inputs.mind, t, beliefs: view.beliefs, needs: view.needs, params: view.params, intention,
    candidates: candidates.map((candidate, i) => ({ ...candidate, softmaxProbability: probabilities[i],
      probability: kept ? (i === index ? 1 : 0) : probabilities[i] })),
    inputs: { generation, episodes: evaluation.episodes, context: evaluation.context, previousIntention: current },
    commitment: { kappa, kept, advantage }, draw,
  };
  return { intention, trace: withOperations(trace, evaluation.operations ?? []), counters };
}
