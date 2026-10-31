import { canonical } from "@rex/kernel";
import type { CognitiveParams } from "../../src/index.ts";
import { cognitiveParams } from "./models.ts";
import { runHungryPair } from "./world.ts";

// Minimal local host typing: no Node dependency added to the platform package.
declare const process: { argv: string[]; stdout: { write(text: string): void }; stderr: { write(text: string): void }; exitCode: number };

export function parseArguments(args: readonly string[]) {
  let seed: number | undefined;
  const params: Partial<CognitiveParams> = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--seed" && seed === undefined) {
      const value = args[++i];
      if (value === undefined || !/^-?\d+$/.test(value)) throw new Error("--seed requires an integer");
      seed = Number(value);
      if (!Number.isSafeInteger(seed)) throw new Error("--seed requires a safe integer");
    } else if (args[i] === "--param") {
      const value = args[++i];
      const match = value?.match(/^([a-z][a-z0-9]*)=(-?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?)$/i);
      if (!match) throw new Error("--param requires name=value");
      const name = match[1];
      if (!Object.hasOwn(cognitiveParams(), name) || Object.hasOwn(params, name)) throw new Error(`Unknown or repeated parameter ${name}`);
      (params as Record<string, number>)[name] = Number(match[2]);
    } else throw new Error(`Unknown argument ${args[i]}`);
  }
  if (seed === undefined) throw new Error("Usage: node --experimental-strip-types bench/hungry-pair/run.ts --seed N [--param name=value]");
  cognitiveParams(params);
  return { seed, params };
}

// Node's main-module marker lets tests import the parser without running the benchmark.
if ((import.meta as ImportMeta & { main?: boolean }).main) {
  try { process.stdout.write(canonical(runHungryPair(parseArguments(process.argv.slice(2)))) + "\n"); }
  catch (error) { process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`); process.exitCode = 1; }
}
