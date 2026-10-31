import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { streams } from "@rex/kernel";
import formulas from "../personality/eight-function/v1/formulas.json" with { type: "json" };
import stacks from "../personality/eight-function/stacks.json" with { type: "json" };
import { createEightFunctionV1, nullPersonality, policy } from "../src/index.ts";
import type { Candidate, Domain, InterpretParams, LearningParams, PersonalityType, V1CompoundCandidate, V1Context } from "../src/index.ts";
import { action, generation, view, wait } from "./decision-fixtures.ts";
import { runHungryPair } from "../bench/hungry-pair/world.ts";
import { initialMemory, initialNeeds } from "../bench/hungry-pair/models.ts";

const root = join(import.meta.dirname, "..");
const interpretation: InterpretParams = { eta: 0.4, alpha0: 2, lambda: 3, confidence: 0.8, weberFraction: 0.2, testimonyFloor: 0.2 };
const learning: LearningParams = { rate: 1, d: 0.6, beliefHalfLife: 100 };
const domains: Domain[] = ["space", "adaptation", "meta", "cohesion", "body", "people", "strategy", "none"];
const model = (type: PersonalityType, ctx: V1Context = {}) => createEightFunctionV1(type, { etaMin: 0.01, context: () => ctx });
const binary = (id: string): Candidate => ({
  ...generation([action(id)]).candidates[0],
  preconditions: [{ id: "ready", probability: 1 }],
  effects: [
    { id: "yes", deficits: {}, goalProgress: {}, success: true },
    { id: "no", deficits: {}, goalProgress: {}, success: false },
  ], outcomes: { kind: "categorical", values: ["yes", "no"], probabilities: [0.2, 0.8] },
});

describe("DESIGN §9 v1 provenance (read-only matrix access)", () => {
  it("records exactly W, DELTA, F1–F13 and explicit identity exclusions, with crude constants labeled", () => {
    expect(formulas.filter((f) => f.status === "crude").map((f) => f.id)).toEqual([
      "W", "DELTA", ...Array.from({ length: 13 }, (_, i) => `F${i + 1}`),
    ]);
    expect(new Set(formulas.map((f) => f.id)).size).toBe(formulas.length);
    for (const formula of formulas) {
      for (const constant of Object.values(formula.constants)) {
        expect(constant).toMatchObject({ sourced: false, note: "crude constant, not in source" });
      }
      if (formula.status === "off") expect(formula.off_reason).toBeTruthy();
    }
    const design = readFileSync(join(root, "DESIGN.md"), "utf8");
    for (const formula of formulas.filter((f) => /^F\d+$/.test(f.id))) {
      const line = design.split(/\r?\n/).find((line) => line.startsWith(`| ${formula.id} |`))!;
      expect(line.endsWith(`${formula.form} |`)).toBe(true);
    }
  });

  it("finds every exact citation heading and bold item inside that section, never in a neighboring section", () => {
    for (const formula of formulas) for (const cite of [formula.cite, ...(formula.additional_cites ?? [])]) {
      const lines = readFileSync(join(root, cite.file), "utf8").split(/\r?\n/);
      const start = lines.indexOf(cite.heading);
      expect(start, `${formula.id}: ${cite.heading}`).toBeGreaterThanOrEqual(0);
      expect(cite.heading).toMatch(/^#{1,6} /);
      const depth = cite.heading.match(/^#+/)![0].length;
      let end = start + 1;
      while (end < lines.length && !(lines[end].match(/^#+(?= )/)?.[0].length! <= depth)) end++;
      if ("item" in cite && cite.item) expect(lines.slice(start + 1, end).join("\n")).toContain(`**${cite.item}**`);
      expect(["CARLOS", "DERIVED"]).toContain(cite.tag);
    }
  });

  it("derives all 16 stack sets and dominants from THEORY §3a/§3d, with alternating attitudes and inverse order", () => {
    const theory = readFileSync(join(root, "../../Writing/Cognitive Function Diagnostic/personality matrix/THEORY.md"), "utf8");
    expect(Object.keys(stacks)).toHaveLength(16);
    const groups = [...theory.matchAll(/\| `([A-Za-z ]+)` \| ([^\n]+) \|/g)];
    for (const [type, stack] of Object.entries(stacks)) {
      const group = groups.find((row) => row[2].includes(type))!;
      expect([...stack].sort()).toEqual(group[1].split(" ").sort());
      expect(theory).toContain(`${type}(${stack[0]})`);
      expect(stack.map((f) => f[1])).toEqual(type[0] === "E" ? ["e", "i", "e", "i"] : ["i", "e", "i", "e"]);
      const inverse = [...type].map((c) => ({ E: "I", I: "E", N: "S", S: "N", T: "F", F: "T", J: "P", P: "J" })[c]).join("") as PersonalityType;
      expect(stacks[inverse]).toEqual([...stack].reverse());
    }
  });
});

describe("DESIGN §9 v1 hand-computed formulas", () => {
  it.each(Object.keys(stacks) as PersonalityType[])("W/DELTA: %s uses 1, .75, .5, .25 and tilt ±.2", (type) => {
    const p = model(type);
    expect(p.version).toBe("v1");
    expect(p.stack.map((f) => p.weights[f])).toEqual([1, 0.75, 0.5, 0.25]);
    for (const [f, w] of Object.entries(p.weights)) if (!p.stack.includes(f as typeof p.stack[number])) expect(w).toBe(0);
    expect(p.tilt).toBeCloseTo(type[0] === "E" ? 0.2 : -0.2);
  });

  it("F1/F3: external inertia, internal prior, loss aversion and the ten-failure half point", () => {
    expect(model("ENFJ", { failures: 10 }).interpret(interpretation, "none", view())).toMatchObject({
      eta: expect.closeTo(0.48), alpha0: expect.closeTo(1.6), lambda: expect.closeTo(2.16),
    });
    const introvert = model("INFJ", { failures: 10 }).interpret(interpretation, "none", view());
    expect(introvert.eta).toBeCloseTo(0.32);
    expect(introvert.alpha0).toBeCloseTo(2.4);
    expect(introvert.lambda).toBeCloseTo(3.6);
    expect(model("ENFJ").interpret(interpretation, "none", view()).lambda).toBeCloseTo(2.4);
    expect(model("ENFJ", { failures: Number.MAX_SAFE_INTEGER }).interpret(interpretation, "none", view()).lambda).toBeCloseTo(1.92);
    expect(model("ENFJ").interpret({ ...interpretation, eta: 1 }, "none", view()).eta).toBe(1);
    expect(model("INFJ").interpret({ ...interpretation, eta: 0 }, "none", view()).eta).toBe(0.01);
  });

  it("F2: normalized powers flatten or sharpen, retain zero mass, and remain stable at extreme magnitudes", () => {
    const ext = model("ENFJ").pertinence({ a: 1, b: 32, zero: 0 }, view());
    const int = model("INFJ").pertinence({ a: 1, b: 32 }, view());
    expect(ext.a).toBeCloseTo(1 / 17); expect(ext.b).toBeCloseTo(16 / 17); expect(ext.zero).toBe(0);
    expect(int.a).toBeCloseTo(1 / 65); expect(int.b).toBeCloseTo(64 / 65);
    expect(model("INFJ").pertinence({ a: 0, b: 0 }, view())).toEqual({ a: 0, b: 0 });
    expect(model("INFJ").pertinence({}, view())).toEqual({});
    const extreme = model("INFJ").pertinence({ a: Number.MIN_VALUE, b: Number.MAX_VALUE }, view());
    expect(extreme).toEqual({ a: 0, b: 1 });
  });

  it("F4/F5: only the on domain owners boost attention and learning; refinement compounds with external learning", () => {
    const p = createEightFunctionV1(["Se", "Si", "Te", "Ni"], { etaMin: 0.01, context: () => ({ cues: {
      space: { domain: "space" }, meta: { domain: "meta" }, cohesion: { domain: "cohesion" },
    } }) });
    expect(p.pertinence({ space: 1, meta: 1, cohesion: 1 }, view())).toEqual({ space: 2 / 3, meta: 0.5, cohesion: 1 / 3 });
    expect(p.learning(learning, "space", view()).rate).toBe(4.25);
    expect(p.learning(learning, "adaptation", view()).rate).toBe(1.375);
    expect(p.learning(learning, "meta", view()).rate).toBe(1.5);
    expect(p.learning(learning, "cohesion", view())).toBe(learning);
    expect(model("ISFJ").learning(learning, "space", view()).rate).toBe(2.5);
    expect(model("ESTP").learning(learning, "space", view()).rate).toBe(2);
  });

  it("F6/F12: boost physical-present cues, target-only precision and present person evidence, with the Ni prior", () => {
    const p = model("ENFJ", { targeted: true, aboutPerson: true, present: true, cues: {
      now: { domain: "none", physical: true, present: true },
      past: { domain: "none", physical: true },
      theory: { domain: "none", present: true },
    } });
    expect(p.pertinence({ now: 1, past: 1, theory: 1 }, view())).toEqual({ now: 0.5, past: 1 / 3, theory: 1 / 3 });
    const result = p.interpret(interpretation, "people", view());
    expect(result.eta).toBeCloseTo(0.61); expect(result.weberFraction).toBeCloseTo(0.15);
    expect(result.alpha0).toBeCloseTo(2.8);
    const around = model("ENFJ").interpret(interpretation, "people", view());
    expect(around.weberFraction).toBe(0.2); expect(around.eta).toBeCloseTo(0.48);
    expect(model("ENFJ", { present: true }).interpret(interpretation, "space", view()).eta).toBeCloseTo(0.48);
  });

  it("F7: success mass uses the maximum on owner weight, and absent/off domains are identity", () => {
    expect(model("ENFJ").interpret(interpretation, "space", view()).confidence).toBeCloseTo(0.6);
    expect(model("ISFJ").interpret(interpretation, "space", view()).confidence).toBe(0.8);
    expect(model("ISFJ").interpret(interpretation, "adaptation", view()).confidence).toBe(0.5);
    for (const domain of ["cohesion", "meta", "body", "none"] as const) {
      expect(model("ENFJ").interpret(interpretation, domain, view()).confidence).toBe(0.8);
    }
  });

  it("F8: Si retains body/person episodes and person attributes; unrelated memories and disabled drift stay unchanged", () => {
    const p = model("ISFJ");
    expect(p.learning(learning, "body", view())).toEqual({ ...learning, d: 0.3 });
    expect(p.learning(learning, "people", view())).toEqual({ ...learning, d: 0.3, beliefHalfLife: 200 });
    expect(model("ISFJ", { aboutPerson: true }).learning(learning, "meta", view())).toEqual({ ...learning, d: 0.3, beliefHalfLife: 200 });
    expect(p.learning(learning, "none", view())).toBe(learning);
    expect(p.learning({ ...learning, beliefHalfLife: Infinity }, "people", view()).beliefHalfLife).toBe(Infinity);
  });

  it("F9: adds at most round(weight*3) two-step host compounds, in input order, without mutating original candidates", () => {
    const candidates = [binary("a"), binary("b"), binary("c")];
    const before = JSON.stringify(candidates);
    const compound = vi.fn((a: Candidate, b: Candidate) => a === b ? undefined : {
      outcome: "yes", precondition: "ready", candidate: { ...binary(`${a.action} then ${b.action}`), duration: 2 },
    });
    const p = createEightFunctionV1("ENTP", { etaMin: 0.01, compound });
    expect(p.generate(candidates, { kappa: 2 }, view()).candidates.map((c) => c.action)).toEqual([
      "a", "b", "c", "a then b", "a then c", "b then a",
    ]);
    expect(JSON.stringify(candidates)).toBe(before);
    const compoundCandidate = p.generate(candidates, { kappa: 2 }, view()).candidates[3] as V1CompoundCandidate;
    expect(compoundCandidate.steps.map((step) => step.action)).toEqual(["a", "b"]);
    const inferior = createEightFunctionV1("ISFJ", { etaMin: 0.01, compound });
    expect(inferior.generate(candidates, { kappa: 2 }, view()).candidates).toHaveLength(4);
    compound.mockClear();
    expect(createEightFunctionV1("ENFJ", { etaMin: 0.01, compound }).generate(candidates, { kappa: 2 }, view()).candidates).toBe(candidates);
    expect(compound).not.toHaveBeenCalled();
    const invalid = createEightFunctionV1("ENTP", { etaMin: 0.01, compound: () => ({
      outcome: "missing", precondition: "ready", candidate: binary("invalid"),
    }) });
    expect(() => invalid.generate(candidates, { kappa: 1 }, view())).toThrow("Compound");
  });

  it("F10: blends other-choice probabilities with the own policy run in the other's believed situation", () => {
    const candidate = binary("depends-on-choice");
    const other = view({ beta: 0 });
    const ownPolicy = vi.fn((_candidate, situation, self) => {
      // Equal-EU choices yield .5/.5 by the real policy; the caller maps those choices to outcomes.
      const selected = policy([], { beliefs: situation.beliefs, episodes: [], reliability: [], decision: {
        mind: "self-simulation", counters: {}, context: {}, generation: {
          repertoire: [action("yes")], wait: { ...wait, id: "no" }, body: { capacity_functional: 1 },
        },
      } }, situation.needs, self, situation.params, streams(7).get("cognition.decision.select", "self-simulation"), 1000);
      return { kind: "categorical" as const, values: ["yes", "no"], probabilities: selected.trace.candidates.map((c) => c.probability) };
    });
    const situation = vi.fn((c: Candidate) => c === candidate ? other : undefined);
    const p = createEightFunctionV1("ENFJ", { etaMin: 0.01, otherMind: { situation, ownPolicy } });
    const independent = binary("independent");
    const result = p.generate([candidate, independent], { kappa: 1 }, view());
    expect(result.candidates[0].outcomes.probabilities[0]).toBeCloseTo(0.425);
    expect(result.candidates[0].outcomes.probabilities[1]).toBeCloseTo(0.575);
    expect(result.candidates[1]).toBe(independent);
    expect(ownPolicy).toHaveBeenCalledTimes(1);
    expect(ownPolicy.mock.calls[0][1]).toBe(other);
    expect(situation).toHaveBeenCalledTimes(2); // no recursive F10 in the inner policy.
    expect(candidate.outcomes.probabilities).toEqual([0.2, 0.8]);
  });

  it("F11/F13: commitment and testimony reliability follow the stated arithmetic and boundaries", () => {
    expect(model("ENFJ").generate([], { kappa: 2 }, view()).params.kappa).toBe(3.5);
    expect(model("ENTP").generate([], { kappa: 2 }, view()).params.kappa).toBe(0);
    expect(model("ENFJ").generate([], { kappa: 0 }, view()).params.kappa).toBe(0);
    const p = model("ENTJ", { testimony: true });
    expect(p.interpret(interpretation, "none", view()).testimonyFloor).toBeCloseTo(0.6);
    expect(p.interpret({ ...interpretation, testimonyFloor: 1 }, "none", view()).testimonyFloor).toBe(1);
    expect(p.interpret({ ...interpretation, testimonyFloor: 0 }, "none", view()).testimonyFloor).toBe(0.5);
    expect(model("ENTJ").interpret(interpretation, "none", view()).testimonyFloor).toBe(0.2);
  });

  it("F10: convex mixtures preserve endpoint probabilities for every Ni weight and reject mismatched simulations", () => {
    for (const type of ["INFJ", "ENFJ", "ISTP", "ESTP"] as const) {
      for (const belief of [0, 0.5, 1]) for (const self of [0, 0.5, 1]) {
        const candidate = { ...binary("choice"), outcomes: { kind: "categorical" as const,
          values: ["yes", "no"], probabilities: [belief, 1 - belief] } };
        const p = createEightFunctionV1(type, { etaMin: 0.01, otherMind: {
          situation: () => view(), ownPolicy: () => ({ kind: "categorical", values: ["yes", "no"], probabilities: [self, 1 - self] }),
        } });
        const probabilities = p.generate([candidate], { kappa: 1 }, view()).candidates[0].outcomes.probabilities;
        expect(probabilities[0]).toBeCloseTo((1 - p.weights.Ni) * belief + p.weights.Ni * self);
        expect(probabilities.reduce((a, b) => a + b, 0)).toBeCloseTo(1);
        for (const value of probabilities) { expect(value).toBeGreaterThanOrEqual(0); expect(value).toBeLessThanOrEqual(1); }
      }
    }
    const p = createEightFunctionV1("INFJ", { etaMin: 0.01, otherMind: {
      situation: () => view(), ownPolicy: () => ({ kind: "categorical", values: ["no", "yes"], probabilities: [0.5, 0.5] }),
    } });
    expect(() => p.generate([binary("choice")], { kappa: 1 }, view())).toThrow("outcome order");
  });
});

describe("DESIGN §9 v1 identity, motivation and integration fences", () => {
  it("every off item exposes byte-identical null hooks, and off-only content changes only F1–F3", () => {
    const p = createEightFunctionV1(["Fe", "Ti", "Fi"], { etaMin: 0.01 });
    const ctx = view(); const base = { a: 1, b: 2 }; const candidates = [binary("a")]; const params = { kappa: 2 };
    expect(Object.keys(p.off)).toEqual(formulas.filter((f) => f.status === "off").map((f) => f.id));
    for (const off of Object.values(p.off)) {
      expect(JSON.stringify(off.pertinence(base, ctx))).toBe(JSON.stringify(nullPersonality.pertinence(base, ctx)));
      expect(JSON.stringify(off.generate(candidates, params, ctx))).toBe(JSON.stringify(nullPersonality.generate(candidates, params, ctx)));
      for (const domain of domains) {
        expect(JSON.stringify(off.interpret(interpretation, domain, ctx))).toBe(JSON.stringify(nullPersonality.interpret(interpretation, domain, ctx)));
        expect(JSON.stringify(off.learning(learning, domain, ctx))).toBe(JSON.stringify(nullPersonality.learning(learning, domain, ctx)));
      }
    }
    for (const domain of domains) {
      const interpreted = p.interpret(interpretation, domain, ctx);
      expect(interpreted).toEqual({ ...interpretation, eta: interpretation.eta * (1 + p.tilt),
        alpha0: interpretation.alpha0 * (1 - p.tilt), lambda: interpretation.lambda * (1 - p.tilt) });
      expect(p.learning(learning, domain, ctx)).toBe(learning);
    }
    expect(p.generate(candidates, params, ctx)).toEqual(nullPersonality.generate(candidates, params, ctx));
  });

  it.each(Object.keys(stacks) as PersonalityType[])("%s preserves need definitions, weights, deficits, drives and setpoints byte-for-byte; probabilities stay bounded", (type) => {
    const memory = initialMemory(["peer"]);
    const ctx = { ...view(), beliefs: memory.beliefs, needs: initialNeeds(memory, false) };
    const before = JSON.stringify(ctx);
    const p = model(type, { present: true, aboutPerson: true, targeted: true, testimony: true, failures: 100 });
    p.pertinence({ food: 1, person: 2 }, ctx);
    p.generate([binary("a")], { kappa: 2 }, ctx);
    for (const domain of domains) {
      p.learning(learning, domain, ctx);
      for (const value of [0, Number.MIN_VALUE, 0.5, 1]) {
        const result = p.interpret({ ...interpretation, eta: value, confidence: value, testimonyFloor: value }, domain, ctx);
        expect(result.eta).toBeGreaterThan(0); expect(result.eta).toBeLessThanOrEqual(1);
        for (const probability of [result.confidence, result.testimonyFloor]) {
          expect(probability).toBeGreaterThanOrEqual(0); expect(probability).toBeLessThanOrEqual(1);
        }
      }
    }
    expect(JSON.stringify(ctx)).toBe(before);
  });

  it("rejects invalid stack/configuration and nonfinite hook inputs instead of producing NaN", () => {
    expect(() => createEightFunctionV1(["Se", "Se"], { etaMin: 0.01 })).toThrow();
    expect(() => createEightFunctionV1(["Se", "Ne"], { etaMin: 0.01 })).toThrow();
    for (const etaMin of [0, -1, 2, NaN, Infinity]) expect(() => createEightFunctionV1("ENTP", { etaMin })).toThrow();
    for (const failures of [-1, 0.5, Infinity]) expect(() => model("ENTP", { failures }).interpret(interpretation, "none", view())).toThrow();
    expect(() => model("ENTP").pertinence({ a: Infinity }, view())).toThrow();
    expect(() => model("ENTP").interpret({ ...interpretation, eta: NaN }, "none", view())).toThrow();
  });

  it("runs one hungry-pair epoch through policy with v1, deterministically, while the benchmark default stays null", () => {
    const options = { seed: 2673, epochs: 1, personality: model("ENFJ") };
    const run = runHungryPair(options);
    expect(run.epochs).toBe(1); expect(run.decisions.length).toBeGreaterThan(0); expect(run.replayed).toBe(true);
    expect(JSON.stringify(runHungryPair(options))).toBe(JSON.stringify(run));
    expect(JSON.stringify(runHungryPair({ seed: 2673, epochs: 1 }))).toBe(
      JSON.stringify(runHungryPair({ seed: 2673, epochs: 1, personality: nullPersonality })),
    );
  });
});
