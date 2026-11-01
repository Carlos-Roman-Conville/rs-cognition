// Wall time is measured only in this diagnostic benchmark, never in simulation or ledger output.
import { runForage } from "../scenarios/s1-forage/world.ts";
import { buildLedger } from "./ledger.ts";
import { rerunAblation } from "./ablation.ts";

declare const process: { stdout: { write(text: string): void } };
const configuration = { version: "v1", stack: "ESTP" as const };
runForage({ seed: 0, epochs: 2, configuration });
const measurements = [];
for (let seed = 1; seed <= 3; seed++) {
  const start = performance.now();
  const run = runForage({ seed, configuration });
  const baseMs = performance.now() - start;
  const summaryStart = performance.now();
  let rerunMs = 0, reruns = 0;
  const summary = buildLedger(run, "summary", (base, disabled) => {
    const start = performance.now();
    const result = rerunAblation(base, disabled);
    rerunMs += performance.now() - start; reruns++;
    return result;
  });
  const summaryMs = performance.now() - summaryStart;
  const detailStart = performance.now();
  const detailed = buildLedger(run, "detailed");
  const detailedMs = performance.now() - detailStart;
  if (JSON.stringify(summary.summary) !== JSON.stringify(detailed.summary)) throw new Error("Summary/detail disagreement");
  measurements.push({ seed, epochs: run.hostInputLog.length, baseMs, summaryMs, detailedMs,
    reruns, rerunMs, analysisMsPerEpoch: (summaryMs - rerunMs) / run.hostInputLog.length,
    summaryMsPerEpoch: summaryMs / run.hostInputLog.length,
    summaryBytes: JSON.stringify(summary).length, detailedBytes: JSON.stringify(detailed).length });
}
process.stdout.write(`${JSON.stringify(measurements, null, 2)}\n`);
