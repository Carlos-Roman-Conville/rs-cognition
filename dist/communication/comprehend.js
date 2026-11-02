import { getBelief, reliabilityMean } from "../beliefs.js";
function count(n) {
    if (!Number.isFinite(n) || n < 0)
        throw new RangeError("Meaning counts must be finite and nonnegative");
    return n;
}
function candidates(pool, term) {
    const result = Object.hasOwn(pool, term) ? pool[term] : [];
    if (new Set(result.map(m => m.id)).size !== result.length)
        throw new RangeError("Meaning ids must be unique per term");
    return result;
}
/** DESIGN §5.1: two-level Dirichlet (Teh et al. 2006); proposed concentration 1.
 * Scale counts and alpha together to avoid overflowing their sums. Zero-mass pools are unknown.
 */
export function selectMeaning(pool, term, bubble, alpha = 1) {
    if (!Number.isFinite(alpha) || alpha <= 0)
        throw new RangeError("Pool concentration must be positive and finite");
    const meanings = candidates(pool, term);
    let scale = alpha;
    for (const m of meanings)
        for (const n of Object.values(m.counts))
            scale = Math.max(scale, count(n));
    const totals = meanings.map(m => Object.values(m.counts).reduce((sum, n) => sum + n / scale, 0));
    const N = totals.reduce((sum, n) => sum + n, 0);
    if (N === 0)
        return undefined;
    const local = meanings.map(m => Object.hasOwn(m.counts, bubble) ? m.counts[bubble] / scale : 0);
    const B = local.reduce((sum, n) => sum + n, 0);
    return { kind: "categorical", values: meanings.map(m => m.id), probabilities: totals.map((n, i) => B === 0 ? n / N : (local[i] + (alpha / scale) * (n / N)) / (B + alpha / scale)) };
}
/** DESIGN §5.1, §18.1: explicit definition or observed usage adds exactly one count. */
export function reconstruct(pool, term, candidate, bubble) {
    const held = candidates(pool, term);
    const existing = held.find(m => m.id === candidate.id);
    if (existing && (existing.attribute !== candidate.attribute || existing.value.value !== candidate.value.value)) {
        throw new RangeError("A meaning id cannot change its rule");
    }
    const meanings = existing ? held : [...held, { ...candidate, counts: {} }];
    return { ...pool, [term]: meanings.map(m => m.id === candidate.id ? {
            ...m, counts: { ...m.counts, [bubble]: count((Object.hasOwn(m.counts, bubble) ? m.counts[bubble] : 0) + 1) },
        } : m) };
}
/** DESIGN §5.1: reinforcement requires an observed confirmation, never mere reception. */
export function reinforce(pool, term, meaning, bubble) {
    const candidate = candidates(pool, term).find(m => m.id === meaning);
    if (!candidate)
        throw new RangeError("Cannot reinforce an unknown meaning");
    return reconstruct(pool, term, candidate, bubble);
}
/** DESIGN §5.1: meaning selection, prior fit and credibility mixture; no belief mutation.
 * Unknown speakers use proposed Beta(1,1) ignorance. Speaker intent is not a definition.
 */
export function comprehend(view, message, context) {
    if (!Number.isFinite(context.thetaPre) || context.thetaPre < 0 || context.thetaPre > 1)
        throw new RangeError("Invalid fit threshold");
    let pool = view.meaningPool ?? {};
    let readings = view.termReadings ?? [];
    for (const usage of context.usage ?? [])
        pool = reconstruct(pool, usage.term, usage.meaning, usage.bubble);
    for (const confirmed of context.confirmed ?? [])
        pool = reinforce(pool, confirmed.term, confirmed.meaning, confirmed.bubble);
    const r = reliabilityMean(view.reliability.find(entry => entry.speaker === message.sender)?.belief ?? { alpha: 1, beta: 1 });
    const utterances = message.utterances.map((utterance) => {
        if (utterance.declared)
            pool = reconstruct(pool, utterance.term, utterance.declared, context.bubble);
        const distribution = selectMeaning(pool, utterance.term, context.bubble, context.poolConcentration);
        const meanings = candidates(pool, utterance.term);
        const probabilities = distribution?.probabilities ?? meanings.map(() => 0);
        // DESIGN §5.1: F = sum P(m) P_prior(claim_m); absent categorical priors supply no fit evidence.
        const F = meanings.reduce((sum, m, i) => {
            const prior = getBelief(view.beliefs, utterance.about, m.attribute);
            return sum + probabilities[i] * (prior?.kind === "categorical" ? prior.probabilities[prior.values.indexOf(m.value.value)] ?? 0 : 0);
        }, 0);
        const testimony = [];
        if (distribution)
            for (const attribute of new Set(meanings.map(m => m.attribute))) {
                const prior = getBelief(view.beliefs, utterance.about, attribute);
                if (prior?.kind !== "categorical")
                    continue;
                for (const m of meanings.filter(m => m.attribute === attribute)) {
                    if (!prior.values.includes(m.value.value))
                        throw new RangeError("Meaning value must be in the belief support");
                }
                // DESIGN §5.1, §2.3: marginalize alternative readings. A reading about another
                // attribute supplies no evidence here (constant likelihood 1, proposed).
                const likelihood = prior.values.map(value => meanings.reduce((sum, m, i) => sum + probabilities[i] *
                    (m.attribute === attribute ? (value === m.value.value ? r : 0) + (1 - r) / prior.values.length : 1), 0));
                testimony.push({ about: utterance.about, attribute, values: prior.values, likelihood });
            }
        // DESIGN §5.1: stable mint-order argmax; track only within an identified conversation.
        const best = distribution && meanings[probabilities.reduce((best, p, i) => p > probabilities[best] ? i : best, 0)];
        const previous = readings.find(r => r.speaker === message.sender && r.conversation === context.conversation && r.term === utterance.term);
        const equivocation = best && previous && previous.meaning !== best.id && !utterance.declared
            ? { speaker: message.sender, term: utterance.term, from: previous.meaning, to: best.id } : undefined;
        if (best && context.conversation !== undefined) {
            const reading = { speaker: message.sender, conversation: context.conversation, term: utterance.term, meaning: best.id };
            readings = previous ? readings.map(r => r === previous ? reading : r) : [...readings, reading];
        }
        return { utterance, distribution, F,
            ...(equivocation ? { equivocation } : {}),
            ...(best ? { pending: { speaker: message.sender, about: utterance.about, attribute: best.attribute, value: best.value.value, t: message.t } } : {}),
            ...(!distribution || F < context.thetaPre ? {
                confusion: { speaker: message.sender, term: utterance.term, F },
            } : {}), testimony };
    });
    return { pool, utterances, readings };
}
