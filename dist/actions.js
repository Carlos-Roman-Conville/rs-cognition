import { categorical } from "./beliefs.js";
import { nullPersonality } from "./personality.js";
function nonnegative(value, name) {
    if (!Number.isFinite(value) || value < 0)
        throw new RangeError(`${name} must be finite and nonnegative`);
}
function validateFeasibility(candidate) {
    for (const value of Object.values(candidate.terms ?? {})) {
        if (!Number.isFinite(value))
            throw new RangeError("Term values must be finite numbers");
    }
    if (candidate.exchange) {
        const { give, want } = candidate.exchange;
        if (give.asset === want.asset)
            throw new RangeError("Exchange assets must differ");
        for (const units of [give.units, ...(want.units === undefined ? [] : [want.units])]) {
            if (!Number.isFinite(units) || units <= 0)
                throw new RangeError("Exchange units must be finite and positive");
        }
    }
    nonnegative(candidate.cost, "cost");
    nonnegative(candidate.capacityRequired, "required capacity");
    if (!Number.isSafeInteger(candidate.duration) || candidate.duration < 1)
        throw new RangeError("Duration must be positive epochs");
    for (const condition of candidate.preconditions) {
        nonnegative(condition.probability, "precondition probability");
        if (condition.probability > 1)
            throw new RangeError("Precondition probability must be <= 1");
    }
}
/** Shared boundary validation also applies to recombinations returned by the generate hook. */
export function validateCandidate(candidate) {
    validateFeasibility(candidate);
    const ids = candidate.effects.map((effect) => effect.id);
    if (ids.length === 0 || new Set(ids).size !== ids.length ||
        ids.length !== candidate.outcomes.values.length || ids.some((id, i) => id !== candidate.outcomes.values[i])) {
        throw new RangeError("Theory must follow the declared unique outcome order");
    }
    categorical(candidate.outcomes.values, candidate.outcomes.probabilities);
    const total = candidate.outcomes.probabilities.reduce((sum, p) => sum + p, 0);
    if (Math.abs(total - 1) > 1e-12)
        throw new RangeError("Theory probabilities must sum to one");
    for (const effect of candidate.effects) {
        for (const value of [...Object.values(effect.deficits), ...Object.values(effect.goalProgress)]) {
            nonnegative(value, "predicted deficit/progress");
            if (value > 1)
                throw new RangeError("Predicted deficit/progress must be <= 1");
        }
    }
}
/** DESIGN §3: detach host data before deeply freezing the subjective candidate. */
function freezeCandidate(candidate) {
    function freeze(value) {
        if (value !== null && typeof value === "object") {
            for (const child of Object.values(value))
                freeze(child);
            Object.freeze(value);
        }
    }
    const copy = structuredClone(candidate);
    freeze(copy);
    return copy;
}
function sameAction(left, right) {
    return left.action === right.action && left.target === right.target;
}
/** DESIGN §2.4: θ_pre=0.5 proposed; capacity is a declared body input, never computed here. */
export function generateActions(inputs, ctx, personality = nullPersonality) {
    const thetaPre = inputs.thetaPre ?? 0.5; // DESIGN §2.4 proposed default.
    nonnegative(thetaPre, "thetaPre");
    if (thetaPre > 1)
        throw new RangeError("thetaPre must be <= 1");
    nonnegative(inputs.body.capacity_functional, "body.capacity_functional");
    const wait = inputs.wait;
    if (wait.exchange !== undefined)
        throw new RangeError("The host fallback must have no exchange");
    if (wait.terms !== undefined)
        throw new RangeError("The host's fallback must have no terms");
    if (wait.preconditions.length !== 0 || wait.capacityRequired !== 0 || wait.cost !== 0 || wait.duration !== 1) {
        throw new RangeError("The host's fallback must be unconditional, zero-cost, zero-capacity and one epoch");
    }
    const checks = [];
    const candidates = [];
    const definitions = [...inputs.repertoire, wait];
    for (let i = 0; i < definitions.length; i++) {
        const definition = definitions[i];
        if (definitions.slice(0, i).some((other) => other.id === definition.id && other.target === definition.target)) {
            throw new RangeError("Action/target pairs must be unique, including the fallback");
        }
        const metadata = {
            action: definition.id, target: definition.target, targetKind: definition.targetKind,
            ...(definition.exchange === undefined ? {} : { exchange: definition.exchange }),
            ...(definition.terms === undefined ? {} : { terms: definition.terms }),
            domain: definition.domain, duration: definition.duration, cost: definition.cost,
            capacityRequired: definition.capacityRequired,
            preconditions: definition.preconditions.map((condition) => ({ id: condition.id, probability: condition.probability(ctx.beliefs) })),
        };
        validateFeasibility(metadata);
        // DESIGN §2.4: each believed prerequisite must meet θ_pre; no independence assumption.
        const eligible = metadata.preconditions.every((condition) => condition.probability >= thetaPre) &&
            metadata.capacityRequired <= inputs.body.capacity_functional;
        checks.push({ action: metadata.action, target: metadata.target, capacityRequired: metadata.capacityRequired,
            preconditions: metadata.preconditions, eligible });
        if (eligible) {
            const candidate = { ...metadata, effects: definition.outcomeSpace, outcomes: definition.naiveModel(ctx.beliefs) };
            validateCandidate(candidate);
            candidates.push(freezeCandidate(candidate));
        }
    }
    const fallback = candidates[candidates.length - 1];
    const generated = personality.generate(candidates, { kappa: ctx.params.kappa }, ctx);
    nonnegative(generated.params.kappa, "kappa");
    const feasible = generated.candidates.filter((candidate) => {
        validateCandidate(candidate);
        return candidate.preconditions.every((condition) => condition.probability >= thetaPre) &&
            candidate.capacityRequired <= inputs.body.capacity_functional;
    });
    // DESIGN §2.4: hooks cannot remove or alter the required fallback. Preserve their remaining order.
    const result = feasible.map((candidate) => sameAction(candidate, fallback) ? fallback : candidate);
    if (!result.some((candidate) => sameAction(candidate, fallback)))
        result.push(fallback);
    if (result.some((candidate, i) => result.slice(0, i).some((other) => sameAction(candidate, other)))) {
        throw new RangeError("Generated action/target pairs must be unique");
    }
    return { ...(inputs.assets === undefined ? {} : { assets: structuredClone(inputs.assets) }), candidates: result.map(freezeCandidate), params: generated.params, thetaPre,
        capacityFunctional: inputs.body.capacity_functional, checks };
}
