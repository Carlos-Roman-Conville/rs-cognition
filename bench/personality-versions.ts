// DESIGN §6 / §9 T-3: host-only controlled comparison; imports the engine's public API.
import { canonical } from "@rex/kernel";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { isMainThread, parentPort, Worker, workerData } from "node:worker_threads";
import { nullPersonality } from "../src/index.ts";
import type { LearningParams, PersonalityModel } from "../src/index.ts";
import { discoverVersions, FORMULAS, TYPES } from "./personality-models.ts";
import { summarizePersonality } from "./personality-metrics.ts";
import type { Metrics } from "./personality-metrics.ts";
import { runHungryPair } from "./hungry-pair/world.ts";
import { reportErrors } from "./hungry-pair/report-integrity.ts";

import { renderReport, SEEDS, EPOCHS } from "./personality-report.ts";
export { renderReport, SEEDS, EPOCHS } from "./personality-report.ts";

declare const process: { argv: string[]; stdout: { write(text: string): void }; stderr: { write(text: string): void }; exitCode: number };
const digest = (value: string) => createHash("sha256").update(value).digest("hex");
const learningBytes = (value: LearningParams) => canonical({ ...value,
  beliefHalfLife: value.beliefHalfLife === Infinity ? "Infinity" : value.beliefHalfLife });

interface Execution {
  metrics: Metrics;
  hash: string;
  matches: ((model: PersonalityModel) => boolean)[];
}

/** Exact deterministic execution sharing, not a sampled parameter fingerprint.
 * Retain EVERY public hook invocation (including fixture replay) and its canonical output.
 * An alias is allowed only if its hooks return byte-identical outputs for ALL these inputs.
 * By induction over the deterministic host/reducer, it must follow the identical run.
 * A changed hook output forces a fresh full-world run and both built-in replays.
 */
function execute(seed: number, epochs: number, model: PersonalityModel): Execution {
  const matches: Execution["matches"] = [];
  const recording: PersonalityModel = { id: model.id, version: model.version,
    pertinence(...args) {
      const value = model.pertinence(...args), expected = canonical(value);
      matches.push((other) => canonical(other.pertinence(...args)) === expected);
      return value;
    },
    interpret(...args) {
      const value = model.interpret(...args), expected = canonical(value);
      matches.push((other) => canonical(other.interpret(...args)) === expected);
      return value;
    },
    generate(...args) {
      const value = model.generate(...args), expected = canonical(value.params);
      // No adapter normally changes candidates. Identity proves exact equality without
      // serializing the entire repertoire on every matching hook call.
      matches.push((other) => {
        const actual = other.generate(...args);
        return canonical(actual.params) === expected && (actual.candidates === value.candidates ||
          canonical(actual.candidates) === canonical(value.candidates));
      });
      return value;
    },
    learning(...args) {
      const value = model.learning(...args);
      // Preserve the public API's infinite half-life sentinel without JSON's null coercion.
      const expected = learningBytes(value);
      matches.push((other) => learningBytes(other.learning(...args)) === expected);
      return value;
    },
  };
  const run = runHungryPair({ seed, epochs, personality: recording });
  return { metrics: summarizePersonality(run), hash: digest(canonical(run)), matches };
}

export interface SeedResult {
  seed: number;
  epochs: number;
  metrics: Record<string, Metrics>;
  hashes: Record<string, string>;
  executions: number;
  equivalent: number;
  nullRepeat: boolean;
  allOff: number;
}

export function runPersonalitySeed(seed: number, epochs = EPOCHS): SeedResult {
  const versions = discoverVersions();
  const baseline = execute(seed, epochs, nullPersonality);
  const repeated = execute(seed, epochs, nullPersonality);
  if (baseline.hash !== repeated.hash) throw new Error(`Null-vs-null differs at seed ${seed}`);
  const pool = [baseline];
  const result: SeedResult = { seed, epochs, metrics: { null: baseline.metrics }, hashes: { null: baseline.hash },
    executions: 2, equivalent: 0, nullRepeat: true, allOff: 0 };
  const run = (key: string, model: PersonalityModel, force = false) => {
    let execution = force ? undefined : pool.find((entry) => entry.matches.every((check) => check(model)));
    if (execution) result.equivalent++;
    else { execution = execute(seed, epochs, model); result.executions++; pool.push(execution); }
    result.metrics[key] = execution.metrics;
    result.hashes[key] = execution.hash;
    return execution;
  };
  for (const version of versions) for (const [i, type] of TYPES.entries()) {
    const key = `${version.id}/${type}`;
    const allOff = run(`${key}/all-off`, version.create(type, FORMULAS), i === 0);
    if (allOff.hash !== baseline.hash) throw new Error(`All-off differs from null: ${key}, seed ${seed}`);
    result.allOff++;
    run(key, version.create(type));
    for (const formula of FORMULAS) run(`${key}/off:${formula}`, version.create(type, [formula]));
  }
  return result;
}

function prerequisites() {
  const errors = reportErrors(readFileSync("bench/hungry-pair/REPORT.md", "utf8"));
  if (errors.length) throw new Error(`C-Q4 baseline is not ready: ${errors.join("; ")}`);
  if (!readFileSync("CHECK.md", "utf8").includes("Verdict: PASS")) throw new Error("Missing independent CB-6b check");
  if (!readFileSync("personality/FINGERPRINT-CHECK.md", "utf8").includes("Verdict: PASS")) throw new Error("Missing fingerprint verification");
}

async function main() {
  prerequisites();
  if (process.argv.length > 2) throw new Error("Usage: node --experimental-strip-types bench/personality-versions.ts");
  const count = 8; // proposed host concurrency, deterministic seed order restored before aggregation.
  const workers: Worker[] = [];
  const results: SeedResult[] = [];
  try {
    await Promise.all(Array.from({ length: count }, (_, index) => new Promise<void>((resolve, reject) => {
      const worker = new Worker(new URL(import.meta.url), { workerData: {
        seeds: Array.from({ length: SEEDS }, (_, i) => i + 1).filter((seed) => (seed - 1) % count === index), epochs: EPOCHS,
      }, execArgv: ["--experimental-strip-types"] });
      workers.push(worker);
      worker.on("message", (message) => {
        const row = message as SeedResult;
        results.push(row);
        process.stdout.write(`Completed seed ${row.seed}; ${results.length}/${SEEDS}; worlds=${row.executions}, equivalent=${row.equivalent}\n`);
      });
      worker.on("error", reject);
      worker.on("exit", (code) => code === 0 ? resolve() : reject(new Error(`Personality worker exited ${code}`)));
    })));
  } finally { await Promise.all(workers.map((worker) => worker.terminate())); }
  results.sort((a, b) => a.seed - b.seed);
  writeFileSync(new URL("./hungry-pair/PERSONALITY-REPORT.md", import.meta.url), renderReport(results));
  process.stdout.write("Wrote bench/hungry-pair/PERSONALITY-REPORT.md\n");
}

if (!isMainThread) {
  for (const seed of workerData.seeds) parentPort!.postMessage(runPersonalitySeed(seed, workerData.epochs));
} else if ((import.meta as ImportMeta & { main?: boolean }).main) {
  main().catch((error: unknown) => {
    process.stderr.write(`${error instanceof Error ? error.stack : String(error)}\n`); process.exitCode = 1;
  });
}
