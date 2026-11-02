import { mint, qualify, Runner, simTime, streams } from "@rex/kernel";
import { learnOutcome } from "./learning.js";
import { evaluateNeeds } from "./needs.js";
import { nullPersonality } from "./personality.js";
import { observeMemory, policy } from "./policy.js";
import { DEFAULT_COGNITIVE_PARAMS } from "./types.js";
export function createMindsState(runSeed) {
    if (!Number.isSafeInteger(runSeed))
        throw new RangeError("Run seed must be a safe integer");
    return { minds: [], counters: {}, runSeed, streams: {}, ignoredOutcomes: [] };
}
function configuration(configs, key) {
    if (!Object.hasOwn(configs, key))
        throw new RangeError(`Unknown mind configuration: ${key}`);
    return configs[key];
}
function capacity(value) {
    if (!Number.isFinite(value) || value < 0 || value > 1)
        throw new RangeError("Capacity must be in [0,1]");
    return value;
}
/** DESIGN §4, §7: a pure reducer; callbacks are fixed configuration, commands/state are cloneable data. */
export function reduceMinds(state, command, configs) {
    if (command.type === "addMind") {
        configuration(configs, command.mind.config);
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
        const mind = { ...input, id: minted.id, params: input.params ?? DEFAULT_COGNITIVE_PARAMS,
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
    if (index < 0)
        throw new RangeError("Unknown mind");
    let mind = state.minds[index];
    const config = configuration(configs, mind.config);
    const personality = config.personality ?? nullPersonality;
    let counters = state.counters;
    let streamState = state.streams;
    const events = [];
    let observationTrace;
    let message;
    switch (command.type) {
        case "observe": {
            const observations = structuredClone(command.observations);
            const memory = observeMemory(observations, mind.memory, mind.needs, personality, mind.params, command.t, { thetaPre: config.generation.thetaPre ?? 0.5 });
            if (command.perceptionState !== undefined) {
                const random = streams(state.runSeed);
                streamState = { ...streamState,
                    [`cognition.perception.detect@${qualify("cognition", mind.id)}`]: command.perceptionState };
                random.restore(streamState); // Kernel validates the recorded 32-bit state before publication.
            }
            observationTrace = memory.trace;
            mind = { ...mind, observations, memory: { ...mind.memory,
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
            const inputs = structuredClone(command.inputs);
            const needs = evaluateNeeds(mind.needs.needs.map((need) => need.definition), {
                ...inputs, beliefs: mind.memory.beliefs,
                accumulators: Object.fromEntries(mind.needs.needs.map((need) => [need.definition.id, need.level])),
            });
            for (const [id, progress] of Object.entries(command.goalProgress ?? {})) {
                if (!mind.needs.goals.some((goal) => goal.id === id))
                    throw new RangeError(`Unknown goal: ${id}`);
                if (!Number.isFinite(progress) || progress < 0 || progress > 1)
                    throw new RangeError("Goal progress must be in [0,1]");
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
                    ...(config.communication ? { communication: config.communication } : {}),
                    generation: { ...config.generation, body: { capacity_functional: capacityFunctional } },
                } }, mind.needs, personality, mind.params, random.get("cognition.decision.select", qualify("cognition", mind.id)), command.t);
            message = selected.message;
            counters = selected.counters;
            streamState = random.state();
            const fresh = selected.intention.id !== mind.current?.id;
            mind = { ...mind, context, capacityFunctional, current: selected.intention,
                memory: selected.next,
                decisions: [...mind.decisions, selected.trace], intentions: fresh
                    ? [...mind.intentions, { intention: selected.intention, trace: selected.trace }] : mind.intentions };
            if (fresh)
                events.push({ type: "cognition.intention",
                    payload: { ...selected.intention, id: qualify("cognition", selected.intention.id) } });
            break;
        }
        case "outcome": {
            const pending = mind.intentions.find((record) => record.intention.id === command.intention);
            const chosen = pending.trace.candidates.find(({ candidate }) => candidate.action === pending.intention.action &&
                candidate.target === pending.intention.target);
            const learned = learnOutcome({ ...config.learning, mind: qualify("cognition", mind.id),
                intention: pending.intention, evaluation: chosen,
                context: pending.trace.inputs.context, domain: chosen.candidate.domain,
                outcome: { cause: pending.intention.id, t: command.t, observations: structuredClone(command.feedback.observations) },
            }, mind.memory, { beliefs: mind.memory.beliefs, needs: mind.needs, params: mind.params }, counters, personality);
            counters = learned.counters;
            const intention = { ...pending.intention, status: command.feedback.status ?? "completed" };
            mind = { ...mind, memory: learned.next, learning: [...mind.learning, learned.trace],
                current: mind.current?.id === intention.id ? intention : mind.current,
                intentions: mind.intentions.map((record) => record === pending ? { ...record, intention, outcomeEvent: command.event } : record) };
            events.push({ type: "cognition.attribution", payload: learned.trace, cause: command.event });
            break;
        }
    }
    return { state: { ...state, counters, streams: streamState,
            minds: state.minds.map((previous, i) => i === index ? mind : previous) }, events, ...(message ? { message } : {}), ...(observationTrace ? { observationTrace } : {}) };
}
export class MindsRunner extends Runner {
    constructor(state, configs) {
        super(state, (previous, command) => reduceMinds(previous, command, configs));
    }
}
