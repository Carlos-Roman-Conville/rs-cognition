import { categorical } from "../src/beliefs.ts";
import { generateActions } from "../src/actions.ts";
import type { ActionDefinition } from "../src/actions.ts";
import { evaluateActions } from "../src/evaluate.ts";
import { DEFAULT_COGNITIVE_PARAMS } from "../src/types.ts";
import type { CognitiveParams, MindView } from "../src/types.ts";

// Proposed test fixtures only, not an empirical personality or behavioral calibration.
export const view = (params: Partial<CognitiveParams> = {}): MindView => ({
  beliefs: { entries: [] }, needs: { needs: [], goals: [{ id: "goal", value: 2, progress: 0.5 }] },
  params: { ...DEFAULT_COGNITIVE_PARAMS, gamma: 1, lambda: 1, ...params },
});

export const action = (id: string, overrides: Partial<ActionDefinition> = {}): ActionDefinition => ({
  id, targetKind: "none", domain: "strategy", preconditions: [], duration: 1, capacityRequired: 0, cost: 0,
  outcomeSpace: [{ id: "ok", deficits: {}, goalProgress: {}, success: false }],
  naiveModel: () => categorical(["ok"], [1]), ...overrides,
});
export const wait = action("wait");
export const generation = (repertoire: readonly ActionDefinition[], ctx = view()) =>
  generateActions({ repertoire, wait, body: { capacity_functional: 1 } }, ctx);
export const evaluate = (repertoire: readonly ActionDefinition[], ctx = view()) =>
  evaluateActions(generation(repertoire, ctx), ctx, [], {}, 1000);
export const scored = (id: string, utility: number): ActionDefinition => action(id, {
  outcomeSpace: [{ id: "ok", deficits: {}, goalProgress: { goal: (utility + 1) / 2 }, success: true }],
});
