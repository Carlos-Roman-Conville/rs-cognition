import { categorical, createBeliefStore, DEFAULT_COGNITIVE_PARAMS, evaluateNeeds, getBelief, setBelief } from "../../../src/index.ts";
import type { ActionDefinition, BeliefStore, MemoryState, MindConfig, NeedDefinition, NeedState, PredictedOutcome } from "../../../src/index.ts";

// DESIGN scenarios section 4, section 10.4: fixed estimates; remaining host scales are proposed.
export const FIXTURE = { epochs: 16, epochMs: 1000, steps: 4, pDefect: 0.2, hunger: 0.7, relief: 0.3 };
export const PARAMS = DEFAULT_COGNITIVE_PARAMS;
export const VALUES = ["done", "failed"];
export const NEEDS: NeedDefinition[] = [
  { id: "hunger", category: "physiological", source: { signal: "body.hunger_signal" }, setpoint: 0, weight: 1, salienceTags: ["food"] },
  { id: "competence", category: "appraisal", sdt: "competence", source: { appraisal: { about: "self", attribute: "competence", value: "yes" } }, setpoint: 1, weight: 1, salienceTags: ["work"] },
];
export const clamp = (x: number) => Math.max(0, Math.min(1, x));
export function probability(b: BeliefStore, about: string, attribute: string, value: string) {
  const entry = getBelief(b, about, attribute);
  return entry?.kind === "categorical" ? entry.probabilities[entry.values.indexOf(value)] ?? 0 : 0;
}
export function initialMemory(tasks: readonly string[]): MemoryState {
  let beliefs = createBeliefStore();
  const put = (about: string, attribute: string, values: string[], mass: number[]) => { beliefs = setBelief(beliefs, about, attribute, categorical(values, mass)); };
  for (const task of tasks) {
    for (const action of ["continue", "switch"]) put(task, `available:${action}`, ["no", "yes"], [1, 1]);
    put(task, "progress", ["0", "1", "2", "3", "4"], [1, 1, 1, 1, 1]);
    put(task, "ready", ["no", "yes"], [1, 1]);
    put(task, "quality", ["bad", "good"], [1, 4]); // section 10.4 defect prior.
  }
  put("self", "available:verify", ["no", "yes"], [1, 1]);
  put("self", "competence", ["no", "yes"], [1, 1]);
  return { beliefs, episodes: [], reliability: [] };
}
export function initialNeeds(memory: MemoryState): NeedState {
  return { needs: evaluateNeeds(NEEDS, { beliefs: memory.beliefs, signals: { "body.hunger_signal": FIXTURE.hunger }, accumulators: {}, elapsedSeconds: 0, outcomeTags: [], cues: [] }), goals: [] };
}
export function makeConfig(tasks: readonly string[]): MindConfig {
  const action = (id: string, target?: string): ActionDefinition => ({
    id, target, targetKind: target === "foreman" ? "person" : target ? "task" : "self", domain: "meta",
    duration: 1, capacityRequired: 0, cost: 0,
    preconditions: ["continue", "switch", "verify"].includes(id) ? [{ id: `available:${id}`, probability: b => probability(b, target ?? "self", `available:${id}`, "yes") }] : [],
    outcomeSpace: VALUES.map(value => ({ id: value, deficits: {}, goalProgress: {}, success: value === "done" })),
    // section 4 proposed subjective theory: instruction readiness and learned quality inform continuing.
    naiveModel: b => { const success = id === "continue" ? (probability(b, target!, "quality", "good") + probability(b, target!, "ready", "yes")) / 2 : 0.9;
      return categorical(VALUES, [success, 1 - success]); },
  });
  return { generation: { repertoire: [...tasks.flatMap(task => [action("continue", task), action("switch", task)]), action("verify"), action("ask", "foreman")], wait: action("wait") },
    learning: { encode: true, latents: [...tasks.map<MindConfig["learning"]["latents"][number]>(task => ({ id: `quality:${task}`, about: task, attribute: "quality", kind: "discrete", domain: "meta",
      likelihood: e => { const report = e.observations.find(o => o.about === task && o.attribute === "quality");
        return report?.kind === "categorical" ? (report.value === "bad" ? [0.9, 0.1] : [0.1, 0.9]) : [1, 1]; } })),
      { id: "competence", about: "self", attribute: "competence", kind: "discrete", domain: "meta",
        likelihood: e => { const report = e.observations.find(o => o.attribute === "result");
          if (!["continue", "verify"].includes(e.intention.action) || report?.kind !== "categorical") return [1, 1];
          return report.value === "done" ? [0.2, 0.8] : [0.8, 0.2]; } }],
      appraise: e => { const report = e.observations.find(o => o.attribute === "result");
        return { outcome: report?.kind === "categorical" ? report.value : "failed" }; } } };

}
export function forecast(config: MindConfig, needs: NeedState): MindConfig {
  // section 4 proposed expectations: incremental competence relief, expected quarter-task payment.
  // Only felt deficits enter forecasts; hidden progress/defects never enter policy.
  const hunger = needs.needs[0].deficit, competence = needs.needs[1].deficit;
  const action = (row: ActionDefinition): ActionDefinition => ({ ...row, outcomeSpace: row.outcomeSpace.map<PredictedOutcome>(effect => ({ ...effect,
    deficits: effect.id === "done" ? { hunger: clamp(hunger - (row.id === "continue" ? FIXTURE.relief / FIXTURE.steps : 0)),
      competence: clamp(competence - (row.id === "continue" ? 0.2 : row.id === "verify" ? 0.1 : row.id === "ask" ? 0.05 : 0)) } : { hunger, competence } })) });
  return { ...config, generation: { ...config.generation, repertoire: config.generation.repertoire.map(action), wait: action(config.generation.wait) } };
}
