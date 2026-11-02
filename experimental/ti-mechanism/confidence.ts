import type { Feedback } from "./learn.ts";
import type { TiResult } from "./run-ti.ts";

export interface Beta { alpha: number; beta: number }
export interface Confidence { answer: Record<"contradiction" | "consistent", Beta>; method: Record<string, Beta> }
// DESIGN §3: Beta(1,1) is a proposed uninformative prior.
const prior = (): Beta => ({ alpha: 1, beta: 1 });
export const confidence = (): Confidence => ({ answer: { contradiction: prior(), consistent: prior() }, method: {} });
const mean = (b: Beta): number => b.alpha / (b.alpha + b.beta);
export function recordConfidence(state: Confidence, conclusion: TiResult["conclusion"], mix: string): {
  answer: number | null; method: number;
} {
  return { answer: conclusion === "unresolved" ? null : mean(state.answer[conclusion]),
    method: mean(state.method[mix] ?? prior()) };
}
/** DESIGN §3: answer beliefs consume only received feedback, after recording.
 * Method belief observes own resolution, not correctness (proposed Beta update);
 * it is recorded for measurement only and never controls search or allocation. */
export function updateConfidence(state: Confidence, conclusion: TiResult["conclusion"], mix: string,
  received: Feedback): void {
  const b = state.method[mix] ??= prior();
  if (conclusion === "unresolved") b.beta++; else b.alpha++;
  if (conclusion !== "unresolved" && received !== null)
    state.answer[conclusion][received === "correct" ? "alpha" : "beta"]++;
}
