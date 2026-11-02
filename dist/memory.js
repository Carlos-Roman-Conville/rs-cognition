import { mint, SECOND, simTime } from "@rex/kernel";
import { categorical } from "./beliefs.js";
import { DEFAULT_COGNITIVE_PARAMS } from "./types.js";
function finite(value, name) {
    if (!Number.isFinite(value))
        throw new RangeError(`${name} must be finite`);
}
function validateParams({ d, tau, s }) {
    finite(d, "d");
    finite(tau, "tau");
    finite(s, "s");
    if (d <= 0 || s <= 0)
        throw new RangeError("Memory requires d > 0 and s > 0");
}
function validateContext(context) {
    for (const value of Object.values(context)) {
        if (typeof value === "number")
            finite(value, "context feature");
        else if (typeof value !== "string" && typeof value !== "boolean") {
            throw new RangeError("Context features must be strings, finite numbers or booleans");
        }
    }
}
/** DESIGN §2.3, §4: encode subjective experience; kernel mint adds the dot to prefix ep. */
export function encodeEpisode(input, counters) {
    simTime(input.t);
    finite(input.reward, "reward");
    finite(input.predictionError, "predictionError");
    validateContext(input.context);
    const minted = mint(counters, "ep");
    return {
        counters: minted.counters,
        episode: {
            id: minted.id, t: input.t, retrievals: [], context: { ...input.context },
            action: input.action, outcome: input.outcome, reward: input.reward,
            predictionError: input.predictionError, attributedCause: input.attributedCause, domain: input.domain,
        },
    };
}
/**
 * DESIGN §2.3: ACT-R B = ln Σ (t - t_j)^(-d), with SimTime ms converted to seconds.
 * Default d = 0.5: Anderson & Lebiere (1998); presentation history: Anderson & Schooler (1991).
 * Proposed zero-delay convention: use the formula's +Infinity limit (P = 1), without a time floor.
 */
export function baseLevelActivation(episode, t, d = DEFAULT_COGNITIVE_PARAMS.d) {
    finite(d, "d");
    if (d <= 0)
        throw new RangeError("Memory decay d must be positive");
    simTime(t);
    let previous = simTime(episode.t);
    const logs = [];
    for (const presentation of [episode.t, ...episode.retrievals]) {
        simTime(presentation);
        if (presentation < previous || presentation > t) {
            throw new RangeError("Presentations must be chronological and no later than retrieval time");
        }
        previous = presentation;
        const ageSeconds = (t - presentation) / SECOND;
        const logWeight = ageSeconds === 0 ? Infinity : -d * Math.log(ageSeconds);
        if (ageSeconds > 0)
            finite(logWeight, "activation term");
        logs.push(logWeight);
    }
    // Log-sum-exp is algebraically identical to the DESIGN §2.3 sum, avoiding power overflow/underflow.
    const maximum = logs.reduce((max, value) => Math.max(max, value), -Infinity);
    if (maximum === Infinity)
        return Infinity;
    return maximum + Math.log(logs.reduce((sum, value) => sum + Math.exp(value - maximum), 0));
}
/** DESIGN §2.3: ACT-R logistic retrieval, Anderson & Lebiere (1998); tau/s defaults remain proposed. */
export function retrievalProbability(episode, t, params = DEFAULT_COGNITIVE_PARAMS) {
    validateParams(params);
    const activation = baseLevelActivation(episode, t, params.d);
    const difference = activation - params.tau;
    // Divide first only if subtraction overflowed; preserve cancellation for nearby finite values.
    const z = Number.isFinite(activation) && !Number.isFinite(difference)
        ? activation / params.s - params.tau / params.s : difference / params.s;
    // Sign-separated logistic keeps both tails in [0, 1] without exponent overflow.
    if (z >= 0)
        return 1 / (1 + Math.exp(-z));
    const weight = Math.exp(z);
    return weight / (1 + weight);
}
/**
 * DESIGN §2.3, §7: one Bernoulli draw realizes the logistic retrieval probability.
 * Caller supplies streams.get("cognition.memory.retrieve", mindId); only success adds a presentation.
 * Always consumes one draw, including probabilities 0 and 1, for a fixed replay contract.
 */
export function retrieveEpisode(episode, t, stream, params = DEFAULT_COGNITIVE_PARAMS) {
    const probability = retrievalProbability(episode, t, params);
    const draw = stream();
    if (!Number.isFinite(draw) || draw < 0 || draw >= 1)
        throw new RangeError("Stream draw must be in [0, 1)");
    const retrieved = draw < probability;
    return {
        episode: retrieved ? { ...episode, retrievals: [...episode.retrievals, t] } : episode,
        retrieved, probability,
    };
}
/** DESIGN §2.3 E(a,c), proposed: exact own-key/value equality of all declared features, no partial match. */
export function contextMatches(left, right) {
    validateContext(left);
    validateContext(right);
    const keys = Object.keys(left);
    return keys.length === Object.keys(right).length &&
        keys.every((key) => Object.hasOwn(right, key) && left[key] === right[key]);
}
/**
 * DESIGN §2.3: n_o = alpha0 P_theory(o) + Σ P_retrieve(e)[o_e = o]; P_hat = n_o / Σ n.
 * Instance-based learning: Gonzalez, Lerch & Lebiere (2003); Gonzalez & Dutt (2011).
 * Pass episodes in mint order. This expectation read consumes no RNG and adds no presentations.
 * P_theory is supplied by the repertoire, already evaluated from subjective beliefs (§2.4).
 */
export function outcomeExpectations(episodes, action, context, theory, t, params = DEFAULT_COGNITIVE_PARAMS) {
    simTime(t);
    validateParams(params);
    validateContext(context);
    finite(params.alpha0, "alpha0");
    if (params.alpha0 < 0)
        throw new RangeError("Prior strength alpha0 must be nonnegative");
    const prior = categorical(theory.values, theory.probabilities);
    const counts = prior.probabilities.map((p) => params.alpha0 * p);
    const indexes = new Map(prior.values.map((value, index) => [value, index]));
    for (const episode of episodes) {
        if (episode.action !== action || !contextMatches(episode.context, context))
            continue;
        const index = indexes.get(episode.outcome);
        if (index === undefined)
            throw new RangeError("Matching episode outcome is outside the declared outcome space");
        counts[index] += retrievalProbability(episode, t, params);
        finite(counts[index], "outcome count");
    }
    // DESIGN §10 zero-count boundary: proposed uniform ignorance when theory and experience supply no mass.
    const weights = counts.some((count) => count > 0) ? counts : counts.map(() => 1);
    return { counts, distribution: categorical(prior.values, weights) };
}
