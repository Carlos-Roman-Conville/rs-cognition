import { kindOf } from "./field.ts";
import type { Patch } from "./field.ts";
import type { EpochLog, HostOutcome } from "./world.ts";

export function behaviorMetrics(patches: readonly Patch[], initialPosition: string, outcomes: readonly HostOutcome[]) {
  const visited = new Set([initialPosition]), inspected = new Set<string>();
  const sampled = new Map<string, { sum: number; count: number }>();
  let gathers = 0, inspectedGathers = 0, visits = 0, novelVisits = 0, returnOpportunities = 0, bestReturns = 0, food = 0;
  for (const outcome of outcomes) {
    if (!outcome.success) continue;
    // fixture rule (DESIGN bench/scenarios §2): successful gather consumes an inspection credit for that patch.
    if (outcome.action === "inspect") inspected.add(outcome.target!);
    if (outcome.action === "gather") {
      gathers++; food += outcome.food;
      if (inspected.delete(outcome.target!)) inspectedGathers++;
      const previous = sampled.get(outcome.target!) ?? { sum: 0, count: 0 };
      sampled.set(outcome.target!, { sum: previous.sum + outcome.food, count: previous.count + 1 });
    }
    if (outcome.visit) {
      visits++;
      if (kindOf(patches.find((p) => p.id === outcome.to)!).novel) novelVisits++;
      // fixture rule (DESIGN bench/scenarios §2): best known = largest past sample mean, mint-order tie break; no future yields.
      const known = patches.filter((patch) => sampled.has(patch.id));
      if (known.length) {
        returnOpportunities++;
        const mean = (patch: Patch) => { const sample = sampled.get(patch.id)!; return sample.sum / sample.count; };
        const best = known.reduce((best, patch) => mean(patch) > mean(best) ? patch : best);
        if (outcome.to === best.id && visited.has(outcome.to)) bestReturns++;
      }
      visited.add(outcome.to);
    }
  }
  // fixture rule (DESIGN bench/scenarios §2): zero-denominator convention is zero; report counts alongside shares.
  return { inspectBeforeGatherShare: gathers ? inspectedGathers / gathers : 0,
    novelPatchVisitShare: visits ? novelVisits / visits : 0,
    bestKnownReturnRate: returnOpportunities ? bestReturns / returnOpportunities : 0,
    foodGathered: food, counts: { gathers, inspectedGathers, visits, novelVisits, returnOpportunities, bestReturns } };
}

export function traceMetrics(rows: readonly EpochLog[]) {
  const hooks = Object.fromEntries(["pertinence", "interpret", "generate", "learning"].map((hook) => [hook,
    { calls: 0, changedCalls: 0, changedParameters: {} as Record<string, number> }]));
  let changedCueShares = 0;
  for (const row of rows) {
    for (const call of row.trace.hooks) {
      const summary = hooks[call.hook];
      summary.calls++;
      if (call.changed.length) summary.changedCalls++;
      for (const parameter of call.changed) summary.changedParameters[parameter] = (summary.changedParameters[parameter] ?? 0) + 1;
    }
    changedCueShares += row.trace.attention.shares.filter((share, i) => Math.abs(share - row.trace.attention.baselineShares[i]) > 1e-12).length;
  }
  return { hooks, changedCueShares, byFormula: null,
    formulaAttribution: "Frozen v1 does not report per-formula diagnostics; hook totals are not formula attribution." };
}

export function summarizeForage(run: { hostInputLog: readonly EpochLog[]; final: { patches: Patch[] } }) {
  return { ...behaviorMetrics(run.final.patches, run.hostInputLog[0].before.position, run.hostInputLog.map((row) => row.outcome)),
    trace: traceMetrics(run.hostInputLog) };
}
