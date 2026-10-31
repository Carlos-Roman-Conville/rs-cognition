# HANDOFF: cognition

## State
Units 2661–2668 done: package scaffold, shared subjective types and belief store, attention, perception, episodic memory,
needs/goals, host-data action generation, expected-utility evaluation, selection/commitment and the null personality slot,
exported from `src/index.ts`, plus outcome learning and KL attribution, policy composition, the population reducer,
kernel Runner integration, the cognition process and kernel declarations.
DESIGN.md approved by Rex (2026-10-30). Beliefs have conservative categorical Bayes, scalar Kalman updates,
detection/miss evidence, Beta-weighted testimony, time drift and posterior-to-prior KL attribution readout.
Attention implements TVA weights, need-based pertinence and the identity/default personality hook. Perception
implements equal-variance SDT, categorical identification, Weber noise, declared false alarms and null evidence.

## Next
Units 2669–2672, in order, each adding its exports to `src/index.ts`. Read each unit's WORK file for its scope.

## Blocked
Nothing.

## Gotchas
- Unit 2668: `policy(o, m, n, p, theta, rng, t)` composes observation update, generation, evaluation and selection.
  `PolicyMemoryState` extends memory with an ephemeral `decision` context (host generation expressions, mind id,
  counters, context features, current intention). This supplies the affordances/bookkeeping required by §2.4
  without adding positional arguments or hiding mutable configuration. Its return has the §3 intention/trace/next
  plus updated counters. Returned memory and traces are serializable; host functions never enter saved state/logs.
  Observation updates require host-declared priors/support. Existence beliefs for the observed entity also receive
  detection evidence. Observation domain maps to `none` because the current Observation type has no domain tag.
- `createMindsState(seed)`, `reduceMinds(state, command, configs)` and `MindsRunner(state, configs)` implement
  `addMind`, `observe`, `tickNeeds`, `decide`, `outcome`. Configs bind pure generation/learning callbacks and the
  personality slot by configuration key. Commands contain data only. `addMind` mints mind and belief ids, and
  remints supplied episode histories into the population counter; `beliefIds` maps store keys to stable ids.
  `observe` applies evidence once; `decide` uses the resulting memory without applying it a second time.
  `tickNeeds` persists accumulator levels and accepts optional host-observed goal progress. Body signals remain
  supplied inputs; no chosen action directly changes physiology or goals.
- `CognitionProcess({ runner, bus, period, epoch, outcomeTypes, readOutcome, ... })` implements `cognition.tick`.
  The host MUST declare `cognition.tick` and its resolver ids in the existing default `cognition`/`host` phase lists
  (kernel defaults intentionally contain empty lists). Period is mandatory host Δ. `kernel.json` uses the symbolic
  `"period": "host"` for this configurable cadence; process construction supplies the positive integer milliseconds.
  Supply `position` if a custom scheduler order changes this process's rank; the default is cognition index, slot 0.
- `epoch` is the host sensory boundary: use its supplied per-mind perception stream with attention/perception,
  then return observations, need inputs, capacity, context and optional observed goal progress. The reducer records
  observations and the resulting perception stream word so replay requires no sensory callback. Stream state is
  owned by MindsState and restored with `streams(runSeed).get(mechanismId, 'cognition/mind.NNNN')`. Policy uses only
  decision.select: memory expectation uses retrieval probabilities without stochastic rehearsal, as unit 2664 specifies.
- Intention event payload ids are qualified `cognition/int.NNNN`; kernel EventBus ids are separately `evt.NNNNNN`.
  Host outcomes MUST cause the latter. The process reads by cursor, records the event-to-local-intention mapping,
  and logs unknown causes without decoding/applying feedback. Duplicate outcomes are also logged and ignored.
  `readOutcome` converts a recognized host event to perceived observations and optional completion/failure status;
  it must not expose objective feedback. Attribution events cause the outcome event. Delayed outcomes retain their
  original action/context/EU even after a new intention is chosen; commitment emits no duplicate intention event.
- Snapshot `process.state()` alongside the Runner state and EventBus state; pass it back as `from` when restoring.
  Cursor/mapping belong to the process/host, consistent with the kernel EventBus contract. Runner log replay by itself
  reproduces the entire MindsState and reducer emission history, including RNG and ignored-outcome diagnostics.
- Full `check-registry` is deferred until registry rows are ready, as the unit requests. `kernel.json` declares all
  14 §5 outputs, §8 baseline input ports, testimony input, and the three mechanism-only stream ids. Shape is tested;
  no claim of completed registry integration or empirical validation is made. Kernel Scheduler/EventBus/Runner
  integration is tested. Reality, Settlement and Economy declarations and package links, plus pirate economy adapter
  references, were reviewed read-only; sibling suites and end-to-end integrations remain with their owners.
- Unit 2668 scope follows the earlier units: the broad `Don't src/**, test/**` protects unrelated files; the
  explicitly requested composition modules/tests, public exports and handoff are the authorized exception.
- Unit 2668 verification: 26 focused tests pass. Final required gate passed: all seven required files present,
  all 163 tests across 16 files pass, and `npx tsc --noEmit` passes. Tests cover pure policy/subjective type fence,
  minting, JSON Runner replay, stream isolation, need/goal inputs, commitment/original EU, delayed/duplicate/unknown
  outcomes, Scheduler host integration, cursor restoration and declaration shape.
- Unit 2667: `learnOutcome(inputs, memory, view, counters, personality?)` validates the outcome's cause against
  this mind's intention id, computes `r_obs - EU(intention)`, updates declared latents once, attributes the
  largest posterior-to-prior KL, and encodes one episode. Supply the EU saved at intention formation (not a
  refreshed score), original action/context, observed feedback, and a pure subjective appraisal callback.
  The reducer owns event wrapping, outcome deduplication and intention completion; this function emits data.
- Learning adapters are host naive-model likelihoods over observations, not objective outcome inputs.
  Discrete likelihood arrays follow the existing categorical support (existence: present, absent); Gaussian
  adapters must supply a conjugate likelihood's mean/variance in the latent; reliability adapters supply
  observed Bernoulli evidence and its weight. All adapters/hooks read the same pre-update memory snapshot.
  Duplicate update targets or attribution ids are rejected. No source code branches on scenario/action names.
- Proposed learning conventions: discrete likelihood floor `1e-12`, attribution epsilon `1e-6` nats,
  effective inertia `min(1, interpret.eta * learning.rate)` with neutral base rate 1. Configured eta=0
  overrides hooks; with `encode: false`, memory and counters retain identity. Floor applies to likelihoods,
  never prior support. Equal/below-epsilon moves attribute chance; equal maxima use declared latent order.
  Beta reliability uses full Beta KL, not Bernoulli KL of its mean. Singular KL is tagged `"Infinity"`
  in traces; disabled half-life is `null`, keeping JSON lossless. Rate affects this outcome update; hook d
  and half-life are reported only, with future retrieval/drift wiring belonging to the personality layer.
- Unit 2667 integration verifies refusal lowers generosity, lost combat raises believed opponent strength
  relative to self, and exposed broken promise lowers Beta reliability. Identical later testimony is weighted
  by that changed reliability before entering the belief-only action model. Each case lowers subsequent EU
  and softmax choice probability, with separate belief-only and memory-only checks and a frozen control.
  Learning is level 4 and attribution level 5; these are formula/integration checks, not empirical validation.
  Independent V2 and benchmark validation remain with unit 2671 and the benchmark report. Sibling-repository
  validation was not performed under the folder-only rule. Existing mechanisms/specs were left intact;
  the requested module/tests and public export are the intended exception to the broad Don't globs.
- Unit 2667 verification: 17 focused tests pass. Final required gate passed: both files present,
  all 137 tests across 13 files pass, and `npx tsc --noEmit` passes.
- Unit 2666: `generateActions(inputs, view, personality?)` takes a host repertoire and a separate mandatory
  `wait` definition. The fallback's id is host data, with no reserved action id in the engine. It must have no
  prerequisites, zero capacity/cost and one epoch. The fallback is restored if a generate hook drops it.
  Candidate order is host order followed by the fallback, or the hook's declared order. Action/target pairs
  must be unique. Each prerequisite must independently meet `thetaPre` (proposed 0.5); no product or assumption
  of independent evidence is introduced. Capacity is the declared `body.capacity_functional` scalar.
- Candidate now includes target kind, capacity requirement, evaluated prerequisites and predicted outcome
  effects. `outcomeSpace` supplies outcome ids, predicted need deficits and absolute goal progress; missing
  keys leave current values unchanged. Its order must match the pure belief-only `naiveModel` distribution.
  These are predictions, never applied physiology or resolved outcomes. Unknown need/goal keys throw.
- `evaluateActions(generation, view, episodes, context, t, personality?)` reads the interpretation hook's
  `alpha0`, `lambda` and `confidence` per candidate domain. Memory remains the sole theory/experience blend.
  The host supplies matching episode context features (including target distinctions when relevant).
  Proposed confidence convention: multiply total success mass by confidence in [0,1], move removed mass to
  failures proportionally, or uniformly when failure mass was zero. A nonidentity confidence requires explicit
  boolean success flags on every outcome and at least one failure outcome; no outcome id implies success.
  `InterpretParams` also exposes eta, weberFraction and testimonyFloor; the last two are neutral zero placeholders
  at this evaluation-only call site, not perceptual or testimony defaults. `LearningParams` exposes rate, d,
  and beliefHalfLife in seconds. Wiring other mechanisms' interpret/learning hooks belongs to subsequent units.
- `selectAction(evaluation, { mind, counters, current? }, stream)` takes the kernel stream for
  `cognition.decision.select`. It returns intention data, updated kernel counters and a serializable SelectionTrace
  extending DecisionTrace; the reducer must wrap new intentions in kernel events. One draw is consumed for a
  re-choice, none for retained commitment. Completed/failed/impossible or absent candidates release commitment.
  DESIGN §10's explicit κ=0 re-choice requirement resolves §2.4's tie boundary; positive κ keeps at equality.
  A retained intention preserves its id, timestamp and original expectation; the trace records refreshed EUs.
  Trace `probability` is the effective distribution (a point mass if committed); `softmaxProbability` preserves
  the Luce distribution. Traces include P_hat before/after confidence, counts, reward terms, effective hook
  parameters, prerequisites/capacity, beliefs, need w/D/S/priority, goals, episodes/context and the draw.
- Unit 2666 evidence: Luce rule level 2, loss-aversion form level 2 and EU mapping level 4 as in DESIGN §2.4;
  commitment's quantitative threshold is level 5, not empirically validated. V4 mixed-gamble acceptance boundaries
  are formula verification only; independent V2/V4 validation remains pending. No sibling-repository audit was
  performed under the folder-only rule. The task's broad `Don't src/**, test/**` was interpreted as protecting
  unrelated mechanisms, with the explicitly requested modules, shared candidate/trace types and public exports
  authorized by the task. DESIGN.md and codex/RULES.md were not changed.
- Unit 2666 verification: 25 focused tests pass, including 100,000 choices within 3 SE of softmax, β=0/large β,
  equal and extreme EUs, κ boundaries, host filtering, null-hook byte identity, kernel replay/stream isolation,
  and observation→belief→memory→needs→candidate→EU→intention integration with named trace inputs.
  Final required gate passed: eight files present, all 120 tests across 12 files pass, and `npx tsc --noEmit` passes.
- Unit 2665: `evaluateNeeds(definitions, inputs)` returns felt needs in definition order; pass supplied
  signal deficits, the subjective belief store, previous accumulator levels, elapsed seconds, outcome tags,
  and attended cue memberships. Persist returned accumulator levels for the next interval. Missing inputs
  throw instead of silently manufacturing a need. Signal `level` is represented as setpoint + supplied deficit.
- `drive`, `driveReward`, and `goalReward` are exported from the package. Goal reward is additive to drive
  reduction; deadlines remain host metadata. Pressure never adds a second reward penalty.
- `data/needs.human.json` supplies the three benchmark rows. Its weights, setpoints, one-hour social rate,
  full reset on positive interaction, saturation, maximum membership across overlapping salience tags,
  and uniform zero-pressure priorities are proposed conventions, not empirical validation.
- Unit 2665: 12 focused tests and final gate (95 tests in eight files plus typecheck) passed.
  No sibling-repository audit was performed under the folder-only task rule.
- Unit 2664 API: `encodeEpisode(input, counters)` returns `{ episode, counters }`, minting local `ep.0001`
  ids with kernel prefix `ep` (kernel adds the dot). The encoding time is the first presentation;
  `episode.retrievals` contains only subsequent successful retrieval times. Records are immutable.
- `baseLevelActivation(episode, t, d?)`, `retrievalProbability(episode, t, params?)` and
  `retrieveEpisode(episode, t, stream, params?)` use milliseconds at the boundary and seconds in ACT-R.
  Retrieval takes `streams.get('cognition.memory.retrieve', mindId)`, consumes exactly one draw per attempt,
  and returns `{ episode, retrieved, probability }`; replace the episode in its existing mint-order slot.
  Proposed same-timestamp convention is the formula's `B = +Infinity`, `P = 1` limit; activation is finite
  one millisecond later. Future or out-of-order presentations are rejected. Log-sum-exp stabilizes activation.
- `outcomeExpectations(episodes, action, context, theory, t, params?)` returns `{ counts, distribution }`.
  Supply episodes in mint order and a subjective `CategoricalBelief` from the repertoire's naive model.
  Counts align with the theory's declared outcome order. Proposed context matching requires identical own
  feature keys and primitive values, independent of key insertion order; missing/extra features do not match.
  Prediction reads neither consume RNG nor rehearse episodes. Unknown outcomes on matching episodes throw.
  `alpha0 >= 0`; zero total counts give uniform probabilities. `d > 0`, finite `tau`, and `s > 0` are required.
  ACT-R's default `d = 0.5` cites Anderson & Lebiere (1998); existing `tau = 0`, `s = 0.4`, `alpha0 = 1`
  remain proposed configuration, not empirical calibration. V1 retention validation belongs to unit 2671.
- Unit 2664 scope: added memory implementation/tests and the required public export; existing mechanisms and
  the approved design are unchanged. No sibling-repository audit was performed under the folder-only task rule.
- Unit 2664 verification: 20 focused tests passed (formulas, zero/1 ms stability, immutable encoding/retrieval,
  stream replay/isolation, context matching, theory/experience counts and outcome-to-memory prediction change).
  Final gate passed: both required files present, all 83 tests in seven files passed, and `npx tsc --noEmit` passed.
- Unit 2663 API: `attentionCues(stimuli)` is the sensory-boundary projection; `allocateAttention(cues, categories,
  ctx, hook?)` returns aligned weights/shares plus pertinence. Categories declare `base` and need-id relevance;
  the hook matches DESIGN §3 and defaults to identity. Preserve host mint order in input arrays. Proposed salience
  mapping is `s = d'`; a zero total weight yields all-zero shares (no uniform fallback).
- `perceive(stimuli, shares, { k, weberFractions }, t, stream)` consumes only the supplied
  `streams.get('cognition.perception.detect', mindId)` handle, including identification and Box–Muller draws.
  `detectability` is the host's `body.detectability`, already adjusted for eyesight/hearing (DUP-37).
  Shares must align with locations and sum to at most one; zero attention emits nothing and consumes no draws.
  Positive attention emits either a reported observation or explicit null evidence.
- Absent locations are existing `Stimulus` records with `present: false`. Proposed false-alarm value convention:
  categorical reports are uniform over the declared support and ignore the placeholder `value`; for real absent
  rows `value` means a host-declared nominal phantom value, to which the same Weber noise is applied. Only declared
  locations can produce observations. Output metadata is copied explicitly; no truth/presence/relevance leaks out.
- Weber fractions are required host configuration, not researched universal channel defaults. Visual contrast and
  auditory loudness are distinct calibrations even in [Zhou et al. 2024](https://www.pnas.org/doi/10.1073/pnas.2312293121).
  Touch needs its measured attribute specified; the report channel has no physical Weber fraction. Test values
  are proposed fixtures. Empirical channel/attribute calibration remains with the host; this unit verifies the
  specified formulas and does not claim independent perceptual validation (V3 is verification in DESIGN §10).
- Unit 2663 verification: 31 focused tests cover TVA/hook behavior, zero attention, objective-input fence,
  kernel stream replay/isolation, perception→belief integration, and 100,000 seeded draws per SDT ROC condition,
  categorical identification condition and Weber channel condition, within three standard errors.
  Final 2663 gate passed: four required files present, all 63 tests in six files passed, and `npx tsc --noEmit` passed.
- Unit 2662 API: immutable `BeliefStore.entries` preserves global insertion order and serializes as ordinary data.
  `setBelief` retains the initial prior and origin on replacement; `getBelief` keys by `(about, attribute)`.
  `updateFromObservation` consumes subjective observations only. Existence is a separate attribute chosen by the
  caller; apply detection evidence to that entry as well as identification evidence to the observed attribute.
- Categorical values are strings; real beliefs are `{ kind: "gaussian", mean, variance }`. Null observations
  have `kind: "null"` and no value. Time inputs use kernel milliseconds; drift half-lives and q rates use seconds.
  `klDivergence(posterior, prior)` uses natural logarithms and aligns categorical supports by label.
- Proposed numerical boundary convention: evidence impossible under the entire prior leaves it unchanged.
  An exactly certain prior therefore cannot acquire zero-support alternatives without drift; use confident but
  nonzero false priors for correctable false knowledge. Equal point Gaussians have KL 0; singular mismatches
  return Infinity. Invalid/nonfinite inputs and arithmetic overflow throw RangeError instead of storing NaN.
- Cognitive parameters use ASCII names (`beta`, `lambda`, `gamma`, `eta`, `alpha0`, `d`, `tau`, `s`, `kappa`, `k`),
  with `n`, `m` for drive. Defaults cite the design or are marked proposed. `s = 0.4` is explicitly proposed,
  pending empirical calibration; the memory unit enforces `s > 0` and makes no empirical validation claim.
- Perception→belief integration is tested in unit 2663 and encoded outcome→prediction integration in unit 2664;
  full decision/learning integration remains with units 2667 and 2668 as assigned. No sibling
  repositories were edited or audited: this work was restricted to the cognition folder.
- `tsconfig` has `types: []` (as economy) and there is no `@types/node`; `test/node-shim.d.ts` declares the few
  `node:fs`/`node:path` names the fence test uses. Extend the shim rather than adding a dependency.
- `include` lists `bench`, which does not exist yet; fine for tsc while `src` and `test` match.
- The fence test fails if `src/` has no files, so keep `src/index.ts`.
- Keeper's read guard blocked `../economy/*` until absolute paths were added to the WORK file's Read section.
