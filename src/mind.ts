import { mint, qualify, Runner, simTime, streams } from "@rex/kernel";
import type { Counters, SimTime, StreamsState } from "@rex/kernel";
import type { GenerationInputs } from "./actions.ts";
import { initialConsequences, phi, sameConsequenceKind, updateConsequences } from "./consequences.ts";
import type { CompletedAct, ConsequenceConfig, ConsequenceState } from "./consequences.ts";
import { learnOutcome } from "./learning.ts";
import type { LearningInputs, LearningTrace } from "./learning.ts";
import { evaluateNeeds } from "./needs.ts";
import type { NeedInputs } from "./needs.ts";
import { nullPersonality } from "./personality.ts";
import type { PersonalityModel } from "./personality.ts";
import { observeMemory, policy } from "./policy.ts";
import type { ObservationTrace } from "./policy.ts";
import type { SelectionTrace } from "./select.ts";
import { DEFAULT_COGNITIVE_PARAMS } from "./types.ts";
import type { CognitiveParams, DecisionRecord, Episode, Intention, MemoryState, NeedState, Observation } from "./types.ts";

export interface MindConfig {
  /** PLAN A.11.1: host fixture assumptions keyed by need id; absent means no learner state. */
  readonly consequences?: Readonly<Record<string, ConsequenceConfig>>;
  readonly communication?: import("./communication/types.ts").CommunicationDecision;
  readonly generation: Omit<GenerationInputs, "body">;
  readonly personality?: PersonalityModel;
  readonly learning: Pick<LearningInputs, "appraise" | "latents" | "encode" | "epsilonAttribution">;
}
export type MindsConfig = Readonly<Record<string, MindConfig>>;

export interface MindInput {
  readonly config: string;
  readonly memory: MemoryState;
  readonly needs: NeedState;
  readonly params?: CognitiveParams;
  readonly capacityFunctional: number;
  readonly context?: Episode["context"];
}

export interface PendingIntention {
  readonly intention: Intention;
  /** Original decision, retained even when commitment refreshes EU or another intention replaces it. */
  readonly trace: SelectionTrace;
  readonly outcomeEvent?: string;
}

export interface Mind extends MindInput {
  readonly consequences?: readonly ConsequenceState[];
  readonly completedActs?: readonly CompletedAct[];
  /** Current observation-phase execution evidence for the epoch ledger. */
  readonly observationOperations?: { readonly t: SimTime; readonly operations: readonly import("./personality-operations.ts").PersonalityOperation[] };
  readonly id: string;
  readonly params: CognitiveParams;
  readonly context: Episode["context"];
  readonly beliefIds: readonly { readonly id: string; readonly about: string; readonly attribute: string }[];
  readonly observations: readonly Observation[];
  readonly current?: Intention;
  readonly intentions: readonly PendingIntention[];
  readonly decisions: readonly SelectionTrace[];
  /** Latest applied outcome since the previous decide; persisted for snapshot/replay. */
  readonly lastOutcomeEvent?: string;
  readonly learning: readonly LearningTrace[];
}

export interface MindsState {
  readonly minds: readonly Mind[];
  readonly counters: Counters;
  readonly runSeed: number;
  readonly streams: StreamsState;
  readonly ignoredOutcomes: readonly {
    readonly event: string; readonly cause?: string; readonly reason: "unknown cause" | "duplicate outcome";
  }[];
}

export interface OutcomeFeedback {
  readonly observations: readonly Observation[];
  readonly status?: "completed" | "failed" | "impossible";
}

export type MindCommand =
  | { readonly type: "addMind"; readonly mind: MindInput }
  | { readonly type: "observe"; readonly mind: string; readonly t: SimTime;
      readonly observations: readonly Observation[]; readonly perceptionState?: number }
  | { readonly type: "tickNeeds"; readonly mind: string;
      /** Kernel ms, required when consequence learning is configured; optional for legacy callers. */
      readonly t?: SimTime;
      readonly inputs: Omit<NeedInputs, "beliefs" | "accumulators">;
      /** Observed goal progress from the host, never inferred from a chosen action. */
      readonly goalProgress?: Readonly<Record<string, number>> }
  | { readonly type: "decide"; readonly mind: string; readonly t: SimTime;
      readonly capacityFunctional?: number; readonly context?: Episode["context"] }
  | { readonly type: "outcome"; readonly event: string; readonly cause?: string;
      /** Resolved by the process from a previously published intention event, never guessed from cause. */
      readonly intention?: string; readonly t: SimTime; readonly feedback: OutcomeFeedback };

export type CognitionEmission =
  | { readonly type: "cognition.decision"; readonly payload: DecisionRecord; readonly cause?: string }
  | { readonly type: "cognition.intention"; readonly payload: Intention }
  | { readonly type: "cognition.attribution"; readonly payload: LearningTrace; readonly cause: string };
export interface MindResult { readonly state: MindsState; readonly events: CognitionEmission[]; readonly added?: string; readonly observationTrace?: ObservationTrace; readonly message?: import("./communication/types.ts").Message }

export function createMindsState(runSeed: number): MindsState {
  if (!Number.isSafeInteger(runSeed)) throw new RangeError("Run seed must be a safe integer");
  return { minds: [], counters: {}, runSeed, streams: {}, ignoredOutcomes: [] };
}

function configuration(configs: MindsConfig, key: string): MindConfig {
  if (!Object.hasOwn(configs, key)) throw new RangeError(`Unknown mind configuration: ${key}`);
  return configs[key];
}

function capacity(value: number): number {
  if (!Number.isFinite(value) || value < 0 || value > 1) throw new RangeError("Capacity must be in [0,1]");
  return value;
}

/** DESIGN §4, §7: a pure reducer; callbacks are fixed configuration, commands/state are cloneable data. */
export function reduceMinds(state: MindsState, command: MindCommand, configs: MindsConfig): MindResult {
  if (command.type === "addMind") {
    const config = configuration(configs, command.mind.config);
    capacity(command.mind.capacityFunctional);
    const minted = mint(state.counters, "mind");
    let counters = minted.counters;
    const input = structuredClone(command.mind);
    const beliefIds = input.memory.beliefs.entries.map((entry, index, entries) => {
      if (entries.slice(0, index).some((other) => other.about === entry.about && other.attribute === entry.attribute)) {
        throw new RangeError("Belief attributes must be unique per mind");
      }
      const belief = mint(counters, "bel");
      counters = belief.counters;
      return { id: belief.id, about: entry.about, attribute: entry.attribute };
    });
    // Initial histories get population-wide ids too; caller-supplied ids cannot collide with future encoding.
    const episodes = input.memory.episodes.map((episode) => {
      const mintedEpisode = mint(counters, "ep");
      counters = mintedEpisode.counters;
      return { ...episode, id: mintedEpisode.id };
    });
    const consequences = config.consequences === undefined ? undefined : Object.entries(config.consequences).map(([need, fixture]) => {
      const definition = input.needs.needs.find(row => row.definition.id === need)?.definition;
      if (!definition || !("signal" in definition.source)) throw new RangeError("Consequences require a declared signal need");
      return initialConsequences(need, fixture);
    });
    const mind: Mind = { ...input, id: minted.id, params: input.params ?? DEFAULT_COGNITIVE_PARAMS,
      ...(consequences === undefined ? {} : { consequences, completedActs: [] }),
      context: input.context ?? {}, memory: { ...input.memory, episodes }, beliefIds,
      observations: [], intentions: [], decisions: [], learning: [] };
    return { state: { ...state, counters, minds: [...state.minds, mind] }, events: [], added: mind.id };
  }

  const index = command.type === "outcome"
    ? state.minds.findIndex((mind) => mind.intentions.some((record) => record.intention.id === command.intention))
    : state.minds.findIndex((mind) => mind.id === command.mind);
  if (command.type === "outcome") {
    simTime(command.t);
    const pending = state.minds[index]?.intentions.find((record) => record.intention.id === command.intention);
    const duplicate = state.minds.some((mind) => mind.intentions.some((record) => record.outcomeEvent === command.event));
    if (!pending || pending.outcomeEvent !== undefined || duplicate) {
      return { state: { ...state, ignoredOutcomes: [...state.ignoredOutcomes, {
        event: command.event, cause: command.cause,
        reason: pending?.outcomeEvent !== undefined || duplicate ? "duplicate outcome" : "unknown cause",
      }] }, events: [] };
    }
  }
  if (index < 0) throw new RangeError("Unknown mind");
  let mind = state.minds[index];
  const config = configuration(configs, mind.config);
  const personality = config.personality ?? nullPersonality;
  let counters = state.counters;
  let streamState = state.streams;
  const events: CognitionEmission[] = [];
  let observationTrace: ObservationTrace | undefined;
  let message: import("./communication/types.ts").Message | undefined;
  switch (command.type) {
    case "observe": {
      const observations = structuredClone(command.observations);
      const memory = observeMemory(observations, mind.memory, mind.needs, personality, mind.params, command.t,
        { thetaPre: config.generation.thetaPre ?? 0.5 });
      if (command.perceptionState !== undefined) {
        const random = streams(state.runSeed);
        streamState = { ...streamState,
          [`cognition.perception.detect@${qualify("cognition", mind.id)}`]: command.perceptionState };
        random.restore(streamState); // Kernel validates the recorded 32-bit state before publication.
      }
      observationTrace = memory.trace;
      mind = { ...mind, observations,
        ...(memory.trace.operations?.length || mind.observationOperations ? { observationOperations: { t: command.t, operations: memory.trace.operations ?? [] } } : {}), memory: { ...mind.memory,
        ...(memory.conversations === undefined ? {} : { conversations: memory.conversations }),
        ...(memory.testimony === undefined ? {} : { testimony: memory.testimony }),
        ...(memory.termReadings === undefined ? {} : { termReadings: memory.termReadings }),
        ...(memory.equivocationCues === undefined ? {} : { equivocationCues: memory.equivocationCues }),
        ...(memory.meaningPool === undefined ? {} : { meaningPool: memory.meaningPool }),
        ...(memory.confusionCues === undefined ? {} : { confusionCues: memory.confusionCues }),
        beliefs: memory.beliefs, episodes: memory.episodes, reliability: memory.reliability } };
      break;
    }
    case "tickNeeds": {
      let inputs = structuredClone(command.inputs);
      if (mind.consequences !== undefined) {
        if (command.t === undefined) throw new RangeError("Consequence sampling requires kernel time");
        const t = simTime(command.t);
        const consequences = mind.consequences.map(previous => {
          const source = mind.needs.needs.find(row => row.definition.id === previous.need)!.definition.source;
          if (!("signal" in source)) throw new RangeError("Consequences require a signal need");
          if (!Object.hasOwn(inputs.signals, source.signal)) return previous;
          const h = inputs.signals[source.signal];
          if (!Number.isFinite(h) || h < 0 || h > 1) throw new RangeError("Consequence signal must be in [0,1]");
          if (previous.tPrev === undefined) return { ...previous, hPrev: h, tPrev: t };
          if (t <= previous.tPrev) throw new RangeError("Consequence samples must advance kernel time");
          const fixture = config.consequences![previous.need];
          // PLAN A.11.1: physical seconds since this need's last present signal, not epoch count.
          const dt = (t - previous.tPrev) / 1000;
          const phiVec = [dt, ...fixture.kinds.map(({ kind, G }) => phi(mind.completedActs!, kind, G, t / 1000, previous.tPrev! / 1000))];
          return { ...previous, ...updateConsequences(previous, h - previous.hPrev!, phiVec, dt,
            fixture.sigmaW2, mind.params.eta, fixture.Q), hPrev: h, tPrev: t };
        });
        // Expire only after the last relevant sample consumes the window's tail. An absent
        // signal must not erase unsampled evidence needed when that signal returns.
        const completedActs = mind.completedActs!.filter(act => consequences.some(belief =>
          config.consequences![belief.need].kinds.some(({ kind, G }) => sameConsequenceKind(kind, act.kind) &&
            (belief.tPrev ?? t) / 1000 < act.t + G.points[G.points.length - 1][0])));
        // PLAN A.11.1: absent signals cause no learning. Retain the existing felt deficit
        // for those configured needs; the held value is never supplied to the learner.
        const signals = { ...inputs.signals };
        for (const belief of consequences) {
          const need = mind.needs.needs.find(row => row.definition.id === belief.need)!;
          if ("signal" in need.definition.source && !Object.hasOwn(signals, need.definition.source.signal)) {
            signals[need.definition.source.signal] = need.deficit;
          }
        }
        inputs = { ...inputs, signals };
        mind = { ...mind, consequences, completedActs };
      }
      const needs = evaluateNeeds(mind.needs.needs.map((need) => need.definition), {
        ...inputs, beliefs: mind.memory.beliefs,
        accumulators: Object.fromEntries(mind.needs.needs.map((need) => [need.definition.id, need.level])),
      });
      for (const [id, progress] of Object.entries(command.goalProgress ?? {})) {
        if (!mind.needs.goals.some((goal) => goal.id === id)) throw new RangeError(`Unknown goal: ${id}`);
        if (!Number.isFinite(progress) || progress < 0 || progress > 1) throw new RangeError("Goal progress must be in [0,1]");
      }
      const goals = mind.needs.goals.map((goal) => command.goalProgress && Object.hasOwn(command.goalProgress, goal.id)
        ? { ...goal, progress: command.goalProgress[goal.id] } : goal);
      mind = { ...mind, needs: { needs, goals } };
      break;
    }
    case "decide": {
      const random = streams(state.runSeed);
      random.restore(streamState);
      const capacityFunctional = capacity(command.capacityFunctional ?? mind.capacityFunctional);
      const context = structuredClone(command.context ?? mind.context);
      const selected = policy([], { ...mind.memory, decision: {
        mind: qualify("cognition", mind.id), counters, context, current: mind.current,
        presentObservations: mind.observations.filter(observation => observation.t === command.t),
        priorOperations: mind.observationOperations?.t === command.t ? mind.observationOperations.operations : [],
        ...(config.communication ? { communication: config.communication } : {}),
        generation: { ...config.generation, body: { capacity_functional: capacityFunctional } },
      } }, mind.needs, personality, mind.params,
      random.get("cognition.decision.select", qualify("cognition", mind.id)), command.t);
      message = selected.message;
      counters = selected.counters;
      streamState = random.state();
      const fresh = selected.intention.id !== mind.current?.id;
      // M1a-27: project only selected.trace; no evaluation, world reads or random draws.
      const trace = mind.consequences === undefined ? selected.trace : { ...selected.trace,
        consequences: mind.consequences.map(({ need, mu, Sigma }) => ({ need, mu: [...mu], Sigma: Sigma.map(row => [...row]) })) };
      events.push({ type: "cognition.decision", payload: {
        mind: trace.mind, t: trace.t,
        ...(trace.consequences === undefined ? {} : { consequences: structuredClone(trace.consequences) }),
        needs: trace.needs.needs.map(({ definition, deficit, priority }) => ({ id: definition.id, deficit, priority })),
        candidates: trace.candidates.map(({ candidate, expectedOutcomes, expectedUtility, probability }) => ({
          action: candidate.action, ...(candidate.target === undefined ? {} : { target: candidate.target }),
          pHat: structuredClone(expectedOutcomes), eu: expectedUtility, p: probability,
        })),
        ineligible: (trace.ineligible ?? []).map(({ candidate, reason }) => ({
          action: candidate.action, ...(candidate.target === undefined ? {} : { target: candidate.target }), reason,
        })),
        intention: qualify("cognition", trace.intention.id), kept: trace.commitment.kept,
      }, ...(mind.lastOutcomeEvent === undefined ? {} : { cause: mind.lastOutcomeEvent }) });
      mind = { ...mind, context, capacityFunctional, current: selected.intention,
        lastOutcomeEvent: undefined,
        memory: selected.next,
        decisions: [...mind.decisions, trace], intentions: fresh
          ? [...mind.intentions, { intention: selected.intention, trace }] : mind.intentions };
      if (fresh) events.push({ type: "cognition.intention",
        payload: { ...selected.intention, id: qualify("cognition", selected.intention.id) } });
      break;
    }
    case "outcome": {
      const pending = mind.intentions.find((record) => record.intention.id === command.intention)!;
      if (command.t < pending.intention.t) throw new RangeError("Outcome predates intention");
      if (command.feedback.status === undefined && command.feedback.observations.length === 0) {
        // PLAN A.11.2 Rules: technical failure settles execution, supplies no learning evidence.
        const intention: Intention = { ...pending.intention, status: "failed" };
        mind = { ...mind, current: mind.current?.id === intention.id ? undefined : mind.current,
          intentions: mind.intentions.map(record => record === pending ? { ...record, intention, outcomeEvent: command.event } : record) };
        break;
      }
      const chosen = pending.trace.candidates.find(({ candidate }) => candidate.action === pending.intention.action &&
        candidate.target === pending.intention.target)!;
      const learned = learnOutcome({ ...config.learning, mind: qualify("cognition", mind.id),
        intention: pending.intention, evaluation: chosen,
        context: pending.trace.inputs.context, domain: chosen.candidate.domain,
        outcome: { cause: pending.intention.id, t: command.t, observations: structuredClone(command.feedback.observations) },
      }, mind.memory, { beliefs: mind.memory.beliefs, needs: mind.needs, params: mind.params }, counters, personality);
      counters = learned.counters;
      const intention: Intention = { ...pending.intention, status: command.feedback.status ?? "completed" };
      const kind = { action: chosen.candidate.action, targetKind: chosen.candidate.targetKind };
      // Only explicit completed outcomes of this mind's declared kinds enter the act history.
      const completedActs = mind.consequences !== undefined && command.feedback.status === "completed" &&
        mind.consequences.some(belief => belief.kinds.some(declared => sameConsequenceKind(declared, kind)))
        ? [...mind.completedActs!, { kind, t: command.t / 1000 }] : mind.completedActs;
      mind = { ...mind, memory: learned.next, learning: [...mind.learning, learned.trace],
        ...(completedActs === undefined ? {} : { completedActs }),
        lastOutcomeEvent: command.event,
        current: mind.current?.id === intention.id ? intention : mind.current,
        intentions: mind.intentions.map((record) => record === pending ? { ...record, intention, outcomeEvent: command.event } : record) };
      events.push({ type: "cognition.attribution", payload: learned.trace, cause: command.event });
      break;
    }
  }
  return { state: { ...state, counters, streams: streamState,
    minds: state.minds.map((previous, i) => i === index ? mind : previous) }, events, ...(message ? { message } : {}), ...(observationTrace ? { observationTrace } : {}) };
}

export class MindsRunner extends Runner<MindsState, MindCommand, MindResult, CognitionEmission> {
  constructor(state: MindsState, configs: MindsConfig) {
    super(state, (previous, command) => reduceMinds(previous, command, configs));
  }
}
