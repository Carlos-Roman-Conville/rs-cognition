# V2: repeated choice from experience (2026-10-30)

**Study executed; validation FAILED by a conservative bound on the published IBL criterion.**
All 120 tournament problems were run. Competition problem-level MSD is **0.03190005779**.
The exact IBL-comparable trial-level MSD remains **parked (C-Q7)** because human trial trajectories
were not recovered. It is nevertheless at least **0.005269671056**, allowing for rounding,
which exceeds `1.5 × 0.0005 = 0.00075`. This is a bound, not a fabricated trial-level score.

## Independent data and reference

[Erev et al. (2010), DOI 10.1002/bdm.683](https://openscholar.huji.ac.il/sites/default/files/agri_economics/files/2010_prediction_competition_dm_0.pdf),
Tables 1a/1b (pp.19–20/22–23), supply 60 estimation and 60 competition problems and
**E-repeated** risky-choice rates. Each rate aggregates 20 participants and 100 consequential
choices; feedback covers only the chosen payoff. [`data/tpt-2010.json`](data/tpt-2010.json)
contains the numeric data, source URL, extraction method and access date. No synthetic human data.

[Gonzalez & Dutt (2011), DOI 10.1037/a0024558](https://worthylab.org/wp-content/uploads/2018/05/gonzalezdutt2011_psychreview.pdf),
**Table 4, manuscript p.15**, reports repeated-choice IBL R-rate MSD **0.0005**. Its observational
units are **100 trials**, averaging people/problems first (pp.10–12, Appendix A), unlike the
tournament's 60 problem means. Tables B1/B2 cross-check all 120 rows' payoff magnitudes,
probabilities and rates, except competition problem 14 (.20 versus Erev's .21). Keeping Erev's
original value is the declared rule. Substituting .20 changes problem MSD to **0.03199454113**.
See [`data/SOURCES.md`](data/SOURCES.md). Neither the original ACT-R winner nor a later IBL
paper's different score is silently substituted for the requested reference.

## Protocol and engine integration

`validation/repeated-choice.ts` runs **200 independent simulated participants per problem ×
100 trials × 120 problems = 2,400,000 choices**, with fresh memory per person/problem.
Seed 2671 is fixed. Kernel streams are keyed by set/problem/person; selection uses
`cognition.decision.select`, lottery feedback uses a separate `validation.tpt.feedback` stream.
Candidate order is always A then B, with risky/safe button assignments counterbalanced by person.
All cognitive defaults remain unchanged; null personality applies. Full theta is in the output JSON.
No parameters were optimized on either dataset.

Each trial calls the actual **`evaluateActions` → `selectAction` → `encodeEpisode`** engine functions.
Selection consumes a real kernel draw. Evaluation calls the real `outcomeExpectations` and retrieval
probability mechanisms on all accumulated episodes. The host then resolves the chosen lottery and
encodes its displayed payoff once. No forgone payoff, true pH, hidden outcome support, human rate,
or world distribution enters the evaluator. Probability-weighted memory reads do not rehearse
episodes. No source changes or replacement decision algorithm are involved.

The experiment needs a monetary host adapter, not supplied by default theta. Proposed conventions,
fixed before the run:

- Both unseen buttons have a neutral zero-payoff prior, with existing `alpha0=1`. Only chosen
  feedback adds values to each button's subjective outcome support. Prior mass stays on zero;
  memory supplies the learned mass. There is no privileged safe/risky label in the mind.
- One displayed Sheqel equals one unit of goal reward. A utility goal with value 100, progress .5,
  and predicted progress `.5 + observedPayoff/100` gives exactly that reward for every payoff in
  the dataset. The reference resets per trial; this is an appraisal convention, not simulated wealth.
  Existing `lambda=2.25` handles losses and `beta=1` handles choice. Monetary scaling would change
  effective temperature; it was not calibrated.
- Trials are one second apart; feedback is encoded at the preceding decision timestamp, so it is
  one second old at the next decision. All actions last one epoch and complete before re-choice.
- This forced binary task directly supplies two candidates to evaluation. It does not call the
  repertoire generator, which would add a third wait action. There are no needs, costs, sensory
  errors, belief-latent updates, or personality hooks. This is the requested evaluation/selection/
  memory subsystem experiment, not a validation of the entire mind or perception/attribution.

These conventions are material limitations of the adapter; failure is retained rather than choosing
another prior, time scale, reward scale, or theta after looking at the human rates.

## Results and comparison

| Set | Problems | Human mean R-rate | Model mean R-rate | MSD across problems |
|---|---:|---:|---:|---:|
| Estimation | 60 | .395166667 | .460511667 | .04069519950 |
| Competition | 60 | .381000000 | .458592500 | .03190005779 |

Problem MSD is `mean_problem((mean_person,trial(modelRisk) - publishedHumanRiskRate)^2)`.
The 120 individual predictions, squared deviations, simulated trial rates, and participant-clustered
Monte Carlo SEs are in [`data/v2-results.json`](data/v2-results.json). Rounding each human rate to
two decimals yields competition problem-MSD bounds **[.03035593279, .03349418279]** for the
realized simulated rates. These are rounding bounds, not statistical confidence intervals.

Directly dividing .03190005779 by IBL's .0005 would compare different metrics and is not an
acceptance test. Instead, let `e_t` be the model-minus-human mean R-rate at trial t. Jensen's
inequality gives `mean_t(e_t²) >= mean_t(e_t)²`. Both studies give equal weight to all problems
and 100 trials, so the overall human mean is recoverable from the rounded problem means.
Allowing ±.005 human rounding error gives the competition bound
`max(0, abs(.4585925 - .381) - .005)^2 = .00526967105625`.
This is **7.0262 times** the proposed threshold .00075; the exact missing trial score cannot pass
for these simulated predictions. Using the G&D problem-14 value only increases the bound.

The Monte Carlo SE of the competition model's overall mean is .00253601, computed from
within-problem participant rate variances, treating independent streams as independent samples.
Even moving the model mean down by 1.96 SE and allowing .005 human rounding gives a lower
bound about **.004573**. This normal-approximation diagnostic is not an empirical human confidence
interval. Human trial dependence, shared participants across problems, and participant variability
cannot be reconstructed from table aggregates. The published IBL value is itself rounded.

## Access log, limitations and reproduction

The public paper tables were fetched successfully; the dataset is **not** parked as wholly missing.
Raw human trial trajectories remain unavailable after these attempts on 2026-10-30:

| URL | Outcome |
|---|---|
| `http://tx.technion.ac.il/~erev/Comp/Comp.html` | Browser fetch inaccessible; direct HTTP timed out |
| `https://tx.technion.ac.il/~erev/Comp/Comp.html` | Browser fetch inaccessible; direct HTTPS timed out |
| `https://economics.agri.huji.ac.il/sites/default/files/agri_economics/files/2010_prediction_competition_dm_0.pdf` | Browser timeout; direct fetch returned 581-byte HTML, rejected as PDF |
| `https://openscholar.huji.ac.il/sites/default/files/agri_economics/files/2010_prediction_competition_dm_0.pdf` | Web PDF text successful (Tables 1a/1b); direct fetch returned HTML |
| `https://dash.harvard.edu/bitstreams/7312037c-85e8-6bd4-e053-0100007fdf3b/download` | Web paper text available; direct download HTTP 429 |
| `https://worthylab.org/wp-content/uploads/2018/05/gonzalezdutt2011_psychreview.pdf` | Downloaded PDF; Table 4/B1/B2 inspected |

C-Q7 requests the raw repeated-choice data to compute the exact trial-level MSD and its uncertainty,
or a keeper-approved same-metric problem-level IBL reference. No source claim is made for a
problem-level IBL value from this 2011 paper. The failure bound is sufficient to reject the current
run, not to estimate the missing exact score or validate a revised model.

Run `node --experimental-strip-types validation/run.ts` from the repository root to regenerate
both JSON outputs. `npx vitest run test/validation-v2.test.ts`: **4 passed**. These verify table
coverage/signs, ignorance and chosen-feedback-only support, deterministic 100-trial execution using
the real engine, and metric aggregation; they are infrastructure checks, not a passing empirical gate.
