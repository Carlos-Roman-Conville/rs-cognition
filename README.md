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

### Communication inputs

A host-delivered `world.message_received` enters `perceive` as a `kind: "message"`
Stimulus on channel `report`, with `message` and `context: { bubble, thetaPre }`.
Pass the resulting observations to the existing mind `observe` command. The mind
reuses its action configuration's `thetaPre`; standalone `comprehend` callers supply
that same threshold. Detection uses the existing attention/perception stream.

Optional `memory.meaningPool` stores term candidates with literal value rules
(`{ id, attribute, value: { kind: "literal", value }, counts: { [bubble]: number } }`).
The speaker's intended `claim` never overrides the listener's pool. Declarations
add one count; observed group usage can be supplied in `context.usage`, and explicit
confirmation in `context.confirmed`. Reception alone does not reinforce a meaning.
`poolConcentration` is an optional interpret parameter with effective default 1;
it is supplied at message interpretation and omitted from legacy decision traces.
Personality v1 preserves it unchanged.

Comprehension records distributions, prior fit, confusion and testimony likelihoods
in the observation processing trace. Optional `memory.confusionCues` exposes the
latest message's cues to the next decision's `MindView`. Unknown speakers use
Beta(1,1) ignorance (proposed). Missing attribute priors are not invented; alternative
readings about a different attribute supply constant likelihood 1 for that attribute
(proposed marginalization convention).

`bubbleExposure` derives normalized weights from episode context features
`"bubble:<group handle>": true`. Hosts encode every group present, including speaker
and listener groups, using these features. Each episode's retrieval weight is split
equally among its groups. Salience remains 1 pending section 16. Nothing is stored twice.
