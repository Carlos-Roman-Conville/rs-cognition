# Function Activation Ledger (Rex, 2026-11-01; diagnostic tooling, not a mechanism)

**Purpose (Rex).** Make the personality theory's mathematics observable: for every simulated mind, which functions
activate, why they activate, how much they influence processing, and whether their observed behaviour matches the
intended definitions. It reverses the usual direction: inspect the simulated cognitive operations directly, then
see which behaviours they produce. It is **diagnostic tooling**, never a mechanism: the registry has no tooling
kind, so it is recorded as a note on `cognition.personality.eight_function` under the id
`cognition.diagnostics.function_ledger` (registry, 2026-11-01); it writes no `mind.*` quantity and changes no
decision. **F1–F13 are not modified while the initial scenario experiments run.**

## 0. Where it sits

- It reads the **existing** processing trace (scenarios DESIGN §9: pertinence shares, hook-modified parameters and
  belief deltas, generated set, EU per candidate, learning deltas) from the host log. **No second event or logging
  system**: the ledger is an analysis over the trace plus counterfactual reruns, in `bench/diagnostics/`.
- Two cost levels: **lightweight summaries** always (per run, per mind: counts and sums per function and hook) and
  **detailed traces** optional (per decision records), switched by the runner flag.
- Attribution of influence uses the ablation machinery of `bench/personality-versions.ts` (rerun the same seed with
  one function's hook contribution disabled), never inference from the final action alone.

## 1. The ledger record

For mind `i`, decision epoch `t`, function `f` (Se, Si, Ne, Ni, Te, Ti, Fe, Fi), processing hook `h`
(`pertinence`, `interpret`, `generate`, `learning`) and situation `s` (the stimulus domain tags and context present
at `t`):

| Field | Meaning | Source |
|---|---|---|
| `A_{f,h,s}` | activation: did function `f`'s contribution at hook `h` change the hook's output at `t` (count 1) | trace: hook input vs output, attributed per function by the version's per-function decomposition |
| trigger | which stimulus, task or internal state recruited it: the domain tags, cue categories and need priorities present at `t` | trace |
| attention allocation | the pertinence share moved by `f` (sum of absolute share changes) | trace, hook `pertinence` |
| interpretation contribution | the parameter and belief deltas attributable to `f` (η, α0, λ, confidence, reliability) | trace, hook `interpret` |
| action-generation contribution | candidates added, removed or reordered by `f` | trace, hook `generate` |
| `ΔU_{f,h,s}` | evaluation influence: the change in the chosen action's EU margin when `f`'s contribution at `h` is disabled, same seed, common random numbers | counterfactual rerun (ablation) |
| learning contribution | function-relevant experience accrued at `t` (the `E_f` increment of DESIGN §19 when `function_development` exists; until then the learning-delta magnitude in `f`'s domain) | trace, hook `learning` |
| stack position | dominant, auxiliary, tertiary, inferior for this mind's stack | configuration |
| eligibility | one of: activated; **eligible but did not activate** (relevant input present, no output change); **no relevant input** (no tag in `f`'s domain at `t`) | trace |
| result | the chosen action at `t` and the later learning update it caused | trace |

**Normalisation (Rex).** Activation frequency is reported **per relevant opportunity** (activations ÷ epochs with
relevant input), beside the raw count. Frequency measures usage; influence measures consequence; neither alone
establishes correctness.

## 2. Aggregated reports

By function; by personality stack; by scenario; by information domain (the trigger tags); by developmental stage
and upbringing (S5). Each report row carries: raw activations, opportunities, normalised frequency, mean
`ΔU_{f,h,s}` with a 95 % interval over seeds, learning contribution, and the eligibility split. Reports are JSON
plus a Markdown table; a dashboard reads the JSON (a separate UI unit).

## 3. Activation versus effectiveness (Rex)

Se activating 800 times and Ni 150 times says nothing about correctness. The ledger therefore pairs the activation
matrix with the **observed relevance map**: for each function, which information domains most often activate it
and with what influence. This observed map is compared with the **intended relevance map**
(`INTENDED-RELEVANCE.md`), which the ledger **never reads** and which no run may be tuned to match. A mismatch
(Se recruited as often during abstract rule evaluation as during spatial navigation; Ni rarely active but decisive
in long-horizon choices) is a finding for Rex's review of F1–F13, never an automatic adjustment.

## 4. Verification

Ledger invariants, tested: activations sum to the number of hook-output changes in the trace; ablation reruns
share the seed and streams of the base run (byte-identical when the disabled function never activated); a null
personality yields an all-zero ledger; the eligibility split partitions every (f, h, t); replay reproduces the
ledger byte for byte. No validation claim (level 5 tooling over a level-5 layer).

## 5. Open

| Id | Open | Whose |
|---|---|---|
| FL-1 | Per-function decomposition inside a hook when two functions of one stack move the same parameter: attribute by ablation (default) or by analytic share | keeper, proposed ablation |
| FL-2 | The cost ceiling for detailed traces in 200-seed runs | keeper; §11b |
| FL-3 | Whether the ledger's learning contribution becomes `E_f` directly once `function_development` is built | open (ties to C-Q21) |
