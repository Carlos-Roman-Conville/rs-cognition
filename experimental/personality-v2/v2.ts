import { createEightFunctionV1, nullPersonality } from "../../src/index.ts";
import type { Candidate, GenerateParams, CategoricalBelief, CognitiveFunction, MindView, Observation, PersonalityModel, PersonalityType } from "../../src/index.ts";
import data from "./data.json" with { type: "json" };
import { generateTe } from "./te.ts";
import type { TeOptions } from "./te.ts";
import { generateNe } from "./ne.ts";
import type { NeOptions } from "./ne.ts";
import { seEvidence } from "./se.ts";
import type { SeOptions } from "./se.ts";
import { encodeV2 } from "./encoding.ts";
import type { EncodingOptions } from "./encoding.ts";

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
}
/** Extends the existing subjective ctx; nothing is added to engine memory. */
export interface V2Context extends MindView {
  readonly mind: string;
  readonly attended: readonly { readonly category: string; readonly weight: number }[];
  readonly candidates: readonly { readonly domain: string }[];
  readonly trace: { allocations: AllocationRecord[] };
}
export interface V2Options {
  /** DESIGN scenarios section 10.3: permutation of function labels, preserving B. */
  readonly labels?: Readonly<Record<CognitiveFunction, CognitiveFunction>>;
  /** DESIGN section 22.5: scope an operation mask to one replayed step. */
  readonly maskActive?: () => boolean;
  readonly encoding?: EncodingOptions;
  readonly se?: SeOptions;
  readonly te?: TeOptions;
  readonly ne?: NeOptions;
  /** Proposed initial experience is zero; supply a snapshot to resume replay. */
  readonly state?: V2State;
  /** Test-only counterfactual control for future operations (DESIGN §22.5). */
  readonly mask?: readonly { readonly function: CognitiveFunction; readonly operation: string }[];
}
export interface EightFunctionV2 extends PersonalityModel {
  readonly version: "v2";
  readonly stack: readonly CognitiveFunction[];
  readonly state: V2State;
  relabel(labels: Readonly<Record<CognitiveFunction, CognitiveFunction>>): EightFunctionV2;
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
 * R is omitted only if every stack relevance is zero.
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
  if (options.labels) {
    const functions: CognitiveFunction[] = ["Se", "Si", "Ne", "Ni", "Te", "Ti", "Fe", "Fi"];
    const labels = functions.map(f => options.labels![f]);
    if (new Set(labels).size !== functions.length || labels.some(f => !functions.includes(f))) throw new RangeError("Function labels must be a permutation");
  }
  const stack = baseline.stack.map(f => options.labels?.[f] ?? f);
  const B = baseline.stack.map(f => baseline.weights[f]);
  const state: V2State = structuredClone(options.state ?? { minds: {} });
  const mask = options.mask?.map(entry => ({ ...entry })) ?? [];

  function compute(ctx: V2Context): AllocationRecord[] {
    if (!ctx.mind) throw new RangeError("V2 requires a mind id");
    const own = Object.hasOwn(state.minds, ctx.mind) ? state.minds[ctx.mind] : undefined;
    const E = stack.map(f => nonnegative(own?.E[f] ?? 0, "experience"));
    // FUNCTION-DESIGN §4.6 supersedes DESIGN §22.3: Lally et al. 2010 supports
    // the asymptotic shape; h and E_0 are estimates (H-Q2 and H-Q1). expm1
    // preserves small experience increments without subtractive cancellation.
    const H = E.map(e => 1 - data.habit.h.value * Math.expm1(-e / data.habit.E_0.value));
    const logH = H.map(h => Math.log(h));
    const att = relevance(stack, ctx.attended);
    const evaluation = relevance(stack, ctx.candidates.map(c => ({ category: c.domain, weight: 1 })));
    // DESIGN §22.3: p_k is read directly, in need-record order; never rewritten.
    const logM = stack.map(f => nonnegative(ctx.needs.needs.reduce((sum, need) =>
      sum + nonnegative(need.priority, "need priority") * rel(f, need.definition.category), 0), "log motivation"));
    const Aatt = allocate(B, att, logH, logM);
    const Aeval = allocate(B, evaluation, logH, logM);
    return stack.map((f, i) => {
      const M = nonnegative(Math.exp(logM[i]), "motivation");
      return { mind: ctx.mind, function: f, B: B[i], R: { att: att[i], eval: evaluation[i] },
        H: H[i], M, A: { att: Aatt[i], eval: Aeval[i] }, E: E[i] };
    });
  }

  const model: EightFunctionV2 = Object.freeze({
    ...nullPersonality, id: "eight-function", version: "v2", stack, state,
    ...(options.encoding ? { encoding: (cues: Parameters<typeof encodeV2>[0], mind: MindView) =>
      encodeV2(cues, mind, model, options.encoding!) } : {}),
    // FUNCTION-DESIGN §6.4 (corrected): Fe never adopts the audience's reading.
    meaningSelection: (distribution: CategoricalBelief) => distribution,
    preconditionEvidence(candidate: Candidate, precondition: Candidate["preconditions"][number],
      beliefP: number, observations: readonly Observation[], mind: MindView) {
      return options.se ? seEvidence(candidate, precondition, beliefP, observations, mind, this, options.se) : beliefP;
    },
    generate(candidates: readonly Candidate[], base: GenerateParams, mind: MindView) {
      const result = options.te ? generateTe(candidates, base, mind, this, options.te) : { candidates, params: base };
      // Both operations compose original repertoire entries, never each other's additions.
      return options.ne ? generateNe(candidates, base, mind, this, options.ne, result.candidates) : result;
    },
    relabel: (labels: Readonly<Record<CognitiveFunction, CognitiveFunction>>) => createEightFunctionV2(type, { ...options, state, labels }),
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
    operationEnabled: (f: CognitiveFunction, operation: string) => options.maskActive?.() === false || !mask.some(m => m.function === f && m.operation === operation),
  });
  return model;
}
