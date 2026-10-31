import { categorical, setBelief } from "../src/beliefs.ts";
import type { MindInput, MindsConfig } from "../src/mind.ts";
import { DEFAULT_COGNITIVE_PARAMS } from "../src/types.ts";
import type { Observation } from "../src/types.ts";
import { action, wait } from "./decision-fixtures.ts";

// Host fixture only: beliefs about a supplier, with observed yes/no testimony as feedback.
export const offer = action("request", {
  outcomeSpace: [{ id: "yes", deficits: {}, goalProgress: {}, success: true },
    { id: "no", deficits: {}, goalProgress: {}, success: false }],
  naiveModel: (beliefs) => {
    const belief = beliefs.entries[0].belief;
    if (belief.kind !== "categorical") throw new Error("Fixture needs a categorical belief");
    return categorical(["yes", "no"], belief.probabilities);
  },
});
export const configs: MindsConfig = {
  baseline: {
    generation: { repertoire: [offer], wait },
    learning: {
      appraise: ({ observations, intention }) => ({
        outcome: intention.action === "wait" ? "ok" : observations[0]?.kind === "categorical" ? observations[0].value : "no",
      }),
      latents: [{ id: "generosity", kind: "discrete", about: "host/owner", attribute: "generosity",
        domain: "people", likelihood: ({ observations }) => observations[0]?.kind === "categorical" && observations[0].value === "yes"
          ? [0.9, 0.1] : [0.1, 0.9] }],
    },
  },
};
export function mindInput(overrides: Partial<MindInput> = {}): MindInput {
  return {
    config: "baseline", memory: { beliefs: setBelief({ entries: [] }, "host/owner", "generosity",
      categorical(["yes", "no"], [0.5, 0.5])), episodes: [], reliability: [] },
    needs: { needs: [], goals: [] }, capacityFunctional: 1,
    params: { ...DEFAULT_COGNITIVE_PARAMS, beta: 0 }, ...overrides,
  };
}
export const observed = (t = 1000): Observation => ({ cue: "reply", about: "host/owner", attribute: "generosity",
  channel: "report", t, kind: "categorical", value: "no", model: { P_H: 0.9, P_FA: 0.1, q: 0.9 } });
