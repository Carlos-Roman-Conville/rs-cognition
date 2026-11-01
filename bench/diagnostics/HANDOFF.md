# Function ledger handoff (2918)

## Blocked

- **Observation belief deltas:** S1 explicitly emits `observationBeliefDeltas: null`.
  Hook parameter deltas and outcome-learning prior/posterior deltas are available, but
  the former do not reconstruct the missing observation updates. The ledger preserves
  null. Smallest engine addition: include the observation update's existing prior and
  posterior (with observation/cue identity) in the public observe result/trace; the host
  can then copy it into its existing processing trace. No second event log is needed.
- **Strict independent function attribution:** frozen v1 has no per-function disable
  switch. F1/F2/F3 depend jointly on stack attitude; F7 and F11 also combine functions.
  The permitted fallback is implemented: whole-formula groups mapped to functions,
  with shared groups explicitly overlapping. These are diagnostic interventions, not
  an additive decomposition. The sum of activations counts changed function-group/hook/
  epoch tuples, not the number of aggregate hook calls in the original trace. Strict
  additive per-function attribution cannot be claimed. Smallest public extension:
  define and expose a per-function/per-hook mask in the v1 factory, including the
  treatment of the shared attitude denominator; alternatively publish the requested
  decomposition with an explicit interaction convention. This requires a keeper
  decision about shared formulas, not an inferred attribution by this tooling.
- **Lightweight summary cost:** summaries avoid retaining decision records and reuse
  identical formula masks and provably inactive executions, but exact full-trajectory
  counterfactuals still cost several additional worlds. See README/COST.json for the
  measured cost. The requested small constant overhead is not claimed achieved.
  Dropping reruns would drop the requested mean ΔU; this implementation does not
  silently substitute zero or approximate it. A keeper must set a numeric ceiling
  or authorize separating influence studies from always-on summaries.

This handoff is inside `bench/diagnostics/` because the task's explicit changed-path
gate excludes the root HANDOFF.md. No engine, personality formula, parameter, design,
or hypothesis file was changed. There was no S1 README at the requested path.

## Integration notes

- `rerunAblation` wraps the existing public S1 personality recorder, captures only its
  subjective V1Context, and normalizes that same trace to the actual returned outputs
  after each epoch. It does not access private fields, introduce an event log, or
  expose world truth to cognition. The original run remains untouched.
- It restores the supplied initial snapshot and RNG state, including custom layouts.
  Its return is the existing S1 run shape. It intentionally does not claim S1's
  unmodified replay method has installed an ablation; tests rerun the ablated adapter
  itself. Unmodified S1 replay is tested separately for byte-identical ledgers.
- Eligibility includes shared attitude input as an internal-state opportunity for
  present functions, even outside their own information domain. Absent functions
  retain domain opportunities. A null personality has zero **effects**, while its
  opportunities and eligibility remain observable rather than falsely zeroed.
- Tests use eight seeds, ESTP and ISTJ, three consecutive S1 epochs; the existing S1
  gate covers twelve-epoch runs. The cost benchmark uses twelve-epoch runs.
- S1 output creates its own ignored `out/.gitignore` containing `*` before writing
  artifacts. This satisfies the output-ignore requirement without editing paths the
  task gate forbids. The file ignores itself and all generated output.
