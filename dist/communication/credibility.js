import { updateReliability } from "../beliefs.js";
import { reliabilityKLDivergence } from "../learning.js";
/** DESIGN §5.1: direct categorical identification confidence q weights Beta evidence.
 * Reports and null detections cannot settle claims. All matching older claims settle in receipt order.
 */
export function settleTestimony(memory, observation) {
    let reliability = memory.reliability;
    const settlements = [];
    if (observation.kind !== "categorical" || observation.channel === "report")
        return { reliability, testimony: memory.testimony, settlements };
    const testimony = memory.testimony?.filter(claim => {
        if (claim.t >= observation.t || claim.about !== observation.about || claim.attribute !== observation.attribute)
            return true;
        const held = reliability.find(r => r.speaker === claim.speaker);
        const prior = held?.belief ?? { alpha: 1, beta: 1 }; // §5.1 proposed ignorance prior.
        const posterior = updateReliability(prior, claim.value === observation.value, observation.model.q);
        const kl = reliabilityKLDivergence(posterior, prior);
        reliability = held ? reliability.map(r => r === held ? { ...r, belief: posterior } : r)
            : [...reliability, { speaker: claim.speaker, belief: posterior }];
        settlements.push({ speaker: claim.speaker, prior, posterior, kl: kl === Infinity ? "Infinity" : kl });
        return false;
    });
    return { reliability, testimony, settlements };
}
