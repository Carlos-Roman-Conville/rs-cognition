// C-B2 / COG-19: verification of DESIGN §2.4, with subjective context held fixed.
import { evaluateActions, softmax } from "../../src/index.ts";
import type { Evaluation, SelectionTrace } from "../../src/index.ts";
import type { Check } from "./acceptance.ts";

const near = (a: number, b: number) => Math.abs(a - b) <= 1e-10 * Math.max(1, Math.abs(a), Math.abs(b));
/** Positive magnitude L; the signed sum in DESIGN is -L. */
export const expectedLoss = (candidate: Evaluation) => -candidate.discount * candidate.outcomes.reduce(
  (sum, outcome) => sum + outcome.probability * Math.min(0, outcome.netReward), 0);

export function lambdaProbe(trace: SelectionTrace, low = 2.25, high = 4.5) {
  if (!(high > low)) throw new RangeError("Lambda probe needs high > low");
  const evaluate = (lambda: number) => evaluateActions(trace.inputs.generation,
    { beliefs: trace.beliefs, needs: trace.needs, params: { ...trace.params, lambda } },
    trace.inputs.episodes, trace.inputs.context, trace.t).candidates;
  const baseline = evaluate(low), changed = evaluate(high);
  const losses = baseline.map(expectedLoss);
  const before = softmax(baseline.map((row) => row.expectedUtility), trace.params.beta);
  const after = softmax(changed.map((row) => row.expectedUtility), trace.params.beta);
  return { baseline, changed, losses, before, after, low, high };
}

export interface LambdaChecks {
  decisions: number;
  candidates: number;
  strict: number;
  equal: number;
  maxError: number;
  check: Check;
}
export function lambdaChecks(traces: readonly SelectionTrace[], label: string): LambdaChecks {
  const result: LambdaChecks = { decisions: traces.length, candidates: 0, strict: 0, equal: 0, maxError: 0,
    check: { id: "CB-7 lambda fixed context", cases: 0, failures: 0, examples: [] } };
  const record = (pass: boolean, detail: string) => {
    result.check.cases++;
    if (!pass) {
      result.check.failures++;
      if (result.check.examples.length < 3) result.check.examples.push(`${label}: ${detail}`);
    }
  };
  for (const trace of traces) {
    const probe = lambdaProbe(trace);
    const { baseline, changed, losses, before, after, low, high } = probe;
    const maximum = Math.max(...losses), minimum = Math.min(...losses);
    for (let i = 0; i < baseline.length; i++) {
      result.candidates++;
      const delta = changed[i].expectedUtility - baseline[i].expectedUtility;
      const expected = -(high - low) * losses[i];
      result.maxError = Math.max(result.maxError, Math.abs(delta - expected));
      record(near(delta, expected) && baseline[i].interpret.lambda === low && changed[i].interpret.lambda === high,
        `${trace.mind} t=${trace.t} ${baseline[i].candidate.action}: delta EU=${delta}, expected=${expected}, loss=${losses[i]}`);
      if (losses[i] !== maximum) continue;
      // Luce: dP_i/dλ = -β P_i (L_i - Σ_j P_j L_j). Every maximum loses
      // probability when β>0 and losses differ; equal losses/β=0 leave P unchanged.
      const strict = trace.params.beta > 0 && maximum > minimum;
      if (strict) result.strict++; else result.equal++;
      record(strict ? after[i] < before[i] : near(after[i], before[i]),
        `${trace.mind} t=${trace.t} maximum-loss ${baseline[i].candidate.action}: L=${maximum}, min L=${minimum}, P=${before[i]} -> ${after[i]}, beta=${trace.params.beta}`);
    }
  }
  return result;
}

export function mergeLambdaChecks(results: readonly LambdaChecks[]): LambdaChecks {
  return {
    decisions: results.reduce((sum, row) => sum + row.decisions, 0),
    candidates: results.reduce((sum, row) => sum + row.candidates, 0),
    strict: results.reduce((sum, row) => sum + row.strict, 0),
    equal: results.reduce((sum, row) => sum + row.equal, 0),
    maxError: Math.max(0, ...results.map((row) => row.maxError)),
    check: { id: "CB-7 lambda fixed context", cases: results.reduce((sum, row) => sum + row.check.cases, 0),
      failures: results.reduce((sum, row) => sum + row.check.failures, 0),
      examples: results.flatMap((row) => row.check.examples).slice(0, 3) },
  };
}

export interface FightPoint {
  loss: number;
  alternatives: number;
  movingAlternatives: number;
  before: number;
  after: number;
  kept: boolean;
  sameDrawFight: boolean;
}
/** Diagnose every visitor fight choice, including retained intentions, in the paired worlds. */
export function fightPoints(traces: readonly SelectionTrace[]): FightPoint[] {
  return traces.filter((trace) => !trace.mind.endsWith("mind.0003") && trace.intention.action === "fight").map((trace) => {
    const { baseline, losses, before, after } = lambdaProbe(trace);
    const index = baseline.findIndex((row) => row.candidate.action === trace.intention.action && row.candidate.target === trace.intention.target);
    const lower = after.slice(0, index).reduce((sum, p) => sum + p, 0);
    return { loss: losses[index], alternatives: before.filter((p, i) => i !== index && p > 0).length,
      movingAlternatives: before.filter((p, i) => i !== index && Math.abs(p - after[i]) > 1e-12).length,
      before: before[index], after: after[index], kept: trace.commitment.kept,
      sameDrawFight: trace.draw !== undefined && trace.draw >= lower && trace.draw < lower + after[index] };
  });
}
