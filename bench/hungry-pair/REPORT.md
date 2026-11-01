# Hungry-pair acceptance report

Status: All bench acceptance checks passed; CB-6b certification belongs to unit 2672's CHECK.md (COG-18).

Verification only; no claim of independent validation.

Git commit: c983167cef89f5fb5f24c28a867e29998bbe3f77
Source SHA256: 99ca1a15aa6c878acb59638793ced79289026cc3e32cf91953c448fbdc60858c
The git commit is the base revision executed with the working source tree identified by SHA256 above.
Seed count symmetry: 500
Seed count paired-per-dimension: 200
Seed count learning-frozen: 200

Verdict CB-1: PASS (0/5 assertions failed)
Verdict CB-2: PASS (0/90 assertions failed)
Verdict CB-3: PASS (0/62 assertions failed)
Verdict CB-4: PASS (0/39 assertions failed)
Verdict CB-5: PASS (0/215 assertions failed)
Verdict CB-6: PASS (0/1001 assertions failed; covers (a) symmetry/ID swap and (c) sequence diversity only; (b) independent semantic audit is certified separately by unit 2672's CHECK.md)
Verdict CB-7: PASS (0/242881 assertions failed)

Protocol: seeds 1–500 for CB-6; seeds 1–200 for every CB-7 dimension and CB-5b.
Diagnostic checks use two fixed seeds: 1 (two epochs) and 19 (eight epochs); exact ID swap uses seed 1. Vitest study smoke checks use 16 fixed seeds, 1–16.
Each world uses 2 ten-minute epochs instead of 144 to reduce runtime. All runs include Scheduler, EventBus, named streams, initial-snapshot Runner replay and host replay.
Study wall time: 108.08 s, outside vitest under C-B1. Two epochs cannot test completed six-epoch journeys or one-day behavior.
CB-7's late-loss metric is a separate fixed-context early-loss probe at +1 day, not a completed one-day world run.
Paired worlds share seed and per-mind stream names. Conditional draws can desynchronize after histories diverge.

## CB-1 through CB-7 and P7-3

- CB-1: PASS (0/5 assertions failed).
- CB-2: PASS (0/90 assertions failed).
- CB-3: PASS (0/62 assertions failed).
- CB-4: PASS (0/39 assertions failed).
- CB-5a: PASS (0/15 assertions failed).
- CB-7 lambda fixed context: PASS (0/444 assertions failed).
- CB-6a exact ID swap: PASS (0/1 assertions failed).
- P7-3: PASS (0/1 assertions failed).
- CB-5b: PASS (0/200 assertions failed). 31/200 diverged; pairs=200; Wilson=[0.11139636927689314,0.21160690592342077]
- CB-6a symmetry: PASS (0/500 assertions failed). seeds=500; chi-square=9.766430187464717; df=9; p=0.3697229536485609; min expected=90.5
- CB-6c: PASS (0/500 assertions failed). distinct sequences=486
- CB-7 lambda fixed context: PASS (0/240433 assertions failed).
- CB-7 lambda coverage: PASS (0/1 assertions failed). all 16200 recorded study decisions; 221400 candidates; 19033 strict and 0 equal-probability maxima; max EU residual=2.220446049250313e-16
- CB-7 beta: PASS (0/1 assertions failed). beta/entropy: difference=-0.02351 [-0.02432, -0.02269]
- CB-7 kappa: PASS (0/1 assertions failed). kappa/switches: difference=-0.49000 [-0.54087, -0.43913]
- CB-7 d: PASS (0/1 assertions failed). d/earlyLossEffect: difference=-4.058e-9 [-4.426e-9, -3.690e-9]
- CB-7 beta sample: PASS (0/200 assertions failed). beta pairs=200
- CB-7 lambda sample: PASS (0/200 assertions failed). lambda pairs=200
- CB-7 gamma sample: PASS (0/200 assertions failed). gamma pairs=200
- CB-7 eta sample: PASS (0/200 assertions failed). eta pairs=200
- CB-7 alpha0 sample: PASS (0/200 assertions failed). alpha0 pairs=200
- CB-7 d sample: PASS (0/200 assertions failed). d pairs=200
- CB-7 tau sample: PASS (0/200 assertions failed). tau pairs=200
- CB-7 s sample: PASS (0/200 assertions failed). s pairs=200
- CB-7 kappa sample: PASS (0/200 assertions failed). kappa pairs=200
- CB-7 k sample: PASS (0/200 assertions failed). k pairs=200
- CB-1: every study world restores the initial snapshot and replays cognition and host logs; direct repeated-seed and stream-isolation assertions are in the acceptance suite.
- CB-2, CB-3, CB-4, CB-5a: the acceptance suite checks distributions/draws, causal outcomes, informative likelihood directions, and every negative prediction error in its diagnostic runs. Failures are not converted to expected failures.
- CB-5b: 31/200 eligible seeds diverged in later selected actions (200 pairs); share 0.15500, Wilson 95% interval [0.11140, 0.21161].
  32 pairs already differed by the first informative outcome: eta=0 also freezes sensory belief updates, so this contrast does not isolate outcome learning alone.
- CB-6a: Pearson chi-square=9.76643, df=9, p=0.369723; required p>0.01. Minimum expected cell=90.50.
  Action counts pool repeated epochs within seeds as DESIGN specifies; that chi-square p-value is descriptive because the repeated choices and A/B interaction are dependent. Exact ID-swap is a separate assertion.
- CB-6b: independent semantic audit certification belongs to unit 2672's CHECK.md, not this report, and contributes no bench assertion or failure. The limited literal-ID guard does not certify it. No CHECK.md is present in this checkout; this report does not claim the audit has completed.
- CB-6c: 486 distinct default action sequences across 500 seeds.
- CB-7: all ten theta dimensions from DESIGN §3 appear below. Shared drive exponents n,m are held fixed; they are not theta dimensions.
- P7-3: the suite swaps only pertinence; other hooks remain the null model's identical functions.

## CB-7 paired comparisons

COG-19: population fight, steal and fight + steal frequencies and their intervals are reported, not asserted. Lambda is asserted only in fixed-context evaluation below.

Each entry is mean [95% interval]. Frequencies count visitor A/B decisions (including retained intentions); outcome fractions count their emitted causal receipts, including unfinished censoring. Hunger and pain are final visitor averages. Entropy uses the pre-commitment Luce distribution in nats; switches count action/target changes between epochs.
The seed is the independent unit: intervals use the 200 seed-level means and t=1.972. Difference intervals use paired seed differences. Intervals are pointwise, approximate, and not corrected for multiple comparisons; zero variance is reported honestly.

### beta: 1 → 4

| Metric | Baseline | Changed | Paired difference |
| --- | --- | --- | --- |
| action:ask | 0.10875 [0.08704, 0.13046] | 0.12875 [0.10480, 0.15270] | 0.02000 [0.01052, 0.02948] |
| action:trade | 0.09375 [0.07295, 0.11455] | 0.09625 [0.07452, 0.11798] | 0.00250 [-0.01147, 0.01647] |
| action:work | 0.09500 [0.07506, 0.11494] | 0.07625 [0.05802, 0.09448] | -0.01875 [-0.03031, -0.00719] |
| action:deceive | 0.10125 [0.08176, 0.12074] | 0.12375 [0.10137, 0.14613] | 0.02250 [0.00801, 0.03699] |
| action:steal | 0.09750 [0.07602, 0.11898] | 0.10375 [0.08185, 0.12565] | 0.00625 [-0.01271, 0.02521] |
| action:fight | 0.08875 [0.06810, 0.10940] | 0.08875 [0.06871, 0.10879] | 0.00000 [-0.01849, 0.01849] |
| action:leave | 0.09750 [0.07602, 0.11898] | 0.09000 [0.06845, 0.11155] | -0.00750 [-0.02494, 0.00994] |
| action:keep | 0.10375 [0.08329, 0.12421] | 0.08250 [0.06397, 0.10103] | -0.02125 [-0.03324, -0.00926] |
| action:break | 0.11250 [0.09131, 0.13369] | 0.11125 [0.09008, 0.13242] | -0.00125 [-0.00779, 0.00529] |
| action:wait | 0.10125 [0.07885, 0.12365] | 0.09875 [0.07695, 0.12055] | -0.00250 [-0.00743, 0.00243] |
| outcome:good | 0.15250 [0.12503, 0.17997] | 0.14500 [0.11876, 0.17124] | -0.00750 [-0.02099, 0.00599] |
| outcome:bad | 0.47625 [0.44794, 0.50456] | 0.48500 [0.45801, 0.51199] | 0.00875 [-0.00954, 0.02704] |
| outcome:unfinished | 0.37125 [0.34861, 0.39389] | 0.37000 [0.34709, 0.39291] | -0.00125 [-0.01855, 0.01605] |
| action:fight+steal | 0.18625 [0.15829, 0.21421] | 0.19250 [0.16396, 0.22104] | 0.00625 [-0.01172, 0.02422] |
| entropy | 2.30088 [2.30079, 2.30097] | 2.27737 [2.27648, 2.27827] | -0.02351 [-0.02432, -0.02269] |
| switches | 0.89750 [0.86601, 0.92899] | 0.89750 [0.86601, 0.92899] | 0.00000 [-0.02520, 0.02520] |
| hunger | 0.58826 [0.58079, 0.59574] | 0.59076 [0.58354, 0.59798] | 0.00250 [-0.00379, 0.00879] |
| pain | 0.02850 [0.01951, 0.03749] | 0.03075 [0.02178, 0.03972] | 0.00225 [-0.00676, 0.01126] |
| earlyLossEffect | 4.058e-9 [3.690e-9, 4.426e-9] | 1.655e-8 [1.476e-8, 1.834e-8] | 1.249e-8 [1.106e-8, 1.392e-8] |

### lambda: 2.25 → 4.5

| Metric | Baseline | Changed | Paired difference |
| --- | --- | --- | --- |
| action:ask | 0.10875 [0.08704, 0.13046] | 0.11000 [0.08828, 0.13172] | 0.00125 [-0.00122, 0.00372] |
| action:trade | 0.09375 [0.07295, 0.11455] | 0.09250 [0.07173, 0.11327] | -0.00125 [-0.00372, 0.00122] |
| action:work | 0.09500 [0.07506, 0.11494] | 0.09125 [0.07143, 0.11107] | -0.00375 [-0.00800, 0.00050] |
| action:deceive | 0.10125 [0.08176, 0.12074] | 0.10750 [0.08727, 0.12773] | 0.00625 [0.00079, 0.01171] |
| action:steal | 0.09750 [0.07602, 0.11898] | 0.09500 [0.07416, 0.11584] | -0.00250 [-0.00598, 0.00098] |
| action:fight | 0.08875 [0.06810, 0.10940] | 0.08875 [0.06810, 0.10940] | 0.00000 [-0.00349, 0.00349] |
| action:leave | 0.09750 [0.07602, 0.11898] | 0.09000 [0.06991, 0.11009] | -0.00750 [-0.01441, -0.00059] |
| action:keep | 0.10375 [0.08329, 0.12421] | 0.10125 [0.08084, 0.12166] | -0.00250 [-0.01174, 0.00674] |
| action:break | 0.11250 [0.09131, 0.13369] | 0.11875 [0.09666, 0.14084] | 0.00625 [-0.00190, 0.01440] |
| action:wait | 0.10125 [0.07885, 0.12365] | 0.10500 [0.08199, 0.12801] | 0.00375 [-0.00050, 0.00800] |
| outcome:good | 0.15250 [0.12503, 0.17997] | 0.15250 [0.12503, 0.17997] | 0.00000 [-0.00605, 0.00605] |
| outcome:bad | 0.47625 [0.44794, 0.50456] | 0.48000 [0.45175, 0.50825] | 0.00375 [-0.00443, 0.01193] |
| outcome:unfinished | 0.37125 [0.34861, 0.39389] | 0.36750 [0.34488, 0.39012] | -0.00375 [-0.01193, 0.00443] |
| action:fight+steal | 0.18625 [0.15829, 0.21421] | 0.18375 [0.15591, 0.21159] | -0.00250 [-0.00743, 0.00243] |
| entropy | 2.30088 [2.30079, 2.30097] | 2.29768 [2.29736, 2.29801] | -0.00320 [-0.00343, -0.00296] |
| switches | 0.89750 [0.86601, 0.92899] | 0.90000 [0.86874, 0.93126] | 0.00250 [-0.00855, 0.01355] |
| hunger | 0.58826 [0.58079, 0.59574] | 0.59014 [0.58285, 0.59743] | 0.00187 [-0.00025, 0.00400] |
| pain | 0.02850 [0.01951, 0.03749] | 0.02925 [0.02018, 0.03832] | 0.00075 [-0.00182, 0.00332] |
| earlyLossEffect | 4.058e-9 [3.690e-9, 4.426e-9] | 4.858e-9 [4.398e-9, 5.319e-9] | 8.006e-10 [6.952e-10, 9.060e-10] |

### gamma: 0.99 → 0.8

| Metric | Baseline | Changed | Paired difference |
| --- | --- | --- | --- |
| action:ask | 0.10875 [0.08704, 0.13046] | 0.10750 [0.08581, 0.12919] | -0.00125 [-0.00372, 0.00122] |
| action:trade | 0.09375 [0.07295, 0.11455] | 0.09250 [0.07173, 0.11327] | -0.00125 [-0.00553, 0.00303] |
| action:work | 0.09500 [0.07506, 0.11494] | 0.09500 [0.07506, 0.11494] | 0.00000 [-0.00494, 0.00494] |
| action:deceive | 0.10125 [0.08176, 0.12074] | 0.10375 [0.08420, 0.12330] | 0.00250 [-0.00098, 0.00598] |
| action:steal | 0.09750 [0.07602, 0.11898] | 0.09375 [0.07265, 0.11485] | -0.00375 [-0.00800, 0.00050] |
| action:fight | 0.08875 [0.06810, 0.10940] | 0.09250 [0.07173, 0.11327] | 0.00375 [-0.00050, 0.00800] |
| action:leave | 0.09750 [0.07602, 0.11898] | 0.09500 [0.07416, 0.11584] | -0.00250 [-0.00598, 0.00098] |
| action:keep | 0.10375 [0.08329, 0.12421] | 0.10750 [0.08667, 0.12833] | 0.00375 [-0.00050, 0.00800] |
| action:break | 0.11250 [0.09131, 0.13369] | 0.11250 [0.09103, 0.13397] | 0.00000 [-0.00349, 0.00349] |
| action:wait | 0.10125 [0.07885, 0.12365] | 0.10000 [0.07762, 0.12238] | -0.00125 [-0.00372, 0.00122] |
| outcome:good | 0.15250 [0.12503, 0.17997] | 0.15000 [0.12270, 0.17730] | -0.00250 [-0.00743, 0.00243] |
| outcome:bad | 0.47625 [0.44794, 0.50456] | 0.47875 [0.45019, 0.50731] | 0.00250 [-0.00243, 0.00743] |
| outcome:unfinished | 0.37125 [0.34861, 0.39389] | 0.37125 [0.34861, 0.39389] | 0.00000 [0.00000, 0.00000] |
| action:fight+steal | 0.18625 [0.15829, 0.21421] | 0.18625 [0.15829, 0.21421] | 0.00000 [0.00000, 0.00000] |
| entropy | 2.30088 [2.30079, 2.30097] | 2.30127 [2.30118, 2.30137] | 0.00039 [0.00038, 0.00040] |
| switches | 0.89750 [0.86601, 0.92899] | 0.89750 [0.86601, 0.92899] | 0.00000 [0.00000, 0.00000] |
| hunger | 0.58826 [0.58079, 0.59574] | 0.58889 [0.58148, 0.59630] | 0.00063 [-0.00151, 0.00276] |
| pain | 0.02850 [0.01951, 0.03749] | 0.03000 [0.02086, 0.03914] | 0.00150 [-0.00059, 0.00359] |
| earlyLossEffect | 4.058e-9 [3.690e-9, 4.426e-9] | 4.039e-9 [3.673e-9, 4.405e-9] | -1.875e-11 [-2.063e-11, -1.688e-11] |

### eta: 1 → 0.25

| Metric | Baseline | Changed | Paired difference |
| --- | --- | --- | --- |
| action:ask | 0.10875 [0.08704, 0.13046] | 0.10875 [0.08704, 0.13046] | 0.00000 [0.00000, 0.00000] |
| action:trade | 0.09375 [0.07295, 0.11455] | 0.09500 [0.07416, 0.11584] | 0.00125 [-0.00529, 0.00779] |
| action:work | 0.09500 [0.07506, 0.11494] | 0.09375 [0.07447, 0.11303] | -0.00125 [-0.00944, 0.00694] |
| action:deceive | 0.10125 [0.08176, 0.12074] | 0.10125 [0.08176, 0.12074] | 0.00000 [-0.00494, 0.00494] |
| action:steal | 0.09750 [0.07602, 0.11898] | 0.09500 [0.07387, 0.11613] | -0.00250 [-0.00598, 0.00098] |
| action:fight | 0.08875 [0.06810, 0.10940] | 0.09125 [0.07052, 0.11198] | 0.00250 [-0.00098, 0.00598] |
| action:leave | 0.09750 [0.07602, 0.11898] | 0.09500 [0.07416, 0.11584] | -0.00250 [-0.00743, 0.00243] |
| action:keep | 0.10375 [0.08329, 0.12421] | 0.10375 [0.08270, 0.12480] | 0.00000 [-0.00699, 0.00699] |
| action:break | 0.11250 [0.09131, 0.13369] | 0.11500 [0.09350, 0.13650] | 0.00250 [-0.00243, 0.00743] |
| action:wait | 0.10125 [0.07885, 0.12365] | 0.10125 [0.07885, 0.12365] | 0.00000 [0.00000, 0.00000] |
| outcome:good | 0.15250 [0.12503, 0.17997] | 0.15000 [0.12293, 0.17707] | -0.00250 [-0.00743, 0.00243] |
| outcome:bad | 0.47625 [0.44794, 0.50456] | 0.48000 [0.45218, 0.50782] | 0.00375 [-0.00175, 0.00925] |
| outcome:unfinished | 0.37125 [0.34861, 0.39389] | 0.37000 [0.34736, 0.39264] | -0.00125 [-0.00677, 0.00427] |
| action:fight+steal | 0.18625 [0.15829, 0.21421] | 0.18625 [0.15829, 0.21421] | 0.00000 [0.00000, 0.00000] |
| entropy | 2.30088 [2.30079, 2.30097] | 2.30140 [2.30139, 2.30141] | 0.00052 [0.00043, 0.00060] |
| switches | 0.89750 [0.86601, 0.92899] | 0.90000 [0.86874, 0.93126] | 0.00250 [-0.00243, 0.00743] |
| hunger | 0.58826 [0.58079, 0.59574] | 0.58951 [0.58216, 0.59686] | 0.00125 [-0.00122, 0.00372] |
| pain | 0.02850 [0.01951, 0.03749] | 0.03000 [0.02086, 0.03914] | 0.00150 [-0.00059, 0.00359] |
| earlyLossEffect | 4.058e-9 [3.690e-9, 4.426e-9] | 3.444e-9 [3.222e-9, 3.665e-9] | -6.141e-10 [-8.018e-10, -4.263e-10] |

### alpha0: 1 → 4

| Metric | Baseline | Changed | Paired difference |
| --- | --- | --- | --- |
| action:ask | 0.10875 [0.08704, 0.13046] | 0.10875 [0.08704, 0.13046] | 0.00000 [0.00000, 0.00000] |
| action:trade | 0.09375 [0.07295, 0.11455] | 0.09375 [0.07295, 0.11455] | 0.00000 [0.00000, 0.00000] |
| action:work | 0.09500 [0.07506, 0.11494] | 0.09500 [0.07506, 0.11494] | 0.00000 [0.00000, 0.00000] |
| action:deceive | 0.10125 [0.08176, 0.12074] | 0.10125 [0.08176, 0.12074] | 0.00000 [0.00000, 0.00000] |
| action:steal | 0.09750 [0.07602, 0.11898] | 0.09750 [0.07602, 0.11898] | 0.00000 [0.00000, 0.00000] |
| action:fight | 0.08875 [0.06810, 0.10940] | 0.08875 [0.06810, 0.10940] | 0.00000 [0.00000, 0.00000] |
| action:leave | 0.09750 [0.07602, 0.11898] | 0.09750 [0.07602, 0.11898] | 0.00000 [0.00000, 0.00000] |
| action:keep | 0.10375 [0.08329, 0.12421] | 0.10375 [0.08329, 0.12421] | 0.00000 [0.00000, 0.00000] |
| action:break | 0.11250 [0.09131, 0.13369] | 0.11250 [0.09131, 0.13369] | 0.00000 [0.00000, 0.00000] |
| action:wait | 0.10125 [0.07885, 0.12365] | 0.10125 [0.07885, 0.12365] | 0.00000 [0.00000, 0.00000] |
| outcome:good | 0.15250 [0.12503, 0.17997] | 0.15250 [0.12503, 0.17997] | 0.00000 [0.00000, 0.00000] |
| outcome:bad | 0.47625 [0.44794, 0.50456] | 0.47625 [0.44794, 0.50456] | 0.00000 [0.00000, 0.00000] |
| outcome:unfinished | 0.37125 [0.34861, 0.39389] | 0.37125 [0.34861, 0.39389] | 0.00000 [0.00000, 0.00000] |
| action:fight+steal | 0.18625 [0.15829, 0.21421] | 0.18625 [0.15829, 0.21421] | 0.00000 [0.00000, 0.00000] |
| entropy | 2.30088 [2.30079, 2.30097] | 2.30088 [2.30079, 2.30097] | -1.657e-9 [-7.738e-9, 4.424e-9] |
| switches | 0.89750 [0.86601, 0.92899] | 0.89750 [0.86601, 0.92899] | 0.00000 [0.00000, 0.00000] |
| hunger | 0.58826 [0.58079, 0.59574] | 0.58826 [0.58079, 0.59574] | 0.00000 [0.00000, 0.00000] |
| pain | 0.02850 [0.01951, 0.03749] | 0.02850 [0.01951, 0.03749] | 0.00000 [0.00000, 0.00000] |
| earlyLossEffect | 4.058e-9 [3.690e-9, 4.426e-9] | 1.014e-9 [9.225e-10, 1.106e-9] | -3.043e-9 [-3.319e-9, -2.767e-9] |

### d: 0.5 → 0.9

| Metric | Baseline | Changed | Paired difference |
| --- | --- | --- | --- |
| action:ask | 0.10875 [0.08704, 0.13046] | 0.10875 [0.08704, 0.13046] | 0.00000 [0.00000, 0.00000] |
| action:trade | 0.09375 [0.07295, 0.11455] | 0.09375 [0.07295, 0.11455] | 0.00000 [0.00000, 0.00000] |
| action:work | 0.09500 [0.07506, 0.11494] | 0.09500 [0.07506, 0.11494] | 0.00000 [0.00000, 0.00000] |
| action:deceive | 0.10125 [0.08176, 0.12074] | 0.10125 [0.08176, 0.12074] | 0.00000 [0.00000, 0.00000] |
| action:steal | 0.09750 [0.07602, 0.11898] | 0.09750 [0.07602, 0.11898] | 0.00000 [0.00000, 0.00000] |
| action:fight | 0.08875 [0.06810, 0.10940] | 0.08875 [0.06810, 0.10940] | 0.00000 [0.00000, 0.00000] |
| action:leave | 0.09750 [0.07602, 0.11898] | 0.09750 [0.07602, 0.11898] | 0.00000 [0.00000, 0.00000] |
| action:keep | 0.10375 [0.08329, 0.12421] | 0.10375 [0.08329, 0.12421] | 0.00000 [0.00000, 0.00000] |
| action:break | 0.11250 [0.09131, 0.13369] | 0.11250 [0.09131, 0.13369] | 0.00000 [0.00000, 0.00000] |
| action:wait | 0.10125 [0.07885, 0.12365] | 0.10125 [0.07885, 0.12365] | 0.00000 [0.00000, 0.00000] |
| outcome:good | 0.15250 [0.12503, 0.17997] | 0.15250 [0.12503, 0.17997] | 0.00000 [0.00000, 0.00000] |
| outcome:bad | 0.47625 [0.44794, 0.50456] | 0.47625 [0.44794, 0.50456] | 0.00000 [0.00000, 0.00000] |
| outcome:unfinished | 0.37125 [0.34861, 0.39389] | 0.37125 [0.34861, 0.39389] | 0.00000 [0.00000, 0.00000] |
| action:fight+steal | 0.18625 [0.15829, 0.21421] | 0.18625 [0.15829, 0.21421] | 0.00000 [0.00000, 0.00000] |
| entropy | 2.30088 [2.30079, 2.30097] | 2.30088 [2.30079, 2.30097] | -2.206e-9 [-1.030e-8, 5.889e-9] |
| switches | 0.89750 [0.86601, 0.92899] | 0.89750 [0.86601, 0.92899] | 0.00000 [0.00000, 0.00000] |
| hunger | 0.58826 [0.58079, 0.59574] | 0.58826 [0.58079, 0.59574] | 0.00000 [0.00000, 0.00000] |
| pain | 0.02850 [0.01951, 0.03749] | 0.02850 [0.01951, 0.03749] | 0.00000 [0.00000, 0.00000] |
| earlyLossEffect | 4.058e-9 [3.690e-9, 4.426e-9] | 4.696e-14 [4.271e-14, 5.122e-14] | -4.058e-9 [-4.426e-9, -3.690e-9] |

### tau: 0 → 1

| Metric | Baseline | Changed | Paired difference |
| --- | --- | --- | --- |
| action:ask | 0.10875 [0.08704, 0.13046] | 0.10875 [0.08704, 0.13046] | 0.00000 [0.00000, 0.00000] |
| action:trade | 0.09375 [0.07295, 0.11455] | 0.09375 [0.07295, 0.11455] | 0.00000 [0.00000, 0.00000] |
| action:work | 0.09500 [0.07506, 0.11494] | 0.09500 [0.07506, 0.11494] | 0.00000 [0.00000, 0.00000] |
| action:deceive | 0.10125 [0.08176, 0.12074] | 0.10125 [0.08176, 0.12074] | 0.00000 [0.00000, 0.00000] |
| action:steal | 0.09750 [0.07602, 0.11898] | 0.09750 [0.07602, 0.11898] | 0.00000 [0.00000, 0.00000] |
| action:fight | 0.08875 [0.06810, 0.10940] | 0.08875 [0.06810, 0.10940] | 0.00000 [0.00000, 0.00000] |
| action:leave | 0.09750 [0.07602, 0.11898] | 0.09750 [0.07602, 0.11898] | 0.00000 [0.00000, 0.00000] |
| action:keep | 0.10375 [0.08329, 0.12421] | 0.10375 [0.08329, 0.12421] | 0.00000 [0.00000, 0.00000] |
| action:break | 0.11250 [0.09131, 0.13369] | 0.11250 [0.09131, 0.13369] | 0.00000 [0.00000, 0.00000] |
| action:wait | 0.10125 [0.07885, 0.12365] | 0.10125 [0.07885, 0.12365] | 0.00000 [0.00000, 0.00000] |
| outcome:good | 0.15250 [0.12503, 0.17997] | 0.15250 [0.12503, 0.17997] | 0.00000 [0.00000, 0.00000] |
| outcome:bad | 0.47625 [0.44794, 0.50456] | 0.47625 [0.44794, 0.50456] | 0.00000 [0.00000, 0.00000] |
| outcome:unfinished | 0.37125 [0.34861, 0.39389] | 0.37125 [0.34861, 0.39389] | 0.00000 [0.00000, 0.00000] |
| action:fight+steal | 0.18625 [0.15829, 0.21421] | 0.18625 [0.15829, 0.21421] | 0.00000 [0.00000, 0.00000] |
| entropy | 2.30088 [2.30079, 2.30097] | 2.30088 [2.30079, 2.30097] | -2.028e-9 [-9.471e-9, 5.414e-9] |
| switches | 0.89750 [0.86601, 0.92899] | 0.89750 [0.86601, 0.92899] | 0.00000 [0.00000, 0.00000] |
| hunger | 0.58826 [0.58079, 0.59574] | 0.58826 [0.58079, 0.59574] | 0.00000 [0.00000, 0.00000] |
| pain | 0.02850 [0.01951, 0.03749] | 0.02850 [0.01951, 0.03749] | 0.00000 [0.00000, 0.00000] |
| earlyLossEffect | 4.058e-9 [3.690e-9, 4.426e-9] | 3.331e-10 [3.029e-10, 3.633e-10] | -3.725e-9 [-4.062e-9, -3.387e-9] |

### s: 0.4 → 0.8

| Metric | Baseline | Changed | Paired difference |
| --- | --- | --- | --- |
| action:ask | 0.10875 [0.08704, 0.13046] | 0.10875 [0.08704, 0.13046] | 0.00000 [0.00000, 0.00000] |
| action:trade | 0.09375 [0.07295, 0.11455] | 0.09375 [0.07295, 0.11455] | 0.00000 [0.00000, 0.00000] |
| action:work | 0.09500 [0.07506, 0.11494] | 0.09500 [0.07506, 0.11494] | 0.00000 [0.00000, 0.00000] |
| action:deceive | 0.10125 [0.08176, 0.12074] | 0.10125 [0.08176, 0.12074] | 0.00000 [0.00000, 0.00000] |
| action:steal | 0.09750 [0.07602, 0.11898] | 0.09750 [0.07602, 0.11898] | 0.00000 [0.00000, 0.00000] |
| action:fight | 0.08875 [0.06810, 0.10940] | 0.08875 [0.06810, 0.10940] | 0.00000 [0.00000, 0.00000] |
| action:leave | 0.09750 [0.07602, 0.11898] | 0.09750 [0.07602, 0.11898] | 0.00000 [0.00000, 0.00000] |
| action:keep | 0.10375 [0.08329, 0.12421] | 0.10375 [0.08329, 0.12421] | 0.00000 [0.00000, 0.00000] |
| action:break | 0.11250 [0.09131, 0.13369] | 0.11250 [0.09131, 0.13369] | 0.00000 [0.00000, 0.00000] |
| action:wait | 0.10125 [0.07885, 0.12365] | 0.10125 [0.07885, 0.12365] | 0.00000 [0.00000, 0.00000] |
| outcome:good | 0.15250 [0.12503, 0.17997] | 0.15250 [0.12503, 0.17997] | 0.00000 [0.00000, 0.00000] |
| outcome:bad | 0.47625 [0.44794, 0.50456] | 0.47625 [0.44794, 0.50456] | 0.00000 [0.00000, 0.00000] |
| outcome:unfinished | 0.37125 [0.34861, 0.39389] | 0.37125 [0.34861, 0.39389] | 0.00000 [0.00000, 0.00000] |
| action:fight+steal | 0.18625 [0.15829, 0.21421] | 0.18625 [0.15829, 0.21421] | 0.00000 [0.00000, 0.00000] |
| entropy | 2.30088 [2.30079, 2.30097] | 2.30088 [2.30079, 2.30097] | 1.052e-7 [-3.099e-7, 5.202e-7] |
| switches | 0.89750 [0.86601, 0.92899] | 0.89750 [0.86601, 0.92899] | 0.00000 [0.00000, 0.00000] |
| hunger | 0.58826 [0.58079, 0.59574] | 0.58826 [0.58079, 0.59574] | 0.00000 [0.00000, 0.00000] |
| pain | 0.02850 [0.01951, 0.03749] | 0.02850 [0.01951, 0.03749] | 0.00000 [0.00000, 0.00000] |
| earlyLossEffect | 4.058e-9 [3.690e-9, 4.426e-9] | 4.930e-6 [4.483e-6, 5.377e-6] | 4.926e-6 [4.480e-6, 5.373e-6] |

### kappa: 0 → 0.5

| Metric | Baseline | Changed | Paired difference |
| --- | --- | --- | --- |
| action:ask | 0.10875 [0.08704, 0.13046] | 0.10000 [0.07139, 0.12861] | -0.00875 [-0.02864, 0.01114] |
| action:trade | 0.09375 [0.07295, 0.11455] | 0.11625 [0.08642, 0.14608] | 0.02250 [0.00531, 0.03969] |
| action:work | 0.09500 [0.07506, 0.11494] | 0.12500 [0.09433, 0.15567] | 0.03000 [0.01233, 0.04767] |
| action:deceive | 0.10125 [0.08176, 0.12074] | 0.10750 [0.08031, 0.13469] | 0.00625 [-0.01138, 0.02388] |
| action:steal | 0.09750 [0.07602, 0.11898] | 0.12125 [0.09019, 0.15231] | 0.02375 [0.00573, 0.04177] |
| action:fight | 0.08875 [0.06810, 0.10940] | 0.07000 [0.05081, 0.08919] | -0.01875 [-0.02795, -0.00955] |
| action:leave | 0.09750 [0.07602, 0.11898] | 0.12125 [0.08961, 0.15289] | 0.02375 [0.00677, 0.04073] |
| action:keep | 0.10375 [0.08329, 0.12421] | 0.08500 [0.06510, 0.10490] | -0.01875 [-0.02795, -0.00955] |
| action:break | 0.11250 [0.09131, 0.13369] | 0.07500 [0.05684, 0.09316] | -0.03750 [-0.05046, -0.02454] |
| action:wait | 0.10125 [0.07885, 0.12365] | 0.07875 [0.05880, 0.09870] | -0.02250 [-0.03366, -0.01134] |
| outcome:good | 0.15250 [0.12503, 0.17997] | 0.16583 [0.13366, 0.19801] | 0.01333 [-0.00100, 0.02767] |
| outcome:bad | 0.47625 [0.44794, 0.50456] | 0.28417 [0.24553, 0.32281] | -0.19208 [-0.21829, -0.16587] |
| outcome:unfinished | 0.37125 [0.34861, 0.39389] | 0.55000 [0.50666, 0.59334] | 0.17875 [0.15142, 0.20608] |
| action:fight+steal | 0.18625 [0.15829, 0.21421] | 0.19125 [0.15737, 0.22513] | 0.00500 [-0.01537, 0.02537] |
| entropy | 2.30088 [2.30079, 2.30097] | 2.30088 [2.30079, 2.30097] | 0.00000 [0.00000, 0.00000] |
| switches | 0.89750 [0.86601, 0.92899] | 0.40750 [0.35658, 0.45842] | -0.49000 [-0.54087, -0.43913] |
| hunger | 0.58826 [0.58079, 0.59574] | 0.58826 [0.58079, 0.59574] | 0.00000 [0.00000, 0.00000] |
| pain | 0.02850 [0.01951, 0.03749] | 0.02850 [0.01951, 0.03749] | 0.00000 [0.00000, 0.00000] |
| earlyLossEffect | 4.058e-9 [3.690e-9, 4.426e-9] | 4.058e-9 [3.690e-9, 4.426e-9] | 0.00000 [0.00000, 0.00000] |

### k: 0 → 1

| Metric | Baseline | Changed | Paired difference |
| --- | --- | --- | --- |
| action:ask | 0.10875 [0.08704, 0.13046] | 0.10875 [0.08704, 0.13046] | 0.00000 [0.00000, 0.00000] |
| action:trade | 0.09375 [0.07295, 0.11455] | 0.09625 [0.07538, 0.11712] | 0.00250 [-0.00354, 0.00854] |
| action:work | 0.09500 [0.07506, 0.11494] | 0.09250 [0.07294, 0.11206] | -0.00250 [-0.01031, 0.00531] |
| action:deceive | 0.10125 [0.08176, 0.12074] | 0.09625 [0.07689, 0.11561] | -0.00500 [-0.01195, 0.00195] |
| action:steal | 0.09750 [0.07602, 0.11898] | 0.09875 [0.07752, 0.11998] | 0.00125 [-0.00529, 0.00779] |
| action:fight | 0.08875 [0.06810, 0.10940] | 0.09500 [0.07358, 0.11642] | 0.00625 [0.00079, 0.01171] |
| action:leave | 0.09750 [0.07602, 0.11898] | 0.09250 [0.07173, 0.11327] | -0.00500 [-0.01101, 0.00101] |
| action:keep | 0.10375 [0.08329, 0.12421] | 0.10500 [0.08393, 0.12607] | 0.00125 [-0.00529, 0.00779] |
| action:break | 0.11250 [0.09131, 0.13369] | 0.11375 [0.09255, 0.13495] | 0.00125 [-0.00303, 0.00553] |
| action:wait | 0.10125 [0.07885, 0.12365] | 0.10125 [0.07885, 0.12365] | 0.00000 [0.00000, 0.00000] |
| outcome:good | 0.15250 [0.12503, 0.17997] | 0.17750 [0.14963, 0.20537] | 0.02500 [0.01146, 0.03854] |
| outcome:bad | 0.47625 [0.44794, 0.50456] | 0.46500 [0.43596, 0.49404] | -0.01125 [-0.02300, 0.00050] |
| outcome:unfinished | 0.37125 [0.34861, 0.39389] | 0.35750 [0.33445, 0.38055] | -0.01375 [-0.02435, -0.00315] |
| action:fight+steal | 0.18625 [0.15829, 0.21421] | 0.19375 [0.16505, 0.22245] | 0.00750 [0.00154, 0.01346] |
| entropy | 2.30088 [2.30079, 2.30097] | 2.30121 [2.30117, 2.30125] | 0.00032 [0.00024, 0.00041] |
| switches | 0.89750 [0.86601, 0.92899] | 0.90000 [0.86874, 0.93126] | 0.00250 [-0.00243, 0.00743] |
| hunger | 0.58826 [0.58079, 0.59574] | 0.57576 [0.56665, 0.58488] | -0.01250 [-0.01927, -0.00573] |
| pain | 0.02850 [0.01951, 0.03749] | 0.03300 [0.02335, 0.04265] | 0.00450 [0.00092, 0.00808] |
| earlyLossEffect | 4.058e-9 [3.690e-9, 4.426e-9] | 3.622e-9 [3.377e-9, 3.866e-9] | -4.362e-10 [-8.348e-10, -3.754e-11] |

### Direction assertions

- beta / entropy: PASS, paired change -0.02351 [-0.02432, -0.02269]; strict mean decrease required.
- kappa / switches: PASS, paired change -0.49000 [-0.54087, -0.43913]; strict mean decrease required.
- d / earlyLossEffect: PASS, paired change -4.058e-9 [-4.426e-9, -3.690e-9]; strict mean decrease required.

### Lambda fixed-context verification (COG-19)

For every recorded study decision (all minds, baseline, all ten interventions and frozen controls), re-evaluate at lambda 2.25 and 4.5 while holding needs, generated repertoire, beliefs, episodes, time and every other parameter fixed. No decision subset is selected.
Define positive discounted expected loss L = -discount × Σ P(o) min(0, net). Assert EU(4.5) - EU(2.25) = -2.25 L for every candidate (relative/absolute tolerance 1e-10). Assert a strict decrease in the pre-commitment Luce probability of every maximum-L candidate when beta > 0 and losses differ; otherwise assert equality. Commitment can retain an intention independently of that Luce probability.
- lambda: PASS; 16200 decisions, 221400 candidate EU checks, 19033 strict probability checks, 0 equality checks; maximum absolute EU residual 2.220446049250313e-16.

### Why fight frequency is invariant

- baseline paired worlds: 71 chosen visitor fight decisions; discounted expected loss L mean 0.02618, range [0.00618, 0.19637]; zero-loss decisions 0.
  All-alternative availability: 71/71 have a positive-probability alternative; 71/71 have an alternative whose Luce probability moves under lambda. Fight P mean 0.09865 -> 0.09740, delta range [-0.02123, 0.00230].
  Retained by commitment: 0; non-retained choices whose recorded draw still selects fight at lambda 4.5 in the same context: 70/71.
- changed paired worlds: 71 chosen visitor fight decisions; discounted expected loss L mean 0.02522, range [0.00618, 0.19637]; zero-loss decisions 0.
  All-alternative availability: 71/71 have a positive-probability alternative; 71/71 have an alternative whose Luce probability moves under lambda. Fight P mean 0.09883 -> 0.09772, delta range [-0.02123, 0.00230].
  Retained by commitment: 0; non-retained choices whose recorded draw still selects fight at lambda 4.5 in the same context: 71/71.
Paired visitor decision positions changing fight/non-fight status: 2; 1 fight choices lost and 1 gained. Their cancellation explains the equal realized frequencies in this finite-seed fixture; it is not a structural invariance of fight's utility or probability. Fight can gain Luce probability even while its EU falls when competing actions lose more EU. Population frequencies and intervals above are descriptive. Lambda reaches fight's evaluator (covered by every-candidate checks). No evaluator fix or fixture tuning was needed.

## What this does not show

DESIGN §10 V5: no independent data exist for this scene; none are in hand. The CB-7 directions are consequences of the formulas, not validation of how real hungry people choose. Closed-loop feedback and shared resources can also defeat a monotonic direction inferred from a single fixed-context formula. A failed direction is reported, not repaired by choosing favorable seeds.
The experiment that would test the scene is a laboratory scarcity game with a stronger owner, using dictator/ultimatum and theft-option designs in experimental economics. Compare preregistered action frequencies, outcomes and learning trajectories against held-out human data. This report contains no such data or validation tolerance.
No sibling repository was changed or tested under the folder-only instruction. Kernel is exercised through the linked public package. Reality, Settlement, Economy and pirate-ship integration remain outside this fixture's evidence.

Regenerate: `npm run bench`. Run acceptance: `npx vitest run test/bench-acceptance.test.ts`.
