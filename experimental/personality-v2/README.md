# Personality V2 allocation

Experimental implementation of DESIGN §22.2–§22.3 and the allocation row of §22.4.
Select with `createPersonality` in `select.ts`; V1 requires its existing `options.etaMin`.
The null selection returns the existing null model. V2 uses only the public Cognition API,
including the V1 factory's read-only stack and weights. All engine hooks are currently identity.

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
