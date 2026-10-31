import { canonical } from "@rex/kernel";
import type { KernelEvent } from "@rex/kernel";
import { describe, expect, it } from "vitest";
import { categorical, getBelief, setBelief } from "../src/index.ts";
import type { Intention } from "../src/index.ts";
import { cognitiveParams, VISITOR_REPERTOIRE } from "../bench/hungry-pair/models.ts";
import { FIXTURE, fightProbability, HungryPairWorld, runHungryPair } from "../bench/hungry-pair/world.ts";
import type { Outcome } from "../bench/hungry-pair/world.ts";
import { parseArguments } from "../bench/hungry-pair/run.ts";

// Direct fixture rule tests supply intentions, not a scripted production policy.
function harness(seed = 1) {
  const world = new HungryPairWorld({ seed });
  const [visitor, other, owner] = world.state.bodies;
  const outcomes: { cause?: string; payload: Outcome; t: number }[] = [];
  let serial = 0;
  const ctx = (t: number = FIXTURE.epochMs) => ({ t, emit: (_type: string, payload: unknown, cause?: string) => {
    outcomes.push({ cause, payload: payload as Outcome, t });
  } });
  function act(action: string, actor = visitor, target = owner, t: number = FIXTURE.epochMs) {
    const id = `test.${++serial}`;
    const payload: Intention = { id: `cognition/int.test${serial}`, mind: actor.id, action, target: target.id, t,
      expectedOutcomes: categorical(["good", "bad", "unfinished"], [0.5, 0.5, 0]), status: "active" };
    const event: KernelEvent = { id, t, type: "cognition.intention", source: "test", payload };
    world.resolve(event, ctx(t));
    world.assertInvariants();
    return event;
  }
  return { world, visitor, other, owner, outcomes, act, ctx };
}

describe("hungry pair fixture rules (DESIGN §6; verification, never validation)", () => {
  it("starts two identical hungry minds and a fed owner mind with six stock units and equal trade items", () => {
    const { world, visitor, other, owner } = harness();
    expect(world.runner.state.minds).toHaveLength(3);
    expect(world.runner.state.minds[0].memory).toEqual(world.runner.state.minds[1].memory);
    expect(world.runner.state.minds[0].params).toEqual(world.runner.state.minds[1].params);
    expect(visitor.hunger).toBe(0.6); expect(other.hunger).toBe(0.6); expect(owner.hunger).toBe(0.1);
    expect([visitor.items, other.items, owner.items]).toEqual([1, 1, 0]);
    expect(owner.baseCapacity / visitor.baseCapacity).toBe(1.5);
    const goal = world.runner.state.minds[2].needs.goals[0];
    expect(goal.id).toBe("keep_stock"); expect(goal.value * goal.progress).toBe(6);
    expect(world.state.stock).toBe(6);
    expect(VISITOR_REPERTOIRE.map((row) => row.id)).toEqual(expect.arrayContaining(["ask", "trade", "work", "deceive", "steal", "fight", "leave"]));
  });

  it("ask waits for O's give/refuse intention, and trade transfers exactly one equal-value item", () => {
    const h = harness();
    const ask = h.act("ask");
    expect(h.outcomes).toHaveLength(0);
    h.act("give", h.owner, h.visitor);
    expect(h.outcomes.find((o) => o.cause === ask.id)?.payload.result).toBe("good");
    expect(h.world.state.stock).toBe(5); expect(h.visitor.hunger).toBeCloseTo(0.35);
    const trade = h.act("trade");
    h.act("accept_trade", h.owner, h.visitor);
    expect(h.outcomes.find((o) => o.cause === trade.id)?.payload.result).toBe("good");
    expect([h.visitor.items, h.owner.items]).toEqual([0, 1]);
    h.act("trade");
    expect(h.outcomes.at(-1)?.payload.reason).toBe("no tradeable item");
    h.act("ask", h.other);
    h.act("refuse", h.owner, h.other);
    expect(h.world.state.stock).toBe(4);
    expect(h.outcomes.at(-2)?.payload.reason).toBe("refused");
  });

  it.each(["pay", "renege"])("work lasts three complete epochs before the owner's %s decision", (answer) => {
    const h = harness();
    const work = h.act("work");
    h.act("accept_work", h.owner, h.visitor);
    h.world.resolveDue(h.ctx(3 * FIXTURE.epochMs));
    expect(h.world.state.jobs[0].stage).toBe("work");
    h.act("pay", h.owner, h.visitor, 3 * FIXTURE.epochMs);
    expect(h.world.state.stock).toBe(6);
    h.world.resolveDue(h.ctx(4 * FIXTURE.epochMs));
    expect(h.world.state.jobs[0].stage).toBe("pay");
    h.act(answer, h.owner, h.visitor, 4 * FIXTURE.epochMs);
    expect(h.outcomes.filter((o) => o.cause === work.id)).toHaveLength(1);
    expect(h.world.state.stock).toBe(answer === "pay" ? 5 : 6);
  });

  it.each(["keep", "break"])("deception advances food and a later %s decision produces evidence for O", (answer) => {
    const h = harness();
    h.act("deceive");
    const sponsor = h.act("accept_promise", h.owner, h.visitor);
    expect(h.world.state.stock).toBe(5);
    expect(h.outcomes.some((o) => o.cause === sponsor.id)).toBe(false);
    const choice = h.act(answer, h.visitor, h.owner, 2 * FIXTURE.epochMs);
    if (answer === "keep") {
      h.world.resolveDue(h.ctx(4 * FIXTURE.epochMs));
      expect(h.outcomes.some((o) => o.cause === choice.id)).toBe(false);
      h.world.resolveDue(h.ctx(5 * FIXTURE.epochMs));
    }
    expect(h.outcomes.filter((o) => o.cause === sponsor.id)).toHaveLength(1);
    expect(h.outcomes.find((o) => o.cause === sponsor.id)?.payload.promise).toEqual({ speaker: h.visitor.id, result: answer === "keep" ? "kept" : "broken" });
    expect(h.world.state.jobs).toHaveLength(0);
  });

  it("stealing uses O's actual perception and stock-cue attention, not an extra detection roll", () => {
    const h = harness();
    h.act("steal");
    h.world.scheduler.runUntil(FIXTURE.epochMs);
    const ownerMind = h.world.runner.state.minds[2];
    const observation = ownerMind.observations.find((o) => o.about === h.visitor.id && o.attribute === "theft")!;
    expect(observation).toBeDefined();
    const job = h.world.state.jobs.find((entry) => entry.event.id === "test.1");
    if (observation.kind === "null") {
      expect(job).toBeUndefined();
      expect(h.world.bus.since().some((event) => event.cause === "test.1" && (event.payload as Outcome).reason === "theft undetected")).toBe(true);
    } else expect(job?.stage).toBe("caught");
    expect(Object.keys(h.world.random.state()).some((key) => key.includes("detect"))).toBe(false);
    expect(Object.keys(h.world.runner.state.streams)).toContain(`cognition.perception.detect@${h.owner.id}`);
  });

  it.each(["chase", "let_go", "confront"])("detected theft waits for O's %s decision", (answer) => {
    const h = harness();
    const theft = h.act("steal");
    h.world.state.jobs[0].detected = true; // supplied perception result isolates resolution from sensory mathematics.
    h.world.resolveDue(h.ctx());
    expect(h.outcomes).toHaveLength(0);
    h.act(answer, h.owner, h.visitor);
    expect(h.outcomes.filter((o) => o.cause === theft.id)).toHaveLength(1);
    expect(h.world.state.jobs).toHaveLength(0);
    if (answer === "chase") expect(h.world.state.stock).toBe(6);
    if (answer === "let_go") expect(h.world.state.stock).toBe(5);
    if (answer === "confront") expect(h.world.state.bodies.reduce((sum, body) => sum + body.injuries.length, 0)).toBe(1);
  });

  it("Bradley–Terry uses k=2, ratio=1.5, stable endpoints, and a .3 capacity drop lasting two days", () => {
    expect(fightProbability(2 / 3, 1)).toBeCloseTo(1 / (1 + 1.5 ** 2));
    expect(fightProbability(0, 1)).toBe(0); expect(fightProbability(1, 0)).toBe(1); expect(fightProbability(0, 0)).toBe(0.5);
    expect(fightProbability(1e200, 1e200)).toBe(0.5);
    expect(() => fightProbability(-1, 1)).toThrow();
    const h = harness(); h.act("fight");
    const loser = h.world.state.bodies.find((body) => body.injuries.length)!;
    expect(h.world.capacity(loser)).toBeCloseTo(loser.baseCapacity - 0.3);
    expect(loser.pain).toBeGreaterThan(0);
    const until = FIXTURE.epochMs + 2 * FIXTURE.dayMs;
    h.world.bodyStep(until - 1); expect(loser.injuries).toHaveLength(1);
    h.world.bodyStep(until); expect(loser.injuries).toHaveLength(0); expect(loser.pain).toBe(0);
  });

  it("leave remains away for six epochs and finds one unit with the declared 0.5 fixture probability", () => {
    let found = 0;
    for (let seed = 1; seed <= 100; seed++) {
      const h = harness(seed); const leave = h.act("leave");
      h.world.resolveDue(h.ctx(6 * FIXTURE.epochMs)); expect(h.outcomes).toHaveLength(0);
      expect(h.world.stimuli(h.visitor).some((cue) => cue.about === "stall")).toBe(false);
      h.world.resolveDue(h.ctx(7 * FIXTURE.epochMs));
      expect(h.outcomes.filter((o) => o.cause === leave.id)).toHaveLength(1);
      found += h.world.state.found; h.world.assertInvariants();
    }
    expect(Math.abs(found - 50)).toBeLessThan(3 * Math.sqrt(100 * 0.5 * 0.5));
  });

  it("hunger rises by Δ/day, eating lowers it by .25, and stock + eaten + held is conserved", () => {
    const h = harness();
    h.world.bodyStep(FIXTURE.epochMs);
    expect(h.visitor.hunger).toBeCloseTo(0.6 + 1 / 144);
    h.act("ask"); h.act("give", h.owner, h.visitor);
    expect(h.visitor.hunger).toBeCloseTo(0.6 + 1 / 144 - 0.25);
    for (let i = 2; i <= 144; i++) { h.world.bodyStep(i * FIXTURE.epochMs); h.world.assertInvariants(); }
    expect(h.visitor.hunger).toBe(1);
    expect(h.world.state.eaten).toBeGreaterThan(1); // O eats its own stock as hunger rises.
  });

  it("naive probabilities read only beliefs about generosity, vigilance, trust and capacity", () => {
    const h = harness(); const mind = h.world.runner.state.minds[0];
    const actions = h.world.configs[mind.config].generation.repertoire;
    let beliefs = mind.memory.beliefs;
    for (const action of actions) beliefs = setBelief(beliefs, action.target!, `available:${action.id}`, categorical(["no", "yes"], [0, 1]));
    beliefs = setBelief(beliefs, "owner", "generosity", categorical(["low", "high"], [0.1, 0.9]));
    beliefs = setBelief(beliefs, "owner", "vigilance", categorical(["low", "high"], [0.2, 0.8]));
    beliefs = setBelief(beliefs, "owner", "trust", categorical(["low", "high"], [0.3, 0.7]));
    const p = (id: string) => actions.find((action) => action.id === id)!.naiveModel(beliefs).probabilities[0];
    expect(p("ask")).toBeCloseTo(0.9); expect(p("steal")).toBeCloseTo(0.2); expect(p("deceive")).toBeCloseTo(0.7);
    expect(p("fight")).toBeCloseTo(fightProbability(2 / 3, 1));
    h.world.state.stock = 0; h.owner.baseCapacity = 0;
    expect(p("ask")).toBeCloseTo(0.9); expect(p("fight")).toBeCloseTo(fightProbability(2 / 3, 1));
    expect(getBelief(beliefs, "owner", "generosity")).toBeDefined();
  });
});

describe("hungry pair kernel integration and headless CLI", () => {
  it("repeats canonical traces, replays the initial snapshot/input log, and records changes and attributions", () => {
    const one = runHungryPair({ seed: 19, epochs: 8 });
    const repeat = runHungryPair({ seed: 19, epochs: 8 });
    expect(canonical(one)).toBe(canonical(repeat));
    expect(one.replayed).toBe(true);
    expect(canonical(one)).not.toBe(canonical(runHungryPair({ seed: 20, epochs: 8 })));
    expect(one.beliefDeltas.some((delta) => delta.updates.some((update) => update.kl !== 0))).toBe(true);
    expect(one.attributions).toHaveLength(one.outcomes.length);
    const censored = one.outcomes.filter((event) => (event.payload as Outcome).result === "unfinished");
    expect(censored.every((event) => (event.payload as Outcome).reason === "unfinished at horizon")).toBe(true);
  }, 30_000);

  it("seeded day completes exactly 144 body/cognition/resolution epochs with one causal outcome per intention", () => {
    const world = new HungryPairWorld({ seed: 1 });
    const trace = world.run();
    expect(trace.epochs).toBe(144); expect(trace.final.epoch).toBe(144); expect(trace.history).toHaveLength(144);
    expect(trace.decisions).toHaveLength(3 * 144);
    const intentions = world.bus.since().filter((event) => event.type === "cognition.intention");
    expect(trace.outcomes).toHaveLength(intentions.length);
    for (const event of intentions) expect(trace.outcomes.filter((outcome) => outcome.cause === event.id)).toHaveLength(1);
    for (const frame of trace.history) {
      expect(frame.stock + frame.eaten + frame.bodies.reduce((sum, body) => sum + body.held, 0)).toBe(6 + frame.found);
      expect(frame.bodies.every((body) => body.hunger >= 0 && body.hunger <= 1)).toBe(true);
    }
    for (const decision of trace.decisions) {
      expect(decision.candidates.length).toBeGreaterThanOrEqual(2);
      expect(decision.candidates.reduce((sum, candidate) => sum + candidate.probability, 0)).toBeCloseTo(1);
    }
    expect(world.runner.state.ignoredOutcomes).toEqual([]);
    expect(world.runner.state.minds.every((mind) => mind.intentions.every((record) => record.outcomeEvent !== undefined))).toBe(true);
    expect(trace.replayed).toBe(true);
  }, 300_000);

  it("accepts repeated --param overrides and rejects missing/unknown/invalid CLI values", () => {
    expect(parseArguments(["--seed", "17", "--param", "beta=2", "--param", "eta=0.5"])).toEqual({ seed: 17, params: { beta: 2, eta: 0.5 } });
    for (const args of [[], ["--seed"], ["--seed", "1.2"], ["--seed", "1", "--param", "nope=2"],
      ["--seed", "1", "--param", "eta=2"], ["--seed", "1", "--param", "beta=NaN"],
      ["--seed", "1", "--seed", "2"], ["--seed", "1", "--param", "beta=1", "--param", "beta=2"]]) {
      expect(() => parseArguments(args)).toThrow();
    }
    expect(() => cognitiveParams({ n: 2, m: 3 })).toThrow();
  });
});
