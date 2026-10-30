import { describe, expect, it } from "vitest";
import { streams } from "@rex/kernel";
import { generateActions } from "../src/actions.ts";
import { allocateAttention } from "../src/attention.ts";
import { evaluateActions } from "../src/evaluate.ts";
import { nullPersonality } from "../src/personality.ts";
import type { Domain, InterpretParams, LearningParams, PersonalityModel } from "../src/personality.ts";
import { selectAction } from "../src/select.ts";
import { action, view, wait } from "./decision-fixtures.ts";

describe("DESIGN §9 personality slot", () => {
  it("nullPersonality is identity by reference on every hook and every declared domain", () => {
    const ctx = view();
    const base = { resource: 2 };
    const interpretation: InterpretParams = { eta: 0.5, alpha0: 2, lambda: 3, confidence: 0.8, weberFraction: 0.1, testimonyFloor: 0.2 };
    const learning: LearningParams = { rate: 0.4, d: 0.5, beliefHalfLife: 3600 };
    const domains: Domain[] = ["space", "adaptation", "meta", "cohesion", "body", "people", "strategy", "none"];
    expect(nullPersonality.pertinence(base, ctx)).toBe(base);
    for (const domain of domains) {
      expect(nullPersonality.interpret(interpretation, domain, ctx)).toBe(interpretation);
      expect(nullPersonality.learning(learning, domain, ctx)).toBe(learning);
    }
    const candidates = generateActions({ repertoire: [], wait, body: { capacity_functional: 0 } }, ctx).candidates;
    const params = { kappa: 3 };
    const generated = nullPersonality.generate(candidates, params, ctx);
    expect(generated.candidates).toBe(candidates);
    expect(generated.params).toBe(params);
    expect(nullPersonality.id).toBe("null");
    expect(nullPersonality.version).toBe("1");
  });

  it("explicit null hooks produce byte-identical attention, generation, evaluation, selection and RNG states", () => {
    const run = (personality?: PersonalityModel) => {
      const ctx = view();
      const random = streams(2358);
      const attention = allocateAttention([{ cue: "cue", salience: 2, relevance: { resource: 1 } }],
        [{ id: "resource", base: 1, relevance: {} }], ctx, personality?.pertinence);
      const generated = generateActions({ repertoire: [action("host.action")], wait, body: { capacity_functional: 0 } }, ctx, personality);
      const evaluated = evaluateActions(generated, ctx, [], {}, 1000, personality);
      const selected = selectAction(evaluated, { mind: "mind.1", counters: {} }, random.get("cognition.decision.select", "mind.1"));
      return JSON.stringify({ attention, generated, evaluated, selected, random: random.state() });
    };
    expect(run(nullPersonality)).toBe(run());
  });
});
