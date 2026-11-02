import { getBelief } from "../beliefs.js";
/** DESIGN §2.3: read the mind's categorical belief using its own office handle. */
export function recognition(beliefs, officeHandle, domain) {
    const attribute = "ought_obey:" + domain;
    const belief = getBelief(beliefs, officeHandle, attribute);
    if (belief === undefined)
        return null;
    const key = JSON.stringify([officeHandle, attribute]);
    if (belief.kind !== "categorical")
        throw new RangeError(`Recognition belief ${key} must be categorical`);
    const index = belief.values.indexOf("true");
    if (index < 0)
        throw new RangeError(`Recognition belief ${key} must contain value "true"`);
    return belief.probabilities[index];
}
/** Host adapter for government.port.recognition; no beliefs are created or updated. */
export function createRecognitionReader(lookup) {
    return {
        recognition(person, actor, domain) {
            const beliefs = lookup.beliefs(person);
            if (beliefs === undefined)
                return null;
            const handle = lookup.handle(person, actor);
            return handle === undefined ? null : recognition(beliefs, handle, domain);
        },
    };
}
