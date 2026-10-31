# V1: single-episode forgetting (2026-10-30)

**PARKED: simulation and fitting completed; the specified empirical acceptance range is unavailable
in the cited tables.** The raw-scale fitted decay exponent is **1.2460205614**, but no honest
in-range/out-of-range judgment can be made. The required empirical assertion fails explicitly
on missing evidence. This is not a passing validation or evidence of an empirical exponent failure.

## Method and data

`validation/forgetting.ts` calls the real `encodeEpisode` and `retrievalProbability` implementations.
Each delay uses an independently tested single encoding at time zero, with no rehearsal or earlier
successful retrieval added. Retention is the exact expected proportion retrieved in a homogeneous
cohort (Bernoulli probability); it is not a finite Monte Carlo sample. This avoids fitting arbitrary
pseudocounts when long-delay retrieval counts would be zero. Delay enters the engine in milliseconds;
the fitted time variable is seconds. A year means 365 days.

Default theta is unchanged: `d=0.5`, `tau=0`, `s=0.4`; other defaults are saved in
[`data/v1-results.json`](data/v1-results.json). The 17 delays were fixed before fitting. Fit
`retention = A * seconds^(-b)` by unweighted least squares on **untransformed retention**.
Eliminate A analytically at each b, bracket the minimum on a 0.01 grid over b in [0,10], then
refine by golden-section search. These are optimizer bounds, **not** an empirical tolerance.
The optimizer rejects a boundary optimum. A log-log fit is reported only as a sensitivity check.

| Fit | A (seconds) | b (positive decay exponent) | Raw-scale R² |
|---|---:|---:|---:|
| Untransformed least squares | 0.9780527278 | 1.2460205614 | 0.9999998332 |
| Log-log least squares | 0.9971740552 | 1.2497889098 | not the raw-scale objective |

Raw-scale SSE is `6.15234502845e-12`. All modeled delay/probability pairs are stored in
the JSON above. Selected values:

| Delay | Expected retention probability |
|---|---:|
| 1 minute | 0.005952754381 |
| 5 minutes | 0.0008002961511 |
| 1 hour | 0.00003585967095 |
| 1 year | 0.0000000004231474628 |

Under DESIGN §2.3, a single encoding gives `B=-d*ln(t)` and hence
`P=1/(1+exp(tau/s)*t^(d/s))`. Thus the long-delay exponent approaches `d/s=1.25`,
not the activation-decay parameter `d=0.5`. A strong power fit is mathematical consistency,
not independent human validation; neither A nor b is used to retune the engine.

## Source audit and blocked comparison

[Rubin & Wenzel (1996), DOI 10.1037/0033-295X.103.4.734](https://users.cs.northwestern.edu/~paritosh/papers/KIP/100YearsOfForgetting.pdf)
fits 210 datasets with 105 functions (DESIGN reverses these counts). Its p.736 explains fitting
untransformed retention. Tables 1–9 report fit statistics. In particular, **Table 4, pp.744–745
(recall)**, is the closest broad task family; **Table 3, p.743 (recognition)** and **Table 5,
p.746 (savings, including Ebbinghaus)** do not supply a power-exponent range either.
The `Pwr` entries are **R²**. The parenthesized `m` belongs to **Log(m)**, the logarithmic
function, not the power function. Table 4 and Table 5 were visually checked, not inferred
from ambiguous extracted columns. Those numbers cannot be relabeled as exponents.

The machine-readable evidence record is [`data/v1-reference.json`](data/v1-reference.json),
with `exponentRange: null`. HANDOFF Blocked requests a comparable, sourced exponent range,
or keeper approval to replace this criterion with an independently fitted human retention dataset.
No alternative paper, savings-to-recall mapping, material grouping, or tolerance was silently substituted.

## Uncertainty, verification and reproduction

The expected curve has no Monte Carlo standard error. The 0.00376835 difference between fitting
objectives is a sensitivity diagnostic, not a confidence interval. Time spacing and fitting objective
affect a power approximation to this logistic curve. There is no human sampling interval, material
calibration, or one-year extrapolation validation here. A single generic episode does not itself
define a laboratory recall/recognition task. Retrieval strengthens an episode in the engine; testing
the same episode repeatedly would answer a different question.

`npx vitest run test/validation-v1.test.ts`: **2 passed, 1 failed**. The failing assertion is the
requested empirical-range check; it has no skip or expected-failure marker. Passing checks verify
the delay coverage and fit an independent known power curve, including invariance of b to time units.
Regenerate numeric output with `node --experimental-strip-types validation/run.ts` (also runs V2).
No source/default/specification changes were made. The unit's “V1 test passes” completion condition
is **not met** and cannot be certified without resolving the evidence mismatch.

Final required full gate: **211 passed, 6 failed** in 94.43 s. This V1 evidence assertion is
one failure; the other five are the pre-existing unit-2670 benchmark blockers documented in
HANDOFF. All three required gate files exist. `npx tsc --noEmit` passes.
