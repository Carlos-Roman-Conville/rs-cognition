import { discoverVersions, TYPES } from "../../personality-models.ts";
import type { Configuration } from "./cognition.ts";
import { summarizeForage } from "./metrics.ts";
import { runForage } from "./world.ts";
import { mkdirSync, writeFileSync } from "node:fs";
import { buildLedger } from "../../diagnostics/ledger.ts";
import type { Ledger, LedgerLevel } from "../../diagnostics/ledger.ts";
import { buildReport, reportJSON, reportMarkdown } from "../../diagnostics/report.ts";

declare const process: { argv: string[]; stdout: { write(text: string): void }; stderr: { write(text: string): void }; exitCode: number };

export function configurations(stacks: "all" | "null"): Configuration[] {
  // fixture rule (DESIGN bench/scenarios §2): same frozen-version and mint-order stack catalogue as personality-versions.ts.
  return [{ version: "null" }, ...(stacks === "all" ? discoverVersions().flatMap((version) => TYPES.map((stack) => ({ version: version.id, stack }))) : [])];
}

export function parseArgs(args: readonly string[]) {
  // fixture rule (DESIGN bench/scenarios §2): 200 seeds for the later study; tests explicitly use eight.
  let seeds = 200, stacks: "all" | "null" = "all";
  let ledger: LedgerLevel | "off" | undefined;
  for (let i = 0; i < args.length; i += 2) {
    const value = args[i + 1];
    if (args[i] === "--seeds" && value && /^\d+$/.test(value) && Number.isSafeInteger(Number(value)) && Number(value) > 0) seeds = Number(value);
    else if (args[i] === "--stacks" && (value === "all" || value === "null")) stacks = value;
    else if (args[i] === "--ledger" && (value === "summary" || value === "detailed" || value === "off")) ledger = value;
    else throw new Error("Usage: run.ts [--seeds N] [--stacks all|null] [--ledger summary|detailed|off]");
  }
  // Keep the existing parser's unspecified-option shape; execution supplies the default.
  return { seeds, stacks, ...(ledger === undefined ? {} : { ledger }) };
}

export function runRecord(seed: number, configuration: Configuration, ledger: LedgerLevel | "off" = "summary") {
  const run = runForage({ seed, configuration });
  return { ...run, metrics: summarizeForage(run), ...(ledger === "off" ? {} : { ledger: buildLedger(run, ledger) }) };
}

if ((import.meta as ImportMeta & { main?: boolean }).main) {
  try {
    const options = parseArgs(process.argv.slice(2));
    const configs = configurations(options.stacks);
    const ledgers: Ledger[] = [];
    const output = new URL("./out/", import.meta.url);
    if (options.ledger !== "off") {
      mkdirSync(output, { recursive: true });
      // Local output ignores itself too; no change outside the task's allowed paths.
      writeFileSync(new URL(".gitignore", output), "*\n");
    }
    for (let seed = 1; seed <= options.seeds; seed++) for (const config of configs) {
      const record = runRecord(seed, config, options.ledger ?? "summary");
      if (record.ledger) {
        writeFileSync(new URL(`ledger-${seed}-${config.version}-${config.stack ?? "null"}.json`, output), `${JSON.stringify(record.ledger)}\n`);
        const { records: _records, ...summary } = record.ledger;
        ledgers.push(summary);
      }
      process.stdout.write(`${JSON.stringify(record)}\n`);
    }
    if (ledgers.length) {
      const report = buildReport(ledgers);
      writeFileSync(new URL("ledger-report.json", output), reportJSON(report));
      writeFileSync(new URL("ledger-report.md", output), reportMarkdown(report));
    }
  } catch (error) { process.stderr.write(`${String(error)}\n`); process.exitCode = 1; }
}
