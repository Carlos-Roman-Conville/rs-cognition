import { readFileSync, writeFileSync } from "node:fs";
import { DEFAULT_COGNITIVE_PARAMS } from "../src/types.ts";
import { fitLogPower, fitPower, retentionCurve } from "./forgetting.ts";
import { PROTOCOL, simulateProblem, summarizeProblems } from "./repeated-choice.ts";
import type { Problem } from "./repeated-choice.ts";

declare const process: { stdout: { write(text: string): void } };

// From repository root: node --experimental-strip-types validation/run.ts
const points = retentionCurve();
const v1 = { params: DEFAULT_COGNITIVE_PARAMS, points,
  rawScaleFit: fitPower(points), logScaleFit: fitLogPower(points), empiricalStatus: "parked-no-published-range" };
writeFileSync(new URL("./data/v1-results.json", import.meta.url), JSON.stringify(v1, null, 2) + "\n");
const data = JSON.parse(readFileSync(import.meta.dirname + "/data/tpt-2010.json", "utf8")) as { problems: Problem[] };
const rows = data.problems.map((problem) => simulateProblem(problem));
const summaries = ["estimation", "competition"].map((set) => ({ set,
  ...summarizeProblems(rows.filter((row) => row.set === set)) }));
const v2 = { protocol: PROTOCOL, params: DEFAULT_COGNITIVE_PARAMS, summaries, rows };
writeFileSync(new URL("./data/v2-results.json", import.meta.url), JSON.stringify(v2, null, 2) + "\n");
process.stdout.write(JSON.stringify({ v1: v1.rawScaleFit, v2: summaries }, null, 2) + "\n");
