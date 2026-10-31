# HANDOFF: cognition

## State
Unit 2673 implements the opt-in eight-function personality v1, its 16 stacks, exact source
citations, explicit off hooks and 48 verification tests. `createEightFunctionV1` is exported;
the benchmark default remains `nullPersonality` under C-Q4. This is not baseline acceptance.
Units 2661–2669 done: package scaffold, shared subjective types and belief store, attention, perception, episodic memory,
needs/goals, host-data action generation, expected-utility evaluation, selection/commitment and the null personality slot,
exported from `src/index.ts`, plus outcome learning and KL attribution, policy composition, the population reducer,
kernel Runner integration, the cognition process and kernel declarations, plus the hungry-pair fixture and headless CLI.
Unit 2700 applies the keeper rulings to unit 2670; baseline acceptance remains parked for CB-7 lambda and the separate CB-6b audit, below.
Unit 2671's V1/V2 studies, source data and reports are present; V1 passes COG-14 after unit 2701; V2 remains parked (C-V2). No cognitive default or source mechanism was changed.
DESIGN.md approved by Rex (2026-10-30). Beliefs have conservative categorical Bayes, scalar Kalman updates,
detection/miss evidence, Beta-weighted testimony, time drift and posterior-to-prior KL attribution readout.
Attention implements TVA weights, need-based pertinence and the identity/default personality hook. Perception
implements equal-variance SDT, categorical identification, Weber noise, declared false alarms and null evidence.

## Next
Units 2670–2672, in order. Read each unit's WORK file for its scope.

## Blocked
Unit 2701 resolves V1's former evidence mismatch using keeper ruling COG-14.
V1 passes: power-fit R-squared 0.9999998331585509 >= Table 4 median 0.92 (51 recall datasets,
Rubin & Wenzel 1996, pp.744-745). Exponent 1.2460205614 is descriptive, compared with
Wixted & Ebbesen Figure 1 p.411 exponents 0.12/0.14; no exponent tolerance is asserted.
Unit 2671 remains **parked** for V2 only; its data, result and tests are unchanged.

- **V2 / C-V2 (C-Q7 data access):** recovered all 120 TPT problem/aggregate-rate rows from Erev (2010), Tables 1a/1b;
  executed 200 participants × 100 trials per problem with default theta. Competition problem MSD
  is .03190005779. Gonzalez & Dutt (2011) Table 4's IBL .0005 is a different, trial-level MSD.
  Exact comparison is parked pending raw human trial trajectories or an approved same-metric
  baseline. A rounding-aware Jensen lower bound on the trial MSD is .005269671056 > .00075
  (1.5 × IBL), so the current run **fails** even without the missing exact score. Both original
  Technion HTTP/HTTPS URLs timed out; paper-table data were fetched, not fabricated.
  Competition problem 14 is .21 in Erev, .20 in G&D; the original .21 is retained with sensitivity
  documented. Monetary appraisal, zero prior and one-second trials are proposed host conventions,
  not fitted defaults. See `validation/V1-forgetting.md` and `validation/V2-repeated-choice.md`.

Unit 2700 is **parked**, not baseline acceptance. COG-10 through COG-13 and C-B1
are implemented without changing DESIGN, defaults, physical consequences or the Kernel
stream contract. `bench/hungry-pair/REPORT.md` records the remaining blockers:

- **CB-7 / COG-13 lambda:** over unchanged paired seeds 1-200, lambda 2.25 to 4.5
  changes fight + steal frequency from .18625 to .18375: difference -.00250,
  approximate 95% interval [-.00743, +.00243]. The interval crosses zero, so the
  ruled interval-below-zero criterion is **FAIL**. Fight stays .08875; steal falls
  .09750 to .09500. Per-action frequencies are reported, not asserted. No tuning,
  extra seeds, favorable subset or weaker threshold was used.
- **CB-6b independent audit:** zero of one required independent Haiku semantic source
  audits is available. This task prohibits subagents; the audit remains with its
  designated check unit. The literal-ID guard passes but does not certify this
  requirement. Aggregate CB-6 is **FAIL** despite passing all its numerical checks.

Resolved: CB-3 exempts only explicit receipts censored at the actual run horizon;
unchanged non-horizon receipts still fail. CB-5a passes all 15 negative prediction-error
cases in the two diagnostic runs, using the perceived category's saved evaluator utility.
CB-6a transports initialized stream states with renamed minds in the harness. Symmetry
passes over 500 seeds: chi-square 9.7664301875, df 9, p .3697229536; 486 distinct sequences.
Learning-on vs frozen diverges in 31/200 eligible seeds (15.5%; Wilson [.11140, .21161]).
Beta, kappa and d directions pass.

Full studies now run through `npm run bench`: 500 symmetry seeds, 200 paired seeds for
each of ten dimensions, 200 frozen controls. The command writes REPORT.md and exits
nonzero for failed criteria. Vitest uses fixed study seeds 1-16 plus diagnostic seeds
1 (2 epochs) and 19 (8 epochs). Strict lambda and persisted-report assertions remain
failing, never skipped or marked expected failures. The report gate checks verdicts,
minimum 500/200/200 counts, git revision and a recursive SHA256 of current src/ paths
and text; the runner rejects source edits during a study. Its git revision is the
base commit; its source hash identifies the working source committed with the report.
The prior two-epoch protocol and fixed-context +1 day d probe are retained. No full
one-day population study or independent scene validation is claimed. Personality
remains gated by C-Q4; V2 remains separately parked above.

## Gotchas
- Unit 2700 API: `LearningInputs.evaluation` replaces scalar `expectedUtility`.
  Supply the selected `Evaluation` saved with the intention; `appraise` returns only
  `{ outcome }`. Reward is discount times the saved category utility; prediction error
  subtracts saved EU. Physical feedback remains host-owned.
- Unit 2700 verification: the hand-computed retrieval-mass property, original-EU
  retention, horizon-only exemption, ID transport and byte-identical CB-1 replay pass.
  The stale-report guard also rejected a real source-comment edit before regeneration.
  Final required gate: **267 passed, 2 failed / 21 files**, 31.84 s; failures are the
  strict lambda small-sample interval (upper .0108478894) and the report's CB-6/CB-7
  FAIL verdicts. `npx tsc --noEmit` passes. Final `npm run bench` took 82.77 s for
  the full studies and exited 1 after writing the honest FAIL verdicts. Source hash
  freshness passes after regeneration; `git diff --check` passes. Focused learning
  and mind tests: 28 passed. No servers, subagents, branch changes or remote push.
- Unit 2701 verification: focused V1 **3 passed**; required gate **235 passed / 20 files**
  (19.00 s), excluding the parked benchmark suite as instructed; typecheck and report
  Verdict-line checks pass. V2 remains C-V2.
- Unit 2701: V1 reference JSON records every Table 4 Pwr value, exact pages and median.
  `node --experimental-strip-types validation/run.ts --v1-only` reproduces V1 without
  rerunning V2. Historical 2671 missing-range statements below describe the superseded
  criterion. Source/default/spec files are unchanged.
- Unit 2673: `createEightFunctionV1(typeOrStack, { etaMin, context?, compound?, otherMind? })`
  implements DESIGN §9 W/DELTA/F1–F13. `etaMin` is required because §9 supplies no value.
  See `personality/eight-function/v1/README.md` for the adapter contracts and composition order.
  Callers supply subjective failure counts and cue/target/person/testimony tags. F9 requires
  a host compound model and declared outcome-to-precondition link; F10 requires the own policy
  run in the other's believed situation and a mapping of choices to outcomes. No compound
  probability, objective world transition, or extra cognitive formula is invented. Nested F10
  is disabled during self-simulation. Existing learning's infinite half-life sentinel is retained.
  Perception/testimony/retrieval/drift call sites are not newly wired or enabled by this unit.
  Named stacks all have four functions; shorter diagnostic stacks allow the requested all-off
  Fe/Ti/Fi case (there are only three off core functions), with unchanged ordinal weights.
  All citation headings and bold items are checked against the actual matrix via read-only fs;
  F1–F13 manifest forms are checked against DESIGN verbatim. All 16 stacks preserve motivations,
  weights, deficits and setpoints. Hungry-pair v1 policy runs one epoch and replays identically.
  T-1–T-3, fingerprinting and version-comparison tooling remain with later units, after the
  baseline passes. Sibling-repository validation was not run under the folder-only instruction.
  The explicit new files and public export are the intended exception to the broad Don't globs;
  no existing cognitive mechanism, DESIGN, rules, or matrix file was changed.
  Verification: all 48 focused tests and `npx tsc --noEmit` pass. The final required gate
  ran after correcting a comment caught by the objective-type source guard: required files
  exist; **259 passed, 6 failed**, 19 test files passed / two failed, 103.96 s. The remaining
  failures are the existing five unit-2670 acceptance blockers and unit-2671 V1 missing
  evidence; the source guard and all personality tests pass. The full gate remains blocked
  by those earlier units, not waived. No benchmark thresholds or existing tests were changed.
- Unit 2671: reproduce both numerical outputs with
  `node --experimental-strip-types validation/run.ts`; source/provenance and all 120 predictions
  live in `validation/data/`. V1's missing empirical bound is `null`, never a guessed number.
  Focused checks: 6 passed, 1 failed (V1 missing evidence); `npx tsc --noEmit` passes.
  Final required gate ran: all three required files exist; **211 passed, 6 failed**, 18 test files
  passed / two failed, 94.43 s. Failures are V1 plus the same five unit-2670 blockers (CB-3,
  CB-5a, exact CB-6a ID swap, CB-7 fight direction, runtime: 93.49 s > 60 s). The gate is
  FAILED, not waived. Final TypeScript and staged whitespace checks pass.
  The unit's “V1 test passes” condition is unmet; neither report existence nor infrastructure
  tests certify empirical validity. Source defaults, DESIGN and rules are unchanged.
  The explicitly requested validation/test files are the narrow exception to the task's broad
  Don't globs, consistent with prior units. Sibling-repository audits were not performed under
  the folder-only restriction. No servers, subagents, remote push, merge or branch switch.
- Unit 2670 final verification: focused acceptance suite **25 passed, 5 failed** (109.51 s);
  final required full gate **205 passed, 5 failed**, 17 files passed / one failed (99.94 s).
  All 180 pre-existing tests pass. The five failures are CB-3, CB-5a, exact CB-6a ID swap,
  CB-7's strict fight decrease, and the 60 s runtime assertion (98.94 s in the final gate).
  Required report/test files and the CB-7 marker exist. `npx tsc --noEmit` and staged
  whitespace checks pass. The native report generator completed (94.68 s study time).
  The gate is intentionally reported FAILED, not waived: no expected-failure/skip markers.
- Unit 2670 adds `test/bench-acceptance.test.ts`, shared executable diagnostics in
  `bench/hungry-pair/acceptance.ts`, and `report.ts` with minimal host Node declarations.
  Regenerate with `node --experimental-strip-types bench/hungry-pair/report.ts`.
  It executes 500 default seeds, 200 paired runs for each of all ten §3 theta dimensions,
  and 200 learning-frozen controls. All worlds run the existing Kernel/host replay checks.
  Eight Node worker threads are numerical workers, not AI subagents; results are ordered
  by seed. No persistent cache or precomputed result substitutes for test execution.
- CB-7 reports visitor action frequencies, causal success/failure/unfinished rates,
  final hunger/pain, entropy, switches and an isolated late-memory probe. Means and
  paired differences have approximate 95% intervals clustered by seed (t=1.972).
  CB-5b uses a Wilson interval: 31/200 seeds diverge after informative feedback (15.5%);
  32 pairs already differ by the first informative outcome because eta=0 freezes
  sensory belief updates as well. This contrast is not an isolated outcome-learning effect.
  CB-6a pooled Pearson chi-square p=.369723; repeated decisions and interacting A/B
  violate independent-draw assumptions, so its p-value is labelled descriptive.
- The report's "What this does not show" follows V5: no independent data, directions
  are consequences of formulas, and a laboratory scarcity game with a stronger owner
  (dictator/ultimatum and theft-option designs) is the proposed independent experiment.
  Reality, Settlement, Economy and pirate-ship validation was not possible under the
  folder-only scope; Kernel integration is exercised through the linked public package.
- Unit 2669: `bench/hungry-pair/world.ts` exports `HungryPairWorld`, `runHungryPair`, `FIXTURE` and
  `fightProbability`. `models.ts` contains the host repertoire, belief-only naive models, proposed priors,
  learning adapters and subjective outcome forecasts. `run.ts` runs 144 ten-minute epochs and writes canonical
  JSON; use `node --experimental-strip-types bench/hungry-pair/run.ts --seed 1 [--param beta=2]` on Node 24.
  The README labels every stand-in and its future owner. No `src/`, spec or rule files were changed.
- All three participants are engine minds. Owner responses and later keep/break choices are intentions;
  requests, three-epoch work, six-epoch travel, perception-based theft detection, Bradley–Terry contests and
  two-day injuries resolve only in the host. Outcomes cause Kernel intention event ids; payloads also carry
  the qualified Cognition id. At horizon, unresolved actions are explicitly censored as `unfinished`, and
  feedback is flushed without a 145th physiology/decision epoch. Censored jobs remain visible in final state.
- The fixture composes public belief drift and subjective forecast projection before the public reducer.
  Complete diagnostics live outside the frequently cloned Runner state; completed intention records are
  removed after feedback, while unresolved records retain their original EU. The append-only command/event
  logs preserve all decisions/outcomes. This fixture-specific compaction does not change the engine reducer.
- Every run restores the initial snapshot, replays the Kernel cognition input log and checks decisions,
  reducer events/state, then replays the host input log (including sensory detection results) and checks
  world history, outcomes and fixture RNG state. No simulation randomness comes from wall time or Math.random.
- Proposed conventions requiring future replacement are documented in the fixture README: eating at hunger
  >= .25, .3 pain, additive injury, sensory/receipt parameters, volatile opportunity beliefs, learning
  likelihoods and finite-horizon censoring. The eating trigger is not a resolution of pending C-R2. Owner
  goal normalization preserves one value per stock unit, including recovered food beyond the original six.
- Unit 2669 verification: 17 focused tests pass; final required gate passes (180 tests across 17 files,
  required files present, `npx tsc --noEmit`). The native Node CLI also completed 144 epochs with seed 1 and
  `--param beta=2`, including replay. Food conservation, hunger bounds, one causal outcome per intention,
  delayed interactions, all resolution branches, sensory theft detection and canonical determinism are tested.
  These are verification, not validation. Larger CB-5/CB-6/CB-7 studies and sibling-engine integration remain
  with later units/owners; no sibling repository suites were run under the folder-only task scope.
- Unit 2669 follows prior scope interpretation: explicitly requested benchmark/test files are exceptions to
  the broad Don't globs. Only the final required gate ran the entire suite; development runs used the new test.
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
