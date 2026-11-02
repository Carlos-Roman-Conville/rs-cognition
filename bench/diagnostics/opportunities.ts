import { adapter, DOMAIN, FUNCTIONS, HOOKS, hookContexts } from "./ablation.ts";
import type { DiagnosticRun } from "./ledger.ts";
import type { CognitiveFunction } from "../../src/index.ts";

export const SHARED_ATTITUDE = "shared attitude (F1–F3)";
export interface InputCounts { input: number; total: number }
export interface OwnOpportunities { byFunction: { key: string; counts: InputCounts }[]; shared: InputCounts; sharedGroup?: string }

/** DESIGN scenarios §10.5; ownership and input predicates transcribed from frozen
 * personality/eight-function/v1/formulas.json F4–F13 (including its OFF exceptions).
 * Count function/hook/epoch tuples, as in the legacy ledger, but never infer input
 * from an output change. F7 and F11 retain their explicitly named owners.
 */
export function ownOpportunities(run: DiagnosticRun): OwnOpportunities {
  const byFunction = FUNCTIONS.map((key) => ({ key, counts: { input: 0, total: 0 } }));
  const shared = { input: 0, total: 0 };
  if (run.configuration.control && run.configuration.control !== "none") return { byFunction, shared };
  const model = adapter(run.configuration, { function: "Se", hook: "interpret" }).model;
  for (const row of run.hostInputLog) {
    const contexts = hookContexts(row);
    for (const hook of HOOKS) {
      shared.total++;
      if (model && row.trace.hooks.some((c) => c.hook === hook &&
        (hook === "interpret" || hook === "pertinence" && Object.keys(c.before as object).length > 0))) shared.input++;
      for (const entry of byFunction) {
        entry.counts.total++;
        const f: CognitiveFunction = entry.key;
        if (!model?.weights[f]) continue;
        const input = row.trace.hooks.some((call, i) => {
          if (call.hook !== hook) return false;
          const ctx = contexts[i], person = ctx.aboutPerson ?? call.domain === "people";
          if (hook === "pertinence") return row.cues.some((cue) =>
            Object.hasOwn(call.before as object, cue.cue) &&
            (["Se", "Ne", "Te"].includes(f) && cue.domain === DOMAIN[f] ||
              f === "Se" && cue.tags.includes("physical") && cue.tags.includes("present")));
          if (hook === "interpret") return (["Se", "Si", "Ne", "Ni", "Te"].includes(f) && call.domain === DOMAIN[f]) ||
            (f === "Se" && Boolean(ctx.targeted || person && ctx.present)) ||
            (f === "Ni" && person) || (f === "Te" && Boolean(ctx.testimony));
          if (hook === "learning") return (["Se", "Si", "Ne", "Ni", "Te"].includes(f) && call.domain === DOMAIN[f]) ||
            (f === "Si" && (call.domain === "body" || person));
          // F9/F10 require host adapters; these diagnostic traces currently supply neither.
          return ["Ne", "Ni"].includes(f) && (call.before as { params: { kappa: number } }).params.kappa > 0;
        });
        if (input) entry.counts.input++;
      }
    }
  }
  // These V1 groups own no F4–F13 operations. A present one is exactly the
  // F1–F3 counterfactual, so reuse it once rather than pooling overlapping groups.
  const sharedGroup = model ? ["Ti", "Fe", "Fi"].find((f) => model.weights[f as CognitiveFunction] > 0) : "Ti";
  return { byFunction, shared, sharedGroup };
}
