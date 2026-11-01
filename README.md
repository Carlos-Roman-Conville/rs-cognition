# @rex/cognition

The Cognition engine: it generates an organism's **intentions** from perceived conditions, internal needs,
knowledge, memory and cognitive structure, and keeps the objective world state apart from the individual's
subjective interpretation. Policy: `a_t = π(o_t, m_t, n_t, p)`, with personality `p` a null model in the baseline.
Design: `DESIGN.md`.

## The fence (DESIGN §0)

- Cognition outputs intentions; it never decides whether an attempt succeeds (the engine owning that state does).
- Physics, neurology, capacity, detectability and hunger's body side reach it only through ports; time, ids,
  events and RNG come from `@rex/kernel`, the only package `src/` may import (besides relative paths).
- No `Math.random`, no `Date.now`: `test/fence.test.ts` enforces all of this.

## Test

```
npm install
npm test            # vitest run
npm run typecheck   # tsc --noEmit
```

## Public API

- `generateActions` builds candidates from host repertoire data.
- `selectAction` chooses an intention; `MindsRunner` emits `cognition.intention` events.

Optional `terms` on repertoire entries, candidates and intentions carry finite numeric host data through to the intention event unchanged.

**Payment acceptance.** Optional asset definitions and exchange candidates use the existing evaluator to combine direct usefulness with believed exchangeability. Offers derive a reservation ratio and carry `ratioMin` and `giveUnits` in intention terms; missing rate beliefs make offers ineligible. See [DESIGN §2.4](DESIGN.md) for the formulas and belief boundary.
