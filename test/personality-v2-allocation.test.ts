import { describe, expect, it } from "vitest";
import { streams } from "@rex/kernel";
import { createEightFunctionV1, evaluateActions, generateActions, nullPersonality, selectAction } from "../src/index.ts";
import type { FeltNeed } from "../src/index.ts";
import { createEightFunctionV2, rel } from "../experimental/personality-v2/v2.ts";
import type { V2Context } from "../experimental/personality-v2/v2.ts";
import { createPersonality } from "../experimental/personality-v2/select.ts";
import { scored, view, wait } from "./decision-fixtures.ts";

const ctx = (mind = "mind.0001"): V2Context => ({ ...view(), mind,
  attended: [{ category: "space", weight: 2 }, { category: "meta", weight: 1 },
    { category: "people", weight: 3 }, { category: "strategy", weight: 4 }],
  candidates: [{ domain: "space" }, { domain: "meta" }, { domain: "people" }, { domain: "strategy" }],
  trace: { allocations: [] },
});
const need = (category: string, priority: number): FeltNeed => ({
  definition: { id: category, category, source: { signal: category }, setpoint: 1, weight: 1, salienceTags: [] },
  level: 0, deficit: 1, salience: 1, pressure: 1, priority,
});

describe("DESIGN §22.3 V2 allocation", () => {
  it("softmax equals the normalized B R H M product separately for attention and evaluation", () => {
    const p = createEightFunctionV2("ESTP", { state: { minds: { "mind.0001": { E: { Se: 3, Ti: 1 } } } } });
    const c = ctx();
    const rows = p.allocation({ ...c, needs: { needs: [need("meta", 0.7)], goals: [] } });
    expect(rows.map(r => r.B)).toEqual([1, 0.75, 0.5, 0.25]);
    expect(rows.map(r => r.R.att)).toEqual([0.2, 0.1, 0.3, 0.4]);
    for (const phase of ["att", "eval"] as const) {
      const masses = rows.map(r => r.B * r.R[phase] * r.H * r.M);
      const total = masses.reduce((a, b) => a + b, 0);
      rows.forEach((r, i) => expect(r.A[phase]).toBeCloseTo(masses[i] / total, 14));
    }
    expect(rows[0].H).toBeCloseTo(1 + (1 - Math.exp(-3 / 22)), 14);
    rows.forEach(r => expect(r).not.toHaveProperty("C"));
    rows.forEach(r => expect(r).not.toHaveProperty("g"));
    expect(c.trace.allocations).toEqual(rows);
  });

  it("rising E raises H and A; advance applies Aeval Reval dt once and isolates minds", () => {
    const p = createEightFunctionV2("ESTP");
    const c = { ...ctx(), candidates: [{ domain: "space" }] };
    const before = p.advance(c, 4);
    expect(p.state.minds[c.mind].E).toEqual({ Se: 4, Ti: 0, Fe: 0, Ni: 0 });
    const mixed = ctx();
    const fresh = p.allocation(ctx("mind.0002"));
    const practiced = p.allocation(mixed);
    expect(practiced[0].H).toBeGreaterThan(fresh[0].H);
    expect(practiced[0].A.att).toBeGreaterThan(fresh[0].A.att);
    expect(practiced[0].A.eval).toBeGreaterThan(fresh[0].A.eval);
    const snapshot = JSON.stringify(p.state);
    p.allocation(mixed);
    expect(JSON.stringify(p.state)).toBe(snapshot);
    const step = p.advance(mixed, 2);
    step.forEach(r => expect(p.state.minds[mixed.mind].E[r.function]).toBeCloseTo(r.E + r.A.eval * r.R.eval * 2));
    expect(before[0].E).toBe(0);
    expect(c.trace.allocations[0].E).toBe(0);
    expect(p.state.minds["mind.0002"]).toBeUndefined();
  });

  it("equal experience gives identical habit and allocation across minds", () => {
    const E = { Se: 2, Ti: 3, Fe: 4, Ni: 5 };
    const p = createEightFunctionV2("ESTP", {
      state: { minds: { a: { E }, b: { E } } },
    });
    const a = p.allocation(ctx("a"));
    const b = p.allocation(ctx("b"));
    expect(a.map(r => r.A)).toEqual(b.map(r => r.A));
    expect(a.map(r => r.H)).toEqual(b.map(r => r.H));
    expect(p.state.minds).toEqual({ a: { E }, b: { E } });
  });

  it("M reads host need priorities without writing needs and unknown tags contribute zero", () => {
    const p = createEightFunctionV2("ESTP");
    const c = { ...ctx(), needs: { needs: [need("meta", 0.8), need("unknown", 0.9)], goals: [] } };
    const bytes = JSON.stringify(c.needs);
    Object.freeze(c.needs.needs[0]); Object.freeze(c.needs.needs); Object.freeze(c.needs);
    const rows = p.allocation(c);
    expect(rows.map(r => r.M)).toEqual([1, Math.exp(0.8), 1, 1]);
    const higher = p.allocation({ ...c, needs: { needs: [need("meta", 1)], goals: [] } });
    expect(higher[1].M).toBeGreaterThan(rows[1].M);
    expect(higher[1].A.eval).toBeGreaterThan(rows[1].A.eval);
    expect(JSON.stringify(c.needs)).toBe(bytes);
    expect(rel("Se", "unknown")).toBe(0);
    expect(rel("Se", "toString")).toBe(0);
  });

  it("drops an all-zero relevance term but never invents practice, and preserves individual zero shares", () => {
    const p = createEightFunctionV2("ESTP");
    const c = { ...ctx(), attended: [], candidates: [{ domain: "none" }] };
    const rows = p.advance(c, 20);
    rows.forEach(r => {
      expect(r.A.att).toBeCloseTo(r.B / 2.5);
      expect(r.A.eval).toBeCloseTo(r.B / 2.5);
      expect(p.state.minds[c.mind].E[r.function]).toBe(0);
    });
    const one = p.allocation({ ...ctx(), attended: [{ category: "meta", weight: 1 }] });
    expect(one.map(r => r.A.att)).toEqual([0, 1, 0, 0]);
    p.advance(ctx(), 0);
    expect(Object.values(p.state.minds[c.mind].E)).toEqual([0, 0, 0, 0]);
  });

  it("remains finite at large experience/cue weights and rejects invalid values atomically", () => {
    const p = createEightFunctionV2("ESTP", { state: { minds: { "mind.0001": { E: { Se: 1e300, Ti: 1e300 } } } } });
    const c = { ...ctx(), attended: [{ category: "space", weight: 1e308 }, { category: "meta", weight: 1e308 }] };
    const rows = p.allocation(c);
    expect(rows[0].R.att).toBe(0.5);
    expect(rows.reduce((sum, r) => sum + r.A.att, 0)).toBeCloseTo(1);
    expect(rows.every(r => Number.isFinite(r.H))).toBe(true);
    const bytes = JSON.stringify({ state: p.state, trace: c.trace });
    for (const dt of [-1, NaN, Infinity]) expect(() => p.advance(c, dt)).toThrow();
    expect(() => p.advance({ ...c, attended: [{ category: "space", weight: -1 }] }, 1)).toThrow();
    expect(() => p.advance({ ...c, needs: { needs: [need("meta", 1000)], goals: [] } }, 1)).toThrow();
    expect(JSON.stringify({ state: p.state, trace: c.trace })).toBe(bytes);
  });

  it("selects existing null/V1 factories and masks only the named operation without changing allocation", () => {
    expect(createPersonality({ model: "null" })).toBe(nullPersonality);
    const config = { model: "eight-function", version: "v1", type: "ESTP", options: { etaMin: 0.01 } } as const;
    expect(createPersonality(config)).toMatchObject({ version: "v1", weights: createEightFunctionV1("ESTP", config.options).weights });
    expect(createPersonality({ model: "eight-function", version: "v2", type: "ESTP" }).version).toBe("v2");
    const masked = createEightFunctionV2("ESTP", { mask: [{ function: "Ti", operation: "evaluationTerms" }] });
    expect(masked.operationEnabled("Ti", "evaluationTerms")).toBe(false);
    expect(masked.operationEnabled("Fe", "evaluationTerms")).toBe(true);
    expect(masked.operationEnabled("Ti", "encoding")).toBe(true);
    expect(masked.allocation(ctx())).toEqual(createEightFunctionV2("ESTP").allocation(ctx()));
    expect(masked.evaluationTerms).toBeUndefined();
    const base = { eta: 1, alpha0: 1, lambda: 1, confidence: 1, weberFraction: 0, testimonyFloor: 0 };
    expect(masked.interpret(base, "meta", ctx())).toBe(base);
  });

  it("replays allocation, experience and decision traces byte-identically for one seed and resumes snapshots", () => {
    const run = () => {
      const p = createEightFunctionV2("ESTP");
      const rng = streams(17).get("cognition.decision.select", "mind.0001");
      const c = ctx();
      const decisions = [];
      for (let i = 0; i < 5; i++) {
        p.advance(c, 1);
        const generated = generateActions({ repertoire: [scored("a", -0.5), scored("b", 0.75)], wait, body: { capacity_functional: 1 } }, c, p);
        const evaluated = evaluateActions(generated, c, [], {}, 1000, p);
        decisions.push(selectAction(evaluated, { mind: c.mind, counters: {} }, rng).trace);
      }
      const snapshot = structuredClone(p.state);
      const resumed = createEightFunctionV2("ESTP", { state: snapshot });
      expect(resumed.advance(ctx(), 1)).toEqual(p.advance(ctx(), 1));
      expect(resumed.state).toEqual(p.state);
      expect(snapshot).not.toEqual(p.state);
      return JSON.stringify({ decisions, trace: c.trace, state: p.state });
    };
    expect(run()).toBe(run());
  });
});
