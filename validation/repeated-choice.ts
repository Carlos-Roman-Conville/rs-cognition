import { simTime, streams } from "@rex/kernel";
import type { Counters } from "@rex/kernel";
import { categorical } from "../src/beliefs.ts";
import { evaluateActions } from "../src/evaluate.ts";
import { encodeEpisode } from "../src/memory.ts";
import { selectAction } from "../src/select.ts";
import { DEFAULT_COGNITIVE_PARAMS } from "../src/types.ts";
import type { Candidate, Episode, MindView } from "../src/types.ts";
import type { GenerationResult } from "../src/actions.ts";

export interface Problem {
  set: string; id: number; H: number; pH: number; L: number; M: number; humanRiskRate: number;
}
export const PROTOCOL = Object.freeze({ participants: 200, trials: 100, epochMs: 1000, seed: 2671 });

// Proposed host monetary appraisal: value 100 * delta progress = displayed Sheqels.
// Reset the reference point each trial; this goal is a utility ruler, not a wealth simulation.
export const choiceView: MindView = {
  beliefs: { entries: [] }, needs: { needs: [], goals: [{ id: "payoff", value: 100, progress: 0.5 }] },
  params: DEFAULT_COGNITIVE_PARAMS,
};

/** Subjective support is learned from chosen feedback only; unknown options begin at a zero-payoff prior. */
export function experienceCandidates(episodes: readonly Episode[]): GenerationResult {
  const candidates: Candidate[] = ["A", "B"].map((action) => {
    const rewards = [0]; // Proposed neutral subjective prior, same for both unlabelled buttons.
    for (const episode of episodes) {
      if (episode.action === action && !rewards.includes(episode.reward)) rewards.push(episode.reward);
    }
    return { action, targetKind: "button", domain: "none", duration: 1, cost: 0,
      capacityRequired: 0, preconditions: [],
      effects: rewards.map((reward) => ({ id: String(reward), deficits: {}, goalProgress: { payoff: 0.5 + reward / 100 } })),
      outcomes: categorical(rewards.map(String), rewards.map((_, i) => i === 0 ? 1 : 0)) };
  });
  // Binary forced-choice experiment has no third wait action; call evaluation/selection directly.
  return { candidates, params: { kappa: DEFAULT_COGNITIVE_PARAMS.kappa }, thetaPre: 0.5,
    capacityFunctional: 1, checks: [] };
}

export function simulateProblem(problem: Problem, participants: number = PROTOCOL.participants) {
  if (!Number.isSafeInteger(participants) || participants < 2 ||
      ![problem.H, problem.L, problem.M, problem.pH, problem.humanRiskRate].every(Number.isFinite) ||
      problem.H < problem.L || problem.pH < 0 || problem.pH > 1 ||
      problem.humanRiskRate < 0 || problem.humanRiskRate > 1 ||
      Math.max(Math.abs(problem.H), Math.abs(problem.L), Math.abs(problem.M)) > 50) {
    throw new RangeError("Invalid TPT problem or cohort");
  }
  const individualRates: number[] = [];
  const trialRates = Array<number>(PROTOCOL.trials).fill(0);
  for (let participant = 0; participant < participants; participant++) {
    const mind = `validation/${problem.set}/${problem.id}/mind.${String(participant + 1).padStart(4, "0")}`;
    const rng = streams(PROTOCOL.seed);
    const decision = rng.get("cognition.decision.select", mind);
    const feedback = rng.get("validation.tpt.feedback", mind);
    let counters: Counters = {};
    const episodes: Episode[] = [];
    let riskyChoices = 0;
    for (let trial = 0; trial < PROTOCOL.trials; trial++) {
      const t = simTime(trial * PROTOCOL.epochMs);
      const evaluation = evaluateActions(experienceCandidates(episodes), choiceView, episodes, {}, t);
      const selected = selectAction(evaluation, { mind, counters }, decision);
      counters = selected.counters;
      // Counterbalance buttons. World payoffs and pH are used only AFTER the intention is selected.
      const riskyButton = participant % 2 === 0 ? "A" : "B";
      const risky = selected.intention.action === riskyButton;
      const draw = feedback(); // one host draw per trial, isolated from the decision stream
      const observedPayoff = risky ? (draw < problem.pH ? problem.H : problem.L) : problem.M;
      riskyChoices += Number(risky);
      trialRates[trial] += Number(risky) / participants;
      const chosen = evaluation.candidates.find((c) => c.candidate.action === selected.intention.action)!;
      // DESIGN §2.3: encode the chosen, displayed payoff. No forgone feedback or true lottery in memory.
      const encoded = encodeEpisode({ t, action: selected.intention.action, context: {},
        outcome: String(observedPayoff), reward: observedPayoff,
        predictionError: observedPayoff - chosen.expectedUtility, attributedCause: "chance", domain: "none" }, counters);
      episodes.push(encoded.episode);
      counters = encoded.counters;
    }
    individualRates.push(riskyChoices / PROTOCOL.trials);
  }
  const modelRiskRate = individualRates.reduce((a, b) => a + b, 0) / participants;
  // Monte Carlo SE clusters 100 correlated choices within a simulated participant.
  const monteCarloSE = Math.sqrt(individualRates.reduce((sum, r) => sum + (r - modelRiskRate) ** 2, 0) /
    (participants * (participants - 1)));
  return { set: problem.set, id: problem.id, humanRiskRate: problem.humanRiskRate,
    modelRiskRate, monteCarloSE, squaredDeviation: (modelRiskRate - problem.humanRiskRate) ** 2,
    trialRates };
}

export function summarizeProblems(rows: readonly ReturnType<typeof simulateProblem>[]) {
  if (rows.length === 0) throw new RangeError("Cannot score an empty set");
  const mean = (values: readonly number[]) => values.reduce((a, b) => a + b, 0) / values.length;
  const meanModelRiskRate = mean(rows.map((r) => r.modelRiskRate));
  const meanHumanRiskRate = mean(rows.map((r) => r.humanRiskRate));
  const meanModelMonteCarloSE = Math.sqrt(rows.reduce((sum, r) => sum + r.monteCarloSE ** 2, 0)) / rows.length;
  const differences = rows.map((r) => Math.abs(r.modelRiskRate - r.humanRiskRate));
  return { problems: rows.length, meanModelRiskRate, meanHumanRiskRate, meanModelMonteCarloSE,
    problemMSD: mean(rows.map((r) => r.squaredDeviation)),
    // Published proportions have two decimal places. Worst-case rounding bounds, not confidence intervals.
    problemMSDRoundingBounds: [mean(differences.map((d) => Math.max(0, d - 0.005) ** 2)),
      mean(differences.map((d) => (d + 0.005) ** 2))],
    // Jensen's inequality: trial-averaged MSD >= squared overall mean error. Allows a one-sided
    // diagnostic against G&D's TRIAL-level score without inventing missing human trajectories.
    trialMSDLowerBoundAllowingRounding: Math.max(0, Math.abs(meanModelRiskRate - meanHumanRiskRate) - 0.005) ** 2 };
}
