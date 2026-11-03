import { afterEach, describe, expect, it } from "vitest";
import { mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { main, runExperiment, writeExperiment, type Settings, type Summary } from "../experimental/ti-mechanism/experiment.ts";
import { renderReport } from "../experimental/ti-mechanism/report.ts";

declare module "node:fs" {
  export function rmSync(path: string, options: { recursive: boolean; force: boolean }): void;
}
const folders: string[] = [];
const folder = () => {
  const path = mkdtempSync("experimental/ti-mechanism/.runner-test-");
  folders.push(path); return path;
};
afterEach(() => { for (const path of folders.splice(0)) rmSync(path, { recursive: true, force: true }); });
const settings: Settings = { seeds: [1, 2], budgets: [5, 15], trainingBudget: 15,
  testCount: 2, trainMixes: [["chain"]], transferMixes: [["chain", "parity"]], n: 8 };
const factors = { knowledge: "none", history: 2, regime: "accurate", c_d: 1 } as const;
const readSummaries = (path: string): Summary[] => readdirSync(path).filter(f => f.endsWith(".summary.json"))
  .sort().map(f => JSON.parse(readFileSync(`${path}/${f}`, "utf8")) as Summary);

describe("Ti runner output and seed batching", () => {
  it("--summary-only emits only summaries and --seed-start selects the batch", () => {
    const path = folder();
    main(["--summary-only", "--seed-start", "3", "--seeds", "2", "--factors", "none", "--out", path], settings);
    expect(readdirSync(path)).toHaveLength(4);
    expect(readdirSync(path).every(f => f.endsWith(".summary.json"))).toBe(true);
    for (const summary of readSummaries(path)) expect(summary.settings.seeds).toEqual([3, 4]);
  });
  it("two persisted batches combine to the same report as seeds 1–4, in either batch order", () => {
    const path = folder();
    writeExperiment(path, "first", "trained", factors, settings, true);
    writeExperiment(path, "second", "trained", factors, { ...settings, seeds: [3, 4] }, true);
    const combined = runExperiment("trained", factors, { ...settings, seeds: [1, 2, 3, 4] }).summary;
    const batches = readSummaries(path);
    expect(renderReport(batches)).toBe(renderReport([combined]));
    expect(renderReport(batches.reverse())).toBe(renderReport([combined]));
  });
  it("rejects overlapping batches and incompatible settings", () => {
    const first = runExperiment("trained", factors, settings).summary;
    const overlap = runExperiment("trained", factors, { ...settings, seeds: [2, 3] }).summary;
    expect(() => renderReport([first, overlap])).toThrow(/Overlapping seeds/);
    expect(() => renderReport([first, { ...overlap, settings: { ...overlap.settings, testCount: 4 } }]))
      .toThrow(/Incompatible settings/);
  });
  it("streamed records match the old joined output byte for byte for every arm", () => {
    const path = folder();
    for (const arm of ["trained", "no-family-tags", "shuffled", "memorise"] as const) {
      const old = runExperiment(arm, factors, settings);
      const summary = writeExperiment(path, arm, arm, factors, settings);
      expect(readFileSync(`${path}/${arm}.jsonl`, "utf8"))
        .toBe(old.records.map(r => JSON.stringify(r)).join("\n") + "\n");
      expect(summary).toEqual(old.summary);
    }
  });
});
