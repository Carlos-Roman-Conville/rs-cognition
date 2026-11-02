import { describe, expect, it } from "vitest";
import { streams } from "@rex/kernel";
import { evaluate, implies } from "../experimental/ti-mechanism/evaluator.ts";
import { generateProblems } from "../experimental/ti-mechanism/problems.ts";
import { atomFeatures, runTi } from "../experimental/ti-mechanism/run-ti.ts";
import { families, satisfies, type Claims, type Clause, type Family } from "../experimental/ti-mechanism/types.ts";

const zero = { atom: Array<number>(9).fill(0), polarity: 0 };
const claims = (n: number, clauses: Clause[]): Claims => ({ n, clauses,
  tags: Array.from({ length: n + 1 }, () => []) });
const mixes: Family[][] = families.flatMap((f, i) => [[f], ...families.slice(i + 1).map(g => [f, g])]);
function brute(n: number, clauses: readonly Clause[]): boolean {
  for (let bits = 0; bits < 2 ** n; bits++) {
    const a = Array.from({ length: n + 1 }, (_, v) => Boolean(bits & (1 << (v - 1))));
    if (satisfies(clauses, a)) return true;
  }
  return false;
}

describe("Ti mechanism DESIGN §§1–2", () => {
  it("§1 evaluator and completed operation agree with brute force, including empty and repeated clauses", () => {
    const r = streams(100).get("ti.problems", "test");
    for (let i = 0; i < 160; i++) {
      const n = 1 + Math.floor(r() * 10);
      const clauses = Array.from({ length: Math.floor(r() * 45) }, () =>
        Array.from({ length: 1 + Math.floor(r() * 3) }, () =>
          (1 + Math.floor(r() * n)) * (r() < 0.5 ? -1 : 1)));
      if (i % 17 === 0) clauses.push([]);
      const expected = brute(n, clauses) ? "consistent" : "contradiction";
      const exact = evaluate(n, clauses);
      expect(exact.label).toBe(expected);
      if (exact.assignment) expect(satisfies(clauses, exact.assignment)).toBe(true);
      const result = runTi(claims(n, clauses), [], zero, 1_000_000, { c_d: 1 }, streams(i));
      expect(result.conclusion).toBe(expected);
      if (result.conclusion === "consistent") expect(satisfies(clauses, result.evidence.assignment)).toBe(true);
      for (const conflict of result.evidence.conflicts) {
        expect(clauses[conflict.clause].every(l => conflict.assignment[Math.abs(l)] === (l < 0))).toBe(true);
      }
    }
  });

  it("§1 balances every mix, checks all knowledge, and keeps X independent of knowledge", () => {
    const base = generateProblems(91, { mixes, perMix: 4, knowledge: "none" });
    for (const knowledge of ["none", "accurate", "partly-false"] as const) {
      const problems = generateProblems(91, { mixes, perMix: 4, knowledge });
      expect(problems.map(p => p.X)).toEqual(base.map(p => p.X));
      for (let i = 0; i < problems.length; i += 4)
        expect(problems.slice(i, i + 4).filter(p => p.label === "consistent")).toHaveLength(2);
      for (const p of problems) {
        expect(p.X.n).toBeGreaterThanOrEqual(8); expect(p.X.n).toBeLessThanOrEqual(20);
        expect(evaluate(p.X.n, p.X.clauses).label).toBe(p.label);
        expect(evaluate(p.X.n, [...p.X.clauses, ...p.L]).label).toBe(p.combinedLabel);
        expect(p.lemmaImplied).toEqual(p.L.map(c => implies(p.X.n, p.X.clauses, c)));
        if (knowledge === "accurate") expect(p.lemmaImplied.every(Boolean)).toBe(true);
        if (knowledge === "partly-false") {
          expect(p.falseLemmaUnavailable).toBe(p.label === "contradiction");
          if (!p.falseLemmaUnavailable) expect(p.lemmaImplied).toContain(false);
        }
        for (const budget of [0, 20, 200, 2000]) {
          const run = runTi(p.X, p.L, zero, budget, { c_d: 2 }, streams(5));
          expect(run.stepsUsed).toBeLessThanOrEqual(budget);
          if (run.conclusion !== "unresolved") expect(run.conclusion).toBe(p.combinedLabel);
          if (run.conclusion === "consistent") expect(satisfies([...p.X.clauses, ...p.L], run.evidence.assignment)).toBe(true);
          if (knowledge === "accurate" && p.label === "consistent") expect(run.conclusion).not.toBe("contradiction");
        }
      }
    }
  });

  it("§2 charges clause checks and both branches; insufficient budget is unresolved", () => {
    const X = claims(2, [[1, 2], [1, -2], [-1, 2], [-1, -2]]);
    for (const c_d of [1, 2, 4]) {
      const full = runTi(X, [], zero, 1000, { c_d }, streams(8));
      expect(full.conclusion).toBe("contradiction");
      expect(full.trace.map(d => d.forced)).toEqual([false, true]);
      for (let budget = 0; budget < full.stepsUsed; budget++) {
        const result = runTi(X, [], zero, budget, { c_d }, streams(8));
        expect(result.conclusion).toBe("unresolved");
        expect(result.stepsUsed).toBeLessThanOrEqual(budget);
      }
      expect(runTi(X, [], zero, full.stepsUsed, { c_d }, streams(8))).toEqual(full);
    }
    expect(runTi(claims(1, [[]]), [], zero, 0, { c_d: 1 }, streams(1)).conclusion).toBe("unresolved");
    expect(runTi(claims(1, [[]]), [], zero, 1, { c_d: 1 }, streams(1)).conclusion).toBe("contradiction");
  });

  it("§2 same seed yields byte-identical generator and operation results; streams isolate draws", () => {
    const replay = () => generateProblems(72, { mixes, perMix: 2, knowledge: "accurate" }).map(p => ({
      p, run: runTi(p.X, p.L, zero, 400, { c_d: 1 }, streams(61)),
    }));
    expect(JSON.stringify(replay())).toBe(JSON.stringify(replay()));
    const rng = streams(7); rng.get("unrelated", "experiment")();
    const X = claims(3, [[1, 2, 3]]);
    expect(runTi(X, [], zero, 40, { c_d: 1 }, rng)).toEqual(runTi(X, [], zero, 40, { c_d: 1 }, streams(7)));
  });

  it("§2 zero theta gives exact uniform probabilities; weighted softmax and polarity follow formula", () => {
    const X = claims(3, [[1, 2, 3], [1, 2]]);
    const uniform = runTi(X, [], zero, 100, { c_d: 1 }, streams(4));
    for (const d of uniform.trace.filter(d => !d.forced)) {
      for (const c of d.candidates) expect(c.probability).toBe(1 / d.candidates.length);
      expect(d.valueProbability).toBe(0.5);
    }
    const theta = { atom: [0, 1, 0, 0, 0, 0, 0, 0, 0], polarity: 2 };
    const d = runTi(X, [], theta, 100, { c_d: 1 }, streams(4)).trace[0];
    expect(d.candidates[0].probability).toBeCloseTo(Math.E / (2 * Math.E + 1));
    const pTrue = 1 / (1 + Math.exp(-2 * d.features[3]));
    expect(d.valueProbability).toBeCloseTo(d.value ? pTrue : 1 - pTrue);
    expect(() => runTi(X, [], { ...zero, atom: [1] }, 1, { c_d: 1 }, streams(1))).toThrow();
  });

  it("§2 disabling family features removes all template-tag dependence", () => {
    const X = claims(3, [[1, 2, 3], [-1, 2]]);
    const tagged = { ...X, tags: Array.from({ length: 4 }, () => [...families]) };
    for (let v = 1; v <= 3; v++) {
      expect(atomFeatures(X, [], v, [1], false)).toEqual(atomFeatures(tagged, [], v, [1], false));
      expect(atomFeatures(tagged, [], v, [], false)).toHaveLength(5);
      expect(atomFeatures(tagged, [], v, [], true).slice(5)).toEqual([1, 1, 1, 1]);
    }
    const theta = { atom: [0.1, 0.2, 0.3, 0.4, 0.5], polarity: 0.3 };
    const run = (x: Claims) => runTi(x, [], theta, 100, { c_d: 1 }, streams(1), { features: { familyTags: false } });
    expect(JSON.stringify(run(X))).toBe(JSON.stringify(run(tagged)));
  });

  it("§1 size endpoints and random clause ratio; §2 feature counts and numerical stability", () => {
    for (const n of [8, 20]) {
      const problems = generateProblems(19, { mixes: [["random"]], perMix: 2, knowledge: "none", n });
      for (const p of problems) {
        expect(p.X.n).toBe(n);
        expect(p.X.clauses).toHaveLength(Math.round(4.26 * n));
        for (const c of p.X.clauses) expect(new Set(c.map(Math.abs)).size).toBe(3);
      }
    }
    const X = claims(3, [[1], [-1, 2], [1, 2, 3]]);
    expect(atomFeatures(X, [[-1]], 1, [1, 3], false)).toEqual([2, 1, 1, 0, 2]);
    const huge = { atom: Array<number>(9).fill(10000), polarity: 10000 };
    const run = runTi(claims(3, [[1, 2], [1, 2, 3]]), [], huge, 100, { c_d: 4 }, streams(1));
    expect(run.conclusion).toBe("consistent");
    for (const d of run.trace) expect(Number.isFinite(d.probability)).toBe(true);
    expect(() => generateProblems(1, { mixes, perMix: 3, knowledge: "none" })).toThrow();
    expect(() => runTi(X, [], zero, -1, { c_d: 1 }, streams(1))).toThrow();
  });
});
