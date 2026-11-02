# Personality V2 allocation

Experimental implementation of DESIGN §22.2–§22.3 and the allocation row of §22.4.
Select with `createPersonality` in `select.ts`; V1 requires its existing `options.etaMin`.
The null selection returns the existing null model. V2 uses only the public Cognition API,
including the V1 factory's read-only stack and weights. Hooks are identity unless an operation is configured.

Call `model.allocation(ctx)` with a `V2Context` extending the existing `MindView`:
`mind` is the host's mind ID, `attended` contains subjective categories and attended weights,
`candidates` contains candidate domains, and `trace: { allocations: [] }` collects snapshots.
Use the existing need `definition.category` as its domain tag. Unknown categories have zero
relevance. Attention and evaluation shares have separate denominators; if all four shares
are zero, allocation omits that relevance term, but experience still receives zero practice.

`allocation` reads experience without advancing it. Call `advance(ctx, dt)` exactly once per
elapsed practice interval (host units, consistently used); it records the pre-step allocation
and applies `E += A.eval * R.eval * dt` simultaneously. Do not call both merely to obtain
one trace record. Callers attach `ctx.trace.allocations` to their experimental trace: the
existing engine does not automatically carry these fields or advance experience.

Experience belongs to `model.state.minds[mind].E`, outside memory. Save this serializable
state and supply it as `options.state` to resume. Input snapshots are copied.
Defaults and category mappings are explicit untuned estimates in `data.json`;
Habit follows FUNCTION-DESIGN §4.6, superseding DESIGN §22.3:
`H = 1 + h * (1 - exp(-E / E_0))`, with estimated `h = 1` (unsourced, H-Q2)
and `E_0 = 22`. Lally et al. 2010 supports the asymptotic shape and median 66 daily
repetitions to approximately 95% of the plateau. The mapping of one full-allocation,
full-relevance epoch to one repetition remains open (H-Q1). Saturation adds no decay (C-Q21).
Experience remains traced; allocation records expose no competence value or execution gain.

<!-- FUNCTION-DESIGN §4.7: competence is an external measurement (Evaluate_f), never
stored in the mind. The mind's θ_f per function is built operation by operation,
starting with the Ti experiment (experimental/ti-mechanism/). -->

Per FUNCTION-DESIGN §4.7, competence is measured externally by `Evaluate_f`. The mind's
`θ_f` is built operation by operation, starting with `experimental/ti-mechanism/`;
this allocation module retains experience for habit. Confidence is a belief, never a meter.

The test-only `mask` disables named function/operation pairs through `operationEnabled`.
It does not disable allocation or practice. Operations check both positive allocation
and `operationEnabled`. Ni remains open.
Invalid/nonfinite inputs or results fail before state/trace writes, including motivation
too large to serialize as a finite number. No memory, needs or shared parameters are changed.

Fe audience interpretation (FUNCTION-DESIGN §6.4, corrected direction) is available through
`comprehendV2(view, message, context, model, ctx)` in `fe.ts`. This experimental wrapper
uses the existing public comprehension and meaning selection API; the engine does not
automatically call it. It records allocation once, without advancing experience.
Supply `context.audience` as `{ listener, bubble }[]` in host mint order, representing the
mind's subjective identification of each listener's bubble. Each returned utterance has
an optional `audienceMap`, an ordered entry per listener with its separate §5.1 distribution.
An unknown term has `distribution: null`; listeners sharing a bubble still have separate entries.
The map also appears as a snapshot in the result's Fe `meaningSelection` execution record.
It is absent when there are no listeners, Fe has zero evaluation allocation or is absent
from the stack, or `{ function: "Fe", operation: "meaningSelection" }` is masked.
Fe's own `meaningSelection` hook returns its input unchanged. Audience distributions are
never pooled or scaled. No EU term or
expression rule is added; response selection remains open (Fe-Q2).

Te external reconfiguration runs through `model.generate` when `options.te` is supplied.
Its `context(mind)` returns a `TeContext`: the usual allocation context plus an existing
`activeGoal` ID, the host's kernel `random` streams and an `operations` trace array.
Its `compound(a, b, mind)` supplies the subjective candidate model for two ordered
eligible repertoire entries (or undefined). As in V1, the host owns joint outcome and
precondition semantics; Te never invents a world transition. The existing
`V1CompoundCandidate.steps` shape records the supplied entries' action/target IDs.
All ordered pairs are considered in repertoire order, including repeated steps if the
host supports them. Allocation context should describe this decision's candidates.

Candidates with positive expected progress on the active goal are ranked by
`expected progress / cost / duration`; ties preserve repertoire order. Proposed boundary
convention: positive progress at zero cost ranks first. Missing progress retains current
goal progress, matching the core evaluator. Existing action/target identities are skipped
and additions are deduplicated. The host must supply feasible compound preconditions and
capacity requirements; the core generation boundary applies its usual feasibility checks.
No original candidate is removed, no goal is created and shared parameters are unchanged.

DESIGN §22.7 / Num-Q1 supplies the estimated count `2*A.eval`, rounded stochastically
using `cognition.personality.v2.Te.generate` scoped by mind. Only fractional counts draw;
save/restore the host kernel streams alongside V2 state for replay. Available distinct
compositions cap the realised additions. Execution records snapshot goal, expected count,
rounded count and added candidates. Mask `{ function: "Te", operation: "generate" }`
disables execution; absent goals, absent Te and zero allocation are inert. No competence
gain, learning strategy, new memory store or Ni operation is introduced.

Ne branching runs through `model.generate` when `options.ne` is supplied. Its
`context(mind)` returns a `NeContext` with the existing subjective `episodes`, current
episode `context`, kernel `random` streams and an `operations` trace array. Its
`compound(a, b, mind)` follows Te's host-owned composition contract. The host must
assign a stable action ID to each ordered pair, distinguishing targets when needed:
existing episodes identify actions by that ID, not by a separate pair-memory store.

Ne ranks supported ordered pairs by `1 / (1 + matching episode count)`, with ties in
repertoire order. Counts are raw episodes, independent of outcomes and retrievals.
Legacy contexts use the public exact `contextMatches` convention; episodes with
encoding strengths condition only on their stored features, as in core expectations.
No episodes or needs are changed. Repeated steps are allowed when the host supports them.

The expected count is `2*A.eval`, stochastically rounded with the mind-scoped stream
`cognition.personality.v2.Ne.generate`; only fractional counts consume a draw. Save
the host's streams for replay. Mask `{ function: "Ne", operation: "generate" }`
disables execution; absent Ne and zero allocation are inert. Execution snapshots
record context, expected/rounded counts, novelty ranking and additions. Competence
has no effect. Available distinct compositions cap additions, and the core generation
boundary still checks feasibility.

When both Te and Ne are configured, Te runs first. Ne uses the original repertoire
and skips identities already supplied by Te; neither builds on the other's additions.
This explicit ordering preserves two-entry compositions and prevents duplicates.

Se immediate response runs through `preconditionEvidence` when `options.se` is supplied.
Its `context(mind)` returns a `SeContext` with the current epoch `t` and an `operations`
trace array. Because core observations have no present tag and preconditions are host
expressions, `isPresent(observation)` supplies the subjective tag, and
`probability(candidate, precondition, observations)` supplies the host's subjective
precondition probability (or undefined when no matching cue exists). It receives only
present-tagged observations with `observation.t === context.t`, in input order. The
host owns matching and combination semantics; no objective `Stimulus.present` is read.

Se applies `p' = (1 - A.att_Se) * p_belief + A.att_Se * p_present` (DESIGN §22.7 /
Num-Q1), without gain or clipping. Invalid present probabilities fail. Missing cues,
absent Se, zero attention allocation and mask `{ function: "Se", operation:
"preconditionEvidence" }` leave the probability unchanged. Execution snapshots include
the filtered cues, epoch, action/precondition, input probabilities, share and output.
Beliefs, needs, experience and shared parameters remain unchanged; the existing core
generation boundary still checks every precondition and capacity. Hosts must supply
the current epoch on every call; Se keeps no observation cache or competence effect.
