import { generateActions } from "../actions.ts";
import type { GenerationInputs } from "../actions.ts";
import { categorical, getBelief, setBelief } from "../beliefs.ts";
import { evaluateActions } from "../evaluate.ts";
import { nullPersonality } from "../personality.ts";
import type { PersonalityModel } from "../personality.ts";
import type { BeliefStore, Episode, MindView } from "../types.ts";
import type { Utterance } from "./types.ts";
import type { SimTime } from "@rex/kernel";

export interface PersuasionInputs {
  readonly utterance: Utterance;
  readonly before: MindView;
  readonly after: BeliefStore;
  readonly generation: GenerationInputs;
  readonly episodes: readonly Episode[];
  readonly context: Episode["context"];
  readonly t: SimTime;
  readonly action: { readonly action: string; readonly target?: string };
  /** Speaker's claims for counterfactuals, including beliefs not targeted by this utterance. */
  readonly claims: readonly { readonly about: string; readonly attribute: string; readonly value: string }[];
}
/** DESIGN §5.1: diagnostic only. Reuses generation/EU, with no selection, RNG or state writes.
 * Each counterfactual moves one categorical belief fully to the supplied claim (proposed).
 * Mint-order ties are stable; no positive gap reduction means no identified objection.
 */
export function persuasion(input: PersuasionInputs, personality: PersonalityModel = nullPersonality) {
  const evaluate = (beliefs: BeliefStore) => {
    const view = { ...input.before, beliefs };
    return evaluateActions(generateActions(input.generation, view, personality), view,
      input.episodes, input.context, input.t, personality).candidates;
  };
  const before = evaluate(input.before.beliefs);
  const after = evaluate(input.after);
  const same = (a: { action: string; target?: string }, b: { action: string; target?: string }) => a.action === b.action && a.target === b.target;
  const gap = (rows: typeof before) => {
    const chosen = rows.find(r => same(r.candidate, input.action));
    if (!chosen) throw new RangeError("Persuasion action must remain eligible");
    return Math.max(...rows.map(r => r.expectedUtility)) - chosen.expectedUtility;
  };
  const definition = [...input.generation.repertoire, input.generation.wait]
    .find(d => d.id === input.action.action && d.target === input.action.target);
  if (!definition) throw new RangeError("Unknown persuasion action");
  const read = new Set<string>();
  // Observe actual naive-model belief reads, not unrelated preconditions or metadata.
  definition.naiveModel({ entries: input.before.beliefs.entries.map(entry => ({ ...entry,
    get belief() { read.add(JSON.stringify([entry.about, entry.attribute])); return entry.belief; },
  })) });
  const targets = input.before.beliefs.entries.flatMap(entry => {
    const posterior = getBelief(input.after, entry.about, entry.attribute);
    return posterior && JSON.stringify(posterior) !== JSON.stringify(entry.belief)
      ? [{ about: entry.about, attribute: entry.attribute }] : [];
  });
  const originalGap = gap(before);
  let objection: { about: string; attribute: string; reduction: number } | undefined;
  const counterfactuals = input.claims.flatMap(claim => {
    if (!read.has(JSON.stringify([claim.about, claim.attribute]))) return [];
    const prior = getBelief(input.before.beliefs, claim.about, claim.attribute);
    if (prior?.kind !== "categorical" || !prior.values.includes(claim.value)) throw new RangeError("Claim must match categorical support");
    const beliefs = setBelief(input.before.beliefs, claim.about, claim.attribute,
      categorical(prior.values, prior.values.map(v => v === claim.value ? 1 : 0)));
    const reduction = originalGap - gap(evaluate(beliefs));
    if (reduction > (objection?.reduction ?? 0)) objection = { about: claim.about, attribute: claim.attribute, reduction };
    return [{ ...claim, reduction }];
  });
  const candidates: { action: string; target?: string; before: number | null; after: number | null }[] = before.map(row => ({ action: row.candidate.action, target: row.candidate.target,
    before: row.expectedUtility, after: after.find(r => same(r.candidate, row.candidate))?.expectedUtility ?? null }));
  for (const row of after) if (!before.some(r => same(r.candidate, row.candidate)))
    candidates.push({ action: row.candidate.action, target: row.candidate.target, before: null, after: row.expectedUtility });
  return { utterance: input.utterance, targets, candidates, objection, counterfactuals,
    hit: objection !== undefined && targets.some(t => t.about === objection!.about && t.attribute === objection!.attribute) };
}
