// Executable DESIGN §6 diagnostics shared by the acceptance suite and report.
// A diagnostic records counterexamples; it never turns a failed requirement into a pass.
import { canonical, restore, Runner, streams } from "@rex/kernel";
import {
  createMindsState, evaluateActions, generateActions, nullPersonality,
} from "../../src/index.ts";
import type {
  LearningEvidence, LearningTrace, Mind, MindsState, PersonalityModel, SelectionTrace,
} from "../../src/index.ts";
import { forecastConfig, makeConfig } from "./models.ts";
import { FIXTURE, HungryPairWorld, reduceFixtureMinds, runHungryPair } from "./world.ts";
import type { RunOptions } from "./world.ts";
import { lambdaChecks } from "./lambda.ts";

export interface Check {
  id: string;
  cases: number;
  failures: number;
  examples: string[];
}
function check(id: string): Check { return { id, cases: 0, failures: 0, examples: [] }; }
function record(check: Check, pass: boolean, message: string) {
  check.cases++;
  if (!pass) {
    check.failures++;
    if (check.examples.length < 3) check.examples.push(message);
  }
}
const near = (a: number, b: number) => Math.abs(a - b) <= 1e-10 * Math.max(1, Math.abs(a), Math.abs(b));
const view = (mind: Mind) => ({ beliefs: mind.memory.beliefs, needs: mind.needs, params: mind.params });

/** COG-10 exempts only an explicit host receipt censored at this run's horizon. */
export function consequenceSatisfied(changed: boolean, receipt: { t: number; payload: unknown } | undefined, horizon: number): boolean {
  const payload = receipt?.payload as { result?: string; reason?: string } | undefined;
  return changed || (receipt?.t === horizon && payload?.result === "unfinished" && payload.reason === "unfinished at horizon");
}

export function diagnosticRun(options: RunOptions) {
  const world = new HungryPairWorld(options), run = world.run();
  const checks = { selection: check("CB-2"), consequences: check("CB-3"), beliefs: check("CB-4"), later: check("CB-5a") };
  const intentions = world.bus.since().filter((event) => event.type === "cognition.intention");
  for (const event of intentions) {
    const outcomes = run.outcomes.filter((outcome) => outcome.cause === event.id);
    record(checks.consequences, outcomes.length === 1, `seed ${options.seed}, ${event.id}: ${outcomes.length} causal outcomes`);
    const payload = event.payload as { id: string };
    record(checks.selection, run.decisions.some((row) => `cognition/${row.intention.id}` === payload.id),
      `seed ${options.seed}, ${event.id}: no committed-intention decision trace`);
  }
  record(checks.consequences, run.outcomes.length === intentions.length, `seed ${options.seed}: orphan outcome`);
  for (const trace of run.decisions) {
    const p = trace.candidates.map((row) => row.probability);
    record(checks.selection, p.length >= 2 && p.every((value) => Number.isFinite(value) && value >= 0 && value <= 1) &&
      near(p.reduce((sum, value) => sum + value, 0), 1), `seed ${options.seed}, ${trace.intention.id}: invalid candidate distribution`);
    let chosen = p.findIndex((value) => value === 1);
    if (!trace.commitment.kept) {
      let cumulative = 0;
      chosen = p.findIndex((value) => { cumulative += value; return trace.draw! < cumulative; });
      if (chosen < 0) chosen = p.reduce((last, value, i) => value > 0 ? i : last, -1);
    }
    const candidate = trace.candidates[chosen]?.candidate;
    record(checks.selection, candidate?.action === trace.intention.action && candidate?.target === trace.intention.target,
      `seed ${options.seed}, ${trace.intention.id}: selection does not follow recorded draw/commitment mass`);
  }

  let initial = createMindsState(options.seed);
  restore([{ id: "minds", snapshot: () => initial, restore: (state) => { initial = state as MindsState; } }], run.initial);
  const replayDecisions: SelectionTrace[] = [];
  const replay = Runner.replay(run.inputLog, (state, command) => {
    const result = reduceFixtureMinds(state, command, world.configs);
    if (result.decision) replayDecisions.push(result.decision);
    if (command.type !== "outcome") return result;
    const before = state.minds.find((mind) => mind.intentions.some((entry) => entry.intention.id === command.intention));
    if (!before) return result;
    const pending = before.intentions.find((entry) => entry.intention.id === command.intention)!;
    const after = result.state.minds.find((mind) => mind.id === before.id)!;
    const learning = result.events.find((event) => event.type === "cognition.attribution")?.payload as LearningTrace | undefined;
    if (!learning) return result;
    const label = `seed ${options.seed}, ${command.intention}, ${pending.intention.action}, ${learning.outcome}`;
    const receipt = run.outcomes.find((event) => event.id === command.event);
    const changed = canonical(before.needs) !== canonical(after.needs) ||
      canonical(before.memory.beliefs) !== canonical(after.memory.beliefs) ||
      canonical(before.memory.reliability) !== canonical(after.memory.reliability);
    record(checks.consequences, consequenceSatisfied(changed, receipt, (options.epochs ?? FIXTURE.epochs) * FIXTURE.epochMs),
      `${label}: no need or belief changed`);

    const config = world.configs[before.config];
    const evidence: LearningEvidence = { observations: command.feedback.observations, intention: pending.intention,
      memory: before.memory, view: view(before) };
    for (const latent of config.learning.latents) {
      const update = learning.updates.find((entry) => entry.id === latent.id)!;
      const prior = update.prior, posterior = update.posterior;
      if (latent.kind === "discrete" && "kind" in prior && prior.kind === "categorical" && "kind" in posterior && posterior.kind === "categorical") {
        const likelihood = latent.likelihood(evidence);
        const weights = prior.probabilities.map((p, i) => p * Math.max(1e-12, likelihood[i]) ** update.eta);
        const total = weights.reduce((sum, value) => sum + value, 0);
        const expected = weights.map((weight) => weight / total);
        const informative = expected.some((p, i) => Math.abs(p - prior.probabilities[i]) > 1e-12);
        if (informative) record(checks.beliefs, Number(update.kl) > 0 && expected.every((p, i) => near(p, posterior.probabilities[i])),
          `${label}, ${latent.id}: KL=${update.kl}, posterior does not follow tempered likelihood`);
      } else if (latent.kind === "gaussian" && "kind" in prior && prior.kind === "gaussian" && "kind" in posterior && posterior.kind === "gaussian") {
        const likelihood = latent.likelihood(evidence);
        const gain = prior.variance / (prior.variance + likelihood.variance / update.eta);
        if (gain > 1e-12) record(checks.beliefs, Number(update.kl) > 0 &&
          near(posterior.mean, prior.mean + gain * (likelihood.mean - prior.mean)) &&
          near(posterior.variance, (1 - gain) * prior.variance), `${label}, ${latent.id}: Gaussian likelihood direction/KL`);
      } else if (latent.kind === "reliability" && "alpha" in prior && "alpha" in posterior) {
        const likelihood = latent.likelihood(evidence);
        if (likelihood.weight * update.eta > 0) record(checks.beliefs, Number(update.kl) > 0 &&
          near(posterior.alpha, prior.alpha + (likelihood.reliable ? likelihood.weight * update.eta : 0)) &&
          near(posterior.beta, prior.beta + (likelihood.reliable ? 0 : likelihood.weight * update.eta)),
        `${label}, ${latent.id}: Beta likelihood direction/KL`);
      }
    }

    if (learning.predictionError < 0) {
      // Hold needs, capabilities, context, evaluation time and repertoire fixed. Only
      // the learned beliefs/episodes differ, so a changing world cannot explain ΔEU.
      const sameContext = (mind: Mind) => {
        const frozenView = { ...view(mind), needs: pending.trace.needs };
        const generation = generateActions({ ...forecastConfig(config, frozenView.needs).generation,
          body: { capacity_functional: pending.trace.inputs.generation.capacityFunctional } }, frozenView);
        return evaluateActions(generation, frozenView, mind.memory.episodes, pending.trace.inputs.context, command.t + 1)
          .candidates.find((row) => row.candidate.action === pending.intention.action && row.candidate.target === pending.intention.target)!.expectedUtility;
      };
      const oldEU = sameContext(before), newEU = sameContext(after);
      record(checks.later, newEU < oldEU, `${label}: delta=${learning.predictionError}, same-context EU ${oldEU} -> ${newEU}`);
    }
    return result;
  }, undefined, initial);
  return { run, checks: [...Object.values(checks), lambdaChecks(run.decisions, `diagnostic seed ${options.seed}`).check], replayMatches: canonical(replay.state) === canonical(world.runner.state) &&
    canonical(replay.events) === canonical(world.runner.events) && canonical(replayDecisions) === canonical(run.decisions) };
}

export function swapIds<T>(value: T): T {
  return JSON.parse(JSON.stringify(value).replace(/mind\.000[12]/g, (id) => id === "mind.0001" ? "mind.0002" : "mind.0001")) as T;
}

/** Actually re-run Scheduler after exchanging A/B identifiers, including all references
 * and owner repertoire order. Keep the public §7 ID-keyed RNG contract unchanged. */
export function idSwapCheck(seed = 1, epochs = 2): Check {
  const original = new HungryPairWorld({ seed, epochs }), swapped = new HungryPairWorld({ seed, epochs });
  // COG-12: materialize each stream at its original initial state, then transport
  // the states with the minds. No draw is consumed and Kernel's ID contract is unchanged.
  for (const world of [original, swapped]) {
    const rng = streams(seed);
    for (const body of world.state.bodies) {
      for (const mechanism of ["cognition.decision.select", "cognition.perception.detect", "cognition.memory.retrieve"])
        rng.get(mechanism, body.id);
      for (const mechanism of ["fixture.fight", "fixture.find"]) world.random.get(mechanism, body.id);
    }
    world.runner.state = { ...world.runner.state, streams: rng.state() };
  }
  swapped.random.restore(swapIds(swapped.random.state()));
  swapped.state = swapIds(swapped.state);
  swapped.runner.state = swapIds(swapped.runner.state);
  const ids = swapped.state.bodies.map((body) => body.id), owner = ids[2];
  const configs = swapped.configs as Record<string, ReturnType<typeof makeConfig>>;
  for (const body of swapped.state.bodies) configs[body.id] = makeConfig(body.role === "owner",
    body.role === "owner" ? ids.filter((id) => id !== owner) : [owner]);
  original.scheduler.runUntil(epochs * FIXTURE.epochMs);
  swapped.scheduler.runUntil(epochs * FIXTURE.epochMs);
  const result = check("CB-6a exact ID swap");
  const expected = swapIds(original.runner.decisions), actual = swapped.runner.decisions;
  record(result, canonical(actual) === canonical(expected),
    `seed ${seed}: first decision draws ${expected[0].draw} -> ${actual[0].draw}; stream states travel with the renamed minds`);
  return result;
}

export const attentionOnly: PersonalityModel = {
  ...nullPersonality, id: "test-pertinence-only",
  pertinence: (base) => ({ ...base, food: (base.food ?? 0) * 20 }),
}; // Proposed test intervention only; not an eight-function personality model.

export function basicChecks() {
  const diagnostics = [diagnosticRun({ seed: 1, epochs: 2 }), diagnosticRun({ seed: 19, epochs: 8 })];
  const replay = check("CB-1");
  const baseline = diagnostics[0].run;
  record(replay, diagnostics.every((row) => row.replayMatches), "Kernel initial-snapshot/input-log replay mismatch");
  record(replay, canonical(baseline) === canonical(runHungryPair({ seed: 1, epochs: 2 })), "Repeated seed is not byte-identical");
  const other = runHungryPair({ seed: 2, epochs: 2 });
  const initialMinds = (run: typeof baseline) => {
    let state = createMindsState(run.seed);
    restore([{ id: "minds", snapshot: () => state, restore: (value) => { state = value as MindsState; } }], run.initial);
    return { ...state, runSeed: 0 }; // Seed metadata is the sole pre-stream difference.
  };
  record(replay, canonical(initialMinds(baseline)) === canonical(initialMinds(other)), "Seed changed pre-stream mind state");
  const initialWorld = (run: typeof baseline) => {
    let state: unknown;
    restore([{ id: "world", snapshot: () => state, restore: (value) => { state = value; } }], run.initial);
    return state;
  };
  record(replay, canonical(initialWorld(baseline)) === canonical(initialWorld(other)) && canonical(baseline.params) === canonical(other.params),
    "Seed changed pre-stream fixture conditions or parameters");
  record(replay, canonical(baseline.decisions) !== canonical(other.decisions), "Distinct seeds did not affect downstream trace");
  const personality = check("P7-3");
  record(personality, canonical(baseline.decisions) !== canonical(runHungryPair({ seed: 1, epochs: 2, personality: attentionOnly }).decisions),
    "Pertinence-only swap did not change decisions/observations");
  return [replay, ...diagnostics[0].checks.map((entry, i) => ({ ...entry,
    cases: entry.cases + diagnostics[1].checks[i].cases,
    failures: entry.failures + diagnostics[1].checks[i].failures,
    examples: [...entry.examples, ...diagnostics[1].checks[i].examples].slice(0, 3) })), idSwapCheck(), personality];
}
