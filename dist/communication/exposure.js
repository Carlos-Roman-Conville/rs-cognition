import { retrievalProbability } from "../memory.js";
/** DESIGN §5.1, §18.3: host context features `bubble:<handle>: true` mark group membership.
 * DESIGN §21.4 split: each episode contributes once, divided among its distinct groups.
 */
export function bubbleExposure(episodes, t, params) {
    const weights = new Map();
    for (const episode of episodes) {
        const groups = Object.entries(episode.context).filter(([key, value]) => key.startsWith("bubble:") && value === true)
            .map(([key]) => key.slice("bubble:".length));
        if (groups.length === 0)
            continue;
        const salience = 1; // TODO(§16 salience): episodes do not yet carry s_e.
        const share = retrievalProbability(episode, t, params) * salience / groups.length;
        for (const group of groups)
            weights.set(group, (weights.get(group) ?? 0) + share);
    }
    const total = [...weights.values()].reduce((sum, weight) => sum + weight, 0);
    return Object.fromEntries([...weights].map(([group, weight]) => [group, total === 0 ? 0 : weight / total]));
}
