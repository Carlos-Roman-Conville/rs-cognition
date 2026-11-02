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

**Government recognition port.** `recognition(beliefs, officeHandle, domain)` is a read-only provider for `government.port.recognition`: it reads P("true") from the categorical `mind.belief` entry `(officeHandle, "ought_obey:" + domain)`. `createRecognitionReader(lookup)` adapts host-supplied person stores and actor-to-handle mappings to `recognition(person, actor, domain)`. A `null` result means missing (excluded from Government's aggregates), including unknown people or unmapped actors; an existing zero probability remains zero. Invalid belief kinds or missing "true" categories throw. Cognition never writes beliefs for Government or imports it; beliefs form through existing belief updates and attribution from Government events delivered by the host as observations or testimony.

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

Supply `context.conversation` to track each partner's most probable term reading
within a conversation. Without a handle, messages are independent conversations.
An undeclared switch appears in the comprehension trace and in
`memory.equivocationCues`. At the next sensory epoch, convert those cues with
`equivocationStimuli`, combine them with external stimuli, and use the existing
`attentionCues`, `allocateAttention`, and `perceive` path. Include an `equivocation`
attention category with base 0. The optional final personality argument to
`allocateAttention` adds its interpret hook's `equivocationPertinence` (default 0).
The host consumes the latest cue batch once; no extra perception stream is used.

`memory.testimony` holds pending claims under the listener's most probable reading,
not the speaker's intended meaning. A later direct categorical observation settles
all older claims on that attribute, weighted by identification confidence `q`.
Reports and null detections do not settle claims. Settlements appear as
`observationTrace.credibility`, including prior, posterior and KL.

`persuasion` is a pure diagnostic for one utterance and one action/target. Supply
belief snapshots immediately before and after that utterance, the usual generation
and evaluation inputs, and explicit speaker claims for the counterfactuals. It
tracks the beliefs actually read by the action's naive model, evaluates one claim
at a time, and reports changed targets, candidate utilities, the largest positive
gap reduction and whether the message hit that objection. Counterfactuals put full
categorical mass on the claimed value; ties follow claim order. Missing alternatives
cannot be inferred from another mind. This record is returned to the caller only;
no decision code reads it.

### Encoding and conversations

Host utterance actions still compete through ordinary generation, evaluation and selection.
Set `MindConfig.communication.encode` to ordered `EncodePlan` records for those actions;
the selected plan builds `MindResult.message` (`world.message`) for the host to transmit.
Cognition does not perform transmission. Plans declare receivers, medium capacity (an integer
utterance count), bubble, conversation handle, ordered terms and atomic claim details.
An omitted detail value uses the speaker's categorical mode. Articulability defaults to 1;
the proposed discrete convention keeps `floor(details.length * articulability)` details,
then capacity truncates that prefix. Conversation handles scope the speaker's term bindings;
a conflicting binding requires an explicit definition or a different term.

Received observations can carry `context.intentionModel` (a categorical prior and an act
likelihood table in prior support order) and subjectively understood `context.links`.
Per-partner `memory.conversations` records shared topics and perceived intentions. Unknown
unlinked topics raise the existing confusion cue; intention evidence uses the existing
categorical update. Neither the sender's intended claim nor another mind's state supplies
the listener's shared topics: they come from its own resolved meanings.

Set `communication.conversations` to partner-specific turn and leave action references.
The decision trace records tolerance from their already-computed utilities, with initial
engagement willingness retained after the first turn. Leave is the comparison alternative,
excluded from the staying acts. These diagnostics do not choose actions or consume randomness.
Without communication inputs, existing decision traces retain their byte representation.

### Optional personality operations (DESIGN §22.4)

`PersonalityModel` optionally supplies `evaluationTerms`, `meaningSelection`,
`preconditionEvidence`, and `encoding`. Null and V1 models omit all four.
Evaluation receives base `Evaluation` records (including EU), and returns an aligned
array of labeled additive terms for each candidate. Meaning selection preserves the
ordered support and normalized probabilities. Precondition evidence receives the
candidate, prerequisite, believed probability, and this epoch's observations before
eligibility is tested; the model identifies relevant present evidence.
Encoding returns `strengths` keyed by cue and `tauEnc`; strengths below the threshold
are discarded. Such episodes match later contexts on their stored features alone.

Decision, observation, and learning traces expose `operations` with the model id as
`function`, hook name as `operation`, `executed`, and raw `output`. Evaluation terms
can additionally identify their contributing function. Empty operation arrays are
non-enumerable to keep legacy JSON traces byte-identical; serialized legacy traces
therefore omit the field (read an absent field as `[]`). Nonempty operations serialize.
The ten golden files were captured before these hooks were implemented.
