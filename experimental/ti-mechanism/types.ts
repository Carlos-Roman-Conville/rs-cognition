/** DESIGN §1: signed, one-based literals; assignment slot zero is unused. */
export type Clause = readonly number[];
export const families = ["chain", "parity", "pigeon", "random"] as const;
export type Family = typeof families[number];
export interface Claims {
  n: number;
  clauses: readonly Clause[];
  tags: readonly (readonly Family[])[];
}
export type Assignment = (boolean | null)[];
export function validate(n: number, clauses: readonly Clause[]): void {
  if (!Number.isInteger(n) || n < 1) throw new Error("Invalid atom count");
  for (const c of clauses) for (const l of c) {
    if (!Number.isInteger(l) || l === 0 || Math.abs(l) > n) throw new Error("Invalid literal");
  }
}
export function satisfies(clauses: readonly Clause[], a: readonly (boolean | null)[]): boolean {
  return clauses.every(c => c.some(l => a[Math.abs(l)] === (l > 0)));
}
