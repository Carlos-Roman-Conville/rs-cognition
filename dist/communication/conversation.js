import { updateCategorical } from "../beliefs.js";
import { softmax } from "../select.js";
export function conversation(records, partner) {
    return records.find(r => r.partner === partner) ?? { partner, sharedContext: [], turns: 0 };
}
export function keepConversation(records, record) {
    return records.some(r => r.partner === record.partner) ? records.map(r => r.partner === record.partner ? record : r) : [...records, record];
}
/** DESIGN §5.1: subjective topics only; intention evidence reuses §2.3 updateCategorical. */
export function conversationTurn(record, utterance, topics, context, eta, heard) {
    const known = (topic) => record.sharedContext.some(t => t.about === topic.about && t.attribute === topic.attribute);
    const outside = topics.length === 0 || topics.some(t => !known(t));
    const linked = context.links?.some(known) ?? false;
    let perceivedIntention = record.perceivedIntention;
    if (heard && context.intentionModel) {
        const model = context.intentionModel;
        const prior = perceivedIntention ?? model.prior;
        if (prior.values.join("\0") !== model.prior.values.join("\0"))
            throw new RangeError("Intention support changed");
        if (!Object.hasOwn(model.likelihoods, utterance.act))
            throw new RangeError("Missing act likelihood");
        perceivedIntention = updateCategorical(prior, model.likelihoods[utterance.act], eta);
    }
    const sharedContext = [...record.sharedContext];
    for (const topic of topics)
        if (!sharedContext.some(t => t.about === topic.about && t.attribute === topic.attribute))
            sharedContext.push(topic);
    return { record: { ...record, sharedContext, turns: record.turns + 1,
            ...(perceivedIntention ? { perceivedIntention } : {}) },
        ...(heard && outside && !linked ? { confusion: { speaker: record.partner, term: utterance.term, F: 0 } } : {}) };
}
/** DESIGN §5.1: σ(β(max EU(turn)-EU(leave))), stable two-way softmax; no choice or RNG. */
export function assessConversation(record, evaluation, spec) {
    const same = (a, b) => a.action === b.action && a.target === b.target;
    const leave = evaluation.candidates.find(r => same(r.candidate, spec.leave));
    const turns = evaluation.candidates.filter(r => !same(r.candidate, spec.leave) && spec.turns.some(a => same(r.candidate, a)));
    if (!leave || turns.length === 0)
        throw new RangeError("Tolerance needs eligible turn and leave evaluations");
    const conversationTolerance = softmax([Math.max(...turns.map(r => r.expectedUtility)), leave.expectedUtility], evaluation.view.params.beta)[0];
    return { ...record, conversationTolerance, ...(record.turns === 0 ? { engagementWillingness: conversationTolerance } : {}) };
}
