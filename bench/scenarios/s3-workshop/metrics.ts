import { traceMetrics } from "../s1-forage/metrics.ts";
import type { EpochLog } from "./world.ts";
export function summarizeWorkshop(run: { hostInputLog: readonly EpochLog[] }) {
  const rows = run.hostInputLog;
  const completed = rows.filter(r => r.outcome.completed).length;
  const switches = rows.filter(r => r.outcome.switched).length;
  const continues = rows.filter(r => r.outcome.action === "continue" && r.outcome.success).length;
  // section 4 proposed immediate-predecessor convention, same active task only; all denominators retained.
  const verified = rows.filter((r, i) => r.outcome.action === "continue" && r.outcome.success && i > 0 && rows[i - 1].outcome.action === "verify" && rows[i - 1].outcome.task === r.outcome.task).length;
  const acceptance = (context: string) => { const input = rows.filter(r => r.testimony.reliability === 0.4 && r.testimony.context === context);
    const accepted = input.filter(r => r.testimony.accepted).length;
    return { input: input.length, accepted, rate: input.length ? accepted / input.length : 0 }; };
  const opinion = acceptance("opinion"), procedural = acceptance("procedural");
  // section 4 proposed zero-denominator convention matches S1; use counts to identify unavailable rates.
  const final = rows.at(-1)?.after;
  const defectFree = final?.tasks.filter(t => t.finished && t.defects.every(d => !d)).length ?? 0;
  return { defectFreeCompletionRate: defectFree / 2, completionRate: completed / 2, switchesPerCompletedTask: completed ? switches / completed : 0,
    verifyBeforeContinueRate: continues ? verified / continues : 0, lowOpinionAcceptance: opinion.rate, lowProceduralAcceptance: procedural.rate,
    counts: { completed, switches, continues, verified, opinion, procedural }, trace: traceMetrics(rows) };
}
