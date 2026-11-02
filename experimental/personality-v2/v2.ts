import { createEightFunctionV1, nullPersonality } from "../../src/index.ts";
import type { CognitiveFunction, MindView, PersonalityModel, PersonalityType } from "../../src/index.ts";
import data from "./data.json" with { type: "json" };

export type FunctionValues = Record<CognitiveFunction, number>;
export interface V2State {
  /** Personality-owned experience, not episodes, beliefs or meaning pools. */
  minds: Record<string, { E: Partial<FunctionValues> }>;
}
export interface AllocationRecord {
  readonly mind: string;
  readonly function: CognitiveFunction;
  readonly B: number;
  readonly R: { readonly att: number; readonly eval: number };
  readonly H: number;
  readonly M: number;
  readonly A: { readonly att: number; readonly eval: number };
  readonly E: number;
  readonly C: number;
  readonly g: number;
}
/** Extends the existing subjective ctx; nothing is added to engine memory. */
export interface V2Context extends MindView {
  readonly mind: string;
  readonly attended: readonly { readonly category: string; readonly weight: number }[];
  readonly candidates: readonly { readonly domain: string }[];
  readonly trace: { allocations: AllocationRecord[] };
}
export interface V2Options {
  /** Proposed initial experience is zero; supply a snapshot to resume replay. */
  readonly state?: V2State;
  /** Experimental individual competence coefficients; these never enter allocation. */
  readonly competence?: (ctx: V2Context) => { readonly C0?: Partial<FunctionValues>; readonly k?: Partial<FunctionValues> };
  /** Test-only counterfactual control for future operations (DESIGN §22.5). */
  readonly mask?: readonly { readonly function: CognitiveFunction; readonly operation: string }[];
}
export interface EightFunctionV2 extends PersonalityModel {
  readonly version: "v2";
  readonly stack: readonly CognitiveFunction[];
  readonly state: V2State;
  allocation(ctx: V2Context): readonly AllocationRecord[];
  advance(ctx: V2Context, dt: number): readonly AllocationRecord[];
  operationEnabled(f: CognitiveFunction, operation: string): boolean;
}

function nonnegative(n: number, label: string): number {
  if (!Number.isFinite(n) || n < 0) throw new RangeError(`${label} must be finite and nonnegative`);
  return n;
}

/** DESIGN §22.3: rel is versioned data; unknown host categories contribute zero. */
export function rel(f: CognitiveFunction, domain: string): number {
  const row: Readonly<Record<string, number>> = data.relevance.rel[f];
  return Object.hasOwn(row, domain) ? row[domain] : 0;
}

/** DESIGN §22.3: share of all cue mass/candidate count in declared categories.
 * Scale before summing to avoid overflow; unrelated categories stay in the denominator.
 */
function relevance(stack: readonly CognitiveFunction[], items: V2Context["attended"]): number[] {
  const scale = items.reduce((max, item) => Math.max(max, nonnegative(item.weight, "cue weight")), 0);
  const total = scale === 0 ? 0 : items.reduce((sum, item) => sum + item.weight / scale, 0);
  return stack.map(f => total === 0 ? 0 : items.reduce((sum, item) =>
    sum + ((data.relevance.categories[f] as readonly string[]).includes(item.category) ? item.weight / scale : 0), 0) / total);
}

/** DESIGN §22.3: softmax(log B + log R + log H + log M), max shifted.
 * R is omitted only if every stack relevance is zero. C and g are absent by design.
 */
function allocate(B: readonly number[], R: readonly number[], logH: readonly number[], logM: readonly number[]): number[] {
  const useR = R.some(r => r > 0);
  const scores = B.map((b, i) => Math.log(b) + (useR ? Math.log(R[i]) : 0) + logH[i] + logM[i]);
  const max = Math.max(...scores);
  const masses = scores.map(score => Math.exp(score - max));
  const total = masses.reduce((sum, mass) => sum + mass, 0);
  return masses.map(mass => mass / total);
}

export function createEightFunctionV2(type: PersonalityType, options: V2Options = {}): EightFunctionV2 {
  // DESIGN §22.2: read the existing factory's stack/W; etaMin is required by V1
  // but no V1 hooks run. Proposed 1 is inert here and never reaches engine params.
  const baseline = createEightFunctionV1(type, { etaMin: 1 });
  const stack = baseline.stack;
  const B = stack.map(f => baseline.weights[f]);
  const state: V2State = structuredClone(options.state ?? { minds: {} });
  const mask = options.mask?.map(entry => ({ ...entry })) ?? [];

  function compute(ctx: V2Context): AllocationRecord[] {
    if (!ctx.mind) throw new RangeError("V2 requires a mind id");
    const own = Object.hasOwn(state.minds, ctx.mind) ? state.minds[ctx.mind] : undefined;
    const E = stack.map(f => nonnegative(own?.E[f] ?? 0, "experience"));
    // DESIGN §22.3, Lally/Wood & Neal: habit form is an estimate.
    const mean = E.reduce((sum, e) => sum + e / stack.length, 0);
    const logH = E.map(e => Math.log1p(e) - Math.log1p(mean));
    const att = relevance(stack, ctx.attended);
    const evaluation = relevance(stack, ctx.candidates.map(c => ({ category: c.domain, weight: 1 })));
    // DESIGN §22.3: p_k is read directly, in need-record order; never rewritten.
    const logM = stack.map(f => nonnegative(ctx.needs.needs.reduce((sum, need) =>
      sum + nonnegative(need.priority, "need priority") * rel(f, need.definition.category), 0), "log motivation"));
    const Aatt = allocate(B, att, logH, logM);
    const Aeval = allocate(B, evaluation, logH, logM);
    const coefficients = options.competence?.(ctx);
    return stack.map((f, i) => {
      const C0 = nonnegative(coefficients?.C0?.[f] ?? data.competence.C0[f], "C0");
      if (C0 === 0) throw new RangeError("C0 must be positive");
      const k = nonnegative(coefficients?.k?.[f] ?? data.competence.k[f], "k");
      // DESIGN §22.3/§19: diminishing returns, separate from choice to use.
      const C = nonnegative(C0 + k * Math.log1p(E[i]), "competence");
      const g = nonnegative(C / C0, "gain");
      const M = nonnegative(Math.exp(logM[i]), "motivation");
      return { mind: ctx.mind, function: f, B: B[i], R: { att: att[i], eval: evaluation[i] },
        H: Math.exp(logH[i]), M, A: { att: Aatt[i], eval: Aeval[i] }, E: E[i], C, g };
    });
  }

  return Object.freeze({
    ...nullPersonality, id: "eight-function", version: "v2", stack, state,
    allocation(ctx: V2Context) {
      const records = compute(ctx);
      ctx.trace.allocations.push(...structuredClone(records));
      return records;
    },
    advance(ctx: V2Context, dt: number) {
      nonnegative(dt, "dt");
      const records = compute(ctx);
      // DESIGN §22.3: simultaneous Euler update using pre-step eval allocation
      // and actual relevance (zero stays zero even when allocation omits R).
      const E = Object.fromEntries(records.map(r => [r.function,
        nonnegative(r.E + r.A.eval * r.R.eval * dt, "updated experience")])) as Partial<FunctionValues>;
      Object.defineProperty(state.minds, ctx.mind, { value: { E }, enumerable: true, configurable: true, writable: true });
      ctx.trace.allocations.push(...structuredClone(records));
      return records;
    },
    operationEnabled: (f: CognitiveFunction, operation: string) => !mask.some(m => m.function === f && m.operation === operation),
  });
}
