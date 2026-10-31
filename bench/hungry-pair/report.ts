import { canonical } from "@rex/kernel";
import { execFileSync } from "node:child_process";
import { reportErrors, sourceHash } from "./report-integrity.ts";
import type { Check } from "./acceptance.ts";
import { writeFileSync } from "node:fs";
import { isMainThread, parentPort, Worker, workerData } from "node:worker_threads";
import { evaluateActions, softmax } from "../../src/index.ts";
import type { CognitiveParams, Episode, LearningTrace, SelectionTrace } from "../../src/index.ts";
import { cognitiveParams, VISITOR_REPERTOIRE } from "./models.ts";
import { FIXTURE, runHungryPair } from "./world.ts";
import type { Outcome } from "./world.ts";
import { basicChecks } from "./acceptance.ts";
import { fightPoints, lambdaChecks, mergeLambdaChecks } from "./lambda.ts";
import type { FightPoint, LambdaChecks } from "./lambda.ts";

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
  result["action:fight+steal"] = result["action:fight"] + result["action:steal"];
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
  recordedDecisions: number;
  lambda: LambdaChecks;
  fights?: { baseline: FightPoint[]; changed: FightPoint[]; lost: number; gained: number };
  changed?: Record<Dimension, Record<string, number>>;
  learning?: { eligible: boolean; diverged: boolean; beforeOutcomeDiffers: boolean };
}

export function runSeed(seed: number, epochs = EPOCHS): SeedResult {
  const baseline = runHungryPair({ seed, epochs });
  const result: SeedResult = { seed, baseline: summarize(baseline),
    counts: ["mind.0001", "mind.0002"].map((mind) => ACTIONS.map((action) => baseline.decisions
      .filter((row) => row.mind.endsWith(mind) && row.intention.action === action).length)),
    sequence: canonical(baseline.decisions.filter((row) => visitor(row.mind)).map((row) => row.intention.action)),
    recordedDecisions: baseline.decisions.length,
    lambda: lambdaChecks(baseline.decisions, `seed ${seed} baseline`) };
  if (seed <= COMPARISON_SEEDS) {
    result.changed = Object.fromEntries(Object.entries(DIMENSIONS).map(([dimension, value]) => {
      const run = runHungryPair({ seed, epochs, params: { [dimension]: value } });
      result.recordedDecisions += run.decisions.length;
      result.lambda = mergeLambdaChecks([result.lambda, lambdaChecks(run.decisions, `seed ${seed} ${dimension}`)]);
      if (dimension === "lambda") {
        const before = baseline.decisions.filter((row) => visitor(row.mind));
        const after = run.decisions.filter((row) => visitor(row.mind));
        result.fights = { baseline: fightPoints(before), changed: fightPoints(after),
          lost: before.filter((row, i) => row.intention.action === "fight" && after[i].intention.action !== "fight").length,
          gained: before.filter((row, i) => row.intention.action !== "fight" && after[i].intention.action === "fight").length };
      }
      return [dimension, summarize(run)];
    })) as SeedResult["changed"];
    const frozen = runHungryPair({ seed, epochs, params: { eta: 0 }, encode: false });
    result.recordedDecisions += frozen.decisions.length;
    result.lambda = mergeLambdaChecks([result.lambda, lambdaChecks(frozen.decisions, `seed ${seed} frozen`)]);
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
export function studyVerdicts(rows: readonly SeedResult[], checks: readonly Check[]): Check[] {
  const result = [...checks];
  const add = (id: string, pass: boolean, numbers: string, cases = 1) =>
    result.push({ id, failures: pass ? 0 : 1, cases, examples: [numbers] });
  const learning = divergence(rows), sym = symmetry(rows);
  add("CB-5b", learning.pairs >= COMPARISON_SEEDS && learning.eligible === learning.pairs && learning.count > 0,
    `${learning.count}/${learning.eligible} diverged; pairs=${learning.pairs}; Wilson=[${learning.low},${learning.high}]`, learning.pairs);
  add("CB-6a symmetry", rows.length >= SYMMETRY_SEEDS && sym.minimumExpected >= 5 && sym.df === ACTIONS.length - 1 && sym.p > 0.01,
    `seeds=${rows.length}; chi-square=${sym.statistic}; df=${sym.df}; p=${sym.p}; min expected=${sym.minimumExpected}`, rows.length);
  add("CB-6c", new Set(rows.map((row) => row.sequence)).size > 1,
    `distinct sequences=${new Set(rows.map((row) => row.sequence)).size}`, rows.length);
  // COG-18: CB-6b is certified by unit 2672's CHECK.md, outside this verdict.
  const lambda = mergeLambdaChecks(rows.map((row) => row.lambda));
  result.push(lambda.check);
  add("CB-7 lambda coverage", rows.every((row) => row.lambda.decisions > 0 && row.lambda.decisions === row.recordedDecisions) && lambda.candidates > 0 && lambda.strict > 0,
    `all ${lambda.decisions} recorded study decisions; ${lambda.candidates} candidates; ${lambda.strict} strict and ${lambda.equal} equal-probability maxima; max EU residual=${lambda.maxError}`);
  for (const [dimension, metric] of DIRECTIONS) {
    const values = comparison(rows, dimension, metric), change = values.difference;
    add(`CB-7 ${dimension}`, change.mean < 0 &&
      (dimension !== "d" || values.baseline.mean > 0),
      `${dimension}/${metric}: difference=${format(change)}`);
  }
  for (const dimension of Object.keys(DIMENSIONS) as Dimension[]) {
    const pairs = rows.filter((row) => row.changed?.[dimension]);
    add(`CB-7 ${dimension} sample`, pairs.length >= COMPARISON_SEEDS && pairs.every((row) =>
      [row.baseline, row.changed![dimension]].every((metrics) => Object.values(metrics).every(Number.isFinite) &&
        Math.abs(ACTIONS.reduce((sum, action) => sum + metrics[`action:${action}`], 0) - 1) < 1e-12 &&
        Math.abs(["good", "bad", "unfinished"].reduce((sum, outcome) => sum + metrics[`outcome:${outcome}`], 0) - 1) < 1e-12)),
    `${dimension} pairs=${pairs.length}`, pairs.length);
  }
  return result;
}
export const DIRECTIONS = [["beta", "entropy"],
  ["kappa", "switches"], ["d", "earlyLossEffect"]] as const;

export function renderReport(rows: readonly SeedResult[], seconds: number, checks: readonly Check[] = [],
  provenance = { commit: execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim(), source: sourceHash() }) {
  const symmetryResult = symmetry(rows), learning = divergence(rows);
  const directions = DIRECTIONS;
  const verdicts = studyVerdicts(rows, checks);
  const failed = verdicts.some((check) => check.failures > 0);
  const status = failed ? "**parked**: acceptance failures remain; see HANDOFF.md Blocked. Requirements remain failing assertions."
    : "All bench acceptance checks passed; CB-6b certification belongs to unit 2672's CHECK.md (COG-18).";
  const summary = Array.from({ length: 7 }, (_, i) => {
    const id = `CB-${i + 1}`;
    const group = verdicts.filter((row) => row.id.startsWith(id));
    const failures = group.reduce((sum, row) => sum + row.failures, 0);
    const cases = group.reduce((sum, row) => sum + row.cases, 0);
    return `Verdict ${id}: ${group.length > 0 && failures === 0 ? "PASS" : "FAIL"} (${failures}/${cases} assertions failed${id === "CB-6" ? "; covers (a) symmetry/ID swap and (c) sequence diversity only; (b) independent semantic audit is certified separately by unit 2672's CHECK.md" : ""})`;
  });
  const lines = ["# Hungry-pair acceptance report", "", `Status: ${status}`, "", "Verification only; no claim of independent validation.", "",
    `Git commit: ${provenance.commit}`,
    `Source SHA256: ${provenance.source}`,
    "The git commit is the base revision executed with the working source tree identified by SHA256 above.",
    `Seed count symmetry: ${rows.length}`,
    `Seed count paired-per-dimension: ${Math.min(...Object.keys(DIMENSIONS).map((dimension) => rows.filter((row) => row.changed?.[dimension as Dimension]).length))}`,
    `Seed count learning-frozen: ${learning.pairs}`, "", ...summary, "",
    `Protocol: seeds 1–${SYMMETRY_SEEDS} for CB-6; seeds 1–${COMPARISON_SEEDS} for every CB-7 dimension and CB-5b.`,
    "Diagnostic checks use two fixed seeds: 1 (two epochs) and 19 (eight epochs); exact ID swap uses seed 1. Vitest study smoke checks use 16 fixed seeds, 1–16.",
    `Each world uses ${EPOCHS} ten-minute epochs instead of 144 to reduce runtime. All runs include Scheduler, EventBus, named streams, initial-snapshot Runner replay and host replay.`,
    `Study wall time: ${seconds.toFixed(2)} s, outside vitest under C-B1. Two epochs cannot test completed six-epoch journeys or one-day behavior.`,
    "CB-7's late-loss metric is a separate fixed-context early-loss probe at +1 day, not a completed one-day world run.",
    "Paired worlds share seed and per-mind stream names. Conditional draws can desynchronize after histories diverge.", "",
    "## CB-1 through CB-7 and P7-3", "", ...verdicts.map((check) => `- ${check.id}: ${check.failures ? "FAIL" : "PASS"} (${check.failures}/${check.cases} assertions failed). ${check.examples.join("; ")}`.trimEnd()),
    "- CB-1: every study world restores the initial snapshot and replays cognition and host logs; direct repeated-seed and stream-isolation assertions are in the acceptance suite.",
    "- CB-2, CB-3, CB-4, CB-5a: the acceptance suite checks distributions/draws, causal outcomes, informative likelihood directions, and every negative prediction error in its diagnostic runs. Failures are not converted to expected failures.",
    `- CB-5b: ${learning.count}/${learning.eligible} eligible seeds diverged in later selected actions (${learning.pairs} pairs); share ${learning.share.toFixed(5)}, Wilson 95% interval [${learning.low.toFixed(5)}, ${learning.high.toFixed(5)}].`,
    `  ${learning.beforeOutcomeDiffers} pairs already differed by the first informative outcome: eta=0 also freezes sensory belief updates, so this contrast does not isolate outcome learning alone.`,
    `- CB-6a: Pearson chi-square=${symmetryResult.statistic.toFixed(5)}, df=${symmetryResult.df}, p=${symmetryResult.p.toFixed(6)}; required p>0.01. Minimum expected cell=${symmetryResult.minimumExpected.toFixed(2)}.`,
    "  Action counts pool repeated epochs within seeds as DESIGN specifies; that chi-square p-value is descriptive because the repeated choices and A/B interaction are dependent. Exact ID-swap is a separate assertion.",
    "- CB-6b: independent semantic audit certification belongs to unit 2672's CHECK.md, not this report, and contributes no bench assertion or failure. The limited literal-ID guard does not certify it. No CHECK.md is present in this checkout; this report does not claim the audit has completed.",
    `- CB-6c: ${new Set(rows.map((row) => row.sequence)).size} distinct default action sequences across ${rows.length} seeds.`,
    "- CB-7: all ten theta dimensions from DESIGN §3 appear below. Shared drive exponents n,m are held fixed; they are not theta dimensions.",
    "- P7-3: the suite swaps only pertinence; other hooks remain the null model's identical functions.", "",
    "## CB-7 paired comparisons", "",
    "COG-19: population fight, steal and fight + steal frequencies and their intervals are reported, not asserted. Lambda is asserted only in fixed-context evaluation below.", "",
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
    lines.push(`- ${dimension} / ${metric}: ${change.mean < 0 ? "PASS" : "FAIL"}, paired change ${format(change)}; strict mean decrease required.`);
  }
  const lambda = mergeLambdaChecks(rows.map((row) => row.lambda));
  lines.push("", "### Lambda fixed-context verification (COG-19)", "",
    "For every recorded study decision (all minds, baseline, all ten interventions and frozen controls), re-evaluate at lambda 2.25 and 4.5 while holding needs, generated repertoire, beliefs, episodes, time and every other parameter fixed. No decision subset is selected.",
    "Define positive discounted expected loss L = -discount × Σ P(o) min(0, net). Assert EU(4.5) - EU(2.25) = -2.25 L for every candidate (relative/absolute tolerance 1e-10). Assert a strict decrease in the pre-commitment Luce probability of every maximum-L candidate when beta > 0 and losses differ; otherwise assert equality. Commitment can retain an intention independently of that Luce probability.",
    `- lambda: ${lambda.check.failures ? "FAIL" : "PASS"}; ${lambda.decisions} decisions, ${lambda.candidates} candidate EU checks, ${lambda.strict} strict probability checks, ${lambda.equal} equality checks; maximum absolute EU residual ${lambda.maxError}.`,
    "", "### Why fight frequency is invariant", "");
  for (const side of ["baseline", "changed"] as const) {
    const points = rows.flatMap((row) => row.fights?.[side] ?? []);
    if (!points.length) continue;
    const mean = (values: number[]) => values.reduce((sum, n) => sum + n, 0) / values.length;
    lines.push(`- ${side} paired worlds: ${points.length} chosen visitor fight decisions; discounted expected loss L mean ${number(mean(points.map((p) => p.loss)))}, range [${number(Math.min(...points.map((p) => p.loss)))}, ${number(Math.max(...points.map((p) => p.loss)))}]; zero-loss decisions ${points.filter((p) => p.loss === 0).length}.`,
      `  All-alternative availability: ${points.filter((p) => p.alternatives > 0).length}/${points.length} have a positive-probability alternative; ${points.filter((p) => p.movingAlternatives > 0).length}/${points.length} have an alternative whose Luce probability moves under lambda. Fight P mean ${number(mean(points.map((p) => p.before)))} -> ${number(mean(points.map((p) => p.after)))}, delta range [${number(Math.min(...points.map((p) => p.after - p.before)))}, ${number(Math.max(...points.map((p) => p.after - p.before)))}].`,
      `  Retained by commitment: ${points.filter((p) => p.kept).length}; non-retained choices whose recorded draw still selects fight at lambda 4.5 in the same context: ${points.filter((p) => !p.kept && p.sameDrawFight).length}/${points.filter((p) => !p.kept).length}.`);
  }
  const lost = rows.reduce((sum, row) => sum + (row.fights?.lost ?? 0), 0);
  const gained = rows.reduce((sum, row) => sum + (row.fights?.gained ?? 0), 0);
  lines.push(`Paired visitor decision positions changing fight/non-fight status: ${lost + gained}; ${lost} fight choices lost and ${gained} gained. Their cancellation explains the equal realized frequencies in this finite-seed fixture; it is not a structural invariance of fight's utility or probability. Fight can gain Luce probability even while its EU falls when competing actions lose more EU. Population frequencies and intervals above are descriptive. ${lambda.check.failures ? "Evaluation-level failures remain and require investigation; see the failing checks above." : "Lambda reaches fight's evaluator (covered by every-candidate checks). No evaluator fix or fixture tuning was needed."}`);
  lines.push("");
  lines.push("## What this does not show", "",
    "DESIGN §10 V5: no independent data exist for this scene; none are in hand. The CB-7 directions are consequences of the formulas, not validation of how real hungry people choose. Closed-loop feedback and shared resources can also defeat a monotonic direction inferred from a single fixed-context formula. A failed direction is reported, not repaired by choosing favorable seeds.",
    "The experiment that would test the scene is a laboratory scarcity game with a stronger owner, using dictator/ultimatum and theft-option designs in experimental economics. Compare preregistered action frequencies, outcomes and learning trajectories against held-out human data. This report contains no such data or validation tolerance.",
    "No sibling repository was changed or tested under the folder-only instruction. Kernel is exercised through the linked public package. Reality, Settlement, Economy and pirate-ship integration remain outside this fixture's evidence.", "",
    "Regenerate: `npm run bench`. Run acceptance: `npx vitest run test/bench-acceptance.test.ts`.", "");
  return lines.join("\n");
}

if (!isMainThread) {
  parentPort!.postMessage(workerData.seeds.map((seed) => runSeed(seed, workerData.epochs)));
} else if ((import.meta as ImportMeta & { main?: boolean }).main) {
  const start = performance.now();
  const provenance = { commit: execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim(), source: sourceHash() };
  const rows = await collectStudy();
  const seconds = (performance.now() - start) / 1000;
  const checks = basicChecks();
  if (sourceHash() !== provenance.source) throw new Error("src/ changed during the study; rerun npm run bench");
  const report = renderReport(rows, seconds, checks, provenance);
  writeFileSync(new URL("./REPORT.md", import.meta.url), report);
  console.log(report.split("\n").filter((line) => line.startsWith("Verdict CB-")).join("\n"));
  const errors = reportErrors(report);
  if (errors.length) throw new Error(`Benchmark report written with failing criteria: ${errors.join(", ")}`);
}
