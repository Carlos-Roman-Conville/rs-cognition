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
  Tables 1–9 list fit statistics and logarithmic slopes, not the requested power-exponent
  range. `null` records unavailable evidence, never a zero or an invented bound.
- `v1-results.json` / `v2-results.json` are **simulated output**, not human data.
  Regenerate from the repository root with `node --experimental-strip-types validation/run.ts`.
  Runs have no wall-clock/random seed dependence. The script overwrites these two outputs.

The original TPT HTTP/HTTPS competition URLs were also attempted; see V2's access log.
Temporary downloaded papers were used for table inspection, not included as whole-paper copies.
