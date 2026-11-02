# S1 forage analysis

Records: 3400 (200 seeds × 17 configurations)

Source commits: fixture 31c81c6; ledger 1c0c36c.

Source SHA256: e7109b12ab3bc9768b8d9f899a53cd40861d75b49ce1ef453a177ee3216edf90

Source hash uses hungry-pair/report-integrity.ts sourceHash (sorted src paths and LF-normalized contents), measured at analysis time; the reduced inputs do not embed a run-time source hash.

| Input | Bytes | Lines |
| --- | --- | --- |
| bench/scenarios/s1-forage/out/s1-200.metrics.jsonl | 20575537 | 3400 |
| bench/scenarios/s1-forage/out/s1-24-ledger.metrics.jsonl | 2469472 | 408 |
| bench/scenarios/s1-forage/out/ledger-report.json | 142776 | 5377 |
| bench/scenarios/s1-forage/out/ledger-report.md | 23468 | 247 |

Run commands (keeper-produced inputs; no simulation rerun for this analysis):

```sh
node --experimental-strip-types bench/scenarios/s1-forage/run.ts --seeds 200 --stacks all --ledger off
node --experimental-strip-types bench/scenarios/s1-forage/run.ts --seeds 24 --stacks all --ledger summary
```

Both stdout streams were filtered to scenario, seed, configuration, metrics, replayed. Full traces were not retained. Reproduction/filter and analysis commands are in ../README.md.

## Metrics by configuration

Means give each seed equal weight; zero-denominator shares retain the fixture's zero convention. Inspect share uses successful gathers with an unused same-patch inspection; novel share uses successful moves; best-known return uses moves after a yield sample, past-mean ranking and mint-order ties; food is resolved gathered units.

| Configuration | inspectBeforeGatherShare | novelPatchVisitShare | bestKnownReturnRate | foodGathered |
| --- | --- | --- | --- | --- |
| null | 0.307916667 | 0.345107143 | 0.0533333333 | 1.545 |
| v1/ENFJ | 0.300833333 | 0.333285714 | 0.0534166667 | 1.455 |
| v1/ENFP | 0.3 | 0.33775 | 0.0519166667 | 1.465 |
| v1/ENTJ | 0.300833333 | 0.333285714 | 0.0534166667 | 1.455 |
| v1/ENTP | 0.3 | 0.33775 | 0.0519166667 | 1.465 |
| v1/ESFJ | 0.314166667 | 0.343702381 | 0.0529166667 | 1.505 |
| v1/ESFP | 0.279166667 | 0.343922619 | 0.055 | 1.57 |
| v1/ESTJ | 0.314166667 | 0.343702381 | 0.0529166667 | 1.505 |
| v1/ESTP | 0.279166667 | 0.343922619 | 0.055 | 1.57 |
| v1/INFJ | 0.295416667 | 0.334702381 | 0.0536666667 | 1.43 |
| v1/INFP | 0.318333333 | 0.341916667 | 0.0541666667 | 1.49 |
| v1/INTJ | 0.295416667 | 0.334702381 | 0.0536666667 | 1.43 |
| v1/INTP | 0.318333333 | 0.341916667 | 0.0541666667 | 1.49 |
| v1/ISFJ | 0.307916667 | 0.345107143 | 0.0533333333 | 1.545 |
| v1/ISFP | 0.300416667 | 0.334785714 | 0.0513333333 | 1.475 |
| v1/ISTJ | 0.307916667 | 0.345107143 | 0.0533333333 | 1.545 |
| v1/ISTP | 0.300416667 | 0.334785714 | 0.0513333333 | 1.475 |

Across stacks: 8 distinct joint behavioral metric vectors; 8 byte-identical unordered stack pairs out of 120. Null is excluded from pair counts. Equality is canonical JSON of numeric values in seed and metric order, not raw input whitespace. This compares measured behavior, not full action trajectories.

| Metric | Distinct stack vectors | Identical stack pairs |
| --- | --- | --- |
| inspectBeforeGatherShare | 8 | 8 |
| novelPatchVisitShare | 8 | 8 |
| bestKnownReturnRate | 8 | 8 |
| foodGathered | 8 | 8 |

## Paired differences from null

Each cell is mean [two-sided 95% interval], stack minus null with the same seed and yield stream. Independent units are seeds. seedInterval uses Student t with df=n−1 and its conservative df=10 critical value for larger samples (2.228139): all n=200; halves split at seed 100. No multiple-comparison correction.

### All seeds

| Stack | inspectBeforeGatherShare | novelPatchVisitShare | bestKnownReturnRate | foodGathered |
| --- | --- | --- | --- | --- |
| v1/ENFJ | -0.00708333333 [-0.0494649265, 0.0352982598] | -0.0118214286 [-0.034300089, 0.0106572318] | 0.0000833333333 [-0.0145630272, 0.0147296939] | -0.09 [-0.212540011, 0.0325400107] |
| v1/ENFP | -0.00791666667 [-0.0422298004, 0.026396467] | -0.00735714286 [-0.0226067, 0.00789241426] | -0.00141666667 [-0.0114711329, 0.00863779956] | -0.08 [-0.194291929, 0.0342919286] |
| v1/ENTJ | -0.00708333333 [-0.0494649265, 0.0352982598] | -0.0118214286 [-0.034300089, 0.0106572318] | 0.0000833333333 [-0.0145630272, 0.0147296939] | -0.09 [-0.212540011, 0.0325400107] |
| v1/ENTP | -0.00791666667 [-0.0422298004, 0.026396467] | -0.00735714286 [-0.0226067, 0.00789241426] | -0.00141666667 [-0.0114711329, 0.00863779956] | -0.08 [-0.194291929, 0.0342919286] |
| v1/ESFJ | 0.00625 [-0.0170714793, 0.0295714793] | -0.0014047619 [-0.0134373056, 0.0106277818] | -0.000416666667 [-0.00768553188, 0.00685219855] | -0.04 [-0.108557692, 0.0285576924] |
| v1/ESFP | -0.02875 [-0.0718775951, 0.0143775951] | -0.00118452381 [-0.0311049955, 0.0287359478] | 0.00166666667 [-0.0133014564, 0.0166347897] | 0.025 [-0.126858756, 0.176858756] |
| v1/ESTJ | 0.00625 [-0.0170714793, 0.0295714793] | -0.0014047619 [-0.0134373056, 0.0106277818] | -0.000416666667 [-0.00768553188, 0.00685219855] | -0.04 [-0.108557692, 0.0285576924] |
| v1/ESTP | -0.02875 [-0.0718775951, 0.0143775951] | -0.00118452381 [-0.0311049955, 0.0287359478] | 0.00166666667 [-0.0133014564, 0.0166347897] | 0.025 [-0.126858756, 0.176858756] |
| v1/INFJ | -0.0125 [-0.0506198131, 0.0256198131] | -0.0104047619 [-0.0276374344, 0.00682791064] | 0.000333333333 [-0.0112314805, 0.0118981472] | -0.115 [-0.236504972, 0.00650497186] |
| v1/INFP | 0.0104166667 [-0.0208128013, 0.0416461347] | -0.00319047619 [-0.0172256486, 0.0108446963] | 0.000833333333 [-0.00856556609, 0.0102322328] | -0.055 [-0.147366167, 0.0373661669] |
| v1/INTJ | -0.0125 [-0.0506198131, 0.0256198131] | -0.0104047619 [-0.0276374344, 0.00682791064] | 0.000333333333 [-0.0112314805, 0.0118981472] | -0.115 [-0.236504972, 0.00650497186] |
| v1/INTP | 0.0104166667 [-0.0208128013, 0.0416461347] | -0.00319047619 [-0.0172256486, 0.0108446963] | 0.000833333333 [-0.00856556609, 0.0102322328] | -0.055 [-0.147366167, 0.0373661669] |
| v1/ISFJ | 0 [0, 0] | 0 [0, 0] | 0 [0, 0] | 0 [0, 0] |
| v1/ISFP | -0.0075 [-0.049602961, 0.034602961] | -0.0103214286 [-0.0365530662, 0.0159102091] | -0.002 [-0.0160080401, 0.0120080401] | -0.07 [-0.18978086, 0.0497808597] |
| v1/ISTJ | 0 [0, 0] | 0 [0, 0] | 0 [0, 0] | 0 [0, 0] |
| v1/ISTP | -0.0075 [-0.049602961, 0.034602961] | -0.0103214286 [-0.0365530662, 0.0159102091] | -0.002 [-0.0160080401, 0.0120080401] | -0.07 [-0.18978086, 0.0497808597] |

### Seeds ≤ 100

| Stack | inspectBeforeGatherShare | novelPatchVisitShare | bestKnownReturnRate | foodGathered |
| --- | --- | --- | --- | --- |
| v1/ENFJ | -0.0333333333 [-0.0849818463, 0.0183151796] | 0.00126190476 [-0.0293540157, 0.0318778252] | 0 [-0.0199248868, 0.0199248868] | -0.02 [-0.20187165, 0.16187165] |
| v1/ENFP | -0.0325 [-0.0713671955, 0.00636719552] | 0.00492857143 [-0.0162856708, 0.0261428137] | -0.00866666667 [-0.0264369913, 0.00910365795] | -0.07 [-0.212529842, 0.0725298423] |
| v1/ENTJ | -0.0333333333 [-0.0849818463, 0.0183151796] | 0.00126190476 [-0.0293540157, 0.0318778252] | 0 [-0.0199248868, 0.0199248868] | -0.02 [-0.20187165, 0.16187165] |
| v1/ENTP | -0.0325 [-0.0713671955, 0.00636719552] | 0.00492857143 [-0.0162856708, 0.0261428137] | -0.00866666667 [-0.0264369913, 0.00910365795] | -0.07 [-0.212529842, 0.0725298423] |
| v1/ESFJ | -0.0075 [-0.0380608006, 0.0230608006] | 0.00416666667 [-0.0113065208, 0.0196398542] | -0.000833333333 [-0.0154071316, 0.0137404649] | -0.06 [-0.148561111, 0.0285611113] |
| v1/ESFP | -0.0308333333 [-0.0886326791, 0.0269660125] | -0.000571428571 [-0.0434818809, 0.0423390237] | 0.00716666667 [-0.0132093236, 0.0275426569] | 0.02 [-0.244927261, 0.284927261] |
| v1/ESTJ | -0.0075 [-0.0380608006, 0.0230608006] | 0.00416666667 [-0.0113065208, 0.0196398542] | -0.000833333333 [-0.0154071316, 0.0137404649] | -0.06 [-0.148561111, 0.0285611113] |
| v1/ESTP | -0.0308333333 [-0.0886326791, 0.0269660125] | -0.000571428571 [-0.0434818809, 0.0423390237] | 0.00716666667 [-0.0132093236, 0.0275426569] | 0.02 [-0.244927261, 0.284927261] |
| v1/INFJ | -0.0383333333 [-0.0899427242, 0.0132760576] | 0.000928571429 [-0.0237022271, 0.02555937] | -0.0045 [-0.0256515206, 0.0166515206] | -0.11 [-0.268014065, 0.0480140652] |
| v1/INFP | -0.0175 [-0.0552213566, 0.0202213566] | 0.00492857143 [-0.0153180595, 0.0251752024] | -0.00416666667 [-0.0205153442, 0.0121820109] | -0.03 [-0.141766473, 0.0817664732] |
| v1/INTJ | -0.0383333333 [-0.0899427242, 0.0132760576] | 0.000928571429 [-0.0237022271, 0.02555937] | -0.0045 [-0.0256515206, 0.0166515206] | -0.11 [-0.268014065, 0.0480140652] |
| v1/INTP | -0.0175 [-0.0552213566, 0.0202213566] | 0.00492857143 [-0.0153180595, 0.0251752024] | -0.00416666667 [-0.0205153442, 0.0121820109] | -0.03 [-0.141766473, 0.0817664732] |
| v1/ISFJ | 0 [0, 0] | 0 [0, 0] | 0 [0, 0] | 0 [0, 0] |
| v1/ISFP | -0.0216666667 [-0.0833124784, 0.039979145] | -0.00323809524 [-0.0422376826, 0.0357614921] | 0.00166666667 [-0.0186013298, 0.0219346631] | -0.06 [-0.254760304, 0.134760304] |
| v1/ISTJ | 0 [0, 0] | 0 [0, 0] | 0 [0, 0] | 0 [0, 0] |
| v1/ISTP | -0.0216666667 [-0.0833124784, 0.039979145] | -0.00323809524 [-0.0422376826, 0.0357614921] | 0.00166666667 [-0.0186013298, 0.0219346631] | -0.06 [-0.254760304, 0.134760304] |

### Seeds > 100

| Stack | inspectBeforeGatherShare | novelPatchVisitShare | bestKnownReturnRate | foodGathered |
| --- | --- | --- | --- | --- |
| v1/ENFJ | 0.0191666667 [-0.0477990423, 0.0861323756] | -0.0249047619 [-0.0577204004, 0.00791087663] | 0.000166666667 [-0.021406357, 0.0217396904] | -0.16 [-0.323703479, 0.00370347851] |
| v1/ENFP | 0.0166666667 [-0.0395656999, 0.0728990332] | -0.0196428571 [-0.0413156846, 0.00202997028] | 0.00583333333 [-0.0034054566, 0.0150721233] | -0.09 [-0.269414844, 0.0894148436] |
| v1/ENTJ | 0.0191666667 [-0.0477990423, 0.0861323756] | -0.0249047619 [-0.0577204004, 0.00791087663] | 0.000166666667 [-0.021406357, 0.0217396904] | -0.16 [-0.323703479, 0.00370347851] |
| v1/ENTP | 0.0166666667 [-0.0395656999, 0.0728990332] | -0.0196428571 [-0.0413156846, 0.00202997028] | 0.00583333333 [-0.0034054566, 0.0150721233] | -0.09 [-0.269414844, 0.0894148436] |
| v1/ESFJ | 0.02 [-0.0151230512, 0.0551230512] | -0.00697619048 [-0.025402274, 0.0114498931] | 0 [0, 0] | -0.02 [-0.12493995, 0.0849399495] |
| v1/ESFP | -0.0266666667 [-0.0909810019, 0.0376476685] | -0.00179761905 [-0.0437223066, 0.0401270685] | -0.00383333333 [-0.0257989902, 0.0181323235] | 0.03 [-0.120070804, 0.180070804] |
| v1/ESTJ | 0.02 [-0.0151230512, 0.0551230512] | -0.00697619048 [-0.025402274, 0.0114498931] | 0 [0, 0] | -0.02 [-0.12493995, 0.0849399495] |
| v1/ESTP | -0.0266666667 [-0.0909810019, 0.0376476685] | -0.00179761905 [-0.0437223066, 0.0401270685] | -0.00383333333 [-0.0257989902, 0.0181323235] | 0.03 [-0.120070804, 0.180070804] |
| v1/INFJ | 0.0133333333 [-0.0424463614, 0.0691130281] | -0.0217380952 [-0.0457026677, 0.00222647718] | 0.00516666667 [-0.00421159362, 0.014544927] | -0.12 [-0.305421499, 0.0654214989] |
| v1/INFP | 0.0383333333 [-0.0108576883, 0.087524355] | -0.0113095238 [-0.0306844141, 0.00806536643] | 0.00583333333 [-0.0034054566, 0.0150721233] | -0.08 [-0.227458333, 0.0674583329] |
| v1/INTJ | 0.0133333333 [-0.0424463614, 0.0691130281] | -0.0217380952 [-0.0457026677, 0.00222647718] | 0.00516666667 [-0.00421159362, 0.014544927] | -0.12 [-0.305421499, 0.0654214989] |
| v1/INTP | 0.0383333333 [-0.0108576883, 0.087524355] | -0.0113095238 [-0.0306844141, 0.00806536643] | 0.00583333333 [-0.0034054566, 0.0150721233] | -0.08 [-0.227458333, 0.0674583329] |
| v1/ISFJ | 0 [0, 0] | 0 [0, 0] | 0 [0, 0] | 0 [0, 0] |
| v1/ISFP | 0.00666666667 [-0.0508321493, 0.0641654826] | -0.0174047619 [-0.0526226021, 0.0178130783] | -0.00566666667 [-0.0250760666, 0.0137427332] | -0.08 [-0.220492205, 0.0604922047] |
| v1/ISTJ | 0 [0, 0] | 0 [0, 0] | 0 [0, 0] | 0 [0, 0] |
| v1/ISTP | 0.00666666667 [-0.0508321493, 0.0641654826] | -0.0174047619 [-0.0526226021, 0.0178130783] | -0.00566666667 [-0.0250760666, 0.0137427332] | -0.08 [-0.220492205, 0.0604922047] |

## Classification

Operational definition by the keeper, pending Rex (verbatim): for each stack × metric, `stable` if the paired-difference interval excludes zero over all 200 seeds and in both seed halves with the same sign; `context-dependent` if the interval excludes zero in exactly one half, or over all seeds while the halves disagree in sign; `none` otherwise.

For the second context-dependent clause, halves disagree in sign when their paired means have opposite signs. Zero is not a sign; an unavailable interval does not exclude zero.

| Stack | Metric | Seeds differing from null | Classification |
| --- | --- | --- | --- |
| v1/ENFJ | inspectBeforeGatherShare | 27 | none |
| v1/ENFJ | novelPatchVisitShare | 36 | none |
| v1/ENFJ | bestKnownReturnRate | 12 | none |
| v1/ENFJ | foodGathered | 28 | none |
| v1/ENFP | inspectBeforeGatherShare | 19 | none |
| v1/ENFP | novelPatchVisitShare | 23 | none |
| v1/ENFP | bestKnownReturnRate | 8 | none |
| v1/ENFP | foodGathered | 21 | none |
| v1/ENTJ | inspectBeforeGatherShare | 27 | none |
| v1/ENTJ | novelPatchVisitShare | 36 | none |
| v1/ENTJ | bestKnownReturnRate | 12 | none |
| v1/ENTJ | foodGathered | 28 | none |
| v1/ENTP | inspectBeforeGatherShare | 19 | none |
| v1/ENTP | novelPatchVisitShare | 23 | none |
| v1/ENTP | bestKnownReturnRate | 8 | none |
| v1/ENTP | foodGathered | 21 | none |
| v1/ESFJ | inspectBeforeGatherShare | 10 | none |
| v1/ESFJ | novelPatchVisitShare | 10 | none |
| v1/ESFJ | bestKnownReturnRate | 3 | none |
| v1/ESFJ | foodGathered | 10 | none |
| v1/ESFP | inspectBeforeGatherShare | 32 | none |
| v1/ESFP | novelPatchVisitShare | 56 | none |
| v1/ESFP | bestKnownReturnRate | 17 | none |
| v1/ESFP | foodGathered | 42 | none |
| v1/ESTJ | inspectBeforeGatherShare | 10 | none |
| v1/ESTJ | novelPatchVisitShare | 10 | none |
| v1/ESTJ | bestKnownReturnRate | 3 | none |
| v1/ESTJ | foodGathered | 10 | none |
| v1/ESTP | inspectBeforeGatherShare | 32 | none |
| v1/ESTP | novelPatchVisitShare | 56 | none |
| v1/ESTP | bestKnownReturnRate | 17 | none |
| v1/ESTP | foodGathered | 42 | none |
| v1/INFJ | inspectBeforeGatherShare | 23 | none |
| v1/INFJ | novelPatchVisitShare | 31 | none |
| v1/INFJ | bestKnownReturnRate | 11 | none |
| v1/INFJ | foodGathered | 27 | none |
| v1/INFP | inspectBeforeGatherShare | 15 | none |
| v1/INFP | novelPatchVisitShare | 18 | none |
| v1/INFP | bestKnownReturnRate | 6 | none |
| v1/INFP | foodGathered | 16 | none |
| v1/INTJ | inspectBeforeGatherShare | 23 | none |
| v1/INTJ | novelPatchVisitShare | 31 | none |
| v1/INTJ | bestKnownReturnRate | 11 | none |
| v1/INTJ | foodGathered | 27 | none |
| v1/INTP | inspectBeforeGatherShare | 15 | none |
| v1/INTP | novelPatchVisitShare | 18 | none |
| v1/INTP | bestKnownReturnRate | 6 | none |
| v1/INTP | foodGathered | 16 | none |
| v1/ISFJ | inspectBeforeGatherShare | 0 | none |
| v1/ISFJ | novelPatchVisitShare | 0 | none |
| v1/ISFJ | bestKnownReturnRate | 0 | none |
| v1/ISFJ | foodGathered | 0 | none |
| v1/ISFP | inspectBeforeGatherShare | 32 | none |
| v1/ISFP | novelPatchVisitShare | 45 | none |
| v1/ISFP | bestKnownReturnRate | 11 | none |
| v1/ISFP | foodGathered | 34 | none |
| v1/ISTJ | inspectBeforeGatherShare | 0 | none |
| v1/ISTJ | novelPatchVisitShare | 0 | none |
| v1/ISTJ | bestKnownReturnRate | 0 | none |
| v1/ISTJ | foodGathered | 0 | none |
| v1/ISTP | inspectBeforeGatherShare | 32 | none |
| v1/ISTP | novelPatchVisitShare | 45 | none |
| v1/ISTP | bestKnownReturnRate | 11 | none |
| v1/ISTP | foodGathered | 34 | none |

Summary: stable 0; context-dependent 0; none 64. Stack-metric vectors with at least one nonzero seed difference: 56/64. Stacks equal to null on every metric and seed: v1/ISFJ, v1/ISTJ. A classification of none is not proof of equivalence or absence of small effects.

## Function ledger

Ledger schema: function-ledger-report/v1; 24 independent seeds (1–24), 17 configurations per seed. The 408 reduced ledger-run records match the corresponding 200-seed input records.

Shared formula groups overlap; function totals are not additive causal shares.

Observation belief deltas are unavailable; learning contribution is domain KL, not developmental E_f.

DeltaU is a full-trajectory ablation effect; absent comparable chosen actions are excluded, not zero.

Whole-formula groups overlap, not an additive decomposition: shared F1/F2/F3 are mapped to present functions, and F7/F11 combine functions. The JSON names eight function groups, not separate shared-formula rows. Activations count changed function-group/hook/epoch tuples, not aggregate hook calls. No cause is inferred from a parameter name. metrics.trace.byFormula is null; per-formula firing cannot be recovered from these inputs.

| Group | Activations | Opportunities | Frequency | Mean ΔU | 95% seed interval | Seeds | Learning KL | Eligibility active / eligible / no input |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Se | 6912 | 19584 | 0.352941176 | 0.00281967669 | 0.00177662247 to 0.00386273091 | 24 | 93.9930629 | 6912 / 12672 / 0 |
| Si | 6912 | 19584 | 0.352941176 | 0.00282521394 | 0.00202884846 to 0.00362157942 | 24 | 97.3805092 | 6912 / 12672 / 0 |
| Ne | 4608 | 4608 | 1 | -6.37683824e-8 | -1.45778187e-7 to 1.82414221e-8 | 24 | 0 | 4608 / 0 / 14976 |
| Ni | 4608 | 4608 | 1 | 1.11861975e-8 | -4.07116039e-8 to 6.3083999e-8 | 24 | 0 | 4608 / 0 / 14976 |
| Te | 4608 | 4608 | 1 | -2.62910924e-8 | -6.50604893e-8 to 1.24783045e-8 | 24 | 0 | 4608 / 0 / 14976 |
| Ti | 4608 | 4608 | 1 | -2.62910924e-8 | -6.50604893e-8 to 1.24783045e-8 | 24 | 0 | 4608 / 0 / 14976 |
| Fe | 4608 | 4608 | 1 | -2.62910924e-8 | -6.50604893e-8 to 1.24783045e-8 | 24 | 0 | 4608 / 0 / 14976 |
| Fi | 4608 | 4608 | 1 | -2.62910924e-8 | -6.50604893e-8 to 1.24783045e-8 | 24 | 0 | 4608 / 0 / 14976 |

Activated groups: Se, Si, Ne, Ni, Te, Ti, Fe, Fi. Groups that never changed a hook output: none. Groups with ΔU intervals excluding zero: Se, Si. ΔU is the base chosen action's margin effect under full-trajectory ablation, not a behavioral metric.

Stack-null behavioral differences are reported above, but no individual function group can be established as their cause: the ledger contains utility-margin effects, not ablated behavioral metric vectors. Group-level behavioral attribution is unavailable, rather than zero. Se/Si have domain learning contributions; other groups have zero domain learning contribution here.

Re-check of T-3's never-fired list (F4–F7, F9–F11, F13): S1 has space and physical/present/targeted inputs, nonzero Se/Si learning contributions and group output changes. Individual formulas cannot be labeled fired/never-fired from byFormula: null. All generate calls remain unchanged; no function group remains wholly inactive. F6 categorical precision is limited as below. These observations do not establish a formula-level causal decomposition.

### Aggregate hook trace (200 seeds)

Cells are changed calls / total calls. changedCueShares counts shares changed beyond 1e-12, not parameter changes. The pure analysis also retains changed-parameter counts per hook.

| Configuration | pertinence | interpret | generate | learning | changedCueShares |
| --- | --- | --- | --- | --- | --- |
| null | 0 / 2400 | 0 / 972457 | 0 / 2400 | 0 / 86400 | 0 |
| v1/ENFJ | 2400 / 2400 | 972617 / 972617 | 0 / 2400 | 86400 / 86400 | 432000 |
| v1/ENFP | 2400 / 2400 | 972510 / 972510 | 0 / 2400 | 86400 / 86400 | 0 |
| v1/ENTJ | 2400 / 2400 | 972617 / 972617 | 0 / 2400 | 86400 / 86400 | 432000 |
| v1/ENTP | 2400 / 2400 | 972510 / 972510 | 0 / 2400 | 86400 / 86400 | 0 |
| v1/ESFJ | 2400 / 2400 | 972478 / 972478 | 0 / 2400 | 86400 / 86400 | 0 |
| v1/ESFP | 2400 / 2400 | 972678 / 972678 | 0 / 2400 | 86400 / 86400 | 432000 |
| v1/ESTJ | 2400 / 2400 | 972478 / 972478 | 0 / 2400 | 86400 / 86400 | 0 |
| v1/ESTP | 2400 / 2400 | 972678 / 972678 | 0 / 2400 | 86400 / 86400 | 432000 |
| v1/INFJ | 2400 / 2400 | 972565 / 972565 | 0 / 2400 | 86400 / 86400 | 432000 |
| v1/INFP | 2400 / 2400 | 972514 / 972514 | 0 / 2400 | 86400 / 86400 | 0 |
| v1/INTJ | 2400 / 2400 | 972565 / 972565 | 0 / 2400 | 86400 / 86400 | 432000 |
| v1/INTP | 2400 / 2400 | 972514 / 972514 | 0 / 2400 | 86400 / 86400 | 0 |
| v1/ISFJ | 2400 / 2400 | 972457 / 972457 | 0 / 2400 | 86400 / 86400 | 0 |
| v1/ISFP | 2400 / 2400 | 972680 / 972680 | 0 / 2400 | 86400 / 86400 | 432000 |
| v1/ISTJ | 2400 / 2400 | 972457 / 972457 | 0 / 2400 | 86400 / 86400 | 0 |
| v1/ISTP | 2400 / 2400 | 972680 / 972680 | 0 / 2400 | 86400 / 86400 | 432000 |

## Controls

The two T-1 controls—randomised θ with the null personality, and hook outputs shuffled across functions—were **not run**: the runner has no such option.

No stable or context-dependent behavioral difference exists for a control to rule out. The controls are moot for S1 as built under the keeper's operational classification: no difference meets the stable or context-dependent criteria. Seed-level differences can still exist; none qualifies as an effect requiring those controls under this rule. This does not satisfy the unrun mandatory T-1 control protocol or control the ledger's internal ΔU effects.

## Interpretation limits

The metrics files cannot show per-epoch or per-patch context, action ordering, conditional effects or observation updates. Those contexts require full traces, which were not kept. Seed halves test seed-range stability, not environmental context subsets. Identical aggregate metrics do not prove identical complete trajectories.

S1 supplies categorical colour/size cues. F6's targeted Weber-precision modification is recorded but categorical identification does not consume that precision; the present-physical attention lever is active. observationBeliefDeltas: null: hook parameter deltas and outcome-learning deltas cannot reconstruct observation belief updates. Frozen context also has no remembered flag.

The ledger cost ceiling limited influence evidence to 24 seeds: exact full-trajectory counterfactuals cost several worlds and lightweight summaries do not meet the requested small constant overhead. No 200-seed mechanism-influence claim is made. Missing comparable chosen actions are excluded from ΔU, never replaced by zero.

This is level-5 evidence of model behavior, not human validation; human comparison waits until S6. T-3's 16 → 3 measured behaviors become 16 → 8 on these S1 metrics. F1–F13, fixture, parameters and engine are unchanged; no tuning is proposed.
## Addendum (2026-11-02): reclassification under §10

Reproduce (updates only this addendum): `node --experimental-strip-types bench/scenarios/s1-forage/analyze.ts --addendum`.

Recomputed from the existing out/s1-200.metrics.jsonl, out/s1-24-ledger.metrics.jsonl, out/ledger-report.json and the 408 out/ledger-{seed}-{version}-{stack}.json summaries. No simulation rerun. [Rule: DESIGN §10.1](../DESIGN.md#101-the-rule-keepers-operational-form): α=0.05, θ_s=0.6, θ_ex=0.05; halves split at the middle seed (12/24 and 100/200). seedInterval retains its conservative Student-t critical-value bins. Zero effects have no sign; unavailable effects are excluded, never replaced by zero.

### Mechanisms (24 seeds)

Same aggregation as the original ledger report: V1's sixteen stacks plus the null control, pooled within seed, then equally weighted seeds. Groups overlap. o_f uses (active + eligible-not-activated) / (active + eligible-not-activated + no-input); the ledger's opportunities field counts eligible opportunities only. Effects are mean ΔU [95% interval].

| Group | o_f | s_f | All seeds | First half | Second half | Classification |
| --- | --- | --- | --- | --- | --- | --- |
| Se | 1 | 0.916666667 | 0.00281967669 [0.00177662247, 0.00386273091] | 0.00353981447 [0.00208859733, 0.00499103161] | 0.0020995389 [0.00069400947, 0.00350506833] | stable |
| Si | 1 | 0.916666667 | 0.00282521394 [0.00202884846, 0.00362157942] | 0.00359115052 [0.00270633994, 0.0044759611] | 0.00205927736 [0.000901840434, 0.00321671429] | stable |
| Ne | 0.235294118 | 0.625 | -6.37683824e-8 [-1.45778187e-7, 1.82414221e-8] | -7.21581056e-8 [-1.9018063e-7, 4.58644186e-8] | -5.53786592e-8 [-1.74258507e-7, 6.35011884e-8] | none |
| Ni | 0.235294118 | 0.541666667 | 1.11861975e-8 [-4.07116039e-8, 6.3083999e-8] | 6.87692515e-9 [-6.60692449e-8, 7.98230952e-8] | 1.54954699e-8 [-6.14806762e-8, 9.24716161e-8] | none |
| Te | 0.235294118 | 0.625 | -2.62910924e-8 [-6.50604893e-8, 1.24783045e-8] | -3.26405902e-8 [-1.02098555e-7, 3.68173745e-8] | -1.99415946e-8 [-5.76874404e-8, 1.78042512e-8] | none |
| Ti | 0.235294118 | 0.625 | -2.62910924e-8 [-6.50604893e-8, 1.24783045e-8] | -3.26405902e-8 [-1.02098555e-7, 3.68173745e-8] | -1.99415946e-8 [-5.76874404e-8, 1.78042512e-8] | none |
| Fe | 0.235294118 | 0.625 | -2.62910924e-8 [-6.50604893e-8, 1.24783045e-8] | -3.26405902e-8 [-1.02098555e-7, 3.68173745e-8] | -1.99415946e-8 [-5.76874404e-8, 1.78042512e-8] | none |
| Fi | 0.235294118 | 0.625 | -2.62910924e-8 [-6.50604893e-8, 1.24783045e-8] | -3.26405902e-8 [-1.02098555e-7, 3.68173745e-8] | -1.99415946e-8 [-5.76874404e-8, 1.78042512e-8] | none |

**Evidence discrepancy with §10.2's expectation:** the saved ledger gives Te/Ti/Fe/Fi 4608 active and 14976 no-input opportunities each (o_f = 0.235294118), not zero eligible input. Its shared F1/F2/F3 fallback counts internal-state opportunities outside each function's nominal domain (bench/diagnostics/ledger.ts localRecord; diagnostics/README.md). Applying §10.1 to these unchanged counts therefore does not label those groups not exercised. This is not evidence of domain-specific judging activity. The keeper must reconcile the expected domain-only interpretation with the recorded whole-formula groups; no counts, formulas or thresholds were changed.

### Behaviour (200 paired seeds)

Exercised groups are those with observed changedHookCalls in the stack's 24-seed byStack ledger and o_f ≥ θ_ex. These are measured whole-formula output differences; no per-function causal attribution is claimed. The 24-seed opportunity evidence is not a 200-seed ledger. Behaviour retains S1's original opposite-half-means clause (requires an all-seed interval excluding zero), adding seed consistency to stable and the all-groups-unexercised class.

| Stack | Metric | Exercised groups | s_f | All seeds | First half | Second half | Classification |
| --- | --- | --- | --- | --- | --- | --- | --- |
| v1/ENFJ | inspectBeforeGatherShare | Se, Ni, Ti, Fe | 0.065 | -0.00708333333 [-0.0494649265, 0.0352982598] | -0.0333333333 [-0.0849818463, 0.0183151796] | 0.0191666667 [-0.0477990423, 0.0861323756] | none |
| v1/ENFJ | novelPatchVisitShare | Se, Ni, Ti, Fe | 0.105 | -0.0118214286 [-0.034300089, 0.0106572318] | 0.00126190476 [-0.0293540157, 0.0318778252] | -0.0249047619 [-0.0577204004, 0.00791087663] | none |
| v1/ENFJ | bestKnownReturnRate | Se, Ni, Ti, Fe | 0.025 | 0.0000833333333 [-0.0145630272, 0.0147296939] | 0 [-0.0199248868, 0.0199248868] | 0.000166666667 [-0.021406357, 0.0217396904] | none |
| v1/ENFJ | foodGathered | Se, Ni, Ti, Fe | 0.095 | -0.09 [-0.212540011, 0.0325400107] | -0.02 [-0.20187165, 0.16187165] | -0.16 [-0.323703479, 0.00370347851] | none |
| v1/ENFP | inspectBeforeGatherShare | Si, Ne, Te, Fi | 0.045 | -0.00791666667 [-0.0422298004, 0.026396467] | -0.0325 [-0.0713671955, 0.00636719552] | 0.0166666667 [-0.0395656999, 0.0728990332] | none |
| v1/ENFP | novelPatchVisitShare | Si, Ne, Te, Fi | 0.075 | -0.00735714286 [-0.0226067, 0.00789241426] | 0.00492857143 [-0.0162856708, 0.0261428137] | -0.0196428571 [-0.0413156846, 0.00202997028] | none |
| v1/ENFP | bestKnownReturnRate | Si, Ne, Te, Fi | 0.025 | -0.00141666667 [-0.0114711329, 0.00863779956] | -0.00866666667 [-0.0264369913, 0.00910365795] | 0.00583333333 [-0.0034054566, 0.0150721233] | none |
| v1/ENFP | foodGathered | Si, Ne, Te, Fi | 0.075 | -0.08 [-0.194291929, 0.0342919286] | -0.07 [-0.212529842, 0.0725298423] | -0.09 [-0.269414844, 0.0894148436] | none |
| v1/ENTJ | inspectBeforeGatherShare | Se, Ni, Te, Fi | 0.065 | -0.00708333333 [-0.0494649265, 0.0352982598] | -0.0333333333 [-0.0849818463, 0.0183151796] | 0.0191666667 [-0.0477990423, 0.0861323756] | none |
| v1/ENTJ | novelPatchVisitShare | Se, Ni, Te, Fi | 0.105 | -0.0118214286 [-0.034300089, 0.0106572318] | 0.00126190476 [-0.0293540157, 0.0318778252] | -0.0249047619 [-0.0577204004, 0.00791087663] | none |
| v1/ENTJ | bestKnownReturnRate | Se, Ni, Te, Fi | 0.025 | 0.0000833333333 [-0.0145630272, 0.0147296939] | 0 [-0.0199248868, 0.0199248868] | 0.000166666667 [-0.021406357, 0.0217396904] | none |
| v1/ENTJ | foodGathered | Se, Ni, Te, Fi | 0.095 | -0.09 [-0.212540011, 0.0325400107] | -0.02 [-0.20187165, 0.16187165] | -0.16 [-0.323703479, 0.00370347851] | none |
| v1/ENTP | inspectBeforeGatherShare | Si, Ne, Ti, Fe | 0.045 | -0.00791666667 [-0.0422298004, 0.026396467] | -0.0325 [-0.0713671955, 0.00636719552] | 0.0166666667 [-0.0395656999, 0.0728990332] | none |
| v1/ENTP | novelPatchVisitShare | Si, Ne, Ti, Fe | 0.075 | -0.00735714286 [-0.0226067, 0.00789241426] | 0.00492857143 [-0.0162856708, 0.0261428137] | -0.0196428571 [-0.0413156846, 0.00202997028] | none |
| v1/ENTP | bestKnownReturnRate | Si, Ne, Ti, Fe | 0.025 | -0.00141666667 [-0.0114711329, 0.00863779956] | -0.00866666667 [-0.0264369913, 0.00910365795] | 0.00583333333 [-0.0034054566, 0.0150721233] | none |
| v1/ENTP | foodGathered | Si, Ne, Ti, Fe | 0.075 | -0.08 [-0.194291929, 0.0342919286] | -0.07 [-0.212529842, 0.0725298423] | -0.09 [-0.269414844, 0.0894148436] | none |
| v1/ESFJ | inspectBeforeGatherShare | Si, Ne, Ti, Fe | 0.03 | 0.00625 [-0.0170714793, 0.0295714793] | -0.0075 [-0.0380608006, 0.0230608006] | 0.02 [-0.0151230512, 0.0551230512] | none |
| v1/ESFJ | novelPatchVisitShare | Si, Ne, Ti, Fe | 0.025 | -0.0014047619 [-0.0134373056, 0.0106277818] | 0.00416666667 [-0.0113065208, 0.0196398542] | -0.00697619048 [-0.025402274, 0.0114498931] | none |
| v1/ESFJ | bestKnownReturnRate | Si, Ne, Ti, Fe | 0.01 | -0.000416666667 [-0.00768553188, 0.00685219855] | -0.000833333333 [-0.0154071316, 0.0137404649] | 0 [0, 0] | none |
| v1/ESFJ | foodGathered | Si, Ne, Ti, Fe | 0.035 | -0.04 [-0.108557692, 0.0285576924] | -0.06 [-0.148561111, 0.0285611113] | -0.02 [-0.12493995, 0.0849399495] | none |
| v1/ESFP | inspectBeforeGatherShare | Se, Ni, Te, Fi | 0.11 | -0.02875 [-0.0718775951, 0.0143775951] | -0.0308333333 [-0.0886326791, 0.0269660125] | -0.0266666667 [-0.0909810019, 0.0376476685] | none |
| v1/ESFP | novelPatchVisitShare | Se, Ni, Te, Fi | 0.13 | -0.00118452381 [-0.0311049955, 0.0287359478] | -0.000571428571 [-0.0434818809, 0.0423390237] | -0.00179761905 [-0.0437223066, 0.0401270685] | none |
| v1/ESFP | bestKnownReturnRate | Se, Ni, Te, Fi | 0.045 | 0.00166666667 [-0.0133014564, 0.0166347897] | 0.00716666667 [-0.0132093236, 0.0275426569] | -0.00383333333 [-0.0257989902, 0.0181323235] | none |
| v1/ESFP | foodGathered | Se, Ni, Te, Fi | 0.11 | 0.025 [-0.126858756, 0.176858756] | 0.02 [-0.244927261, 0.284927261] | 0.03 [-0.120070804, 0.180070804] | none |
| v1/ESTJ | inspectBeforeGatherShare | Si, Ne, Te, Fi | 0.03 | 0.00625 [-0.0170714793, 0.0295714793] | -0.0075 [-0.0380608006, 0.0230608006] | 0.02 [-0.0151230512, 0.0551230512] | none |
| v1/ESTJ | novelPatchVisitShare | Si, Ne, Te, Fi | 0.025 | -0.0014047619 [-0.0134373056, 0.0106277818] | 0.00416666667 [-0.0113065208, 0.0196398542] | -0.00697619048 [-0.025402274, 0.0114498931] | none |
| v1/ESTJ | bestKnownReturnRate | Si, Ne, Te, Fi | 0.01 | -0.000416666667 [-0.00768553188, 0.00685219855] | -0.000833333333 [-0.0154071316, 0.0137404649] | 0 [0, 0] | none |
| v1/ESTJ | foodGathered | Si, Ne, Te, Fi | 0.035 | -0.04 [-0.108557692, 0.0285576924] | -0.06 [-0.148561111, 0.0285611113] | -0.02 [-0.12493995, 0.0849399495] | none |
| v1/ESTP | inspectBeforeGatherShare | Se, Ni, Ti, Fe | 0.11 | -0.02875 [-0.0718775951, 0.0143775951] | -0.0308333333 [-0.0886326791, 0.0269660125] | -0.0266666667 [-0.0909810019, 0.0376476685] | none |
| v1/ESTP | novelPatchVisitShare | Se, Ni, Ti, Fe | 0.13 | -0.00118452381 [-0.0311049955, 0.0287359478] | -0.000571428571 [-0.0434818809, 0.0423390237] | -0.00179761905 [-0.0437223066, 0.0401270685] | none |
| v1/ESTP | bestKnownReturnRate | Se, Ni, Ti, Fe | 0.045 | 0.00166666667 [-0.0133014564, 0.0166347897] | 0.00716666667 [-0.0132093236, 0.0275426569] | -0.00383333333 [-0.0257989902, 0.0181323235] | none |
| v1/ESTP | foodGathered | Se, Ni, Ti, Fe | 0.11 | 0.025 [-0.126858756, 0.176858756] | 0.02 [-0.244927261, 0.284927261] | 0.03 [-0.120070804, 0.180070804] | none |
| v1/INFJ | inspectBeforeGatherShare | Se, Ni, Ti, Fe | 0.06 | -0.0125 [-0.0506198131, 0.0256198131] | -0.0383333333 [-0.0899427242, 0.0132760576] | 0.0133333333 [-0.0424463614, 0.0691130281] | none |
| v1/INFJ | novelPatchVisitShare | Se, Ni, Ti, Fe | 0.095 | -0.0104047619 [-0.0276374344, 0.00682791064] | 0.000928571429 [-0.0237022271, 0.02555937] | -0.0217380952 [-0.0457026677, 0.00222647718] | none |
| v1/INFJ | bestKnownReturnRate | Se, Ni, Ti, Fe | 0.02 | 0.000333333333 [-0.0112314805, 0.0118981472] | -0.0045 [-0.0256515206, 0.0166515206] | 0.00516666667 [-0.00421159362, 0.014544927] | none |
| v1/INFJ | foodGathered | Se, Ni, Ti, Fe | 0.1 | -0.115 [-0.236504972, 0.00650497186] | -0.11 [-0.268014065, 0.0480140652] | -0.12 [-0.305421499, 0.0654214989] | none |
| v1/INFP | inspectBeforeGatherShare | Si, Ne, Te, Fi | 0.05 | 0.0104166667 [-0.0208128013, 0.0416461347] | -0.0175 [-0.0552213566, 0.0202213566] | 0.0383333333 [-0.0108576883, 0.087524355] | none |
| v1/INFP | novelPatchVisitShare | Si, Ne, Te, Fi | 0.055 | -0.00319047619 [-0.0172256486, 0.0108446963] | 0.00492857143 [-0.0153180595, 0.0251752024] | -0.0113095238 [-0.0306844141, 0.00806536643] | none |
| v1/INFP | bestKnownReturnRate | Si, Ne, Te, Fi | 0.015 | 0.000833333333 [-0.00856556609, 0.0102322328] | -0.00416666667 [-0.0205153442, 0.0121820109] | 0.00583333333 [-0.0034054566, 0.0150721233] | none |
| v1/INFP | foodGathered | Si, Ne, Te, Fi | 0.055 | -0.055 [-0.147366167, 0.0373661669] | -0.03 [-0.141766473, 0.0817664732] | -0.08 [-0.227458333, 0.0674583329] | none |
| v1/INTJ | inspectBeforeGatherShare | Se, Ni, Te, Fi | 0.06 | -0.0125 [-0.0506198131, 0.0256198131] | -0.0383333333 [-0.0899427242, 0.0132760576] | 0.0133333333 [-0.0424463614, 0.0691130281] | none |
| v1/INTJ | novelPatchVisitShare | Se, Ni, Te, Fi | 0.095 | -0.0104047619 [-0.0276374344, 0.00682791064] | 0.000928571429 [-0.0237022271, 0.02555937] | -0.0217380952 [-0.0457026677, 0.00222647718] | none |
| v1/INTJ | bestKnownReturnRate | Se, Ni, Te, Fi | 0.02 | 0.000333333333 [-0.0112314805, 0.0118981472] | -0.0045 [-0.0256515206, 0.0166515206] | 0.00516666667 [-0.00421159362, 0.014544927] | none |
| v1/INTJ | foodGathered | Se, Ni, Te, Fi | 0.1 | -0.115 [-0.236504972, 0.00650497186] | -0.11 [-0.268014065, 0.0480140652] | -0.12 [-0.305421499, 0.0654214989] | none |
| v1/INTP | inspectBeforeGatherShare | Si, Ne, Ti, Fe | 0.05 | 0.0104166667 [-0.0208128013, 0.0416461347] | -0.0175 [-0.0552213566, 0.0202213566] | 0.0383333333 [-0.0108576883, 0.087524355] | none |
| v1/INTP | novelPatchVisitShare | Si, Ne, Ti, Fe | 0.055 | -0.00319047619 [-0.0172256486, 0.0108446963] | 0.00492857143 [-0.0153180595, 0.0251752024] | -0.0113095238 [-0.0306844141, 0.00806536643] | none |
| v1/INTP | bestKnownReturnRate | Si, Ne, Ti, Fe | 0.015 | 0.000833333333 [-0.00856556609, 0.0102322328] | -0.00416666667 [-0.0205153442, 0.0121820109] | 0.00583333333 [-0.0034054566, 0.0150721233] | none |
| v1/INTP | foodGathered | Si, Ne, Ti, Fe | 0.055 | -0.055 [-0.147366167, 0.0373661669] | -0.03 [-0.141766473, 0.0817664732] | -0.08 [-0.227458333, 0.0674583329] | none |
| v1/ISFJ | inspectBeforeGatherShare | Si, Ne, Ti, Fe | 0 | 0 [0, 0] | 0 [0, 0] | 0 [0, 0] | none |
| v1/ISFJ | novelPatchVisitShare | Si, Ne, Ti, Fe | 0 | 0 [0, 0] | 0 [0, 0] | 0 [0, 0] | none |
| v1/ISFJ | bestKnownReturnRate | Si, Ne, Ti, Fe | 0 | 0 [0, 0] | 0 [0, 0] | 0 [0, 0] | none |
| v1/ISFJ | foodGathered | Si, Ne, Ti, Fe | 0 | 0 [0, 0] | 0 [0, 0] | 0 [0, 0] | none |
| v1/ISFP | inspectBeforeGatherShare | Se, Ni, Te, Fi | 0.085 | -0.0075 [-0.049602961, 0.034602961] | -0.0216666667 [-0.0833124784, 0.039979145] | 0.00666666667 [-0.0508321493, 0.0641654826] | none |
| v1/ISFP | novelPatchVisitShare | Se, Ni, Te, Fi | 0.11 | -0.0103214286 [-0.0365530662, 0.0159102091] | -0.00323809524 [-0.0422376826, 0.0357614921] | -0.0174047619 [-0.0526226021, 0.0178130783] | none |
| v1/ISFP | bestKnownReturnRate | Se, Ni, Te, Fi | 0.035 | -0.002 [-0.0160080401, 0.0120080401] | 0.00166666667 [-0.0186013298, 0.0219346631] | -0.00566666667 [-0.0250760666, 0.0137427332] | none |
| v1/ISFP | foodGathered | Se, Ni, Te, Fi | 0.105 | -0.07 [-0.18978086, 0.0497808597] | -0.06 [-0.254760304, 0.134760304] | -0.08 [-0.220492205, 0.0604922047] | none |
| v1/ISTJ | inspectBeforeGatherShare | Si, Ne, Te, Fi | 0 | 0 [0, 0] | 0 [0, 0] | 0 [0, 0] | none |
| v1/ISTJ | novelPatchVisitShare | Si, Ne, Te, Fi | 0 | 0 [0, 0] | 0 [0, 0] | 0 [0, 0] | none |
| v1/ISTJ | bestKnownReturnRate | Si, Ne, Te, Fi | 0 | 0 [0, 0] | 0 [0, 0] | 0 [0, 0] | none |
| v1/ISTJ | foodGathered | Si, Ne, Te, Fi | 0 | 0 [0, 0] | 0 [0, 0] | 0 [0, 0] | none |
| v1/ISTP | inspectBeforeGatherShare | Se, Ni, Ti, Fe | 0.085 | -0.0075 [-0.049602961, 0.034602961] | -0.0216666667 [-0.0833124784, 0.039979145] | 0.00666666667 [-0.0508321493, 0.0641654826] | none |
| v1/ISTP | novelPatchVisitShare | Se, Ni, Ti, Fe | 0.11 | -0.0103214286 [-0.0365530662, 0.0159102091] | -0.00323809524 [-0.0422376826, 0.0357614921] | -0.0174047619 [-0.0526226021, 0.0178130783] | none |
| v1/ISTP | bestKnownReturnRate | Se, Ni, Ti, Fe | 0.035 | -0.002 [-0.0160080401, 0.0120080401] | 0.00166666667 [-0.0186013298, 0.0219346631] | -0.00566666667 [-0.0250760666, 0.0137427332] | none |
| v1/ISTP | foodGathered | Se, Ni, Ti, Fe | 0.105 | -0.07 [-0.18978086, 0.0497808597] | -0.06 [-0.254760304, 0.134760304] | -0.08 [-0.220492205, 0.0604922047] | none |

### Changed classes

No behaviour row changed from the original rule.

The original report did not assign mechanism classes. For comparison only, applying its three-class rule to the same ledger effects gives these changes:

No mechanism row changes in that retrospective comparison.

### Processing evidence and limits

Each mechanism row rests on summary.eligibility and deltaUSum/deltaUCount from the saved ledgers; each behaviour row rests on paired metrics and byStack.changedHookCalls/eligibility. The underlying trace fields are hooks (parameters), attention.shares (cue shares), evaluation.expectedUtility (candidate EUs), and learning.updates[].kl (learning KL); reduced summaries retain interpretationMagnitude, attentionMoved and learningContribution. Full per-epoch traces were not retained, so context-specific attribution remains unavailable. See the original Function ledger and Aggregate hook trace tables above and [diagnostic attribution notes](../../diagnostics/README.md).

The original negative findings and identical pairs remain: 8 distinct joint metric vectors, 8 identical unordered stack pairs. T-1 control support now exists (unit 5435), but these stored inputs contain no control runs; no attribution to function structure is established. Level-5 model evidence only.
## Addendum 2 (2026-11-02): own-opportunity count (§10.5)

Reproduce: `node --experimental-strip-types bench/scenarios/s1-forage/analyze.ts --addendum2`.

The old 24-seed summaries lack per-formula input. Only their 408 base trajectories (24 seeds, sixteen V1 stacks plus null) were replayed to reduce own opportunities into out/addendum2-temporary/. Regenerated metrics must exactly match the saved inputs; saved counterfactual effects are reused, and every existing ledger-report key is checked unchanged. No 200-seed study was rerun.

### Mechanisms (24 seeds; own input)

DESIGN §10.5 changes only the opportunity definition: α=0.05, θ_s=0.6, θ_ex=0.05; halves remain seeds 1–12 and 13–24. The denominator remains all function/hook/epoch tuples, including absent functions and null. Input is counted once per tuple when an owned formula receives relevant input, regardless of output activation. Numerators and denominators are stored in ownByFunction and sharedAttitude. Ownership follows frozen V1 formulas.json: F4 Se/Ne/Te, F5 Si/Ni, F6 Se, F7 the enabled domain owners, F8 Si, F9 Ne, F10 Ni, F11 Ne/Ni, F12 Ni, F13 Te; Ti/Fe/Fi cores remain off. F9/F10 have no host adapters in these traces; zero κ supplies no F11 input.

| Group | o_f | s_f | All seeds | First half | Second half | Classification |
| --- | --- | --- | --- | --- | --- | --- |
| Se | 0.352941176 | 0.916666667 | 0.00281967669 [0.00177662247, 0.00386273091] | 0.00353981447 [0.00208859733, 0.00499103161] | 0.0020995389 [0.00069400947, 0.00350506833] | stable |
| Si | 0.235294118 | 0.916666667 | 0.00282521394 [0.00202884846, 0.00362157942] | 0.00359115052 [0.00270633994, 0.0044759611] | 0.00205927736 [0.000901840434, 0.00321671429] | stable |
| Ne | 0 | 0.625 | -6.37683824e-8 [-1.45778187e-7, 1.82414221e-8] | -7.21581056e-8 [-1.9018063e-7, 4.58644186e-8] | -5.53786592e-8 [-1.74258507e-7, 6.35011884e-8] | not exercised |
| Ni | 0 | 0.541666667 | 1.11861975e-8 [-4.07116039e-8, 6.3083999e-8] | 6.87692515e-9 [-6.60692449e-8, 7.98230952e-8] | 1.54954699e-8 [-6.14806762e-8, 9.24716161e-8] | not exercised |
| Te | 0 | 0.625 | -2.62910924e-8 [-6.50604893e-8, 1.24783045e-8] | -3.26405902e-8 [-1.02098555e-7, 3.68173745e-8] | -1.99415946e-8 [-5.76874404e-8, 1.78042512e-8] | not exercised |
| Ti | 0 | 0.625 | -2.62910924e-8 [-6.50604893e-8, 1.24783045e-8] | -3.26405902e-8 [-1.02098555e-7, 3.68173745e-8] | -1.99415946e-8 [-5.76874404e-8, 1.78042512e-8] | not exercised |
| Fe | 0 | 0.625 | -2.62910924e-8 [-6.50604893e-8, 1.24783045e-8] | -3.26405902e-8 [-1.02098555e-7, 3.68173745e-8] | -1.99415946e-8 [-5.76874404e-8, 1.78042512e-8] | not exercised |
| Fi | 0 | 0.625 | -2.62910924e-8 [-6.50604893e-8, 1.24783045e-8] | -3.26405902e-8 [-1.02098555e-7, 3.68173745e-8] | -1.99415946e-8 [-5.76874404e-8, 1.78042512e-8] | not exercised |
| shared attitude (F1–F3) | 0.470588235 | 0.625 | -5.25821848e-8 [-1.30120979e-7, 2.49566089e-8] | -6.52811805e-8 [-2.0419711e-7, 7.3634749e-8] | -3.98831892e-8 [-1.15374881e-7, 3.56085023e-8] | none |

Function effects remain the original overlapping whole-group ΔU effects, not isolated own-operation effects. The shared row is never a function: its counterfactual reuses exactly one present Ti/Fe/Fi group per configuration (null uses Ti), whose only enabled formulas are F1–F3. Its opportunities are counted once per hook/epoch, without duplicating them across functions. Effects retain equal seed weighting, unavailable margins are excluded, and the shared row uses the same classification rule.

### Changes from the first addendum

- Ne: none → not exercised.
- Ni: none → not exercised.
- Te: none → not exercised.
- Ti: none → not exercised.
- Fe: none → not exercised.
- Fi: none → not exercised.

The shared row is new. The original behaviour tables and negative findings are retained: own opportunity classification does not establish behavioural attribution, and identical type pairs remain unchanged. Evidence rests on reconstructed subjective hooks/cue tags and saved summary deltaUSum/deltaUCount; no formulas, thresholds, or engine code changed. This remains level-5 model evidence.
