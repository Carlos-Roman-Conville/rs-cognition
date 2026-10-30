# HANDOFF: cognition

## State
Units 2661–2664 done: package scaffold, shared subjective types and belief store, attention, perception and episodic memory,
exported from `src/index.ts`.
DESIGN.md approved by Rex (2026-10-30). Beliefs have conservative categorical Bayes, scalar Kalman updates,
detection/miss evidence, Beta-weighted testimony, time drift and posterior-to-prior KL attribution readout.
Attention implements TVA weights, need-based pertinence and the identity/default personality hook. Perception
implements equal-variance SDT, categorical identification, Weber noise, declared false alarms and null evidence.

## Next
Units 2665–2672, in order, each adding its exports to `src/index.ts`. Read each unit's WORK file for its scope.

## Blocked
Nothing.

## Gotchas
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
