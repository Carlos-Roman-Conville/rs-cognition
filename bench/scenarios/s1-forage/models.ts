import {
  categorical, createBeliefStore, DEFAULT_COGNITIVE_PARAMS, evaluateNeeds, getBelief, setBelief,
} from "../../../src/index.ts";
import type { ActionDefinition, BeliefStore, MemoryState, MindConfig, NeedDefinition, NeedState, PredictedOutcome } from "../../../src/index.ts";
import { clamp, data, FIXTURE } from "./field.ts";

// fixture rule (DESIGN bench/scenarios §2): one signal need; proposed neutral weights, DESIGN §6 hunger.
export const NEED: NeedDefinition = { id: "hunger", category: "physiological", source: { signal: "body.hunger_signal" },
  setpoint: 0, weight: 1, salienceTags: ["food"] };
export const PARAMS = DEFAULT_COGNITIVE_PARAMS;
export const VALUES = ["0", "1", "2", "done", "failed"];

export function probability(beliefs: BeliefStore, about: string, attribute: string, value: string): number {
  const belief = getBelief(beliefs, about, attribute);
  return belief?.kind === "categorical" ? belief.probabilities[belief.values.indexOf(value)] ?? 0 : 0;
}

export function initialMemory(patches: readonly string[]): MemoryState {
  let beliefs = createBeliefStore();
  // fixture rule (DESIGN bench/scenarios §2): ignorance about patch identities/yields and volatile affordances.
  for (const patch of patches) {
    for (const attribute of ["move", "inspect", "gather"]) beliefs = setBelief(beliefs, patch, `available:${attribute}`, categorical(["no", "yes"], [1, 1]));
    for (const attribute of ["colour", "size"]) {
      const values = data.kinds.map((kind) => kind.cues.find((cue) => cue.attribute === attribute)!.value);
      beliefs = setBelief(beliefs, patch, attribute, categorical(values, values.map(() => 1)));
    }
    beliefs = setBelief(beliefs, patch, "yield", categorical(["0", "1", "2"], [1, 1, 1]));
  }
  // fixture rule (DESIGN bench/scenarios §2): four evenly spaced PMF quantiles per familiar kind, no novel episodes.
  const episodes = data.kinds.filter((kind) => !kind.novel).flatMap((kind) =>
    Array.from({ length: data.episodes.perKind }, (_, i) => {
      let sum = 0;
      const outcome = kind.yield.support[kind.yield.pmf.findIndex((p) => (sum += p) > (i + 0.5) / data.episodes.perKind)];
      return { id: `${kind.id}.${i}`, t: 0, retrievals: [], context: { kind: kind.id }, action: "gather", outcome: String(outcome),
        reward: outcome * FIXTURE.relief, predictionError: 0, attributedCause: "chance", domain: "space" as const };
    }));
  return { beliefs, episodes, reliability: [] };
}

export function initialNeeds(memory: MemoryState): NeedState {
  return { needs: evaluateNeeds([NEED], { beliefs: memory.beliefs, signals: { "body.hunger_signal": FIXTURE.hunger },
    accumulators: {}, elapsedSeconds: 0, outcomeTags: [], cues: [] }), goals: [] };
}

export function makeConfig(patches: readonly string[]): MindConfig {
  const definition = (id: string, target?: string): ActionDefinition => ({
    // fixture rule (DESIGN bench/scenarios §2): all actions take one epoch; proposed zero effort and full capacity.
    id, target, targetKind: target ? "patch" : "self", domain: id === "wait" ? "none" : "space",
    duration: 1, capacityRequired: 0, cost: 0,
    preconditions: target ? [{ id: `available:${id}`, probability: (beliefs) => probability(beliefs, target, `available:${id}`, "yes") }] : [],
    outcomeSpace: VALUES.map((value) => ({ id: value, deficits: {}, goalProgress: {}, success: value !== "0" && value !== "failed" })),
    naiveModel: (beliefs) => {
      // fixture rule (DESIGN bench/scenarios §2): learned patch yield is the gathering theory; no host truth lookup.
      if (id === "gather") return categorical(VALUES, [0, 1, 2].map((n) => probability(beliefs, target!, "yield", String(n))).concat([0, 0]));
      return categorical(VALUES, [0, 0, 0, 1, 0]);
    },
  });
  return { generation: { repertoire: patches.flatMap((patch) => ["move", "inspect", "gather"].map((id) => definition(id, patch))),
    wait: definition("wait") }, learning: {
    encode: true,
    // fixture rule (DESIGN bench/scenarios §2): observed yield updates only the gathered patch; others receive identity evidence.
    latents: patches.map((patch) => ({ id: `yield:${patch}`, about: patch, attribute: "yield", kind: "discrete", domain: "space",
      likelihood: (e) => {
        const report = e.observations.find((o) => o.attribute === "result");
        if (e.intention.action !== "gather" || e.intention.target !== patch || report?.kind !== "categorical" || !["0", "1", "2"].includes(report.value)) return [1, 1, 1];
        return ["0", "1", "2"].map((value) => value === report.value ? 0.8 : 0.1);
      },
    })),
    appraise: (e) => {
      const report = e.observations.find((o) => o.attribute === "result");
      return { outcome: report?.kind === "categorical" ? report.value : "failed" };
    },
  } };
}

export function forecast(config: MindConfig, needs: NeedState): MindConfig {
  // fixture rule (DESIGN bench/scenarios §2): absolute hunger predictions use only the felt need and DESIGN §6 relief.
  const hunger = needs.needs[0].deficit;
  const action = (row: ActionDefinition): ActionDefinition => ({ ...row, outcomeSpace: row.outcomeSpace.map<PredictedOutcome>((effect) => {
    const deficits: Record<string, number> = {};
    if (row.id === "gather" && ["0", "1", "2"].includes(effect.id)) deficits.hunger = clamp(hunger - Number(effect.id) * FIXTURE.relief);
    return { ...effect, deficits };
  }) });
  return { ...config, generation: { ...config.generation, repertoire: config.generation.repertoire.map(action), wait: action(config.generation.wait) } };
}
