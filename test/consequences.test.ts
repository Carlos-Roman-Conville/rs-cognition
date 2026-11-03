import { createHash } from "node:crypto";
import { canonical, Runner } from "@rex/kernel";
import { describe, expect, it } from "vitest";
import { initialConsequences, phi, updateConsequences, validateProfile } from "../src/consequences.ts";
import type { ConsequenceConfig, ConsequenceKind, JointConsequenceBelief } from "../src/consequences.ts";
import { createMindsState, MindsRunner, reduceMinds } from "../src/mind.ts";
import type { MindCommand, MindsConfig } from "../src/mind.ts";
import { evaluateNeeds } from "../src/needs.ts";
import { configs, mindInput, observed } from "./composition-fixtures.ts";
import { action, wait } from "./decision-fixtures.ts";

// All numbers, signals, priors and delay profiles in this file are controlled host
// fixtures, not physiological claims. Every regression uses static parameters Q=0.
const eat: ConsequenceKind = { action: "eat", targetKind: "none" };
const other: ConsequenceKind = { action: "other", targetKind: "none" };
const G = { points: [[0, 0], [120, 1]] } as const;
const zero = (n: number) => Array<number>(n).fill(0);
const diagonal = (values: readonly number[]) => values.map((value, i) => values.map((_, j) => i === j ? value : 0));
const prior = (): JointConsequenceBelief => ({ mu: [0, -0.4, -0.4], Sigma: diagonal([0, 1, 1]) });
const fixture: ConsequenceConfig = {
  beta: { mu0: 0, var0: 0.000001 },
  kinds: [{ kind: eat, mu0: -0.4, var0: 1, G }], sigmaW2: 0.001, Q: [0, 0],
};

function setup(config: ConsequenceConfig = fixture) {
  const configured: MindsConfig = { baseline: {
    generation: { repertoire: [action("eat", { outcomeSpace: [
      { id: "ok", deficits: {}, goalProgress: { goal: 1 } },
    ] })], wait },
    learning: { appraise: () => ({ outcome: "ok" }), latents: [] },
    consequences: { hunger: config },
  } };
  const runner = new MindsRunner(createMindsState(72), configured);
  const input = mindInput();
  runner.run({ type: "addMind", mind: { ...input, params: { ...input.params!, beta: 100, kappa: 10 },
    needs: { needs: evaluateNeeds([
      { id: "hunger", category: "body", source: { signal: "body.hunger" }, setpoint: 0, weight: 1, salienceTags: [] },
    ], { signals: { "body.hunger": 0.5 }, beliefs: input.memory.beliefs, accumulators: {},
      elapsedSeconds: 0, outcomeTags: [], cues: [] }), goals: [{ id: "goal", value: 1, progress: 0 }] },
  } });
  return { runner, configured };
}

function sample(runner: MindsRunner, t: number, h?: number) {
  return runner.run({ type: "tickNeeds", mind: "mind.0001", t,
    // Deliberately unrelated elapsedSeconds: learning must use kernel timestamps.
    inputs: { signals: h === undefined ? {} : { "body.hunger": h }, elapsedSeconds: 7, outcomeTags: [], cues: [] } });
}

function decide(runner: MindsRunner, t: number) {
  return runner.run({ type: "decide", mind: "mind.0001", t });
}

function attempt(runner: MindsRunner, t: number, status?: "completed" | "failed" | "impossible") {
  decide(runner, t);
  expect(runner.state.minds[0].current!.action).toBe("eat");
  return runner.run({ type: "outcome", event: `evt.${t}`, intention: runner.state.minds[0].current!.id, t,
    feedback: { observations: [], ...(status === undefined ? {} : { status }) } });
}

function confounded() {
  let belief = prior();
  for (let i = 0; i < 10; i++) belief = updateConsequences(belief, -0.2, [60, 1, 1], 60, 0.01, 1, zero(3));
  return belief;
}

describe("PLAN A.11.1 joint consequences in physical time (Q=0 fixtures)", () => {
  it("(a) surprising evidence reverses the prior direction, using the stated innovation and gain", () => {
    const belief = { mu: [0, -0.4], Sigma: diagonal([0, 1]) };
    const result = updateConsequences(belief, 0.3, [60, 1], 60, 0.001, 1, zero(2));
    expect(result.mu[1]).toBeGreaterThan(0);
    expect(result.mu[1]).toBeCloseTo(-0.4 + (0.3 + 0.4) / 1.06, 14);
    expect(result.Sigma[1][1]).toBeCloseTo(1 - 1 / 1.06, 14);
    expect(belief).toEqual({ mu: [0, -0.4], Sigma: diagonal([0, 1]) });
  });

  it("(b) always coincident acts constrain their sum, preserve difference variance and become anticorrelated", () => {
    const { Sigma } = confounded();
    const sumVariance = Sigma[1][1] + Sigma[2][2] + 2 * Sigma[1][2];
    const differenceVariance = Sigma[1][1] + Sigma[2][2] - 2 * Sigma[1][2];
    expect(sumVariance).toBeLessThan(0.1);
    expect(Math.abs(differenceVariance - 2)).toBeLessThan(1e-9);
    expect(Sigma[1][2]).toBeLessThan(0);
    expect(Sigma[1][2]).toBe(Sigma[2][1]);
  });

  it("(c) no act changes beta only from a diagonal uncorrelated prior", () => {
    const belief = { mu: [0, -0.4], Sigma: diagonal([0.01, 1]) };
    const result = updateConsequences(belief, 0.2, [60, 0], 60, 0.01, 1, zero(2));
    expect(result.mu[0]).toBeGreaterThan(0);
    expect(result.Sigma[0][0]).toBeLessThan(0.01);
    expect(result.mu[1]).toBe(belief.mu[1]);
    expect(result.Sigma[1]).toEqual(belief.Sigma[1]);
    expect(result.Sigma[0][1]).toBe(0);
  });

  it("(d) eta=0 leaves every moment byte-identical without division by zero", () => {
    const belief = confounded();
    expect(canonical(updateConsequences(belief, 0.4, [60, 1, 0], 60, 0.01, 0, zero(3)))).toBe(canonical(belief));
  });

  it("(e) refused, failed and impossible eats add no act or phi and equal the posterior with the attempt removed", () => {
    for (const status of [undefined, "failed", "impossible"] as const) {
      const attempted = setup().runner;
      const removed = setup().runner;
      for (const runner of [attempted, removed]) {
        sample(runner, 0, 0.8);
        attempt(runner, 1000, "completed");
        sample(runner, 61000, 0.7);
      }
      // A prior completion has already correlated beta with theta: we test the
      // whole counterfactual posterior, not an incorrect inactive-theta freeze.
      expect(attempted.state.minds[0].consequences![0].Sigma[0][1]).not.toBe(0);
      attempt(attempted, 62000, status);
      for (const [t, h] of [[121000, 0.55], [181000, 0.6], [241000, 0.65]]) {
        expect(canonical(attempted.state.minds[0].completedActs)).toBe(canonical(removed.state.minds[0].completedActs));
        expect(phi(attempted.state.minds[0].completedActs!, eat, G, t / 1000, (t - 60000) / 1000))
          .toBe(phi(removed.state.minds[0].completedActs!, eat, G, t / 1000, (t - 60000) / 1000));
        for (const runner of [attempted, removed]) sample(runner, t, h);
        expect(canonical(attempted.state.minds[0].consequences)).toBe(canonical(removed.state.minds[0].consequences));
      }
    }
  });

  it("(f) beta posterior is invariant to 60, 600 and 3600 second sampling within 1e-12", () => {
    const results = [60, 600, 3600].map(dt => {
      let belief = { mu: [0], Sigma: [[0.000001]] };
      for (let t = dt; t <= 7200; t += dt) {
        belief = updateConsequences(belief, 0.00001 * dt, [dt], dt, 0.001, 1, [0]) as typeof belief;
      }
      return belief;
    });
    const variance = 1 / (1 / 0.000001 + 7200 / 0.001);
    const mean = variance * (7200 * 0.00001 / 0.001);
    for (const result of results) {
      expect(Math.abs(result.mu[0] - mean)).toBeLessThan(1e-12);
      expect(Math.abs(result.Sigma[0][0] - variance)).toBeLessThan(1e-12);
    }
  });

  it("(g) theta posteriors agree across 60, 600 and 3600 s to the profile-derived tolerance", () => {
    const profile = { points: [[0, 0], [3600, 0.25], [7200, 1]] } as const;
    // Every knot lies on every sampling grid. On each linear segment, phi/dt
    // is constant, so sum(phi^2/dt) and sum(phi*y/dt) are exactly invariant.
    // G sampling error is therefore zero; 1e-10 allows only accumulated roundoff.
    const tolerance = 1e-10;
    const results = [60, 600, 3600].map(dt => {
      let belief: JointConsequenceBelief = { mu: [0, -0.1], Sigma: diagonal([0.00000001, 1]) };
      for (let t = dt; t <= 10800; t += dt) {
        const p = phi([{ kind: eat, t: 0 }], eat, profile, t, t - dt);
        belief = updateConsequences(belief, 0.00001 * dt - 0.3 * p, [dt, p], dt, 0.00001, 1, zero(2));
      }
      return belief;
    });
    expect(results[0].mu[1]).toBeLessThan(-0.1);
    for (const result of results.slice(1)) for (let i = 0; i < 2; i++) {
      expect(Math.abs(result.mu[i] - results[0].mu[i])).toBeLessThan(tolerance);
      for (let j = 0; j < 2; j++) expect(Math.abs(result.Sigma[i][j] - results[0].Sigma[i][j])).toBeLessThan(tolerance);
    }
  });

  it("(h) empty technical feedback closes the intention without any learning and allows the next decision", () => {
    const { runner } = setup();
    sample(runner, 0, 0.5);
    decide(runner, 1000);
    const before = structuredClone(runner.state);
    const mind = before.minds[0];
    const result = runner.run({ type: "outcome", event: "technical", intention: mind.current!.id,
      t: 2000, feedback: { observations: [] } });
    const after = runner.state.minds[0];
    expect(after.current).toBeUndefined();
    expect(after.intentions.filter(record => record.outcomeEvent === undefined)).toEqual([]);
    expect(after.intentions[0].intention.status).toBe("failed");
    for (const key of ["memory", "learning", "consequences", "completedActs"] as const) {
      expect(canonical(after[key])).toBe(canonical(mind[key]));
    }
    expect(runner.state.counters).toEqual(before.counters);
    expect(runner.state.streams).toEqual(before.streams);
    expect(result.events).toEqual([]);
    expect(decide(runner, 3000).events.filter(event => event.type === "cognition.intention")).toHaveLength(1);
    expect(runner.state.minds[0].current!.id).not.toBe(mind.current!.id);
  });

  it("(i) no configuration preserves a fixed-seed pre-unit state and event byte fingerprint", () => {
    // Captured on 0677060 before modifying source for unit 5512.
    const beforeUnit = "123493a19cb4b103288c0442c63bc4754183baa900ccb0883c0740bc4b3fa68f";
    const runner = new MindsRunner(createMindsState(72), configs);
    runner.run({ type: "addMind", mind: mindInput() });
    for (let t = 1000; t <= 4000; t += 1000) {
      runner.run({ type: "tickNeeds", mind: "mind.0001", inputs: { signals: {}, elapsedSeconds: 1, outcomeTags: [], cues: [] } });
      decide(runner, t);
      runner.run({ type: "outcome", event: `evt.${t}`, intention: runner.state.minds[0].current!.id, t: t + 500,
        feedback: { status: "completed", observations: [observed(t + 500)] } });
    }
    expect(createHash("sha256").update(canonical({ state: runner.state, events: runner.events })).digest("hex")).toBe(beforeUnit);
    expect(Object.hasOwn(runner.state.minds[0], "consequences")).toBe(false);
    expect(Object.hasOwn(runner.state.minds[0], "completedActs")).toBe(false);
    expect(runner.state.minds[0].decisions.every(trace => !Object.hasOwn(trace, "consequences"))).toBe(true);
  });

  it("(j) an inactive correlated cause is revised indirectly by K_2 times the innovation", () => {
    const belief = confounded();
    const regressor = [60, 1, 0];
    const y = 0.4;
    const eta = 0.7;
    const projected = belief.Sigma.map(row => row.reduce((sum, value, i) => sum + value * regressor[i], 0));
    const denominator = regressor.reduce((sum, value, i) => sum + value * projected[i], 0) + 0.01 * 60 / eta;
    const K2 = projected[2] / denominator;
    const e = y - regressor.reduce((sum, value, i) => sum + value * belief.mu[i], 0);
    const result = updateConsequences(belief, y, regressor, 60, 0.01, eta, zero(3));
    const delta = result.mu[2] - belief.mu[2];
    expect(K2).not.toBe(0);
    expect(delta).not.toBe(0);
    expect(delta).toBeCloseTo(K2 * e, 14);
    expect(Math.sign(delta)).toBe(Math.sign(belief.Sigma[2][1] * e));
  });

  it("validates monotone profiles, interpolates delays, sums only the declared kind and clips outside the window", () => {
    const delayed = { points: [[10, 0], [30, 0.5], [50, 1]] } as const;
    const acts = [{ kind: eat, t: 0 }, { kind: eat, t: 20 }, { kind: other, t: 0 }];
    expect(phi(acts, eat, delayed, 20, 0)).toBe(0.25);
    expect(phi(acts, eat, delayed, 40, 20)).toBe(0.75);
    expect(phi(acts, eat, delayed, 100, 0)).toBe(2);
    expect(phi(acts, eat, delayed, 200, 100)).toBe(0);
    expect(phi([{ kind: { ...eat, targetKind: "different" }, t: 0 }], eat, G, 120, 0)).toBe(0);
    for (const points of [[], [[0, 0]], [[0, 0.1], [1, 1]], [[0, 0], [1, 0.5]],
      [[-1, 0], [1, 1]], [[0, 0], [1, 0.8], [2, 0.2], [3, 1]], [[0, 0], [0, 1]], [[0, 0], [Infinity, 1]]]) {
      expect(() => validateProfile({ points: points as [number, number][] })).toThrow();
    }
    expect(() => phi([], eat, G, 1, 2)).toThrow();
  });

  it("samples once per present signal in kernel seconds, preserves missing samples and consumes window tails before pruning", () => {
    const { runner } = setup();
    const initial = structuredClone(runner.state.minds[0].consequences![0]);
    sample(runner, 1000, 0.8);
    expect(runner.state.minds[0].consequences![0]).toEqual({ ...initial, hPrev: 0.8, tPrev: 1000 });
    attempt(runner, 11000, "completed");
    expect(runner.state.minds[0].completedActs).toEqual([{ kind: eat, t: 11 }]);
    const beforeMissing = canonical(runner.state.minds[0].consequences);
    sample(runner, 301000);
    expect(canonical(runner.state.minds[0].consequences)).toBe(beforeMissing);
    expect(runner.state.minds[0].completedActs).toHaveLength(1);
    sample(runner, 601000, 0.5);
    const expected = updateConsequences(initial, 0.5 - 0.8, [600, 1], 600, fixture.sigmaW2, 1, fixture.Q);
    expect(runner.state.minds[0].consequences![0]).toEqual({ ...initial, ...expected, hPrev: 0.5, tPrev: 601000 });
    expect(runner.state.minds[0].completedActs).toEqual([]);
    expect(() => sample(runner, 601000, 0.4)).toThrow("advance");
  });

  it("exposes detached read-only belief snapshots in traces and decision events, and replays learner state", () => {
    const { runner, configured } = setup();
    sample(runner, 0, 0.8);
    attempt(runner, 1000, "completed");
    sample(runner, 61000, 0.7);
    const result = decide(runner, 62000);
    const trace = runner.state.minds[0].decisions.at(-1)!;
    const event = result.events.find(event => event.type === "cognition.decision")!;
    const { need, mu, Sigma } = runner.state.minds[0].consequences![0];
    expect(trace.consequences).toEqual([{ need, mu, Sigma }]);
    expect(event.payload.consequences).toEqual(trace.consequences);
    expect(trace.consequences![0].Sigma).not.toBe(Sigma);
    expect(event.payload.consequences![0].Sigma).not.toBe(trace.consequences![0].Sigma);
    const saved = canonical(trace.consequences);
    sample(runner, 121000, 0.5);
    expect(canonical(trace.consequences)).toBe(saved);
    const log: MindCommand[] = JSON.parse(JSON.stringify(runner.log));
    const replay = Runner.replay(log, (state, command) => reduceMinds(state, command, configured), undefined, createMindsState(72));
    expect(canonical(replay.state)).toBe(canonical(runner.state));
    expect(canonical(replay.events)).toBe(canonical(runner.events));
  });

  it("ignores unknown causes, duplicate completions, implicit status and undeclared action kinds", () => {
    const { runner } = setup();
    sample(runner, 0, 0.8);
    decide(runner, 1000);
    const before = canonical(runner.state.minds[0].consequences);
    runner.run({ type: "outcome", event: "unknown", intention: "missing", t: 1000,
      feedback: { status: "completed", observations: [] } });
    expect(runner.state.minds[0].completedActs).toEqual([]);
    expect(canonical(runner.state.minds[0].consequences)).toBe(before);
    const command: MindCommand = { type: "outcome", event: "completed", intention: runner.state.minds[0].current!.id, t: 1000,
      feedback: { status: "completed", observations: [] } };
    runner.run(command);
    runner.run({ ...command, event: "duplicate" });
    expect(runner.state.minds[0].completedActs).toHaveLength(1);
    decide(runner, 2000);
    runner.run({ type: "outcome", event: "implicit", intention: runner.state.minds[0].current!.id, t: 2000,
      feedback: { observations: [observed(2000)] } });
    expect(runner.state.minds[0].completedActs).toHaveLength(1);
    const undeclared = setup({ ...fixture, kinds: [{ ...fixture.kinds[0], kind: other }] }).runner;
    attempt(undeclared, 1000, "completed");
    expect(undeclared.state.minds[0].completedActs).toEqual([]);
  });

  it("rejects invalid fixture parameters and regression dimensions before updating", () => {
    expect(() => initialConsequences("hunger", { ...fixture, beta: { mu0: 0, var0: -1 } })).toThrow();
    expect(() => initialConsequences("hunger", { ...fixture, sigmaW2: 0 })).toThrow();
    expect(() => initialConsequences("hunger", { ...fixture, Q: [0] })).toThrow();
    expect(() => initialConsequences("hunger", { ...fixture, kinds: [fixture.kinds[0], fixture.kinds[0]], Q: zero(3) })).toThrow();
    expect(() => updateConsequences(prior(), 0, [1], 1, 1, 1, zero(3))).toThrow();
    expect(() => updateConsequences(prior(), 0, [1, 0, 0], 0, 1, 1, zero(3))).toThrow();
    expect(() => updateConsequences(prior(), 0, [1, 0, 0], 1, 1, 2, zero(3))).toThrow();
  });

  it("keeps needs and minds independent and retains an act through the longest declared window", () => {
    const base = setup();
    const add = base.runner.log[0];
    if (add.type !== "addMind") throw new Error("Expected fixture initialization");
    const longer: ConsequenceConfig = { ...fixture,
      kinds: [{ ...fixture.kinds[0], G: { points: [[0, 0], [360, 1]] } }] };
    const configured = { baseline: { ...base.configured.baseline,
      consequences: { hunger: fixture, otherNeed: longer } } };
    const runner = new MindsRunner(createMindsState(72), configured);
    const hunger = add.mind.needs.needs[0];
    for (let i = 0; i < 2; i++) runner.run({ type: "addMind", mind: { ...add.mind,
      needs: { ...add.mind.needs, needs: [hunger, { ...hunger,
        definition: { ...hunger.definition, id: "otherNeed", source: { signal: "body.other" } } }] } } });
    const secondBefore = canonical(runner.state.minds[1]);
    const tick = (t: number, signals: Record<string, number>) => runner.run({ type: "tickNeeds", mind: "mind.0001", t,
      inputs: { signals, elapsedSeconds: 1, outcomeTags: [], cues: [] } });
    tick(0, { "body.hunger": 0.8, "body.other": 0.8 });
    attempt(runner, 1000, "completed");
    tick(121000, { "body.hunger": 0.6, "body.other": 0.7 });
    expect(runner.state.minds[0].completedActs).toHaveLength(1);
    const otherBefore = canonical(runner.state.minds[0].consequences![1]);
    tick(181000, { "body.hunger": 0.65 });
    expect(canonical(runner.state.minds[0].consequences![1])).toBe(otherBefore);
    tick(361000, { "body.hunger": 0.7, "body.other": 0.5 });
    expect(runner.state.minds[0].completedActs).toEqual([]);
    expect(runner.state.minds[0].consequences![0].mu).not.toEqual(runner.state.minds[0].consequences![1].mu);
    expect(canonical(runner.state.minds[1])).toBe(secondBefore);
  });
});
