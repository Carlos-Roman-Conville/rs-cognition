import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { streams } from "@rex/kernel";
import stacks from "../personality/eight-function/stacks.json" with { type: "json" };
import { generateActions, evaluateActions, selectAction } from "../src/index.ts";
import type { CognitiveFunction, PersonalityType, SelectionTrace } from "../src/index.ts";
import { createPersonality } from "../experimental/personality-v2/select.ts";
import { runForage } from "../bench/scenarios/s1-forage/world.ts";
import { goldenTraces } from "./personality-golden-fixtures.ts";
import { action, scored, view, wait } from "./decision-fixtures.ts";

const TYPES = Object.keys(stacks) as PersonalityType[];
const FIXTURE_SEED = 11;
const FIXTURE_EPOCHS = 2;

const TABLE_OPERATIONS = new Set([
  "evaluationTerms", "meaningSelection", "preconditionEvidence", "encoding", "generate",
]);
const FUNCTIONS = new Set<CognitiveFunction>(["Se", "Si", "Ne", "Ni", "Te", "Ti", "Fe", "Fi"]);

const ALL_V2_MASKS: readonly { readonly function: CognitiveFunction; readonly operation: string }[] = [
  { function: "Se", operation: "preconditionEvidence" },
  { function: "Fe", operation: "meaningSelection" },
  { function: "Te", operation: "generate" },
  { function: "Ne", operation: "generate" },
  { function: "Si", operation: "encoding" },
  { function: "Fi", operation: "encoding" },
  { function: "Ti", operation: "encoding" },
  { function: "Fe", operation: "encoding" },
];

function fixtureTrace(configuration: { version: "null" } | { version: "v2"; stack: PersonalityType }) {
  return runForage({ seed: FIXTURE_SEED, epochs: FIXTURE_EPOCHS, configuration }).hostInputLog;
}

function sharedFromSelection(trace: SelectionTrace) {
  return {
    eta: trace.params.eta,
    alpha0: trace.params.alpha0,
    lambda: trace.params.lambda,
    kappa: trace.params.kappa,
    beta: trace.params.beta,
  };
}

function maskedDecision(seed: number, type: PersonalityType) {
  const ctx = { ...view({ beta: 100 }), mind: "mind.0001", t: 1000 as const,
    attended: [{ category: "space", weight: 1 }], candidates: [], trace: { allocations: [] }, operations: [] };
  const model = createPersonality({
    model: "eight-function", version: "v2", type,
    options: { mask: [...ALL_V2_MASKS],
      se: { context: () => ctx, isPresent: () => true, probability: () => 0.9 } },
  });
  const repertoire = [{ ...scored("enter", 1), preconditions: [{ id: "open", probability: () => 0.9 }] }];
  const nullModel = createPersonality({ model: "null" });
  const run = (personality: typeof nullModel) => {
    const generated = generateActions({ repertoire, wait, body: { capacity_functional: 1 } }, ctx, personality);
    const evaluated = evaluateActions(generated, ctx, [], {}, ctx.t, personality);
    return selectAction(evaluated, { mind: ctx.mind, counters: {} },
      streams(seed).get("cognition.decision.select", ctx.mind));
  };
  return { null: run(nullModel), masked: run(model) };
}

describe("DESIGN §22.2 V2 isolation", () => {
  it("(1) every type replays byte-identical traces for the same seed", () => {
    for (const stack of TYPES) {
      const configuration = { version: "v2" as const, stack };
      const once = fixtureTrace(configuration).map(row => row.trace);
      const twice = fixtureTrace(configuration).map(row => row.trace);
      expect(JSON.stringify(twice)).toBe(JSON.stringify(once));
    }
  }, 120_000);

  it("(2) null and four V1 golden stacks stay byte-identical with V2 present", () => {
    const v1Types = ["ESTP", "ISFJ", "INTJ", "ENFP"] as const;
    const models = [
      createPersonality({ model: "null" }),
      ...v1Types.map(type => createPersonality({ model: "eight-function", version: "v1", type, options: { etaMin: 0.01 } })),
    ];
    const names = ["null", ...v1Types];
    const fromSelect = models.flatMap((personality, i) => [
      [action("a"), action("b")], [scored("a", -0.5), scored("b", 0.75)],
    ].map((repertoire, j) => {
      const ctx = view();
      const generated = generateActions({ repertoire, wait, body: { capacity_functional: 1 } }, ctx, personality);
      const evaluated = evaluateActions(generated, ctx, [], {}, 1000, personality);
      return { name: `${names[i]}-${j}.json`,
        bytes: JSON.stringify(selectAction(evaluated, { mind: "mind.0001", counters: {} }, () => 0.25).trace) };
    }));
    for (const { name, bytes } of fromSelect) {
      expect(bytes).toBe(readFileSync(`${import.meta.dirname}/fixtures/personality-golden/${name}`, "utf8"));
    }
    for (const { name, bytes } of goldenTraces()) expect(bytes).toBe(readFileSync(`${import.meta.dirname}/fixtures/personality-golden/${name}`, "utf8"));
  });

  it("(3) V2 never sets shared engine parameters on the S1 fixture", () => {
    const nullRows = fixtureTrace({ version: "null" });
    for (const stack of TYPES) {
      const v2Rows = fixtureTrace({ version: "v2", stack });
      expect(v2Rows).toHaveLength(nullRows.length);
      for (let i = 0; i < nullRows.length; i++) {
        expect(sharedFromSelection(v2Rows[i].trace.selection)).toEqual(sharedFromSelection(nullRows[i].trace.selection));
      }
    }
  }, 120_000);

  it("(4) every V2 execution record names §22.4 table operations and never Ni", () => {
    for (const stack of TYPES) {
      for (const row of fixtureTrace({ version: "v2", stack })) {
        for (const record of row.trace.v2?.operations ?? []) {
          expect(FUNCTIONS.has(record.function as CognitiveFunction)).toBe(true);
          expect(record.function).not.toBe("Ni");
          expect(TABLE_OPERATIONS.has(record.operation)).toBe(true);
        }
      }
    }
  }, 120_000);

  it("(5) masking all V2 operations matches null decisions on the same seed", () => {
    for (const seed of [1, 2, 7]) for (const type of TYPES) {
      const { null: base, masked } = maskedDecision(seed, type);
      expect(masked.intention.action).toBe(base.intention.action);
      expect(masked.intention.target).toBe(base.intention.target);
    }
  });
});
