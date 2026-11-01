import { Runner } from "@rex/kernel";
import { describe, expect, it } from "vitest";
import { generateActions } from "../src/actions.ts";
import { createMindsState, MindsRunner, reduceMinds } from "../src/mind.ts";
import type { MindCommand } from "../src/mind.ts";
import { DEFAULT_COGNITIVE_PARAMS } from "../src/types.ts";
import { configs, mindInput } from "./composition-fixtures.ts";
import { action, generation, view, wait } from "./decision-fixtures.ts";

const terms = { quantity: 3, price_max: 2 };
function setup(data?: Readonly<Record<string, number>>) {
  const acquire = action("acquire", {
    ...(data === undefined ? {} : { terms: data }),
    outcomeSpace: [{ id: "ok", deficits: {}, goalProgress: { goal: 1 } }],
  });
  const configured = { baseline: { ...configs.baseline, generation: { repertoire: [acquire], wait } } };
  const initial = createMindsState(72);
  const runner = new MindsRunner(initial, configured);
  runner.run({ type: "addMind", mind: mindInput({
    needs: { needs: [], goals: [{ id: "goal", value: 1, progress: 0 }] },
    params: { ...DEFAULT_COGNITIVE_PARAMS, beta: 1000 },
  }) });
  runner.run({ type: "decide", mind: "mind.0001", t: 1000 });
  return { runner, initial, configured };
}

describe("intention terms (DESIGN §2.4)", () => {
  it("passes host numbers untouched through frozen candidates, intentions and event data", () => {
    const candidate = generation([action("acquire", { terms })]).candidates[0];
    expect(candidate.terms).toEqual(terms);
    expect(Object.isFrozen(candidate)).toBe(true);
    expect(Object.isFrozen(candidate.effects[0].deficits)).toBe(true);
    expect(Object.isFrozen(candidate.terms)).toBe(true);
    expect(candidate.terms).not.toBe(terms);
    expect(Object.isFrozen(terms)).toBe(false);
    const { runner } = setup(terms);
    const intention = runner.state.minds[0].current!;
    expect(intention.action).toBe("acquire");
    expect(intention.terms).toEqual(terms);
    expect(Object.isFrozen(intention.terms)).toBe(true);
    const event = runner.events.find((event) => event.type === "cognition.intention")!;
    expect(event.payload).toMatchObject({ action: "acquire", terms });
    expect(Object.isFrozen((event.payload as typeof intention).terms)).toBe(true);
  });

  it("omits absent terms, including the fallback and serialized event payload", () => {
    for (const candidate of generation([action("acquire")]).candidates) {
      expect(candidate.terms).toBeUndefined();
      expect(candidate).not.toHaveProperty("terms");
    }
    const { runner } = setup();
    expect(runner.state.minds[0].current!.terms).toBeUndefined();
    expect(JSON.stringify(runner.events)).not.toContain('"terms"');
    expect(() => generateActions({ repertoire: [], wait: { ...wait, terms },
      body: { capacity_functional: 1 } }, view())).toThrow(RangeError);
  });

  it("rejects non-finite and non-number terms even on ineligible repertoire entries", () => {
    for (const value of [NaN, Infinity, -Infinity, "3", null]) {
      for (const capacityRequired of [0, 2]) {
        expect(() => generation([action("acquire", {
          terms: { quantity: value as number }, capacityRequired,
        })])).toThrow("Term values must be finite numbers");
      }
    }
    expect(generation([action("acquire", { terms: { signed: -2, zero: 0 } })]).candidates[0].terms)
      .toEqual({ signed: -2, zero: 0 });
  });

  it("produces byte-identical runs and reproduces the event from the initial snapshot", () => {
    const first = setup(terms);
    const second = setup(terms);
    expect(JSON.stringify(second.runner.events)).toBe(JSON.stringify(first.runner.events));
    expect(JSON.stringify(second.runner.state)).toBe(JSON.stringify(first.runner.state));
    const log: MindCommand[] = JSON.parse(JSON.stringify(first.runner.log));
    const replay = Runner.replay(log, (state, command) => reduceMinds(state, command, first.configured),
      undefined, JSON.parse(JSON.stringify(first.initial)));
    expect(JSON.stringify(replay.events)).toBe(JSON.stringify(first.runner.events));
    expect(JSON.stringify(replay.state)).toBe(JSON.stringify(first.runner.state));
  });
});
