# HANDOFF: cognition

## State
Units 2661–2662 done: package scaffold plus shared subjective types and belief store, exported from `src/index.ts`.
DESIGN.md approved by Rex (2026-10-30). Beliefs have conservative categorical Bayes, scalar Kalman updates,
detection/miss evidence, Beta-weighted testimony, time drift and posterior-to-prior KL attribution readout.

## Next
Units 2663–2672, in order, each adding its exports to `src/index.ts`. Read each unit's WORK file for its scope.

## Blocked
Nothing.

## Gotchas
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
- Integration with perception, memory and learning is left to units 2663, 2667 and 2668 as assigned. No sibling
  repositories were edited or audited: this work was restricted to the cognition folder.
- `tsconfig` has `types: []` (as economy) and there is no `@types/node`; `test/node-shim.d.ts` declares the few
  `node:fs`/`node:path` names the fence test uses. Extend the shim rather than adding a dependency.
- `include` lists `bench`, which does not exist yet; fine for tsc while `src` and `test` match.
- The fence test fails if `src/` has no files, so keep `src/index.ts`.
- Keeper's read guard blocked `../economy/*` until absolute paths were added to the WORK file's Read section.
