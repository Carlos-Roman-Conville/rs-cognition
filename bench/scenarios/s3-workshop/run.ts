import { buildV2Ledger } from "../../diagnostics/v2-ledger.ts";
import { qualify, streams } from "@rex/kernel";
import { randomTheta, thetaPersonality } from "../controls.ts";
import type { Calibration, Control } from "../controls.ts";
import { TYPES } from "../../personality-models.ts";
import type { Configuration } from "./cognition.ts";
import { summarizeWorkshop } from "./metrics.ts";
import { runWorkshop } from "./world.ts";
import { mkdirSync, writeFileSync } from "node:fs";
import { workshopLedger } from "./ledger.ts";
import type { Ledger, LedgerLevel } from "../../diagnostics/ledger.ts";
import { buildReport, reportJSON, reportMarkdown } from "../../diagnostics/report.ts";

declare const process: { argv: string[]; stdout: { write(text: string): void }; stderr: { write(text: string): void }; exitCode: number };

// section 10.4 fixed calibration: null, seed 1, kappa=0. No floor or stack-dependent tuning.
let cachedCommitment: { seed: number; medianGap: number; kappa: number } | undefined;
export function commitmentCalibration() {
  if (cachedCommitment) return cachedCommitment;
  const run = runWorkshop({ seed: 1, kappa: 0 });
  const gaps = run.hostInputLog.flatMap(row => {
    const eu = row.trace.evaluation.map(c => c.expectedUtility).sort((a, b) => b - a);
    return eu.length >= 2 ? [eu[0] - eu[1]] : [];
  }).sort((a, b) => a - b);
  if (!gaps.length) throw new Error("No calibration decisions with two candidates");
  const middle = Math.floor(gaps.length / 2);
  const medianGap = gaps.length % 2 ? gaps[middle] : (gaps[middle - 1] + gaps[middle]) / 2;
  cachedCommitment = { seed: 1, medianGap, kappa: 0.25 * medianGap };
  return cachedCommitment;
}

export function configurations(stacks: "all" | "null", personality: "v1" | "v2" | "both" = "v1"): Configuration[] {
  // fixture rule (DESIGN bench/scenarios section 4): same frozen-version and mint-order stack catalogue as personality-versions.ts.
  if (personality !== "v1") return [{ version: "null" }, ...(stacks === "all" ?
    (personality === "both" ? ["v1", "v2"] : ["v2"]).flatMap(version => TYPES.map(stack => ({ version, stack, ...(version === "v2" ? { id: `v2/${stack}` } : {}) }))) : [])];
  return [{ version: "null" }, ...(stacks === "all" ? TYPES.map((stack) => ({ version: "v1", stack })) : [])];
}

export function parseArgs(args: readonly string[]) {
  // fixture rule (DESIGN bench/scenarios section 4): 200 seeds for the later study; tests explicitly use two.
  let seeds = 200, stacks: "all" | "null" = "all";
  let personality: "v1" | "v2" | "both" = "v1";
  let control: Control | undefined;
  let ledger: LedgerLevel | "off" | undefined;
  for (let i = 0; i < args.length; i += 2) {
    const value = args[i + 1];
    if (args[i] === "--seeds" && value && /^\d+$/.test(value) && Number.isSafeInteger(Number(value)) && Number(value) > 0) seeds = Number(value);
    else if (args[i] === "--stacks" && (value === "all" || value === "null")) stacks = value;
    else if (args[i] === "--personality" && (value === "v1" || value === "v2" || value === "both")) personality = value;
    else if (args[i] === "--control" && (value === "none" || value === "random-theta" || value === "shuffled")) control = value;
    else if (args[i] === "--ledger" && (value === "summary" || value === "detailed" || value === "off")) ledger = value;
    else throw new Error("Usage: run.ts [--personality v1|v2|both] [--seeds N] [--stacks all|null] [--ledger summary|detailed|off] [--control none|random-theta|shuffled]");
  }
  // Keep the existing parser's unspecified-option shape; execution supplies the default.
  return { seeds, stacks, personality, ...(control === undefined ? {} : { control }), ...(ledger === undefined ? {} : { ledger }) };
}

/** DESIGN scenarios §10.3: calibration uses all sixteen V1 runs on this seed.
 * Reduce their existing hook traces in mint order; no second log or ledger run. */
export function calibrate(seed: number, kappa = commitmentCalibration().kappa): Calibration {
  const result: { interpret: Calibration["interpret"][number][]; generate: { kappa: number }[];
    learning: { rate: number }[]; pertinence: Record<string, number>[] } = {
    interpret: [], generate: [], learning: [], pertinence: [],
  };
  for (const stack of TYPES) {
    const run = runWorkshop({ seed, kappa, configuration: { version: "v1", stack } });
    for (const row of run.hostInputLog) for (const call of row.trace.hooks) {
      if (call.hook === "interpret") result.interpret.push(call.after as Calibration["interpret"][number]);
      else if (call.hook === "generate") result.generate.push((call.after as { params: { kappa: number } }).params);
      else if (call.hook === "learning") result.learning.push(call.after as { rate: number });
      else {
        const before = call.before as Record<string, number>, after = call.after as Record<string, number>;
        result.pertinence.push(Object.fromEntries(Object.keys(before).map((cue) => [cue, before[cue] ? after[cue] / before[cue] : 1])));
      }
    }
  }
  // section 10.3: the active-task instruction cue changes; reduce observed bounds in first-seen order.
  // Two complete bound rows preserve exactly the extrema without inventing missing cue samples.
  const cues = [...new Set(result.pertinence.flatMap(row => Object.keys(row)))];
  const bounds = cues.map(cue => { const values = result.pertinence.flatMap(row => Object.hasOwn(row, cue) ? [row[cue]] : []);
    return { cue, min: Math.min(...values), max: Math.max(...values) }; });
  result.pertinence = [Object.fromEntries(bounds.map(b => [b.cue, b.min])), Object.fromEntries(bounds.map(b => [b.cue, b.max]))];
  return result;
}

export function runRecord(seed: number, configuration: Configuration, ledger: LedgerLevel | "off" = "summary",
  control: Control = "none", calibration?: Calibration, commitment = commitmentCalibration()) {
  const configured = control === "none" ? configuration : { ...configuration, control,
    id: `${configuration.version}/${configuration.stack ?? "null"}+${control}` };
  const theta = control === "random-theta" ? randomTheta(calibration ?? calibrate(seed, commitment.kappa),
    streams(seed).get("bench.control.theta", qualify("cognition", "mind.0001"))) : undefined;
  const run = runWorkshop({ seed, kappa: commitment.kappa, configuration: configured, ...(theta ? { personality: thetaPersonality(theta) } : {}) });
  return { ...run, header: { ...run.header, commitment }, ...(theta ? { controlTheta: theta } : {}), metrics: summarizeWorkshop(run),
    ...(ledger === "off" ? {} : { ledger: configuration.version === "v2" && !theta ? buildV2Ledger(run, ledger, (v2Mask, epochs) => runWorkshop({ seed, configuration: configured, epochs, kappa: commitment.kappa, v2Mask }).hostInputLog.at(-1)!) : workshopLedger(run, ledger) }) };
}

if ((import.meta as ImportMeta & { main?: boolean }).main) {
  try {
    const options = parseArgs(process.argv.slice(2));
    const configs = configurations(options.stacks, options.personality);
    const commitment = commitmentCalibration();
    const ledgers: Ledger[] = [];
    const output = new URL("./out/", import.meta.url);
    if (options.ledger !== "off") {
      mkdirSync(output, { recursive: true });
      // Local output ignores itself too; no change outside the task's allowed paths.
      writeFileSync(new URL(".gitignore", output), "*\n");
    }
    for (let seed = 1; seed <= options.seeds; seed++) {
      const calibration = options.control === "random-theta" ? calibrate(seed, commitment.kappa) : undefined;
      for (const config of configs) {
        const record = runRecord(seed, config, options.ledger ?? "summary", options.control, calibration, commitment);
        if (record.ledger) {
          writeFileSync(new URL(`ledger-${seed}-${config.version}-${config.stack ?? "null"}${options.control && options.control !== "none" ? `+${options.control}` : ""}.json`, output), `${JSON.stringify(record.ledger)}\n`);
          const { records: _records, ...summary } = record.ledger;
          if (summary.schema === "function-ledger/v1") ledgers.push(summary);
        }
        process.stdout.write(`${JSON.stringify(record)}\n`);
      }
    }
    if (ledgers.length) {
      const report = buildReport(ledgers);
      writeFileSync(new URL("ledger-report.json", output), reportJSON(report));
      writeFileSync(new URL("ledger-report.md", output), reportMarkdown(report));
    }
  } catch (error) { process.stderr.write(`${String(error)}\n`); process.exitCode = 1; }
}
