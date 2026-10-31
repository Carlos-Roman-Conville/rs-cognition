import { simTime } from "@rex/kernel";
import type { Counters, RandomStream, SimTime } from "@rex/kernel";
import { generateActions } from "./actions.ts";
import type { GenerationInputs } from "./actions.ts";
import { setBelief, updateFromObservation } from "./beliefs.ts";
import { evaluateActions } from "./evaluate.ts";
import type { PersonalityModel } from "./personality.ts";
import { selectAction } from "./select.ts";
import type { SelectionTrace } from "./select.ts";
import type { CognitiveParams, Episode, Intention, MemoryState, MindView, NeedState, Observation } from "./types.ts";

/** §3's memory plus the host affordances and bookkeeping required by §2.4.
 * This ephemeral view may contain pure host expressions; never persist it in Runner state/logs.
 */
export interface PolicyMemoryState extends MemoryState {
  readonly decision: {
    readonly mind: string;
    readonly counters: Counters;
    readonly generation: GenerationInputs;
    readonly context: Episode["context"];
    readonly current?: Intention;
  };
}

/** DESIGN §1, §2.3: observe declared attributes in input order, without inventing priors.
 * Hosts must declare support/priors for every attribute they want learned. Existence
 * entries for the same entity also receive detection evidence, once per observation.
 */
export function observeMemory(
  observations: readonly Observation[], memory: MemoryState, needs: NeedState,
  personality: PersonalityModel, params: CognitiveParams, t: SimTime,
): MemoryState {
  simTime(t);
  let beliefs = memory.beliefs;
  for (const observation of observations) {
    simTime(observation.t);
    if (observation.t > t) throw new RangeError("Observation is in the future");
    const view: MindView = { beliefs, needs, params };
    // DESIGN §3: observations have no domain tag; 'none' is the proposed neutral mapping.
    const interpreted = personality.interpret({ eta: params.eta, alpha0: params.alpha0,
      lambda: params.lambda, confidence: 1, weberFraction: 0, testimonyFloor: 0 }, "none", view);
    const eta = params.eta === 0 ? 0 : interpreted.eta; // CB-5: explicit learning freeze wins.
    for (const entry of beliefs.entries) {
      if (entry.about !== observation.about ||
          (entry.attribute !== observation.attribute && entry.belief.kind !== "existence")) continue;
      beliefs = setBelief(beliefs, entry.about, entry.attribute, updateFromObservation(entry.belief, observation, eta));
    }
  }
  return { ...memory, beliefs };
}

/** DESIGN §3: π(o,m,n,p,θ,rng,t), pure apart from the explicitly supplied stream.
 * §2.3 evaluation uses expected retrieval weights, not sampled/rehearsed memories.
 * Thus this call consumes only the decision.select stream; no hidden retrieval draws.
 */
export function policy(
  o: readonly Observation[], m: PolicyMemoryState, n: NeedState, p: PersonalityModel,
  theta: CognitiveParams, rng: RandomStream, t: SimTime,
): { intention: Intention; trace: SelectionTrace; next: MemoryState; counters: Counters } {
  const memory = observeMemory(o, m, n, p, theta, t);
  const view: MindView = { beliefs: memory.beliefs, needs: n, params: theta };
  const generation = generateActions(m.decision.generation, view, p);
  const evaluation = evaluateActions(generation, view, memory.episodes, m.decision.context, t, p);
  const selected = selectAction(evaluation, m.decision, rng);
  return { intention: selected.intention, trace: selected.trace, counters: selected.counters,
    next: { beliefs: memory.beliefs, episodes: memory.episodes, reliability: memory.reliability } };
}
