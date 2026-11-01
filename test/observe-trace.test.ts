import { describe, expect, it } from "vitest";
import {
  categorical, createMindsState, existence, gaussian, getBelief, MindsRunner, nullPersonality,
  observeMemory, reduceMinds, setBelief, DEFAULT_COGNITIVE_PARAMS,
} from "../src/index.ts";
import type { MemoryState, Observation, ObservationTrace } from "../src/index.ts";
import { configs, mindInput } from "./composition-fixtures.ts";

const needs = { needs: [], goals: [] };
const observations: readonly Observation[] = [
  { cue: "length", about: "subjective/object", attribute: "length", channel: "sight", t: 1,
    kind: "real", value: 6, model: { P_H: 0.9, P_FA: 0.1, sigma: 2 } },
  { cue: "colour", about: "subjective/object", attribute: "colour", channel: "sight", t: 1,
    kind: "categorical", value: "red", model: { P_H: 0.9, P_FA: 0.1, q: 0.75 } },
];
function memory(): MemoryState {
  return { beliefs: setBelief(setBelief({ entries: [] }, "subjective/object", "length", gaussian(2, 4)),
    "subjective/object", "colour", categorical(["red", "blue"], [0.5, 0.5])), episodes: [], reliability: [] };
}
const observe = (o = observations, m = memory()) => observeMemory(o, m, needs, nullPersonality, DEFAULT_COGNITIVE_PARAMS, 1);

describe("public observation trace (DESIGN 2.1, 2.3, 2.5, 7)", () => {
  it("records hand-computed Gaussian and categorical updates and reuses applied posteriors", () => {
    const before = memory(), result = observe(observations, before);
    const trace: ObservationTrace = result.trace;
    const [real, category] = trace.updates;
    expect(real).toMatchObject({ cue: "length", observationIndex: 0, about: "subjective/object", attribute: "length",
      prior: gaussian(2, 4), posterior: gaussian(4, 2) });
    expect(real.kl).toBeCloseTo(0.5 * (0.5 - 1 - Math.log(0.5) + 1));
    expect(category.prior).toEqual(categorical(["red", "blue"], [0.5, 0.5]));
    expect(category.posterior.kind).toBe("categorical");
    if (category.posterior.kind === "categorical") {
      expect(category.posterior.probabilities[0]).toBeCloseTo(0.75);
      expect(category.posterior.probabilities[1]).toBeCloseTo(0.25);
    }
    expect(category.kl).toBeCloseTo(0.75 * Math.log(1.5) + 0.25 * Math.log(0.5));
    for (const update of trace.updates) {
      expect(update.posterior).toBe(getBelief(result.beliefs, update.about, update.attribute));
      expect(Object.keys(update)).toEqual(["cue", "observationIndex", "attribute", "about", "prior", "posterior", "kl"]);
    }
    expect(before).toEqual(memory());
  });

  it("is empty for no observations or undeclared attributes", () => {
    expect(observe([]).trace.updates).toEqual([]);
    expect(observe([{ ...observations[0], about: "unknown" }]).trace.updates).toEqual([]);
  });

  it("orders repeated observations and existence evidence without losing intermediate priors", () => {
    const m = memory();
    const result = observe([observations[0], observations[0]], {
      ...m, beliefs: setBelief(m.beliefs, "subjective/object", "exists", existence(0.5)),
    });
    expect(result.trace.updates.map((u) => [u.observationIndex, u.attribute])).toEqual([
      [0, "length"], [0, "exists"], [1, "length"], [1, "exists"],
    ]);
    expect(result.trace.updates[2].prior).toBe(result.trace.updates[0].posterior);
  });

  it("serializes singular KL explicitly and retains zero deltas for frozen learning", () => {
    const singular = observe([{ ...observations[0], kind: "real", value: 6, model: { P_H: 1, P_FA: 0, sigma: 0 } }]);
    expect(singular.trace.updates[0].kl).toBe("Infinity");
    expect(JSON.parse(JSON.stringify(singular.trace))).toEqual(singular.trace);
    const frozen = observeMemory(observations, memory(), needs, nullPersonality, { ...DEFAULT_COGNITIVE_PARAMS, eta: 0 }, 1);
    expect(frozen.trace.updates.every((u) => u.kl === 0)).toBe(true);
  });

  it("is byte-identical across runs and command-log replay, exposes beliefs only, and adds no events or state log", () => {
    const run = () => {
      const runner = new MindsRunner(createMindsState(8), configs);
      runner.run({ type: "addMind", mind: mindInput({ memory: memory() }) });
      const result = runner.run({ type: "observe", mind: "mind.0001", t: 1, observations });
      expect(result.events).toEqual([]);
      expect(result.state.minds[0].memory).not.toHaveProperty("trace");
      return { runner, trace: result.observationTrace };
    };
    const first = run();
    expect(JSON.stringify(run().trace)).toBe(JSON.stringify(first.trace));
    let state = createMindsState(8), replayTrace: ObservationTrace | undefined;
    for (const command of JSON.parse(JSON.stringify(first.runner.log))) {
      const result = reduceMinds(state, command, configs);
      state = result.state;
      if (command.type === "observe") replayTrace = result.observationTrace;
    }
    expect(JSON.stringify(replayTrace)).toBe(JSON.stringify(first.trace));
    expect(first.trace).toEqual(observe().trace);
    expect(JSON.stringify(first.trace)).not.toMatch(/trueValue|present|detectability|world/);
  });
});
