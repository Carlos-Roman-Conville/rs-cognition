import { generateActions } from "../src/actions.ts";
import { evaluateActions } from "../src/evaluate.ts";
import { selectAction } from "../src/select.ts";
import { nullPersonality } from "../src/personality.ts";
import { createEightFunctionV1 } from "../src/personality/eight-function/v1.ts";
import { action, scored, view, wait } from "./decision-fixtures.ts";

export function goldenTraces() {
  const models = [nullPersonality, ...(["ESTP", "ISFJ", "INTJ", "ENFP"] as const)
    .map(type => createEightFunctionV1(type, { etaMin: 0.01 }))];
  // Existing decision fixtures: equal-utility actions and the scored selection fixture.
  return models.flatMap((personality, i) => [
    [action("a"), action("b")], [scored("a", -0.5), scored("b", 0.75)],
  ].map((repertoire, j) => {
    const ctx = view();
    const generated = generateActions({ repertoire, wait, body: { capacity_functional: 1 } }, ctx, personality);
    const evaluated = evaluateActions(generated, ctx, [], {}, 1000, personality);
    return { name: `${["null", "ESTP", "ISFJ", "INTJ", "ENFP"][i]}-${j}.json`,
      bytes: JSON.stringify(selectAction(evaluated, { mind: "mind.0001", counters: {} }, () => 0.25).trace) };
  }));
}
