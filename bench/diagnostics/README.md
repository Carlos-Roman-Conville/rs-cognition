# Function Activation Ledger

Diagnostic analysis of the existing S1 processing trace and common-random-number
counterfactual runs. No engine outputs, formulas, parameters or decisions are added
or changed in the original run. See HANDOFF.md for the remaining blockers.

## Dashboard

Static, offline viewer for `ledger-report.json` (schema `function-ledger-report/v1`) and
optional detailed ledger exports (`function-ledger/v1` with `records` for hook-level rows).

```powershell
# From repo root — open in a browser (file://, no server required)
start bench/diagnostics/dashboard/index.html
```

Use **Ledger report JSON** to load output from a run (`bench/scenarios/s1-forage/out/ledger-report.json`)
or **Reload sample** for hand-authored illustrative data in `sample-ledger.json`. The page never reads
`INTENDED-RELEVANCE.md`; comparing observed versus intended relevance maps stays a human review step.

## Run

```powershell
node --experimental-strip-types bench/scenarios/s1-forage/run.ts --seeds 8 --stacks all --ledger summary
node --experimental-strip-types bench/scenarios/s1-forage/run.ts --seeds 8 --stacks all --ledger detailed
node --experimental-strip-types bench/scenarios/s1-forage/run.ts --seeds 8 --stacks null --ledger off
npx vitest run test/diagnostics-ledger.test.ts test/scenario-s1.test.ts
npx tsc --noEmit
node --experimental-strip-types bench/diagnostics/benchmark.ts
```

Summary is the execution default. Existing host records still go to stdout; enabled
ledger output goes to `bench/scenarios/s1-forage/out/ledger-SEED-VERSION-STACK.json`.
The runner also writes `ledger-report.json` and `ledger-report.md`. It creates a local
ignore file before writing outputs. Off writes no ledger files. Old outputs are not
deleted; the report covers only the current invocation, not directory contents.

For an existing completed run, call `buildLedger(run, "summary" | "detailed")`.
`buildReport(ledgers)`, `reportJSON(report)` and `reportMarkdown(report)` are pure
aggregation/rendering functions. Reports have no filesystem dependencies and use
only observed ledger data. Tests prohibit imports or reads of the hypothesis map.
Unknown versions fail closed until an explicit diagnostic adapter exists.

## Records and summaries

Every detailed record identifies a mind, epoch, function and hook, and contains:

- `activation` (0/1), `changedHookCalls`, `eligibility`, stack position and formula
  group disabled. Activation is one when at least one invocation of that hook has a
  different output under same-input ablation. A scale-only pertinence change counts
  even if normalized attention and the action stay unchanged.
- Observed domain/cue `triggerTags`, domain names and traced need priorities. Presence
  of a tag is context, not evidence that each tag caused the activation.
- `attentionMoved`: sum of absolute changes in normalized cue shares; interpretation
  parameter deltas summed by name; explicit null for missing observation belief
  deltas; added/removed/reordered generation candidates and parameter magnitude.
- `learningContribution`: sum of outcome-update KL magnitudes in the function's
  implemented domain when its learning hook activated. This is neither incremental
  causal KL nor developmental E_f. The detailed record references the existing
  later learning updates. Singular KL fails explicitly instead of silently becoming
  zero or JSON null.
- `deltaU`: base chosen action's EU margin minus that same action's margin in the
  ablated run. The competitor is the strongest other action/target at that epoch.
  The action can have a negative margin (selection is stochastic). A missing chosen
  action or competitor gives null, excluded from influence means with `deltaUCount`
  reported. No invented zero or infinity fills a missing counterfactual.

Summary retains per-run totals and per-mind/function/hook counts and sums, plus tag
co-occurrence summaries for the report. It omits decision records. Summary and detailed
use the same attribution and reruns and have identical totals. Frequencies are
activations / relevant opportunities, zero for an empty denominator. Function-level
reports pool hook opportunities, not distinct epochs. Eligibility partitions every
function/hook/epoch: activated, eligible-not-activated, or no-relevant-input. Inactive
functions and the null control still have opportunities when their domain is present.
Generation parameters have their own magnitude total even when no candidate changed.

Reports group by function, version/stack/function, scenario/function and observed
domain/tag. The observed relevance map crosses function and tag; tag rows overlap
and must not be summed as disjoint observations. Developmental stage and upbringing
are explicit empty report arrays (null in run ledgers). Mean influence and its 95%
Student t interval use equally weighted **seed means**, pooling stacks/minds/epochs
within each seed. Fewer than two seeds gives no interval. Critical values are exact
through ten degrees of freedom, conservatively held at df=10 for larger samples;
the interval is descriptive, not a validation claim.

## FL-1 attribution

V1 exposes whole-formula switches through `comparisonV1`, not per-function switches.
The adapter reuses that machinery and extends it to S1's subjective cue context.
No frozen formula is tuned. The mapping follows the executable frozen v1, including
F10/F11/F12's Ni behavior (not scenario prose assigning those formulas differently).

| Hook | Formula-to-function fallback |
|---|---|
| pertinence | F2 shared by all present functions; F4 to Se/Ne/Te in its cue domain; F6 to Se |
| interpret | F1/F3 shared by all present functions; F7 to domain owners Se/Si, Ne/Ni, Te; F6 Se; F12 Ni; F13 Te |
| generate | F9 Ne, F10 Ni, F11 jointly Ne/Ni |
| learning | F4 to Se/Ne/Te by domain; F5 to Si/Ni by domain; F8 Si |

Absent functions switch nothing. Shared whole-formula interventions overlap: these
rows **must not be interpreted as additive independent causal shares**. For F7, both
owners disable the whole formula if present. Ti/Fe/Fi have no own enabled domain
formula in frozen v1, though present functions participate in collective attitude
formulas. An active shared formula is a relevant internal-state opportunity outside
the function's nominal domain. F9/F10 have no S1 host adapters and F11 sees kappa=0.

Activation uses original hook inputs and context. Influence reruns the full trajectory
from the same seed, snapshot and named streams, disabling only the selected hook's
formula group. Thus ΔU can include earlier learning or policy divergence; it is not
an isolated current-epoch treatment effect. The base chosen action is held fixed in
the margin comparison. Interpretation does not fabricate the absent observation
update trace. The smallest missing public fields/switches are listed in HANDOFF.md.

Identical masks share one execution; a mask that changes no hook output anywhere on
the base trajectory reuses the original run by deterministic induction. Otherwise
an actual full-world rerun occurs. The adapter stores no second event log. Its hook
wrappers return ablated outputs and normalize the original recorder's existing hook
entries to those returns. Captured context is the sensory adapter's public subjective
metadata. Restoration uses the public kernel snapshot API.

## Cost

The reproducible benchmark measures three seeds, frozen v1/ESTP, 12 epochs, with a
two-epoch warmup. `COST.json` contains raw milliseconds, output sizes and rerun counts.
Measurements exclude JSON serialization and file I/O; base time includes S1's built-in
replay, while diagnostic reruns are single executions. No timing enters a ledger.

Measured on Windows/Node in this workspace: **410–447 ms added per epoch** (mean
429 ms), including **six** counterfactual worlds per ESTP run. Analysis excluding
reruns added **47–54 ms per epoch** (mean 51 ms). The baseline including replay took
80–137 ms per epoch. Summary files were 103 kB versus about 5.24 MB detailed; measured
detailed analysis took 274–406 ms per epoch (warmup/scheduling variation, not a claim
that retaining details is intrinsically cheaper). This is a small three-seed timing
sample, not a cross-machine guarantee.

Summary memory
retains only counters, domain buckets and counterfactual margins beyond the existing
host log; it does not retain every counterfactual trace. Detailed output additionally
retains decision records (including their learning-update references).

The analysis has a fixed eight functions × four hooks and scans the existing trace;
work is proportional to trace size. Exact influence requires additional world
executions even in summary mode. Consequently this build does **not** claim that the
requested lightweight always-on overhead has been achieved. The keeper needs to
approve a numeric ceiling or a separate influence-study cost level; no such change
to the spec is made here.
