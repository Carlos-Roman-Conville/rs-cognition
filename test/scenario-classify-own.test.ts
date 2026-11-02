import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { classifyMechanisms } from "../bench/scenarios/classify.ts";
import { ownOpportunities, SHARED_ATTITUDE } from "../bench/diagnostics/opportunities.ts";
import { runRecord } from "../bench/scenarios/s1-forage/run.ts";
import { ADDENDUM_HEADING, ADDENDUM2_HEADING, mechanismTable, replaceAddendum2 } from "../bench/scenarios/s1-forage/analyze.ts";
import fixture from "../bench/scenarios/s1-forage/classification-fixture.json" with { type: "json" };

const eligibility = { activated: 20, "eligible-not-activated": 0, "no-relevant-input": 20 };
const effects = Array.from({ length: 24 }, () => 1);
const shared = { counts: { input: 20, total: 40 }, seedEffects: effects };
const rows = [
  { key: "Ti", eligibility, ownCounts: { input: 0, total: 40 }, seedEffects: effects },
  { key: "Se", eligibility, ownCounts: { input: 20, total: 40 }, seedEffects: effects },
];
describe("DESIGN §10.5 own opportunities", () => {
  it("marks shared-only input not exercised, retaining classification for owned input", () => {
    const own = classifyMechanisms(rows, { opportunity: "own", shared });
    expect(own[0].classification).toBe("not exercised");
    expect(own[1].classification).toBe(classifyMechanisms(rows)[1].classification);
    expect(own[1].classification).toBe("stable");
    expect(own[2]).toMatchObject({ key: SHARED_ATTITUDE, kind: "shared", classification: "stable" });
    expect(own.filter((r) => "kind" in r && r.kind === "function").map((r) => r.key)).toEqual(["Ti", "Se"]);
    expect(classifyMechanisms(rows)).toEqual(classifyMechanisms(rows, { opportunity: "group" }));
  });
  it("fails closed on missing own counts rather than treating missing evidence as zero", () => {
    expect(() => classifyMechanisms([{ key: "Ti", eligibility, seedEffects: effects }], { opportunity: "own", shared })).toThrow("unavailable");
  });
  it("uses actual F4–F13 inputs, excluding shared input, inactive domains and zero commitment", () => {
    const run = runRecord(1, { version: "v1", stack: "ESTP" }, "off");
    const own = ownOpportunities(run);
    expect(own.byFunction.find((r) => r.key === "Se")!.counts.input).toBeGreaterThan(0);
    for (const key of ["Ti", "Fe", "Ni", "Te", "Ne"]) expect(own.byFunction.find((r) => r.key === key)!.counts.input).toBe(0);
    expect(own.shared.input).toBeGreaterThan(0);
    expect(own.sharedGroup).toBe("Ti");
    expect(own.byFunction.every((r) => r.counts.total === run.hostInputLog.length * 4)).toBe(true);
    const nullOwn = ownOpportunities(runRecord(1, { version: "null" }, "off"));
    expect(nullOwn.shared.input).toBe(0);
    expect(nullOwn.byFunction.every((r) => r.counts.input === 0)).toBe(true);
  });
  it("reproduces the first addendum mechanism table exactly in group mode", () => {
    const actual = mechanismTable(classifyMechanisms(fixture.rows, { opportunity: "group" }));
    const text = readFileSync("bench/scenarios/s1-forage/REPORT.md", "utf8");
    const first = text.slice(text.indexOf(ADDENDUM_HEADING), text.indexOf(ADDENDUM2_HEADING));
    expect(first).toContain(actual);
  });
  it("preserves every byte above addendum 2 and updates it idempotently", () => {
    const prefix = "Original §\r\n" + ADDENDUM_HEADING + "\nfirst\n\n";
    const once = replaceAddendum2(prefix, "body\n");
    expect(once).toBe(prefix + ADDENDUM2_HEADING + "\n\nbody\n");
    expect(replaceAddendum2(once, "body\n")).toBe(once);
  });
});
