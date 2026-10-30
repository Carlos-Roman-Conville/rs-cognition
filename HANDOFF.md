# HANDOFF: cognition

## State
Units 2661–2663 done: package scaffold, shared subjective types and belief store, attention and perception,
exported from `src/index.ts`.
DESIGN.md approved by Rex (2026-10-30). Beliefs have conservative categorical Bayes, scalar Kalman updates,
detection/miss evidence, Beta-weighted testimony, time drift and posterior-to-prior KL attribution readout.
Attention implements TVA weights, need-based pertinence and the identity/default personality hook. Perception
implements equal-variance SDT, categorical identification, Weber noise, declared false alarms and null evidence.

## Next
Units 2664–2672, in order, each adding its exports to `src/index.ts`. Read each unit's WORK file for its scope.

## Blocked
Nothing.

## Gotchas
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
  pending the memory unit's source/range calibration; this unit makes no empirical validation claim.
- Perception→belief integration is tested in unit 2663; memory and learning integration remains with units 2667
  and 2668 as assigned. No sibling
  repositories were edited or audited: this work was restricted to the cognition folder.
- `tsconfig` has `types: []` (as economy) and there is no `@types/node`; `test/node-shim.d.ts` declares the few
  `node:fs`/`node:path` names the fence test uses. Extend the shim rather than adding a dependency.
- `include` lists `bench`, which does not exist yet; fine for tsc while `src` and `test` match.
- The fence test fails if `src/` has no files, so keep `src/index.ts`.
- Keeper's read guard blocked `../economy/*` until absolute paths were added to the WORK file's Read section.
