# Ti operation (unit 5466)

Implements DESIGN §§1–2 only. No learning, runner, or engine changes.

```ts
import { streams } from "@rex/kernel";
import { generateProblems } from "./problems.ts";
import { runTi } from "./run-ti.ts";

const [problem] = generateProblems(42, {
  mixes: [["chain", "random"]], perMix: 2, knowledge: "accurate",
});
const result = runTi(problem.X, problem.L,
  { atom: Array(9).fill(0), polarity: 0 },
  400, { c_d: 1 }, streams(42));
```

The evaluator envelope has `label` for X and `combinedLabel` for X union L.
Neither belongs in the operation input. `perMix` must be even: exactly half the
accepted X instances in each mix have each evaluator label. Knowledge is added
after generation, preserving identical X across knowledge regimes for a seed.
False knowledge can change the combined-label balance; forcing that balance
would confound the separate knowledge manipulation.

`lemmaImplied` records evaluator checks for each L clause. Accurate helpers are
the first new implied unit or binary clause in deterministic order, falling back
to an existing clause if there is no such short consequence. Partly-false knowledge
adds a checked non-implied clause where possible. An unsatisfiable X entails every
clause, so a non-implied lemma is mathematically impossible there:
`falseLemmaUnavailable` explicitly records that case, with accurate-only L.

Template sizes and other underspecified choices are proposed, not fitted:

- Chain spans n atoms, ends in the negation of its first atom, and optionally
  asserts that atom. Parity uses disjoint two-atom XOR/equality blocks and optional
  units. Pigeon uses two holes and two or three pigeons. Random has round(4.26n)
  clauses, each with three distinct atoms and independent signs.
- Families use independent permutations of the same atom vocabulary. Mixed
  instances are rejection-sampled by their evaluator label, with a 100,000-attempt
  cap per mix; this conditions the template distribution on satisfiability.
- Features are static occurrence counts by original clause length (including L),
  signed positive-minus-negative occurrence count, occurrences in the last eight
  conflict clauses, then chain/parity/pigeon/random indicators from X's tags.
- `theta.atom` has nine entries with tags, five with
  `{ features: { familyTags: false } }`. Disabled tags are never consulted.
  `theta.polarity` is a separate scalar: P(true) = sigmoid(weight * balance).
- Decisions use stable softmax over all unassigned atoms in numeric order.
  The stream bank argument is scoped internally to `ti.branch@experiment`;
  generation uses `ti.problems@experiment`. Reuse a bank for advancing runs,
  or create the same seed again to replay a run.
- A clause inspection during propagation costs one; each branch assignment costs
  c_d, including the forced reverse branch. If the next operation is unaffordable,
  return unresolved without overspending. A proof completed on the final paid
  step is definite. Free bookkeeping and feature computation are outside the
  design's abstract step metric.

Trace records include the decision path, selected features and probability,
polarity probability, and all candidate features/probabilities for a future
policy-gradient implementation. Reverse branches are marked `forced`, have
probability one, and no sampled candidates (zero policy-gradient contribution).
Conflict evidence contains the closing clause's index in X union L and the
assignment falsifying it, for every closed leaf. Consistent evidence contains a
total satisfying assignment; unresolved evidence contains the current partial
assignment and closed leaves so far. Assignment slot zero is unused/null.

Validation: `npx vitest run test/ti-mechanism-run.test.ts`, `npx tsc --noEmit`,
and `npm run codex-check`. The experiment itself is reserved for the keeper.
