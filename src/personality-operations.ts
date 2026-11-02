import type { PersonalityModel } from "./personality.ts";

/** DESIGN §22.5: generic execution evidence; function names belong to the model. */
export interface PersonalityOperation {
  readonly function: string;
  readonly operation: "evaluationTerms" | "meaningSelection" | "preconditionEvidence" | "encoding";
  readonly executed: boolean;
  readonly output: unknown;
}
export function operation(model: PersonalityModel, name: PersonalityOperation["operation"], output: unknown): PersonalityOperation {
  return { function: model.id, operation: name, executed: true, output: structuredClone(output) };
}
/** Empty arrays are non-enumerable to preserve pre-hook serialized traces (§22.4). */
export function withOperations<T extends object>(value: T, operations: readonly PersonalityOperation[]): T & { readonly operations: readonly PersonalityOperation[] } {
  return Object.defineProperty(value, "operations", { value: operations, enumerable: operations.length > 0 }) as T & { readonly operations: readonly PersonalityOperation[] };
}
