import { getBelief } from "../beliefs.ts";
import type { Intention, MemoryState } from "../types.ts";
import { selectMeaning } from "./comprehend.ts";
import type { EncodePlan, Message, TermReading, Utterance } from "./types.ts";

/** DESIGN §5.1: content only, after select; host term order breaks ties. */
export function encode(intention: Intention, memory: MemoryState, plan: EncodePlan): {
  message: Message; readings: readonly TermReading[];
} {
  if (intention.status !== "active" || intention.action !== plan.action || intention.target !== plan.target)
    throw new RangeError("Encode requires the selected utterance intention");
  const articulability = plan.articulability ?? 1; // DESIGN §5.1 neutral default.
  if (!Number.isFinite(articulability) || articulability < 0 || articulability > 1 ||
      !Number.isSafeInteger(plan.capacity) || plan.capacity < 0) throw new RangeError("Invalid encode capacity or articulability");
  const pool = memory.meaningPool ?? {};
  let readings = memory.termReadings ?? [];
  // Proposed atomic-detail convention: floor, then medium truncation in host order.
  const details = plan.details.slice(0, Math.min(Math.floor(plan.details.length * articulability), plan.capacity));
  const utterances: Utterance[] = details.map(detail => {
    const belief = getBelief(memory.beliefs, detail.about, detail.attribute);
    const value = detail.value ?? (belief?.kind === "categorical" ? belief.values[belief.probabilities.reduce(
      (best, p, i) => p > belief.probabilities[best] ? i : best, 0)] : undefined);
    if (value === undefined) throw new RangeError("Honest claims require a categorical belief");
    let best: { term: string; meaning: string; probability: number } | undefined;
    for (const term of plan.terms) {
      const distribution = selectMeaning(pool, term, plan.bubble);
      for (const candidate of Object.hasOwn(pool, term) ? pool[term] : []) {
        if (candidate.attribute !== detail.attribute || candidate.value.value !== value) continue;
        const binding = readings.find(r => r.speaker === intention.mind && r.conversation === plan.conversation && r.term === term);
        if (binding && binding.meaning !== candidate.id && detail.declared?.id !== candidate.id) continue;
        const probability = distribution?.probabilities[distribution.values.indexOf(candidate.id)] ?? 0;
        if (!best || probability > best.probability) best = { term, meaning: candidate.id, probability };
      }
    }
    if (!best) throw new RangeError("No consistent host term expresses the claim");
    const binding = { speaker: intention.mind, conversation: plan.conversation, term: best.term, meaning: best.meaning };
    const previous = readings.find(r => r.speaker === binding.speaker && r.conversation === binding.conversation && r.term === binding.term);
    readings = previous ? readings.map(r => r === previous ? binding : r) : [...readings, binding];
    return { act: detail.act, term: best.term, about: detail.about, claim: { attribute: detail.attribute, value },
      ...(detail.declared ? { declared: detail.declared } : {}) };
  });
  return { message: { id: intention.id, sender: intention.mind, receivers: plan.receivers,
    medium: plan.medium, t: intention.t, utterances }, readings };
}
