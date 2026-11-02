import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { classifyBehaviour, classifyMechanisms, CLASSIFICATION_THRESHOLDS, opportunityRate } from "../bench/scenarios/classify.ts";
import { ADDENDUM_HEADING, replaceAddendum } from "../bench/scenarios/s1-forage/analyze.ts";

const eligible = { activated: 10, "eligible-not-activated": 10, "no-relevant-input": 0 };
const effects = (positive: number) => Array.from({ length: 40 }, (_, i) => i % 20 < positive ? 1 : -0.01);
const row = (positive = 14) => ({ key: "Se", eligibility: eligible, seedEffects: effects(positive) });
const groups = [{ key: "Se", o_f: 1 }];

describe("DESIGN §10.1 four-class rule", () => {
  it("labels o_f=0 not exercised even with a nonzero effect", () => {
    const [r] = classifyMechanisms([{ ...row(), eligibility: { activated: 0, "eligible-not-activated": 0, "no-relevant-input": 20 } }]);
    expect(r.o_f).toBe(0); expect(r.classification).toBe("not exercised");
    expect(opportunityRate({ activated: 0, "eligible-not-activated": 0, "no-relevant-input": 0 })).toBe(0);
  });
  it("is stable with both halves excluding zero and s_f=0.7", () => {
    const [r] = classifyMechanisms([row()]);
    expect(r.s_f).toBe(0.7); expect(r.classification).toBe("stable");
    for (const s of [r.all, r.first, r.second]) expect(s.interval95![0]).toBeGreaterThan(0);
  });
  it("is context-dependent with the same interval conditions but s_f=0.55", () => {
    const [r] = classifyMechanisms([row(11)]);
    expect(r.s_f).toBe(0.55); expect(r.classification).toBe("context-dependent");
    for (const s of [r.all, r.first, r.second]) expect(s.interval95![0]).toBeGreaterThan(0);
    expect(classifyBehaviour(effects(11), groups).classification).toBe("context-dependent");
  });
  it("includes equality at both thresholds and counts eligible-but-inactive input", () => {
    const [r] = classifyMechanisms([{ ...row(12), eligibility: { activated: 0, "eligible-not-activated": 1, "no-relevant-input": 19 } }]);
    expect(r.o_f).toBe(0.05); expect(r.s_f).toBe(0.6); expect(r.classification).toBe("stable");
    expect(classifyMechanisms([{ ...row(), eligibility: { activated: 0, "eligible-not-activated": 1, "no-relevant-input": 20 } }])[0].classification).toBe("not exercised");
  });
  it("handles opposite half means, one significant half, zero and missing evidence", () => {
    const mechanism = (seedEffects: (number | null)[]) => classifyMechanisms([{ ...row(), seedEffects }])[0];
    expect(mechanism([1, 1, -1, -1]).classification).toBe("context-dependent");
    // S1's original behaviour clause requires an all-seed interval excluding zero.
    expect(classifyBehaviour([1, 1, -1, -1], groups).classification).toBe("none");
    expect(mechanism([1, 1, 0, 0]).classification).toBe("context-dependent");
    expect(mechanism([0, 0, 0, 0]).classification).toBe("none");
    expect(mechanism([0, 0, 0, 0]).s_f).toBe(0);
    expect(mechanism([null, null, 1, 1]).first.n).toBe(0);
    expect(mechanism([null, null, 1, 1]).classification).toBe("context-dependent");
    expect(mechanism([1]).all.interval95).toBeNull();
    expect(mechanism([]).classification).toBe("none");
    expect(mechanism([-1, -1, -1, -1]).classification).toBe("stable");
  });
  it("marks behaviour unexercised only when all differing groups are below threshold", () => {
    expect(classifyBehaviour(effects(14), []).classification).toBe("not exercised");
    expect(classifyBehaviour(effects(14), [{ key: "Te", o_f: 0 }]).classification).toBe("not exercised");
    const r = classifyBehaviour(effects(14), [...groups, { key: "Te", o_f: 0 }]);
    expect(r.exercised).toEqual(["Se"]); expect(r.classification).toBe("stable");
  });
  it("rejects unsupported alpha rather than silently using a 95% interval", () => {
    expect(() => classifyMechanisms([row()], { ...CLASSIFICATION_THRESHOLDS, alpha: 0.1 })).toThrow("alpha=0.05");
    expect(() => classifyMechanisms([{ ...row(), seedEffects: [NaN] }])).toThrow("Non-finite");
  });
});

describe("DESIGN §10.2 append-only S1 addendum", () => {
  it("preserves REPORT.md above the heading byte for byte against HEAD~1", () => {
    const path = "bench/scenarios/s1-forage/REPORT.md";
    const report = readFileSync(path, "utf8");
    const original = spawnSync("git", ["show", `HEAD~1:${path}`], { encoding: "utf8" }).stdout;
    expect(original.length).toBeGreaterThan(0);
    const index = report.indexOf(ADDENDUM_HEADING);
    expect(index).toBeGreaterThan(0);
    expect(new TextEncoder().encode(report.slice(0, index))).toEqual(new TextEncoder().encode(original));
  });
  it("replaces only below an existing heading and is idempotent", () => {
    const prefix = "Original UTF-8 § report\r\n\r\n";
    const once = replaceAddendum(prefix, "first\n");
    const twice = replaceAddendum(once, "second\n");
    expect(twice).toBe(prefix + ADDENDUM_HEADING + "\n\nsecond\n");
    expect(replaceAddendum(twice, "second\n")).toBe(twice);
  });
});
