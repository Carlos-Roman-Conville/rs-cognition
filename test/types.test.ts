import { expect, it } from "vitest";
import { DEFAULT_COGNITIVE_PARAMS } from "../src/types.ts";
import type { MindView, Observation } from "../src/types.ts";

it("DESIGN §3 supplies finite defaults for every theta and the drive exponents", () => {
  expect(Object.keys(DEFAULT_COGNITIVE_PARAMS)).toEqual(["beta", "lambda", "gamma", "eta", "alpha0", "d", "tau", "s", "kappa", "k", "n", "m"]);
  expect(Object.values(DEFAULT_COGNITIVE_PARAMS).every(Number.isFinite)).toBe(true);
  expect(DEFAULT_COGNITIVE_PARAMS.n).toBeGreaterThan(DEFAULT_COGNITIVE_PARAMS.m);
  expect(DEFAULT_COGNITIVE_PARAMS.m).toBeGreaterThanOrEqual(1);
  expect(DEFAULT_COGNITIVE_PARAMS.d).toBe(0.5);
  expect(DEFAULT_COGNITIVE_PARAMS.lambda).toBe(2.25);
  expect(Object.isFrozen(DEFAULT_COGNITIVE_PARAMS)).toBe(true);
});

// Compile-time checks: downstream inputs cannot read objective values or mutate a MindView.
function subjectiveBoundary(observation: Observation, mind: MindView): void {
  // @ts-expect-error observations carry no objective true value
  void observation.trueValue;
  // @ts-expect-error null observations carry no reported value
  if (observation.kind === "null") void observation.value;
  // @ts-expect-error the view's record list is readonly
  mind.beliefs.entries.push({});
  // @ts-expect-error parameters are readonly through the view
  mind.params.eta = 1;
  // @ts-expect-error need weights are readonly through the view
  mind.needs.needs[0].definition.weight = 2;
}
void subjectiveBoundary;
