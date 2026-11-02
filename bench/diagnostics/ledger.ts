import { canonical } from "@rex/kernel";
import type { CognitiveFunction } from "../../src/index.ts";
import type { EpochLog } from "../scenarios/s1-forage/world.ts";
import { adapter, ablatedOutput, DOMAIN, FUNCTIONS, HOOKS, hookContexts, rerunAblation } from "./ablation.ts";
import type { Ablation, Hook, Run } from "./ablation.ts";

export type LedgerLevel = "summary" | "detailed";
export type Eligibility = "activated" | "eligible-not-activated" | "no-relevant-input";
export interface Totals {
  decisions: number; activations: number; opportunities: number; frequency: number;
  changedHookCalls: number; attentionMoved: number; interpretationMagnitude: number;
  generationChanges: number; generationParameterMagnitude: number; learningContribution: number;
  deltaUSum: number; deltaUCount: number; meanDeltaU: number | null;
  eligibility: Record<Eligibility, number>;
}
export interface LedgerRecord {
  mind: string; epoch: number; function: CognitiveFunction; hook: Hook; stackPosition: string | null;
  activation: 0 | 1; eligibility: Eligibility; triggerTags: string[]; domains: string[];
  needPriorities: { id: string; priority: number }[]; formulas: string[];
  changedHookCalls: number; attentionMoved: number; interpretationDeltas: Record<string, number>;
  observationBeliefDeltas: EpochLog["trace"]["observationBeliefDeltas"] | null;
  generation: { added: string[]; removed: string[]; reordered: boolean; parameterMagnitude: number };
  learningContribution: number; deltaU: number | null;
  chosenAction: { action: string; target?: string }; laterLearning: EpochLog["trace"]["learning"]["updates"];
}
export interface SummaryRow extends Totals {
  mind: string; function: CognitiveFunction; hook: Hook; stackPosition: string | null; domain?: string;
}
export interface Ledger {
  schema: "function-ledger/v1"; scenario: string; seed: number; configuration: Run["configuration"];
  method: "FL-1/formula-group-ablation"; limitations: string[];
  developmentalStage: null; upbringing: null;
  totals: Totals; summary: SummaryRow[]; domains: SummaryRow[];
  records?: LedgerRecord[];
}
export const emptyTotals = (): Totals => ({ decisions: 0, activations: 0, opportunities: 0, frequency: 0,
  changedHookCalls: 0, attentionMoved: 0, interpretationMagnitude: 0, generationChanges: 0, generationParameterMagnitude: 0, learningContribution: 0,
  deltaUSum: 0, deltaUCount: 0, meanDeltaU: null,
  eligibility: { activated: 0, "eligible-not-activated": 0, "no-relevant-input": 0 } });

export function addTotals(to: Totals, from: Totals) {
  for (const key of ["decisions", "activations", "opportunities", "changedHookCalls", "attentionMoved", "interpretationMagnitude",
    "generationChanges", "generationParameterMagnitude", "learningContribution", "deltaUSum", "deltaUCount"] as const) to[key] += from[key];
  for (const key of Object.keys(to.eligibility) as Eligibility[]) to.eligibility[key] += from.eligibility[key];
  to.frequency = to.opportunities ? to.activations / to.opportunities : 0;
  to.meanDeltaU = to.deltaUCount ? to.deltaUSum / to.deltaUCount : null;
}

function recordTotals(record: LedgerRecord): Totals {
  return { decisions: 1, activations: record.activation, opportunities: Number(record.eligibility !== "no-relevant-input"), frequency: 0,
    changedHookCalls: record.changedHookCalls, attentionMoved: record.attentionMoved,
    interpretationMagnitude: Object.values(record.interpretationDeltas).reduce((sum, x) => sum + Math.abs(x), 0),
    generationChanges: record.generation.added.length + record.generation.removed.length + Number(record.generation.reordered),
    generationParameterMagnitude: record.generation.parameterMagnitude,
    learningContribution: record.learningContribution, deltaUSum: record.deltaU ?? 0, deltaUCount: Number(record.deltaU !== null), meanDeltaU: null,
    eligibility: { activated: Number(record.eligibility === "activated"),
      "eligible-not-activated": Number(record.eligibility === "eligible-not-activated"), "no-relevant-input": Number(record.eligibility === "no-relevant-input") } };
}

/** DESIGN diagnostics §1: margin of the BASE chosen action against its strongest competitor.
 * Missing action or competitor has no finite comparable margin: return null, never substitute zero.
 */
export function margin(row: EpochLog, chosen: LedgerRecord["chosenAction"]): number | null {
  const same = (candidate: LedgerRecord["chosenAction"]) => candidate.action === chosen.action && candidate.target === chosen.target;
  const value = row.trace.evaluation.find(same);
  const others = row.trace.evaluation.filter((candidate) => !same(candidate));
  return value && others.length ? value.expectedUtility - Math.max(...others.map((candidate) => candidate.expectedUtility)) : null;
}

function numericDeltas(base: unknown, other: unknown): Record<string, number> {
  const a = base as Record<string, unknown>, b = other as Record<string, unknown>;
  return Object.fromEntries(Object.entries(a).flatMap(([key, value]) => typeof value === "number" && typeof b[key] === "number"
    ? [[key, value - b[key]]] : []));
}

/** Same-input local ablation establishes activation; full reruns establish trajectory influence.
 * Comparing divergent rerun hook inputs would incorrectly count downstream changes as activation.
 */
export function localRecord(row: EpochLog, ablate: ReturnType<typeof adapter>, disabled: Ablation): LedgerRecord {
  const contexts = hookContexts(row), formulas = new Set<string>();
  let changedHookCalls = 0, attentionMoved = 0, parameterMagnitude = 0;
  const interpretationDeltas: Record<string, number> = {};
  const generation = { added: [] as string[], removed: [] as string[], reordered: false, parameterMagnitude: 0 };
  row.trace.hooks.forEach((call, index) => {
    if (call.hook !== disabled.hook) return;
    const switched = ablate.formulas(call.hook, call.domain);
    if (!switched.length) return;
    for (const formula of switched) formulas.add(formula);
    const output = ablatedOutput(call, contexts[index], ablate);
    if (canonical(output) === canonical(call.after)) return;
    changedHookCalls++;
    if (call.hook === "pertinence") {
      const original = call.after as Record<string, number>, off = output as Record<string, number>;
      // DESIGN §2.1: one S1 category per cue; preserve traced salience via w'/w = pi'/pi.
      const weights = row.trace.attention.weights.map((weight, i) => {
        const cue = row.trace.attention.cues[i];
        return original[cue] ? weight * off[cue] / original[cue] : 0;
      });
      const sum = weights.reduce((total, weight) => total + weight, 0);
      attentionMoved += weights.reduce((total, weight, i) => total + Math.abs(row.trace.attention.shares[i] - (sum ? weight / sum : 0)), 0);
    } else if (call.hook === "interpret") {
      for (const [key, value] of Object.entries(numericDeltas(call.after, output))) interpretationDeltas[key] = (interpretationDeltas[key] ?? 0) + value;
    } else if (call.hook === "generate") {
      const a = call.after as { candidates: { action: string; target?: string }[]; params: unknown };
      const b = output as typeof a;
      const ids = (candidates: typeof a.candidates) => candidates.map((c) => JSON.stringify([c.action, c.target ?? null]));
      const before = ids(a.candidates), after = ids(b.candidates);
      generation.added = before.filter((id) => !after.includes(id));
      generation.removed = after.filter((id) => !before.includes(id));
      generation.reordered = canonical(before.filter((id) => after.includes(id))) !== canonical(after.filter((id) => before.includes(id)));
      parameterMagnitude += Object.values(numericDeltas(a.params, b.params)).reduce((sum, x) => sum + Math.abs(x), 0);
    }
  });
  generation.parameterMagnitude = parameterMagnitude;
  const domains = [...new Set([...row.cues.map((cue) => cue.domain), ...row.trace.hooks.flatMap((call) => call.domain ? [call.domain] : [])])];
  const activation = changedHookCalls ? 1 : 0;
  // Formula-group fallback includes collective attitude opportunities outside the function's own domain.
  const relevant = domains.includes(DOMAIN[disabled.function]) || formulas.has("F1") || formulas.has("F2") || formulas.has("F3");
  const stackIndex = ablate.model?.stack.indexOf(disabled.function) ?? -1;
  const learningCalls = row.trace.hooks.filter((call) => call.hook === "learning");
  const learningContribution = disabled.hook === "learning" && activation ? row.trace.learning.updates.reduce((sum, update, i) => {
    if (learningCalls[i]?.domain !== DOMAIN[disabled.function]) return sum;
    if (update.kl === "Infinity") throw new Error("Singular domain learning KL cannot be represented as a finite ledger sum");
    return sum + update.kl;
  }, 0) : 0;
  return { mind: row.mind, epoch: row.epoch, ...disabled, stackPosition: stackIndex < 0 ? null : ["dominant", "auxiliary", "tertiary", "inferior"][stackIndex],
    activation, eligibility: activation ? "activated" : relevant ? "eligible-not-activated" : "no-relevant-input",
    triggerTags: [...new Set([...domains, ...row.cues.flatMap((cue) => cue.tags)])], domains,
    needPriorities: row.trace.selection.needs.needs.map((need) => ({ id: need.definition.id, priority: need.priority })),
    formulas: [...formulas], changedHookCalls, attentionMoved, interpretationDeltas, observationBeliefDeltas:
      disabled.hook === "pertinence" || disabled.hook === "interpret" ? row.trace.observationBeliefDeltas : null, generation,
    learningContribution, deltaU: null, chosenAction: { action: row.intention.action, target: row.intention.target }, laterLearning: row.trace.learning.updates };
}

export function buildLedger(run: Run, level: LedgerLevel = "summary", execute = rerunAblation): Ledger {
  if (!run.hostInputLog.length) throw new Error("Ledger needs a completed S1 run");
  const ledger: Ledger = { schema: "function-ledger/v1", scenario: run.scenario, seed: run.seed, configuration: run.configuration,
    method: "FL-1/formula-group-ablation", limitations: ["Shared formula groups overlap; function totals are not additive causal shares.",
      "Observation deltas describe the base trajectory, not independent causal shares; learning contribution is domain KL, not developmental E_f.",
      "DeltaU is a full-trajectory ablation effect; absent comparable chosen actions are excluded, not zero."],
    developmentalStage: null, upbringing: null, totals: emptyTotals(), summary: [], domains: [], ...(level === "detailed" ? { records: [] } : {}) };
  // Controls have no valid unpermuted V1 formula-group counterfactual. Keep the
  // existing processing trace, but do not mislabel randomized effects as functions.
  if (run.configuration.control && run.configuration.control !== "none") {
    ledger.limitations.push("Function attribution unavailable for T-1 controls; inspect the recorded hook traces and behavior metrics.");
    return ledger;
  }
  const summary = new Map<string, SummaryRow>(), domains = new Map<string, SummaryRow>();
  const reruns = new Map<string, (number | null)[]>();
  for (const f of FUNCTIONS) for (const hook of HOOKS) {
    const disabled = { function: f, hook }, ablate = adapter(run.configuration, disabled);
    const local = run.hostInputLog.map((row) => localRecord(row, ablate, disabled));
    // Exact inactive reuse: every hook return is identical on the complete base trajectory.
    // Deterministic induction establishes byte-identical states/streams without another world execution.
    // Equal masks at every input domain are equal adapters; include function ownership for F4/F5.
    const mask = JSON.stringify([hook, ...["space", "adaptation", "meta", "cohesion", "body", "people", "strategy", "none"].map((domain) =>
      ablate.formulas(hook, domain).map((formula) => formula === "F4" || formula === "F5" ? `${formula}:${f}` : formula))]);
    let margins = run.hostInputLog.map((row, i) => margin(row, local[i].chosenAction));
    if (local.some((record) => record.activation)) {
      const cached = reruns.get(mask);
      if (cached) margins = cached;
      else {
        const counterfactual = execute(run, disabled);
        margins = counterfactual.hostInputLog.map((row, i) => margin(row, local[i].chosenAction));
        reruns.set(mask, margins);
      }
    }
    local.forEach((record, i) => {
      const base = margin(run.hostInputLog[i], record.chosenAction), off = margins[i];
      record.deltaU = base === null || off === null ? null : base - off;
      const totals = recordTotals(record);
      addTotals(ledger.totals, totals);
      const add = (map: Map<string, SummaryRow>, domain?: string) => {
        const key = JSON.stringify([record.mind, f, hook, domain]);
        let row = map.get(key);
        if (!row) { row = { ...emptyTotals(), mind: record.mind, function: f, hook, stackPosition: record.stackPosition, ...(domain ? { domain } : {}) }; map.set(key, row); }
        addTotals(row, totals);
      };
      add(summary);
      for (const domain of record.triggerTags) add(domains, domain);
      ledger.records?.push(record);
    });
  }
  ledger.summary = [...summary.values()]; ledger.domains = [...domains.values()];
  // Return details in host mint order, then function/hook order.
  ledger.records?.sort((a, b) => a.epoch - b.epoch || FUNCTIONS.indexOf(a.function) - FUNCTIONS.indexOf(b.function) || HOOKS.indexOf(a.hook) - HOOKS.indexOf(b.hook));
  return ledger;
}
