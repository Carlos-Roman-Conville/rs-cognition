import { describe, expect, it } from "vitest";
import { createRecognitionReader, recognition } from "../src/index.ts";
import type { Belief, BeliefStore } from "../src/index.ts";

function store(belief: Belief, domain = "tax"): BeliefStore {
  return { entries: [{ about: "office-handle", attribute: "ought_obey:" + domain,
    belief, prior: belief, origin: "given" }] };
}

function categorical(p: number): Belief {
  return { kind: "categorical", values: ["false", "true"], probabilities: [1 - p, p] };
}

function reader(beliefs: BeliefStore) {
  return createRecognitionReader({
    beliefs: person => person === "person" ? beliefs : undefined,
    handle: (person, actor) => person === "person" && actor === "office" ? "office-handle" : undefined,
  });
}

describe("Government recognition port", () => {
  it("reads exact P(true) from a hand-built store regardless of category order", () => {
    const beliefs = store(categorical(0.73));
    expect(recognition(beliefs, "office-handle", "tax")).toBe(0.73);
    expect(reader(beliefs).recognition("person", "office", "tax")).toBe(0.73);
    expect(recognition(store(categorical(0)), "office-handle", "tax")).toBe(0);
  });

  it("returns null, never zero, for missing beliefs, unknown people and unmapped actors", () => {
    const beliefs = store(categorical(0.73));
    const port = reader(beliefs);
    for (const value of [
      recognition(beliefs, "office-handle", "justice"),
      recognition(beliefs, "unknown-handle", "tax"),
      port.recognition("person", "office", "justice"),
      port.recognition("unknown", "office", "tax"),
      port.recognition("person", "unknown", "tax"),
    ]) {
      expect(value).toBeNull();
      expect(value).not.toBe(0);
    }
  });

  it.each<Belief>([
    { kind: "gaussian", mean: 0.7, variance: 0.1 },
    { kind: "existence", probability: 0.7 },
    { kind: "categorical", values: ["false"], probabilities: [1] },
  ])("throws a RangeError naming the key for invalid recognition belief %j", belief => {
    const read = () => reader(store(belief)).recognition("person", "office", "tax");
    expect(read).toThrow(RangeError);
    expect(read).toThrow('"office-handle","ought_obey:tax"');
  });

  it("reads two domains independently without mutating any store data", () => {
    const beliefs: BeliefStore = { entries: [
      ...store(categorical(0.73), "tax").entries,
      ...store(categorical(0.21), "justice").entries,
    ] };
    const before = structuredClone(beliefs);
    const port = reader(beliefs);
    expect(port.recognition("person", "office", "tax")).toBe(0.73);
    expect(port.recognition("person", "office", "justice")).toBe(0.21);
    expect(port.recognition("person", "office", "missing")).toBeNull();
    expect(beliefs).toEqual(before);
  });
});
