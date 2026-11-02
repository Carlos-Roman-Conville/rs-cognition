import { validate, type Assignment, type Clause } from "./types.ts";

/** DESIGN §1: complete, unbudgeted DPLL (Davis, Logemann & Loveland 1962).
 * Generator/scorer only; the operation never imports this module. */
export function evaluate(n: number, clauses: readonly Clause[]): {
  label: "consistent" | "contradiction"; assignment: Assignment | null;
} {
  validate(n, clauses);
  function solve(a: Assignment): Assignment | null {
    let changed: boolean;
    do {
      changed = false;
      for (const c of clauses) {
        if (c.some(l => a[Math.abs(l)] === (l > 0))) continue;
        const free = [...new Set(c.filter(l => a[Math.abs(l)] === null))];
        if (!free.length) return null;
        if (free.length === 1) { a[Math.abs(free[0])] = free[0] > 0; changed = true; }
      }
    } while (changed);
    const v = a.findIndex((value, i) => i > 0 && value === null);
    if (v < 0) return a;
    for (const value of [false, true]) {
      const next = a.slice(); next[v] = value;
      const result = solve(next);
      if (result) return result;
    }
    return null;
  }
  const assignment = solve(Array<boolean | null>(n + 1).fill(null));
  return { label: assignment ? "consistent" : "contradiction", assignment };
}

/** DESIGN §1: X entails C iff X and the negation of C have no model. */
export function implies(n: number, clauses: readonly Clause[], lemma: Clause): boolean {
  return evaluate(n, [...clauses, ...lemma.map(l => [-l])]).label === "contradiction";
}
