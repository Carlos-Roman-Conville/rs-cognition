import { discoverVersions, TYPES } from "../../personality-models.ts";
import type { Configuration } from "./cognition.ts";
import { summarizeForage } from "./metrics.ts";
import { runForage } from "./world.ts";

declare const process: { argv: string[]; stdout: { write(text: string): void }; stderr: { write(text: string): void }; exitCode: number };

export function configurations(stacks: "all" | "null"): Configuration[] {
  // fixture rule (DESIGN bench/scenarios §2): same frozen-version and mint-order stack catalogue as personality-versions.ts.
  return [{ version: "null" }, ...(stacks === "all" ? discoverVersions().flatMap((version) => TYPES.map((stack) => ({ version: version.id, stack }))) : [])];
}

export function parseArgs(args: readonly string[]) {
  // fixture rule (DESIGN bench/scenarios §2): 200 seeds for the later study; tests explicitly use eight.
  let seeds = 200, stacks: "all" | "null" = "all";
  for (let i = 0; i < args.length; i += 2) {
    const value = args[i + 1];
    if (args[i] === "--seeds" && value && /^\d+$/.test(value) && Number.isSafeInteger(Number(value)) && Number(value) > 0) seeds = Number(value);
    else if (args[i] === "--stacks" && (value === "all" || value === "null")) stacks = value;
    else throw new Error("Usage: run.ts [--seeds N] [--stacks all|null]");
  }
  return { seeds, stacks };
}

export function runRecord(seed: number, configuration: Configuration) {
  const run = runForage({ seed, configuration });
  return { ...run, metrics: summarizeForage(run) };
}

if ((import.meta as ImportMeta & { main?: boolean }).main) {
  try {
    const options = parseArgs(process.argv.slice(2));
    const configs = configurations(options.stacks);
    for (let seed = 1; seed <= options.seeds; seed++) for (const config of configs) process.stdout.write(`${JSON.stringify(runRecord(seed, config))}\n`);
  } catch (error) { process.stderr.write(`${String(error)}\n`); process.exitCode = 1; }
}
