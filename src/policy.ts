import { comprehend } from "./communication/comprehend.ts";
import type { CommunicationContext, ComprehendedUtterance } from "./communication/types.ts";
import { simTime } from "@rex/kernel";
import type { Counters, RandomStream, SimTime } from "@rex/kernel";
import { generateActions } from "./actions.ts";
import type { GenerationInputs } from "./actions.ts";
import { getBelief, klDivergence, setBelief, updateFromObservation, updateCategorical } from "./beliefs.ts";
import { evaluateActions } from "./evaluate.ts";
import type { PersonalityModel } from "./personality.ts";
import { selectAction } from "./select.ts";
import type { SelectionTrace } from "./select.ts";
import type { Belief, CognitiveParams, Episode, Intention, MemoryState, MindView, NeedState, Observation } from "./types.ts";

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

/** Subjective diagnostics in observation order, then belief insertion order. */
export interface ObservationUpdate {
  readonly cue: string;
  readonly observationIndex: number;
  readonly attribute: string;
  readonly about: string;
  readonly prior: Belief;
  readonly posterior: Belief;
  /** Same JSON-safe singular KL representation as LearningTrace. */
  readonly kl: number | "Infinity";
}
export interface ObservationTrace {
  readonly comprehension?: readonly ComprehendedUtterance[];
  readonly updates: readonly ObservationUpdate[];
}
export interface ObservationResult extends MemoryState {
  readonly trace: ObservationTrace;
}

/** DESIGN §1, §2.3: observe declared attributes in input order, without inventing priors.
 * Hosts must declare support/priors for every attribute they want learned. Existence
 * entries for the same entity also receive detection evidence, once per observation.
 */
export function observeMemory(
  observations: readonly Observation[], memory: MemoryState, needs: NeedState,
  personality: PersonalityModel, params: CognitiveParams, t: SimTime,
  communication?: Pick<CommunicationContext, "thetaPre">,
): ObservationResult {
  simTime(t);
  let beliefs = memory.beliefs;
  const updates: ObservationUpdate[] = [];
  let meaningPool = memory.meaningPool;
  const comprehension: ComprehendedUtterance[] = [];
  let confusionCues = memory.confusionCues;
  for (const [observationIndex, observation] of observations.entries()) {
    simTime(observation.t);
    if (observation.t > t) throw new RangeError("Observation is in the future");
    const view: MindView = { beliefs, needs, params, ...(confusionCues ? { confusionCues } : {}) };
    // DESIGN §3: observations have no domain tag; 'none' is the proposed neutral mapping.
    const interpreted = personality.interpret({ eta: params.eta, alpha0: params.alpha0,
      lambda: params.lambda, confidence: 1, weberFraction: 0, testimonyFloor: 0,
      ...(observation.kind === "message" ? { poolConcentration: 1 } : {}), // §5.1 proposed neutral concentration.
    }, "none", view);
    const eta = params.eta === 0 ? 0 : interpreted.eta; // CB-5: explicit learning freeze wins.
    // One posterior application/trace path for both sensory evidence and testimony.
    const apply = (about: string, attribute: string, prior: Belief, posterior: Belief) => {
      beliefs = setBelief(beliefs, about, attribute, posterior);
      const applied = getBelief(beliefs, about, attribute)!;
      const kl = klDivergence(applied, prior);
      updates.push({ cue: observation.cue, observationIndex, attribute, about,
        prior, posterior: applied, kl: kl === Infinity ? "Infinity" : kl });
    };
    if (observation.kind === "message") {
      const understood = comprehend({ beliefs, reliability: memory.reliability, meaningPool }, observation.message,
        { ...observation.context, ...communication, poolConcentration: interpreted.poolConcentration ?? 1 });
      meaningPool = understood.pool;
      comprehension.push(...understood.utterances);
      confusionCues = understood.utterances.flatMap(item => item.confusion ? [item.confusion] : []);
      for (const utterance of understood.utterances) for (const testimony of utterance.testimony) {
        const prior = getBelief(beliefs, testimony.about, testimony.attribute)!;
        if (prior.kind === "categorical") apply(testimony.about, testimony.attribute, prior,
          updateCategorical(prior, testimony.likelihood, eta));
      }
    }
    for (const entry of beliefs.entries) {
      if (entry.about !== observation.about ||
          (entry.attribute !== observation.attribute && entry.belief.kind !== "existence")) continue;
      if (observation.kind === "message" && entry.belief.kind !== "existence") continue;
      apply(entry.about, entry.attribute, entry.belief, updateFromObservation(entry.belief, observation, eta));
    }
  }
  return { ...memory, beliefs, ...(meaningPool === undefined ? {} : { meaningPool }),
    ...(confusionCues === undefined ? {} : { confusionCues }),
    trace: { updates, ...(comprehension.length ? { comprehension } : {}) } };
}

/** DESIGN §3: π(o,m,n,p,θ,rng,t), pure apart from the explicitly supplied stream.
 * §2.3 evaluation uses expected retrieval weights, not sampled/rehearsed memories.
 * Thus this call consumes only the decision.select stream; no hidden retrieval draws.
 */
export function policy(
  o: readonly Observation[], m: PolicyMemoryState, n: NeedState, p: PersonalityModel,
  theta: CognitiveParams, rng: RandomStream, t: SimTime,
): { intention: Intention; trace: SelectionTrace; next: MemoryState; counters: Counters } {
  const memory = observeMemory(o, m, n, p, theta, t, { thetaPre: m.decision.generation.thetaPre ?? 0.5 });
  const view: MindView = { beliefs: memory.beliefs, needs: n, params: theta,
    ...(memory.confusionCues === undefined ? {} : { confusionCues: memory.confusionCues }) };
  const generation = generateActions(m.decision.generation, view, p);
  const evaluation = evaluateActions(generation, view, memory.episodes, m.decision.context, t, p);
  const selected = selectAction(evaluation, m.decision, rng);
  return { intention: selected.intention, trace: selected.trace, counters: selected.counters,
    next: { ...(memory.meaningPool === undefined ? {} : { meaningPool: memory.meaningPool }),
      ...(memory.confusionCues === undefined ? {} : { confusionCues: memory.confusionCues }), beliefs: memory.beliefs, episodes: memory.episodes, reliability: memory.reliability } };
}
