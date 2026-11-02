# Ti proof-of-mechanism experiment (design; Cognition keeper, 2026-11-02)

**Question (Rex, FUNCTION-DESIGN.md §12.7).** Does a simulated mind get better at detecting contradictions through
experience, rather than by being given more processing or by memorising answers?

**Status.** A design for an isolated experiment under `experimental/ti-mechanism/`. It does not replace or change the
V2 Ti operation, V1, `src/`, or any shared engine parameter. It follows the competence architecture of
FUNCTION-DESIGN.md §4.7: the mind's state is `θ_Ti`, never a competence number; competence is measured outside the
mind; feedback is only what the mind receives; insufficient budget gives "unresolved", never a conclusion.

## 1. The problems (formally checkable)

- **Representation (keeper's modelling choice).** A claim set `X` is a set of propositional constraints over `n`
  boolean atoms, each a clause (a disjunction of literals). The mind's background knowledge `L` is a further clause
  set. **Contradiction** means `X ∪ L` is unsatisfiable; **consistency** means it is satisfiable. This gives Ti's
  "internal conceptual consistency" a formal test that an exact checker can grade without subjective judgement. That
  is why Ti comes first (Rex).
- **Families, so that transfer can be tested.** Problems are built from constraint templates. Each family carries its
  own structure:
  - **chain:** implication chains `a→b→…→¬a`;
  - **parity:** small XOR blocks;
  - **pigeon:** small pigeonhole fragments;
  - **random:** random 3-clauses near the satisfiability threshold, clause-to-atom ratio about 4.26 (Mitchell, Selman &
    Levesque 1992; Crawford & Auton 1996).
  A problem combines one or two families on shared atoms. **Transfer** problems use family combinations never seen in
  training.
- **Balance.** The generator emits satisfiable and unsatisfiable problems in equal numbers per family mix, verified by
  the exact checker. Sizes are `n = 8` to `20` atoms (estimate; small enough for exact checking).
- **Knowledge `L`.** `L` holds helper clauses: lemmas implied by `X`'s families that make contradictions shallower.
  Knowledge is varied separately: none, accurate lemmas, or partly **false** lemmas. False lemmas are clauses not
  implied by `X`, and they can produce false contradiction reports, which is how bad knowledge shows.
- **The evaluator** (outside the mind) runs a complete solver without a budget. It holds the true label and never
  gives it to the mind except through the feedback channel (§4).

## 2. The operation: `y_Ti = Run_Ti(X, L, θ_Ti, b_Ti)`

A budgeted DPLL search (Davis, Logemann & Loveland 1962) with unit propagation.
- **Budget `b_Ti`.** It counts steps: one per clause check during propagation, and `c_d` per branching decision.
  `c_d = 1` is an estimate; sensitivity runs use `c_d ∈ {1, 2, 4}` (Bud-Q1). Whatever the costs, the budget is the
  only processing the mind gets.
- **Output.** One of three conclusions:
  - **contradiction found**, with the conflict evidence (the clauses that closed every branch);
  - **consistent within scope**, with the satisfying assignment for `X ∪ L`;
  - **unresolved** (the budget ran out), with the partial search.
  Plus the steps used. "I didn't find it" is never reported as "it isn't there".
- **`θ_Ti`, concrete and learned.** It is a weight vector over atom features `φ(v)`:
  - occurrences in clauses of length 1, 2 and 3 or more;
  - polarity balance;
  - occurrences in recently conflicting clauses within the current search;
  - one indicator per family template the atom belongs to (as the mind perceives it).
  Branching chooses atom `v` with probability `π(v) ∝ exp(θ · φ(v))`, and its value by a second weight on polarity
  balance, both drawn from a seeded kernel stream, so replay is exact. `θ_Ti` is the **search order**: which atoms and
  combinations Ti examines first. It is not a belief and not a skill, and it is never a competence number.
- **Initial `θ`.** All weights 0 (uniform branching) for the baseline mind.

## 3. Learning: `θ ← Learn_Ti(θ, e, r̂)`

- **Experience `e`** is the mind's own search trace: the decisions it took and their features.
- **Feedback `r̂`** is what the mind receives after concluding: "correct", "wrong" or nothing. A correct definite
  conclusion scores `r̂ = 1 − steps/b_Ti` (reward for the result and for efficiency). A wrong one scores `−1`.
  "Unresolved" scores `−0.25` (estimate). No feedback scores nothing, and there is no update.
- **Update (policy gradient; Williams 1992, REINFORCE):** `θ ← θ + λ · (r̂ − r̄) · Σ_decisions ∇_θ log π(v | θ)`,
  with a running baseline `r̄` (the mean of past received `r̂`). The learning rate is `λ = 0.05` (estimate).
- **Feedback regimes**, varied separately:
  - **accurate:** the true correctness every time;
  - **incomplete:** feedback withheld with probability `p_miss = 0.5`;
  - **misleading:** correctness flipped with probability `p_flip = 0.3`.
  The values are estimates.
- **Confidence, as beliefs.** Answer confidence is `q_k = E[Beta(α_k, β_k)]` for each conclusion type `k` (contradiction,
  consistent). It is recorded **before** feedback and updated by the feedback received: a misleading regime can make it
  confidently wrong. Method confidence is a Beta belief per family mix that this `θ` resolves problems of that kind. It
  is recorded only and never raises allocation (Alloc-Q1).

## 4. The experiment sequence

Each arm is run for many seeds (estimate: 40). Each seed draws its own problem sets.
1. **Baseline:** `θ = 0`, on 200 unseen test problems at fixed knowledge and budget.
2. **Training:** 400 problems from the training families, under one feedback regime.
3. **Transfer:** 200 fresh problems from the training families, plus 200 from unseen family mixes.
4. **Attribution:** old `θ` (baseline) against new `θ` (trained), on **identical** problems, knowledge and budget.
5. **Budget sweep:** steps 1, 3 and 4 at budgets `b ∈ {50, 100, 200, 400, 800}` (estimates). This separates better
   quality at a fixed budget from the budget needed to reach a fixed quality.

**Varied separately (full factorial where affordable):**
- knowledge: none, accurate or partly false;
- budget: the sweep above;
- training history: number of training problems ∈ {0, 100, 400};
- feedback regime: accurate, incomplete or misleading;
- step costs `c_d`.

Habit stays at `h = 1`, `E_0 = 22`, with no decay. Habit is not used in this experiment.

## 5. What is measured (by the evaluator, outside the mind)

- Correct contradiction detections, and correct consistency results.
- False contradiction reports and false consistency reports.
- Unresolved share.
- Steps used.
- Transfer performance on unseen family mixes.
- Answer confidence before feedback, against correctness (calibration).

**Competence** is reported as a profile `C_Ti(T, b)` over task sets and budgets: quality at a fixed budget, and the
budget needed for a fixed quality. It is never one number.

**Never inferred:**
- improvement from a change in `θ` alone (only fresh-problem performance counts);
- improvement from more practice alone;
- any competence for the mind to read.

**Controls:**
- a shuffled-`θ` control (trained weights permuted across features);
- a "memorise" control: training and test sets that share problems, compared with disjoint sets, to show that the
  gain is not memorisation.

## 6. Report, before generalising

The report states the exact operation, the learning update, every estimate and every result per arm, including null
and negative ones. It says whether trained `θ` beats baseline `θ` on fresh and transfer problems at equal knowledge and
budget, under each feedback regime, and how far the budget accounts for the difference. Only after Rex has read it are
Se, Si, Ne, Ni, Te, Fe and Fi taken up (Rex, §12.7).

## 7. Sources and estimates

- **Sources:** Davis, Logemann & Loveland 1962 (DPLL); Mitchell, Selman & Levesque 1992 and Crawford & Auton 1996
  (the hard region near ratio 4.26); Williams 1992 (REINFORCE).
- **Modelling choice (keeper):** Ti consistency as propositional satisfiability.
- **Estimates:**
  - `n` range;
  - family sizes;
  - `c_d`;
  - the reward shape and the unresolved penalty;
  - `λ`;
  - `p_miss`, `p_flip`;
  - the budgets;
  - the problem counts;
  - 40 seeds.
- **Open:**
  - Bud-Q1, the budget source;
  - Alloc-Q1, how confidence reaches allocation;
  - Stop-Q1, a general stopping rule, owned by core cognition and **not** used here: the search stops at its budget or
    its conclusion.
