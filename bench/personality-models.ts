// Comparison-only adapters for DESIGN §9. Frozen formulas and engine defaults stay untouched.
import { join } from "node:path";
import { createEightFunctionV1 } from "../src/index.ts";
import type { Domain, PersonalityModel, PersonalityType } from "../src/index.ts";

import { discoverVersionMetadata, FORMULAS } from "./personality-report.ts";
export { TYPES, FORMULAS } from "./personality-report.ts";
export const DOMAINS: Domain[] = ["space", "adaptation", "meta", "cohesion", "body", "people", "strategy", "none"];
export const ETA_MIN = 0.01; // proposed host setting, also illustrated in the frozen v1 README.
export interface Version {
  id: string;
  formulas: { id: string; status: string; hook: string }[];
  create(type: PersonalityType, disabled?: readonly string[]): PersonalityModel;
}

/** Frozen v1 has no switches. Undo only the named formula at the public hook boundary.
 * The fixture supplies no optional V1Context, compounds or self-simulation adapter.
 * In particular F6/F9/F10/F13 have no effect here; do not invent host semantics.
 */
export function comparisonV1(type: PersonalityType, disabled: readonly string[] = []): PersonalityModel {
  if (disabled.some((id) => !FORMULAS.includes(id))) throw new Error("Unknown v1 hook formula");
  const frozen = createEightFunctionV1(type, { etaMin: ETA_MIN });
  const off = new Set(disabled);
  if (!off.size) return frozen;
  const external = { space: frozen.weights.Se, adaptation: frozen.weights.Ne, meta: frozen.weights.Te };
  const internal = { space: frozen.weights.Si, adaptation: frozen.weights.Ni };
  return {
    id: frozen.id, version: frozen.version,
    pertinence(base, mind) {
      // DESIGN §9 F2; F4/F6 have no cue tags in the existing fixture.
      return off.has("F2") ? base : frozen.pertinence(base, mind);
    },
    interpret(base, domain, mind) {
      const result = { ...frozen.interpret(base, domain, mind) };
      // DESIGN §9 F1 then F12: recompute their composition, never divide a clamped eta.
      if (off.has("F1")) result.eta = base.eta;
      if (off.has("F1") || off.has("F12")) {
        result.alpha0 = base.alpha0 * (off.has("F1") ? 1 : 1 - frozen.tilt);
        if (domain === "people" && !off.has("F12")) result.alpha0 *= 1 + frozen.weights.Ni;
      }
      if (off.has("F3")) result.lambda = base.lambda;
      if (off.has("F7")) result.confidence = base.confidence;
      return result;
    },
    generate(candidates, base, mind) {
      const result = frozen.generate(candidates, base, mind);
      // DESIGN §9 F11; absent F9/F10 adapters mean no candidate transformation.
      return off.has("F11") ? { ...result, params: base } : result;
    },
    learning(base, domain, mind) {
      const result = { ...frozen.learning(base, domain, mind) };
      // DESIGN §9 F4/F5: preserve multiplication order when either factor is disabled.
      if (off.has("F4") || off.has("F5")) result.rate = base.rate *
        (off.has("F4") ? 1 : 1 + (external[domain as keyof typeof external] ?? 0)) *
        (off.has("F5") ? 1 : 1 + 1.5 * (internal[domain as keyof typeof internal] ?? 0));
      if (off.has("F8")) { result.d = base.d; result.beliefHalfLife = base.beliefHalfLife; }
      return result;
    },
  };
}

/** Enumerate frozen versions numerically. Fail closed when a newly frozen version lacks
 * an explicit adapter: silently labeling v1 as v2 would invalidate T-3.
 * Later versions add one factory here; the runner automatically compares adjacent versions.
 */
export function discoverVersions(root = join(import.meta.dirname, "../personality/eight-function")): Version[] {
  const factories: Record<string, Version["create"]> = { v1: comparisonV1 };
  return discoverVersionMetadata(root).map(({ id, formulas }) => {
    if (!factories[id]) throw new Error(`Frozen ${id} requires a public factory and formula-ablation adapter`);
    const enabled = formulas.filter((f) => /^F\d+$/.test(f.id) && f.status !== "off").map((f) => f.id);
    if (JSON.stringify(enabled) !== JSON.stringify(FORMULAS)) throw new Error(`Unrecognized ${id} hook manifest`);
    return { id, formulas, create: factories[id] };
  });
}
