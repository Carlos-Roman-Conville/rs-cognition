# Validation data provenance (unit 2671, accessed 2026-10-30)

- `tpt-2010.json`: Erev et al. (2010), DOI [10.1002/bdm.683](https://doi.org/10.1002/bdm.683),
  Tables 1a/1b, printed pp.19–20/22–23. [Fetched PDF text](https://openscholar.huji.ac.il/sites/default/files/agri_economics/files/2010_prediction_competition_dm_0.pdf).
  All 60 estimation and 60 competition problems; H, pH, L, M and **E-repeated** R-rate.
  Units: Israeli Sheqels, probabilities as fractions. Rates are published rounded aggregates,
  not participant records. No sampling/description rates substitute for repeated choice.
- Cross-check: Gonzalez & Dutt (2011), DOI [10.1037/a0024558](https://doi.org/10.1037/a0024558),
  [author manuscript mirror](https://worthylab.org/wp-content/uploads/2018/05/gonzalezdutt2011_psychreview.pdf),
  Tables B1/B2 (manuscript pp.27–29). All 120 rows' payoff magnitudes, probabilities and
  repeated-choice rates agree except competition problem 14: Erev .21, G&D .20.
  Keep the original Erev .21; the report supplies sensitivity to .20. Minus signs come from
  Erev's PDF text (U+0001), not from the G&D text extractor, which drops minus glyphs.
  Visually checked the G&D competition table and its signs. The original table's dominance
  footnote marker U+0002 is removed from numeric problem IDs.
- G&D Table 4 (manuscript p.15): repeated-choice IBL R-rate MSD **0.0005**, over **100 trials**.
  It is not an MSD across 60 problems; see manuscript pp.10–12 and Appendix A.
- `v1-reference.json`: Rubin & Wenzel (1996), DOI
  [10.1037/0033-295X.103.4.734](https://doi.org/10.1037/0033-295X.103.4.734),
  [paper](https://users.cs.northwestern.edu/~paritosh/papers/KIP/100YearsOfForgetting.pdf).
  Unit 2701: Table 4, Pwr column, printed pp.744-745, all 51 recall-dataset rows;
  unweighted median R-squared = 0.92, excluding M (mean = 0.88). Both pages visually checked.
  Row-level transcription and aggregation rule are stored in the reference JSON.
- Descriptive exponent context: [Wixted & Ebbesen (1991)](https://wixtedlab.ucsd.edu/publications/wixted/Wixted_and_Ebbesen_(1991).pdf),
  DOI 10.1111/j.1467-9280.1991.tb00175.x, Figure 1 p.411: word recall exponents 0.12
  (5-second study) and 0.14 (1-second study), visually checked. These figure-equation
  parameters are not Table 2 fit quality and are never asserted validation bounds.
- `v1-results.json` / `v2-results.json` are **simulated output**, not human data.
  Regenerate from the repository root with `node --experimental-strip-types validation/run.ts`.
  Add `--v1-only` to regenerate only V1. Runs have no wall-clock/random seed dependence. The script overwrites these two outputs.

The original TPT HTTP/HTTPS competition URLs were also attempted; see V2's access log.
Temporary downloaded papers were used for table inspection, not included as whole-paper copies.
