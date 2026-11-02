import { canonical } from "@rex/kernel";
import { klDivergence } from "../../src/index.ts";
import type { CognitiveFunction } from "../../src/index.ts";
import type { ScenarioTrace, StepMask } from "../../experimental/personality-v2/scenario.ts";
import { margin } from "./ledger.ts";
import type { DiagnosticEpoch } from "./ablation.ts";
import type { LedgerLevel } from "./ledger.ts";

export const V2_FUNCTIONS: CognitiveFunction[] = ["Se", "Si", "Ne", "Ni", "Te", "Ti", "Fe", "Fi"];
export type OperationTrace = Omit<ScenarioTrace, "operations"> & {
  operations: (Omit<ScenarioTrace["operations"][number], "operation"> & { operation: string })[];
};
export type V2Epoch = DiagnosticEpoch & { t: number; trace: Omit<DiagnosticEpoch["trace"], "v2"> & { v2?: OperationTrace } };
const action = (c: { action: string; target?: string }) => canonical([c.action, c.target ?? null]);
/** DESIGN §22.5: compare identical-prefix steps, not divergent trajectories.
 * Beliefs are measured before host resolution; singular KL is serialized explicitly.
 */
export function influence(base: V2Epoch, off: V2Epoch) {
  const a = base.trace.v2!, b = off.trace.v2!;
  const beliefKL = a.beliefs.entries.map(entry => {
    const other = b.beliefs.entries.find(e => e.about === entry.about && e.attribute === entry.attribute);
    const kl = other ? klDivergence(entry.belief, other.belief) : Infinity;
    return { about: entry.about, attribute: entry.attribute, kl: Number.isFinite(kl) ? kl : "Infinity" as const };
  });
  for (const entry of b.beliefs.entries) if (!a.beliefs.entries.some(e => e.about === entry.about && e.attribute === entry.attribute))
    beliefKL.push({ about: entry.about, attribute: entry.attribute, kl: "Infinity" });
  const ids = (row: V2Epoch) => row.trace.evaluation.map(action);
  const before = ids(base), after = ids(off);
  const candidates = { added: before.filter(id => !after.includes(id)), removed: after.filter(id => !before.includes(id)) };
  const baseMargin = margin(base, base.intention), maskedMargin = margin(off, base.intention);
  const decision = { base: action(base.intention), masked: action(off.intention),
    changed: action(base.intention) !== action(off.intention), baseMargin, maskedMargin,
    deltaMargin: baseMargin === null || maskedMargin === null ? null : baseMargin - maskedMargin };
  const meaningChanged = canonical(a.meanings) !== canonical(b.meanings);
  return { beliefKL, meaning: { base: a.meanings, masked: b.meanings, changed: meaningChanged }, candidates, decision,
    changed: beliefKL.some(r => r.kl !== 0) || meaningChanged || !!(candidates.added.length + candidates.removed.length)
      || decision.changed || (decision.deltaMargin !== null && decision.deltaMargin !== 0) };
}
export interface V2Run { scenario: string; seed: number; configuration: { version: string; stack?: string; control?: string }; hostInputLog: readonly V2Epoch[] }
export function buildV2Ledger(run: V2Run, level: LedgerLevel, rerun: (mask: StepMask, epoch: number) => V2Epoch) {
  const records = run.hostInputLog.flatMap(row => {
    if (!row.trace.v2) throw new Error("V2 ledger requires V2 trace");
    const executed = row.trace.v2.operations.filter(op => op.executed);
    // The mask API disables a function/operation pair, including repeated calls in a step.
    const unique = executed.filter((op, i) => executed.findIndex(x => x.function === op.function && x.operation === op.operation) === i);
    return unique.map(op => ({ epoch: row.epoch, function: op.function, operation: op.operation,
      allocation: row.trace.v2!.allocations.filter(a => a.function === op.function),
      executions: executed.filter(x => x.function === op.function && x.operation === op.operation),
      influence: influence(row, rerun({ t: row.t, function: op.function as CognitiveFunction, operation: op.operation }, row.epoch)) }));
  });
  const summary = V2_FUNCTIONS.map(f => {
    const own = records.filter(r => r.function === f);
    const allocations = run.hostInputLog.flatMap(r => r.trace.v2!.allocations.filter(a => a.function === f).slice(-1));
    const influenced = own.filter(r => r.influence.changed).length;
    const effects = own.flatMap(r => r.influence.decision.deltaMargin === null ? [] : [r.influence.decision.deltaMargin]);
    return { function: f, allocation: { att: allocations.reduce((s, a) => s + a.A.att, 0) / run.hostInputLog.length,
      eval: allocations.reduce((s, a) => s + a.A.eval, 0) / run.hostInputLog.length },
      executions: own.reduce((s, r) => s + r.executions.length, 0),
      // §10 denominator: one function opportunity per step, including absent functions.
      opportunities: run.hostInputLog.length, eligible: new Set(own.map(r => r.epoch)).size,
      executionShare: records.length ? own.length / records.length : 0,
      influenceShare: records.filter(r => r.influence.changed).length ? influenced / records.filter(r => r.influence.changed).length : 0,
      influenced, deltaUSum: effects.reduce((a, b) => a + b, 0), deltaUCount: effects.length };
  });
  return { schema: "function-ledger/v2" as const, scenario: run.scenario, seed: run.seed, configuration: run.configuration,
    method: "same-prefix-step-operation-mask", limitations: ["Shares count function/operation pairs per step, not additive causal magnitudes.",
      "No composition model or audience meaning pools in S1/S3; Te/Ne generation and Fe mapping lack inputs. Held operations remain unimplemented.",
      "Encoding may affect later decisions; this ledger measures immediate step influence only."],
    // §22.5: shared parameters have their own row, never assigned to a function.
    sharedParameters: run.hostInputLog.map(row => ({ epoch: row.epoch, changes: row.trace.hooks.flatMap(call => {
      if (call.hook !== "interpret" && call.hook !== "generate") return [];
      const a = (call.hook === "generate" ? (call.after as { params: object }).params : call.after) as Record<string, number>;
      const b = (call.hook === "generate" ? (call.before as { params: object }).params : call.before) as Record<string, number>;
      return ["eta", "alpha0", "lambda", "kappa", "beta"].filter(key => a[key] !== b[key]).map(key => ({ parameter: key, before: b[key], after: a[key] }));
    }) })), summary, ...(level === "detailed" ? { records } : {}) };
}
export type V2Ledger = ReturnType<typeof buildV2Ledger>;
