import { encode } from "./communication/encode.js";
import { conversation, conversationTurn, keepConversation, assessConversation } from "./communication/conversation.js";
import { settleTestimony } from "./communication/credibility.js";
import { comprehend } from "./communication/comprehend.js";
import { simTime } from "@rex/kernel";
import { generateActions } from "./actions.js";
import { getBelief, klDivergence, setBelief, updateFromObservation, updateCategorical } from "./beliefs.js";
import { evaluateActions } from "./evaluate.js";
import { selectAction } from "./select.js";
/** DESIGN §1, §2.3: observe declared attributes in input order, without inventing priors.
 * Hosts must declare support/priors for every attribute they want learned. Existence
 * entries for the same entity also receive detection evidence, once per observation.
 */
export function observeMemory(observations, memory, needs, personality, params, t, communication) {
    simTime(t);
    let beliefs = memory.beliefs;
    let conversations = memory.conversations;
    let reliability = memory.reliability;
    let testimony = memory.testimony;
    let termReadings = memory.termReadings;
    let equivocationCues = memory.equivocationCues;
    const credibility = [];
    const updates = [];
    let meaningPool = memory.meaningPool;
    const comprehension = [];
    let confusionCues = memory.confusionCues;
    for (const [observationIndex, observation] of observations.entries()) {
        simTime(observation.t);
        if (observation.t > t)
            throw new RangeError("Observation is in the future");
        const view = { beliefs, needs, params, ...(confusionCues ? { confusionCues } : {}) };
        // DESIGN §3: observations have no domain tag; 'none' is the proposed neutral mapping.
        const interpreted = personality.interpret({ eta: params.eta, alpha0: params.alpha0,
            lambda: params.lambda, confidence: 1, weberFraction: 0, testimonyFloor: 0,
            ...(observation.kind === "message" ? { poolConcentration: 1 } : {}), // §5.1 proposed neutral concentration.
        }, "none", view);
        const eta = params.eta === 0 ? 0 : interpreted.eta; // CB-5: explicit learning freeze wins.
        // One posterior application/trace path for both sensory evidence and testimony.
        const apply = (about, attribute, prior, posterior) => {
            beliefs = setBelief(beliefs, about, attribute, posterior);
            const applied = getBelief(beliefs, about, attribute);
            const kl = klDivergence(applied, prior);
            updates.push({ cue: observation.cue, observationIndex, attribute, about,
                prior, posterior: applied, kl: kl === Infinity ? "Infinity" : kl });
        };
        if (observation.kind === "message") {
            const understood = comprehend({ beliefs, reliability, meaningPool, termReadings }, observation.message, { ...observation.context, ...communication, poolConcentration: interpreted.poolConcentration ?? 1 });
            meaningPool = understood.pool;
            termReadings = understood.readings;
            testimony = [...(testimony ?? []), ...understood.utterances.flatMap(u => u.pending ? [u.pending] : [])];
            equivocationCues = understood.utterances.flatMap(u => u.equivocation ? [u.equivocation] : []);
            const turns = understood.utterances.map(item => {
                const partner = observation.message.sender;
                const topics = (Object.hasOwn(understood.pool, item.utterance.term) ? understood.pool[item.utterance.term] : [])
                    .filter(candidate => (item.distribution?.probabilities[item.distribution.values.indexOf(candidate.id)] ?? 0) > 0)
                    .map(candidate => ({ about: item.utterance.about, attribute: candidate.attribute }));
                const updated = conversationTurn(conversation(conversations ?? [], partner), item.utterance, topics, observation.context, eta, true);
                conversations = keepConversation(conversations ?? [], updated.record);
                return updated.confusion && !item.confusion ? { ...item, confusion: updated.confusion } : item;
            });
            comprehension.push(...turns);
            confusionCues = turns.flatMap(item => item.confusion ? [item.confusion] : []);
            for (const utterance of understood.utterances)
                for (const testimony of utterance.testimony) {
                    const prior = getBelief(beliefs, testimony.about, testimony.attribute);
                    if (prior.kind === "categorical")
                        apply(testimony.about, testimony.attribute, prior, updateCategorical(prior, testimony.likelihood, eta));
                }
        }
        const settled = settleTestimony({ ...memory, reliability, testimony }, observation);
        reliability = settled.reliability;
        testimony = settled.testimony;
        credibility.push(...settled.settlements);
        for (const entry of beliefs.entries) {
            if (entry.about !== observation.about ||
                (entry.attribute !== observation.attribute && entry.belief.kind !== "existence"))
                continue;
            if (observation.kind === "message" && entry.belief.kind !== "existence")
                continue;
            apply(entry.about, entry.attribute, entry.belief, updateFromObservation(entry.belief, observation, eta));
        }
    }
    return { ...memory, beliefs, reliability,
        ...(conversations === undefined ? {} : { conversations }),
        ...(testimony === undefined ? {} : { testimony }),
        ...(termReadings === undefined ? {} : { termReadings }),
        ...(equivocationCues === undefined ? {} : { equivocationCues }),
        ...(meaningPool === undefined ? {} : { meaningPool }),
        ...(confusionCues === undefined ? {} : { confusionCues }),
        trace: { updates, ...(comprehension.length && conversations ? { conversations } : {}), ...(credibility.length ? { credibility } : {}), ...(comprehension.length ? { comprehension } : {}) } };
}
/** DESIGN §3: π(o,m,n,p,θ,rng,t), pure apart from the explicitly supplied stream.
 * §2.3 evaluation uses expected retrieval weights, not sampled/rehearsed memories.
 * Thus this call consumes only the decision.select stream; no hidden retrieval draws.
 */
export function policy(o, m, n, p, theta, rng, t) {
    const memory = observeMemory(o, m, n, p, theta, t, { thetaPre: m.decision.generation.thetaPre ?? 0.5 });
    const view = { beliefs: memory.beliefs, needs: n, params: theta,
        ...(memory.confusionCues === undefined ? {} : { confusionCues: memory.confusionCues }) };
    const generation = generateActions(m.decision.generation, view, p);
    const evaluation = evaluateActions(generation, view, memory.episodes, m.decision.context, t, p);
    const selected = selectAction(evaluation, m.decision, rng);
    let conversations = memory.conversations;
    const assessments = (m.decision.communication?.conversations ?? []).map(spec => {
        const record = assessConversation(conversation(conversations ?? [], spec.partner), evaluation, spec);
        conversations = keepConversation(conversations ?? [], record);
        return record;
    });
    let termReadings = memory.termReadings;
    let message;
    const plan = m.decision.communication?.encode?.find(plan => plan.action === selected.intention.action && plan.target === selected.intention.target);
    if (plan && selected.intention.id !== m.decision.current?.id) {
        const encoded = encode(selected.intention, memory, plan);
        message = encoded.message;
        termReadings = encoded.readings;
        for (const partner of message.receivers)
            for (const utterance of message.utterances) {
                const updated = conversationTurn(conversation(conversations ?? [], partner), utterance, [{ about: utterance.about, attribute: utterance.claim.attribute }], {}, theta.eta, false);
                conversations = keepConversation(conversations ?? [], updated.record);
            }
    }
    return { intention: selected.intention, trace: { ...selected.trace,
            ...(assessments.length ? { conversations: assessments } : {}), ...(message ? { message } : {}) }, counters: selected.counters,
        ...(message ? { message } : {}),
        next: { ...(conversations === undefined ? {} : { conversations }),
            ...(memory.testimony === undefined ? {} : { testimony: memory.testimony }),
            ...(termReadings === undefined ? {} : { termReadings }),
            ...(memory.equivocationCues === undefined ? {} : { equivocationCues: memory.equivocationCues }),
            ...(memory.meaningPool === undefined ? {} : { meaningPool: memory.meaningPool }),
            ...(memory.confusionCues === undefined ? {} : { confusionCues: memory.confusionCues }), beliefs: memory.beliefs, episodes: memory.episodes, reliability: memory.reliability } };
}
