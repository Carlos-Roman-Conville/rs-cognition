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

// Pre-payment trace captured before implementation.
export const prePaymentTrace = "{\"mind\":\"mind.0001\",\"t\":1000,\"beliefs\":{\"entries\":[]},\"needs\":{\"needs\":[],\"goals\":[{\"id\":\"goal\",\"value\":2,\"progress\":0.5}]},\"params\":{\"beta\":1,\"lambda\":1,\"gamma\":1,\"eta\":1,\"alpha0\":1,\"d\":0.5,\"tau\":0,\"s\":0.4,\"kappa\":0,\"k\":0,\"n\":4,\"m\":3},\"intention\":{\"id\":\"int.0001\",\"mind\":\"mind.0001\",\"action\":\"a\",\"t\":1000,\"expectedOutcomes\":{\"kind\":\"categorical\",\"values\":[\"ok\"],\"probabilities\":[1]},\"status\":\"active\"},\"candidates\":[{\"candidate\":{\"action\":\"a\",\"targetKind\":\"none\",\"domain\":\"strategy\",\"duration\":1,\"cost\":0,\"capacityRequired\":0,\"preconditions\":[],\"effects\":[{\"id\":\"ok\",\"deficits\":{},\"goalProgress\":{\"goal\":0.875},\"success\":true}],\"outcomes\":{\"kind\":\"categorical\",\"values\":[\"ok\"],\"probabilities\":[1]}},\"interpret\":{\"eta\":1,\"alpha0\":1,\"lambda\":1,\"confidence\":1,\"weberFraction\":0,\"testimonyFloor\":0},\"counts\":[1],\"memoryDistribution\":{\"kind\":\"categorical\",\"values\":[\"ok\"],\"probabilities\":[1]},\"expectedOutcomes\":{\"kind\":\"categorical\",\"values\":[\"ok\"],\"probabilities\":[1]},\"outcomes\":[{\"outcome\":\"ok\",\"probability\":1,\"driveReward\":0,\"goalReward\":0.75,\"cost\":0,\"netReward\":0.75,\"value\":0.75}],\"discount\":1,\"expectedUtility\":0.75,\"softmaxProbability\":0.679178699175393,\"probability\":0.679178699175393},{\"candidate\":{\"action\":\"wait\",\"targetKind\":\"none\",\"domain\":\"strategy\",\"duration\":1,\"cost\":0,\"capacityRequired\":0,\"preconditions\":[],\"effects\":[{\"id\":\"ok\",\"deficits\":{},\"goalProgress\":{},\"success\":false}],\"outcomes\":{\"kind\":\"categorical\",\"values\":[\"ok\"],\"probabilities\":[1]}},\"interpret\":{\"eta\":1,\"alpha0\":1,\"lambda\":1,\"confidence\":1,\"weberFraction\":0,\"testimonyFloor\":0},\"counts\":[1],\"memoryDistribution\":{\"kind\":\"categorical\",\"values\":[\"ok\"],\"probabilities\":[1]},\"expectedOutcomes\":{\"kind\":\"categorical\",\"values\":[\"ok\"],\"probabilities\":[1]},\"outcomes\":[{\"outcome\":\"ok\",\"probability\":1,\"driveReward\":0,\"goalReward\":0,\"cost\":0,\"netReward\":0,\"value\":0}],\"discount\":1,\"expectedUtility\":0,\"softmaxProbability\":0.32082130082460697,\"probability\":0.32082130082460697}],\"inputs\":{\"generation\":{\"candidates\":[{\"action\":\"a\",\"targetKind\":\"none\",\"domain\":\"strategy\",\"duration\":1,\"cost\":0,\"capacityRequired\":0,\"preconditions\":[],\"effects\":[{\"id\":\"ok\",\"deficits\":{},\"goalProgress\":{\"goal\":0.875},\"success\":true}],\"outcomes\":{\"kind\":\"categorical\",\"values\":[\"ok\"],\"probabilities\":[1]}},{\"action\":\"wait\",\"targetKind\":\"none\",\"domain\":\"strategy\",\"duration\":1,\"cost\":0,\"capacityRequired\":0,\"preconditions\":[],\"effects\":[{\"id\":\"ok\",\"deficits\":{},\"goalProgress\":{},\"success\":false}],\"outcomes\":{\"kind\":\"categorical\",\"values\":[\"ok\"],\"probabilities\":[1]}}],\"params\":{\"kappa\":0},\"thetaPre\":0.5,\"capacityFunctional\":1,\"checks\":[{\"action\":\"a\",\"capacityRequired\":0,\"preconditions\":[],\"eligible\":true},{\"action\":\"wait\",\"capacityRequired\":0,\"preconditions\":[],\"eligible\":true}]},\"episodes\":[],\"context\":{}},\"commitment\":{\"kappa\":0,\"kept\":false},\"draw\":0.25}";
