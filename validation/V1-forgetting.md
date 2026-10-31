# V1: single-episode forgetting (2026-10-30)

**PASS under COG-14:** raw-scale power-fit R-squared **0.9999998331585509** exceeds the
Table 4 median **0.92**. Exponent **1.2460205614** is descriptive, not asserted.
Default theta and unit-2671 delays are unchanged.

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

## Independent reference and descriptive exponent comparison

[Rubin & Wenzel (1996)](https://users.cs.northwestern.edu/~paritosh/papers/KIP/100YearsOfForgetting.pdf),
**Table 4, printed pp.744-745 (PDF pages 11-12), Pwr column**, supplies 51 recall-dataset
R-squared values. Their unweighted median is **0.92** (26th sorted value). The summary row M is
excluded: its **0.88** is a mean. This is the specified Table 4 reference, not a median
over all 210 datasets. Published two-decimal values are used without an added tolerance.
Both pages were visually checked. Dataset identifiers, pages, values and aggregation rule
are in [`data/v1-reference.json`](data/v1-reference.json). Pwr contains fit quality;
Log(m) contains logarithmic slopes, not power exponents.

[Wixted & Ebbesen (1991)](https://wixtedlab.ucsd.edu/publications/wixted/Wixted_and_Ebbesen_(1991).pdf),
**Figure 1, printed p.411**, labels word-recall power curves with positive decay exponents
**0.12** (5-second study) and **0.14** (1-second study). These were fetched and visually
checked, not estimated from plotted points. Table 2 supplies fit quality, not exponents;
the figure equations are descriptive context only. The asserted reference comes exclusively
from Rubin & Wenzel Table 4.

The simulated exponent **1.2460205614** is larger than both. This is not a matched protocol:
the human task uses six-word lists, distractors and 2.5-40-second delays; the model uses
a generic single episode and 1-minute to 365-day delays. No exponent range or tolerance
is asserted, and this comparison does not establish material-specific human calibration.

## Uncertainty, verification and reproduction

The expected curve has no Monte Carlo standard error. The 0.00376835 difference between fitting
objectives is a sensitivity diagnostic, not a confidence interval. Time spacing and fitting objective
affect a power approximation to this logistic curve. There is no human sampling interval, material
calibration, or one-year extrapolation validation here. A single generic episode does not itself
define a laboratory recall/recognition task. Retrieval strengthens an episode in the engine; testing
the same episode repeatedly would answer a different question.

Run `npx vitest run test/validation-v1.test.ts`. Reproduce V1 alone with
`node --experimental-strip-types validation/run.ts --v1-only`; omitting the flag also runs V2.
The test recomputes the median from the transcribed rows and asserts R-squared >= median.
No source/default/specification changes were made. V2 remains parked under C-V2.

Verification: focused V1 tests **3 passed**; required gate **235 passed across 20 files**
(19.00 s), excluding `test/bench-acceptance.test.ts` as instructed. Report existence and
Verdict-line checks pass. `npx tsc --noEmit` passes.

Verdict V1: PASS
