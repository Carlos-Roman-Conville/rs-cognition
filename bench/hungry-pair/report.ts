import { canonical } from "@rex/kernel";
import { writeFileSync } from "node:fs";
import { isMainThread, parentPort, Worker, workerData } from "node:worker_threads";
import { evaluateActions, softmax } from "../../src/index.ts";
import type { CognitiveParams, Episode, LearningTrace, SelectionTrace } from "../../src/index.ts";
import { cognitiveParams, VISITOR_REPERTOIRE } from "./models.ts";
import { FIXTURE, runHungryPair } from "./world.ts";
import type { Outcome } from "./world.ts";
import { basicChecks } from "./acceptance.ts";

export type Run = ReturnType<typeof runHungryPair>;
// Proposed experiment settings, not calibrated model defaults. DESIGN §6 permits shorter
// acceptance runs for runtime; keep its seed counts intact. Two epochs include feedback.
export const EPOCHS = 2;
export const SYMMETRY_SEEDS = 500;
export const COMPARISON_SEEDS = 200;
export const DIMENSIONS = {
  beta: 4, lambda: 4.5, gamma: 0.8, eta: 0.25, alpha0: 4,
  d: 0.9, tau: 1, s: 0.8, kappa: 0.5, k: 1,
} satisfies Partial<CognitiveParams>;
export type Dimension = keyof typeof DIMENSIONS;
export const ACTIONS = [...VISITOR_REPERTOIRE.map((row) => row.id), "wait"];
const visitor = (mind: string) => !mind.endsWith("mind.0003");
const entropy = (p: readonly number[]) => -p.reduce((sum, value) => sum + (value > 0 ? value * Math.log(value) : 0), 0);

/** DESIGN §2.3/CB-7 d probe: same subjective context, one early bad episode,
 * evaluated one fixture day later. Total variation measures its effect on choice.
 * This is a controlled memory probe, NOT a claim about a two-epoch world's late behavior. */
export function earlyLossEffect(trace: SelectionTrace): number {
  const action = trace.candidates.find((row) => row.candidate.action === "fight")!;
  const episode: Episode = { id: "ep.probe", t: trace.t, retrievals: [], context: trace.inputs.context,
    action: action.candidate.action, outcome: "bad", reward: -1, predictionError: -1,
    attributedCause: "chance", domain: "body" };
  const view = { beliefs: trace.beliefs, needs: trace.needs, params: trace.params };
  const evaluate = (episodes: Episode[]) => evaluateActions(trace.inputs.generation, view, episodes,
    trace.inputs.context, trace.t + FIXTURE.dayMs).candidates.map((row) => row.expectedUtility);
  const baseline = softmax(evaluate([]), view.params.beta);
  return softmax(evaluate([episode]), view.params.beta).reduce((sum, p, i) => sum + Math.abs(p - baseline[i]), 0) / 2;
}

export function summarize(run: Run): Record<string, number> {
  const decisions = run.decisions.filter((row) => visitor(row.mind));
  const outcomes = run.outcomes.map((event) => event.payload as Outcome).filter((row) => visitor(row.mind));
  const result: Record<string, number> = Object.fromEntries(ACTIONS.map((action) =>
    [`action:${action}`, decisions.filter((row) => row.intention.action === action).length / decisions.length]));
  for (const outcome of ["good", "bad", "unfinished"]) result[`outcome:${outcome}`] =
    outcomes.filter((row) => row.result === outcome).length / outcomes.length;
  result.entropy = decisions.reduce((sum, row) => sum + entropy(row.candidates.map((c) => c.softmaxProbability)), 0) / decisions.length;
  let switches = 0;
  let opportunities = 0;
  const previous = new Map<string, string>();
  for (const row of decisions) {
    const key = `${row.intention.action}:${row.intention.target}`;
    if (previous.has(row.mind)) { opportunities++; switches += Number(previous.get(row.mind) !== key); }
    previous.set(row.mind, key);
  }
  result.switches = opportunities ? switches / opportunities : 0;
  result.hunger = run.final.bodies.filter((body) => body.role === "visitor").reduce((sum, body) => sum + body.hunger, 0) / 2;
  result.pain = run.final.bodies.filter((body) => body.role === "visitor").reduce((sum, body) => sum + body.pain, 0) / 2;
  result.earlyLossEffect = earlyLossEffect(decisions[0]);
  return result;
}

export interface SeedResult {
  seed: number;
  baseline: Record<string, number>;
  counts: number[][];
  sequence: string;
  changed?: Record<Dimension, Record<string, number>>;
  learning?: { eligible: boolean; diverged: boolean; beforeOutcomeDiffers: boolean };
}

export function runSeed(seed: number, epochs = EPOCHS): SeedResult {
  const baseline = runHungryPair({ seed, epochs });
  const result: SeedResult = { seed, baseline: summarize(baseline),
    counts: ["mind.0001", "mind.0002"].map((mind) => ACTIONS.map((action) => baseline.decisions
      .filter((row) => row.mind.endsWith(mind) && row.intention.action === action).length)),
    sequence: canonical(baseline.decisions.filter((row) => visitor(row.mind)).map((row) => row.intention.action)) };
  if (seed <= COMPARISON_SEEDS) {
    result.changed = Object.fromEntries(Object.entries(DIMENSIONS).map(([dimension, value]) =>
      [dimension, summarize(runHungryPair({ seed, epochs, params: { [dimension]: value } }))])) as SeedResult["changed"];
    const frozen = runHungryPair({ seed, epochs, params: { eta: 0 }, encode: false });
    const informative = baseline.attributions.map((event) => event.payload as LearningTrace)
      .filter((trace) => trace.updates.some((update) => Number(update.kl) > 0));
    const first = Math.min(...informative.map((trace) => trace.t));
    // Compare selected actions, never parameter/diagnostic fields that differ by construction.
    const choices = (run: Run, after: boolean) => run.decisions.filter((row) => after ? row.t > first : row.t <= first)
      .map((row) => [row.mind, row.t, row.intention.action, row.intention.target]);
    result.learning = { eligible: baseline.decisions.some((row) => row.t > first),
      diverged: canonical(choices(baseline, true)) !== canonical(choices(frozen, true)),
      beforeOutcomeDiffers: canonical(choices(baseline, false)) !== canonical(choices(frozen, false)) };
  }
  return result;
}

/** Seed is the independent sampling unit: A/B and epochs are clustered within seed.
 * Proposed normal/t approximation: t(.975,199)=1.972; paired intervals use per-seed
 * differences. These are sampling intervals for this simulator, never validation. */
export function interval(values: readonly number[]) {
  if (values.length < 2) throw new RangeError("An interval needs at least two seeds");
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (values.length - 1);
  const half = 1.972 * Math.sqrt(variance / values.length);
  return { mean, low: mean - half, high: mean + half };
}

// Pearson chi-square survival Q(df/2, statistic/2), evaluated by the gamma
// series/continued fraction (standard incomplete-gamma identities). No fitted cutoff.
function logGamma(x: number): number {
  const coefficients = [676.5203681218851, -1259.1392167224028, 771.3234287776531,
    -176.6150291621406, 12.507343278686905, -0.13857109526572012, 9.984369578019572e-6, 1.5056327351493116e-7];
  x--;
  let sum = 0.9999999999998099;
  for (let i = 0; i < coefficients.length; i++) sum += coefficients[i] / (x + i + 1);
  const t = x + 7.5;
  return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(sum);
}
export function chiSquareSurvival(statistic: number, df: number): number {
  if (statistic === 0) return 1;
  if (statistic < 0 || df <= 0) throw new RangeError("Invalid chi-square parameters");
  const a = df / 2, x = statistic / 2;
  const factor = Math.exp(-x + a * Math.log(x) - logGamma(a));
  if (x < a + 1) {
    let term = 1 / a, sum = term;
    for (let n = 1; n < 1000; n++) { term *= x / (a + n); sum += term; if (term < sum * 1e-14) break; }
    return Math.max(0, Math.min(1, 1 - sum * factor));
  }
  let b = x + 1 - a, c = 1e300, d = 1 / b, h = d;
  for (let n = 1; n < 1000; n++) {
    const an = -n * (n - a); b += 2;
    d = an * d + b; if (Math.abs(d) < 1e-300) d = 1e-300;
    c = b + an / c; if (Math.abs(c) < 1e-300) c = 1e-300;
    d = 1 / d; const delta = d * c; h *= delta;
    if (Math.abs(delta - 1) < 1e-14) break;
  }
  return Math.max(0, Math.min(1, factor * h));
}
export function symmetry(rows: readonly SeedResult[]) {
  const counts = [0, 1].map((mind) => ACTIONS.map((_, action) => rows.reduce((sum, row) => sum + row.counts[mind][action], 0)));
  const totals = counts.map((row) => row.reduce((sum, n) => sum + n, 0));
  let statistic = 0, columns = 0, minimumExpected = Infinity;
  for (let action = 0; action < ACTIONS.length; action++) {
    const total = counts[0][action] + counts[1][action];
    if (!total) continue;
    columns++;
    for (let mind = 0; mind < 2; mind++) {
      const expected = total * totals[mind] / (totals[0] + totals[1]);
      minimumExpected = Math.min(minimumExpected, expected);
      statistic += (counts[mind][action] - expected) ** 2 / expected;
    }
  }
  return { counts, statistic, df: columns - 1, p: chiSquareSurvival(statistic, columns - 1), minimumExpected };
}

export async function collectStudy(epochs = EPOCHS, workers = 8): Promise<SeedResult[]> {
  const pool: Worker[] = [];
  try {
    const results = await Promise.all(Array.from({ length: workers }, (_, index) => new Promise<SeedResult[]>((resolve, reject) => {
      const seeds = Array.from({ length: SYMMETRY_SEEDS }, (_, i) => i + 1).filter((_, i) => i % workers === index);
      const worker = new Worker(new URL("./report.ts", import.meta.url), {
        workerData: { seeds, epochs }, execArgv: ["--experimental-strip-types"],
      });
      pool.push(worker);
      let delivered = false;
      worker.on("message", (result) => { delivered = true; resolve(result as SeedResult[]); });
      worker.on("error", reject);
      worker.on("exit", (code) => { if (!delivered || code !== 0) reject(new Error(`Study worker exited ${code}`)); });
    })));
    return results.flat().sort((a, b) => a.seed - b.seed);
  } finally { await Promise.all(pool.map((worker) => worker.terminate())); }
}

export function comparison(rows: readonly SeedResult[], dimension: Dimension, metric: string) {
  const pairs = rows.filter((row) => row.changed);
  return { baseline: interval(pairs.map((row) => row.baseline[metric])),
    changed: interval(pairs.map((row) => row.changed![dimension][metric])),
    difference: interval(pairs.map((row) => row.changed![dimension][metric] - row.baseline[metric])) };
}
export function divergence(rows: readonly SeedResult[]) {
  const pairs = rows.filter((row) => row.learning);
  const eligible = pairs.filter((row) => row.learning!.eligible);
  const count = eligible.filter((row) => row.learning!.diverged).length;
  if (eligible.length === 0) throw new RangeError("No seeds have decisions after informative feedback");
  // Wilson score interval for the binomial seed-level divergence share, z=.975 quantile.
  const n = eligible.length, z = 1.959963984540054, p = n ? count / n : 0;
  const center = (p + z * z / (2 * n)) / (1 + z * z / n);
  const half = z * Math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / (1 + z * z / n);
  return { pairs: pairs.length, eligible: n, count, share: p, low: center - half, high: center + half,
    beforeOutcomeDiffers: pairs.filter((row) => row.learning!.beforeOutcomeDiffers).length };
}

const number = (value: number) => value !== 0 && Math.abs(value) < 0.00001 ? value.toExponential(3) : value.toFixed(5);
const format = (value: ReturnType<typeof interval>) => `${number(value.mean)} [${number(value.low)}, ${number(value.high)}]`;
export function renderReport(rows: readonly SeedResult[], seconds: number, checks: readonly string[] = []) {
  const symmetryResult = symmetry(rows), learning = divergence(rows);
  const directions = [["lambda", "action:fight"], ["lambda", "action:steal"], ["beta", "entropy"],
    ["kappa", "switches"], ["d", "earlyLossEffect"]] as const;
  const failed = checks.some((check) => check.includes(": FAIL")) || seconds >= 60 || symmetryResult.p <= 0.01 ||
    directions.some(([dimension, metric]) => comparison(rows, dimension, metric).difference.mean >= 0);
  const status = failed ? "**parked**: acceptance failures remain; see HANDOFF.md Blocked. The suite keeps the requirements as failing assertions."
    : "Numerical checks passed; independent CB-6b source audit is still required before acceptance can be claimed.";
  const lines = ["# Hungry-pair acceptance report", "", `Status: ${status}`, "", "Verification only; no claim of independent validation.", "",
    `Protocol: seeds 1–${SYMMETRY_SEEDS} for CB-6; seeds 1–${COMPARISON_SEEDS} for every CB-7 dimension and CB-5b.`,
    `Each world uses ${EPOCHS} ten-minute epochs instead of 144 to reduce runtime. All runs include Scheduler, EventBus, named streams, initial-snapshot Runner replay and host replay.`,
    `Study wall time: ${seconds.toFixed(2)} s (${seconds < 60 ? "within" : "OVER"} the 60 s suite budget even before diagnostic tests). Two epochs cannot test completed six-epoch journeys or one-day behavior.`,
    "CB-7's late-loss metric is a separate fixed-context early-loss probe at +1 day, not a completed one-day world run.",
    "Paired worlds share seed and per-mind stream names. Conditional draws can desynchronize after histories diverge.", "",
    "## CB-1 through CB-7 and P7-3", "", ...checks.map((check) => `- ${check}`),
    "- CB-1: every study world restores the initial snapshot and replays cognition and host logs; direct repeated-seed and stream-isolation assertions are in the acceptance suite.",
    "- CB-2, CB-3, CB-4, CB-5a: the acceptance suite checks distributions/draws, causal outcomes, informative likelihood directions, and every negative prediction error in its diagnostic runs. Failures are not converted to expected failures.",
    `- CB-5b: ${learning.count}/${learning.eligible} eligible seeds diverged in later selected actions (${learning.pairs} pairs); share ${learning.share.toFixed(5)}, Wilson 95% interval [${learning.low.toFixed(5)}, ${learning.high.toFixed(5)}].`,
    `  ${learning.beforeOutcomeDiffers} pairs already differed by the first informative outcome: eta=0 also freezes sensory belief updates, so this contrast does not isolate outcome learning alone.`,
    `- CB-6a: Pearson chi-square=${symmetryResult.statistic.toFixed(5)}, df=${symmetryResult.df}, p=${symmetryResult.p.toFixed(6)}; required p>0.01. Minimum expected cell=${symmetryResult.minimumExpected.toFixed(2)}.`,
    "  Action counts pool repeated epochs within seeds as DESIGN specifies; that chi-square p-value is descriptive because the repeated choices and A/B interaction are dependent. Exact ID-swap is a separate assertion.",
    "- CB-6b: independent Haiku source audit remains with the designated check unit; no subagents were run. The acceptance suite includes a limited literal-ID branch guard, not a substitute for that audit.",
    `- CB-6c: ${new Set(rows.map((row) => row.sequence)).size} distinct default action sequences across ${rows.length} seeds.`,
    "- CB-7: all ten theta dimensions from DESIGN §3 appear below. Shared drive exponents n,m are held fixed; they are not theta dimensions.",
    "- P7-3: the suite swaps only pertinence; other hooks remain the null model's identical functions.", "",
    "## CB-7 paired comparisons", "",
    "Each entry is mean [95% interval]. Frequencies count visitor A/B decisions (including retained intentions); outcome fractions count their emitted causal receipts, including unfinished censoring. Hunger and pain are final visitor averages. Entropy uses the pre-commitment Luce distribution in nats; switches count action/target changes between epochs.",
    "The seed is the independent unit: intervals use the 200 seed-level means and t=1.972. Difference intervals use paired seed differences. Intervals are pointwise, approximate, and not corrected for multiple comparisons; zero variance is reported honestly.", ""];
  for (const dimension of Object.keys(DIMENSIONS) as Dimension[]) {
    lines.push(`### ${dimension}: ${cognitiveParams()[dimension]} → ${DIMENSIONS[dimension]}`, "",
      "| Metric | Baseline | Changed | Paired difference |", "| --- | --- | --- | --- |");
    for (const metric of Object.keys(rows[0].baseline)) {
      const values = comparison(rows, dimension, metric);
      lines.push(`| ${metric} | ${format(values.baseline)} | ${format(values.changed)} | ${format(values.difference)} |`);
    }
    lines.push("");
  }
  lines.push("### Direction assertions", "");
  for (const [dimension, metric] of directions) {
    const change = comparison(rows, dimension, metric).difference;
    lines.push(`- ${dimension} / ${metric}: ${change.mean < 0 ? "PASS" : "FAIL"}, paired change ${format(change)}; strict decrease required.`);
  }
  lines.push("");
  lines.push("## What this does not show", "",
    "DESIGN §10 V5: no independent data exist for this scene; none are in hand. The CB-7 directions are consequences of the formulas, not validation of how real hungry people choose. Closed-loop feedback and shared resources can also defeat a monotonic direction inferred from a single fixed-context formula. A failed direction is reported, not repaired by choosing favorable seeds.",
    "The experiment that would test the scene is a laboratory scarcity game with a stronger owner, using dictator/ultimatum and theft-option designs in experimental economics. Compare preregistered action frequencies, outcomes and learning trajectories against held-out human data. This report contains no such data or validation tolerance.",
    "No sibling repository was changed or tested under the folder-only instruction. Kernel is exercised through the linked public package. Reality, Settlement, Economy and pirate-ship integration remain outside this fixture's evidence.", "",
    "Regenerate: `node --experimental-strip-types bench/hungry-pair/report.ts`. Run acceptance: `npx vitest run test/bench-acceptance.test.ts`.", "");
  return lines.join("\n");
}

if (!isMainThread) {
  parentPort!.postMessage(workerData.seeds.map((seed) => runSeed(seed, workerData.epochs)));
} else if ((import.meta as ImportMeta & { main?: boolean }).main) {
  const start = performance.now();
  const rows = await collectStudy();
  const seconds = (performance.now() - start) / 1000;
  const checks = basicChecks().map((check) => `${check.id}: ${check.failures ? "FAIL" : "PASS"} (${check.failures}/${check.cases} assertions failed). ${check.examples.join("; ")}`.trimEnd());
  writeFileSync(new URL("./REPORT.md", import.meta.url), renderReport(rows, seconds, checks));
}
