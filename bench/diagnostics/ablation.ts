// Host-only FL-1 adapter. Frozen formulas and public engine code remain unchanged.
import { canonical, restore } from "@rex/kernel";
import { createEightFunctionV1 } from "../../src/index.ts";
import type { CognitiveFunction, Domain, V1Context } from "../../src/index.ts";
import { comparisonV1, ETA_MIN } from "../personality-models.ts";
import type { Configuration, HookCall } from "../scenarios/s1-forage/cognition.ts";
import { ForageWorld } from "../scenarios/s1-forage/world.ts";
import type { EpochLog } from "../scenarios/s1-forage/world.ts";

export const FUNCTIONS: readonly CognitiveFunction[] = ["Se", "Si", "Ne", "Ni", "Te", "Ti", "Fe", "Fi"];
export const HOOKS = ["pertinence", "interpret", "generate", "learning"] as const;
export type Hook = typeof HOOKS[number];
export type Run = ReturnType<ForageWorld["run"]>;
export interface Ablation { function: CognitiveFunction; hook: Hook }
export const DOMAIN: Record<CognitiveFunction, Domain> = {
  Se: "space", Si: "space", Ne: "adaptation", Ni: "adaptation", Te: "meta", Ti: "meta", Fe: "cohesion", Fi: "cohesion",
};
const external: Partial<Record<Domain, CognitiveFunction>> = { space: "Se", adaptation: "Ne", meta: "Te" };
const internal: Partial<Record<Domain, CognitiveFunction>> = { space: "Si", adaptation: "Ni" };

export function adapter(configuration: Configuration, disabled: Ablation) {
  if (configuration.version !== "null" && (configuration.version !== "v1" || !configuration.stack)) {
    throw new Error(`No ledger ablation adapter for ${configuration.version}`);
  }
  const model = configuration.version === "null" ? undefined : createEightFunctionV1(configuration.stack!, { etaMin: ETA_MIN });
  const active = !!model?.weights[disabled.function];
  const comparisons = new Map<string, ReturnType<typeof comparisonV1>>();
  // DESIGN diagnostics §1 / FL-1: v1 exposes formula switches, not independent function switches.
  // Collective F1/F2/F3 are mapped to ALL present functions. These overlapping group ablations are not additive.
  function formulas(hook: Hook, domain?: string): string[] {
    if (!active || hook !== disabled.hook) return [];
    const f = disabled.function, ex = external[domain as Domain], inside = internal[domain as Domain];
    if (hook === "pertinence") return ["F2", ...(["Se", "Ne", "Te"].includes(f) ? ["F4"] : []), ...(f === "Se" ? ["F6"] : [])];
    if (hook === "interpret") return ["F1", "F3", ...(ex === f || inside === f ? ["F7"] : []),
      ...(f === "Se" ? ["F6"] : []), ...(f === "Ni" ? ["F12"] : []), ...(f === "Te" ? ["F13"] : [])];
    if (hook === "generate") return f === "Ne" ? ["F9", "F11"] : f === "Ni" ? ["F10", "F11"] : [];
    return [...(ex === f ? ["F4"] : []), ...(inside === f ? ["F5"] : []), ...(f === "Si" ? ["F8"] : [])];
  }
  function transform(hook: Hook, before: unknown, after: unknown, domain?: string, context: V1Context = {}): unknown {
    const off = formulas(hook, domain);
    if (!off.length) return after;
    const base = before as Record<string, number>, value = after as Record<string, number>;
    const weights = model!.weights;
    if (hook === "pertinence") {
      // Extend comparisonV1's F2 switch to S1's existing F4/F6 cue context (DESIGN §9).
      // F2-off uses original base mass; preserve the remaining multiplicative boosts.
      return Object.fromEntries(Object.keys(base).map((id) => {
        const cue = context.cues?.[id];
        const owner = cue && external[cue.domain];
        const boost = 1 + (owner && !(off.includes("F4") && owner === disabled.function) ? weights[owner] : 0);
        const physical = 1 + (!off.includes("F6") && cue?.physical && cue.present ? weights.Se : 0);
        return [id, base[id] * boost * physical];
      }));
    }
    if (hook === "generate") {
      // S1 supplies neither compound nor otherMind adapters; F9/F10 are exact identities.
      const b = before as { params: unknown }, a = after as { candidates: unknown; params: unknown };
      return off.includes("F11") ? { ...a, params: b.params } : after;
    }
    // Reuse the existing comparison adapter for context-free formula switches.
    const key = off.join(",");
    let comparison = comparisons.get(key);
    if (!comparison) { comparison = comparisonV1(configuration.stack!, off); comparisons.set(key, comparison); }
    if (hook === "interpret") {
      const b = before as Parameters<typeof comparison.interpret>[0];
      // comparisonV1 does not inspect mind; S1's context extensions are applied below.
      const result = { ...comparison.interpret(b, domain as Domain, {} as Parameters<typeof comparison.interpret>[2]) };
      if (!off.includes("F6")) {
        result.weberFraction = value.weberFraction;
        if ((context.aboutPerson ?? domain === "people") && context.present) result.eta += weights.Se * (1 - result.eta) / 2;
      }
      if (!off.includes("F13")) result.testimonyFloor = value.testimonyFloor;
      return result;
    }
    const b = before as Parameters<typeof comparison.learning>[0];
    return comparison.learning(b, domain as Domain, {} as Parameters<typeof comparison.learning>[2]);
  }
  return { model, formulas, transform };
}

/** Reconstruct only subjective context already in the S1 trace, in hook-call order. */
export type DiagnosticEpoch = Pick<EpochLog, "mind" | "epoch" | "intention" | "trace"> & { cues: readonly { cue: string; domain: Domain; tags: string[] }[] };
export function hookContexts(row: DiagnosticEpoch): V1Context[] {
  const cues = Object.fromEntries(row.cues.map((cue) => [cue.cue, {
    domain: cue.domain, physical: cue.tags.includes("physical"), present: cue.tags.includes("present"),
  }]));
  let sensory = 0;
  return row.trace.hooks.map((call) => {
    if (call.hook !== "interpret" || sensory >= row.trace.interpretation.length) return { cues };
    const id = row.trace.interpretation[sensory++].cue;
    const tags = row.cues.find((cue) => cue.cue === id)?.tags ?? [];
    return { cues, targeted: tags.includes("targeted"), present: tags.includes("present"), testimony: tags.includes("procedural") };
  });
}

export function decode(value: unknown): unknown {
  if (value === "Infinity") return Infinity;
  if (Array.isArray(value)) return value.map(decode);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, decode(v)]));
  return value;
}
export const encode = (value: unknown): unknown => JSON.parse(JSON.stringify(value, (_key, v: unknown) => v === Infinity ? "Infinity" : v));

/** Rerun the original initial snapshot and streams. No extra event log or private engine access.
 * The public personality object is the S1 recording wrapper (mutable), not the frozen v1 model.
 * Its existing trace is normalized after each epoch to the actual ablated hook returns.
 */
export function rerunAblation(run: Run, disabled: Ablation): Run {
  const ablate = adapter(run.configuration, disabled);
  const world = new ForageWorld({ seed: run.seed, epochs: run.hostInputLog.length, configuration: run.configuration,
    patches: run.hostInputLog[0].before.patches });
  const restored = restore([
    { id: "world", snapshot: () => world.state, restore: (s: unknown) => { world.state = s as typeof world.state; } },
    { id: "minds", snapshot: () => world.agent.snapshot(), restore: (s: unknown) => world.agent.restore(s) },
  ], structuredClone(run.initial));
  world.random.restore(restored.rng);
  // Preserve the supplied initial snapshot in the returned run, including custom fixture layouts.
  let context: V1Context = {};
  const decide = world.agent.decide.bind(world.agent);
  world.agent.decide = (sensor, hunger, t, position) => decide((view, model, setContext) => sensor(view, model, (next) => {
    context = next; setContext(next);
  }), hunger, t, position);
  const model = world.agent.personality;
  const original = { ...model };
  model.pertinence = (base, view) => ablate.transform("pertinence", base, original.pertinence(base, view), undefined, context) as ReturnType<typeof model.pertinence>;
  model.interpret = (base, domain, view) => ablate.transform("interpret", base, original.interpret(base, domain, view), domain, context) as ReturnType<typeof model.interpret>;
  model.generate = (candidates, base, view) => ablate.transform("generate", { candidates, params: base }, original.generate(candidates, base, view), undefined, context) as ReturnType<typeof model.generate>;
  model.learning = (base, domain, view) => ablate.transform("learning", base, original.learning(base, domain, view), domain, context) as ReturnType<typeof model.learning>;
  while (world.state.epoch < run.hostInputLog.length) {
    world.step();
    const row = world.hostInputLog.at(-1)!;
    const contexts = hookContexts(row);
    row.trace.hooks.forEach((call, i) => {
      if (!ablate.formulas(call.hook, call.domain).length) return;
      call.after = encode(ablate.transform(call.hook, decode(call.before), decode(call.after), call.domain, contexts[i]));
      const b = call.before as Record<string, unknown>, a = call.after as Record<string, unknown>;
      call.changed = Object.keys(b).filter((key) => canonical(b[key]) !== canonical(a[key]));
    });
  }
  return { ...world.run(), initial: run.initial };
}

export function ablatedOutput(call: HookCall, context: V1Context, ablate: ReturnType<typeof adapter>) {
  return encode(ablate.transform(call.hook, decode(call.before), decode(call.after), call.domain, context));
}
