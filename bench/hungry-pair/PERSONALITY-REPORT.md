# Hungry pair: personality versions

Status: T-3 comparison completed; experimental level 5, no empirical validation.

Measured metrics respond to single-formula removal of: F1, F2, F3, F12. Trace-only sensitivity: F8. These are observed interventions, not claims of statistical significance or validation; paired intervals and coverage appear below.

Reproduce from the repository root: `node --experimental-strip-types bench/personality-versions.ts`. The runner checks the baseline acceptance and independent audit artifacts before enabling comparison personalities.

Protocol: seeds 1–200; 12 epochs × 10 minutes per world; A, B and owner O receive the SAME model and type in each run.
The null model is run once per seed and reused as the paired control for every stack. All other tests and engine defaults remain nullPersonality.
Common random numbers: identical seed, mind mint order and kernel mechanism/entity stream keys in every paired run. Branches may consume different numbers of draws; this is common-stream coupling, not forced event alignment.
The 12-epoch comparison is shorter than DESIGN §6's 144-epoch demonstration. The production 12-epoch horizon includes the six-epoch travel duration but cannot establish day-long stabilization.
Host options: etaMin=0.01 (proposed); no extra context, compounds or other-mind adapter. All cognitive parameters and fixture rules remain at baseline settings.

Source SHA256: 0bfb10cb903e1d60af952d572a7ef4678fd1634e6ea4257e927cd7919ab49cf3
Comparison code SHA256: f9477b3042492599d61de123699a4a185178095a1cff382519a3ba2c7eb643ee
Frozen personality SHA256: 82637f6d49a0ddabb10e0d149076e6849635b31b26f5a08911140e227cf3b0a7
Fixture SHA256: 513483265e7ad21c3dad7f9134049b8c46b73f860c5fb58a370c38e46a27f946
Seed metrics and trace hashes SHA256 (JSON per-seed records + LF): 3f95571df98bd72e7e4ca4f2a07121b02cfb0cf1bcf4281d8ed8223b3de80152

## Verification and sampling

Null-vs-null: 200/200 independently repeated worlds are byte-identical (canonical full-run SHA256); all metric differences are exactly zero.
Every-formula-off vs null: 3200/3200 stack/seed controls pass. One stack per version/seed is independently rerun; the others additionally pass exhaustive hook-output equivalence to an executed world.
Full world executions: 7400; exact equivalent configurations: 41000. Each execution restores/replays cognition and host logs.
Execution sharing checks every hook call/input/output from a completed deterministic run, including replay; it never estimates equivalence from a few probe parameters. Any changed output forces a fresh world run. Each non-equivalent single-formula ablation is rerun under the same seed.
Intervals are approximate two-sided 95% Student-t intervals across independent seeds, with conservative tabulated critical values; epochs are never treated as independent observations. A/B/O are reported separately. Paired intervals use seedwise differences and only common nonmissing pairs. Conditional estimates report n. n<2 has no estimable interval; N/A is never zero. Intervals are unadjusted exploratory intervals across many metrics, not significance declarations; proportion intervals are not clipped.

## Measurements

Action frequency is the share of each mind's decision epochs, including retained commitments, grouped by the selected action's host domain. Outcome frequencies use causal intention receipts within that domain (good/bad/unfinished), so their denominator differs from decision frequency. Receipts is a count per seed; unfinished explicitly includes horizon censoring.
Learning speed: for each mind/domain, find its first completed informative outcome (any latent KL>0), using the selected action's domain. Sort all candidates in that domain by EU, retaining ties and candidate membership. Find the beginning of the final unchanged ranking suffix strictly after that outcome, requiring at least three consecutive epochs through the horizon and at least two candidates. Report epochs from feedback to that beginning. A later reversal invalidates an earlier plateau. This retrospective finite-horizon measure also reflects changing needs, observations and opportunities, so it does not isolate a learning-rate parameter.
informative, stabilized and censored are per-seed indicator means. Censored means informative feedback occurred but the stability criterion was not observed; no-informative runs are separate. learning-epochs averages observed stabilizers only; differences can reflect selection into that subset. Inspect coverage alongside speed; this is not an uncensored population time-to-learning estimate.
The host supplies decision domains body and people; wait may supply none. space/adaptation/meta/cohesion/strategy have no comparable action ranking in this fixture. They are retained below as untested (zero coverage, N/A speed), never inferred from a type name.

## Hook coverage

| Formula | Hook and scope in this experiment |
|---|---|
| F1 | interpret: eta in sensory belief updates (neutral none domain) and outcome learning; alpha0 in action evaluation. |
| F2 | pertinence: attitude attention transform is wired at the public sensory boundary. |
| F3 | interpret: lambda; absent failure-history adapter means n_fail=0. Resilience's history term is untested. |
| F4/F5 | learning and F4 pertinence: no relevant space/adaptation/meta learning latents or cue-category domain tags. |
| F6 | pertinence/interpret: absent physical/present/targeted tags; targeted perception wiring is untested. |
| F7 | interpret: no on function owns the fixture's body/people/none action domains; confidence is identity here. |
| F8 | learning: d/half-life appear in latent diagnostics; existing evaluation retrieval and fixture drift do not consume these overrides. Behavioral zero here is a wiring limit. |
| F9/F10 | generate: no host compound executor or believed-other-mind adapter; these effects are untested. |
| F11 | generate: commitment kappa is consumed by selection, but the baseline kappa=0 makes this multiplicative formula identity. Nonzero commitment effects are untested here. |
| F12 | interpret: person alpha0 is consumed by evaluation. |
| F13 | interpret: no testimony-context adapter; testimony wiring is untested. |
| W / DELTA | Frozen stack weights and attitude derivation, retained for all hook ablations; F1–F13 are the separately switched hook formulas. |
| OFF-* | Frozen explicitly off formulas remain identity throughout. |

## Per-configuration action frequencies, outcomes and learning

### null

| Mind/domain/metric | Mean [95% interval]; seeds |
|---|---|
| A/adaptation/censored | 0 [0, 0]; n=200 |
| A/adaptation/informative | 0 [0, 0]; n=200 |
| A/adaptation/learning-epochs | N/A (n=0) |
| A/adaptation/stabilized | 0 [0, 0]; n=200 |
| A/body/action:fight | 0.1042 [0.0920, 0.1164]; n=200 |
| A/body/action:steal | 0.0988 [0.0861, 0.1114]; n=200 |
| A/body/censored | 0.4800 [0.4101, 0.5499]; n=200 |
| A/body/informative | 0.9200 [0.8821, 0.9579]; n=200 |
| A/body/learning-epochs | 3.3182 [2.7922, 3.8442]; n=88 |
| A/body/outcome:bad | 0.8787 [0.8451, 0.9123]; n=184 |
| A/body/outcome:good | 0.1119 [0.0786, 0.1451]; n=184 |
| A/body/outcome:unfinished | 0.0094 [0.0017, 0.0171]; n=184 |
| A/body/receipts | 2.4350 [2.2263, 2.6437]; n=200 |
| A/body/stabilized | 0.4400 [0.3706, 0.5094]; n=200 |
| A/cohesion/censored | 0 [0, 0]; n=200 |
| A/cohesion/informative | 0 [0, 0]; n=200 |
| A/cohesion/learning-epochs | N/A (n=0) |
| A/cohesion/stabilized | 0 [0, 0]; n=200 |
| A/meta/censored | 0 [0, 0]; n=200 |
| A/meta/informative | 0 [0, 0]; n=200 |
| A/meta/learning-epochs | N/A (n=0) |
| A/meta/stabilized | 0 [0, 0]; n=200 |
| A/none/censored | 0 [0, 0]; n=200 |
| A/none/informative | 0 [0, 0]; n=200 |
| A/none/learning-epochs | N/A (n=0) |
| A/none/stabilized | 0 [0, 0]; n=200 |
| A/people/action:ask | 0.1108 [0.0987, 0.1230]; n=200 |
| A/people/action:break | 0.1146 [0.1014, 0.1278]; n=200 |
| A/people/action:deceive | 0.1100 [0.0985, 0.1215]; n=200 |
| A/people/action:keep | 0.0971 [0.0845, 0.1096]; n=200 |
| A/people/action:leave | 0.0937 [0.0816, 0.1059]; n=200 |
| A/people/action:trade | 0.0879 [0.0761, 0.0997]; n=200 |
| A/people/action:wait | 0.0979 [0.0855, 0.1103]; n=200 |
| A/people/action:work | 0.0850 [0.0735, 0.0965]; n=200 |
| A/people/censored | 0.9550 [0.9260, 0.9840]; n=200 |
| A/people/informative | 1.0000 [1.0000, 1.0000]; n=200 |
| A/people/learning-epochs | 8.3333 [7.5643, 9.1023]; n=9 |
| A/people/outcome:bad | 0.7573 [0.7400, 0.7747]; n=200 |
| A/people/outcome:good | 0.1573 [0.1405, 0.1741]; n=200 |
| A/people/outcome:unfinished | 0.0854 [0.0790, 0.0917]; n=200 |
| A/people/receipts | 9.5650 [9.3563, 9.7737]; n=200 |
| A/people/stabilized | 0.0450 [0.0160, 0.0740]; n=200 |
| A/space/censored | 0 [0, 0]; n=200 |
| A/space/informative | 0 [0, 0]; n=200 |
| A/space/learning-epochs | N/A (n=0) |
| A/space/stabilized | 0 [0, 0]; n=200 |
| A/strategy/censored | 0 [0, 0]; n=200 |
| A/strategy/informative | 0 [0, 0]; n=200 |
| A/strategy/learning-epochs | N/A (n=0) |
| A/strategy/stabilized | 0 [0, 0]; n=200 |
| B/adaptation/censored | 0 [0, 0]; n=200 |
| B/adaptation/informative | 0 [0, 0]; n=200 |
| B/adaptation/learning-epochs | N/A (n=0) |
| B/adaptation/stabilized | 0 [0, 0]; n=200 |
| B/body/action:fight | 0.1029 [0.0905, 0.1154]; n=200 |
| B/body/action:steal | 0.0996 [0.0881, 0.1111]; n=200 |
| B/body/censored | 0.5000 [0.4301, 0.5699]; n=200 |
| B/body/informative | 0.9250 [0.8882, 0.9618]; n=200 |
| B/body/learning-epochs | 3.6118 [3.1060, 4.1176]; n=85 |
| B/body/outcome:bad | 0.8481 [0.8088, 0.8874]; n=187 |
| B/body/outcome:good | 0.1113 [0.0760, 0.1466]; n=187 |
| B/body/outcome:unfinished | 0.0406 [0.0202, 0.0609]; n=187 |
| B/body/receipts | 2.4300 [2.2370, 2.6230]; n=200 |
| B/body/stabilized | 0.4250 [0.3559, 0.4941]; n=200 |
| B/cohesion/censored | 0 [0, 0]; n=200 |
| B/cohesion/informative | 0 [0, 0]; n=200 |
| B/cohesion/learning-epochs | N/A (n=0) |
| B/cohesion/stabilized | 0 [0, 0]; n=200 |
| B/meta/censored | 0 [0, 0]; n=200 |
| B/meta/informative | 0 [0, 0]; n=200 |
| B/meta/learning-epochs | N/A (n=0) |
| B/meta/stabilized | 0 [0, 0]; n=200 |
| B/none/censored | 0 [0, 0]; n=200 |
| B/none/informative | 0 [0, 0]; n=200 |
| B/none/learning-epochs | N/A (n=0) |
| B/none/stabilized | 0 [0, 0]; n=200 |
| B/people/action:ask | 0.0967 [0.0844, 0.1090]; n=200 |
| B/people/action:break | 0.1058 [0.0939, 0.1178]; n=200 |
| B/people/action:deceive | 0.1071 [0.0954, 0.1188]; n=200 |
| B/people/action:keep | 0.0950 [0.0836, 0.1064]; n=200 |
| B/people/action:leave | 0.0892 [0.0785, 0.0999]; n=200 |
| B/people/action:trade | 0.1033 [0.0907, 0.1160]; n=200 |
| B/people/action:wait | 0.1029 [0.0911, 0.1147]; n=200 |
| B/people/action:work | 0.0975 [0.0853, 0.1097]; n=200 |
| B/people/censored | 0.9400 [0.9068, 0.9732]; n=200 |
| B/people/informative | 1.0000 [1.0000, 1.0000]; n=200 |
| B/people/learning-epochs | 7.4167 [6.5294, 8.3040]; n=12 |
| B/people/outcome:bad | 0.7578 [0.7397, 0.7760]; n=200 |
| B/people/outcome:good | 0.1644 [0.1469, 0.1819]; n=200 |
| B/people/outcome:unfinished | 0.0778 [0.0710, 0.0845]; n=200 |
| B/people/receipts | 9.5700 [9.3770, 9.7630]; n=200 |
| B/people/stabilized | 0.0600 [0.0268, 0.0932]; n=200 |
| B/space/censored | 0 [0, 0]; n=200 |
| B/space/informative | 0 [0, 0]; n=200 |
| B/space/learning-epochs | N/A (n=0) |
| B/space/stabilized | 0 [0, 0]; n=200 |
| B/strategy/censored | 0 [0, 0]; n=200 |
| B/strategy/informative | 0 [0, 0]; n=200 |
| B/strategy/learning-epochs | N/A (n=0) |
| B/strategy/stabilized | 0 [0, 0]; n=200 |
| O/adaptation/censored | 0 [0, 0]; n=200 |
| O/adaptation/informative | 0 [0, 0]; n=200 |
| O/adaptation/learning-epochs | N/A (n=0) |
| O/adaptation/stabilized | 0 [0, 0]; n=200 |
| O/body/action:confront | 0.1075 [0.0950, 0.1200]; n=200 |
| O/body/censored | 0.5600 [0.4906, 0.6294]; n=200 |
| O/body/informative | 0.7300 [0.6679, 0.7921]; n=200 |
| O/body/learning-epochs | 4.3824 [3.5731, 5.1916]; n=34 |
| O/body/outcome:bad | 0.9372 [0.9002, 0.9742]; n=146 |
| O/body/outcome:good | 0.0628 [0.0258, 0.0998]; n=146 |
| O/body/outcome:unfinished | 0 [0, 0]; n=146 |
| O/body/receipts | 1.2900 [1.1403, 1.4397]; n=200 |
| O/body/stabilized | 0.1700 [0.1175, 0.2225]; n=200 |
| O/cohesion/censored | 0 [0, 0]; n=200 |
| O/cohesion/informative | 0 [0, 0]; n=200 |
| O/cohesion/learning-epochs | N/A (n=0) |
| O/cohesion/stabilized | 0 [0, 0]; n=200 |
| O/meta/censored | 0 [0, 0]; n=200 |
| O/meta/informative | 0 [0, 0]; n=200 |
| O/meta/learning-epochs | N/A (n=0) |
| O/meta/stabilized | 0 [0, 0]; n=200 |
| O/none/censored | 0 [0, 0]; n=200 |
| O/none/informative | 0 [0, 0]; n=200 |
| O/none/learning-epochs | N/A (n=0) |
| O/none/stabilized | 0 [0, 0]; n=200 |
| O/people/action:accept_promise | 0.0950 [0.0827, 0.1073]; n=200 |
| O/people/action:accept_trade | 0.0738 [0.0635, 0.0840]; n=200 |
| O/people/action:accept_work | 0.1412 [0.1274, 0.1551]; n=200 |
| O/people/action:chase | 0.1083 [0.0955, 0.1212]; n=200 |
| O/people/action:give | 0.0796 [0.0683, 0.0908]; n=200 |
| O/people/action:let_go | 0.0454 [0.0371, 0.0537]; n=200 |
| O/people/action:pay | 0.0696 [0.0595, 0.0797]; n=200 |
| O/people/action:refuse | 0.1171 [0.1040, 0.1301]; n=200 |
| O/people/action:renege | 0.1100 [0.0972, 0.1228]; n=200 |
| O/people/action:wait | 0.0525 [0.0432, 0.0618]; n=200 |
| O/people/censored | 1.0000 [1.0000, 1.0000]; n=200 |
| O/people/informative | 1.0000 [1.0000, 1.0000]; n=200 |
| O/people/learning-epochs | N/A (n=0) |
| O/people/outcome:bad | 0.7863 [0.7677, 0.8050]; n=200 |
| O/people/outcome:good | 0.2061 [0.1875, 0.2248]; n=200 |
| O/people/outcome:unfinished | 0.0075 [0.0040, 0.0111]; n=200 |
| O/people/receipts | 10.7100 [10.5603, 10.8597]; n=200 |
| O/people/stabilized | 0 [0, 0]; n=200 |
| O/space/censored | 0 [0, 0]; n=200 |
| O/space/informative | 0 [0, 0]; n=200 |
| O/space/learning-epochs | N/A (n=0) |
| O/space/stabilized | 0 [0, 0]; n=200 |
| O/strategy/censored | 0 [0, 0]; n=200 |
| O/strategy/informative | 0 [0, 0]; n=200 |
| O/strategy/learning-epochs | N/A (n=0) |
| O/strategy/stabilized | 0 [0, 0]; n=200 |

### v1/ENTP

| Mind/domain/metric | Mean [95% interval]; seeds |
|---|---|
| A/adaptation/censored | 0 [0, 0]; n=200 |
| A/adaptation/informative | 0 [0, 0]; n=200 |
| A/adaptation/learning-epochs | N/A (n=0) |
| A/adaptation/stabilized | 0 [0, 0]; n=200 |
| A/body/action:fight | 0.1050 [0.0929, 0.1171]; n=200 |
| A/body/action:steal | 0.0996 [0.0869, 0.1123]; n=200 |
| A/body/censored | 0.4750 [0.4052, 0.5448]; n=200 |
| A/body/informative | 0.9200 [0.8821, 0.9579]; n=200 |
| A/body/learning-epochs | 3.1685 [2.6439, 3.6932]; n=89 |
| A/body/outcome:bad | 0.8716 [0.8370, 0.9063]; n=184 |
| A/body/outcome:good | 0.1141 [0.0801, 0.1481]; n=184 |
| A/body/outcome:unfinished | 0.0142 [0.0042, 0.0243]; n=184 |
| A/body/receipts | 2.4550 [2.2462, 2.6638]; n=200 |
| A/body/stabilized | 0.4450 [0.3755, 0.5145]; n=200 |
| A/cohesion/censored | 0 [0, 0]; n=200 |
| A/cohesion/informative | 0 [0, 0]; n=200 |
| A/cohesion/learning-epochs | N/A (n=0) |
| A/cohesion/stabilized | 0 [0, 0]; n=200 |
| A/meta/censored | 0 [0, 0]; n=200 |
| A/meta/informative | 0 [0, 0]; n=200 |
| A/meta/learning-epochs | N/A (n=0) |
| A/meta/stabilized | 0 [0, 0]; n=200 |
| A/none/censored | 0 [0, 0]; n=200 |
| A/none/informative | 0 [0, 0]; n=200 |
| A/none/learning-epochs | N/A (n=0) |
| A/none/stabilized | 0 [0, 0]; n=200 |
| A/people/action:ask | 0.1092 [0.0970, 0.1213]; n=200 |
| A/people/action:break | 0.1133 [0.1002, 0.1264]; n=200 |
| A/people/action:deceive | 0.1087 [0.0973, 0.1202]; n=200 |
| A/people/action:keep | 0.0983 [0.0858, 0.1108]; n=200 |
| A/people/action:leave | 0.0937 [0.0818, 0.1057]; n=200 |
| A/people/action:trade | 0.0892 [0.0774, 0.1009]; n=200 |
| A/people/action:wait | 0.0971 [0.0847, 0.1095]; n=200 |
| A/people/action:work | 0.0858 [0.0744, 0.0973]; n=200 |
| A/people/censored | 0.9200 [0.8821, 0.9579]; n=200 |
| A/people/informative | 1.0000 [1.0000, 1.0000]; n=200 |
| A/people/learning-epochs | 7.8125 [7.1606, 8.4644]; n=16 |
| A/people/outcome:bad | 0.7615 [0.7442, 0.7787]; n=200 |
| A/people/outcome:good | 0.1555 [0.1388, 0.1721]; n=200 |
| A/people/outcome:unfinished | 0.0831 [0.0764, 0.0897]; n=200 |
| A/people/receipts | 9.5450 [9.3362, 9.7538]; n=200 |
| A/people/stabilized | 0.0800 [0.0421, 0.1179]; n=200 |
| A/space/censored | 0 [0, 0]; n=200 |
| A/space/informative | 0 [0, 0]; n=200 |
| A/space/learning-epochs | N/A (n=0) |
| A/space/stabilized | 0 [0, 0]; n=200 |
| A/strategy/censored | 0 [0, 0]; n=200 |
| A/strategy/informative | 0 [0, 0]; n=200 |
| A/strategy/learning-epochs | N/A (n=0) |
| A/strategy/stabilized | 0 [0, 0]; n=200 |
| B/adaptation/censored | 0 [0, 0]; n=200 |
| B/adaptation/informative | 0 [0, 0]; n=200 |
| B/adaptation/learning-epochs | N/A (n=0) |
| B/adaptation/stabilized | 0 [0, 0]; n=200 |
| B/body/action:fight | 0.1046 [0.0919, 0.1173]; n=200 |
| B/body/action:steal | 0.0979 [0.0865, 0.1094]; n=200 |
| B/body/censored | 0.5000 [0.4301, 0.5699]; n=200 |
| B/body/informative | 0.9250 [0.8882, 0.9618]; n=200 |
| B/body/learning-epochs | 3.3882 [2.8747, 3.9017]; n=85 |
| B/body/outcome:bad | 0.8462 [0.8064, 0.8859]; n=187 |
| B/body/outcome:good | 0.1133 [0.0776, 0.1490]; n=187 |
| B/body/outcome:unfinished | 0.0406 [0.0202, 0.0609]; n=187 |
| B/body/receipts | 2.4300 [2.2354, 2.6246]; n=200 |
| B/body/stabilized | 0.4250 [0.3559, 0.4941]; n=200 |
| B/cohesion/censored | 0 [0, 0]; n=200 |
| B/cohesion/informative | 0 [0, 0]; n=200 |
| B/cohesion/learning-epochs | N/A (n=0) |
| B/cohesion/stabilized | 0 [0, 0]; n=200 |
| B/meta/censored | 0 [0, 0]; n=200 |
| B/meta/informative | 0 [0, 0]; n=200 |
| B/meta/learning-epochs | N/A (n=0) |
| B/meta/stabilized | 0 [0, 0]; n=200 |
| B/none/censored | 0 [0, 0]; n=200 |
| B/none/informative | 0 [0, 0]; n=200 |
| B/none/learning-epochs | N/A (n=0) |
| B/none/stabilized | 0 [0, 0]; n=200 |
| B/people/action:ask | 0.0958 [0.0835, 0.1082]; n=200 |
| B/people/action:break | 0.1038 [0.0918, 0.1157]; n=200 |
| B/people/action:deceive | 0.1050 [0.0934, 0.1166]; n=200 |
| B/people/action:keep | 0.0983 [0.0867, 0.1100]; n=200 |
| B/people/action:leave | 0.0875 [0.0769, 0.0981]; n=200 |
| B/people/action:trade | 0.1046 [0.0921, 0.1170]; n=200 |
| B/people/action:wait | 0.1021 [0.0903, 0.1139]; n=200 |
| B/people/action:work | 0.1004 [0.0880, 0.1129]; n=200 |
| B/people/censored | 0.9150 [0.8760, 0.9540]; n=200 |
| B/people/informative | 1.0000 [1.0000, 1.0000]; n=200 |
| B/people/learning-epochs | 7.5882 [6.8556, 8.3208]; n=17 |
| B/people/outcome:bad | 0.7558 [0.7372, 0.7745]; n=200 |
| B/people/outcome:good | 0.1650 [0.1469, 0.1832]; n=200 |
| B/people/outcome:unfinished | 0.0791 [0.0724, 0.0858]; n=200 |
| B/people/receipts | 9.5700 [9.3754, 9.7646]; n=200 |
| B/people/stabilized | 0.0850 [0.0460, 0.1240]; n=200 |
| B/space/censored | 0 [0, 0]; n=200 |
| B/space/informative | 0 [0, 0]; n=200 |
| B/space/learning-epochs | N/A (n=0) |
| B/space/stabilized | 0 [0, 0]; n=200 |
| B/strategy/censored | 0 [0, 0]; n=200 |
| B/strategy/informative | 0 [0, 0]; n=200 |
| B/strategy/learning-epochs | N/A (n=0) |
| B/strategy/stabilized | 0 [0, 0]; n=200 |
| O/adaptation/censored | 0 [0, 0]; n=200 |
| O/adaptation/informative | 0 [0, 0]; n=200 |
| O/adaptation/learning-epochs | N/A (n=0) |
| O/adaptation/stabilized | 0 [0, 0]; n=200 |
| O/body/action:confront | 0.1088 [0.0961, 0.1214]; n=200 |
| O/body/censored | 0.5400 [0.4703, 0.6097]; n=200 |
| O/body/informative | 0.7250 [0.6625, 0.7875]; n=200 |
| O/body/learning-epochs | 4.5946 [3.7044, 5.4848]; n=37 |
| O/body/outcome:bad | 0.9345 [0.8958, 0.9731]; n=145 |
| O/body/outcome:good | 0.0655 [0.0269, 0.1042]; n=145 |
| O/body/outcome:unfinished | 0 [0, 0]; n=145 |
| O/body/receipts | 1.3050 [1.1529, 1.4571]; n=200 |
| O/body/stabilized | 0.1850 [0.1307, 0.2393]; n=200 |
| O/cohesion/censored | 0 [0, 0]; n=200 |
| O/cohesion/informative | 0 [0, 0]; n=200 |
| O/cohesion/learning-epochs | N/A (n=0) |
| O/cohesion/stabilized | 0 [0, 0]; n=200 |
| O/meta/censored | 0 [0, 0]; n=200 |
| O/meta/informative | 0 [0, 0]; n=200 |
| O/meta/learning-epochs | N/A (n=0) |
| O/meta/stabilized | 0 [0, 0]; n=200 |
| O/none/censored | 0 [0, 0]; n=200 |
| O/none/informative | 0 [0, 0]; n=200 |
| O/none/learning-epochs | N/A (n=0) |
| O/none/stabilized | 0 [0, 0]; n=200 |
| O/people/action:accept_promise | 0.0962 [0.0838, 0.1087]; n=200 |
| O/people/action:accept_trade | 0.0775 [0.0670, 0.0880]; n=200 |
| O/people/action:accept_work | 0.1350 [0.1210, 0.1490]; n=200 |
| O/people/action:chase | 0.1029 [0.0905, 0.1154]; n=200 |
| O/people/action:give | 0.0813 [0.0699, 0.0926]; n=200 |
| O/people/action:let_go | 0.0542 [0.0452, 0.0632]; n=200 |
| O/people/action:pay | 0.0767 [0.0661, 0.0872]; n=200 |
| O/people/action:refuse | 0.1150 [0.1024, 0.1276]; n=200 |
| O/people/action:renege | 0.1021 [0.0902, 0.1140]; n=200 |
| O/people/action:wait | 0.0504 [0.0410, 0.0598]; n=200 |
| O/people/censored | 1.0000 [1.0000, 1.0000]; n=200 |
| O/people/informative | 1.0000 [1.0000, 1.0000]; n=200 |
| O/people/learning-epochs | N/A (n=0) |
| O/people/outcome:bad | 0.7892 [0.7709, 0.8075]; n=200 |
| O/people/outcome:good | 0.2033 [0.1850, 0.2216]; n=200 |
| O/people/outcome:unfinished | 0.0075 [0.0039, 0.0111]; n=200 |
| O/people/receipts | 10.6950 [10.5429, 10.8471]; n=200 |
| O/people/stabilized | 0 [0, 0]; n=200 |
| O/space/censored | 0 [0, 0]; n=200 |
| O/space/informative | 0 [0, 0]; n=200 |
| O/space/learning-epochs | N/A (n=0) |
| O/space/stabilized | 0 [0, 0]; n=200 |
| O/strategy/censored | 0 [0, 0]; n=200 |
| O/strategy/informative | 0 [0, 0]; n=200 |
| O/strategy/learning-epochs | N/A (n=0) |
| O/strategy/stabilized | 0 [0, 0]; n=200 |

### v1/INTP

| Mind/domain/metric | Mean [95% interval]; seeds |
|---|---|
| A/adaptation/censored | 0 [0, 0]; n=200 |
| A/adaptation/informative | 0 [0, 0]; n=200 |
| A/adaptation/learning-epochs | N/A (n=0) |
| A/adaptation/stabilized | 0 [0, 0]; n=200 |
| A/body/action:fight | 0.1062 [0.0943, 0.1182]; n=200 |
| A/body/action:steal | 0.0975 [0.0847, 0.1103]; n=200 |
| A/body/censored | 0.4500 [0.3804, 0.5196]; n=200 |
| A/body/informative | 0.9250 [0.8882, 0.9618]; n=200 |
| A/body/learning-epochs | 3.6421 [3.1090, 4.1752]; n=95 |
| A/body/outcome:bad | 0.8805 [0.8461, 0.9150]; n=185 |
| A/body/outcome:good | 0.1112 [0.0771, 0.1453]; n=185 |
| A/body/outcome:unfinished | 0.0083 [0.0009, 0.0157]; n=185 |
| A/body/receipts | 2.4450 [2.2344, 2.6556]; n=200 |
| A/body/stabilized | 0.4750 [0.4052, 0.5448]; n=200 |
| A/cohesion/censored | 0 [0, 0]; n=200 |
| A/cohesion/informative | 0 [0, 0]; n=200 |
| A/cohesion/learning-epochs | N/A (n=0) |
| A/cohesion/stabilized | 0 [0, 0]; n=200 |
| A/meta/censored | 0 [0, 0]; n=200 |
| A/meta/informative | 0 [0, 0]; n=200 |
| A/meta/learning-epochs | N/A (n=0) |
| A/meta/stabilized | 0 [0, 0]; n=200 |
| A/none/censored | 0 [0, 0]; n=200 |
| A/none/informative | 0 [0, 0]; n=200 |
| A/none/learning-epochs | N/A (n=0) |
| A/none/stabilized | 0 [0, 0]; n=200 |
| A/people/action:ask | 0.1112 [0.0990, 0.1235]; n=200 |
| A/people/action:break | 0.1154 [0.1024, 0.1284]; n=200 |
| A/people/action:deceive | 0.1112 [0.0995, 0.1230]; n=200 |
| A/people/action:keep | 0.0971 [0.0843, 0.1099]; n=200 |
| A/people/action:leave | 0.0917 [0.0799, 0.1034]; n=200 |
| A/people/action:trade | 0.0871 [0.0754, 0.0988]; n=200 |
| A/people/action:wait | 0.0979 [0.0855, 0.1103]; n=200 |
| A/people/action:work | 0.0846 [0.0731, 0.0961]; n=200 |
| A/people/censored | 0.9500 [0.9195, 0.9805]; n=200 |
| A/people/informative | 1.0000 [1.0000, 1.0000]; n=200 |
| A/people/learning-epochs | 8.3000 [7.7108, 8.8892]; n=10 |
| A/people/outcome:bad | 0.7583 [0.7409, 0.7757]; n=200 |
| A/people/outcome:good | 0.1559 [0.1390, 0.1728]; n=200 |
| A/people/outcome:unfinished | 0.0858 [0.0794, 0.0922]; n=200 |
| A/people/receipts | 9.5550 [9.3444, 9.7656]; n=200 |
| A/people/stabilized | 0.0500 [0.0195, 0.0805]; n=200 |
| A/space/censored | 0 [0, 0]; n=200 |
| A/space/informative | 0 [0, 0]; n=200 |
| A/space/learning-epochs | N/A (n=0) |
| A/space/stabilized | 0 [0, 0]; n=200 |
| A/strategy/censored | 0 [0, 0]; n=200 |
| A/strategy/informative | 0 [0, 0]; n=200 |
| A/strategy/learning-epochs | N/A (n=0) |
| A/strategy/stabilized | 0 [0, 0]; n=200 |
| B/adaptation/censored | 0 [0, 0]; n=200 |
| B/adaptation/informative | 0 [0, 0]; n=200 |
| B/adaptation/learning-epochs | N/A (n=0) |
| B/adaptation/stabilized | 0 [0, 0]; n=200 |
| B/body/action:fight | 0.1046 [0.0920, 0.1171]; n=200 |
| B/body/action:steal | 0.0983 [0.0868, 0.1099]; n=200 |
| B/body/censored | 0.4950 [0.4251, 0.5649]; n=200 |
| B/body/informative | 0.9250 [0.8882, 0.9618]; n=200 |
| B/body/learning-epochs | 3.5581 [3.0447, 4.0715]; n=86 |
| B/body/outcome:bad | 0.8599 [0.8219, 0.8979]; n=187 |
| B/body/outcome:good | 0.0980 [0.0648, 0.1313]; n=187 |
| B/body/outcome:unfinished | 0.0421 [0.0216, 0.0626]; n=187 |
| B/body/receipts | 2.4350 [2.2379, 2.6321]; n=200 |
| B/body/stabilized | 0.4300 [0.3608, 0.4992]; n=200 |
| B/cohesion/censored | 0 [0, 0]; n=200 |
| B/cohesion/informative | 0 [0, 0]; n=200 |
| B/cohesion/learning-epochs | N/A (n=0) |
| B/cohesion/stabilized | 0 [0, 0]; n=200 |
| B/meta/censored | 0 [0, 0]; n=200 |
| B/meta/informative | 0 [0, 0]; n=200 |
| B/meta/learning-epochs | N/A (n=0) |
| B/meta/stabilized | 0 [0, 0]; n=200 |
| B/none/censored | 0 [0, 0]; n=200 |
| B/none/informative | 0 [0, 0]; n=200 |
| B/none/learning-epochs | N/A (n=0) |
| B/none/stabilized | 0 [0, 0]; n=200 |
| B/people/action:ask | 0.0979 [0.0856, 0.1103]; n=200 |
| B/people/action:break | 0.1067 [0.0946, 0.1187]; n=200 |
| B/people/action:deceive | 0.1079 [0.0960, 0.1198]; n=200 |
| B/people/action:keep | 0.0950 [0.0835, 0.1065]; n=200 |
| B/people/action:leave | 0.0875 [0.0766, 0.0984]; n=200 |
| B/people/action:trade | 0.1025 [0.0901, 0.1149]; n=200 |
| B/people/action:wait | 0.1029 [0.0910, 0.1149]; n=200 |
| B/people/action:work | 0.0967 [0.0846, 0.1087]; n=200 |
| B/people/censored | 0.9400 [0.9068, 0.9732]; n=200 |
| B/people/informative | 1.0000 [1.0000, 1.0000]; n=200 |
| B/people/learning-epochs | 7.1667 [6.3512, 7.9821]; n=12 |
| B/people/outcome:bad | 0.7586 [0.7401, 0.7771]; n=200 |
| B/people/outcome:good | 0.1632 [0.1454, 0.1809]; n=200 |
| B/people/outcome:unfinished | 0.0782 [0.0715, 0.0849]; n=200 |
| B/people/receipts | 9.5650 [9.3679, 9.7621]; n=200 |
| B/people/stabilized | 0.0600 [0.0268, 0.0932]; n=200 |
| B/space/censored | 0 [0, 0]; n=200 |
| B/space/informative | 0 [0, 0]; n=200 |
| B/space/learning-epochs | N/A (n=0) |
| B/space/stabilized | 0 [0, 0]; n=200 |
| B/strategy/censored | 0 [0, 0]; n=200 |
| B/strategy/informative | 0 [0, 0]; n=200 |
| B/strategy/learning-epochs | N/A (n=0) |
| B/strategy/stabilized | 0 [0, 0]; n=200 |
| O/adaptation/censored | 0 [0, 0]; n=200 |
| O/adaptation/informative | 0 [0, 0]; n=200 |
| O/adaptation/learning-epochs | N/A (n=0) |
| O/adaptation/stabilized | 0 [0, 0]; n=200 |
| O/body/action:confront | 0.1058 [0.0938, 0.1179]; n=200 |
| O/body/censored | 0.5050 [0.4351, 0.5749]; n=200 |
| O/body/informative | 0.7400 [0.6787, 0.8013]; n=200 |
| O/body/learning-epochs | 3.9574 [3.2016, 4.7133]; n=47 |
| O/body/outcome:bad | 0.9426 [0.9081, 0.9770]; n=148 |
| O/body/outcome:good | 0.0574 [0.0230, 0.0919]; n=148 |
| O/body/outcome:unfinished | 0 [0, 0]; n=148 |
| O/body/receipts | 1.2700 [1.1255, 1.4145]; n=200 |
| O/body/stabilized | 0.2350 [0.1757, 0.2943]; n=200 |
| O/cohesion/censored | 0 [0, 0]; n=200 |
| O/cohesion/informative | 0 [0, 0]; n=200 |
| O/cohesion/learning-epochs | N/A (n=0) |
| O/cohesion/stabilized | 0 [0, 0]; n=200 |
| O/meta/censored | 0 [0, 0]; n=200 |
| O/meta/informative | 0 [0, 0]; n=200 |
| O/meta/learning-epochs | N/A (n=0) |
| O/meta/stabilized | 0 [0, 0]; n=200 |
| O/none/censored | 0 [0, 0]; n=200 |
| O/none/informative | 0 [0, 0]; n=200 |
| O/none/learning-epochs | N/A (n=0) |
| O/none/stabilized | 0 [0, 0]; n=200 |
| O/people/action:accept_promise | 0.0846 [0.0730, 0.0962]; n=200 |
| O/people/action:accept_trade | 0.0729 [0.0627, 0.0831]; n=200 |
| O/people/action:accept_work | 0.1483 [0.1342, 0.1625]; n=200 |
| O/people/action:chase | 0.1175 [0.1045, 0.1305]; n=200 |
| O/people/action:give | 0.0771 [0.0660, 0.0882]; n=200 |
| O/people/action:let_go | 0.0362 [0.0286, 0.0439]; n=200 |
| O/people/action:pay | 0.0733 [0.0634, 0.0833]; n=200 |
| O/people/action:refuse | 0.1204 [0.1073, 0.1335]; n=200 |
| O/people/action:renege | 0.1100 [0.0975, 0.1225]; n=200 |
| O/people/action:wait | 0.0538 [0.0443, 0.0632]; n=200 |
| O/people/censored | 1.0000 [1.0000, 1.0000]; n=200 |
| O/people/informative | 1.0000 [1.0000, 1.0000]; n=200 |
| O/people/learning-epochs | N/A (n=0) |
| O/people/outcome:bad | 0.7868 [0.7680, 0.8055]; n=200 |
| O/people/outcome:good | 0.2054 [0.1867, 0.2241]; n=200 |
| O/people/outcome:unfinished | 0.0079 [0.0042, 0.0115]; n=200 |
| O/people/receipts | 10.7300 [10.5855, 10.8745]; n=200 |
| O/people/stabilized | 0 [0, 0]; n=200 |
| O/space/censored | 0 [0, 0]; n=200 |
| O/space/informative | 0 [0, 0]; n=200 |
| O/space/learning-epochs | N/A (n=0) |
| O/space/stabilized | 0 [0, 0]; n=200 |
| O/strategy/censored | 0 [0, 0]; n=200 |
| O/strategy/informative | 0 [0, 0]; n=200 |
| O/strategy/learning-epochs | N/A (n=0) |
| O/strategy/stabilized | 0 [0, 0]; n=200 |

### v1/ESFJ

| Mind/domain/metric | Mean [95% interval]; seeds |
|---|---|
| A/adaptation/censored | 0 [0, 0]; n=200 |
| A/adaptation/informative | 0 [0, 0]; n=200 |
| A/adaptation/learning-epochs | N/A (n=0) |
| A/adaptation/stabilized | 0 [0, 0]; n=200 |
| A/body/action:fight | 0.1050 [0.0929, 0.1171]; n=200 |
| A/body/action:steal | 0.0996 [0.0869, 0.1123]; n=200 |
| A/body/censored | 0.4750 [0.4052, 0.5448]; n=200 |
| A/body/informative | 0.9200 [0.8821, 0.9579]; n=200 |
| A/body/learning-epochs | 3.1685 [2.6439, 3.6932]; n=89 |
| A/body/outcome:bad | 0.8716 [0.8370, 0.9063]; n=184 |
| A/body/outcome:good | 0.1141 [0.0801, 0.1481]; n=184 |
| A/body/outcome:unfinished | 0.0142 [0.0042, 0.0243]; n=184 |
| A/body/receipts | 2.4550 [2.2462, 2.6638]; n=200 |
| A/body/stabilized | 0.4450 [0.3755, 0.5145]; n=200 |
| A/cohesion/censored | 0 [0, 0]; n=200 |
| A/cohesion/informative | 0 [0, 0]; n=200 |
| A/cohesion/learning-epochs | N/A (n=0) |
| A/cohesion/stabilized | 0 [0, 0]; n=200 |
| A/meta/censored | 0 [0, 0]; n=200 |
| A/meta/informative | 0 [0, 0]; n=200 |
| A/meta/learning-epochs | N/A (n=0) |
| A/meta/stabilized | 0 [0, 0]; n=200 |
| A/none/censored | 0 [0, 0]; n=200 |
| A/none/informative | 0 [0, 0]; n=200 |
| A/none/learning-epochs | N/A (n=0) |
| A/none/stabilized | 0 [0, 0]; n=200 |
| A/people/action:ask | 0.1092 [0.0970, 0.1213]; n=200 |
| A/people/action:break | 0.1133 [0.1002, 0.1264]; n=200 |
| A/people/action:deceive | 0.1087 [0.0973, 0.1202]; n=200 |
| A/people/action:keep | 0.0983 [0.0858, 0.1108]; n=200 |
| A/people/action:leave | 0.0937 [0.0818, 0.1057]; n=200 |
| A/people/action:trade | 0.0892 [0.0774, 0.1009]; n=200 |
| A/people/action:wait | 0.0971 [0.0847, 0.1095]; n=200 |
| A/people/action:work | 0.0858 [0.0744, 0.0973]; n=200 |
| A/people/censored | 0.9200 [0.8821, 0.9579]; n=200 |
| A/people/informative | 1.0000 [1.0000, 1.0000]; n=200 |
| A/people/learning-epochs | 7.8125 [7.1606, 8.4644]; n=16 |
| A/people/outcome:bad | 0.7615 [0.7442, 0.7787]; n=200 |
| A/people/outcome:good | 0.1555 [0.1388, 0.1721]; n=200 |
| A/people/outcome:unfinished | 0.0831 [0.0764, 0.0897]; n=200 |
| A/people/receipts | 9.5450 [9.3362, 9.7538]; n=200 |
| A/people/stabilized | 0.0800 [0.0421, 0.1179]; n=200 |
| A/space/censored | 0 [0, 0]; n=200 |
| A/space/informative | 0 [0, 0]; n=200 |
| A/space/learning-epochs | N/A (n=0) |
| A/space/stabilized | 0 [0, 0]; n=200 |
| A/strategy/censored | 0 [0, 0]; n=200 |
| A/strategy/informative | 0 [0, 0]; n=200 |
| A/strategy/learning-epochs | N/A (n=0) |
| A/strategy/stabilized | 0 [0, 0]; n=200 |
| B/adaptation/censored | 0 [0, 0]; n=200 |
| B/adaptation/informative | 0 [0, 0]; n=200 |
| B/adaptation/learning-epochs | N/A (n=0) |
| B/adaptation/stabilized | 0 [0, 0]; n=200 |
| B/body/action:fight | 0.1046 [0.0919, 0.1173]; n=200 |
| B/body/action:steal | 0.0979 [0.0865, 0.1094]; n=200 |
| B/body/censored | 0.5000 [0.4301, 0.5699]; n=200 |
| B/body/informative | 0.9250 [0.8882, 0.9618]; n=200 |
| B/body/learning-epochs | 3.3882 [2.8747, 3.9017]; n=85 |
| B/body/outcome:bad | 0.8462 [0.8064, 0.8859]; n=187 |
| B/body/outcome:good | 0.1133 [0.0776, 0.1490]; n=187 |
| B/body/outcome:unfinished | 0.0406 [0.0202, 0.0609]; n=187 |
| B/body/receipts | 2.4300 [2.2354, 2.6246]; n=200 |
| B/body/stabilized | 0.4250 [0.3559, 0.4941]; n=200 |
| B/cohesion/censored | 0 [0, 0]; n=200 |
| B/cohesion/informative | 0 [0, 0]; n=200 |
| B/cohesion/learning-epochs | N/A (n=0) |
| B/cohesion/stabilized | 0 [0, 0]; n=200 |
| B/meta/censored | 0 [0, 0]; n=200 |
| B/meta/informative | 0 [0, 0]; n=200 |
| B/meta/learning-epochs | N/A (n=0) |
| B/meta/stabilized | 0 [0, 0]; n=200 |
| B/none/censored | 0 [0, 0]; n=200 |
| B/none/informative | 0 [0, 0]; n=200 |
| B/none/learning-epochs | N/A (n=0) |
| B/none/stabilized | 0 [0, 0]; n=200 |
| B/people/action:ask | 0.0958 [0.0835, 0.1082]; n=200 |
| B/people/action:break | 0.1038 [0.0918, 0.1157]; n=200 |
| B/people/action:deceive | 0.1050 [0.0934, 0.1166]; n=200 |
| B/people/action:keep | 0.0983 [0.0867, 0.1100]; n=200 |
| B/people/action:leave | 0.0875 [0.0769, 0.0981]; n=200 |
| B/people/action:trade | 0.1046 [0.0921, 0.1170]; n=200 |
| B/people/action:wait | 0.1021 [0.0903, 0.1139]; n=200 |
| B/people/action:work | 0.1004 [0.0880, 0.1129]; n=200 |
| B/people/censored | 0.9150 [0.8760, 0.9540]; n=200 |
| B/people/informative | 1.0000 [1.0000, 1.0000]; n=200 |
| B/people/learning-epochs | 7.5882 [6.8556, 8.3208]; n=17 |
| B/people/outcome:bad | 0.7558 [0.7372, 0.7745]; n=200 |
| B/people/outcome:good | 0.1650 [0.1469, 0.1832]; n=200 |
| B/people/outcome:unfinished | 0.0791 [0.0724, 0.0858]; n=200 |
| B/people/receipts | 9.5700 [9.3754, 9.7646]; n=200 |
| B/people/stabilized | 0.0850 [0.0460, 0.1240]; n=200 |
| B/space/censored | 0 [0, 0]; n=200 |
| B/space/informative | 0 [0, 0]; n=200 |
| B/space/learning-epochs | N/A (n=0) |
| B/space/stabilized | 0 [0, 0]; n=200 |
| B/strategy/censored | 0 [0, 0]; n=200 |
| B/strategy/informative | 0 [0, 0]; n=200 |
| B/strategy/learning-epochs | N/A (n=0) |
| B/strategy/stabilized | 0 [0, 0]; n=200 |
| O/adaptation/censored | 0 [0, 0]; n=200 |
| O/adaptation/informative | 0 [0, 0]; n=200 |
| O/adaptation/learning-epochs | N/A (n=0) |
| O/adaptation/stabilized | 0 [0, 0]; n=200 |
| O/body/action:confront | 0.1088 [0.0961, 0.1214]; n=200 |
| O/body/censored | 0.5400 [0.4703, 0.6097]; n=200 |
| O/body/informative | 0.7250 [0.6625, 0.7875]; n=200 |
| O/body/learning-epochs | 4.5946 [3.7044, 5.4848]; n=37 |
| O/body/outcome:bad | 0.9345 [0.8958, 0.9731]; n=145 |
| O/body/outcome:good | 0.0655 [0.0269, 0.1042]; n=145 |
| O/body/outcome:unfinished | 0 [0, 0]; n=145 |
| O/body/receipts | 1.3050 [1.1529, 1.4571]; n=200 |
| O/body/stabilized | 0.1850 [0.1307, 0.2393]; n=200 |
| O/cohesion/censored | 0 [0, 0]; n=200 |
| O/cohesion/informative | 0 [0, 0]; n=200 |
| O/cohesion/learning-epochs | N/A (n=0) |
| O/cohesion/stabilized | 0 [0, 0]; n=200 |
| O/meta/censored | 0 [0, 0]; n=200 |
| O/meta/informative | 0 [0, 0]; n=200 |
| O/meta/learning-epochs | N/A (n=0) |
| O/meta/stabilized | 0 [0, 0]; n=200 |
| O/none/censored | 0 [0, 0]; n=200 |
| O/none/informative | 0 [0, 0]; n=200 |
| O/none/learning-epochs | N/A (n=0) |
| O/none/stabilized | 0 [0, 0]; n=200 |
| O/people/action:accept_promise | 0.0962 [0.0838, 0.1087]; n=200 |
| O/people/action:accept_trade | 0.0775 [0.0670, 0.0880]; n=200 |
| O/people/action:accept_work | 0.1350 [0.1210, 0.1490]; n=200 |
| O/people/action:chase | 0.1029 [0.0905, 0.1154]; n=200 |
| O/people/action:give | 0.0813 [0.0699, 0.0926]; n=200 |
| O/people/action:let_go | 0.0542 [0.0452, 0.0632]; n=200 |
| O/people/action:pay | 0.0767 [0.0661, 0.0872]; n=200 |
| O/people/action:refuse | 0.1150 [0.1024, 0.1276]; n=200 |
| O/people/action:renege | 0.1021 [0.0902, 0.1140]; n=200 |
| O/people/action:wait | 0.0504 [0.0410, 0.0598]; n=200 |
| O/people/censored | 1.0000 [1.0000, 1.0000]; n=200 |
| O/people/informative | 1.0000 [1.0000, 1.0000]; n=200 |
| O/people/learning-epochs | N/A (n=0) |
| O/people/outcome:bad | 0.7892 [0.7709, 0.8075]; n=200 |
| O/people/outcome:good | 0.2033 [0.1850, 0.2216]; n=200 |
| O/people/outcome:unfinished | 0.0075 [0.0039, 0.0111]; n=200 |
| O/people/receipts | 10.6950 [10.5429, 10.8471]; n=200 |
| O/people/stabilized | 0 [0, 0]; n=200 |
| O/space/censored | 0 [0, 0]; n=200 |
| O/space/informative | 0 [0, 0]; n=200 |
| O/space/learning-epochs | N/A (n=0) |
| O/space/stabilized | 0 [0, 0]; n=200 |
| O/strategy/censored | 0 [0, 0]; n=200 |
| O/strategy/informative | 0 [0, 0]; n=200 |
| O/strategy/learning-epochs | N/A (n=0) |
| O/strategy/stabilized | 0 [0, 0]; n=200 |

### v1/ISFJ

| Mind/domain/metric | Mean [95% interval]; seeds |
|---|---|
| A/adaptation/censored | 0 [0, 0]; n=200 |
| A/adaptation/informative | 0 [0, 0]; n=200 |
| A/adaptation/learning-epochs | N/A (n=0) |
| A/adaptation/stabilized | 0 [0, 0]; n=200 |
| A/body/action:fight | 0.1062 [0.0943, 0.1182]; n=200 |
| A/body/action:steal | 0.0975 [0.0847, 0.1103]; n=200 |
| A/body/censored | 0.4500 [0.3804, 0.5196]; n=200 |
| A/body/informative | 0.9250 [0.8882, 0.9618]; n=200 |
| A/body/learning-epochs | 3.6421 [3.1090, 4.1752]; n=95 |
| A/body/outcome:bad | 0.8805 [0.8461, 0.9150]; n=185 |
| A/body/outcome:good | 0.1112 [0.0771, 0.1453]; n=185 |
| A/body/outcome:unfinished | 0.0083 [0.0009, 0.0157]; n=185 |
| A/body/receipts | 2.4450 [2.2344, 2.6556]; n=200 |
| A/body/stabilized | 0.4750 [0.4052, 0.5448]; n=200 |
| A/cohesion/censored | 0 [0, 0]; n=200 |
| A/cohesion/informative | 0 [0, 0]; n=200 |
| A/cohesion/learning-epochs | N/A (n=0) |
| A/cohesion/stabilized | 0 [0, 0]; n=200 |
| A/meta/censored | 0 [0, 0]; n=200 |
| A/meta/informative | 0 [0, 0]; n=200 |
| A/meta/learning-epochs | N/A (n=0) |
| A/meta/stabilized | 0 [0, 0]; n=200 |
| A/none/censored | 0 [0, 0]; n=200 |
| A/none/informative | 0 [0, 0]; n=200 |
| A/none/learning-epochs | N/A (n=0) |
| A/none/stabilized | 0 [0, 0]; n=200 |
| A/people/action:ask | 0.1112 [0.0990, 0.1235]; n=200 |
| A/people/action:break | 0.1154 [0.1024, 0.1284]; n=200 |
| A/people/action:deceive | 0.1112 [0.0995, 0.1230]; n=200 |
| A/people/action:keep | 0.0971 [0.0843, 0.1099]; n=200 |
| A/people/action:leave | 0.0917 [0.0799, 0.1034]; n=200 |
| A/people/action:trade | 0.0871 [0.0754, 0.0988]; n=200 |
| A/people/action:wait | 0.0979 [0.0855, 0.1103]; n=200 |
| A/people/action:work | 0.0846 [0.0731, 0.0961]; n=200 |
| A/people/censored | 0.9500 [0.9195, 0.9805]; n=200 |
| A/people/informative | 1.0000 [1.0000, 1.0000]; n=200 |
| A/people/learning-epochs | 8.3000 [7.7108, 8.8892]; n=10 |
| A/people/outcome:bad | 0.7583 [0.7409, 0.7757]; n=200 |
| A/people/outcome:good | 0.1559 [0.1390, 0.1728]; n=200 |
| A/people/outcome:unfinished | 0.0858 [0.0794, 0.0922]; n=200 |
| A/people/receipts | 9.5550 [9.3444, 9.7656]; n=200 |
| A/people/stabilized | 0.0500 [0.0195, 0.0805]; n=200 |
| A/space/censored | 0 [0, 0]; n=200 |
| A/space/informative | 0 [0, 0]; n=200 |
| A/space/learning-epochs | N/A (n=0) |
| A/space/stabilized | 0 [0, 0]; n=200 |
| A/strategy/censored | 0 [0, 0]; n=200 |
| A/strategy/informative | 0 [0, 0]; n=200 |
| A/strategy/learning-epochs | N/A (n=0) |
| A/strategy/stabilized | 0 [0, 0]; n=200 |
| B/adaptation/censored | 0 [0, 0]; n=200 |
| B/adaptation/informative | 0 [0, 0]; n=200 |
| B/adaptation/learning-epochs | N/A (n=0) |
| B/adaptation/stabilized | 0 [0, 0]; n=200 |
| B/body/action:fight | 0.1046 [0.0920, 0.1171]; n=200 |
| B/body/action:steal | 0.0983 [0.0868, 0.1099]; n=200 |
| B/body/censored | 0.4950 [0.4251, 0.5649]; n=200 |
| B/body/informative | 0.9250 [0.8882, 0.9618]; n=200 |
| B/body/learning-epochs | 3.5581 [3.0447, 4.0715]; n=86 |
| B/body/outcome:bad | 0.8599 [0.8219, 0.8979]; n=187 |
| B/body/outcome:good | 0.0980 [0.0648, 0.1313]; n=187 |
| B/body/outcome:unfinished | 0.0421 [0.0216, 0.0626]; n=187 |
| B/body/receipts | 2.4350 [2.2379, 2.6321]; n=200 |
| B/body/stabilized | 0.4300 [0.3608, 0.4992]; n=200 |
| B/cohesion/censored | 0 [0, 0]; n=200 |
| B/cohesion/informative | 0 [0, 0]; n=200 |
| B/cohesion/learning-epochs | N/A (n=0) |
| B/cohesion/stabilized | 0 [0, 0]; n=200 |
| B/meta/censored | 0 [0, 0]; n=200 |
| B/meta/informative | 0 [0, 0]; n=200 |
| B/meta/learning-epochs | N/A (n=0) |
| B/meta/stabilized | 0 [0, 0]; n=200 |
| B/none/censored | 0 [0, 0]; n=200 |
| B/none/informative | 0 [0, 0]; n=200 |
| B/none/learning-epochs | N/A (n=0) |
| B/none/stabilized | 0 [0, 0]; n=200 |
| B/people/action:ask | 0.0979 [0.0856, 0.1103]; n=200 |
| B/people/action:break | 0.1067 [0.0946, 0.1187]; n=200 |
| B/people/action:deceive | 0.1079 [0.0960, 0.1198]; n=200 |
| B/people/action:keep | 0.0950 [0.0835, 0.1065]; n=200 |
| B/people/action:leave | 0.0875 [0.0766, 0.0984]; n=200 |
| B/people/action:trade | 0.1025 [0.0901, 0.1149]; n=200 |
| B/people/action:wait | 0.1029 [0.0910, 0.1149]; n=200 |
| B/people/action:work | 0.0967 [0.0846, 0.1087]; n=200 |
| B/people/censored | 0.9400 [0.9068, 0.9732]; n=200 |
| B/people/informative | 1.0000 [1.0000, 1.0000]; n=200 |
| B/people/learning-epochs | 7.1667 [6.3512, 7.9821]; n=12 |
| B/people/outcome:bad | 0.7586 [0.7401, 0.7771]; n=200 |
| B/people/outcome:good | 0.1632 [0.1454, 0.1809]; n=200 |
| B/people/outcome:unfinished | 0.0782 [0.0715, 0.0849]; n=200 |
| B/people/receipts | 9.5650 [9.3679, 9.7621]; n=200 |
| B/people/stabilized | 0.0600 [0.0268, 0.0932]; n=200 |
| B/space/censored | 0 [0, 0]; n=200 |
| B/space/informative | 0 [0, 0]; n=200 |
| B/space/learning-epochs | N/A (n=0) |
| B/space/stabilized | 0 [0, 0]; n=200 |
| B/strategy/censored | 0 [0, 0]; n=200 |
| B/strategy/informative | 0 [0, 0]; n=200 |
| B/strategy/learning-epochs | N/A (n=0) |
| B/strategy/stabilized | 0 [0, 0]; n=200 |
| O/adaptation/censored | 0 [0, 0]; n=200 |
| O/adaptation/informative | 0 [0, 0]; n=200 |
| O/adaptation/learning-epochs | N/A (n=0) |
| O/adaptation/stabilized | 0 [0, 0]; n=200 |
| O/body/action:confront | 0.1058 [0.0938, 0.1179]; n=200 |
| O/body/censored | 0.5050 [0.4351, 0.5749]; n=200 |
| O/body/informative | 0.7400 [0.6787, 0.8013]; n=200 |
| O/body/learning-epochs | 3.9574 [3.2016, 4.7133]; n=47 |
| O/body/outcome:bad | 0.9426 [0.9081, 0.9770]; n=148 |
| O/body/outcome:good | 0.0574 [0.0230, 0.0919]; n=148 |
| O/body/outcome:unfinished | 0 [0, 0]; n=148 |
| O/body/receipts | 1.2700 [1.1255, 1.4145]; n=200 |
| O/body/stabilized | 0.2350 [0.1757, 0.2943]; n=200 |
| O/cohesion/censored | 0 [0, 0]; n=200 |
| O/cohesion/informative | 0 [0, 0]; n=200 |
| O/cohesion/learning-epochs | N/A (n=0) |
| O/cohesion/stabilized | 0 [0, 0]; n=200 |
| O/meta/censored | 0 [0, 0]; n=200 |
| O/meta/informative | 0 [0, 0]; n=200 |
| O/meta/learning-epochs | N/A (n=0) |
| O/meta/stabilized | 0 [0, 0]; n=200 |
| O/none/censored | 0 [0, 0]; n=200 |
| O/none/informative | 0 [0, 0]; n=200 |
| O/none/learning-epochs | N/A (n=0) |
| O/none/stabilized | 0 [0, 0]; n=200 |
| O/people/action:accept_promise | 0.0846 [0.0730, 0.0962]; n=200 |
| O/people/action:accept_trade | 0.0729 [0.0627, 0.0831]; n=200 |
| O/people/action:accept_work | 0.1483 [0.1342, 0.1625]; n=200 |
| O/people/action:chase | 0.1175 [0.1045, 0.1305]; n=200 |
| O/people/action:give | 0.0771 [0.0660, 0.0882]; n=200 |
| O/people/action:let_go | 0.0362 [0.0286, 0.0439]; n=200 |
| O/people/action:pay | 0.0733 [0.0634, 0.0833]; n=200 |
| O/people/action:refuse | 0.1204 [0.1073, 0.1335]; n=200 |
| O/people/action:renege | 0.1100 [0.0975, 0.1225]; n=200 |
| O/people/action:wait | 0.0538 [0.0443, 0.0632]; n=200 |
| O/people/censored | 1.0000 [1.0000, 1.0000]; n=200 |
| O/people/informative | 1.0000 [1.0000, 1.0000]; n=200 |
| O/people/learning-epochs | N/A (n=0) |
| O/people/outcome:bad | 0.7868 [0.7680, 0.8055]; n=200 |
| O/people/outcome:good | 0.2054 [0.1867, 0.2241]; n=200 |
| O/people/outcome:unfinished | 0.0079 [0.0042, 0.0115]; n=200 |
| O/people/receipts | 10.7300 [10.5855, 10.8745]; n=200 |
| O/people/stabilized | 0 [0, 0]; n=200 |
| O/space/censored | 0 [0, 0]; n=200 |
| O/space/informative | 0 [0, 0]; n=200 |
| O/space/learning-epochs | N/A (n=0) |
| O/space/stabilized | 0 [0, 0]; n=200 |
| O/strategy/censored | 0 [0, 0]; n=200 |
| O/strategy/informative | 0 [0, 0]; n=200 |
| O/strategy/learning-epochs | N/A (n=0) |
| O/strategy/stabilized | 0 [0, 0]; n=200 |

### v1/ENFJ

| Mind/domain/metric | Mean [95% interval]; seeds |
|---|---|
| A/adaptation/censored | 0 [0, 0]; n=200 |
| A/adaptation/informative | 0 [0, 0]; n=200 |
| A/adaptation/learning-epochs | N/A (n=0) |
| A/adaptation/stabilized | 0 [0, 0]; n=200 |
| A/body/action:fight | 0.1050 [0.0929, 0.1171]; n=200 |
| A/body/action:steal | 0.0996 [0.0869, 0.1123]; n=200 |
| A/body/censored | 0.4750 [0.4052, 0.5448]; n=200 |
| A/body/informative | 0.9200 [0.8821, 0.9579]; n=200 |
| A/body/learning-epochs | 3.1685 [2.6439, 3.6932]; n=89 |
| A/body/outcome:bad | 0.8716 [0.8370, 0.9063]; n=184 |
| A/body/outcome:good | 0.1141 [0.0801, 0.1481]; n=184 |
| A/body/outcome:unfinished | 0.0142 [0.0042, 0.0243]; n=184 |
| A/body/receipts | 2.4550 [2.2462, 2.6638]; n=200 |
| A/body/stabilized | 0.4450 [0.3755, 0.5145]; n=200 |
| A/cohesion/censored | 0 [0, 0]; n=200 |
| A/cohesion/informative | 0 [0, 0]; n=200 |
| A/cohesion/learning-epochs | N/A (n=0) |
| A/cohesion/stabilized | 0 [0, 0]; n=200 |
| A/meta/censored | 0 [0, 0]; n=200 |
| A/meta/informative | 0 [0, 0]; n=200 |
| A/meta/learning-epochs | N/A (n=0) |
| A/meta/stabilized | 0 [0, 0]; n=200 |
| A/none/censored | 0 [0, 0]; n=200 |
| A/none/informative | 0 [0, 0]; n=200 |
| A/none/learning-epochs | N/A (n=0) |
| A/none/stabilized | 0 [0, 0]; n=200 |
| A/people/action:ask | 0.1092 [0.0970, 0.1213]; n=200 |
| A/people/action:break | 0.1133 [0.1002, 0.1264]; n=200 |
| A/people/action:deceive | 0.1087 [0.0973, 0.1202]; n=200 |
| A/people/action:keep | 0.0983 [0.0858, 0.1108]; n=200 |
| A/people/action:leave | 0.0937 [0.0818, 0.1057]; n=200 |
| A/people/action:trade | 0.0892 [0.0774, 0.1009]; n=200 |
| A/people/action:wait | 0.0971 [0.0847, 0.1095]; n=200 |
| A/people/action:work | 0.0858 [0.0744, 0.0973]; n=200 |
| A/people/censored | 0.9200 [0.8821, 0.9579]; n=200 |
| A/people/informative | 1.0000 [1.0000, 1.0000]; n=200 |
| A/people/learning-epochs | 7.8125 [7.1606, 8.4644]; n=16 |
| A/people/outcome:bad | 0.7615 [0.7442, 0.7787]; n=200 |
| A/people/outcome:good | 0.1555 [0.1388, 0.1721]; n=200 |
| A/people/outcome:unfinished | 0.0831 [0.0764, 0.0897]; n=200 |
| A/people/receipts | 9.5450 [9.3362, 9.7538]; n=200 |
| A/people/stabilized | 0.0800 [0.0421, 0.1179]; n=200 |
| A/space/censored | 0 [0, 0]; n=200 |
| A/space/informative | 0 [0, 0]; n=200 |
| A/space/learning-epochs | N/A (n=0) |
| A/space/stabilized | 0 [0, 0]; n=200 |
| A/strategy/censored | 0 [0, 0]; n=200 |
| A/strategy/informative | 0 [0, 0]; n=200 |
| A/strategy/learning-epochs | N/A (n=0) |
| A/strategy/stabilized | 0 [0, 0]; n=200 |
| B/adaptation/censored | 0 [0, 0]; n=200 |
| B/adaptation/informative | 0 [0, 0]; n=200 |
| B/adaptation/learning-epochs | N/A (n=0) |
| B/adaptation/stabilized | 0 [0, 0]; n=200 |
| B/body/action:fight | 0.1046 [0.0919, 0.1173]; n=200 |
| B/body/action:steal | 0.0979 [0.0865, 0.1094]; n=200 |
| B/body/censored | 0.5000 [0.4301, 0.5699]; n=200 |
| B/body/informative | 0.9250 [0.8882, 0.9618]; n=200 |
| B/body/learning-epochs | 3.3882 [2.8747, 3.9017]; n=85 |
| B/body/outcome:bad | 0.8462 [0.8064, 0.8859]; n=187 |
| B/body/outcome:good | 0.1133 [0.0776, 0.1490]; n=187 |
| B/body/outcome:unfinished | 0.0406 [0.0202, 0.0609]; n=187 |
| B/body/receipts | 2.4300 [2.2354, 2.6246]; n=200 |
| B/body/stabilized | 0.4250 [0.3559, 0.4941]; n=200 |
| B/cohesion/censored | 0 [0, 0]; n=200 |
| B/cohesion/informative | 0 [0, 0]; n=200 |
| B/cohesion/learning-epochs | N/A (n=0) |
| B/cohesion/stabilized | 0 [0, 0]; n=200 |
| B/meta/censored | 0 [0, 0]; n=200 |
| B/meta/informative | 0 [0, 0]; n=200 |
| B/meta/learning-epochs | N/A (n=0) |
| B/meta/stabilized | 0 [0, 0]; n=200 |
| B/none/censored | 0 [0, 0]; n=200 |
| B/none/informative | 0 [0, 0]; n=200 |
| B/none/learning-epochs | N/A (n=0) |
| B/none/stabilized | 0 [0, 0]; n=200 |
| B/people/action:ask | 0.0958 [0.0835, 0.1082]; n=200 |
| B/people/action:break | 0.1038 [0.0918, 0.1157]; n=200 |
| B/people/action:deceive | 0.1050 [0.0934, 0.1166]; n=200 |
| B/people/action:keep | 0.0983 [0.0867, 0.1100]; n=200 |
| B/people/action:leave | 0.0875 [0.0769, 0.0981]; n=200 |
| B/people/action:trade | 0.1046 [0.0921, 0.1170]; n=200 |
| B/people/action:wait | 0.1021 [0.0903, 0.1139]; n=200 |
| B/people/action:work | 0.1004 [0.0880, 0.1129]; n=200 |
| B/people/censored | 0.9150 [0.8760, 0.9540]; n=200 |
| B/people/informative | 1.0000 [1.0000, 1.0000]; n=200 |
| B/people/learning-epochs | 7.5882 [6.8556, 8.3208]; n=17 |
| B/people/outcome:bad | 0.7558 [0.7372, 0.7745]; n=200 |
| B/people/outcome:good | 0.1650 [0.1469, 0.1832]; n=200 |
| B/people/outcome:unfinished | 0.0791 [0.0724, 0.0858]; n=200 |
| B/people/receipts | 9.5700 [9.3754, 9.7646]; n=200 |
| B/people/stabilized | 0.0850 [0.0460, 0.1240]; n=200 |
| B/space/censored | 0 [0, 0]; n=200 |
| B/space/informative | 0 [0, 0]; n=200 |
| B/space/learning-epochs | N/A (n=0) |
| B/space/stabilized | 0 [0, 0]; n=200 |
| B/strategy/censored | 0 [0, 0]; n=200 |
| B/strategy/informative | 0 [0, 0]; n=200 |
| B/strategy/learning-epochs | N/A (n=0) |
| B/strategy/stabilized | 0 [0, 0]; n=200 |
| O/adaptation/censored | 0 [0, 0]; n=200 |
| O/adaptation/informative | 0 [0, 0]; n=200 |
| O/adaptation/learning-epochs | N/A (n=0) |
| O/adaptation/stabilized | 0 [0, 0]; n=200 |
| O/body/action:confront | 0.1088 [0.0961, 0.1214]; n=200 |
| O/body/censored | 0.5400 [0.4703, 0.6097]; n=200 |
| O/body/informative | 0.7250 [0.6625, 0.7875]; n=200 |
| O/body/learning-epochs | 4.5946 [3.7044, 5.4848]; n=37 |
| O/body/outcome:bad | 0.9345 [0.8958, 0.9731]; n=145 |
| O/body/outcome:good | 0.0655 [0.0269, 0.1042]; n=145 |
| O/body/outcome:unfinished | 0 [0, 0]; n=145 |
| O/body/receipts | 1.3050 [1.1529, 1.4571]; n=200 |
| O/body/stabilized | 0.1850 [0.1307, 0.2393]; n=200 |
| O/cohesion/censored | 0 [0, 0]; n=200 |
| O/cohesion/informative | 0 [0, 0]; n=200 |
| O/cohesion/learning-epochs | N/A (n=0) |
| O/cohesion/stabilized | 0 [0, 0]; n=200 |
| O/meta/censored | 0 [0, 0]; n=200 |
| O/meta/informative | 0 [0, 0]; n=200 |
| O/meta/learning-epochs | N/A (n=0) |
| O/meta/stabilized | 0 [0, 0]; n=200 |
| O/none/censored | 0 [0, 0]; n=200 |
| O/none/informative | 0 [0, 0]; n=200 |
| O/none/learning-epochs | N/A (n=0) |
| O/none/stabilized | 0 [0, 0]; n=200 |
| O/people/action:accept_promise | 0.0962 [0.0838, 0.1087]; n=200 |
| O/people/action:accept_trade | 0.0775 [0.0670, 0.0880]; n=200 |
| O/people/action:accept_work | 0.1350 [0.1210, 0.1490]; n=200 |
| O/people/action:chase | 0.1029 [0.0905, 0.1154]; n=200 |
| O/people/action:give | 0.0813 [0.0699, 0.0926]; n=200 |
| O/people/action:let_go | 0.0542 [0.0452, 0.0632]; n=200 |
| O/people/action:pay | 0.0767 [0.0661, 0.0872]; n=200 |
| O/people/action:refuse | 0.1150 [0.1024, 0.1276]; n=200 |
| O/people/action:renege | 0.1021 [0.0902, 0.1140]; n=200 |
| O/people/action:wait | 0.0504 [0.0410, 0.0598]; n=200 |
| O/people/censored | 1.0000 [1.0000, 1.0000]; n=200 |
| O/people/informative | 1.0000 [1.0000, 1.0000]; n=200 |
| O/people/learning-epochs | N/A (n=0) |
| O/people/outcome:bad | 0.7892 [0.7709, 0.8075]; n=200 |
| O/people/outcome:good | 0.2033 [0.1850, 0.2216]; n=200 |
| O/people/outcome:unfinished | 0.0075 [0.0039, 0.0111]; n=200 |
| O/people/receipts | 10.6950 [10.5429, 10.8471]; n=200 |
| O/people/stabilized | 0 [0, 0]; n=200 |
| O/space/censored | 0 [0, 0]; n=200 |
| O/space/informative | 0 [0, 0]; n=200 |
| O/space/learning-epochs | N/A (n=0) |
| O/space/stabilized | 0 [0, 0]; n=200 |
| O/strategy/censored | 0 [0, 0]; n=200 |
| O/strategy/informative | 0 [0, 0]; n=200 |
| O/strategy/learning-epochs | N/A (n=0) |
| O/strategy/stabilized | 0 [0, 0]; n=200 |

### v1/INFJ

| Mind/domain/metric | Mean [95% interval]; seeds |
|---|---|
| A/adaptation/censored | 0 [0, 0]; n=200 |
| A/adaptation/informative | 0 [0, 0]; n=200 |
| A/adaptation/learning-epochs | N/A (n=0) |
| A/adaptation/stabilized | 0 [0, 0]; n=200 |
| A/body/action:fight | 0.1062 [0.0943, 0.1182]; n=200 |
| A/body/action:steal | 0.0975 [0.0847, 0.1103]; n=200 |
| A/body/censored | 0.4500 [0.3804, 0.5196]; n=200 |
| A/body/informative | 0.9250 [0.8882, 0.9618]; n=200 |
| A/body/learning-epochs | 3.6421 [3.1090, 4.1752]; n=95 |
| A/body/outcome:bad | 0.8805 [0.8461, 0.9150]; n=185 |
| A/body/outcome:good | 0.1112 [0.0771, 0.1453]; n=185 |
| A/body/outcome:unfinished | 0.0083 [0.0009, 0.0157]; n=185 |
| A/body/receipts | 2.4450 [2.2344, 2.6556]; n=200 |
| A/body/stabilized | 0.4750 [0.4052, 0.5448]; n=200 |
| A/cohesion/censored | 0 [0, 0]; n=200 |
| A/cohesion/informative | 0 [0, 0]; n=200 |
| A/cohesion/learning-epochs | N/A (n=0) |
| A/cohesion/stabilized | 0 [0, 0]; n=200 |
| A/meta/censored | 0 [0, 0]; n=200 |
| A/meta/informative | 0 [0, 0]; n=200 |
| A/meta/learning-epochs | N/A (n=0) |
| A/meta/stabilized | 0 [0, 0]; n=200 |
| A/none/censored | 0 [0, 0]; n=200 |
| A/none/informative | 0 [0, 0]; n=200 |
| A/none/learning-epochs | N/A (n=0) |
| A/none/stabilized | 0 [0, 0]; n=200 |
| A/people/action:ask | 0.1112 [0.0990, 0.1235]; n=200 |
| A/people/action:break | 0.1154 [0.1024, 0.1284]; n=200 |
| A/people/action:deceive | 0.1112 [0.0995, 0.1230]; n=200 |
| A/people/action:keep | 0.0971 [0.0843, 0.1099]; n=200 |
| A/people/action:leave | 0.0917 [0.0799, 0.1034]; n=200 |
| A/people/action:trade | 0.0871 [0.0754, 0.0988]; n=200 |
| A/people/action:wait | 0.0979 [0.0855, 0.1103]; n=200 |
| A/people/action:work | 0.0846 [0.0731, 0.0961]; n=200 |
| A/people/censored | 0.9500 [0.9195, 0.9805]; n=200 |
| A/people/informative | 1.0000 [1.0000, 1.0000]; n=200 |
| A/people/learning-epochs | 8.3000 [7.7108, 8.8892]; n=10 |
| A/people/outcome:bad | 0.7583 [0.7409, 0.7757]; n=200 |
| A/people/outcome:good | 0.1559 [0.1390, 0.1728]; n=200 |
| A/people/outcome:unfinished | 0.0858 [0.0794, 0.0922]; n=200 |
| A/people/receipts | 9.5550 [9.3444, 9.7656]; n=200 |
| A/people/stabilized | 0.0500 [0.0195, 0.0805]; n=200 |
| A/space/censored | 0 [0, 0]; n=200 |
| A/space/informative | 0 [0, 0]; n=200 |
| A/space/learning-epochs | N/A (n=0) |
| A/space/stabilized | 0 [0, 0]; n=200 |
| A/strategy/censored | 0 [0, 0]; n=200 |
| A/strategy/informative | 0 [0, 0]; n=200 |
| A/strategy/learning-epochs | N/A (n=0) |
| A/strategy/stabilized | 0 [0, 0]; n=200 |
| B/adaptation/censored | 0 [0, 0]; n=200 |
| B/adaptation/informative | 0 [0, 0]; n=200 |
| B/adaptation/learning-epochs | N/A (n=0) |
| B/adaptation/stabilized | 0 [0, 0]; n=200 |
| B/body/action:fight | 0.1046 [0.0920, 0.1171]; n=200 |
| B/body/action:steal | 0.0983 [0.0868, 0.1099]; n=200 |
| B/body/censored | 0.4950 [0.4251, 0.5649]; n=200 |
| B/body/informative | 0.9250 [0.8882, 0.9618]; n=200 |
| B/body/learning-epochs | 3.5581 [3.0447, 4.0715]; n=86 |
| B/body/outcome:bad | 0.8599 [0.8219, 0.8979]; n=187 |
| B/body/outcome:good | 0.0980 [0.0648, 0.1313]; n=187 |
| B/body/outcome:unfinished | 0.0421 [0.0216, 0.0626]; n=187 |
| B/body/receipts | 2.4350 [2.2379, 2.6321]; n=200 |
| B/body/stabilized | 0.4300 [0.3608, 0.4992]; n=200 |
| B/cohesion/censored | 0 [0, 0]; n=200 |
| B/cohesion/informative | 0 [0, 0]; n=200 |
| B/cohesion/learning-epochs | N/A (n=0) |
| B/cohesion/stabilized | 0 [0, 0]; n=200 |
| B/meta/censored | 0 [0, 0]; n=200 |
| B/meta/informative | 0 [0, 0]; n=200 |
| B/meta/learning-epochs | N/A (n=0) |
| B/meta/stabilized | 0 [0, 0]; n=200 |
| B/none/censored | 0 [0, 0]; n=200 |
| B/none/informative | 0 [0, 0]; n=200 |
| B/none/learning-epochs | N/A (n=0) |
| B/none/stabilized | 0 [0, 0]; n=200 |
| B/people/action:ask | 0.0979 [0.0856, 0.1103]; n=200 |
| B/people/action:break | 0.1067 [0.0946, 0.1187]; n=200 |
| B/people/action:deceive | 0.1079 [0.0960, 0.1198]; n=200 |
| B/people/action:keep | 0.0950 [0.0835, 0.1065]; n=200 |
| B/people/action:leave | 0.0875 [0.0766, 0.0984]; n=200 |
| B/people/action:trade | 0.1025 [0.0901, 0.1149]; n=200 |
| B/people/action:wait | 0.1029 [0.0910, 0.1149]; n=200 |
| B/people/action:work | 0.0967 [0.0846, 0.1087]; n=200 |
| B/people/censored | 0.9350 [0.9005, 0.9695]; n=200 |
| B/people/informative | 1.0000 [1.0000, 1.0000]; n=200 |
| B/people/learning-epochs | 7.2308 [6.4672, 7.9944]; n=13 |
| B/people/outcome:bad | 0.7586 [0.7401, 0.7771]; n=200 |
| B/people/outcome:good | 0.1632 [0.1454, 0.1809]; n=200 |
| B/people/outcome:unfinished | 0.0782 [0.0715, 0.0849]; n=200 |
| B/people/receipts | 9.5650 [9.3679, 9.7621]; n=200 |
| B/people/stabilized | 0.0650 [0.0305, 0.0995]; n=200 |
| B/space/censored | 0 [0, 0]; n=200 |
| B/space/informative | 0 [0, 0]; n=200 |
| B/space/learning-epochs | N/A (n=0) |
| B/space/stabilized | 0 [0, 0]; n=200 |
| B/strategy/censored | 0 [0, 0]; n=200 |
| B/strategy/informative | 0 [0, 0]; n=200 |
| B/strategy/learning-epochs | N/A (n=0) |
| B/strategy/stabilized | 0 [0, 0]; n=200 |
| O/adaptation/censored | 0 [0, 0]; n=200 |
| O/adaptation/informative | 0 [0, 0]; n=200 |
| O/adaptation/learning-epochs | N/A (n=0) |
| O/adaptation/stabilized | 0 [0, 0]; n=200 |
| O/body/action:confront | 0.1058 [0.0938, 0.1179]; n=200 |
| O/body/censored | 0.5050 [0.4351, 0.5749]; n=200 |
| O/body/informative | 0.7400 [0.6787, 0.8013]; n=200 |
| O/body/learning-epochs | 3.9574 [3.2016, 4.7133]; n=47 |
| O/body/outcome:bad | 0.9426 [0.9081, 0.9770]; n=148 |
| O/body/outcome:good | 0.0574 [0.0230, 0.0919]; n=148 |
| O/body/outcome:unfinished | 0 [0, 0]; n=148 |
| O/body/receipts | 1.2700 [1.1255, 1.4145]; n=200 |
| O/body/stabilized | 0.2350 [0.1757, 0.2943]; n=200 |
| O/cohesion/censored | 0 [0, 0]; n=200 |
| O/cohesion/informative | 0 [0, 0]; n=200 |
| O/cohesion/learning-epochs | N/A (n=0) |
| O/cohesion/stabilized | 0 [0, 0]; n=200 |
| O/meta/censored | 0 [0, 0]; n=200 |
| O/meta/informative | 0 [0, 0]; n=200 |
| O/meta/learning-epochs | N/A (n=0) |
| O/meta/stabilized | 0 [0, 0]; n=200 |
| O/none/censored | 0 [0, 0]; n=200 |
| O/none/informative | 0 [0, 0]; n=200 |
| O/none/learning-epochs | N/A (n=0) |
| O/none/stabilized | 0 [0, 0]; n=200 |
| O/people/action:accept_promise | 0.0846 [0.0730, 0.0962]; n=200 |
| O/people/action:accept_trade | 0.0729 [0.0627, 0.0831]; n=200 |
| O/people/action:accept_work | 0.1483 [0.1342, 0.1625]; n=200 |
| O/people/action:chase | 0.1175 [0.1045, 0.1305]; n=200 |
| O/people/action:give | 0.0771 [0.0660, 0.0882]; n=200 |
| O/people/action:let_go | 0.0362 [0.0286, 0.0439]; n=200 |
| O/people/action:pay | 0.0733 [0.0634, 0.0833]; n=200 |
| O/people/action:refuse | 0.1204 [0.1073, 0.1335]; n=200 |
| O/people/action:renege | 0.1100 [0.0975, 0.1225]; n=200 |
| O/people/action:wait | 0.0538 [0.0443, 0.0632]; n=200 |
| O/people/censored | 1.0000 [1.0000, 1.0000]; n=200 |
| O/people/informative | 1.0000 [1.0000, 1.0000]; n=200 |
| O/people/learning-epochs | N/A (n=0) |
| O/people/outcome:bad | 0.7868 [0.7680, 0.8055]; n=200 |
| O/people/outcome:good | 0.2054 [0.1867, 0.2241]; n=200 |
| O/people/outcome:unfinished | 0.0079 [0.0042, 0.0115]; n=200 |
| O/people/receipts | 10.7300 [10.5855, 10.8745]; n=200 |
| O/people/stabilized | 0 [0, 0]; n=200 |
| O/space/censored | 0 [0, 0]; n=200 |
| O/space/informative | 0 [0, 0]; n=200 |
| O/space/learning-epochs | N/A (n=0) |
| O/space/stabilized | 0 [0, 0]; n=200 |
| O/strategy/censored | 0 [0, 0]; n=200 |
| O/strategy/informative | 0 [0, 0]; n=200 |
| O/strategy/learning-epochs | N/A (n=0) |
| O/strategy/stabilized | 0 [0, 0]; n=200 |

### v1/ESTP

| Mind/domain/metric | Mean [95% interval]; seeds |
|---|---|
| A/adaptation/censored | 0 [0, 0]; n=200 |
| A/adaptation/informative | 0 [0, 0]; n=200 |
| A/adaptation/learning-epochs | N/A (n=0) |
| A/adaptation/stabilized | 0 [0, 0]; n=200 |
| A/body/action:fight | 0.1050 [0.0929, 0.1171]; n=200 |
| A/body/action:steal | 0.0996 [0.0869, 0.1123]; n=200 |
| A/body/censored | 0.4750 [0.4052, 0.5448]; n=200 |
| A/body/informative | 0.9200 [0.8821, 0.9579]; n=200 |
| A/body/learning-epochs | 3.1685 [2.6439, 3.6932]; n=89 |
| A/body/outcome:bad | 0.8716 [0.8370, 0.9063]; n=184 |
| A/body/outcome:good | 0.1141 [0.0801, 0.1481]; n=184 |
| A/body/outcome:unfinished | 0.0142 [0.0042, 0.0243]; n=184 |
| A/body/receipts | 2.4550 [2.2462, 2.6638]; n=200 |
| A/body/stabilized | 0.4450 [0.3755, 0.5145]; n=200 |
| A/cohesion/censored | 0 [0, 0]; n=200 |
| A/cohesion/informative | 0 [0, 0]; n=200 |
| A/cohesion/learning-epochs | N/A (n=0) |
| A/cohesion/stabilized | 0 [0, 0]; n=200 |
| A/meta/censored | 0 [0, 0]; n=200 |
| A/meta/informative | 0 [0, 0]; n=200 |
| A/meta/learning-epochs | N/A (n=0) |
| A/meta/stabilized | 0 [0, 0]; n=200 |
| A/none/censored | 0 [0, 0]; n=200 |
| A/none/informative | 0 [0, 0]; n=200 |
| A/none/learning-epochs | N/A (n=0) |
| A/none/stabilized | 0 [0, 0]; n=200 |
| A/people/action:ask | 0.1092 [0.0970, 0.1213]; n=200 |
| A/people/action:break | 0.1133 [0.1002, 0.1264]; n=200 |
| A/people/action:deceive | 0.1087 [0.0973, 0.1202]; n=200 |
| A/people/action:keep | 0.0983 [0.0858, 0.1108]; n=200 |
| A/people/action:leave | 0.0937 [0.0818, 0.1057]; n=200 |
| A/people/action:trade | 0.0892 [0.0774, 0.1009]; n=200 |
| A/people/action:wait | 0.0971 [0.0847, 0.1095]; n=200 |
| A/people/action:work | 0.0858 [0.0744, 0.0973]; n=200 |
| A/people/censored | 0.9200 [0.8821, 0.9579]; n=200 |
| A/people/informative | 1.0000 [1.0000, 1.0000]; n=200 |
| A/people/learning-epochs | 7.8125 [7.1606, 8.4644]; n=16 |
| A/people/outcome:bad | 0.7615 [0.7442, 0.7787]; n=200 |
| A/people/outcome:good | 0.1555 [0.1388, 0.1721]; n=200 |
| A/people/outcome:unfinished | 0.0831 [0.0764, 0.0897]; n=200 |
| A/people/receipts | 9.5450 [9.3362, 9.7538]; n=200 |
| A/people/stabilized | 0.0800 [0.0421, 0.1179]; n=200 |
| A/space/censored | 0 [0, 0]; n=200 |
| A/space/informative | 0 [0, 0]; n=200 |
| A/space/learning-epochs | N/A (n=0) |
| A/space/stabilized | 0 [0, 0]; n=200 |
| A/strategy/censored | 0 [0, 0]; n=200 |
| A/strategy/informative | 0 [0, 0]; n=200 |
| A/strategy/learning-epochs | N/A (n=0) |
| A/strategy/stabilized | 0 [0, 0]; n=200 |
| B/adaptation/censored | 0 [0, 0]; n=200 |
| B/adaptation/informative | 0 [0, 0]; n=200 |
| B/adaptation/learning-epochs | N/A (n=0) |
| B/adaptation/stabilized | 0 [0, 0]; n=200 |
| B/body/action:fight | 0.1046 [0.0919, 0.1173]; n=200 |
| B/body/action:steal | 0.0979 [0.0865, 0.1094]; n=200 |
| B/body/censored | 0.5000 [0.4301, 0.5699]; n=200 |
| B/body/informative | 0.9250 [0.8882, 0.9618]; n=200 |
| B/body/learning-epochs | 3.3882 [2.8747, 3.9017]; n=85 |
| B/body/outcome:bad | 0.8462 [0.8064, 0.8859]; n=187 |
| B/body/outcome:good | 0.1133 [0.0776, 0.1490]; n=187 |
| B/body/outcome:unfinished | 0.0406 [0.0202, 0.0609]; n=187 |
| B/body/receipts | 2.4300 [2.2354, 2.6246]; n=200 |
| B/body/stabilized | 0.4250 [0.3559, 0.4941]; n=200 |
| B/cohesion/censored | 0 [0, 0]; n=200 |
| B/cohesion/informative | 0 [0, 0]; n=200 |
| B/cohesion/learning-epochs | N/A (n=0) |
| B/cohesion/stabilized | 0 [0, 0]; n=200 |
| B/meta/censored | 0 [0, 0]; n=200 |
| B/meta/informative | 0 [0, 0]; n=200 |
| B/meta/learning-epochs | N/A (n=0) |
| B/meta/stabilized | 0 [0, 0]; n=200 |
| B/none/censored | 0 [0, 0]; n=200 |
| B/none/informative | 0 [0, 0]; n=200 |
| B/none/learning-epochs | N/A (n=0) |
| B/none/stabilized | 0 [0, 0]; n=200 |
| B/people/action:ask | 0.0958 [0.0835, 0.1082]; n=200 |
| B/people/action:break | 0.1038 [0.0918, 0.1157]; n=200 |
| B/people/action:deceive | 0.1050 [0.0934, 0.1166]; n=200 |
| B/people/action:keep | 0.0983 [0.0867, 0.1100]; n=200 |
| B/people/action:leave | 0.0875 [0.0769, 0.0981]; n=200 |
| B/people/action:trade | 0.1046 [0.0921, 0.1170]; n=200 |
| B/people/action:wait | 0.1021 [0.0903, 0.1139]; n=200 |
| B/people/action:work | 0.1004 [0.0880, 0.1129]; n=200 |
| B/people/censored | 0.9150 [0.8760, 0.9540]; n=200 |
| B/people/informative | 1.0000 [1.0000, 1.0000]; n=200 |
| B/people/learning-epochs | 7.5882 [6.8556, 8.3208]; n=17 |
| B/people/outcome:bad | 0.7558 [0.7372, 0.7745]; n=200 |
| B/people/outcome:good | 0.1650 [0.1469, 0.1832]; n=200 |
| B/people/outcome:unfinished | 0.0791 [0.0724, 0.0858]; n=200 |
| B/people/receipts | 9.5700 [9.3754, 9.7646]; n=200 |
| B/people/stabilized | 0.0850 [0.0460, 0.1240]; n=200 |
| B/space/censored | 0 [0, 0]; n=200 |
| B/space/informative | 0 [0, 0]; n=200 |
| B/space/learning-epochs | N/A (n=0) |
| B/space/stabilized | 0 [0, 0]; n=200 |
| B/strategy/censored | 0 [0, 0]; n=200 |
| B/strategy/informative | 0 [0, 0]; n=200 |
| B/strategy/learning-epochs | N/A (n=0) |
| B/strategy/stabilized | 0 [0, 0]; n=200 |
| O/adaptation/censored | 0 [0, 0]; n=200 |
| O/adaptation/informative | 0 [0, 0]; n=200 |
| O/adaptation/learning-epochs | N/A (n=0) |
| O/adaptation/stabilized | 0 [0, 0]; n=200 |
| O/body/action:confront | 0.1088 [0.0961, 0.1214]; n=200 |
| O/body/censored | 0.5400 [0.4703, 0.6097]; n=200 |
| O/body/informative | 0.7250 [0.6625, 0.7875]; n=200 |
| O/body/learning-epochs | 4.5946 [3.7044, 5.4848]; n=37 |
| O/body/outcome:bad | 0.9345 [0.8958, 0.9731]; n=145 |
| O/body/outcome:good | 0.0655 [0.0269, 0.1042]; n=145 |
| O/body/outcome:unfinished | 0 [0, 0]; n=145 |
| O/body/receipts | 1.3050 [1.1529, 1.4571]; n=200 |
| O/body/stabilized | 0.1850 [0.1307, 0.2393]; n=200 |
| O/cohesion/censored | 0 [0, 0]; n=200 |
| O/cohesion/informative | 0 [0, 0]; n=200 |
| O/cohesion/learning-epochs | N/A (n=0) |
| O/cohesion/stabilized | 0 [0, 0]; n=200 |
| O/meta/censored | 0 [0, 0]; n=200 |
| O/meta/informative | 0 [0, 0]; n=200 |
| O/meta/learning-epochs | N/A (n=0) |
| O/meta/stabilized | 0 [0, 0]; n=200 |
| O/none/censored | 0 [0, 0]; n=200 |
| O/none/informative | 0 [0, 0]; n=200 |
| O/none/learning-epochs | N/A (n=0) |
| O/none/stabilized | 0 [0, 0]; n=200 |
| O/people/action:accept_promise | 0.0962 [0.0838, 0.1087]; n=200 |
| O/people/action:accept_trade | 0.0775 [0.0670, 0.0880]; n=200 |
| O/people/action:accept_work | 0.1350 [0.1210, 0.1490]; n=200 |
| O/people/action:chase | 0.1029 [0.0905, 0.1154]; n=200 |
| O/people/action:give | 0.0813 [0.0699, 0.0926]; n=200 |
| O/people/action:let_go | 0.0542 [0.0452, 0.0632]; n=200 |
| O/people/action:pay | 0.0767 [0.0661, 0.0872]; n=200 |
| O/people/action:refuse | 0.1150 [0.1024, 0.1276]; n=200 |
| O/people/action:renege | 0.1021 [0.0902, 0.1140]; n=200 |
| O/people/action:wait | 0.0504 [0.0410, 0.0598]; n=200 |
| O/people/censored | 1.0000 [1.0000, 1.0000]; n=200 |
| O/people/informative | 1.0000 [1.0000, 1.0000]; n=200 |
| O/people/learning-epochs | N/A (n=0) |
| O/people/outcome:bad | 0.7892 [0.7709, 0.8075]; n=200 |
| O/people/outcome:good | 0.2033 [0.1850, 0.2216]; n=200 |
| O/people/outcome:unfinished | 0.0075 [0.0039, 0.0111]; n=200 |
| O/people/receipts | 10.6950 [10.5429, 10.8471]; n=200 |
| O/people/stabilized | 0 [0, 0]; n=200 |
| O/space/censored | 0 [0, 0]; n=200 |
| O/space/informative | 0 [0, 0]; n=200 |
| O/space/learning-epochs | N/A (n=0) |
| O/space/stabilized | 0 [0, 0]; n=200 |
| O/strategy/censored | 0 [0, 0]; n=200 |
| O/strategy/informative | 0 [0, 0]; n=200 |
| O/strategy/learning-epochs | N/A (n=0) |
| O/strategy/stabilized | 0 [0, 0]; n=200 |

### v1/ISTP

| Mind/domain/metric | Mean [95% interval]; seeds |
|---|---|
| A/adaptation/censored | 0 [0, 0]; n=200 |
| A/adaptation/informative | 0 [0, 0]; n=200 |
| A/adaptation/learning-epochs | N/A (n=0) |
| A/adaptation/stabilized | 0 [0, 0]; n=200 |
| A/body/action:fight | 0.1062 [0.0943, 0.1182]; n=200 |
| A/body/action:steal | 0.0975 [0.0847, 0.1103]; n=200 |
| A/body/censored | 0.4500 [0.3804, 0.5196]; n=200 |
| A/body/informative | 0.9250 [0.8882, 0.9618]; n=200 |
| A/body/learning-epochs | 3.6421 [3.1090, 4.1752]; n=95 |
| A/body/outcome:bad | 0.8805 [0.8461, 0.9150]; n=185 |
| A/body/outcome:good | 0.1112 [0.0771, 0.1453]; n=185 |
| A/body/outcome:unfinished | 0.0083 [0.0009, 0.0157]; n=185 |
| A/body/receipts | 2.4450 [2.2344, 2.6556]; n=200 |
| A/body/stabilized | 0.4750 [0.4052, 0.5448]; n=200 |
| A/cohesion/censored | 0 [0, 0]; n=200 |
| A/cohesion/informative | 0 [0, 0]; n=200 |
| A/cohesion/learning-epochs | N/A (n=0) |
| A/cohesion/stabilized | 0 [0, 0]; n=200 |
| A/meta/censored | 0 [0, 0]; n=200 |
| A/meta/informative | 0 [0, 0]; n=200 |
| A/meta/learning-epochs | N/A (n=0) |
| A/meta/stabilized | 0 [0, 0]; n=200 |
| A/none/censored | 0 [0, 0]; n=200 |
| A/none/informative | 0 [0, 0]; n=200 |
| A/none/learning-epochs | N/A (n=0) |
| A/none/stabilized | 0 [0, 0]; n=200 |
| A/people/action:ask | 0.1112 [0.0990, 0.1235]; n=200 |
| A/people/action:break | 0.1154 [0.1024, 0.1284]; n=200 |
| A/people/action:deceive | 0.1112 [0.0995, 0.1230]; n=200 |
| A/people/action:keep | 0.0971 [0.0843, 0.1099]; n=200 |
| A/people/action:leave | 0.0917 [0.0799, 0.1034]; n=200 |
| A/people/action:trade | 0.0871 [0.0754, 0.0988]; n=200 |
| A/people/action:wait | 0.0979 [0.0855, 0.1103]; n=200 |
| A/people/action:work | 0.0846 [0.0731, 0.0961]; n=200 |
| A/people/censored | 0.9500 [0.9195, 0.9805]; n=200 |
| A/people/informative | 1.0000 [1.0000, 1.0000]; n=200 |
| A/people/learning-epochs | 8.3000 [7.7108, 8.8892]; n=10 |
| A/people/outcome:bad | 0.7583 [0.7409, 0.7757]; n=200 |
| A/people/outcome:good | 0.1559 [0.1390, 0.1728]; n=200 |
| A/people/outcome:unfinished | 0.0858 [0.0794, 0.0922]; n=200 |
| A/people/receipts | 9.5550 [9.3444, 9.7656]; n=200 |
| A/people/stabilized | 0.0500 [0.0195, 0.0805]; n=200 |
| A/space/censored | 0 [0, 0]; n=200 |
| A/space/informative | 0 [0, 0]; n=200 |
| A/space/learning-epochs | N/A (n=0) |
| A/space/stabilized | 0 [0, 0]; n=200 |
| A/strategy/censored | 0 [0, 0]; n=200 |
| A/strategy/informative | 0 [0, 0]; n=200 |
| A/strategy/learning-epochs | N/A (n=0) |
| A/strategy/stabilized | 0 [0, 0]; n=200 |
| B/adaptation/censored | 0 [0, 0]; n=200 |
| B/adaptation/informative | 0 [0, 0]; n=200 |
| B/adaptation/learning-epochs | N/A (n=0) |
| B/adaptation/stabilized | 0 [0, 0]; n=200 |
| B/body/action:fight | 0.1046 [0.0920, 0.1171]; n=200 |
| B/body/action:steal | 0.0983 [0.0868, 0.1099]; n=200 |
| B/body/censored | 0.4950 [0.4251, 0.5649]; n=200 |
| B/body/informative | 0.9250 [0.8882, 0.9618]; n=200 |
| B/body/learning-epochs | 3.5581 [3.0447, 4.0715]; n=86 |
| B/body/outcome:bad | 0.8599 [0.8219, 0.8979]; n=187 |
| B/body/outcome:good | 0.0980 [0.0648, 0.1313]; n=187 |
| B/body/outcome:unfinished | 0.0421 [0.0216, 0.0626]; n=187 |
| B/body/receipts | 2.4350 [2.2379, 2.6321]; n=200 |
| B/body/stabilized | 0.4300 [0.3608, 0.4992]; n=200 |
| B/cohesion/censored | 0 [0, 0]; n=200 |
| B/cohesion/informative | 0 [0, 0]; n=200 |
| B/cohesion/learning-epochs | N/A (n=0) |
| B/cohesion/stabilized | 0 [0, 0]; n=200 |
| B/meta/censored | 0 [0, 0]; n=200 |
| B/meta/informative | 0 [0, 0]; n=200 |
| B/meta/learning-epochs | N/A (n=0) |
| B/meta/stabilized | 0 [0, 0]; n=200 |
| B/none/censored | 0 [0, 0]; n=200 |
| B/none/informative | 0 [0, 0]; n=200 |
| B/none/learning-epochs | N/A (n=0) |
| B/none/stabilized | 0 [0, 0]; n=200 |
| B/people/action:ask | 0.0979 [0.0856, 0.1103]; n=200 |
| B/people/action:break | 0.1067 [0.0946, 0.1187]; n=200 |
| B/people/action:deceive | 0.1079 [0.0960, 0.1198]; n=200 |
| B/people/action:keep | 0.0950 [0.0835, 0.1065]; n=200 |
| B/people/action:leave | 0.0875 [0.0766, 0.0984]; n=200 |
| B/people/action:trade | 0.1025 [0.0901, 0.1149]; n=200 |
| B/people/action:wait | 0.1029 [0.0910, 0.1149]; n=200 |
| B/people/action:work | 0.0967 [0.0846, 0.1087]; n=200 |
| B/people/censored | 0.9350 [0.9005, 0.9695]; n=200 |
| B/people/informative | 1.0000 [1.0000, 1.0000]; n=200 |
| B/people/learning-epochs | 7.2308 [6.4672, 7.9944]; n=13 |
| B/people/outcome:bad | 0.7586 [0.7401, 0.7771]; n=200 |
| B/people/outcome:good | 0.1632 [0.1454, 0.1809]; n=200 |
| B/people/outcome:unfinished | 0.0782 [0.0715, 0.0849]; n=200 |
| B/people/receipts | 9.5650 [9.3679, 9.7621]; n=200 |
| B/people/stabilized | 0.0650 [0.0305, 0.0995]; n=200 |
| B/space/censored | 0 [0, 0]; n=200 |
| B/space/informative | 0 [0, 0]; n=200 |
| B/space/learning-epochs | N/A (n=0) |
| B/space/stabilized | 0 [0, 0]; n=200 |
| B/strategy/censored | 0 [0, 0]; n=200 |
| B/strategy/informative | 0 [0, 0]; n=200 |
| B/strategy/learning-epochs | N/A (n=0) |
| B/strategy/stabilized | 0 [0, 0]; n=200 |
| O/adaptation/censored | 0 [0, 0]; n=200 |
| O/adaptation/informative | 0 [0, 0]; n=200 |
| O/adaptation/learning-epochs | N/A (n=0) |
| O/adaptation/stabilized | 0 [0, 0]; n=200 |
| O/body/action:confront | 0.1058 [0.0938, 0.1179]; n=200 |
| O/body/censored | 0.5050 [0.4351, 0.5749]; n=200 |
| O/body/informative | 0.7400 [0.6787, 0.8013]; n=200 |
| O/body/learning-epochs | 3.9574 [3.2016, 4.7133]; n=47 |
| O/body/outcome:bad | 0.9426 [0.9081, 0.9770]; n=148 |
| O/body/outcome:good | 0.0574 [0.0230, 0.0919]; n=148 |
| O/body/outcome:unfinished | 0 [0, 0]; n=148 |
| O/body/receipts | 1.2700 [1.1255, 1.4145]; n=200 |
| O/body/stabilized | 0.2350 [0.1757, 0.2943]; n=200 |
| O/cohesion/censored | 0 [0, 0]; n=200 |
| O/cohesion/informative | 0 [0, 0]; n=200 |
| O/cohesion/learning-epochs | N/A (n=0) |
| O/cohesion/stabilized | 0 [0, 0]; n=200 |
| O/meta/censored | 0 [0, 0]; n=200 |
| O/meta/informative | 0 [0, 0]; n=200 |
| O/meta/learning-epochs | N/A (n=0) |
| O/meta/stabilized | 0 [0, 0]; n=200 |
| O/none/censored | 0 [0, 0]; n=200 |
| O/none/informative | 0 [0, 0]; n=200 |
| O/none/learning-epochs | N/A (n=0) |
| O/none/stabilized | 0 [0, 0]; n=200 |
| O/people/action:accept_promise | 0.0846 [0.0730, 0.0962]; n=200 |
| O/people/action:accept_trade | 0.0729 [0.0627, 0.0831]; n=200 |
| O/people/action:accept_work | 0.1483 [0.1342, 0.1625]; n=200 |
| O/people/action:chase | 0.1175 [0.1045, 0.1305]; n=200 |
| O/people/action:give | 0.0771 [0.0660, 0.0882]; n=200 |
| O/people/action:let_go | 0.0362 [0.0286, 0.0439]; n=200 |
| O/people/action:pay | 0.0733 [0.0634, 0.0833]; n=200 |
| O/people/action:refuse | 0.1204 [0.1073, 0.1335]; n=200 |
| O/people/action:renege | 0.1100 [0.0975, 0.1225]; n=200 |
| O/people/action:wait | 0.0538 [0.0443, 0.0632]; n=200 |
| O/people/censored | 1.0000 [1.0000, 1.0000]; n=200 |
| O/people/informative | 1.0000 [1.0000, 1.0000]; n=200 |
| O/people/learning-epochs | N/A (n=0) |
| O/people/outcome:bad | 0.7868 [0.7680, 0.8055]; n=200 |
| O/people/outcome:good | 0.2054 [0.1867, 0.2241]; n=200 |
| O/people/outcome:unfinished | 0.0079 [0.0042, 0.0115]; n=200 |
| O/people/receipts | 10.7300 [10.5855, 10.8745]; n=200 |
| O/people/stabilized | 0 [0, 0]; n=200 |
| O/space/censored | 0 [0, 0]; n=200 |
| O/space/informative | 0 [0, 0]; n=200 |
| O/space/learning-epochs | N/A (n=0) |
| O/space/stabilized | 0 [0, 0]; n=200 |
| O/strategy/censored | 0 [0, 0]; n=200 |
| O/strategy/informative | 0 [0, 0]; n=200 |
| O/strategy/learning-epochs | N/A (n=0) |
| O/strategy/stabilized | 0 [0, 0]; n=200 |

### v1/ENFP

| Mind/domain/metric | Mean [95% interval]; seeds |
|---|---|
| A/adaptation/censored | 0 [0, 0]; n=200 |
| A/adaptation/informative | 0 [0, 0]; n=200 |
| A/adaptation/learning-epochs | N/A (n=0) |
| A/adaptation/stabilized | 0 [0, 0]; n=200 |
| A/body/action:fight | 0.1050 [0.0929, 0.1171]; n=200 |
| A/body/action:steal | 0.0996 [0.0869, 0.1123]; n=200 |
| A/body/censored | 0.4750 [0.4052, 0.5448]; n=200 |
| A/body/informative | 0.9200 [0.8821, 0.9579]; n=200 |
| A/body/learning-epochs | 3.1685 [2.6439, 3.6932]; n=89 |
| A/body/outcome:bad | 0.8716 [0.8370, 0.9063]; n=184 |
| A/body/outcome:good | 0.1141 [0.0801, 0.1481]; n=184 |
| A/body/outcome:unfinished | 0.0142 [0.0042, 0.0243]; n=184 |
| A/body/receipts | 2.4550 [2.2462, 2.6638]; n=200 |
| A/body/stabilized | 0.4450 [0.3755, 0.5145]; n=200 |
| A/cohesion/censored | 0 [0, 0]; n=200 |
| A/cohesion/informative | 0 [0, 0]; n=200 |
| A/cohesion/learning-epochs | N/A (n=0) |
| A/cohesion/stabilized | 0 [0, 0]; n=200 |
| A/meta/censored | 0 [0, 0]; n=200 |
| A/meta/informative | 0 [0, 0]; n=200 |
| A/meta/learning-epochs | N/A (n=0) |
| A/meta/stabilized | 0 [0, 0]; n=200 |
| A/none/censored | 0 [0, 0]; n=200 |
| A/none/informative | 0 [0, 0]; n=200 |
| A/none/learning-epochs | N/A (n=0) |
| A/none/stabilized | 0 [0, 0]; n=200 |
| A/people/action:ask | 0.1092 [0.0970, 0.1213]; n=200 |
| A/people/action:break | 0.1133 [0.1002, 0.1264]; n=200 |
| A/people/action:deceive | 0.1087 [0.0973, 0.1202]; n=200 |
| A/people/action:keep | 0.0983 [0.0858, 0.1108]; n=200 |
| A/people/action:leave | 0.0937 [0.0818, 0.1057]; n=200 |
| A/people/action:trade | 0.0892 [0.0774, 0.1009]; n=200 |
| A/people/action:wait | 0.0971 [0.0847, 0.1095]; n=200 |
| A/people/action:work | 0.0858 [0.0744, 0.0973]; n=200 |
| A/people/censored | 0.9200 [0.8821, 0.9579]; n=200 |
| A/people/informative | 1.0000 [1.0000, 1.0000]; n=200 |
| A/people/learning-epochs | 7.8125 [7.1606, 8.4644]; n=16 |
| A/people/outcome:bad | 0.7615 [0.7442, 0.7787]; n=200 |
| A/people/outcome:good | 0.1555 [0.1388, 0.1721]; n=200 |
| A/people/outcome:unfinished | 0.0831 [0.0764, 0.0897]; n=200 |
| A/people/receipts | 9.5450 [9.3362, 9.7538]; n=200 |
| A/people/stabilized | 0.0800 [0.0421, 0.1179]; n=200 |
| A/space/censored | 0 [0, 0]; n=200 |
| A/space/informative | 0 [0, 0]; n=200 |
| A/space/learning-epochs | N/A (n=0) |
| A/space/stabilized | 0 [0, 0]; n=200 |
| A/strategy/censored | 0 [0, 0]; n=200 |
| A/strategy/informative | 0 [0, 0]; n=200 |
| A/strategy/learning-epochs | N/A (n=0) |
| A/strategy/stabilized | 0 [0, 0]; n=200 |
| B/adaptation/censored | 0 [0, 0]; n=200 |
| B/adaptation/informative | 0 [0, 0]; n=200 |
| B/adaptation/learning-epochs | N/A (n=0) |
| B/adaptation/stabilized | 0 [0, 0]; n=200 |
| B/body/action:fight | 0.1046 [0.0919, 0.1173]; n=200 |
| B/body/action:steal | 0.0979 [0.0865, 0.1094]; n=200 |
| B/body/censored | 0.5000 [0.4301, 0.5699]; n=200 |
| B/body/informative | 0.9250 [0.8882, 0.9618]; n=200 |
| B/body/learning-epochs | 3.3882 [2.8747, 3.9017]; n=85 |
| B/body/outcome:bad | 0.8462 [0.8064, 0.8859]; n=187 |
| B/body/outcome:good | 0.1133 [0.0776, 0.1490]; n=187 |
| B/body/outcome:unfinished | 0.0406 [0.0202, 0.0609]; n=187 |
| B/body/receipts | 2.4300 [2.2354, 2.6246]; n=200 |
| B/body/stabilized | 0.4250 [0.3559, 0.4941]; n=200 |
| B/cohesion/censored | 0 [0, 0]; n=200 |
| B/cohesion/informative | 0 [0, 0]; n=200 |
| B/cohesion/learning-epochs | N/A (n=0) |
| B/cohesion/stabilized | 0 [0, 0]; n=200 |
| B/meta/censored | 0 [0, 0]; n=200 |
| B/meta/informative | 0 [0, 0]; n=200 |
| B/meta/learning-epochs | N/A (n=0) |
| B/meta/stabilized | 0 [0, 0]; n=200 |
| B/none/censored | 0 [0, 0]; n=200 |
| B/none/informative | 0 [0, 0]; n=200 |
| B/none/learning-epochs | N/A (n=0) |
| B/none/stabilized | 0 [0, 0]; n=200 |
| B/people/action:ask | 0.0958 [0.0835, 0.1082]; n=200 |
| B/people/action:break | 0.1038 [0.0918, 0.1157]; n=200 |
| B/people/action:deceive | 0.1050 [0.0934, 0.1166]; n=200 |
| B/people/action:keep | 0.0983 [0.0867, 0.1100]; n=200 |
| B/people/action:leave | 0.0875 [0.0769, 0.0981]; n=200 |
| B/people/action:trade | 0.1046 [0.0921, 0.1170]; n=200 |
| B/people/action:wait | 0.1021 [0.0903, 0.1139]; n=200 |
| B/people/action:work | 0.1004 [0.0880, 0.1129]; n=200 |
| B/people/censored | 0.9150 [0.8760, 0.9540]; n=200 |
| B/people/informative | 1.0000 [1.0000, 1.0000]; n=200 |
| B/people/learning-epochs | 7.5882 [6.8556, 8.3208]; n=17 |
| B/people/outcome:bad | 0.7558 [0.7372, 0.7745]; n=200 |
| B/people/outcome:good | 0.1650 [0.1469, 0.1832]; n=200 |
| B/people/outcome:unfinished | 0.0791 [0.0724, 0.0858]; n=200 |
| B/people/receipts | 9.5700 [9.3754, 9.7646]; n=200 |
| B/people/stabilized | 0.0850 [0.0460, 0.1240]; n=200 |
| B/space/censored | 0 [0, 0]; n=200 |
| B/space/informative | 0 [0, 0]; n=200 |
| B/space/learning-epochs | N/A (n=0) |
| B/space/stabilized | 0 [0, 0]; n=200 |
| B/strategy/censored | 0 [0, 0]; n=200 |
| B/strategy/informative | 0 [0, 0]; n=200 |
| B/strategy/learning-epochs | N/A (n=0) |
| B/strategy/stabilized | 0 [0, 0]; n=200 |
| O/adaptation/censored | 0 [0, 0]; n=200 |
| O/adaptation/informative | 0 [0, 0]; n=200 |
| O/adaptation/learning-epochs | N/A (n=0) |
| O/adaptation/stabilized | 0 [0, 0]; n=200 |
| O/body/action:confront | 0.1088 [0.0961, 0.1214]; n=200 |
| O/body/censored | 0.5400 [0.4703, 0.6097]; n=200 |
| O/body/informative | 0.7250 [0.6625, 0.7875]; n=200 |
| O/body/learning-epochs | 4.5946 [3.7044, 5.4848]; n=37 |
| O/body/outcome:bad | 0.9345 [0.8958, 0.9731]; n=145 |
| O/body/outcome:good | 0.0655 [0.0269, 0.1042]; n=145 |
| O/body/outcome:unfinished | 0 [0, 0]; n=145 |
| O/body/receipts | 1.3050 [1.1529, 1.4571]; n=200 |
| O/body/stabilized | 0.1850 [0.1307, 0.2393]; n=200 |
| O/cohesion/censored | 0 [0, 0]; n=200 |
| O/cohesion/informative | 0 [0, 0]; n=200 |
| O/cohesion/learning-epochs | N/A (n=0) |
| O/cohesion/stabilized | 0 [0, 0]; n=200 |
| O/meta/censored | 0 [0, 0]; n=200 |
| O/meta/informative | 0 [0, 0]; n=200 |
| O/meta/learning-epochs | N/A (n=0) |
| O/meta/stabilized | 0 [0, 0]; n=200 |
| O/none/censored | 0 [0, 0]; n=200 |
| O/none/informative | 0 [0, 0]; n=200 |
| O/none/learning-epochs | N/A (n=0) |
| O/none/stabilized | 0 [0, 0]; n=200 |
| O/people/action:accept_promise | 0.0962 [0.0838, 0.1087]; n=200 |
| O/people/action:accept_trade | 0.0775 [0.0670, 0.0880]; n=200 |
| O/people/action:accept_work | 0.1350 [0.1210, 0.1490]; n=200 |
| O/people/action:chase | 0.1029 [0.0905, 0.1154]; n=200 |
| O/people/action:give | 0.0813 [0.0699, 0.0926]; n=200 |
| O/people/action:let_go | 0.0542 [0.0452, 0.0632]; n=200 |
| O/people/action:pay | 0.0767 [0.0661, 0.0872]; n=200 |
| O/people/action:refuse | 0.1150 [0.1024, 0.1276]; n=200 |
| O/people/action:renege | 0.1021 [0.0902, 0.1140]; n=200 |
| O/people/action:wait | 0.0504 [0.0410, 0.0598]; n=200 |
| O/people/censored | 1.0000 [1.0000, 1.0000]; n=200 |
| O/people/informative | 1.0000 [1.0000, 1.0000]; n=200 |
| O/people/learning-epochs | N/A (n=0) |
| O/people/outcome:bad | 0.7892 [0.7709, 0.8075]; n=200 |
| O/people/outcome:good | 0.2033 [0.1850, 0.2216]; n=200 |
| O/people/outcome:unfinished | 0.0075 [0.0039, 0.0111]; n=200 |
| O/people/receipts | 10.6950 [10.5429, 10.8471]; n=200 |
| O/people/stabilized | 0 [0, 0]; n=200 |
| O/space/censored | 0 [0, 0]; n=200 |
| O/space/informative | 0 [0, 0]; n=200 |
| O/space/learning-epochs | N/A (n=0) |
| O/space/stabilized | 0 [0, 0]; n=200 |
| O/strategy/censored | 0 [0, 0]; n=200 |
| O/strategy/informative | 0 [0, 0]; n=200 |
| O/strategy/learning-epochs | N/A (n=0) |
| O/strategy/stabilized | 0 [0, 0]; n=200 |

### v1/INFP

| Mind/domain/metric | Mean [95% interval]; seeds |
|---|---|
| A/adaptation/censored | 0 [0, 0]; n=200 |
| A/adaptation/informative | 0 [0, 0]; n=200 |
| A/adaptation/learning-epochs | N/A (n=0) |
| A/adaptation/stabilized | 0 [0, 0]; n=200 |
| A/body/action:fight | 0.1062 [0.0943, 0.1182]; n=200 |
| A/body/action:steal | 0.0975 [0.0847, 0.1103]; n=200 |
| A/body/censored | 0.4500 [0.3804, 0.5196]; n=200 |
| A/body/informative | 0.9250 [0.8882, 0.9618]; n=200 |
| A/body/learning-epochs | 3.6421 [3.1090, 4.1752]; n=95 |
| A/body/outcome:bad | 0.8805 [0.8461, 0.9150]; n=185 |
| A/body/outcome:good | 0.1112 [0.0771, 0.1453]; n=185 |
| A/body/outcome:unfinished | 0.0083 [0.0009, 0.0157]; n=185 |
| A/body/receipts | 2.4450 [2.2344, 2.6556]; n=200 |
| A/body/stabilized | 0.4750 [0.4052, 0.5448]; n=200 |
| A/cohesion/censored | 0 [0, 0]; n=200 |
| A/cohesion/informative | 0 [0, 0]; n=200 |
| A/cohesion/learning-epochs | N/A (n=0) |
| A/cohesion/stabilized | 0 [0, 0]; n=200 |
| A/meta/censored | 0 [0, 0]; n=200 |
| A/meta/informative | 0 [0, 0]; n=200 |
| A/meta/learning-epochs | N/A (n=0) |
| A/meta/stabilized | 0 [0, 0]; n=200 |
| A/none/censored | 0 [0, 0]; n=200 |
| A/none/informative | 0 [0, 0]; n=200 |
| A/none/learning-epochs | N/A (n=0) |
| A/none/stabilized | 0 [0, 0]; n=200 |
| A/people/action:ask | 0.1112 [0.0990, 0.1235]; n=200 |
| A/people/action:break | 0.1154 [0.1024, 0.1284]; n=200 |
| A/people/action:deceive | 0.1112 [0.0995, 0.1230]; n=200 |
| A/people/action:keep | 0.0971 [0.0843, 0.1099]; n=200 |
| A/people/action:leave | 0.0917 [0.0799, 0.1034]; n=200 |
| A/people/action:trade | 0.0871 [0.0754, 0.0988]; n=200 |
| A/people/action:wait | 0.0979 [0.0855, 0.1103]; n=200 |
| A/people/action:work | 0.0846 [0.0731, 0.0961]; n=200 |
| A/people/censored | 0.9500 [0.9195, 0.9805]; n=200 |
| A/people/informative | 1.0000 [1.0000, 1.0000]; n=200 |
| A/people/learning-epochs | 8.3000 [7.7108, 8.8892]; n=10 |
| A/people/outcome:bad | 0.7583 [0.7409, 0.7757]; n=200 |
| A/people/outcome:good | 0.1559 [0.1390, 0.1728]; n=200 |
| A/people/outcome:unfinished | 0.0858 [0.0794, 0.0922]; n=200 |
| A/people/receipts | 9.5550 [9.3444, 9.7656]; n=200 |
| A/people/stabilized | 0.0500 [0.0195, 0.0805]; n=200 |
| A/space/censored | 0 [0, 0]; n=200 |
| A/space/informative | 0 [0, 0]; n=200 |
| A/space/learning-epochs | N/A (n=0) |
| A/space/stabilized | 0 [0, 0]; n=200 |
| A/strategy/censored | 0 [0, 0]; n=200 |
| A/strategy/informative | 0 [0, 0]; n=200 |
| A/strategy/learning-epochs | N/A (n=0) |
| A/strategy/stabilized | 0 [0, 0]; n=200 |
| B/adaptation/censored | 0 [0, 0]; n=200 |
| B/adaptation/informative | 0 [0, 0]; n=200 |
| B/adaptation/learning-epochs | N/A (n=0) |
| B/adaptation/stabilized | 0 [0, 0]; n=200 |
| B/body/action:fight | 0.1046 [0.0920, 0.1171]; n=200 |
| B/body/action:steal | 0.0983 [0.0868, 0.1099]; n=200 |
| B/body/censored | 0.4950 [0.4251, 0.5649]; n=200 |
| B/body/informative | 0.9250 [0.8882, 0.9618]; n=200 |
| B/body/learning-epochs | 3.5581 [3.0447, 4.0715]; n=86 |
| B/body/outcome:bad | 0.8599 [0.8219, 0.8979]; n=187 |
| B/body/outcome:good | 0.0980 [0.0648, 0.1313]; n=187 |
| B/body/outcome:unfinished | 0.0421 [0.0216, 0.0626]; n=187 |
| B/body/receipts | 2.4350 [2.2379, 2.6321]; n=200 |
| B/body/stabilized | 0.4300 [0.3608, 0.4992]; n=200 |
| B/cohesion/censored | 0 [0, 0]; n=200 |
| B/cohesion/informative | 0 [0, 0]; n=200 |
| B/cohesion/learning-epochs | N/A (n=0) |
| B/cohesion/stabilized | 0 [0, 0]; n=200 |
| B/meta/censored | 0 [0, 0]; n=200 |
| B/meta/informative | 0 [0, 0]; n=200 |
| B/meta/learning-epochs | N/A (n=0) |
| B/meta/stabilized | 0 [0, 0]; n=200 |
| B/none/censored | 0 [0, 0]; n=200 |
| B/none/informative | 0 [0, 0]; n=200 |
| B/none/learning-epochs | N/A (n=0) |
| B/none/stabilized | 0 [0, 0]; n=200 |
| B/people/action:ask | 0.0979 [0.0856, 0.1103]; n=200 |
| B/people/action:break | 0.1067 [0.0946, 0.1187]; n=200 |
| B/people/action:deceive | 0.1079 [0.0960, 0.1198]; n=200 |
| B/people/action:keep | 0.0950 [0.0835, 0.1065]; n=200 |
| B/people/action:leave | 0.0875 [0.0766, 0.0984]; n=200 |
| B/people/action:trade | 0.1025 [0.0901, 0.1149]; n=200 |
| B/people/action:wait | 0.1029 [0.0910, 0.1149]; n=200 |
| B/people/action:work | 0.0967 [0.0846, 0.1087]; n=200 |
| B/people/censored | 0.9400 [0.9068, 0.9732]; n=200 |
| B/people/informative | 1.0000 [1.0000, 1.0000]; n=200 |
| B/people/learning-epochs | 7.1667 [6.3512, 7.9821]; n=12 |
| B/people/outcome:bad | 0.7586 [0.7401, 0.7771]; n=200 |
| B/people/outcome:good | 0.1632 [0.1454, 0.1809]; n=200 |
| B/people/outcome:unfinished | 0.0782 [0.0715, 0.0849]; n=200 |
| B/people/receipts | 9.5650 [9.3679, 9.7621]; n=200 |
| B/people/stabilized | 0.0600 [0.0268, 0.0932]; n=200 |
| B/space/censored | 0 [0, 0]; n=200 |
| B/space/informative | 0 [0, 0]; n=200 |
| B/space/learning-epochs | N/A (n=0) |
| B/space/stabilized | 0 [0, 0]; n=200 |
| B/strategy/censored | 0 [0, 0]; n=200 |
| B/strategy/informative | 0 [0, 0]; n=200 |
| B/strategy/learning-epochs | N/A (n=0) |
| B/strategy/stabilized | 0 [0, 0]; n=200 |
| O/adaptation/censored | 0 [0, 0]; n=200 |
| O/adaptation/informative | 0 [0, 0]; n=200 |
| O/adaptation/learning-epochs | N/A (n=0) |
| O/adaptation/stabilized | 0 [0, 0]; n=200 |
| O/body/action:confront | 0.1058 [0.0938, 0.1179]; n=200 |
| O/body/censored | 0.5050 [0.4351, 0.5749]; n=200 |
| O/body/informative | 0.7400 [0.6787, 0.8013]; n=200 |
| O/body/learning-epochs | 3.9574 [3.2016, 4.7133]; n=47 |
| O/body/outcome:bad | 0.9426 [0.9081, 0.9770]; n=148 |
| O/body/outcome:good | 0.0574 [0.0230, 0.0919]; n=148 |
| O/body/outcome:unfinished | 0 [0, 0]; n=148 |
| O/body/receipts | 1.2700 [1.1255, 1.4145]; n=200 |
| O/body/stabilized | 0.2350 [0.1757, 0.2943]; n=200 |
| O/cohesion/censored | 0 [0, 0]; n=200 |
| O/cohesion/informative | 0 [0, 0]; n=200 |
| O/cohesion/learning-epochs | N/A (n=0) |
| O/cohesion/stabilized | 0 [0, 0]; n=200 |
| O/meta/censored | 0 [0, 0]; n=200 |
| O/meta/informative | 0 [0, 0]; n=200 |
| O/meta/learning-epochs | N/A (n=0) |
| O/meta/stabilized | 0 [0, 0]; n=200 |
| O/none/censored | 0 [0, 0]; n=200 |
| O/none/informative | 0 [0, 0]; n=200 |
| O/none/learning-epochs | N/A (n=0) |
| O/none/stabilized | 0 [0, 0]; n=200 |
| O/people/action:accept_promise | 0.0846 [0.0730, 0.0962]; n=200 |
| O/people/action:accept_trade | 0.0729 [0.0627, 0.0831]; n=200 |
| O/people/action:accept_work | 0.1483 [0.1342, 0.1625]; n=200 |
| O/people/action:chase | 0.1175 [0.1045, 0.1305]; n=200 |
| O/people/action:give | 0.0771 [0.0660, 0.0882]; n=200 |
| O/people/action:let_go | 0.0362 [0.0286, 0.0439]; n=200 |
| O/people/action:pay | 0.0733 [0.0634, 0.0833]; n=200 |
| O/people/action:refuse | 0.1204 [0.1073, 0.1335]; n=200 |
| O/people/action:renege | 0.1100 [0.0975, 0.1225]; n=200 |
| O/people/action:wait | 0.0538 [0.0443, 0.0632]; n=200 |
| O/people/censored | 1.0000 [1.0000, 1.0000]; n=200 |
| O/people/informative | 1.0000 [1.0000, 1.0000]; n=200 |
| O/people/learning-epochs | N/A (n=0) |
| O/people/outcome:bad | 0.7868 [0.7680, 0.8055]; n=200 |
| O/people/outcome:good | 0.2054 [0.1867, 0.2241]; n=200 |
| O/people/outcome:unfinished | 0.0079 [0.0042, 0.0115]; n=200 |
| O/people/receipts | 10.7300 [10.5855, 10.8745]; n=200 |
| O/people/stabilized | 0 [0, 0]; n=200 |
| O/space/censored | 0 [0, 0]; n=200 |
| O/space/informative | 0 [0, 0]; n=200 |
| O/space/learning-epochs | N/A (n=0) |
| O/space/stabilized | 0 [0, 0]; n=200 |
| O/strategy/censored | 0 [0, 0]; n=200 |
| O/strategy/informative | 0 [0, 0]; n=200 |
| O/strategy/learning-epochs | N/A (n=0) |
| O/strategy/stabilized | 0 [0, 0]; n=200 |

### v1/ESTJ

| Mind/domain/metric | Mean [95% interval]; seeds |
|---|---|
| A/adaptation/censored | 0 [0, 0]; n=200 |
| A/adaptation/informative | 0 [0, 0]; n=200 |
| A/adaptation/learning-epochs | N/A (n=0) |
| A/adaptation/stabilized | 0 [0, 0]; n=200 |
| A/body/action:fight | 0.1050 [0.0929, 0.1171]; n=200 |
| A/body/action:steal | 0.0996 [0.0869, 0.1123]; n=200 |
| A/body/censored | 0.4750 [0.4052, 0.5448]; n=200 |
| A/body/informative | 0.9200 [0.8821, 0.9579]; n=200 |
| A/body/learning-epochs | 3.1685 [2.6439, 3.6932]; n=89 |
| A/body/outcome:bad | 0.8716 [0.8370, 0.9063]; n=184 |
| A/body/outcome:good | 0.1141 [0.0801, 0.1481]; n=184 |
| A/body/outcome:unfinished | 0.0142 [0.0042, 0.0243]; n=184 |
| A/body/receipts | 2.4550 [2.2462, 2.6638]; n=200 |
| A/body/stabilized | 0.4450 [0.3755, 0.5145]; n=200 |
| A/cohesion/censored | 0 [0, 0]; n=200 |
| A/cohesion/informative | 0 [0, 0]; n=200 |
| A/cohesion/learning-epochs | N/A (n=0) |
| A/cohesion/stabilized | 0 [0, 0]; n=200 |
| A/meta/censored | 0 [0, 0]; n=200 |
| A/meta/informative | 0 [0, 0]; n=200 |
| A/meta/learning-epochs | N/A (n=0) |
| A/meta/stabilized | 0 [0, 0]; n=200 |
| A/none/censored | 0 [0, 0]; n=200 |
| A/none/informative | 0 [0, 0]; n=200 |
| A/none/learning-epochs | N/A (n=0) |
| A/none/stabilized | 0 [0, 0]; n=200 |
| A/people/action:ask | 0.1092 [0.0970, 0.1213]; n=200 |
| A/people/action:break | 0.1133 [0.1002, 0.1264]; n=200 |
| A/people/action:deceive | 0.1087 [0.0973, 0.1202]; n=200 |
| A/people/action:keep | 0.0983 [0.0858, 0.1108]; n=200 |
| A/people/action:leave | 0.0937 [0.0818, 0.1057]; n=200 |
| A/people/action:trade | 0.0892 [0.0774, 0.1009]; n=200 |
| A/people/action:wait | 0.0971 [0.0847, 0.1095]; n=200 |
| A/people/action:work | 0.0858 [0.0744, 0.0973]; n=200 |
| A/people/censored | 0.9200 [0.8821, 0.9579]; n=200 |
| A/people/informative | 1.0000 [1.0000, 1.0000]; n=200 |
| A/people/learning-epochs | 7.8125 [7.1606, 8.4644]; n=16 |
| A/people/outcome:bad | 0.7615 [0.7442, 0.7787]; n=200 |
| A/people/outcome:good | 0.1555 [0.1388, 0.1721]; n=200 |
| A/people/outcome:unfinished | 0.0831 [0.0764, 0.0897]; n=200 |
| A/people/receipts | 9.5450 [9.3362, 9.7538]; n=200 |
| A/people/stabilized | 0.0800 [0.0421, 0.1179]; n=200 |
| A/space/censored | 0 [0, 0]; n=200 |
| A/space/informative | 0 [0, 0]; n=200 |
| A/space/learning-epochs | N/A (n=0) |
| A/space/stabilized | 0 [0, 0]; n=200 |
| A/strategy/censored | 0 [0, 0]; n=200 |
| A/strategy/informative | 0 [0, 0]; n=200 |
| A/strategy/learning-epochs | N/A (n=0) |
| A/strategy/stabilized | 0 [0, 0]; n=200 |
| B/adaptation/censored | 0 [0, 0]; n=200 |
| B/adaptation/informative | 0 [0, 0]; n=200 |
| B/adaptation/learning-epochs | N/A (n=0) |
| B/adaptation/stabilized | 0 [0, 0]; n=200 |
| B/body/action:fight | 0.1046 [0.0919, 0.1173]; n=200 |
| B/body/action:steal | 0.0979 [0.0865, 0.1094]; n=200 |
| B/body/censored | 0.5000 [0.4301, 0.5699]; n=200 |
| B/body/informative | 0.9250 [0.8882, 0.9618]; n=200 |
| B/body/learning-epochs | 3.3882 [2.8747, 3.9017]; n=85 |
| B/body/outcome:bad | 0.8462 [0.8064, 0.8859]; n=187 |
| B/body/outcome:good | 0.1133 [0.0776, 0.1490]; n=187 |
| B/body/outcome:unfinished | 0.0406 [0.0202, 0.0609]; n=187 |
| B/body/receipts | 2.4300 [2.2354, 2.6246]; n=200 |
| B/body/stabilized | 0.4250 [0.3559, 0.4941]; n=200 |
| B/cohesion/censored | 0 [0, 0]; n=200 |
| B/cohesion/informative | 0 [0, 0]; n=200 |
| B/cohesion/learning-epochs | N/A (n=0) |
| B/cohesion/stabilized | 0 [0, 0]; n=200 |
| B/meta/censored | 0 [0, 0]; n=200 |
| B/meta/informative | 0 [0, 0]; n=200 |
| B/meta/learning-epochs | N/A (n=0) |
| B/meta/stabilized | 0 [0, 0]; n=200 |
| B/none/censored | 0 [0, 0]; n=200 |
| B/none/informative | 0 [0, 0]; n=200 |
| B/none/learning-epochs | N/A (n=0) |
| B/none/stabilized | 0 [0, 0]; n=200 |
| B/people/action:ask | 0.0958 [0.0835, 0.1082]; n=200 |
| B/people/action:break | 0.1038 [0.0918, 0.1157]; n=200 |
| B/people/action:deceive | 0.1050 [0.0934, 0.1166]; n=200 |
| B/people/action:keep | 0.0983 [0.0867, 0.1100]; n=200 |
| B/people/action:leave | 0.0875 [0.0769, 0.0981]; n=200 |
| B/people/action:trade | 0.1046 [0.0921, 0.1170]; n=200 |
| B/people/action:wait | 0.1021 [0.0903, 0.1139]; n=200 |
| B/people/action:work | 0.1004 [0.0880, 0.1129]; n=200 |
| B/people/censored | 0.9150 [0.8760, 0.9540]; n=200 |
| B/people/informative | 1.0000 [1.0000, 1.0000]; n=200 |
| B/people/learning-epochs | 7.5882 [6.8556, 8.3208]; n=17 |
| B/people/outcome:bad | 0.7558 [0.7372, 0.7745]; n=200 |
| B/people/outcome:good | 0.1650 [0.1469, 0.1832]; n=200 |
| B/people/outcome:unfinished | 0.0791 [0.0724, 0.0858]; n=200 |
| B/people/receipts | 9.5700 [9.3754, 9.7646]; n=200 |
| B/people/stabilized | 0.0850 [0.0460, 0.1240]; n=200 |
| B/space/censored | 0 [0, 0]; n=200 |
| B/space/informative | 0 [0, 0]; n=200 |
| B/space/learning-epochs | N/A (n=0) |
| B/space/stabilized | 0 [0, 0]; n=200 |
| B/strategy/censored | 0 [0, 0]; n=200 |
| B/strategy/informative | 0 [0, 0]; n=200 |
| B/strategy/learning-epochs | N/A (n=0) |
| B/strategy/stabilized | 0 [0, 0]; n=200 |
| O/adaptation/censored | 0 [0, 0]; n=200 |
| O/adaptation/informative | 0 [0, 0]; n=200 |
| O/adaptation/learning-epochs | N/A (n=0) |
| O/adaptation/stabilized | 0 [0, 0]; n=200 |
| O/body/action:confront | 0.1088 [0.0961, 0.1214]; n=200 |
| O/body/censored | 0.5400 [0.4703, 0.6097]; n=200 |
| O/body/informative | 0.7250 [0.6625, 0.7875]; n=200 |
| O/body/learning-epochs | 4.5946 [3.7044, 5.4848]; n=37 |
| O/body/outcome:bad | 0.9345 [0.8958, 0.9731]; n=145 |
| O/body/outcome:good | 0.0655 [0.0269, 0.1042]; n=145 |
| O/body/outcome:unfinished | 0 [0, 0]; n=145 |
| O/body/receipts | 1.3050 [1.1529, 1.4571]; n=200 |
| O/body/stabilized | 0.1850 [0.1307, 0.2393]; n=200 |
| O/cohesion/censored | 0 [0, 0]; n=200 |
| O/cohesion/informative | 0 [0, 0]; n=200 |
| O/cohesion/learning-epochs | N/A (n=0) |
| O/cohesion/stabilized | 0 [0, 0]; n=200 |
| O/meta/censored | 0 [0, 0]; n=200 |
| O/meta/informative | 0 [0, 0]; n=200 |
| O/meta/learning-epochs | N/A (n=0) |
| O/meta/stabilized | 0 [0, 0]; n=200 |
| O/none/censored | 0 [0, 0]; n=200 |
| O/none/informative | 0 [0, 0]; n=200 |
| O/none/learning-epochs | N/A (n=0) |
| O/none/stabilized | 0 [0, 0]; n=200 |
| O/people/action:accept_promise | 0.0962 [0.0838, 0.1087]; n=200 |
| O/people/action:accept_trade | 0.0775 [0.0670, 0.0880]; n=200 |
| O/people/action:accept_work | 0.1350 [0.1210, 0.1490]; n=200 |
| O/people/action:chase | 0.1029 [0.0905, 0.1154]; n=200 |
| O/people/action:give | 0.0813 [0.0699, 0.0926]; n=200 |
| O/people/action:let_go | 0.0542 [0.0452, 0.0632]; n=200 |
| O/people/action:pay | 0.0767 [0.0661, 0.0872]; n=200 |
| O/people/action:refuse | 0.1150 [0.1024, 0.1276]; n=200 |
| O/people/action:renege | 0.1021 [0.0902, 0.1140]; n=200 |
| O/people/action:wait | 0.0504 [0.0410, 0.0598]; n=200 |
| O/people/censored | 1.0000 [1.0000, 1.0000]; n=200 |
| O/people/informative | 1.0000 [1.0000, 1.0000]; n=200 |
| O/people/learning-epochs | N/A (n=0) |
| O/people/outcome:bad | 0.7892 [0.7709, 0.8075]; n=200 |
| O/people/outcome:good | 0.2033 [0.1850, 0.2216]; n=200 |
| O/people/outcome:unfinished | 0.0075 [0.0039, 0.0111]; n=200 |
| O/people/receipts | 10.6950 [10.5429, 10.8471]; n=200 |
| O/people/stabilized | 0 [0, 0]; n=200 |
| O/space/censored | 0 [0, 0]; n=200 |
| O/space/informative | 0 [0, 0]; n=200 |
| O/space/learning-epochs | N/A (n=0) |
| O/space/stabilized | 0 [0, 0]; n=200 |
| O/strategy/censored | 0 [0, 0]; n=200 |
| O/strategy/informative | 0 [0, 0]; n=200 |
| O/strategy/learning-epochs | N/A (n=0) |
| O/strategy/stabilized | 0 [0, 0]; n=200 |

### v1/ISTJ

| Mind/domain/metric | Mean [95% interval]; seeds |
|---|---|
| A/adaptation/censored | 0 [0, 0]; n=200 |
| A/adaptation/informative | 0 [0, 0]; n=200 |
| A/adaptation/learning-epochs | N/A (n=0) |
| A/adaptation/stabilized | 0 [0, 0]; n=200 |
| A/body/action:fight | 0.1062 [0.0943, 0.1182]; n=200 |
| A/body/action:steal | 0.0975 [0.0847, 0.1103]; n=200 |
| A/body/censored | 0.4500 [0.3804, 0.5196]; n=200 |
| A/body/informative | 0.9250 [0.8882, 0.9618]; n=200 |
| A/body/learning-epochs | 3.6421 [3.1090, 4.1752]; n=95 |
| A/body/outcome:bad | 0.8805 [0.8461, 0.9150]; n=185 |
| A/body/outcome:good | 0.1112 [0.0771, 0.1453]; n=185 |
| A/body/outcome:unfinished | 0.0083 [0.0009, 0.0157]; n=185 |
| A/body/receipts | 2.4450 [2.2344, 2.6556]; n=200 |
| A/body/stabilized | 0.4750 [0.4052, 0.5448]; n=200 |
| A/cohesion/censored | 0 [0, 0]; n=200 |
| A/cohesion/informative | 0 [0, 0]; n=200 |
| A/cohesion/learning-epochs | N/A (n=0) |
| A/cohesion/stabilized | 0 [0, 0]; n=200 |
| A/meta/censored | 0 [0, 0]; n=200 |
| A/meta/informative | 0 [0, 0]; n=200 |
| A/meta/learning-epochs | N/A (n=0) |
| A/meta/stabilized | 0 [0, 0]; n=200 |
| A/none/censored | 0 [0, 0]; n=200 |
| A/none/informative | 0 [0, 0]; n=200 |
| A/none/learning-epochs | N/A (n=0) |
| A/none/stabilized | 0 [0, 0]; n=200 |
| A/people/action:ask | 0.1112 [0.0990, 0.1235]; n=200 |
| A/people/action:break | 0.1154 [0.1024, 0.1284]; n=200 |
| A/people/action:deceive | 0.1112 [0.0995, 0.1230]; n=200 |
| A/people/action:keep | 0.0971 [0.0843, 0.1099]; n=200 |
| A/people/action:leave | 0.0917 [0.0799, 0.1034]; n=200 |
| A/people/action:trade | 0.0871 [0.0754, 0.0988]; n=200 |
| A/people/action:wait | 0.0979 [0.0855, 0.1103]; n=200 |
| A/people/action:work | 0.0846 [0.0731, 0.0961]; n=200 |
| A/people/censored | 0.9500 [0.9195, 0.9805]; n=200 |
| A/people/informative | 1.0000 [1.0000, 1.0000]; n=200 |
| A/people/learning-epochs | 8.3000 [7.7108, 8.8892]; n=10 |
| A/people/outcome:bad | 0.7583 [0.7409, 0.7757]; n=200 |
| A/people/outcome:good | 0.1559 [0.1390, 0.1728]; n=200 |
| A/people/outcome:unfinished | 0.0858 [0.0794, 0.0922]; n=200 |
| A/people/receipts | 9.5550 [9.3444, 9.7656]; n=200 |
| A/people/stabilized | 0.0500 [0.0195, 0.0805]; n=200 |
| A/space/censored | 0 [0, 0]; n=200 |
| A/space/informative | 0 [0, 0]; n=200 |
| A/space/learning-epochs | N/A (n=0) |
| A/space/stabilized | 0 [0, 0]; n=200 |
| A/strategy/censored | 0 [0, 0]; n=200 |
| A/strategy/informative | 0 [0, 0]; n=200 |
| A/strategy/learning-epochs | N/A (n=0) |
| A/strategy/stabilized | 0 [0, 0]; n=200 |
| B/adaptation/censored | 0 [0, 0]; n=200 |
| B/adaptation/informative | 0 [0, 0]; n=200 |
| B/adaptation/learning-epochs | N/A (n=0) |
| B/adaptation/stabilized | 0 [0, 0]; n=200 |
| B/body/action:fight | 0.1046 [0.0920, 0.1171]; n=200 |
| B/body/action:steal | 0.0983 [0.0868, 0.1099]; n=200 |
| B/body/censored | 0.4950 [0.4251, 0.5649]; n=200 |
| B/body/informative | 0.9250 [0.8882, 0.9618]; n=200 |
| B/body/learning-epochs | 3.5581 [3.0447, 4.0715]; n=86 |
| B/body/outcome:bad | 0.8599 [0.8219, 0.8979]; n=187 |
| B/body/outcome:good | 0.0980 [0.0648, 0.1313]; n=187 |
| B/body/outcome:unfinished | 0.0421 [0.0216, 0.0626]; n=187 |
| B/body/receipts | 2.4350 [2.2379, 2.6321]; n=200 |
| B/body/stabilized | 0.4300 [0.3608, 0.4992]; n=200 |
| B/cohesion/censored | 0 [0, 0]; n=200 |
| B/cohesion/informative | 0 [0, 0]; n=200 |
| B/cohesion/learning-epochs | N/A (n=0) |
| B/cohesion/stabilized | 0 [0, 0]; n=200 |
| B/meta/censored | 0 [0, 0]; n=200 |
| B/meta/informative | 0 [0, 0]; n=200 |
| B/meta/learning-epochs | N/A (n=0) |
| B/meta/stabilized | 0 [0, 0]; n=200 |
| B/none/censored | 0 [0, 0]; n=200 |
| B/none/informative | 0 [0, 0]; n=200 |
| B/none/learning-epochs | N/A (n=0) |
| B/none/stabilized | 0 [0, 0]; n=200 |
| B/people/action:ask | 0.0979 [0.0856, 0.1103]; n=200 |
| B/people/action:break | 0.1067 [0.0946, 0.1187]; n=200 |
| B/people/action:deceive | 0.1079 [0.0960, 0.1198]; n=200 |
| B/people/action:keep | 0.0950 [0.0835, 0.1065]; n=200 |
| B/people/action:leave | 0.0875 [0.0766, 0.0984]; n=200 |
| B/people/action:trade | 0.1025 [0.0901, 0.1149]; n=200 |
| B/people/action:wait | 0.1029 [0.0910, 0.1149]; n=200 |
| B/people/action:work | 0.0967 [0.0846, 0.1087]; n=200 |
| B/people/censored | 0.9400 [0.9068, 0.9732]; n=200 |
| B/people/informative | 1.0000 [1.0000, 1.0000]; n=200 |
| B/people/learning-epochs | 7.1667 [6.3512, 7.9821]; n=12 |
| B/people/outcome:bad | 0.7586 [0.7401, 0.7771]; n=200 |
| B/people/outcome:good | 0.1632 [0.1454, 0.1809]; n=200 |
| B/people/outcome:unfinished | 0.0782 [0.0715, 0.0849]; n=200 |
| B/people/receipts | 9.5650 [9.3679, 9.7621]; n=200 |
| B/people/stabilized | 0.0600 [0.0268, 0.0932]; n=200 |
| B/space/censored | 0 [0, 0]; n=200 |
| B/space/informative | 0 [0, 0]; n=200 |
| B/space/learning-epochs | N/A (n=0) |
| B/space/stabilized | 0 [0, 0]; n=200 |
| B/strategy/censored | 0 [0, 0]; n=200 |
| B/strategy/informative | 0 [0, 0]; n=200 |
| B/strategy/learning-epochs | N/A (n=0) |
| B/strategy/stabilized | 0 [0, 0]; n=200 |
| O/adaptation/censored | 0 [0, 0]; n=200 |
| O/adaptation/informative | 0 [0, 0]; n=200 |
| O/adaptation/learning-epochs | N/A (n=0) |
| O/adaptation/stabilized | 0 [0, 0]; n=200 |
| O/body/action:confront | 0.1058 [0.0938, 0.1179]; n=200 |
| O/body/censored | 0.5050 [0.4351, 0.5749]; n=200 |
| O/body/informative | 0.7400 [0.6787, 0.8013]; n=200 |
| O/body/learning-epochs | 3.9574 [3.2016, 4.7133]; n=47 |
| O/body/outcome:bad | 0.9426 [0.9081, 0.9770]; n=148 |
| O/body/outcome:good | 0.0574 [0.0230, 0.0919]; n=148 |
| O/body/outcome:unfinished | 0 [0, 0]; n=148 |
| O/body/receipts | 1.2700 [1.1255, 1.4145]; n=200 |
| O/body/stabilized | 0.2350 [0.1757, 0.2943]; n=200 |
| O/cohesion/censored | 0 [0, 0]; n=200 |
| O/cohesion/informative | 0 [0, 0]; n=200 |
| O/cohesion/learning-epochs | N/A (n=0) |
| O/cohesion/stabilized | 0 [0, 0]; n=200 |
| O/meta/censored | 0 [0, 0]; n=200 |
| O/meta/informative | 0 [0, 0]; n=200 |
| O/meta/learning-epochs | N/A (n=0) |
| O/meta/stabilized | 0 [0, 0]; n=200 |
| O/none/censored | 0 [0, 0]; n=200 |
| O/none/informative | 0 [0, 0]; n=200 |
| O/none/learning-epochs | N/A (n=0) |
| O/none/stabilized | 0 [0, 0]; n=200 |
| O/people/action:accept_promise | 0.0846 [0.0730, 0.0962]; n=200 |
| O/people/action:accept_trade | 0.0729 [0.0627, 0.0831]; n=200 |
| O/people/action:accept_work | 0.1483 [0.1342, 0.1625]; n=200 |
| O/people/action:chase | 0.1175 [0.1045, 0.1305]; n=200 |
| O/people/action:give | 0.0771 [0.0660, 0.0882]; n=200 |
| O/people/action:let_go | 0.0362 [0.0286, 0.0439]; n=200 |
| O/people/action:pay | 0.0733 [0.0634, 0.0833]; n=200 |
| O/people/action:refuse | 0.1204 [0.1073, 0.1335]; n=200 |
| O/people/action:renege | 0.1100 [0.0975, 0.1225]; n=200 |
| O/people/action:wait | 0.0538 [0.0443, 0.0632]; n=200 |
| O/people/censored | 1.0000 [1.0000, 1.0000]; n=200 |
| O/people/informative | 1.0000 [1.0000, 1.0000]; n=200 |
| O/people/learning-epochs | N/A (n=0) |
| O/people/outcome:bad | 0.7868 [0.7680, 0.8055]; n=200 |
| O/people/outcome:good | 0.2054 [0.1867, 0.2241]; n=200 |
| O/people/outcome:unfinished | 0.0079 [0.0042, 0.0115]; n=200 |
| O/people/receipts | 10.7300 [10.5855, 10.8745]; n=200 |
| O/people/stabilized | 0 [0, 0]; n=200 |
| O/space/censored | 0 [0, 0]; n=200 |
| O/space/informative | 0 [0, 0]; n=200 |
| O/space/learning-epochs | N/A (n=0) |
| O/space/stabilized | 0 [0, 0]; n=200 |
| O/strategy/censored | 0 [0, 0]; n=200 |
| O/strategy/informative | 0 [0, 0]; n=200 |
| O/strategy/learning-epochs | N/A (n=0) |
| O/strategy/stabilized | 0 [0, 0]; n=200 |

### v1/ENTJ

| Mind/domain/metric | Mean [95% interval]; seeds |
|---|---|
| A/adaptation/censored | 0 [0, 0]; n=200 |
| A/adaptation/informative | 0 [0, 0]; n=200 |
| A/adaptation/learning-epochs | N/A (n=0) |
| A/adaptation/stabilized | 0 [0, 0]; n=200 |
| A/body/action:fight | 0.1050 [0.0929, 0.1171]; n=200 |
| A/body/action:steal | 0.0996 [0.0869, 0.1123]; n=200 |
| A/body/censored | 0.4750 [0.4052, 0.5448]; n=200 |
| A/body/informative | 0.9200 [0.8821, 0.9579]; n=200 |
| A/body/learning-epochs | 3.1685 [2.6439, 3.6932]; n=89 |
| A/body/outcome:bad | 0.8716 [0.8370, 0.9063]; n=184 |
| A/body/outcome:good | 0.1141 [0.0801, 0.1481]; n=184 |
| A/body/outcome:unfinished | 0.0142 [0.0042, 0.0243]; n=184 |
| A/body/receipts | 2.4550 [2.2462, 2.6638]; n=200 |
| A/body/stabilized | 0.4450 [0.3755, 0.5145]; n=200 |
| A/cohesion/censored | 0 [0, 0]; n=200 |
| A/cohesion/informative | 0 [0, 0]; n=200 |
| A/cohesion/learning-epochs | N/A (n=0) |
| A/cohesion/stabilized | 0 [0, 0]; n=200 |
| A/meta/censored | 0 [0, 0]; n=200 |
| A/meta/informative | 0 [0, 0]; n=200 |
| A/meta/learning-epochs | N/A (n=0) |
| A/meta/stabilized | 0 [0, 0]; n=200 |
| A/none/censored | 0 [0, 0]; n=200 |
| A/none/informative | 0 [0, 0]; n=200 |
| A/none/learning-epochs | N/A (n=0) |
| A/none/stabilized | 0 [0, 0]; n=200 |
| A/people/action:ask | 0.1092 [0.0970, 0.1213]; n=200 |
| A/people/action:break | 0.1133 [0.1002, 0.1264]; n=200 |
| A/people/action:deceive | 0.1087 [0.0973, 0.1202]; n=200 |
| A/people/action:keep | 0.0983 [0.0858, 0.1108]; n=200 |
| A/people/action:leave | 0.0937 [0.0818, 0.1057]; n=200 |
| A/people/action:trade | 0.0892 [0.0774, 0.1009]; n=200 |
| A/people/action:wait | 0.0971 [0.0847, 0.1095]; n=200 |
| A/people/action:work | 0.0858 [0.0744, 0.0973]; n=200 |
| A/people/censored | 0.9200 [0.8821, 0.9579]; n=200 |
| A/people/informative | 1.0000 [1.0000, 1.0000]; n=200 |
| A/people/learning-epochs | 7.8125 [7.1606, 8.4644]; n=16 |
| A/people/outcome:bad | 0.7615 [0.7442, 0.7787]; n=200 |
| A/people/outcome:good | 0.1555 [0.1388, 0.1721]; n=200 |
| A/people/outcome:unfinished | 0.0831 [0.0764, 0.0897]; n=200 |
| A/people/receipts | 9.5450 [9.3362, 9.7538]; n=200 |
| A/people/stabilized | 0.0800 [0.0421, 0.1179]; n=200 |
| A/space/censored | 0 [0, 0]; n=200 |
| A/space/informative | 0 [0, 0]; n=200 |
| A/space/learning-epochs | N/A (n=0) |
| A/space/stabilized | 0 [0, 0]; n=200 |
| A/strategy/censored | 0 [0, 0]; n=200 |
| A/strategy/informative | 0 [0, 0]; n=200 |
| A/strategy/learning-epochs | N/A (n=0) |
| A/strategy/stabilized | 0 [0, 0]; n=200 |
| B/adaptation/censored | 0 [0, 0]; n=200 |
| B/adaptation/informative | 0 [0, 0]; n=200 |
| B/adaptation/learning-epochs | N/A (n=0) |
| B/adaptation/stabilized | 0 [0, 0]; n=200 |
| B/body/action:fight | 0.1046 [0.0919, 0.1173]; n=200 |
| B/body/action:steal | 0.0979 [0.0865, 0.1094]; n=200 |
| B/body/censored | 0.5000 [0.4301, 0.5699]; n=200 |
| B/body/informative | 0.9250 [0.8882, 0.9618]; n=200 |
| B/body/learning-epochs | 3.3882 [2.8747, 3.9017]; n=85 |
| B/body/outcome:bad | 0.8462 [0.8064, 0.8859]; n=187 |
| B/body/outcome:good | 0.1133 [0.0776, 0.1490]; n=187 |
| B/body/outcome:unfinished | 0.0406 [0.0202, 0.0609]; n=187 |
| B/body/receipts | 2.4300 [2.2354, 2.6246]; n=200 |
| B/body/stabilized | 0.4250 [0.3559, 0.4941]; n=200 |
| B/cohesion/censored | 0 [0, 0]; n=200 |
| B/cohesion/informative | 0 [0, 0]; n=200 |
| B/cohesion/learning-epochs | N/A (n=0) |
| B/cohesion/stabilized | 0 [0, 0]; n=200 |
| B/meta/censored | 0 [0, 0]; n=200 |
| B/meta/informative | 0 [0, 0]; n=200 |
| B/meta/learning-epochs | N/A (n=0) |
| B/meta/stabilized | 0 [0, 0]; n=200 |
| B/none/censored | 0 [0, 0]; n=200 |
| B/none/informative | 0 [0, 0]; n=200 |
| B/none/learning-epochs | N/A (n=0) |
| B/none/stabilized | 0 [0, 0]; n=200 |
| B/people/action:ask | 0.0958 [0.0835, 0.1082]; n=200 |
| B/people/action:break | 0.1038 [0.0918, 0.1157]; n=200 |
| B/people/action:deceive | 0.1050 [0.0934, 0.1166]; n=200 |
| B/people/action:keep | 0.0983 [0.0867, 0.1100]; n=200 |
| B/people/action:leave | 0.0875 [0.0769, 0.0981]; n=200 |
| B/people/action:trade | 0.1046 [0.0921, 0.1170]; n=200 |
| B/people/action:wait | 0.1021 [0.0903, 0.1139]; n=200 |
| B/people/action:work | 0.1004 [0.0880, 0.1129]; n=200 |
| B/people/censored | 0.9150 [0.8760, 0.9540]; n=200 |
| B/people/informative | 1.0000 [1.0000, 1.0000]; n=200 |
| B/people/learning-epochs | 7.5882 [6.8556, 8.3208]; n=17 |
| B/people/outcome:bad | 0.7558 [0.7372, 0.7745]; n=200 |
| B/people/outcome:good | 0.1650 [0.1469, 0.1832]; n=200 |
| B/people/outcome:unfinished | 0.0791 [0.0724, 0.0858]; n=200 |
| B/people/receipts | 9.5700 [9.3754, 9.7646]; n=200 |
| B/people/stabilized | 0.0850 [0.0460, 0.1240]; n=200 |
| B/space/censored | 0 [0, 0]; n=200 |
| B/space/informative | 0 [0, 0]; n=200 |
| B/space/learning-epochs | N/A (n=0) |
| B/space/stabilized | 0 [0, 0]; n=200 |
| B/strategy/censored | 0 [0, 0]; n=200 |
| B/strategy/informative | 0 [0, 0]; n=200 |
| B/strategy/learning-epochs | N/A (n=0) |
| B/strategy/stabilized | 0 [0, 0]; n=200 |
| O/adaptation/censored | 0 [0, 0]; n=200 |
| O/adaptation/informative | 0 [0, 0]; n=200 |
| O/adaptation/learning-epochs | N/A (n=0) |
| O/adaptation/stabilized | 0 [0, 0]; n=200 |
| O/body/action:confront | 0.1088 [0.0961, 0.1214]; n=200 |
| O/body/censored | 0.5400 [0.4703, 0.6097]; n=200 |
| O/body/informative | 0.7250 [0.6625, 0.7875]; n=200 |
| O/body/learning-epochs | 4.5946 [3.7044, 5.4848]; n=37 |
| O/body/outcome:bad | 0.9345 [0.8958, 0.9731]; n=145 |
| O/body/outcome:good | 0.0655 [0.0269, 0.1042]; n=145 |
| O/body/outcome:unfinished | 0 [0, 0]; n=145 |
| O/body/receipts | 1.3050 [1.1529, 1.4571]; n=200 |
| O/body/stabilized | 0.1850 [0.1307, 0.2393]; n=200 |
| O/cohesion/censored | 0 [0, 0]; n=200 |
| O/cohesion/informative | 0 [0, 0]; n=200 |
| O/cohesion/learning-epochs | N/A (n=0) |
| O/cohesion/stabilized | 0 [0, 0]; n=200 |
| O/meta/censored | 0 [0, 0]; n=200 |
| O/meta/informative | 0 [0, 0]; n=200 |
| O/meta/learning-epochs | N/A (n=0) |
| O/meta/stabilized | 0 [0, 0]; n=200 |
| O/none/censored | 0 [0, 0]; n=200 |
| O/none/informative | 0 [0, 0]; n=200 |
| O/none/learning-epochs | N/A (n=0) |
| O/none/stabilized | 0 [0, 0]; n=200 |
| O/people/action:accept_promise | 0.0962 [0.0838, 0.1087]; n=200 |
| O/people/action:accept_trade | 0.0775 [0.0670, 0.0880]; n=200 |
| O/people/action:accept_work | 0.1350 [0.1210, 0.1490]; n=200 |
| O/people/action:chase | 0.1029 [0.0905, 0.1154]; n=200 |
| O/people/action:give | 0.0813 [0.0699, 0.0926]; n=200 |
| O/people/action:let_go | 0.0542 [0.0452, 0.0632]; n=200 |
| O/people/action:pay | 0.0767 [0.0661, 0.0872]; n=200 |
| O/people/action:refuse | 0.1150 [0.1024, 0.1276]; n=200 |
| O/people/action:renege | 0.1021 [0.0902, 0.1140]; n=200 |
| O/people/action:wait | 0.0504 [0.0410, 0.0598]; n=200 |
| O/people/censored | 1.0000 [1.0000, 1.0000]; n=200 |
| O/people/informative | 1.0000 [1.0000, 1.0000]; n=200 |
| O/people/learning-epochs | N/A (n=0) |
| O/people/outcome:bad | 0.7892 [0.7709, 0.8075]; n=200 |
| O/people/outcome:good | 0.2033 [0.1850, 0.2216]; n=200 |
| O/people/outcome:unfinished | 0.0075 [0.0039, 0.0111]; n=200 |
| O/people/receipts | 10.6950 [10.5429, 10.8471]; n=200 |
| O/people/stabilized | 0 [0, 0]; n=200 |
| O/space/censored | 0 [0, 0]; n=200 |
| O/space/informative | 0 [0, 0]; n=200 |
| O/space/learning-epochs | N/A (n=0) |
| O/space/stabilized | 0 [0, 0]; n=200 |
| O/strategy/censored | 0 [0, 0]; n=200 |
| O/strategy/informative | 0 [0, 0]; n=200 |
| O/strategy/learning-epochs | N/A (n=0) |
| O/strategy/stabilized | 0 [0, 0]; n=200 |

### v1/INTJ

| Mind/domain/metric | Mean [95% interval]; seeds |
|---|---|
| A/adaptation/censored | 0 [0, 0]; n=200 |
| A/adaptation/informative | 0 [0, 0]; n=200 |
| A/adaptation/learning-epochs | N/A (n=0) |
| A/adaptation/stabilized | 0 [0, 0]; n=200 |
| A/body/action:fight | 0.1062 [0.0943, 0.1182]; n=200 |
| A/body/action:steal | 0.0975 [0.0847, 0.1103]; n=200 |
| A/body/censored | 0.4500 [0.3804, 0.5196]; n=200 |
| A/body/informative | 0.9250 [0.8882, 0.9618]; n=200 |
| A/body/learning-epochs | 3.6421 [3.1090, 4.1752]; n=95 |
| A/body/outcome:bad | 0.8805 [0.8461, 0.9150]; n=185 |
| A/body/outcome:good | 0.1112 [0.0771, 0.1453]; n=185 |
| A/body/outcome:unfinished | 0.0083 [0.0009, 0.0157]; n=185 |
| A/body/receipts | 2.4450 [2.2344, 2.6556]; n=200 |
| A/body/stabilized | 0.4750 [0.4052, 0.5448]; n=200 |
| A/cohesion/censored | 0 [0, 0]; n=200 |
| A/cohesion/informative | 0 [0, 0]; n=200 |
| A/cohesion/learning-epochs | N/A (n=0) |
| A/cohesion/stabilized | 0 [0, 0]; n=200 |
| A/meta/censored | 0 [0, 0]; n=200 |
| A/meta/informative | 0 [0, 0]; n=200 |
| A/meta/learning-epochs | N/A (n=0) |
| A/meta/stabilized | 0 [0, 0]; n=200 |
| A/none/censored | 0 [0, 0]; n=200 |
| A/none/informative | 0 [0, 0]; n=200 |
| A/none/learning-epochs | N/A (n=0) |
| A/none/stabilized | 0 [0, 0]; n=200 |
| A/people/action:ask | 0.1112 [0.0990, 0.1235]; n=200 |
| A/people/action:break | 0.1154 [0.1024, 0.1284]; n=200 |
| A/people/action:deceive | 0.1112 [0.0995, 0.1230]; n=200 |
| A/people/action:keep | 0.0971 [0.0843, 0.1099]; n=200 |
| A/people/action:leave | 0.0917 [0.0799, 0.1034]; n=200 |
| A/people/action:trade | 0.0871 [0.0754, 0.0988]; n=200 |
| A/people/action:wait | 0.0979 [0.0855, 0.1103]; n=200 |
| A/people/action:work | 0.0846 [0.0731, 0.0961]; n=200 |
| A/people/censored | 0.9500 [0.9195, 0.9805]; n=200 |
| A/people/informative | 1.0000 [1.0000, 1.0000]; n=200 |
| A/people/learning-epochs | 8.3000 [7.7108, 8.8892]; n=10 |
| A/people/outcome:bad | 0.7583 [0.7409, 0.7757]; n=200 |
| A/people/outcome:good | 0.1559 [0.1390, 0.1728]; n=200 |
| A/people/outcome:unfinished | 0.0858 [0.0794, 0.0922]; n=200 |
| A/people/receipts | 9.5550 [9.3444, 9.7656]; n=200 |
| A/people/stabilized | 0.0500 [0.0195, 0.0805]; n=200 |
| A/space/censored | 0 [0, 0]; n=200 |
| A/space/informative | 0 [0, 0]; n=200 |
| A/space/learning-epochs | N/A (n=0) |
| A/space/stabilized | 0 [0, 0]; n=200 |
| A/strategy/censored | 0 [0, 0]; n=200 |
| A/strategy/informative | 0 [0, 0]; n=200 |
| A/strategy/learning-epochs | N/A (n=0) |
| A/strategy/stabilized | 0 [0, 0]; n=200 |
| B/adaptation/censored | 0 [0, 0]; n=200 |
| B/adaptation/informative | 0 [0, 0]; n=200 |
| B/adaptation/learning-epochs | N/A (n=0) |
| B/adaptation/stabilized | 0 [0, 0]; n=200 |
| B/body/action:fight | 0.1046 [0.0920, 0.1171]; n=200 |
| B/body/action:steal | 0.0983 [0.0868, 0.1099]; n=200 |
| B/body/censored | 0.4950 [0.4251, 0.5649]; n=200 |
| B/body/informative | 0.9250 [0.8882, 0.9618]; n=200 |
| B/body/learning-epochs | 3.5581 [3.0447, 4.0715]; n=86 |
| B/body/outcome:bad | 0.8599 [0.8219, 0.8979]; n=187 |
| B/body/outcome:good | 0.0980 [0.0648, 0.1313]; n=187 |
| B/body/outcome:unfinished | 0.0421 [0.0216, 0.0626]; n=187 |
| B/body/receipts | 2.4350 [2.2379, 2.6321]; n=200 |
| B/body/stabilized | 0.4300 [0.3608, 0.4992]; n=200 |
| B/cohesion/censored | 0 [0, 0]; n=200 |
| B/cohesion/informative | 0 [0, 0]; n=200 |
| B/cohesion/learning-epochs | N/A (n=0) |
| B/cohesion/stabilized | 0 [0, 0]; n=200 |
| B/meta/censored | 0 [0, 0]; n=200 |
| B/meta/informative | 0 [0, 0]; n=200 |
| B/meta/learning-epochs | N/A (n=0) |
| B/meta/stabilized | 0 [0, 0]; n=200 |
| B/none/censored | 0 [0, 0]; n=200 |
| B/none/informative | 0 [0, 0]; n=200 |
| B/none/learning-epochs | N/A (n=0) |
| B/none/stabilized | 0 [0, 0]; n=200 |
| B/people/action:ask | 0.0979 [0.0856, 0.1103]; n=200 |
| B/people/action:break | 0.1067 [0.0946, 0.1187]; n=200 |
| B/people/action:deceive | 0.1079 [0.0960, 0.1198]; n=200 |
| B/people/action:keep | 0.0950 [0.0835, 0.1065]; n=200 |
| B/people/action:leave | 0.0875 [0.0766, 0.0984]; n=200 |
| B/people/action:trade | 0.1025 [0.0901, 0.1149]; n=200 |
| B/people/action:wait | 0.1029 [0.0910, 0.1149]; n=200 |
| B/people/action:work | 0.0967 [0.0846, 0.1087]; n=200 |
| B/people/censored | 0.9350 [0.9005, 0.9695]; n=200 |
| B/people/informative | 1.0000 [1.0000, 1.0000]; n=200 |
| B/people/learning-epochs | 7.2308 [6.4672, 7.9944]; n=13 |
| B/people/outcome:bad | 0.7586 [0.7401, 0.7771]; n=200 |
| B/people/outcome:good | 0.1632 [0.1454, 0.1809]; n=200 |
| B/people/outcome:unfinished | 0.0782 [0.0715, 0.0849]; n=200 |
| B/people/receipts | 9.5650 [9.3679, 9.7621]; n=200 |
| B/people/stabilized | 0.0650 [0.0305, 0.0995]; n=200 |
| B/space/censored | 0 [0, 0]; n=200 |
| B/space/informative | 0 [0, 0]; n=200 |
| B/space/learning-epochs | N/A (n=0) |
| B/space/stabilized | 0 [0, 0]; n=200 |
| B/strategy/censored | 0 [0, 0]; n=200 |
| B/strategy/informative | 0 [0, 0]; n=200 |
| B/strategy/learning-epochs | N/A (n=0) |
| B/strategy/stabilized | 0 [0, 0]; n=200 |
| O/adaptation/censored | 0 [0, 0]; n=200 |
| O/adaptation/informative | 0 [0, 0]; n=200 |
| O/adaptation/learning-epochs | N/A (n=0) |
| O/adaptation/stabilized | 0 [0, 0]; n=200 |
| O/body/action:confront | 0.1058 [0.0938, 0.1179]; n=200 |
| O/body/censored | 0.5050 [0.4351, 0.5749]; n=200 |
| O/body/informative | 0.7400 [0.6787, 0.8013]; n=200 |
| O/body/learning-epochs | 3.9574 [3.2016, 4.7133]; n=47 |
| O/body/outcome:bad | 0.9426 [0.9081, 0.9770]; n=148 |
| O/body/outcome:good | 0.0574 [0.0230, 0.0919]; n=148 |
| O/body/outcome:unfinished | 0 [0, 0]; n=148 |
| O/body/receipts | 1.2700 [1.1255, 1.4145]; n=200 |
| O/body/stabilized | 0.2350 [0.1757, 0.2943]; n=200 |
| O/cohesion/censored | 0 [0, 0]; n=200 |
| O/cohesion/informative | 0 [0, 0]; n=200 |
| O/cohesion/learning-epochs | N/A (n=0) |
| O/cohesion/stabilized | 0 [0, 0]; n=200 |
| O/meta/censored | 0 [0, 0]; n=200 |
| O/meta/informative | 0 [0, 0]; n=200 |
| O/meta/learning-epochs | N/A (n=0) |
| O/meta/stabilized | 0 [0, 0]; n=200 |
| O/none/censored | 0 [0, 0]; n=200 |
| O/none/informative | 0 [0, 0]; n=200 |
| O/none/learning-epochs | N/A (n=0) |
| O/none/stabilized | 0 [0, 0]; n=200 |
| O/people/action:accept_promise | 0.0846 [0.0730, 0.0962]; n=200 |
| O/people/action:accept_trade | 0.0729 [0.0627, 0.0831]; n=200 |
| O/people/action:accept_work | 0.1483 [0.1342, 0.1625]; n=200 |
| O/people/action:chase | 0.1175 [0.1045, 0.1305]; n=200 |
| O/people/action:give | 0.0771 [0.0660, 0.0882]; n=200 |
| O/people/action:let_go | 0.0362 [0.0286, 0.0439]; n=200 |
| O/people/action:pay | 0.0733 [0.0634, 0.0833]; n=200 |
| O/people/action:refuse | 0.1204 [0.1073, 0.1335]; n=200 |
| O/people/action:renege | 0.1100 [0.0975, 0.1225]; n=200 |
| O/people/action:wait | 0.0538 [0.0443, 0.0632]; n=200 |
| O/people/censored | 1.0000 [1.0000, 1.0000]; n=200 |
| O/people/informative | 1.0000 [1.0000, 1.0000]; n=200 |
| O/people/learning-epochs | N/A (n=0) |
| O/people/outcome:bad | 0.7868 [0.7680, 0.8055]; n=200 |
| O/people/outcome:good | 0.2054 [0.1867, 0.2241]; n=200 |
| O/people/outcome:unfinished | 0.0079 [0.0042, 0.0115]; n=200 |
| O/people/receipts | 10.7300 [10.5855, 10.8745]; n=200 |
| O/people/stabilized | 0 [0, 0]; n=200 |
| O/space/censored | 0 [0, 0]; n=200 |
| O/space/informative | 0 [0, 0]; n=200 |
| O/space/learning-epochs | N/A (n=0) |
| O/space/stabilized | 0 [0, 0]; n=200 |
| O/strategy/censored | 0 [0, 0]; n=200 |
| O/strategy/informative | 0 [0, 0]; n=200 |
| O/strategy/learning-epochs | N/A (n=0) |
| O/strategy/stabilized | 0 [0, 0]; n=200 |

### v1/ESFP

| Mind/domain/metric | Mean [95% interval]; seeds |
|---|---|
| A/adaptation/censored | 0 [0, 0]; n=200 |
| A/adaptation/informative | 0 [0, 0]; n=200 |
| A/adaptation/learning-epochs | N/A (n=0) |
| A/adaptation/stabilized | 0 [0, 0]; n=200 |
| A/body/action:fight | 0.1050 [0.0929, 0.1171]; n=200 |
| A/body/action:steal | 0.0996 [0.0869, 0.1123]; n=200 |
| A/body/censored | 0.4750 [0.4052, 0.5448]; n=200 |
| A/body/informative | 0.9200 [0.8821, 0.9579]; n=200 |
| A/body/learning-epochs | 3.1685 [2.6439, 3.6932]; n=89 |
| A/body/outcome:bad | 0.8716 [0.8370, 0.9063]; n=184 |
| A/body/outcome:good | 0.1141 [0.0801, 0.1481]; n=184 |
| A/body/outcome:unfinished | 0.0142 [0.0042, 0.0243]; n=184 |
| A/body/receipts | 2.4550 [2.2462, 2.6638]; n=200 |
| A/body/stabilized | 0.4450 [0.3755, 0.5145]; n=200 |
| A/cohesion/censored | 0 [0, 0]; n=200 |
| A/cohesion/informative | 0 [0, 0]; n=200 |
| A/cohesion/learning-epochs | N/A (n=0) |
| A/cohesion/stabilized | 0 [0, 0]; n=200 |
| A/meta/censored | 0 [0, 0]; n=200 |
| A/meta/informative | 0 [0, 0]; n=200 |
| A/meta/learning-epochs | N/A (n=0) |
| A/meta/stabilized | 0 [0, 0]; n=200 |
| A/none/censored | 0 [0, 0]; n=200 |
| A/none/informative | 0 [0, 0]; n=200 |
| A/none/learning-epochs | N/A (n=0) |
| A/none/stabilized | 0 [0, 0]; n=200 |
| A/people/action:ask | 0.1092 [0.0970, 0.1213]; n=200 |
| A/people/action:break | 0.1133 [0.1002, 0.1264]; n=200 |
| A/people/action:deceive | 0.1087 [0.0973, 0.1202]; n=200 |
| A/people/action:keep | 0.0983 [0.0858, 0.1108]; n=200 |
| A/people/action:leave | 0.0937 [0.0818, 0.1057]; n=200 |
| A/people/action:trade | 0.0892 [0.0774, 0.1009]; n=200 |
| A/people/action:wait | 0.0971 [0.0847, 0.1095]; n=200 |
| A/people/action:work | 0.0858 [0.0744, 0.0973]; n=200 |
| A/people/censored | 0.9200 [0.8821, 0.9579]; n=200 |
| A/people/informative | 1.0000 [1.0000, 1.0000]; n=200 |
| A/people/learning-epochs | 7.8125 [7.1606, 8.4644]; n=16 |
| A/people/outcome:bad | 0.7615 [0.7442, 0.7787]; n=200 |
| A/people/outcome:good | 0.1555 [0.1388, 0.1721]; n=200 |
| A/people/outcome:unfinished | 0.0831 [0.0764, 0.0897]; n=200 |
| A/people/receipts | 9.5450 [9.3362, 9.7538]; n=200 |
| A/people/stabilized | 0.0800 [0.0421, 0.1179]; n=200 |
| A/space/censored | 0 [0, 0]; n=200 |
| A/space/informative | 0 [0, 0]; n=200 |
| A/space/learning-epochs | N/A (n=0) |
| A/space/stabilized | 0 [0, 0]; n=200 |
| A/strategy/censored | 0 [0, 0]; n=200 |
| A/strategy/informative | 0 [0, 0]; n=200 |
| A/strategy/learning-epochs | N/A (n=0) |
| A/strategy/stabilized | 0 [0, 0]; n=200 |
| B/adaptation/censored | 0 [0, 0]; n=200 |
| B/adaptation/informative | 0 [0, 0]; n=200 |
| B/adaptation/learning-epochs | N/A (n=0) |
| B/adaptation/stabilized | 0 [0, 0]; n=200 |
| B/body/action:fight | 0.1046 [0.0919, 0.1173]; n=200 |
| B/body/action:steal | 0.0979 [0.0865, 0.1094]; n=200 |
| B/body/censored | 0.5000 [0.4301, 0.5699]; n=200 |
| B/body/informative | 0.9250 [0.8882, 0.9618]; n=200 |
| B/body/learning-epochs | 3.3882 [2.8747, 3.9017]; n=85 |
| B/body/outcome:bad | 0.8462 [0.8064, 0.8859]; n=187 |
| B/body/outcome:good | 0.1133 [0.0776, 0.1490]; n=187 |
| B/body/outcome:unfinished | 0.0406 [0.0202, 0.0609]; n=187 |
| B/body/receipts | 2.4300 [2.2354, 2.6246]; n=200 |
| B/body/stabilized | 0.4250 [0.3559, 0.4941]; n=200 |
| B/cohesion/censored | 0 [0, 0]; n=200 |
| B/cohesion/informative | 0 [0, 0]; n=200 |
| B/cohesion/learning-epochs | N/A (n=0) |
| B/cohesion/stabilized | 0 [0, 0]; n=200 |
| B/meta/censored | 0 [0, 0]; n=200 |
| B/meta/informative | 0 [0, 0]; n=200 |
| B/meta/learning-epochs | N/A (n=0) |
| B/meta/stabilized | 0 [0, 0]; n=200 |
| B/none/censored | 0 [0, 0]; n=200 |
| B/none/informative | 0 [0, 0]; n=200 |
| B/none/learning-epochs | N/A (n=0) |
| B/none/stabilized | 0 [0, 0]; n=200 |
| B/people/action:ask | 0.0958 [0.0835, 0.1082]; n=200 |
| B/people/action:break | 0.1038 [0.0918, 0.1157]; n=200 |
| B/people/action:deceive | 0.1050 [0.0934, 0.1166]; n=200 |
| B/people/action:keep | 0.0983 [0.0867, 0.1100]; n=200 |
| B/people/action:leave | 0.0875 [0.0769, 0.0981]; n=200 |
| B/people/action:trade | 0.1046 [0.0921, 0.1170]; n=200 |
| B/people/action:wait | 0.1021 [0.0903, 0.1139]; n=200 |
| B/people/action:work | 0.1004 [0.0880, 0.1129]; n=200 |
| B/people/censored | 0.9150 [0.8760, 0.9540]; n=200 |
| B/people/informative | 1.0000 [1.0000, 1.0000]; n=200 |
| B/people/learning-epochs | 7.5882 [6.8556, 8.3208]; n=17 |
| B/people/outcome:bad | 0.7558 [0.7372, 0.7745]; n=200 |
| B/people/outcome:good | 0.1650 [0.1469, 0.1832]; n=200 |
| B/people/outcome:unfinished | 0.0791 [0.0724, 0.0858]; n=200 |
| B/people/receipts | 9.5700 [9.3754, 9.7646]; n=200 |
| B/people/stabilized | 0.0850 [0.0460, 0.1240]; n=200 |
| B/space/censored | 0 [0, 0]; n=200 |
| B/space/informative | 0 [0, 0]; n=200 |
| B/space/learning-epochs | N/A (n=0) |
| B/space/stabilized | 0 [0, 0]; n=200 |
| B/strategy/censored | 0 [0, 0]; n=200 |
| B/strategy/informative | 0 [0, 0]; n=200 |
| B/strategy/learning-epochs | N/A (n=0) |
| B/strategy/stabilized | 0 [0, 0]; n=200 |
| O/adaptation/censored | 0 [0, 0]; n=200 |
| O/adaptation/informative | 0 [0, 0]; n=200 |
| O/adaptation/learning-epochs | N/A (n=0) |
| O/adaptation/stabilized | 0 [0, 0]; n=200 |
| O/body/action:confront | 0.1088 [0.0961, 0.1214]; n=200 |
| O/body/censored | 0.5400 [0.4703, 0.6097]; n=200 |
| O/body/informative | 0.7250 [0.6625, 0.7875]; n=200 |
| O/body/learning-epochs | 4.5946 [3.7044, 5.4848]; n=37 |
| O/body/outcome:bad | 0.9345 [0.8958, 0.9731]; n=145 |
| O/body/outcome:good | 0.0655 [0.0269, 0.1042]; n=145 |
| O/body/outcome:unfinished | 0 [0, 0]; n=145 |
| O/body/receipts | 1.3050 [1.1529, 1.4571]; n=200 |
| O/body/stabilized | 0.1850 [0.1307, 0.2393]; n=200 |
| O/cohesion/censored | 0 [0, 0]; n=200 |
| O/cohesion/informative | 0 [0, 0]; n=200 |
| O/cohesion/learning-epochs | N/A (n=0) |
| O/cohesion/stabilized | 0 [0, 0]; n=200 |
| O/meta/censored | 0 [0, 0]; n=200 |
| O/meta/informative | 0 [0, 0]; n=200 |
| O/meta/learning-epochs | N/A (n=0) |
| O/meta/stabilized | 0 [0, 0]; n=200 |
| O/none/censored | 0 [0, 0]; n=200 |
| O/none/informative | 0 [0, 0]; n=200 |
| O/none/learning-epochs | N/A (n=0) |
| O/none/stabilized | 0 [0, 0]; n=200 |
| O/people/action:accept_promise | 0.0962 [0.0838, 0.1087]; n=200 |
| O/people/action:accept_trade | 0.0775 [0.0670, 0.0880]; n=200 |
| O/people/action:accept_work | 0.1350 [0.1210, 0.1490]; n=200 |
| O/people/action:chase | 0.1029 [0.0905, 0.1154]; n=200 |
| O/people/action:give | 0.0813 [0.0699, 0.0926]; n=200 |
| O/people/action:let_go | 0.0542 [0.0452, 0.0632]; n=200 |
| O/people/action:pay | 0.0767 [0.0661, 0.0872]; n=200 |
| O/people/action:refuse | 0.1150 [0.1024, 0.1276]; n=200 |
| O/people/action:renege | 0.1021 [0.0902, 0.1140]; n=200 |
| O/people/action:wait | 0.0504 [0.0410, 0.0598]; n=200 |
| O/people/censored | 1.0000 [1.0000, 1.0000]; n=200 |
| O/people/informative | 1.0000 [1.0000, 1.0000]; n=200 |
| O/people/learning-epochs | N/A (n=0) |
| O/people/outcome:bad | 0.7892 [0.7709, 0.8075]; n=200 |
| O/people/outcome:good | 0.2033 [0.1850, 0.2216]; n=200 |
| O/people/outcome:unfinished | 0.0075 [0.0039, 0.0111]; n=200 |
| O/people/receipts | 10.6950 [10.5429, 10.8471]; n=200 |
| O/people/stabilized | 0 [0, 0]; n=200 |
| O/space/censored | 0 [0, 0]; n=200 |
| O/space/informative | 0 [0, 0]; n=200 |
| O/space/learning-epochs | N/A (n=0) |
| O/space/stabilized | 0 [0, 0]; n=200 |
| O/strategy/censored | 0 [0, 0]; n=200 |
| O/strategy/informative | 0 [0, 0]; n=200 |
| O/strategy/learning-epochs | N/A (n=0) |
| O/strategy/stabilized | 0 [0, 0]; n=200 |

### v1/ISFP

| Mind/domain/metric | Mean [95% interval]; seeds |
|---|---|
| A/adaptation/censored | 0 [0, 0]; n=200 |
| A/adaptation/informative | 0 [0, 0]; n=200 |
| A/adaptation/learning-epochs | N/A (n=0) |
| A/adaptation/stabilized | 0 [0, 0]; n=200 |
| A/body/action:fight | 0.1062 [0.0943, 0.1182]; n=200 |
| A/body/action:steal | 0.0975 [0.0847, 0.1103]; n=200 |
| A/body/censored | 0.4500 [0.3804, 0.5196]; n=200 |
| A/body/informative | 0.9250 [0.8882, 0.9618]; n=200 |
| A/body/learning-epochs | 3.6421 [3.1090, 4.1752]; n=95 |
| A/body/outcome:bad | 0.8805 [0.8461, 0.9150]; n=185 |
| A/body/outcome:good | 0.1112 [0.0771, 0.1453]; n=185 |
| A/body/outcome:unfinished | 0.0083 [0.0009, 0.0157]; n=185 |
| A/body/receipts | 2.4450 [2.2344, 2.6556]; n=200 |
| A/body/stabilized | 0.4750 [0.4052, 0.5448]; n=200 |
| A/cohesion/censored | 0 [0, 0]; n=200 |
| A/cohesion/informative | 0 [0, 0]; n=200 |
| A/cohesion/learning-epochs | N/A (n=0) |
| A/cohesion/stabilized | 0 [0, 0]; n=200 |
| A/meta/censored | 0 [0, 0]; n=200 |
| A/meta/informative | 0 [0, 0]; n=200 |
| A/meta/learning-epochs | N/A (n=0) |
| A/meta/stabilized | 0 [0, 0]; n=200 |
| A/none/censored | 0 [0, 0]; n=200 |
| A/none/informative | 0 [0, 0]; n=200 |
| A/none/learning-epochs | N/A (n=0) |
| A/none/stabilized | 0 [0, 0]; n=200 |
| A/people/action:ask | 0.1112 [0.0990, 0.1235]; n=200 |
| A/people/action:break | 0.1154 [0.1024, 0.1284]; n=200 |
| A/people/action:deceive | 0.1112 [0.0995, 0.1230]; n=200 |
| A/people/action:keep | 0.0971 [0.0843, 0.1099]; n=200 |
| A/people/action:leave | 0.0917 [0.0799, 0.1034]; n=200 |
| A/people/action:trade | 0.0871 [0.0754, 0.0988]; n=200 |
| A/people/action:wait | 0.0979 [0.0855, 0.1103]; n=200 |
| A/people/action:work | 0.0846 [0.0731, 0.0961]; n=200 |
| A/people/censored | 0.9500 [0.9195, 0.9805]; n=200 |
| A/people/informative | 1.0000 [1.0000, 1.0000]; n=200 |
| A/people/learning-epochs | 8.3000 [7.7108, 8.8892]; n=10 |
| A/people/outcome:bad | 0.7583 [0.7409, 0.7757]; n=200 |
| A/people/outcome:good | 0.1559 [0.1390, 0.1728]; n=200 |
| A/people/outcome:unfinished | 0.0858 [0.0794, 0.0922]; n=200 |
| A/people/receipts | 9.5550 [9.3444, 9.7656]; n=200 |
| A/people/stabilized | 0.0500 [0.0195, 0.0805]; n=200 |
| A/space/censored | 0 [0, 0]; n=200 |
| A/space/informative | 0 [0, 0]; n=200 |
| A/space/learning-epochs | N/A (n=0) |
| A/space/stabilized | 0 [0, 0]; n=200 |
| A/strategy/censored | 0 [0, 0]; n=200 |
| A/strategy/informative | 0 [0, 0]; n=200 |
| A/strategy/learning-epochs | N/A (n=0) |
| A/strategy/stabilized | 0 [0, 0]; n=200 |
| B/adaptation/censored | 0 [0, 0]; n=200 |
| B/adaptation/informative | 0 [0, 0]; n=200 |
| B/adaptation/learning-epochs | N/A (n=0) |
| B/adaptation/stabilized | 0 [0, 0]; n=200 |
| B/body/action:fight | 0.1046 [0.0920, 0.1171]; n=200 |
| B/body/action:steal | 0.0983 [0.0868, 0.1099]; n=200 |
| B/body/censored | 0.4950 [0.4251, 0.5649]; n=200 |
| B/body/informative | 0.9250 [0.8882, 0.9618]; n=200 |
| B/body/learning-epochs | 3.5581 [3.0447, 4.0715]; n=86 |
| B/body/outcome:bad | 0.8599 [0.8219, 0.8979]; n=187 |
| B/body/outcome:good | 0.0980 [0.0648, 0.1313]; n=187 |
| B/body/outcome:unfinished | 0.0421 [0.0216, 0.0626]; n=187 |
| B/body/receipts | 2.4350 [2.2379, 2.6321]; n=200 |
| B/body/stabilized | 0.4300 [0.3608, 0.4992]; n=200 |
| B/cohesion/censored | 0 [0, 0]; n=200 |
| B/cohesion/informative | 0 [0, 0]; n=200 |
| B/cohesion/learning-epochs | N/A (n=0) |
| B/cohesion/stabilized | 0 [0, 0]; n=200 |
| B/meta/censored | 0 [0, 0]; n=200 |
| B/meta/informative | 0 [0, 0]; n=200 |
| B/meta/learning-epochs | N/A (n=0) |
| B/meta/stabilized | 0 [0, 0]; n=200 |
| B/none/censored | 0 [0, 0]; n=200 |
| B/none/informative | 0 [0, 0]; n=200 |
| B/none/learning-epochs | N/A (n=0) |
| B/none/stabilized | 0 [0, 0]; n=200 |
| B/people/action:ask | 0.0979 [0.0856, 0.1103]; n=200 |
| B/people/action:break | 0.1067 [0.0946, 0.1187]; n=200 |
| B/people/action:deceive | 0.1079 [0.0960, 0.1198]; n=200 |
| B/people/action:keep | 0.0950 [0.0835, 0.1065]; n=200 |
| B/people/action:leave | 0.0875 [0.0766, 0.0984]; n=200 |
| B/people/action:trade | 0.1025 [0.0901, 0.1149]; n=200 |
| B/people/action:wait | 0.1029 [0.0910, 0.1149]; n=200 |
| B/people/action:work | 0.0967 [0.0846, 0.1087]; n=200 |
| B/people/censored | 0.9350 [0.9005, 0.9695]; n=200 |
| B/people/informative | 1.0000 [1.0000, 1.0000]; n=200 |
| B/people/learning-epochs | 7.2308 [6.4672, 7.9944]; n=13 |
| B/people/outcome:bad | 0.7586 [0.7401, 0.7771]; n=200 |
| B/people/outcome:good | 0.1632 [0.1454, 0.1809]; n=200 |
| B/people/outcome:unfinished | 0.0782 [0.0715, 0.0849]; n=200 |
| B/people/receipts | 9.5650 [9.3679, 9.7621]; n=200 |
| B/people/stabilized | 0.0650 [0.0305, 0.0995]; n=200 |
| B/space/censored | 0 [0, 0]; n=200 |
| B/space/informative | 0 [0, 0]; n=200 |
| B/space/learning-epochs | N/A (n=0) |
| B/space/stabilized | 0 [0, 0]; n=200 |
| B/strategy/censored | 0 [0, 0]; n=200 |
| B/strategy/informative | 0 [0, 0]; n=200 |
| B/strategy/learning-epochs | N/A (n=0) |
| B/strategy/stabilized | 0 [0, 0]; n=200 |
| O/adaptation/censored | 0 [0, 0]; n=200 |
| O/adaptation/informative | 0 [0, 0]; n=200 |
| O/adaptation/learning-epochs | N/A (n=0) |
| O/adaptation/stabilized | 0 [0, 0]; n=200 |
| O/body/action:confront | 0.1058 [0.0938, 0.1179]; n=200 |
| O/body/censored | 0.5050 [0.4351, 0.5749]; n=200 |
| O/body/informative | 0.7400 [0.6787, 0.8013]; n=200 |
| O/body/learning-epochs | 3.9574 [3.2016, 4.7133]; n=47 |
| O/body/outcome:bad | 0.9426 [0.9081, 0.9770]; n=148 |
| O/body/outcome:good | 0.0574 [0.0230, 0.0919]; n=148 |
| O/body/outcome:unfinished | 0 [0, 0]; n=148 |
| O/body/receipts | 1.2700 [1.1255, 1.4145]; n=200 |
| O/body/stabilized | 0.2350 [0.1757, 0.2943]; n=200 |
| O/cohesion/censored | 0 [0, 0]; n=200 |
| O/cohesion/informative | 0 [0, 0]; n=200 |
| O/cohesion/learning-epochs | N/A (n=0) |
| O/cohesion/stabilized | 0 [0, 0]; n=200 |
| O/meta/censored | 0 [0, 0]; n=200 |
| O/meta/informative | 0 [0, 0]; n=200 |
| O/meta/learning-epochs | N/A (n=0) |
| O/meta/stabilized | 0 [0, 0]; n=200 |
| O/none/censored | 0 [0, 0]; n=200 |
| O/none/informative | 0 [0, 0]; n=200 |
| O/none/learning-epochs | N/A (n=0) |
| O/none/stabilized | 0 [0, 0]; n=200 |
| O/people/action:accept_promise | 0.0846 [0.0730, 0.0962]; n=200 |
| O/people/action:accept_trade | 0.0729 [0.0627, 0.0831]; n=200 |
| O/people/action:accept_work | 0.1483 [0.1342, 0.1625]; n=200 |
| O/people/action:chase | 0.1175 [0.1045, 0.1305]; n=200 |
| O/people/action:give | 0.0771 [0.0660, 0.0882]; n=200 |
| O/people/action:let_go | 0.0362 [0.0286, 0.0439]; n=200 |
| O/people/action:pay | 0.0733 [0.0634, 0.0833]; n=200 |
| O/people/action:refuse | 0.1204 [0.1073, 0.1335]; n=200 |
| O/people/action:renege | 0.1100 [0.0975, 0.1225]; n=200 |
| O/people/action:wait | 0.0538 [0.0443, 0.0632]; n=200 |
| O/people/censored | 1.0000 [1.0000, 1.0000]; n=200 |
| O/people/informative | 1.0000 [1.0000, 1.0000]; n=200 |
| O/people/learning-epochs | N/A (n=0) |
| O/people/outcome:bad | 0.7868 [0.7680, 0.8055]; n=200 |
| O/people/outcome:good | 0.2054 [0.1867, 0.2241]; n=200 |
| O/people/outcome:unfinished | 0.0079 [0.0042, 0.0115]; n=200 |
| O/people/receipts | 10.7300 [10.5855, 10.8745]; n=200 |
| O/people/stabilized | 0 [0, 0]; n=200 |
| O/space/censored | 0 [0, 0]; n=200 |
| O/space/informative | 0 [0, 0]; n=200 |
| O/space/learning-epochs | N/A (n=0) |
| O/space/stabilized | 0 [0, 0]; n=200 |
| O/strategy/censored | 0 [0, 0]; n=200 |
| O/strategy/informative | 0 [0, 0]; n=200 |
| O/strategy/learning-epochs | N/A (n=0) |
| O/strategy/stabilized | 0 [0, 0]; n=200 |

## T-3: version comparisons and single-formula attribution

Each row is configuration minus reference. Rows with exactly zero paired differences are omitted; N/A comparisons are not called zero. Formula entries report full version minus the same version with only that formula off, with paired 95% intervals and number of seeds whose metric changed. These are marginal interventions in a closed loop; effects can interact and do not sum to the total. Zero-centred intervals are not evidence of a reliable signed effect.
For an adjacent-version comparison, ablate both sides and report how the version difference changes. v1 has no previous frozen version; its reference is null.

### v1/ENTP minus null

| Metric | Paired difference [95% interval]; pairs | Formula-off interventions |
|---|---|---|
| A/body/action:fight | 0.0008 [-0.0012, 0.0028]; n=200 | F2 (pertinence): -6.939e-20 [-0.0012, 0.0012]; n=200; changed=2<br>F3 (interpret): 0.0013 [-0.0002, 0.0027]; n=200; changed=3 |
| A/body/action:steal | 0.0008 [-0.0012, 0.0028]; n=200 | F2 (pertinence): 0.0017 [3.494e-5, 0.0033]; n=200; changed=4<br>F3 (interpret): -0.0008 [-0.0020, 0.0003]; n=200; changed=2 |
| A/body/censored | -0.0050 [-0.0564, 0.0464]; n=200 | F2 (pertinence): 0.0050 [-0.0444, 0.0544]; n=200; changed=25<br>F3 (interpret): 0.0100 [-0.0212, 0.0412]; n=200; changed=10 |
| A/body/learning-epochs | 0.0400 [-0.2696, 0.3496]; n=75 | F2 (pertinence): 0.1081 [-0.1964, 0.4127]; n=74; changed=16 |
| A/body/outcome:bad | -0.0071 [-0.0248, 0.0106]; n=184 | F2 (pertinence): -0.0052 [-0.0134, 0.0031]; n=184; changed=5<br>F3 (interpret): -0.0054 [-0.0221, 0.0112]; n=184; changed=5 |
| A/body/outcome:good | 0.0023 [-0.0150, 0.0195]; n=184 | F2 (pertinence): 0.0004 [-0.0068, 0.0076]; n=184; changed=4<br>F3 (interpret): 0.0054 [-0.0112, 0.0221]; n=184; changed=5 |
| A/body/outcome:unfinished | 0.0048 [-0.0017, 0.0113]; n=184 | F2 (pertinence): 0.0048 [-0.0017, 0.0113]; n=184; changed=3 |
| A/body/receipts | 0.0200 [-0.0078, 0.0478]; n=200 | F2 (pertinence): 0.0200 [-0.0041, 0.0441]; n=200; changed=6<br>F3 (interpret): 0.0050 [-0.0121, 0.0221]; n=200; changed=3 |
| A/body/stabilized | 0.0050 [-0.0464, 0.0564]; n=200 | F2 (pertinence): -0.0050 [-0.0544, 0.0444]; n=200; changed=25<br>F3 (interpret): -0.0100 [-0.0412, 0.0212]; n=200; changed=10 |
| A/people/action:ask | -0.0017 [-0.0033, -3.494e-5]; n=200 | F3 (interpret): -0.0017 [-0.0033, -3.494e-5]; n=200; changed=4 |
| A/people/action:break | -0.0013 [-0.0034, 0.0009]; n=200 | F2 (pertinence): -0.0008 [-0.0020, 0.0003]; n=200; changed=2<br>F3 (interpret): -0.0008 [-0.0028, 0.0012]; n=200; changed=6 |
| A/people/action:deceive | -0.0013 [-0.0034, 0.0009]; n=200 | F2 (pertinence): -0.0017 [-0.0033, -3.494e-5]; n=200; changed=4<br>F3 (interpret): 0 [-0.0023, 0.0023]; n=200; changed=5 |
| A/people/action:keep | 0.0013 [-0.0015, 0.0040]; n=200 | F2 (pertinence): 0.0017 [3.494e-5, 0.0033]; n=200; changed=4<br>F3 (interpret): -2.776e-19 [-0.0023, 0.0023]; n=200; changed=8 |
| A/people/action:leave | 0 [-0.0023, 0.0023]; n=200 | F2 (pertinence): -0.0008 [-0.0025, 0.0008]; n=200; changed=4<br>F3 (interpret): 0.0008 [-0.0008, 0.0025]; n=200; changed=4 |
| A/people/action:trade | 0.0013 [-0.0009, 0.0034]; n=200 | F3 (interpret): 0.0012 [-0.0009, 0.0034]; n=200; changed=7 |
| A/people/action:wait | -0.0008 [-0.0020, 0.0003]; n=200 | F3 (interpret): -0.0008 [-0.0020, 0.0003]; n=200; changed=2 |
| A/people/action:work | 0.0008 [-0.0012, 0.0028]; n=200 | F3 (interpret): 0.0008 [-0.0018, 0.0034]; n=200; changed=7 |
| A/people/censored | -0.0350 [-0.0674, -0.0026]; n=200 | F2 (pertinence): -0.0250 [-0.0509, 0.0009]; n=200; changed=7<br>F3 (interpret): -0.0250 [-0.0509, 0.0009]; n=200; changed=7 |
| A/people/outcome:bad | 0.0041 [-0.0003, 0.0086]; n=200 | F2 (pertinence): 0.0006 [-0.0019, 0.0032]; n=200; changed=10<br>F3 (interpret): 0.0031 [-0.0006, 0.0068]; n=200; changed=8 |
| A/people/outcome:good | -0.0018 [-0.0057, 0.0020]; n=200 | F2 (pertinence): -0.0001 [-0.0030, 0.0027]; n=200; changed=7<br>F3 (interpret): -0.0020 [-0.0054, 0.0013]; n=200; changed=9 |
| A/people/outcome:unfinished | -0.0023 [-0.0045, -0.0001]; n=200 | F2 (pertinence): -0.0005 [-0.0027, 0.0017]; n=200; changed=7<br>F3 (interpret): -0.0011 [-0.0025, 0.0004]; n=200; changed=4 |
| A/people/receipts | -0.0200 [-0.0478, 0.0078]; n=200 | F2 (pertinence): -0.0200 [-0.0441, 0.0041]; n=200; changed=6<br>F3 (interpret): -0.0050 [-0.0221, 0.0121]; n=200; changed=3 |
| A/people/stabilized | 0.0350 [0.0026, 0.0674]; n=200 | F2 (pertinence): 0.0250 [-0.0009, 0.0509]; n=200; changed=7<br>F3 (interpret): 0.0250 [-0.0009, 0.0509]; n=200; changed=7 |
| B/body/action:fight | 0.0017 [-0.0009, 0.0043]; n=200 | F1 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F2 (pertinence): 0.0012 [-0.0012, 0.0037]; n=200; changed=6<br>F3 (interpret): 0.0013 [-0.0002, 0.0027]; n=200; changed=4<br>F4 (learning, pertinence): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F5 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F6 (pertinence, interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F7 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F8 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F9 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F10 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F11 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F12 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F13 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1 |
| B/body/action:steal | -0.0017 [-0.0043, 0.0009]; n=200 | F2 (pertinence): -0.0021 [-0.0042, 0.0001]; n=200; changed=7<br>F3 (interpret): -0.0004 [-0.0023, 0.0014]; n=200; changed=5 |
| B/body/censored | 0 [-0.0420, 0.0420]; n=200 | F2 (pertinence): -0.0100 [-0.0519, 0.0319]; n=200; changed=18<br>F3 (interpret): 0.0050 [-0.0121, 0.0221]; n=200; changed=3 |
| B/body/informative | 0 [-0.0140, 0.0140]; n=200 | F2 (pertinence): -0.0050 [-0.0149, 0.0049]; n=200; changed=1<br>F3 (interpret): 0 [-0.0140, 0.0140]; n=200; changed=2 |
| B/body/learning-epochs | -0.1039 [-0.3246, 0.1168]; n=77 | F2 (pertinence): 0.0263 [-0.2278, 0.2805]; n=76; changed=13<br>F3 (interpret): -0.0519 [-0.1559, 0.0520]; n=77; changed=1 |
| B/body/outcome:bad | -0.0020 [-0.0088, 0.0049]; n=186 | F2 (pertinence): -0.0038 [-0.0115, 0.0040]; n=186; changed=6 |
| B/body/outcome:good | 0.0020 [-0.0049, 0.0088]; n=186 | F2 (pertinence): 0.0048 [-0.0032, 0.0128]; n=186; changed=7 |
| B/body/receipts | 0 [-0.0343, 0.0343]; n=200 | F2 (pertinence): -0.0100 [-0.0379, 0.0179]; n=200; changed=8<br>F3 (interpret): 0.0100 [-0.0142, 0.0342]; n=200; changed=6 |
| B/body/stabilized | 0 [-0.0396, 0.0396]; n=200 | F2 (pertinence): 0.0050 [-0.0358, 0.0458]; n=200; changed=17<br>F3 (interpret): -0.0050 [-0.0221, 0.0121]; n=200; changed=3 |
| B/people/action:ask | -0.0008 [-0.0020, 0.0003]; n=200 | F2 (pertinence): -0.0004 [-0.0012, 0.0004]; n=200; changed=1<br>F3 (interpret): -0.0004 [-0.0012, 0.0004]; n=200; changed=1 |
| B/people/action:break | -0.0021 [-0.0045, 0.0004]; n=200 | F2 (pertinence): 0.0004 [-0.0004, 0.0012]; n=200; changed=1<br>F3 (interpret): -0.0021 [-0.0048, 0.0006]; n=200; changed=11 |
| B/people/action:deceive | -0.0021 [-0.0057, 0.0015]; n=200 | F2 (pertinence): 0.0017 [-0.0003, 0.0037]; n=200; changed=6<br>F3 (interpret): -0.0029 [-0.0061, 0.0002]; n=200; changed=12 |
| B/people/action:keep | 0.0033 [0.0008, 0.0059]; n=200 | F1 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F2 (pertinence): 0.0004 [-0.0010, 0.0018]; n=200; changed=3<br>F3 (interpret): 0.0025 [0.0002, 0.0048]; n=200; changed=8<br>F4 (learning, pertinence): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F5 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F6 (pertinence, interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F7 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F8 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F9 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F10 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F11 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F12 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F13 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1 |
| B/people/action:leave | -0.0017 [-0.0040, 0.0007]; n=200 | F2 (pertinence): -0.0017 [-0.0037, 0.0003]; n=200; changed=6<br>F3 (interpret): 0 [-0.0016, 0.0016]; n=200; changed=4 |
| B/people/action:trade | 0.0013 [-0.0006, 0.0031]; n=200 | F2 (pertinence): 0.0013 [-0.0002, 0.0027]; n=200; changed=3<br>F3 (interpret): 0.0004 [-0.0004, 0.0012]; n=200; changed=1 |
| B/people/action:wait | -0.0008 [-0.0020, 0.0003]; n=200 | F3 (interpret): -0.0013 [-0.0027, 0.0002]; n=200; changed=3 |
| B/people/action:work | 0.0029 [-2.670e-5, 0.0059]; n=200 | F2 (pertinence): -0.0008 [-0.0025, 0.0008]; n=200; changed=4<br>F3 (interpret): 0.0029 [0.0005, 0.0054]; n=200; changed=9 |
| B/people/censored | -0.0250 [-0.0576, 0.0076]; n=200 | F2 (pertinence): -0.0100 [-0.0297, 0.0097]; n=200; changed=4<br>F3 (interpret): -0.0300 [-0.0610, 0.0010]; n=200; changed=10 |
| B/people/learning-epochs | 0.1111 [-0.1452, 0.3674]; n=9 | F2 (pertinence): 0.1111 [-0.1452, 0.3674]; n=9; changed=1 |
| B/people/outcome:bad | -0.0020 [-0.0058, 0.0018]; n=200 | F2 (pertinence): -0.0027 [-0.0063, 0.0008]; n=200; changed=15<br>F3 (interpret): -0.0002 [-0.0027, 0.0024]; n=200; changed=11 |
| B/people/outcome:good | 0.0007 [-0.0029, 0.0042]; n=200 | F2 (pertinence): 0.0008 [-0.0022, 0.0037]; n=200; changed=11<br>F3 (interpret): -0.0006 [-0.0028, 0.0015]; n=200; changed=9 |
| B/people/outcome:unfinished | 0.0013 [-0.0011, 0.0038]; n=200 | F2 (pertinence): 0.0019 [-0.0009, 0.0048]; n=200; changed=12<br>F3 (interpret): 0.0008 [-0.0005, 0.0021]; n=200; changed=7 |
| B/people/receipts | 0 [-0.0343, 0.0343]; n=200 | F2 (pertinence): 0.0100 [-0.0179, 0.0379]; n=200; changed=8<br>F3 (interpret): -0.0100 [-0.0342, 0.0142]; n=200; changed=6 |
| B/people/stabilized | 0.0250 [-0.0076, 0.0576]; n=200 | F2 (pertinence): 0.0100 [-0.0097, 0.0297]; n=200; changed=4<br>F3 (interpret): 0.0300 [-0.0010, 0.0610]; n=200; changed=10 |
| O/body/action:confront | 0.0012 [-0.0040, 0.0065]; n=200 | F1 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F2 (pertinence): 0.0021 [-0.0017, 0.0058]; n=200; changed=21<br>F3 (interpret): -0.0021 [-0.0057, 0.0015]; n=200; changed=16<br>F4 (learning, pertinence): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F5 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F6 (pertinence, interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F7 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F8 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F9 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F10 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F11 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F12 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F13 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1 |
| O/body/censored | -0.0200 [-0.0704, 0.0304]; n=200 | F2 (pertinence): -0.0100 [-0.0542, 0.0342]; n=200; changed=20<br>F3 (interpret): -0.0350 [-0.0643, -0.0057]; n=200; changed=9 |
| O/body/informative | -0.0050 [-0.0347, 0.0247]; n=200 | F2 (pertinence): -0.0050 [-0.0221, 0.0121]; n=200; changed=3<br>F3 (interpret): -0.0200 [-0.0441, 0.0041]; n=200; changed=6 |
| O/body/learning-epochs | -0.2800 [-0.6315, 0.0715]; n=25 | F2 (pertinence): -0.2800 [-0.6315, 0.0715]; n=25; changed=3<br>F3 (interpret): 0.0833 [-0.0905, 0.2572]; n=24; changed=1 |
| O/body/outcome:bad | 0.0047 [-0.0027, 0.0121]; n=141 | F2 (pertinence): 0.0047 [-0.0027, 0.0121]; n=141; changed=2 |
| O/body/outcome:good | -0.0047 [-0.0121, 0.0027]; n=141 | F2 (pertinence): -0.0047 [-0.0121, 0.0027]; n=141; changed=2 |
| O/body/receipts | 0.0150 [-0.0483, 0.0783]; n=200 | F2 (pertinence): 0.0250 [-0.0202, 0.0702]; n=200; changed=21<br>F3 (interpret): -0.0250 [-0.0680, 0.0180]; n=200; changed=16 |
| O/body/stabilized | 0.0150 [-0.0303, 0.0603]; n=200 | F2 (pertinence): 0.0050 [-0.0358, 0.0458]; n=200; changed=17<br>F3 (interpret): 0.0150 [-0.0070, 0.0370]; n=200; changed=5 |
| O/people/action:accept_promise | 0.0012 [-0.0033, 0.0058]; n=200 | F2 (pertinence): 0.0004 [-0.0030, 0.0038]; n=200; changed=14<br>F3 (interpret): 6.939e-20 [-0.0026, 0.0026]; n=200; changed=10 |
| O/people/action:accept_trade | 0.0037 [-0.0007, 0.0082]; n=200 | F2 (pertinence): -0.0008 [-0.0045, 0.0029]; n=200; changed=12<br>F3 (interpret): 0.0025 [-0.0013, 0.0063]; n=200; changed=16 |
| O/people/action:accept_work | -0.0062 [-0.0112, -0.0013]; n=200 | F2 (pertinence): -0.0021 [-0.0065, 0.0023]; n=200; changed=18<br>F3 (interpret): -0.0029 [-0.0063, 0.0005]; n=200; changed=14 |
| O/people/action:chase | -0.0054 [-0.0106, -0.0002]; n=200 | F2 (pertinence): 0.0017 [-0.0024, 0.0057]; n=200; changed=21<br>F3 (interpret): -0.0050 [-0.0091, -0.0009]; n=200; changed=20 |
| O/people/action:give | 0.0017 [-0.0030, 0.0063]; n=200 | F2 (pertinence): -0.0029 [-0.0063, 0.0005]; n=200; changed=14<br>F3 (interpret): 0.0037 [9.883e-6, 0.0075]; n=200; changed=21 |
| O/people/action:let_go | 0.0088 [0.0036, 0.0139]; n=200 | F1 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F2 (pertinence): -0.0017 [-0.0052, 0.0018]; n=200; changed=19<br>F3 (interpret): 0.0092 [0.0052, 0.0132]; n=200; changed=23<br>F4 (learning, pertinence): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F5 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F6 (pertinence, interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F7 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F8 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F9 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F10 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F11 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F12 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F13 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1 |
| O/people/action:pay | 0.0071 [0.0011, 0.0131]; n=200 | F1 (interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F2 (pertinence): 0.0042 [4.932e-6, 0.0083]; n=200; changed=24<br>F3 (interpret): 0.0037 [-0.0002, 0.0077]; n=200; changed=24<br>F4 (learning, pertinence): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F5 (learning): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F6 (pertinence, interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F7 (interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F8 (learning): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F9 (generate): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F10 (generate): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F11 (generate): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F12 (interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F13 (interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2 |
| O/people/action:refuse | -0.0021 [-0.0068, 0.0026]; n=200 | F2 (pertinence): 0.0042 [0.0009, 0.0074]; n=200; changed=13<br>F3 (interpret): -0.0038 [-0.0078, 0.0003]; n=200; changed=22 |
| O/people/action:renege | -0.0079 [-0.0137, -0.0021]; n=200 | F2 (pertinence): -0.0058 [-0.0106, -0.0011]; n=200; changed=28<br>F3 (interpret): -0.0029 [-0.0068, 0.0010]; n=200; changed=23 |
| O/people/action:wait | -0.0021 [-0.0042, 0.0001]; n=200 | F2 (pertinence): 0.0008 [-0.0003, 0.0020]; n=200; changed=2<br>F3 (interpret): -0.0025 [-0.0045, -0.0005]; n=200; changed=6 |
| O/people/outcome:bad | 0.0029 [-0.0030, 0.0088]; n=200 | F2 (pertinence): -0.0029 [-0.0067, 0.0009]; n=200; changed=26<br>F3 (interpret): 0.0046 [-0.0003, 0.0095]; n=200; changed=28 |
| O/people/outcome:good | -0.0029 [-0.0088, 0.0030]; n=200 | F2 (pertinence): 0.0033 [-0.0006, 0.0072]; n=200; changed=27<br>F3 (interpret): -0.0045 [-0.0094, 0.0004]; n=200; changed=27 |
| O/people/outcome:unfinished | -3.535e-5 [-0.0002, 0.0001]; n=200 | F2 (pertinence): -0.0005 [-0.0014, 0.0004]; n=200; changed=1<br>F3 (interpret): -0.0001 [-0.0002, 3.560e-5]; n=200; changed=2 |
| O/people/receipts | -0.0150 [-0.0783, 0.0483]; n=200 | F2 (pertinence): -0.0250 [-0.0702, 0.0202]; n=200; changed=21<br>F3 (interpret): 0.0250 [-0.0180, 0.0680]; n=200; changed=16 |

### v1/INTP minus null

| Metric | Paired difference [95% interval]; pairs | Formula-off interventions |
|---|---|---|
| A/body/action:fight | 0.0021 [-0.0009, 0.0050]; n=200 | F1 (interpret): 0.0021 [-0.0004, 0.0045]; n=200; changed=9<br>F2 (pertinence): 0.0012 [-0.0009, 0.0034]; n=200; changed=7<br>F3 (interpret): 0.0004 [-0.0014, 0.0023]; n=200; changed=5 |
| A/body/action:steal | -0.0013 [-0.0042, 0.0017]; n=200 | F1 (interpret): -0.0008 [-0.0034, 0.0018]; n=200; changed=7<br>F2 (pertinence): -0.0013 [-0.0031, 0.0006]; n=200; changed=5<br>F3 (interpret): 2.082e-19 [-0.0023, 0.0023]; n=200; changed=8 |
| A/body/censored | -0.0300 [-0.0908, 0.0308]; n=200 | F1 (interpret): -0.0200 [-0.0704, 0.0304]; n=200; changed=26<br>F2 (pertinence): 0.0050 [-0.0403, 0.0503]; n=200; changed=21<br>F3 (interpret): 0.0150 [-0.0070, 0.0370]; n=200; changed=5 |
| A/body/informative | 0.0050 [-0.0049, 0.0149]; n=200 | F1 (interpret): 0.0050 [-0.0049, 0.0149]; n=200; changed=1 |
| A/body/learning-epochs | 0.5890 [0.2821, 0.8960]; n=73 | F1 (interpret): 0.2676 [0.0203, 0.5149]; n=71; changed=10<br>F2 (pertinence): 0.1972 [-0.1377, 0.5321]; n=71; changed=9<br>F3 (interpret): 0.0833 [-0.0834, 0.2501]; n=72; changed=1 |
| A/body/outcome:bad | 0.0066 [-0.0062, 0.0194]; n=184 | F1 (interpret): 0.0059 [-0.0060, 0.0178]; n=184; changed=4<br>F2 (pertinence): 0.0029 [-0.0018, 0.0076]; n=184; changed=4<br>F3 (interpret): 0.0032 [-0.0085, 0.0149]; n=184; changed=5 |
| A/body/outcome:good | -0.0055 [-0.0189, 0.0078]; n=184 | F1 (interpret): -0.0059 [-0.0178, 0.0060]; n=184; changed=4<br>F2 (pertinence): -0.0029 [-0.0076, 0.0018]; n=184; changed=4<br>F3 (interpret): -0.0021 [-0.0144, 0.0102]; n=184; changed=5 |
| A/body/outcome:unfinished | -0.0011 [-0.0032, 0.0011]; n=184 | F3 (interpret): -0.0011 [-0.0032, 0.0011]; n=184; changed=1 |
| A/body/receipts | 0.0100 [-0.0242, 0.0442]; n=200 | F1 (interpret): 0.0150 [-0.0111, 0.0411]; n=200; changed=7<br>F2 (pertinence): 0 [-0.0242, 0.0242]; n=200; changed=6<br>F3 (interpret): 0.0050 [-0.0212, 0.0312]; n=200; changed=7 |
| A/body/stabilized | 0.0350 [-0.0250, 0.0950]; n=200 | F1 (interpret): 0.0250 [-0.0243, 0.0743]; n=200; changed=25<br>F2 (pertinence): -0.0050 [-0.0503, 0.0403]; n=200; changed=21<br>F3 (interpret): -0.0150 [-0.0370, 0.0070]; n=200; changed=5 |
| A/people/action:ask | 0.0004 [-0.0021, 0.0029]; n=200 | F1 (interpret): -0.0004 [-0.0018, 0.0010]; n=200; changed=3<br>F2 (pertinence): -0.0013 [-0.0031, 0.0006]; n=200; changed=2<br>F3 (interpret): 0.0008 [-0.0003, 0.0020]; n=200; changed=2 |
| A/people/action:break | 0.0008 [-0.0015, 0.0032]; n=200 | F1 (interpret): -0.0008 [-0.0028, 0.0012]; n=200; changed=6<br>F2 (pertinence): -0.0004 [-0.0018, 0.0010]; n=200; changed=3<br>F3 (interpret): 0.0029 [0.0002, 0.0056]; n=200; changed=11 |
| A/people/action:deceive | 0.0013 [-0.0017, 0.0042]; n=200 | F1 (interpret): 0 [-0.0020, 0.0020]; n=200; changed=6<br>F2 (pertinence): -0.0004 [-0.0023, 0.0014]; n=200; changed=5<br>F3 (interpret): -0.0004 [-0.0029, 0.0021]; n=200; changed=9 |
| A/people/action:keep | -1.388e-19 [-0.0039, 0.0039]; n=200 | F1 (interpret): 0.0012 [-0.0015, 0.0040]; n=200; changed=11<br>F2 (pertinence): -0.0004 [-0.0031, 0.0023]; n=200; changed=11<br>F3 (interpret): -0.0017 [-0.0047, 0.0014]; n=200; changed=14 |
| A/people/action:leave | -0.0021 [-0.0058, 0.0017]; n=200 | F1 (interpret): -0.0021 [-0.0048, 0.0006]; n=200; changed=11<br>F2 (pertinence): 0.0008 [-0.0020, 0.0037]; n=200; changed=12<br>F3 (interpret): -0.0008 [-0.0028, 0.0012]; n=200; changed=6 |
| A/people/action:trade | -0.0008 [-0.0037, 0.0020]; n=200 | F1 (interpret): 0.0008 [-0.0012, 0.0028]; n=200; changed=6<br>F2 (pertinence): 0.0004 [-0.0018, 0.0026]; n=200; changed=4<br>F3 (interpret): -0.0008 [-0.0025, 0.0008]; n=200; changed=4 |
| A/people/action:work | -0.0004 [-0.0034, 0.0026]; n=200 | F1 (interpret): 0 [-0.0020, 0.0020]; n=200; changed=6<br>F2 (pertinence): 0.0013 [-0.0009, 0.0034]; n=200; changed=4<br>F3 (interpret): -0.0008 [-0.0028, 0.0012]; n=200; changed=7<br>F4 (learning, pertinence): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F5 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F6 (pertinence, interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F7 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F8 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F9 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F10 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F11 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F12 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F13 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1 |
| A/people/censored | -0.0050 [-0.0378, 0.0278]; n=200 | F1 (interpret): 0.0100 [-0.0179, 0.0379]; n=200; changed=8<br>F2 (pertinence): -0.0150 [-0.0370, 0.0070]; n=200; changed=5<br>F3 (interpret): -0.0150 [-0.0370, 0.0070]; n=200; changed=5 |
| A/people/outcome:bad | 0.0010 [-0.0025, 0.0045]; n=200 | F1 (interpret): 0.0010 [-0.0022, 0.0042]; n=200; changed=10<br>F2 (pertinence): -0.0014 [-0.0043, 0.0016]; n=200; changed=11<br>F3 (interpret): -0.0024 [-0.0055, 0.0007]; n=200; changed=10 |
| A/people/outcome:good | -0.0014 [-0.0051, 0.0022]; n=200 | F1 (interpret): -0.0012 [-0.0043, 0.0019]; n=200; changed=8<br>F2 (pertinence): 0.0006 [-0.0024, 0.0036]; n=200; changed=11<br>F3 (interpret): 0.0013 [-0.0013, 0.0038]; n=200; changed=11 |
| A/people/outcome:unfinished | 0.0005 [-0.0022, 0.0031]; n=200 | F1 (interpret): 0.0002 [-0.0001, 0.0005]; n=200; changed=7<br>F2 (pertinence): 0.0008 [-0.0020, 0.0035]; n=200; changed=10<br>F3 (interpret): 0.0011 [-0.0004, 0.0026]; n=200; changed=7 |
| A/people/receipts | -0.0100 [-0.0442, 0.0242]; n=200 | F1 (interpret): -0.0150 [-0.0411, 0.0111]; n=200; changed=7<br>F2 (pertinence): 0 [-0.0242, 0.0242]; n=200; changed=6<br>F3 (interpret): -0.0050 [-0.0312, 0.0212]; n=200; changed=7 |
| A/people/stabilized | 0.0050 [-0.0278, 0.0378]; n=200 | F1 (interpret): -0.0100 [-0.0379, 0.0179]; n=200; changed=8<br>F2 (pertinence): 0.0150 [-0.0070, 0.0370]; n=200; changed=5<br>F3 (interpret): 0.0150 [-0.0070, 0.0370]; n=200; changed=5 |
| B/body/action:fight | 0.0017 [-0.0003, 0.0037]; n=200 | F1 (interpret): 0.0008 [-0.0008, 0.0025]; n=200; changed=4<br>F2 (pertinence): 0.0008 [-0.0008, 0.0025]; n=200; changed=4<br>F3 (interpret): 0.0013 [-0.0002, 0.0027]; n=200; changed=3 |
| B/body/action:steal | -0.0012 [-0.0037, 0.0012]; n=200 | F1 (interpret): -0.0017 [-0.0043, 0.0009]; n=200; changed=10<br>F2 (pertinence): -0.0004 [-0.0023, 0.0014]; n=200; changed=5<br>F3 (interpret): -4.163e-19 [-0.0020, 0.0020]; n=200; changed=6 |
| B/body/censored | -0.0050 [-0.0635, 0.0535]; n=200 | F1 (interpret): -0.0050 [-0.0458, 0.0358]; n=200; changed=17<br>F2 (pertinence): -0.0100 [-0.0584, 0.0384]; n=200; changed=24<br>F3 (interpret): 0 [-0.0280, 0.0280]; n=200; changed=8 |
| B/body/learning-epochs | -0.1324 [-0.5187, 0.2540]; n=68 | F1 (interpret): -0.1231 [-0.4529, 0.2067]; n=65; changed=5<br>F2 (pertinence): -0.1940 [-0.4957, 0.1076]; n=67; changed=5 |
| B/body/outcome:bad | 0.0118 [-0.0020, 0.0255]; n=187 | F1 (interpret): 0.0013 [-0.0074, 0.0100]; n=187; changed=6<br>F2 (pertinence): 0.0093 [-0.0032, 0.0217]; n=187; changed=7<br>F3 (interpret): 0.0049 [-0.0013, 0.0111]; n=186; changed=3 |
| B/body/outcome:good | -0.0133 [-0.0273, 0.0008]; n=187 | F1 (interpret): 2.969e-19 [-0.0083, 0.0083]; n=187; changed=5<br>F2 (pertinence): -0.0121 [-0.0252, 0.0009]; n=187; changed=9<br>F3 (interpret): -0.0036 [-0.0092, 0.0020]; n=186; changed=2 |
| B/body/outcome:unfinished | 0.0015 [-0.0047, 0.0077]; n=187 | F1 (interpret): -0.0013 [-0.0040, 0.0013]; n=187; changed=1<br>F2 (pertinence): 0.0029 [-0.0027, 0.0084]; n=187; changed=4<br>F3 (interpret): -0.0013 [-0.0040, 0.0013]; n=186; changed=1 |
| B/body/receipts | 0.0050 [-0.0247, 0.0347]; n=200 | F1 (interpret): -0.0100 [-0.0412, 0.0212]; n=200; changed=10<br>F2 (pertinence): 0.0050 [-0.0171, 0.0271]; n=200; changed=5<br>F3 (interpret): 0.0150 [-0.0020, 0.0320]; n=200; changed=3 |
| B/body/stabilized | 0.0050 [-0.0535, 0.0635]; n=200 | F1 (interpret): 0 [-0.0420, 0.0420]; n=200; changed=18<br>F2 (pertinence): 0.0100 [-0.0384, 0.0584]; n=200; changed=24<br>F3 (interpret): 0.0050 [-0.0212, 0.0312]; n=200; changed=7 |
| B/people/action:ask | 0.0013 [-0.0006, 0.0031]; n=200 | F1 (interpret): 0 [-0.0012, 0.0012]; n=200; changed=2<br>F2 (pertinence): 0.0004 [-0.0010, 0.0018]; n=200; changed=3<br>F3 (interpret): 0.0004 [-0.0004, 0.0012]; n=200; changed=1 |
| B/people/action:break | 0.0008 [-0.0018, 0.0034]; n=200 | F1 (interpret): 0 [-0.0016, 0.0016]; n=200; changed=4<br>F2 (pertinence): 6.939e-20 [-0.0012, 0.0012]; n=200; changed=2<br>F3 (interpret): 0.0021 [-0.0006, 0.0048]; n=200; changed=11 |
| B/people/action:deceive | 0.0008 [-0.0020, 0.0037]; n=200 | F1 (interpret): 1.388e-19 [-0.0035, 0.0035]; n=200; changed=18<br>F2 (pertinence): -0.0004 [-0.0023, 0.0014]; n=200; changed=5<br>F3 (interpret): 0.0017 [-0.0009, 0.0043]; n=200; changed=10 |
| B/people/action:keep | 6.939e-20 [-0.0026, 0.0026]; n=200 | F1 (interpret): 0.0008 [-0.0012, 0.0028]; n=200; changed=6<br>F2 (pertinence): 0.0004 [-0.0010, 0.0018]; n=200; changed=3<br>F3 (interpret): -0.0025 [-0.0048, -0.0002]; n=200; changed=8 |
| B/people/action:leave | -0.0017 [-0.0040, 0.0007]; n=200 | F1 (interpret): -0.0013 [-0.0031, 0.0006]; n=200; changed=5<br>F2 (pertinence): -6.939e-20 [-0.0016, 0.0016]; n=200; changed=4<br>F3 (interpret): -0.0004 [-0.0012, 0.0004]; n=200; changed=1 |
| B/people/action:trade | -0.0008 [-0.0034, 0.0018]; n=200 | F1 (interpret): 0.0013 [-0.0009, 0.0034]; n=200; changed=7<br>F2 (pertinence): 0.0004 [-0.0018, 0.0026]; n=200; changed=7<br>F3 (interpret): -0.0004 [-0.0012, 0.0004]; n=200; changed=1 |
| B/people/action:wait | -6.939e-20 [-0.0016, 0.0016]; n=200 | F1 (interpret): -0.0008 [-0.0020, 0.0003]; n=200; changed=2<br>F2 (pertinence): -0.0004 [-0.0012, 0.0004]; n=200; changed=1<br>F3 (interpret): 0.0008 [-0.0008, 0.0025]; n=200; changed=4 |
| B/people/action:work | -0.0008 [-0.0037, 0.0020]; n=200 | F1 (interpret): 0.0008 [-0.0027, 0.0043]; n=200; changed=15<br>F2 (pertinence): -0.0008 [-0.0028, 0.0012]; n=200; changed=6<br>F3 (interpret): -0.0029 [-0.0051, -0.0008]; n=200; changed=7 |
| B/people/censored | 0 [-0.0343, 0.0343]; n=200 | F1 (interpret): 0.0150 [-0.0206, 0.0506]; n=200; changed=13<br>F2 (pertinence): 0 [-0.0280, 0.0280]; n=200; changed=8<br>F3 (interpret): 0.0100 [-0.0097, 0.0297]; n=200; changed=4 |
| B/people/learning-epochs | -0.1667 [-1.8482, 1.5149]; n=6 | F1 (interpret): -1.6000 [-3.0160, -0.1840]; n=5; changed=4<br>F2 (pertinence): -0.1667 [-0.5952, 0.2618]; n=6; changed=1<br>F3 (interpret): -0.5000 [-1.7855, 0.7855]; n=6; changed=1 |
| B/people/outcome:bad | 0.0008 [-0.0039, 0.0054]; n=200 | F1 (interpret): 0.0023 [-0.0011, 0.0058]; n=200; changed=18<br>F2 (pertinence): 0.0005 [-0.0034, 0.0043]; n=200; changed=15<br>F3 (interpret): 0.0009 [-0.0024, 0.0042]; n=200; changed=11 |
| B/people/outcome:good | -0.0012 [-0.0048, 0.0024]; n=200 | F1 (interpret): -0.0033 [-0.0068, 0.0003]; n=200; changed=15<br>F2 (pertinence): -0.0004 [-0.0032, 0.0024]; n=200; changed=11<br>F3 (interpret): -0.0014 [-0.0044, 0.0016]; n=200; changed=9 |
| B/people/outcome:unfinished | 0.0005 [-0.0032, 0.0041]; n=200 | F1 (interpret): 0.0009 [-0.0015, 0.0033]; n=200; changed=12<br>F2 (pertinence): -0.0001 [-0.0030, 0.0028]; n=200; changed=9<br>F3 (interpret): 0.0005 [-0.0021, 0.0030]; n=200; changed=7 |
| B/people/receipts | -0.0050 [-0.0347, 0.0247]; n=200 | F1 (interpret): 0.0100 [-0.0212, 0.0412]; n=200; changed=10<br>F2 (pertinence): -0.0050 [-0.0271, 0.0171]; n=200; changed=5<br>F3 (interpret): -0.0150 [-0.0320, 0.0020]; n=200; changed=3 |
| B/people/stabilized | 0 [-0.0343, 0.0343]; n=200 | F1 (interpret): -0.0150 [-0.0506, 0.0206]; n=200; changed=13<br>F2 (pertinence): 0 [-0.0280, 0.0280]; n=200; changed=8<br>F3 (interpret): -0.0100 [-0.0297, 0.0097]; n=200; changed=4 |
| O/body/action:confront | -0.0017 [-0.0077, 0.0044]; n=200 | F1 (interpret): -0.0013 [-0.0055, 0.0030]; n=200; changed=22<br>F2 (pertinence): -0.0013 [-0.0057, 0.0032]; n=200; changed=24<br>F3 (interpret): -0.0013 [-0.0054, 0.0029]; n=200; changed=20<br>F4 (learning, pertinence): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F5 (learning): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F6 (pertinence, interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F7 (interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F8 (learning): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F9 (generate): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F10 (generate): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F11 (generate): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F12 (interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F13 (interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2 |
| O/body/censored | -0.0550 [-0.1147, 0.0047]; n=200 | F1 (interpret): -0.0400 [-0.0860, 0.0060]; n=200; changed=22<br>F2 (pertinence): 0.0050 [-0.0444, 0.0544]; n=200; changed=25<br>F3 (interpret): 0.0150 [-0.0146, 0.0446]; n=200; changed=9 |
| O/body/informative | 0.0100 [-0.0212, 0.0412]; n=200 | F1 (interpret): -0.0050 [-0.0312, 0.0212]; n=200; changed=7<br>F2 (pertinence): 0.0100 [-0.0142, 0.0342]; n=200; changed=6<br>F3 (interpret): 0 [-0.0242, 0.0242]; n=200; changed=6 |
| O/body/learning-epochs | -0.0833 [-0.8963, 0.7296]; n=24 | F1 (interpret): 0.1667 [-0.1810, 0.5143]; n=24; changed=1<br>F2 (pertinence): 0.0870 [-0.0944, 0.2683]; n=23; changed=1<br>F3 (interpret): -0.3333 [-1.0287, 0.3620]; n=24; changed=1 |
| O/body/outcome:bad | 0.0012 [-0.0152, 0.0175]; n=142 | F1 (interpret): -0.0024 [-0.0098, 0.0051]; n=141; changed=2<br>F2 (pertinence): -0.0024 [-0.0098, 0.0051]; n=141; changed=2<br>F3 (interpret): -0.0024 [-0.0070, 0.0023]; n=141; changed=1 |
| O/body/outcome:good | -0.0012 [-0.0175, 0.0152]; n=142 | F1 (interpret): 0.0024 [-0.0051, 0.0098]; n=141; changed=2<br>F2 (pertinence): 0.0024 [-0.0051, 0.0098]; n=141; changed=2<br>F3 (interpret): 0.0024 [-0.0023, 0.0070]; n=141; changed=1 |
| O/body/receipts | -0.0200 [-0.0926, 0.0526]; n=200 | F1 (interpret): -0.0150 [-0.0663, 0.0363]; n=200; changed=21<br>F2 (pertinence): -0.0150 [-0.0682, 0.0382]; n=200; changed=23<br>F3 (interpret): -0.0150 [-0.0644, 0.0344]; n=200; changed=19 |
| O/body/stabilized | 0.0650 [0.0089, 0.1211]; n=200 | F1 (interpret): 0.0350 [-0.0055, 0.0755]; n=200; changed=17<br>F2 (pertinence): 0.0050 [-0.0424, 0.0524]; n=200; changed=23<br>F3 (interpret): -0.0150 [-0.0477, 0.0177]; n=200; changed=11 |
| O/people/action:accept_promise | -0.0104 [-0.0162, -0.0046]; n=200 | F1 (interpret): -0.0004 [-0.0047, 0.0039]; n=200; changed=21<br>F2 (pertinence): -0.0042 [-0.0083, -4.932e-6]; n=200; changed=20<br>F3 (interpret): -0.0004 [-0.0031, 0.0023]; n=200; changed=11 |
| O/people/action:accept_trade | -0.0008 [-0.0056, 0.0040]; n=200 | F1 (interpret): -0.0017 [-0.0053, 0.0020]; n=200; changed=15<br>F2 (pertinence): 0.0029 [-0.0012, 0.0070]; n=200; changed=19<br>F3 (interpret): -0.0046 [-0.0075, -0.0017]; n=200; changed=14<br>F4 (learning, pertinence): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F5 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F6 (pertinence, interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F7 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F8 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F9 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F10 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F11 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F12 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F13 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1 |
| O/people/action:accept_work | 0.0071 [0.0019, 0.0123]; n=200 | F1 (interpret): 0.0033 [-0.0001, 0.0068]; n=200; changed=15<br>F2 (pertinence): -2.776e-19 [-0.0045, 0.0045]; n=200; changed=24<br>F3 (interpret): 0.0050 [0.0020, 0.0080]; n=200; changed=14 |
| O/people/action:chase | 0.0092 [0.0030, 0.0153]; n=200 | F1 (interpret): 0.0017 [-0.0030, 0.0063]; n=200; changed=23<br>F2 (pertinence): -1.249e-18 [-0.0044, 0.0044]; n=200; changed=26<br>F3 (interpret): 0.0071 [0.0029, 0.0112]; n=200; changed=21<br>F4 (learning, pertinence): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F5 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F6 (pertinence, interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F7 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F8 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F9 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F10 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F11 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F12 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F13 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1 |
| O/people/action:give | -0.0025 [-0.0070, 0.0020]; n=200 | F1 (interpret): -0.0008 [-0.0037, 0.0020]; n=200; changed=12<br>F2 (pertinence): 0.0025 [-0.0010, 0.0060]; n=200; changed=18<br>F3 (interpret): -0.0038 [-0.0067, -0.0008]; n=200; changed=13 |
| O/people/action:let_go | -0.0092 [-0.0145, -0.0039]; n=200 | F1 (interpret): -0.0017 [-0.0055, 0.0022]; n=200; changed=16<br>F2 (pertinence): -0.0004 [-0.0049, 0.0040]; n=200; changed=23<br>F3 (interpret): -0.0075 [-0.0122, -0.0028]; n=200; changed=20 |
| O/people/action:pay | 0.0037 [-0.0027, 0.0102]; n=200 | F1 (interpret): -0.0033 [-0.0080, 0.0013]; n=200; changed=27<br>F2 (pertinence): 0.0038 [-0.0011, 0.0086]; n=200; changed=26<br>F3 (interpret): -0.0067 [-0.0109, -0.0024]; n=200; changed=30<br>F4 (learning, pertinence): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F5 (learning): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F6 (pertinence, interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F7 (interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F8 (learning): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F9 (generate): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F10 (generate): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F11 (generate): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F12 (interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F13 (interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2 |
| O/people/action:refuse | 0.0033 [-0.0013, 0.0080]; n=200 | F1 (interpret): 0.0012 [-0.0021, 0.0046]; n=200; changed=17<br>F2 (pertinence): -0.0013 [-0.0048, 0.0023]; n=200; changed=16<br>F3 (interpret): 0.0037 [0.0008, 0.0067]; n=200; changed=13 |
| O/people/action:renege | 1.388e-19 [-0.0074, 0.0074]; n=200 | F1 (interpret): 0.0029 [-0.0013, 0.0072]; n=200; changed=25<br>F2 (pertinence): -0.0029 [-0.0086, 0.0027]; n=200; changed=30<br>F3 (interpret): 0.0058 [0.0010, 0.0107]; n=200; changed=28<br>F4 (learning, pertinence): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F5 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F6 (pertinence, interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F7 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F8 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F9 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F10 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F11 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F12 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F13 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1 |
| O/people/action:wait | 0.0013 [-0.0009, 0.0034]; n=200 | F1 (interpret): 0 [-0.0012, 0.0012]; n=200; changed=2<br>F2 (pertinence): 0.0008 [-0.0008, 0.0025]; n=200; changed=4<br>F3 (interpret): 0.0025 [0.0002, 0.0048]; n=200; changed=8 |
| O/people/outcome:bad | 0.0005 [-0.0061, 0.0070]; n=200 | F1 (interpret): -0.0016 [-0.0051, 0.0019]; n=200; changed=27<br>F2 (pertinence): 0.0015 [-0.0038, 0.0069]; n=200; changed=29<br>F3 (interpret): -0.0028 [-0.0078, 0.0021]; n=200; changed=31 |
| O/people/outcome:good | -0.0008 [-0.0070, 0.0054]; n=200 | F1 (interpret): 0.0012 [-0.0025, 0.0049]; n=200; changed=26<br>F2 (pertinence): -0.0020 [-0.0068, 0.0029]; n=200; changed=26<br>F3 (interpret): 0.0027 [-0.0022, 0.0077]; n=200; changed=30 |
| O/people/outcome:unfinished | 0.0003 [-0.0013, 0.0020]; n=200 | F1 (interpret): 0.0004 [-0.0006, 0.0013]; n=200; changed=3<br>F2 (pertinence): 0.0004 [-0.0012, 0.0021]; n=200; changed=6<br>F3 (interpret): 0.0001 [-0.0011, 0.0013]; n=200; changed=3 |
| O/people/receipts | 0.0200 [-0.0526, 0.0926]; n=200 | F1 (interpret): 0.0150 [-0.0363, 0.0663]; n=200; changed=21<br>F2 (pertinence): 0.0150 [-0.0382, 0.0682]; n=200; changed=23<br>F3 (interpret): 0.0150 [-0.0344, 0.0644]; n=200; changed=19 |

### v1/ESFJ minus null

| Metric | Paired difference [95% interval]; pairs | Formula-off interventions |
|---|---|---|
| A/body/action:fight | 0.0008 [-0.0012, 0.0028]; n=200 | F2 (pertinence): -6.939e-20 [-0.0012, 0.0012]; n=200; changed=2<br>F3 (interpret): 0.0013 [-0.0002, 0.0027]; n=200; changed=3 |
| A/body/action:steal | 0.0008 [-0.0012, 0.0028]; n=200 | F2 (pertinence): 0.0017 [3.494e-5, 0.0033]; n=200; changed=4<br>F3 (interpret): -0.0008 [-0.0020, 0.0003]; n=200; changed=2 |
| A/body/censored | -0.0050 [-0.0564, 0.0464]; n=200 | F2 (pertinence): 0.0050 [-0.0444, 0.0544]; n=200; changed=25<br>F3 (interpret): 0.0100 [-0.0212, 0.0412]; n=200; changed=10 |
| A/body/learning-epochs | 0.0400 [-0.2696, 0.3496]; n=75 | F2 (pertinence): 0.1081 [-0.1964, 0.4127]; n=74; changed=16 |
| A/body/outcome:bad | -0.0071 [-0.0248, 0.0106]; n=184 | F2 (pertinence): -0.0052 [-0.0134, 0.0031]; n=184; changed=5<br>F3 (interpret): -0.0054 [-0.0221, 0.0112]; n=184; changed=5 |
| A/body/outcome:good | 0.0023 [-0.0150, 0.0195]; n=184 | F2 (pertinence): 0.0004 [-0.0068, 0.0076]; n=184; changed=4<br>F3 (interpret): 0.0054 [-0.0112, 0.0221]; n=184; changed=5 |
| A/body/outcome:unfinished | 0.0048 [-0.0017, 0.0113]; n=184 | F2 (pertinence): 0.0048 [-0.0017, 0.0113]; n=184; changed=3 |
| A/body/receipts | 0.0200 [-0.0078, 0.0478]; n=200 | F2 (pertinence): 0.0200 [-0.0041, 0.0441]; n=200; changed=6<br>F3 (interpret): 0.0050 [-0.0121, 0.0221]; n=200; changed=3 |
| A/body/stabilized | 0.0050 [-0.0464, 0.0564]; n=200 | F2 (pertinence): -0.0050 [-0.0544, 0.0444]; n=200; changed=25<br>F3 (interpret): -0.0100 [-0.0412, 0.0212]; n=200; changed=10 |
| A/people/action:ask | -0.0017 [-0.0033, -3.494e-5]; n=200 | F3 (interpret): -0.0017 [-0.0033, -3.494e-5]; n=200; changed=4 |
| A/people/action:break | -0.0013 [-0.0034, 0.0009]; n=200 | F2 (pertinence): -0.0008 [-0.0020, 0.0003]; n=200; changed=2<br>F3 (interpret): -0.0008 [-0.0028, 0.0012]; n=200; changed=6 |
| A/people/action:deceive | -0.0013 [-0.0034, 0.0009]; n=200 | F2 (pertinence): -0.0017 [-0.0033, -3.494e-5]; n=200; changed=4<br>F3 (interpret): 0 [-0.0023, 0.0023]; n=200; changed=5 |
| A/people/action:keep | 0.0013 [-0.0015, 0.0040]; n=200 | F2 (pertinence): 0.0017 [3.494e-5, 0.0033]; n=200; changed=4<br>F3 (interpret): -2.776e-19 [-0.0023, 0.0023]; n=200; changed=8 |
| A/people/action:leave | 0 [-0.0023, 0.0023]; n=200 | F2 (pertinence): -0.0008 [-0.0025, 0.0008]; n=200; changed=4<br>F3 (interpret): 0.0008 [-0.0008, 0.0025]; n=200; changed=4 |
| A/people/action:trade | 0.0013 [-0.0009, 0.0034]; n=200 | F3 (interpret): 0.0012 [-0.0009, 0.0034]; n=200; changed=7 |
| A/people/action:wait | -0.0008 [-0.0020, 0.0003]; n=200 | F3 (interpret): -0.0008 [-0.0020, 0.0003]; n=200; changed=2 |
| A/people/action:work | 0.0008 [-0.0012, 0.0028]; n=200 | F3 (interpret): 0.0008 [-0.0018, 0.0034]; n=200; changed=7 |
| A/people/censored | -0.0350 [-0.0674, -0.0026]; n=200 | F2 (pertinence): -0.0250 [-0.0509, 0.0009]; n=200; changed=7<br>F3 (interpret): -0.0250 [-0.0509, 0.0009]; n=200; changed=7 |
| A/people/outcome:bad | 0.0041 [-0.0003, 0.0086]; n=200 | F2 (pertinence): 0.0006 [-0.0019, 0.0032]; n=200; changed=10<br>F3 (interpret): 0.0031 [-0.0006, 0.0068]; n=200; changed=8 |
| A/people/outcome:good | -0.0018 [-0.0057, 0.0020]; n=200 | F2 (pertinence): -0.0001 [-0.0030, 0.0027]; n=200; changed=7<br>F3 (interpret): -0.0020 [-0.0054, 0.0013]; n=200; changed=9 |
| A/people/outcome:unfinished | -0.0023 [-0.0045, -0.0001]; n=200 | F2 (pertinence): -0.0005 [-0.0027, 0.0017]; n=200; changed=7<br>F3 (interpret): -0.0011 [-0.0025, 0.0004]; n=200; changed=4 |
| A/people/receipts | -0.0200 [-0.0478, 0.0078]; n=200 | F2 (pertinence): -0.0200 [-0.0441, 0.0041]; n=200; changed=6<br>F3 (interpret): -0.0050 [-0.0221, 0.0121]; n=200; changed=3 |
| A/people/stabilized | 0.0350 [0.0026, 0.0674]; n=200 | F2 (pertinence): 0.0250 [-0.0009, 0.0509]; n=200; changed=7<br>F3 (interpret): 0.0250 [-0.0009, 0.0509]; n=200; changed=7 |
| B/body/action:fight | 0.0017 [-0.0009, 0.0043]; n=200 | F1 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F2 (pertinence): 0.0012 [-0.0012, 0.0037]; n=200; changed=6<br>F3 (interpret): 0.0013 [-0.0002, 0.0027]; n=200; changed=4<br>F4 (learning, pertinence): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F5 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F6 (pertinence, interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F7 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F8 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F9 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F10 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F11 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F12 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F13 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1 |
| B/body/action:steal | -0.0017 [-0.0043, 0.0009]; n=200 | F2 (pertinence): -0.0021 [-0.0042, 0.0001]; n=200; changed=7<br>F3 (interpret): -0.0004 [-0.0023, 0.0014]; n=200; changed=5 |
| B/body/censored | 0 [-0.0420, 0.0420]; n=200 | F2 (pertinence): -0.0100 [-0.0519, 0.0319]; n=200; changed=18<br>F3 (interpret): 0.0050 [-0.0121, 0.0221]; n=200; changed=3 |
| B/body/informative | 0 [-0.0140, 0.0140]; n=200 | F2 (pertinence): -0.0050 [-0.0149, 0.0049]; n=200; changed=1<br>F3 (interpret): 0 [-0.0140, 0.0140]; n=200; changed=2 |
| B/body/learning-epochs | -0.1039 [-0.3246, 0.1168]; n=77 | F2 (pertinence): 0.0263 [-0.2278, 0.2805]; n=76; changed=13<br>F3 (interpret): -0.0519 [-0.1559, 0.0520]; n=77; changed=1 |
| B/body/outcome:bad | -0.0020 [-0.0088, 0.0049]; n=186 | F2 (pertinence): -0.0038 [-0.0115, 0.0040]; n=186; changed=6 |
| B/body/outcome:good | 0.0020 [-0.0049, 0.0088]; n=186 | F2 (pertinence): 0.0048 [-0.0032, 0.0128]; n=186; changed=7 |
| B/body/receipts | 0 [-0.0343, 0.0343]; n=200 | F2 (pertinence): -0.0100 [-0.0379, 0.0179]; n=200; changed=8<br>F3 (interpret): 0.0100 [-0.0142, 0.0342]; n=200; changed=6 |
| B/body/stabilized | 0 [-0.0396, 0.0396]; n=200 | F2 (pertinence): 0.0050 [-0.0358, 0.0458]; n=200; changed=17<br>F3 (interpret): -0.0050 [-0.0221, 0.0121]; n=200; changed=3 |
| B/people/action:ask | -0.0008 [-0.0020, 0.0003]; n=200 | F2 (pertinence): -0.0004 [-0.0012, 0.0004]; n=200; changed=1<br>F3 (interpret): -0.0004 [-0.0012, 0.0004]; n=200; changed=1 |
| B/people/action:break | -0.0021 [-0.0045, 0.0004]; n=200 | F2 (pertinence): 0.0004 [-0.0004, 0.0012]; n=200; changed=1<br>F3 (interpret): -0.0021 [-0.0048, 0.0006]; n=200; changed=11 |
| B/people/action:deceive | -0.0021 [-0.0057, 0.0015]; n=200 | F2 (pertinence): 0.0017 [-0.0003, 0.0037]; n=200; changed=6<br>F3 (interpret): -0.0029 [-0.0061, 0.0002]; n=200; changed=12 |
| B/people/action:keep | 0.0033 [0.0008, 0.0059]; n=200 | F1 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F2 (pertinence): 0.0004 [-0.0010, 0.0018]; n=200; changed=3<br>F3 (interpret): 0.0025 [0.0002, 0.0048]; n=200; changed=8<br>F4 (learning, pertinence): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F5 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F6 (pertinence, interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F7 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F8 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F9 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F10 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F11 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F12 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F13 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1 |
| B/people/action:leave | -0.0017 [-0.0040, 0.0007]; n=200 | F2 (pertinence): -0.0017 [-0.0037, 0.0003]; n=200; changed=6<br>F3 (interpret): 0 [-0.0016, 0.0016]; n=200; changed=4 |
| B/people/action:trade | 0.0013 [-0.0006, 0.0031]; n=200 | F2 (pertinence): 0.0013 [-0.0002, 0.0027]; n=200; changed=3<br>F3 (interpret): 0.0004 [-0.0004, 0.0012]; n=200; changed=1 |
| B/people/action:wait | -0.0008 [-0.0020, 0.0003]; n=200 | F3 (interpret): -0.0013 [-0.0027, 0.0002]; n=200; changed=3 |
| B/people/action:work | 0.0029 [-2.670e-5, 0.0059]; n=200 | F2 (pertinence): -0.0008 [-0.0025, 0.0008]; n=200; changed=4<br>F3 (interpret): 0.0029 [0.0005, 0.0054]; n=200; changed=9 |
| B/people/censored | -0.0250 [-0.0576, 0.0076]; n=200 | F2 (pertinence): -0.0100 [-0.0297, 0.0097]; n=200; changed=4<br>F3 (interpret): -0.0300 [-0.0610, 0.0010]; n=200; changed=10 |
| B/people/learning-epochs | 0.1111 [-0.1452, 0.3674]; n=9 | F2 (pertinence): 0.1111 [-0.1452, 0.3674]; n=9; changed=1 |
| B/people/outcome:bad | -0.0020 [-0.0058, 0.0018]; n=200 | F2 (pertinence): -0.0027 [-0.0063, 0.0008]; n=200; changed=15<br>F3 (interpret): -0.0002 [-0.0027, 0.0024]; n=200; changed=11 |
| B/people/outcome:good | 0.0007 [-0.0029, 0.0042]; n=200 | F2 (pertinence): 0.0008 [-0.0022, 0.0037]; n=200; changed=11<br>F3 (interpret): -0.0006 [-0.0028, 0.0015]; n=200; changed=9 |
| B/people/outcome:unfinished | 0.0013 [-0.0011, 0.0038]; n=200 | F2 (pertinence): 0.0019 [-0.0009, 0.0048]; n=200; changed=12<br>F3 (interpret): 0.0008 [-0.0005, 0.0021]; n=200; changed=7 |
| B/people/receipts | 0 [-0.0343, 0.0343]; n=200 | F2 (pertinence): 0.0100 [-0.0179, 0.0379]; n=200; changed=8<br>F3 (interpret): -0.0100 [-0.0342, 0.0142]; n=200; changed=6 |
| B/people/stabilized | 0.0250 [-0.0076, 0.0576]; n=200 | F2 (pertinence): 0.0100 [-0.0097, 0.0297]; n=200; changed=4<br>F3 (interpret): 0.0300 [-0.0010, 0.0610]; n=200; changed=10 |
| O/body/action:confront | 0.0012 [-0.0040, 0.0065]; n=200 | F1 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F2 (pertinence): 0.0021 [-0.0017, 0.0058]; n=200; changed=21<br>F3 (interpret): -0.0021 [-0.0057, 0.0015]; n=200; changed=16<br>F4 (learning, pertinence): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F5 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F6 (pertinence, interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F7 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F8 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F9 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F10 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F11 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F12 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F13 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1 |
| O/body/censored | -0.0200 [-0.0704, 0.0304]; n=200 | F2 (pertinence): -0.0100 [-0.0542, 0.0342]; n=200; changed=20<br>F3 (interpret): -0.0350 [-0.0643, -0.0057]; n=200; changed=9 |
| O/body/informative | -0.0050 [-0.0347, 0.0247]; n=200 | F2 (pertinence): -0.0050 [-0.0221, 0.0121]; n=200; changed=3<br>F3 (interpret): -0.0200 [-0.0441, 0.0041]; n=200; changed=6 |
| O/body/learning-epochs | -0.2800 [-0.6315, 0.0715]; n=25 | F2 (pertinence): -0.2800 [-0.6315, 0.0715]; n=25; changed=3<br>F3 (interpret): 0.0833 [-0.0905, 0.2572]; n=24; changed=1 |
| O/body/outcome:bad | 0.0047 [-0.0027, 0.0121]; n=141 | F2 (pertinence): 0.0047 [-0.0027, 0.0121]; n=141; changed=2 |
| O/body/outcome:good | -0.0047 [-0.0121, 0.0027]; n=141 | F2 (pertinence): -0.0047 [-0.0121, 0.0027]; n=141; changed=2 |
| O/body/receipts | 0.0150 [-0.0483, 0.0783]; n=200 | F2 (pertinence): 0.0250 [-0.0202, 0.0702]; n=200; changed=21<br>F3 (interpret): -0.0250 [-0.0680, 0.0180]; n=200; changed=16 |
| O/body/stabilized | 0.0150 [-0.0303, 0.0603]; n=200 | F2 (pertinence): 0.0050 [-0.0358, 0.0458]; n=200; changed=17<br>F3 (interpret): 0.0150 [-0.0070, 0.0370]; n=200; changed=5 |
| O/people/action:accept_promise | 0.0012 [-0.0033, 0.0058]; n=200 | F2 (pertinence): 0.0004 [-0.0030, 0.0038]; n=200; changed=14<br>F3 (interpret): 6.939e-20 [-0.0026, 0.0026]; n=200; changed=10 |
| O/people/action:accept_trade | 0.0037 [-0.0007, 0.0082]; n=200 | F2 (pertinence): -0.0008 [-0.0045, 0.0029]; n=200; changed=12<br>F3 (interpret): 0.0025 [-0.0013, 0.0063]; n=200; changed=16 |
| O/people/action:accept_work | -0.0062 [-0.0112, -0.0013]; n=200 | F2 (pertinence): -0.0021 [-0.0065, 0.0023]; n=200; changed=18<br>F3 (interpret): -0.0029 [-0.0063, 0.0005]; n=200; changed=14 |
| O/people/action:chase | -0.0054 [-0.0106, -0.0002]; n=200 | F2 (pertinence): 0.0017 [-0.0024, 0.0057]; n=200; changed=21<br>F3 (interpret): -0.0050 [-0.0091, -0.0009]; n=200; changed=20 |
| O/people/action:give | 0.0017 [-0.0030, 0.0063]; n=200 | F2 (pertinence): -0.0029 [-0.0063, 0.0005]; n=200; changed=14<br>F3 (interpret): 0.0037 [9.883e-6, 0.0075]; n=200; changed=21 |
| O/people/action:let_go | 0.0088 [0.0036, 0.0139]; n=200 | F1 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F2 (pertinence): -0.0017 [-0.0052, 0.0018]; n=200; changed=19<br>F3 (interpret): 0.0092 [0.0052, 0.0132]; n=200; changed=23<br>F4 (learning, pertinence): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F5 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F6 (pertinence, interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F7 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F8 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F9 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F10 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F11 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F12 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F13 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1 |
| O/people/action:pay | 0.0071 [0.0011, 0.0131]; n=200 | F1 (interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F2 (pertinence): 0.0042 [4.932e-6, 0.0083]; n=200; changed=24<br>F3 (interpret): 0.0037 [-0.0002, 0.0077]; n=200; changed=24<br>F4 (learning, pertinence): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F5 (learning): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F6 (pertinence, interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F7 (interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F8 (learning): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F9 (generate): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F10 (generate): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F11 (generate): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F12 (interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F13 (interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2 |
| O/people/action:refuse | -0.0021 [-0.0068, 0.0026]; n=200 | F2 (pertinence): 0.0042 [0.0009, 0.0074]; n=200; changed=13<br>F3 (interpret): -0.0038 [-0.0078, 0.0003]; n=200; changed=22 |
| O/people/action:renege | -0.0079 [-0.0137, -0.0021]; n=200 | F2 (pertinence): -0.0058 [-0.0106, -0.0011]; n=200; changed=28<br>F3 (interpret): -0.0029 [-0.0068, 0.0010]; n=200; changed=23 |
| O/people/action:wait | -0.0021 [-0.0042, 0.0001]; n=200 | F2 (pertinence): 0.0008 [-0.0003, 0.0020]; n=200; changed=2<br>F3 (interpret): -0.0025 [-0.0045, -0.0005]; n=200; changed=6 |
| O/people/outcome:bad | 0.0029 [-0.0030, 0.0088]; n=200 | F2 (pertinence): -0.0029 [-0.0067, 0.0009]; n=200; changed=26<br>F3 (interpret): 0.0046 [-0.0003, 0.0095]; n=200; changed=28 |
| O/people/outcome:good | -0.0029 [-0.0088, 0.0030]; n=200 | F2 (pertinence): 0.0033 [-0.0006, 0.0072]; n=200; changed=27<br>F3 (interpret): -0.0045 [-0.0094, 0.0004]; n=200; changed=27 |
| O/people/outcome:unfinished | -3.535e-5 [-0.0002, 0.0001]; n=200 | F2 (pertinence): -0.0005 [-0.0014, 0.0004]; n=200; changed=1<br>F3 (interpret): -0.0001 [-0.0002, 3.560e-5]; n=200; changed=2 |
| O/people/receipts | -0.0150 [-0.0783, 0.0483]; n=200 | F2 (pertinence): -0.0250 [-0.0702, 0.0202]; n=200; changed=21<br>F3 (interpret): 0.0250 [-0.0180, 0.0680]; n=200; changed=16 |

### v1/ISFJ minus null

| Metric | Paired difference [95% interval]; pairs | Formula-off interventions |
|---|---|---|
| A/body/action:fight | 0.0021 [-0.0009, 0.0050]; n=200 | F1 (interpret): 0.0021 [-0.0004, 0.0045]; n=200; changed=9<br>F2 (pertinence): 0.0012 [-0.0009, 0.0034]; n=200; changed=7<br>F3 (interpret): 0.0004 [-0.0014, 0.0023]; n=200; changed=5 |
| A/body/action:steal | -0.0013 [-0.0042, 0.0017]; n=200 | F1 (interpret): -0.0008 [-0.0034, 0.0018]; n=200; changed=7<br>F2 (pertinence): -0.0013 [-0.0031, 0.0006]; n=200; changed=5<br>F3 (interpret): 2.082e-19 [-0.0023, 0.0023]; n=200; changed=8 |
| A/body/censored | -0.0300 [-0.0908, 0.0308]; n=200 | F1 (interpret): -0.0200 [-0.0704, 0.0304]; n=200; changed=26<br>F2 (pertinence): 0.0050 [-0.0403, 0.0503]; n=200; changed=21<br>F3 (interpret): 0.0150 [-0.0070, 0.0370]; n=200; changed=5 |
| A/body/informative | 0.0050 [-0.0049, 0.0149]; n=200 | F1 (interpret): 0.0050 [-0.0049, 0.0149]; n=200; changed=1 |
| A/body/learning-epochs | 0.5890 [0.2821, 0.8960]; n=73 | F1 (interpret): 0.2676 [0.0203, 0.5149]; n=71; changed=10<br>F2 (pertinence): 0.1972 [-0.1377, 0.5321]; n=71; changed=9<br>F3 (interpret): 0.0833 [-0.0834, 0.2501]; n=72; changed=1 |
| A/body/outcome:bad | 0.0066 [-0.0062, 0.0194]; n=184 | F1 (interpret): 0.0059 [-0.0060, 0.0178]; n=184; changed=4<br>F2 (pertinence): 0.0029 [-0.0018, 0.0076]; n=184; changed=4<br>F3 (interpret): 0.0032 [-0.0085, 0.0149]; n=184; changed=5 |
| A/body/outcome:good | -0.0055 [-0.0189, 0.0078]; n=184 | F1 (interpret): -0.0059 [-0.0178, 0.0060]; n=184; changed=4<br>F2 (pertinence): -0.0029 [-0.0076, 0.0018]; n=184; changed=4<br>F3 (interpret): -0.0021 [-0.0144, 0.0102]; n=184; changed=5 |
| A/body/outcome:unfinished | -0.0011 [-0.0032, 0.0011]; n=184 | F3 (interpret): -0.0011 [-0.0032, 0.0011]; n=184; changed=1 |
| A/body/receipts | 0.0100 [-0.0242, 0.0442]; n=200 | F1 (interpret): 0.0150 [-0.0111, 0.0411]; n=200; changed=7<br>F2 (pertinence): 0 [-0.0242, 0.0242]; n=200; changed=6<br>F3 (interpret): 0.0050 [-0.0212, 0.0312]; n=200; changed=7 |
| A/body/stabilized | 0.0350 [-0.0250, 0.0950]; n=200 | F1 (interpret): 0.0250 [-0.0243, 0.0743]; n=200; changed=25<br>F2 (pertinence): -0.0050 [-0.0503, 0.0403]; n=200; changed=21<br>F3 (interpret): -0.0150 [-0.0370, 0.0070]; n=200; changed=5 |
| A/people/action:ask | 0.0004 [-0.0021, 0.0029]; n=200 | F1 (interpret): -0.0004 [-0.0018, 0.0010]; n=200; changed=3<br>F2 (pertinence): -0.0013 [-0.0031, 0.0006]; n=200; changed=2<br>F3 (interpret): 0.0008 [-0.0003, 0.0020]; n=200; changed=2 |
| A/people/action:break | 0.0008 [-0.0015, 0.0032]; n=200 | F1 (interpret): -0.0008 [-0.0028, 0.0012]; n=200; changed=6<br>F2 (pertinence): -0.0004 [-0.0018, 0.0010]; n=200; changed=3<br>F3 (interpret): 0.0029 [0.0002, 0.0056]; n=200; changed=11 |
| A/people/action:deceive | 0.0013 [-0.0017, 0.0042]; n=200 | F1 (interpret): 0 [-0.0020, 0.0020]; n=200; changed=6<br>F2 (pertinence): -0.0004 [-0.0023, 0.0014]; n=200; changed=5<br>F3 (interpret): -0.0004 [-0.0029, 0.0021]; n=200; changed=9 |
| A/people/action:keep | -1.388e-19 [-0.0039, 0.0039]; n=200 | F1 (interpret): 0.0012 [-0.0015, 0.0040]; n=200; changed=11<br>F2 (pertinence): -0.0004 [-0.0031, 0.0023]; n=200; changed=11<br>F3 (interpret): -0.0017 [-0.0047, 0.0014]; n=200; changed=14 |
| A/people/action:leave | -0.0021 [-0.0058, 0.0017]; n=200 | F1 (interpret): -0.0021 [-0.0048, 0.0006]; n=200; changed=11<br>F2 (pertinence): 0.0008 [-0.0020, 0.0037]; n=200; changed=12<br>F3 (interpret): -0.0008 [-0.0028, 0.0012]; n=200; changed=6 |
| A/people/action:trade | -0.0008 [-0.0037, 0.0020]; n=200 | F1 (interpret): 0.0008 [-0.0012, 0.0028]; n=200; changed=6<br>F2 (pertinence): 0.0004 [-0.0018, 0.0026]; n=200; changed=4<br>F3 (interpret): -0.0008 [-0.0025, 0.0008]; n=200; changed=4 |
| A/people/action:work | -0.0004 [-0.0034, 0.0026]; n=200 | F1 (interpret): 0 [-0.0020, 0.0020]; n=200; changed=6<br>F2 (pertinence): 0.0013 [-0.0009, 0.0034]; n=200; changed=4<br>F3 (interpret): -0.0008 [-0.0028, 0.0012]; n=200; changed=7<br>F4 (learning, pertinence): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F5 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F6 (pertinence, interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F7 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F8 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F9 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F10 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F11 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F12 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F13 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1 |
| A/people/censored | -0.0050 [-0.0378, 0.0278]; n=200 | F1 (interpret): 0.0100 [-0.0179, 0.0379]; n=200; changed=8<br>F2 (pertinence): -0.0150 [-0.0370, 0.0070]; n=200; changed=5<br>F3 (interpret): -0.0150 [-0.0370, 0.0070]; n=200; changed=5 |
| A/people/outcome:bad | 0.0010 [-0.0025, 0.0045]; n=200 | F1 (interpret): 0.0010 [-0.0022, 0.0042]; n=200; changed=10<br>F2 (pertinence): -0.0014 [-0.0043, 0.0016]; n=200; changed=11<br>F3 (interpret): -0.0024 [-0.0055, 0.0007]; n=200; changed=10 |
| A/people/outcome:good | -0.0014 [-0.0051, 0.0022]; n=200 | F1 (interpret): -0.0012 [-0.0043, 0.0019]; n=200; changed=8<br>F2 (pertinence): 0.0006 [-0.0024, 0.0036]; n=200; changed=11<br>F3 (interpret): 0.0013 [-0.0013, 0.0038]; n=200; changed=11 |
| A/people/outcome:unfinished | 0.0005 [-0.0022, 0.0031]; n=200 | F1 (interpret): 0.0002 [-0.0001, 0.0005]; n=200; changed=7<br>F2 (pertinence): 0.0008 [-0.0020, 0.0035]; n=200; changed=10<br>F3 (interpret): 0.0011 [-0.0004, 0.0026]; n=200; changed=7 |
| A/people/receipts | -0.0100 [-0.0442, 0.0242]; n=200 | F1 (interpret): -0.0150 [-0.0411, 0.0111]; n=200; changed=7<br>F2 (pertinence): 0 [-0.0242, 0.0242]; n=200; changed=6<br>F3 (interpret): -0.0050 [-0.0312, 0.0212]; n=200; changed=7 |
| A/people/stabilized | 0.0050 [-0.0278, 0.0378]; n=200 | F1 (interpret): -0.0100 [-0.0379, 0.0179]; n=200; changed=8<br>F2 (pertinence): 0.0150 [-0.0070, 0.0370]; n=200; changed=5<br>F3 (interpret): 0.0150 [-0.0070, 0.0370]; n=200; changed=5 |
| B/body/action:fight | 0.0017 [-0.0003, 0.0037]; n=200 | F1 (interpret): 0.0008 [-0.0008, 0.0025]; n=200; changed=4<br>F2 (pertinence): 0.0008 [-0.0008, 0.0025]; n=200; changed=4<br>F3 (interpret): 0.0013 [-0.0002, 0.0027]; n=200; changed=3 |
| B/body/action:steal | -0.0012 [-0.0037, 0.0012]; n=200 | F1 (interpret): -0.0017 [-0.0043, 0.0009]; n=200; changed=10<br>F2 (pertinence): -0.0004 [-0.0023, 0.0014]; n=200; changed=5<br>F3 (interpret): -4.163e-19 [-0.0020, 0.0020]; n=200; changed=6 |
| B/body/censored | -0.0050 [-0.0635, 0.0535]; n=200 | F1 (interpret): -0.0050 [-0.0458, 0.0358]; n=200; changed=17<br>F2 (pertinence): -0.0100 [-0.0584, 0.0384]; n=200; changed=24<br>F3 (interpret): 0 [-0.0280, 0.0280]; n=200; changed=8 |
| B/body/learning-epochs | -0.1324 [-0.5187, 0.2540]; n=68 | F1 (interpret): -0.1231 [-0.4529, 0.2067]; n=65; changed=5<br>F2 (pertinence): -0.1940 [-0.4957, 0.1076]; n=67; changed=5 |
| B/body/outcome:bad | 0.0118 [-0.0020, 0.0255]; n=187 | F1 (interpret): 0.0013 [-0.0074, 0.0100]; n=187; changed=6<br>F2 (pertinence): 0.0093 [-0.0032, 0.0217]; n=187; changed=7<br>F3 (interpret): 0.0049 [-0.0013, 0.0111]; n=186; changed=3 |
| B/body/outcome:good | -0.0133 [-0.0273, 0.0008]; n=187 | F1 (interpret): 2.969e-19 [-0.0083, 0.0083]; n=187; changed=5<br>F2 (pertinence): -0.0121 [-0.0252, 0.0009]; n=187; changed=9<br>F3 (interpret): -0.0036 [-0.0092, 0.0020]; n=186; changed=2 |
| B/body/outcome:unfinished | 0.0015 [-0.0047, 0.0077]; n=187 | F1 (interpret): -0.0013 [-0.0040, 0.0013]; n=187; changed=1<br>F2 (pertinence): 0.0029 [-0.0027, 0.0084]; n=187; changed=4<br>F3 (interpret): -0.0013 [-0.0040, 0.0013]; n=186; changed=1 |
| B/body/receipts | 0.0050 [-0.0247, 0.0347]; n=200 | F1 (interpret): -0.0100 [-0.0412, 0.0212]; n=200; changed=10<br>F2 (pertinence): 0.0050 [-0.0171, 0.0271]; n=200; changed=5<br>F3 (interpret): 0.0150 [-0.0020, 0.0320]; n=200; changed=3 |
| B/body/stabilized | 0.0050 [-0.0535, 0.0635]; n=200 | F1 (interpret): 0 [-0.0420, 0.0420]; n=200; changed=18<br>F2 (pertinence): 0.0100 [-0.0384, 0.0584]; n=200; changed=24<br>F3 (interpret): 0.0050 [-0.0212, 0.0312]; n=200; changed=7 |
| B/people/action:ask | 0.0013 [-0.0006, 0.0031]; n=200 | F1 (interpret): 0 [-0.0012, 0.0012]; n=200; changed=2<br>F2 (pertinence): 0.0004 [-0.0010, 0.0018]; n=200; changed=3<br>F3 (interpret): 0.0004 [-0.0004, 0.0012]; n=200; changed=1 |
| B/people/action:break | 0.0008 [-0.0018, 0.0034]; n=200 | F1 (interpret): 0 [-0.0016, 0.0016]; n=200; changed=4<br>F2 (pertinence): 6.939e-20 [-0.0012, 0.0012]; n=200; changed=2<br>F3 (interpret): 0.0021 [-0.0006, 0.0048]; n=200; changed=11 |
| B/people/action:deceive | 0.0008 [-0.0020, 0.0037]; n=200 | F1 (interpret): 1.388e-19 [-0.0035, 0.0035]; n=200; changed=18<br>F2 (pertinence): -0.0004 [-0.0023, 0.0014]; n=200; changed=5<br>F3 (interpret): 0.0017 [-0.0009, 0.0043]; n=200; changed=10 |
| B/people/action:keep | 6.939e-20 [-0.0026, 0.0026]; n=200 | F1 (interpret): 0.0008 [-0.0012, 0.0028]; n=200; changed=6<br>F2 (pertinence): 0.0004 [-0.0010, 0.0018]; n=200; changed=3<br>F3 (interpret): -0.0025 [-0.0048, -0.0002]; n=200; changed=8 |
| B/people/action:leave | -0.0017 [-0.0040, 0.0007]; n=200 | F1 (interpret): -0.0013 [-0.0031, 0.0006]; n=200; changed=5<br>F2 (pertinence): -6.939e-20 [-0.0016, 0.0016]; n=200; changed=4<br>F3 (interpret): -0.0004 [-0.0012, 0.0004]; n=200; changed=1 |
| B/people/action:trade | -0.0008 [-0.0034, 0.0018]; n=200 | F1 (interpret): 0.0013 [-0.0009, 0.0034]; n=200; changed=7<br>F2 (pertinence): 0.0004 [-0.0018, 0.0026]; n=200; changed=7<br>F3 (interpret): -0.0004 [-0.0012, 0.0004]; n=200; changed=1 |
| B/people/action:wait | -6.939e-20 [-0.0016, 0.0016]; n=200 | F1 (interpret): -0.0008 [-0.0020, 0.0003]; n=200; changed=2<br>F2 (pertinence): -0.0004 [-0.0012, 0.0004]; n=200; changed=1<br>F3 (interpret): 0.0008 [-0.0008, 0.0025]; n=200; changed=4 |
| B/people/action:work | -0.0008 [-0.0037, 0.0020]; n=200 | F1 (interpret): 0.0008 [-0.0027, 0.0043]; n=200; changed=15<br>F2 (pertinence): -0.0008 [-0.0028, 0.0012]; n=200; changed=6<br>F3 (interpret): -0.0029 [-0.0051, -0.0008]; n=200; changed=7 |
| B/people/censored | 0 [-0.0343, 0.0343]; n=200 | F1 (interpret): 0.0150 [-0.0206, 0.0506]; n=200; changed=13<br>F2 (pertinence): 0 [-0.0280, 0.0280]; n=200; changed=8<br>F3 (interpret): 0.0100 [-0.0097, 0.0297]; n=200; changed=4 |
| B/people/learning-epochs | -0.1667 [-1.8482, 1.5149]; n=6 | F1 (interpret): -1.6000 [-3.0160, -0.1840]; n=5; changed=4<br>F2 (pertinence): -0.1667 [-0.5952, 0.2618]; n=6; changed=1<br>F3 (interpret): -0.5000 [-1.7855, 0.7855]; n=6; changed=1 |
| B/people/outcome:bad | 0.0008 [-0.0039, 0.0054]; n=200 | F1 (interpret): 0.0023 [-0.0011, 0.0058]; n=200; changed=18<br>F2 (pertinence): 0.0005 [-0.0034, 0.0043]; n=200; changed=15<br>F3 (interpret): 0.0009 [-0.0024, 0.0042]; n=200; changed=11 |
| B/people/outcome:good | -0.0012 [-0.0048, 0.0024]; n=200 | F1 (interpret): -0.0033 [-0.0068, 0.0003]; n=200; changed=15<br>F2 (pertinence): -0.0004 [-0.0032, 0.0024]; n=200; changed=11<br>F3 (interpret): -0.0014 [-0.0044, 0.0016]; n=200; changed=9 |
| B/people/outcome:unfinished | 0.0005 [-0.0032, 0.0041]; n=200 | F1 (interpret): 0.0009 [-0.0015, 0.0033]; n=200; changed=12<br>F2 (pertinence): -0.0001 [-0.0030, 0.0028]; n=200; changed=9<br>F3 (interpret): 0.0005 [-0.0021, 0.0030]; n=200; changed=7 |
| B/people/receipts | -0.0050 [-0.0347, 0.0247]; n=200 | F1 (interpret): 0.0100 [-0.0212, 0.0412]; n=200; changed=10<br>F2 (pertinence): -0.0050 [-0.0271, 0.0171]; n=200; changed=5<br>F3 (interpret): -0.0150 [-0.0320, 0.0020]; n=200; changed=3 |
| B/people/stabilized | 0 [-0.0343, 0.0343]; n=200 | F1 (interpret): -0.0150 [-0.0506, 0.0206]; n=200; changed=13<br>F2 (pertinence): 0 [-0.0280, 0.0280]; n=200; changed=8<br>F3 (interpret): -0.0100 [-0.0297, 0.0097]; n=200; changed=4 |
| O/body/action:confront | -0.0017 [-0.0077, 0.0044]; n=200 | F1 (interpret): -0.0013 [-0.0055, 0.0030]; n=200; changed=22<br>F2 (pertinence): -0.0013 [-0.0057, 0.0032]; n=200; changed=24<br>F3 (interpret): -0.0013 [-0.0054, 0.0029]; n=200; changed=20<br>F4 (learning, pertinence): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F5 (learning): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F6 (pertinence, interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F7 (interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F8 (learning): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F9 (generate): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F10 (generate): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F11 (generate): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F12 (interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F13 (interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2 |
| O/body/censored | -0.0550 [-0.1147, 0.0047]; n=200 | F1 (interpret): -0.0400 [-0.0860, 0.0060]; n=200; changed=22<br>F2 (pertinence): 0.0050 [-0.0444, 0.0544]; n=200; changed=25<br>F3 (interpret): 0.0150 [-0.0146, 0.0446]; n=200; changed=9 |
| O/body/informative | 0.0100 [-0.0212, 0.0412]; n=200 | F1 (interpret): -0.0050 [-0.0312, 0.0212]; n=200; changed=7<br>F2 (pertinence): 0.0100 [-0.0142, 0.0342]; n=200; changed=6<br>F3 (interpret): 0 [-0.0242, 0.0242]; n=200; changed=6 |
| O/body/learning-epochs | -0.0833 [-0.8963, 0.7296]; n=24 | F1 (interpret): 0.1667 [-0.1810, 0.5143]; n=24; changed=1<br>F2 (pertinence): 0.0870 [-0.0944, 0.2683]; n=23; changed=1<br>F3 (interpret): -0.3333 [-1.0287, 0.3620]; n=24; changed=1 |
| O/body/outcome:bad | 0.0012 [-0.0152, 0.0175]; n=142 | F1 (interpret): -0.0024 [-0.0098, 0.0051]; n=141; changed=2<br>F2 (pertinence): -0.0024 [-0.0098, 0.0051]; n=141; changed=2<br>F3 (interpret): -0.0024 [-0.0070, 0.0023]; n=141; changed=1 |
| O/body/outcome:good | -0.0012 [-0.0175, 0.0152]; n=142 | F1 (interpret): 0.0024 [-0.0051, 0.0098]; n=141; changed=2<br>F2 (pertinence): 0.0024 [-0.0051, 0.0098]; n=141; changed=2<br>F3 (interpret): 0.0024 [-0.0023, 0.0070]; n=141; changed=1 |
| O/body/receipts | -0.0200 [-0.0926, 0.0526]; n=200 | F1 (interpret): -0.0150 [-0.0663, 0.0363]; n=200; changed=21<br>F2 (pertinence): -0.0150 [-0.0682, 0.0382]; n=200; changed=23<br>F3 (interpret): -0.0150 [-0.0644, 0.0344]; n=200; changed=19 |
| O/body/stabilized | 0.0650 [0.0089, 0.1211]; n=200 | F1 (interpret): 0.0350 [-0.0055, 0.0755]; n=200; changed=17<br>F2 (pertinence): 0.0050 [-0.0424, 0.0524]; n=200; changed=23<br>F3 (interpret): -0.0150 [-0.0477, 0.0177]; n=200; changed=11 |
| O/people/action:accept_promise | -0.0104 [-0.0162, -0.0046]; n=200 | F1 (interpret): -0.0004 [-0.0047, 0.0039]; n=200; changed=21<br>F2 (pertinence): -0.0042 [-0.0083, -4.932e-6]; n=200; changed=20<br>F3 (interpret): -0.0004 [-0.0031, 0.0023]; n=200; changed=11 |
| O/people/action:accept_trade | -0.0008 [-0.0056, 0.0040]; n=200 | F1 (interpret): -0.0017 [-0.0053, 0.0020]; n=200; changed=15<br>F2 (pertinence): 0.0029 [-0.0012, 0.0070]; n=200; changed=19<br>F3 (interpret): -0.0046 [-0.0075, -0.0017]; n=200; changed=14<br>F4 (learning, pertinence): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F5 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F6 (pertinence, interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F7 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F8 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F9 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F10 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F11 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F12 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F13 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1 |
| O/people/action:accept_work | 0.0071 [0.0019, 0.0123]; n=200 | F1 (interpret): 0.0033 [-0.0001, 0.0068]; n=200; changed=15<br>F2 (pertinence): -2.776e-19 [-0.0045, 0.0045]; n=200; changed=24<br>F3 (interpret): 0.0050 [0.0020, 0.0080]; n=200; changed=14 |
| O/people/action:chase | 0.0092 [0.0030, 0.0153]; n=200 | F1 (interpret): 0.0017 [-0.0030, 0.0063]; n=200; changed=23<br>F2 (pertinence): -1.249e-18 [-0.0044, 0.0044]; n=200; changed=26<br>F3 (interpret): 0.0071 [0.0029, 0.0112]; n=200; changed=21<br>F4 (learning, pertinence): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F5 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F6 (pertinence, interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F7 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F8 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F9 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F10 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F11 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F12 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F13 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1 |
| O/people/action:give | -0.0025 [-0.0070, 0.0020]; n=200 | F1 (interpret): -0.0008 [-0.0037, 0.0020]; n=200; changed=12<br>F2 (pertinence): 0.0025 [-0.0010, 0.0060]; n=200; changed=18<br>F3 (interpret): -0.0038 [-0.0067, -0.0008]; n=200; changed=13 |
| O/people/action:let_go | -0.0092 [-0.0145, -0.0039]; n=200 | F1 (interpret): -0.0017 [-0.0055, 0.0022]; n=200; changed=16<br>F2 (pertinence): -0.0004 [-0.0049, 0.0040]; n=200; changed=23<br>F3 (interpret): -0.0075 [-0.0122, -0.0028]; n=200; changed=20 |
| O/people/action:pay | 0.0037 [-0.0027, 0.0102]; n=200 | F1 (interpret): -0.0033 [-0.0080, 0.0013]; n=200; changed=27<br>F2 (pertinence): 0.0038 [-0.0011, 0.0086]; n=200; changed=26<br>F3 (interpret): -0.0067 [-0.0109, -0.0024]; n=200; changed=30<br>F4 (learning, pertinence): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F5 (learning): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F6 (pertinence, interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F7 (interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F8 (learning): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F9 (generate): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F10 (generate): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F11 (generate): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F12 (interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F13 (interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2 |
| O/people/action:refuse | 0.0033 [-0.0013, 0.0080]; n=200 | F1 (interpret): 0.0012 [-0.0021, 0.0046]; n=200; changed=17<br>F2 (pertinence): -0.0013 [-0.0048, 0.0023]; n=200; changed=16<br>F3 (interpret): 0.0037 [0.0008, 0.0067]; n=200; changed=13 |
| O/people/action:renege | 1.388e-19 [-0.0074, 0.0074]; n=200 | F1 (interpret): 0.0029 [-0.0013, 0.0072]; n=200; changed=25<br>F2 (pertinence): -0.0029 [-0.0086, 0.0027]; n=200; changed=30<br>F3 (interpret): 0.0058 [0.0010, 0.0107]; n=200; changed=28<br>F4 (learning, pertinence): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F5 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F6 (pertinence, interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F7 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F8 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F9 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F10 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F11 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F12 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F13 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1 |
| O/people/action:wait | 0.0013 [-0.0009, 0.0034]; n=200 | F1 (interpret): 0 [-0.0012, 0.0012]; n=200; changed=2<br>F2 (pertinence): 0.0008 [-0.0008, 0.0025]; n=200; changed=4<br>F3 (interpret): 0.0025 [0.0002, 0.0048]; n=200; changed=8 |
| O/people/outcome:bad | 0.0005 [-0.0061, 0.0070]; n=200 | F1 (interpret): -0.0016 [-0.0051, 0.0019]; n=200; changed=27<br>F2 (pertinence): 0.0015 [-0.0038, 0.0069]; n=200; changed=29<br>F3 (interpret): -0.0028 [-0.0078, 0.0021]; n=200; changed=31 |
| O/people/outcome:good | -0.0008 [-0.0070, 0.0054]; n=200 | F1 (interpret): 0.0012 [-0.0025, 0.0049]; n=200; changed=26<br>F2 (pertinence): -0.0020 [-0.0068, 0.0029]; n=200; changed=26<br>F3 (interpret): 0.0027 [-0.0022, 0.0077]; n=200; changed=30 |
| O/people/outcome:unfinished | 0.0003 [-0.0013, 0.0020]; n=200 | F1 (interpret): 0.0004 [-0.0006, 0.0013]; n=200; changed=3<br>F2 (pertinence): 0.0004 [-0.0012, 0.0021]; n=200; changed=6<br>F3 (interpret): 0.0001 [-0.0011, 0.0013]; n=200; changed=3 |
| O/people/receipts | 0.0200 [-0.0526, 0.0926]; n=200 | F1 (interpret): 0.0150 [-0.0363, 0.0663]; n=200; changed=21<br>F2 (pertinence): 0.0150 [-0.0382, 0.0682]; n=200; changed=23<br>F3 (interpret): 0.0150 [-0.0344, 0.0644]; n=200; changed=19 |

### v1/ENFJ minus null

| Metric | Paired difference [95% interval]; pairs | Formula-off interventions |
|---|---|---|
| A/body/action:fight | 0.0008 [-0.0012, 0.0028]; n=200 | F2 (pertinence): -6.939e-20 [-0.0012, 0.0012]; n=200; changed=2<br>F3 (interpret): 0.0013 [-0.0002, 0.0027]; n=200; changed=3 |
| A/body/action:steal | 0.0008 [-0.0012, 0.0028]; n=200 | F2 (pertinence): 0.0017 [3.494e-5, 0.0033]; n=200; changed=4<br>F3 (interpret): -0.0008 [-0.0020, 0.0003]; n=200; changed=2 |
| A/body/censored | -0.0050 [-0.0564, 0.0464]; n=200 | F2 (pertinence): 0.0050 [-0.0444, 0.0544]; n=200; changed=25<br>F3 (interpret): 0.0100 [-0.0212, 0.0412]; n=200; changed=10 |
| A/body/learning-epochs | 0.0400 [-0.2696, 0.3496]; n=75 | F2 (pertinence): 0.1081 [-0.1964, 0.4127]; n=74; changed=16 |
| A/body/outcome:bad | -0.0071 [-0.0248, 0.0106]; n=184 | F2 (pertinence): -0.0052 [-0.0134, 0.0031]; n=184; changed=5<br>F3 (interpret): -0.0054 [-0.0221, 0.0112]; n=184; changed=5 |
| A/body/outcome:good | 0.0023 [-0.0150, 0.0195]; n=184 | F2 (pertinence): 0.0004 [-0.0068, 0.0076]; n=184; changed=4<br>F3 (interpret): 0.0054 [-0.0112, 0.0221]; n=184; changed=5 |
| A/body/outcome:unfinished | 0.0048 [-0.0017, 0.0113]; n=184 | F2 (pertinence): 0.0048 [-0.0017, 0.0113]; n=184; changed=3 |
| A/body/receipts | 0.0200 [-0.0078, 0.0478]; n=200 | F2 (pertinence): 0.0200 [-0.0041, 0.0441]; n=200; changed=6<br>F3 (interpret): 0.0050 [-0.0121, 0.0221]; n=200; changed=3 |
| A/body/stabilized | 0.0050 [-0.0464, 0.0564]; n=200 | F2 (pertinence): -0.0050 [-0.0544, 0.0444]; n=200; changed=25<br>F3 (interpret): -0.0100 [-0.0412, 0.0212]; n=200; changed=10 |
| A/people/action:ask | -0.0017 [-0.0033, -3.494e-5]; n=200 | F3 (interpret): -0.0017 [-0.0033, -3.494e-5]; n=200; changed=4 |
| A/people/action:break | -0.0013 [-0.0034, 0.0009]; n=200 | F2 (pertinence): -0.0008 [-0.0020, 0.0003]; n=200; changed=2<br>F3 (interpret): -0.0008 [-0.0028, 0.0012]; n=200; changed=6 |
| A/people/action:deceive | -0.0013 [-0.0034, 0.0009]; n=200 | F2 (pertinence): -0.0017 [-0.0033, -3.494e-5]; n=200; changed=4<br>F3 (interpret): 0 [-0.0023, 0.0023]; n=200; changed=5 |
| A/people/action:keep | 0.0013 [-0.0015, 0.0040]; n=200 | F2 (pertinence): 0.0017 [3.494e-5, 0.0033]; n=200; changed=4<br>F3 (interpret): -2.776e-19 [-0.0023, 0.0023]; n=200; changed=8 |
| A/people/action:leave | 0 [-0.0023, 0.0023]; n=200 | F2 (pertinence): -0.0008 [-0.0025, 0.0008]; n=200; changed=4<br>F3 (interpret): 0.0008 [-0.0008, 0.0025]; n=200; changed=4 |
| A/people/action:trade | 0.0013 [-0.0009, 0.0034]; n=200 | F3 (interpret): 0.0012 [-0.0009, 0.0034]; n=200; changed=7 |
| A/people/action:wait | -0.0008 [-0.0020, 0.0003]; n=200 | F3 (interpret): -0.0008 [-0.0020, 0.0003]; n=200; changed=2 |
| A/people/action:work | 0.0008 [-0.0012, 0.0028]; n=200 | F3 (interpret): 0.0008 [-0.0018, 0.0034]; n=200; changed=7 |
| A/people/censored | -0.0350 [-0.0674, -0.0026]; n=200 | F2 (pertinence): -0.0250 [-0.0509, 0.0009]; n=200; changed=7<br>F3 (interpret): -0.0250 [-0.0509, 0.0009]; n=200; changed=7 |
| A/people/outcome:bad | 0.0041 [-0.0003, 0.0086]; n=200 | F2 (pertinence): 0.0006 [-0.0019, 0.0032]; n=200; changed=10<br>F3 (interpret): 0.0031 [-0.0006, 0.0068]; n=200; changed=8 |
| A/people/outcome:good | -0.0018 [-0.0057, 0.0020]; n=200 | F2 (pertinence): -0.0001 [-0.0030, 0.0027]; n=200; changed=7<br>F3 (interpret): -0.0020 [-0.0054, 0.0013]; n=200; changed=9 |
| A/people/outcome:unfinished | -0.0023 [-0.0045, -0.0001]; n=200 | F2 (pertinence): -0.0005 [-0.0027, 0.0017]; n=200; changed=7<br>F3 (interpret): -0.0011 [-0.0025, 0.0004]; n=200; changed=4 |
| A/people/receipts | -0.0200 [-0.0478, 0.0078]; n=200 | F2 (pertinence): -0.0200 [-0.0441, 0.0041]; n=200; changed=6<br>F3 (interpret): -0.0050 [-0.0221, 0.0121]; n=200; changed=3 |
| A/people/stabilized | 0.0350 [0.0026, 0.0674]; n=200 | F2 (pertinence): 0.0250 [-0.0009, 0.0509]; n=200; changed=7<br>F3 (interpret): 0.0250 [-0.0009, 0.0509]; n=200; changed=7 |
| B/body/action:fight | 0.0017 [-0.0009, 0.0043]; n=200 | F1 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F2 (pertinence): 0.0012 [-0.0012, 0.0037]; n=200; changed=6<br>F3 (interpret): 0.0013 [-0.0002, 0.0027]; n=200; changed=4<br>F4 (learning, pertinence): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F5 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F6 (pertinence, interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F7 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F8 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F9 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F10 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F11 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F12 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F13 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1 |
| B/body/action:steal | -0.0017 [-0.0043, 0.0009]; n=200 | F2 (pertinence): -0.0021 [-0.0042, 0.0001]; n=200; changed=7<br>F3 (interpret): -0.0004 [-0.0023, 0.0014]; n=200; changed=5 |
| B/body/censored | 0 [-0.0420, 0.0420]; n=200 | F2 (pertinence): -0.0100 [-0.0519, 0.0319]; n=200; changed=18<br>F3 (interpret): 0.0050 [-0.0121, 0.0221]; n=200; changed=3 |
| B/body/informative | 0 [-0.0140, 0.0140]; n=200 | F2 (pertinence): -0.0050 [-0.0149, 0.0049]; n=200; changed=1<br>F3 (interpret): 0 [-0.0140, 0.0140]; n=200; changed=2 |
| B/body/learning-epochs | -0.1039 [-0.3246, 0.1168]; n=77 | F2 (pertinence): 0.0263 [-0.2278, 0.2805]; n=76; changed=13<br>F3 (interpret): -0.0519 [-0.1559, 0.0520]; n=77; changed=1 |
| B/body/outcome:bad | -0.0020 [-0.0088, 0.0049]; n=186 | F2 (pertinence): -0.0038 [-0.0115, 0.0040]; n=186; changed=6 |
| B/body/outcome:good | 0.0020 [-0.0049, 0.0088]; n=186 | F2 (pertinence): 0.0048 [-0.0032, 0.0128]; n=186; changed=7 |
| B/body/receipts | 0 [-0.0343, 0.0343]; n=200 | F2 (pertinence): -0.0100 [-0.0379, 0.0179]; n=200; changed=8<br>F3 (interpret): 0.0100 [-0.0142, 0.0342]; n=200; changed=6 |
| B/body/stabilized | 0 [-0.0396, 0.0396]; n=200 | F2 (pertinence): 0.0050 [-0.0358, 0.0458]; n=200; changed=17<br>F3 (interpret): -0.0050 [-0.0221, 0.0121]; n=200; changed=3 |
| B/people/action:ask | -0.0008 [-0.0020, 0.0003]; n=200 | F2 (pertinence): -0.0004 [-0.0012, 0.0004]; n=200; changed=1<br>F3 (interpret): -0.0004 [-0.0012, 0.0004]; n=200; changed=1 |
| B/people/action:break | -0.0021 [-0.0045, 0.0004]; n=200 | F2 (pertinence): 0.0004 [-0.0004, 0.0012]; n=200; changed=1<br>F3 (interpret): -0.0021 [-0.0048, 0.0006]; n=200; changed=11 |
| B/people/action:deceive | -0.0021 [-0.0057, 0.0015]; n=200 | F2 (pertinence): 0.0017 [-0.0003, 0.0037]; n=200; changed=6<br>F3 (interpret): -0.0029 [-0.0061, 0.0002]; n=200; changed=12 |
| B/people/action:keep | 0.0033 [0.0008, 0.0059]; n=200 | F1 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F2 (pertinence): 0.0004 [-0.0010, 0.0018]; n=200; changed=3<br>F3 (interpret): 0.0025 [0.0002, 0.0048]; n=200; changed=8<br>F4 (learning, pertinence): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F5 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F6 (pertinence, interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F7 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F8 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F9 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F10 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F11 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F12 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F13 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1 |
| B/people/action:leave | -0.0017 [-0.0040, 0.0007]; n=200 | F2 (pertinence): -0.0017 [-0.0037, 0.0003]; n=200; changed=6<br>F3 (interpret): 0 [-0.0016, 0.0016]; n=200; changed=4 |
| B/people/action:trade | 0.0013 [-0.0006, 0.0031]; n=200 | F2 (pertinence): 0.0013 [-0.0002, 0.0027]; n=200; changed=3<br>F3 (interpret): 0.0004 [-0.0004, 0.0012]; n=200; changed=1 |
| B/people/action:wait | -0.0008 [-0.0020, 0.0003]; n=200 | F3 (interpret): -0.0013 [-0.0027, 0.0002]; n=200; changed=3 |
| B/people/action:work | 0.0029 [-2.670e-5, 0.0059]; n=200 | F2 (pertinence): -0.0008 [-0.0025, 0.0008]; n=200; changed=4<br>F3 (interpret): 0.0029 [0.0005, 0.0054]; n=200; changed=9 |
| B/people/censored | -0.0250 [-0.0576, 0.0076]; n=200 | F2 (pertinence): -0.0100 [-0.0297, 0.0097]; n=200; changed=4<br>F3 (interpret): -0.0300 [-0.0610, 0.0010]; n=200; changed=10 |
| B/people/learning-epochs | 0.1111 [-0.1452, 0.3674]; n=9 | F2 (pertinence): 0.1111 [-0.1452, 0.3674]; n=9; changed=1 |
| B/people/outcome:bad | -0.0020 [-0.0058, 0.0018]; n=200 | F2 (pertinence): -0.0027 [-0.0063, 0.0008]; n=200; changed=15<br>F3 (interpret): -0.0002 [-0.0027, 0.0024]; n=200; changed=11 |
| B/people/outcome:good | 0.0007 [-0.0029, 0.0042]; n=200 | F2 (pertinence): 0.0008 [-0.0022, 0.0037]; n=200; changed=11<br>F3 (interpret): -0.0006 [-0.0028, 0.0015]; n=200; changed=9 |
| B/people/outcome:unfinished | 0.0013 [-0.0011, 0.0038]; n=200 | F2 (pertinence): 0.0019 [-0.0009, 0.0048]; n=200; changed=12<br>F3 (interpret): 0.0008 [-0.0005, 0.0021]; n=200; changed=7 |
| B/people/receipts | 0 [-0.0343, 0.0343]; n=200 | F2 (pertinence): 0.0100 [-0.0179, 0.0379]; n=200; changed=8<br>F3 (interpret): -0.0100 [-0.0342, 0.0142]; n=200; changed=6 |
| B/people/stabilized | 0.0250 [-0.0076, 0.0576]; n=200 | F2 (pertinence): 0.0100 [-0.0097, 0.0297]; n=200; changed=4<br>F3 (interpret): 0.0300 [-0.0010, 0.0610]; n=200; changed=10 |
| O/body/action:confront | 0.0012 [-0.0040, 0.0065]; n=200 | F1 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F2 (pertinence): 0.0021 [-0.0017, 0.0058]; n=200; changed=21<br>F3 (interpret): -0.0021 [-0.0057, 0.0015]; n=200; changed=16<br>F4 (learning, pertinence): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F5 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F6 (pertinence, interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F7 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F8 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F9 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F10 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F11 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F12 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F13 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1 |
| O/body/censored | -0.0200 [-0.0704, 0.0304]; n=200 | F2 (pertinence): -0.0100 [-0.0542, 0.0342]; n=200; changed=20<br>F3 (interpret): -0.0350 [-0.0643, -0.0057]; n=200; changed=9 |
| O/body/informative | -0.0050 [-0.0347, 0.0247]; n=200 | F2 (pertinence): -0.0050 [-0.0221, 0.0121]; n=200; changed=3<br>F3 (interpret): -0.0200 [-0.0441, 0.0041]; n=200; changed=6 |
| O/body/learning-epochs | -0.2800 [-0.6315, 0.0715]; n=25 | F2 (pertinence): -0.2800 [-0.6315, 0.0715]; n=25; changed=3<br>F3 (interpret): 0.0833 [-0.0905, 0.2572]; n=24; changed=1 |
| O/body/outcome:bad | 0.0047 [-0.0027, 0.0121]; n=141 | F2 (pertinence): 0.0047 [-0.0027, 0.0121]; n=141; changed=2 |
| O/body/outcome:good | -0.0047 [-0.0121, 0.0027]; n=141 | F2 (pertinence): -0.0047 [-0.0121, 0.0027]; n=141; changed=2 |
| O/body/receipts | 0.0150 [-0.0483, 0.0783]; n=200 | F2 (pertinence): 0.0250 [-0.0202, 0.0702]; n=200; changed=21<br>F3 (interpret): -0.0250 [-0.0680, 0.0180]; n=200; changed=16 |
| O/body/stabilized | 0.0150 [-0.0303, 0.0603]; n=200 | F2 (pertinence): 0.0050 [-0.0358, 0.0458]; n=200; changed=17<br>F3 (interpret): 0.0150 [-0.0070, 0.0370]; n=200; changed=5 |
| O/people/action:accept_promise | 0.0012 [-0.0033, 0.0058]; n=200 | F2 (pertinence): 0.0004 [-0.0030, 0.0038]; n=200; changed=14<br>F3 (interpret): 6.939e-20 [-0.0026, 0.0026]; n=200; changed=10 |
| O/people/action:accept_trade | 0.0037 [-0.0007, 0.0082]; n=200 | F2 (pertinence): -0.0008 [-0.0045, 0.0029]; n=200; changed=12<br>F3 (interpret): 0.0025 [-0.0013, 0.0063]; n=200; changed=16 |
| O/people/action:accept_work | -0.0062 [-0.0112, -0.0013]; n=200 | F2 (pertinence): -0.0021 [-0.0065, 0.0023]; n=200; changed=18<br>F3 (interpret): -0.0029 [-0.0063, 0.0005]; n=200; changed=14 |
| O/people/action:chase | -0.0054 [-0.0106, -0.0002]; n=200 | F2 (pertinence): 0.0017 [-0.0024, 0.0057]; n=200; changed=21<br>F3 (interpret): -0.0050 [-0.0091, -0.0009]; n=200; changed=20 |
| O/people/action:give | 0.0017 [-0.0030, 0.0063]; n=200 | F2 (pertinence): -0.0029 [-0.0063, 0.0005]; n=200; changed=14<br>F3 (interpret): 0.0037 [9.883e-6, 0.0075]; n=200; changed=21 |
| O/people/action:let_go | 0.0088 [0.0036, 0.0139]; n=200 | F1 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F2 (pertinence): -0.0017 [-0.0052, 0.0018]; n=200; changed=19<br>F3 (interpret): 0.0092 [0.0052, 0.0132]; n=200; changed=23<br>F4 (learning, pertinence): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F5 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F6 (pertinence, interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F7 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F8 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F9 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F10 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F11 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F12 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F13 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1 |
| O/people/action:pay | 0.0071 [0.0011, 0.0131]; n=200 | F1 (interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F2 (pertinence): 0.0042 [4.932e-6, 0.0083]; n=200; changed=24<br>F3 (interpret): 0.0037 [-0.0002, 0.0077]; n=200; changed=24<br>F4 (learning, pertinence): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F5 (learning): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F6 (pertinence, interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F7 (interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F8 (learning): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F9 (generate): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F10 (generate): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F11 (generate): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F12 (interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F13 (interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2 |
| O/people/action:refuse | -0.0021 [-0.0068, 0.0026]; n=200 | F2 (pertinence): 0.0042 [0.0009, 0.0074]; n=200; changed=13<br>F3 (interpret): -0.0038 [-0.0078, 0.0003]; n=200; changed=22 |
| O/people/action:renege | -0.0079 [-0.0137, -0.0021]; n=200 | F2 (pertinence): -0.0058 [-0.0106, -0.0011]; n=200; changed=28<br>F3 (interpret): -0.0029 [-0.0068, 0.0010]; n=200; changed=23 |
| O/people/action:wait | -0.0021 [-0.0042, 0.0001]; n=200 | F2 (pertinence): 0.0008 [-0.0003, 0.0020]; n=200; changed=2<br>F3 (interpret): -0.0025 [-0.0045, -0.0005]; n=200; changed=6 |
| O/people/outcome:bad | 0.0029 [-0.0030, 0.0088]; n=200 | F2 (pertinence): -0.0029 [-0.0067, 0.0009]; n=200; changed=26<br>F3 (interpret): 0.0046 [-0.0003, 0.0095]; n=200; changed=28 |
| O/people/outcome:good | -0.0029 [-0.0088, 0.0030]; n=200 | F2 (pertinence): 0.0033 [-0.0006, 0.0072]; n=200; changed=27<br>F3 (interpret): -0.0045 [-0.0094, 0.0004]; n=200; changed=27 |
| O/people/outcome:unfinished | -3.535e-5 [-0.0002, 0.0001]; n=200 | F2 (pertinence): -0.0005 [-0.0014, 0.0004]; n=200; changed=1<br>F3 (interpret): -0.0001 [-0.0002, 3.560e-5]; n=200; changed=2 |
| O/people/receipts | -0.0150 [-0.0783, 0.0483]; n=200 | F2 (pertinence): -0.0250 [-0.0702, 0.0202]; n=200; changed=21<br>F3 (interpret): 0.0250 [-0.0180, 0.0680]; n=200; changed=16 |

### v1/INFJ minus null

| Metric | Paired difference [95% interval]; pairs | Formula-off interventions |
|---|---|---|
| A/body/action:fight | 0.0021 [-0.0009, 0.0050]; n=200 | F1 (interpret): 0.0021 [-0.0004, 0.0045]; n=200; changed=9<br>F2 (pertinence): 0.0012 [-0.0009, 0.0034]; n=200; changed=7<br>F3 (interpret): 0.0004 [-0.0014, 0.0023]; n=200; changed=5 |
| A/body/action:steal | -0.0013 [-0.0042, 0.0017]; n=200 | F1 (interpret): -0.0008 [-0.0034, 0.0018]; n=200; changed=7<br>F2 (pertinence): -0.0013 [-0.0031, 0.0006]; n=200; changed=5<br>F3 (interpret): 2.082e-19 [-0.0023, 0.0023]; n=200; changed=8 |
| A/body/censored | -0.0300 [-0.0908, 0.0308]; n=200 | F1 (interpret): -0.0200 [-0.0704, 0.0304]; n=200; changed=26<br>F2 (pertinence): 0.0050 [-0.0403, 0.0503]; n=200; changed=21<br>F3 (interpret): 0.0150 [-0.0070, 0.0370]; n=200; changed=5 |
| A/body/informative | 0.0050 [-0.0049, 0.0149]; n=200 | F1 (interpret): 0.0050 [-0.0049, 0.0149]; n=200; changed=1 |
| A/body/learning-epochs | 0.5890 [0.2821, 0.8960]; n=73 | F1 (interpret): 0.2676 [0.0203, 0.5149]; n=71; changed=10<br>F2 (pertinence): 0.1972 [-0.1377, 0.5321]; n=71; changed=9<br>F3 (interpret): 0.0833 [-0.0834, 0.2501]; n=72; changed=1 |
| A/body/outcome:bad | 0.0066 [-0.0062, 0.0194]; n=184 | F1 (interpret): 0.0059 [-0.0060, 0.0178]; n=184; changed=4<br>F2 (pertinence): 0.0029 [-0.0018, 0.0076]; n=184; changed=4<br>F3 (interpret): 0.0032 [-0.0085, 0.0149]; n=184; changed=5 |
| A/body/outcome:good | -0.0055 [-0.0189, 0.0078]; n=184 | F1 (interpret): -0.0059 [-0.0178, 0.0060]; n=184; changed=4<br>F2 (pertinence): -0.0029 [-0.0076, 0.0018]; n=184; changed=4<br>F3 (interpret): -0.0021 [-0.0144, 0.0102]; n=184; changed=5 |
| A/body/outcome:unfinished | -0.0011 [-0.0032, 0.0011]; n=184 | F3 (interpret): -0.0011 [-0.0032, 0.0011]; n=184; changed=1 |
| A/body/receipts | 0.0100 [-0.0242, 0.0442]; n=200 | F1 (interpret): 0.0150 [-0.0111, 0.0411]; n=200; changed=7<br>F2 (pertinence): 0 [-0.0242, 0.0242]; n=200; changed=6<br>F3 (interpret): 0.0050 [-0.0212, 0.0312]; n=200; changed=7 |
| A/body/stabilized | 0.0350 [-0.0250, 0.0950]; n=200 | F1 (interpret): 0.0250 [-0.0243, 0.0743]; n=200; changed=25<br>F2 (pertinence): -0.0050 [-0.0503, 0.0403]; n=200; changed=21<br>F3 (interpret): -0.0150 [-0.0370, 0.0070]; n=200; changed=5 |
| A/people/action:ask | 0.0004 [-0.0021, 0.0029]; n=200 | F1 (interpret): -0.0004 [-0.0018, 0.0010]; n=200; changed=3<br>F2 (pertinence): -0.0013 [-0.0031, 0.0006]; n=200; changed=2<br>F3 (interpret): 0.0008 [-0.0003, 0.0020]; n=200; changed=2 |
| A/people/action:break | 0.0008 [-0.0015, 0.0032]; n=200 | F1 (interpret): -0.0008 [-0.0028, 0.0012]; n=200; changed=6<br>F2 (pertinence): -0.0004 [-0.0018, 0.0010]; n=200; changed=3<br>F3 (interpret): 0.0029 [0.0002, 0.0056]; n=200; changed=11 |
| A/people/action:deceive | 0.0013 [-0.0017, 0.0042]; n=200 | F1 (interpret): 0 [-0.0020, 0.0020]; n=200; changed=6<br>F2 (pertinence): -0.0004 [-0.0023, 0.0014]; n=200; changed=5<br>F3 (interpret): -0.0004 [-0.0029, 0.0021]; n=200; changed=9 |
| A/people/action:keep | -1.388e-19 [-0.0039, 0.0039]; n=200 | F1 (interpret): 0.0012 [-0.0015, 0.0040]; n=200; changed=11<br>F2 (pertinence): -0.0004 [-0.0031, 0.0023]; n=200; changed=11<br>F3 (interpret): -0.0017 [-0.0047, 0.0014]; n=200; changed=14 |
| A/people/action:leave | -0.0021 [-0.0058, 0.0017]; n=200 | F1 (interpret): -0.0021 [-0.0048, 0.0006]; n=200; changed=11<br>F2 (pertinence): 0.0008 [-0.0020, 0.0037]; n=200; changed=12<br>F3 (interpret): -0.0008 [-0.0028, 0.0012]; n=200; changed=6 |
| A/people/action:trade | -0.0008 [-0.0037, 0.0020]; n=200 | F1 (interpret): 0.0008 [-0.0012, 0.0028]; n=200; changed=6<br>F2 (pertinence): 0.0004 [-0.0018, 0.0026]; n=200; changed=4<br>F3 (interpret): -0.0008 [-0.0025, 0.0008]; n=200; changed=4 |
| A/people/action:work | -0.0004 [-0.0034, 0.0026]; n=200 | F1 (interpret): 0 [-0.0020, 0.0020]; n=200; changed=6<br>F2 (pertinence): 0.0013 [-0.0009, 0.0034]; n=200; changed=4<br>F3 (interpret): -0.0008 [-0.0028, 0.0012]; n=200; changed=7<br>F4 (learning, pertinence): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F5 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F6 (pertinence, interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F7 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F8 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F9 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F10 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F11 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F12 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F13 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1 |
| A/people/censored | -0.0050 [-0.0378, 0.0278]; n=200 | F1 (interpret): 0.0100 [-0.0179, 0.0379]; n=200; changed=8<br>F2 (pertinence): -0.0150 [-0.0370, 0.0070]; n=200; changed=5<br>F3 (interpret): -0.0150 [-0.0370, 0.0070]; n=200; changed=5 |
| A/people/outcome:bad | 0.0010 [-0.0025, 0.0045]; n=200 | F1 (interpret): 0.0010 [-0.0022, 0.0042]; n=200; changed=10<br>F2 (pertinence): -0.0014 [-0.0043, 0.0016]; n=200; changed=11<br>F3 (interpret): -0.0024 [-0.0055, 0.0007]; n=200; changed=10 |
| A/people/outcome:good | -0.0014 [-0.0051, 0.0022]; n=200 | F1 (interpret): -0.0012 [-0.0043, 0.0019]; n=200; changed=8<br>F2 (pertinence): 0.0006 [-0.0024, 0.0036]; n=200; changed=11<br>F3 (interpret): 0.0013 [-0.0013, 0.0038]; n=200; changed=11 |
| A/people/outcome:unfinished | 0.0005 [-0.0022, 0.0031]; n=200 | F1 (interpret): 0.0002 [-0.0001, 0.0005]; n=200; changed=7<br>F2 (pertinence): 0.0008 [-0.0020, 0.0035]; n=200; changed=10<br>F3 (interpret): 0.0011 [-0.0004, 0.0026]; n=200; changed=7 |
| A/people/receipts | -0.0100 [-0.0442, 0.0242]; n=200 | F1 (interpret): -0.0150 [-0.0411, 0.0111]; n=200; changed=7<br>F2 (pertinence): 0 [-0.0242, 0.0242]; n=200; changed=6<br>F3 (interpret): -0.0050 [-0.0312, 0.0212]; n=200; changed=7 |
| A/people/stabilized | 0.0050 [-0.0278, 0.0378]; n=200 | F1 (interpret): -0.0100 [-0.0379, 0.0179]; n=200; changed=8<br>F2 (pertinence): 0.0150 [-0.0070, 0.0370]; n=200; changed=5<br>F3 (interpret): 0.0150 [-0.0070, 0.0370]; n=200; changed=5 |
| B/body/action:fight | 0.0017 [-0.0003, 0.0037]; n=200 | F1 (interpret): 0.0008 [-0.0008, 0.0025]; n=200; changed=4<br>F2 (pertinence): 0.0008 [-0.0008, 0.0025]; n=200; changed=4<br>F3 (interpret): 0.0013 [-0.0002, 0.0027]; n=200; changed=3 |
| B/body/action:steal | -0.0012 [-0.0037, 0.0012]; n=200 | F1 (interpret): -0.0017 [-0.0043, 0.0009]; n=200; changed=10<br>F2 (pertinence): -0.0004 [-0.0023, 0.0014]; n=200; changed=5<br>F3 (interpret): -4.163e-19 [-0.0020, 0.0020]; n=200; changed=6 |
| B/body/censored | -0.0050 [-0.0635, 0.0535]; n=200 | F1 (interpret): -0.0050 [-0.0458, 0.0358]; n=200; changed=17<br>F2 (pertinence): -0.0100 [-0.0584, 0.0384]; n=200; changed=24<br>F3 (interpret): 0 [-0.0280, 0.0280]; n=200; changed=8 |
| B/body/learning-epochs | -0.1324 [-0.5187, 0.2540]; n=68 | F1 (interpret): -0.1231 [-0.4529, 0.2067]; n=65; changed=5<br>F2 (pertinence): -0.1940 [-0.4957, 0.1076]; n=67; changed=5 |
| B/body/outcome:bad | 0.0118 [-0.0020, 0.0255]; n=187 | F1 (interpret): 0.0013 [-0.0074, 0.0100]; n=187; changed=6<br>F2 (pertinence): 0.0093 [-0.0032, 0.0217]; n=187; changed=7<br>F3 (interpret): 0.0049 [-0.0013, 0.0111]; n=186; changed=3 |
| B/body/outcome:good | -0.0133 [-0.0273, 0.0008]; n=187 | F1 (interpret): 2.969e-19 [-0.0083, 0.0083]; n=187; changed=5<br>F2 (pertinence): -0.0121 [-0.0252, 0.0009]; n=187; changed=9<br>F3 (interpret): -0.0036 [-0.0092, 0.0020]; n=186; changed=2 |
| B/body/outcome:unfinished | 0.0015 [-0.0047, 0.0077]; n=187 | F1 (interpret): -0.0013 [-0.0040, 0.0013]; n=187; changed=1<br>F2 (pertinence): 0.0029 [-0.0027, 0.0084]; n=187; changed=4<br>F3 (interpret): -0.0013 [-0.0040, 0.0013]; n=186; changed=1 |
| B/body/receipts | 0.0050 [-0.0247, 0.0347]; n=200 | F1 (interpret): -0.0100 [-0.0412, 0.0212]; n=200; changed=10<br>F2 (pertinence): 0.0050 [-0.0171, 0.0271]; n=200; changed=5<br>F3 (interpret): 0.0150 [-0.0020, 0.0320]; n=200; changed=3 |
| B/body/stabilized | 0.0050 [-0.0535, 0.0635]; n=200 | F1 (interpret): 0 [-0.0420, 0.0420]; n=200; changed=18<br>F2 (pertinence): 0.0100 [-0.0384, 0.0584]; n=200; changed=24<br>F3 (interpret): 0.0050 [-0.0212, 0.0312]; n=200; changed=7 |
| B/people/action:ask | 0.0013 [-0.0006, 0.0031]; n=200 | F1 (interpret): 0 [-0.0012, 0.0012]; n=200; changed=2<br>F2 (pertinence): 0.0004 [-0.0010, 0.0018]; n=200; changed=3<br>F3 (interpret): 0.0004 [-0.0004, 0.0012]; n=200; changed=1 |
| B/people/action:break | 0.0008 [-0.0018, 0.0034]; n=200 | F1 (interpret): 0 [-0.0016, 0.0016]; n=200; changed=4<br>F2 (pertinence): 6.939e-20 [-0.0012, 0.0012]; n=200; changed=2<br>F3 (interpret): 0.0021 [-0.0006, 0.0048]; n=200; changed=11 |
| B/people/action:deceive | 0.0008 [-0.0020, 0.0037]; n=200 | F1 (interpret): 1.388e-19 [-0.0035, 0.0035]; n=200; changed=18<br>F2 (pertinence): -0.0004 [-0.0023, 0.0014]; n=200; changed=5<br>F3 (interpret): 0.0017 [-0.0009, 0.0043]; n=200; changed=10 |
| B/people/action:keep | 6.939e-20 [-0.0026, 0.0026]; n=200 | F1 (interpret): 0.0008 [-0.0012, 0.0028]; n=200; changed=6<br>F2 (pertinence): 0.0004 [-0.0010, 0.0018]; n=200; changed=3<br>F3 (interpret): -0.0025 [-0.0048, -0.0002]; n=200; changed=8 |
| B/people/action:leave | -0.0017 [-0.0040, 0.0007]; n=200 | F1 (interpret): -0.0013 [-0.0031, 0.0006]; n=200; changed=5<br>F2 (pertinence): -6.939e-20 [-0.0016, 0.0016]; n=200; changed=4<br>F3 (interpret): -0.0004 [-0.0012, 0.0004]; n=200; changed=1 |
| B/people/action:trade | -0.0008 [-0.0034, 0.0018]; n=200 | F1 (interpret): 0.0013 [-0.0009, 0.0034]; n=200; changed=7<br>F2 (pertinence): 0.0004 [-0.0018, 0.0026]; n=200; changed=7<br>F3 (interpret): -0.0004 [-0.0012, 0.0004]; n=200; changed=1 |
| B/people/action:wait | -6.939e-20 [-0.0016, 0.0016]; n=200 | F1 (interpret): -0.0008 [-0.0020, 0.0003]; n=200; changed=2<br>F2 (pertinence): -0.0004 [-0.0012, 0.0004]; n=200; changed=1<br>F3 (interpret): 0.0008 [-0.0008, 0.0025]; n=200; changed=4 |
| B/people/action:work | -0.0008 [-0.0037, 0.0020]; n=200 | F1 (interpret): 0.0008 [-0.0027, 0.0043]; n=200; changed=15<br>F2 (pertinence): -0.0008 [-0.0028, 0.0012]; n=200; changed=6<br>F3 (interpret): -0.0029 [-0.0051, -0.0008]; n=200; changed=7 |
| B/people/censored | -0.0050 [-0.0407, 0.0307]; n=200 | F1 (interpret): 0.0100 [-0.0242, 0.0442]; n=200; changed=12<br>F2 (pertinence): -0.0050 [-0.0347, 0.0247]; n=200; changed=9<br>F3 (interpret): 0.0050 [-0.0171, 0.0271]; n=200; changed=5<br>F12 (interpret): -0.0050 [-0.0149, 0.0049]; n=200; changed=1 |
| B/people/learning-epochs | -0.1667 [-1.8482, 1.5149]; n=6 | F1 (interpret): -1.6000 [-3.0160, -0.1840]; n=5; changed=4<br>F2 (pertinence): -0.1667 [-0.5952, 0.2618]; n=6; changed=1<br>F3 (interpret): -0.5000 [-1.7855, 0.7855]; n=6; changed=1 |
| B/people/outcome:bad | 0.0008 [-0.0039, 0.0054]; n=200 | F1 (interpret): 0.0023 [-0.0011, 0.0058]; n=200; changed=18<br>F2 (pertinence): 0.0005 [-0.0034, 0.0043]; n=200; changed=15<br>F3 (interpret): 0.0009 [-0.0024, 0.0042]; n=200; changed=11 |
| B/people/outcome:good | -0.0012 [-0.0048, 0.0024]; n=200 | F1 (interpret): -0.0033 [-0.0068, 0.0003]; n=200; changed=15<br>F2 (pertinence): -0.0004 [-0.0032, 0.0024]; n=200; changed=11<br>F3 (interpret): -0.0014 [-0.0044, 0.0016]; n=200; changed=9 |
| B/people/outcome:unfinished | 0.0005 [-0.0032, 0.0041]; n=200 | F1 (interpret): 0.0009 [-0.0015, 0.0033]; n=200; changed=12<br>F2 (pertinence): -0.0001 [-0.0030, 0.0028]; n=200; changed=9<br>F3 (interpret): 0.0005 [-0.0021, 0.0030]; n=200; changed=7 |
| B/people/receipts | -0.0050 [-0.0347, 0.0247]; n=200 | F1 (interpret): 0.0100 [-0.0212, 0.0412]; n=200; changed=10<br>F2 (pertinence): -0.0050 [-0.0271, 0.0171]; n=200; changed=5<br>F3 (interpret): -0.0150 [-0.0320, 0.0020]; n=200; changed=3 |
| B/people/stabilized | 0.0050 [-0.0307, 0.0407]; n=200 | F1 (interpret): -0.0100 [-0.0442, 0.0242]; n=200; changed=12<br>F2 (pertinence): 0.0050 [-0.0247, 0.0347]; n=200; changed=9<br>F3 (interpret): -0.0050 [-0.0271, 0.0171]; n=200; changed=5<br>F12 (interpret): 0.0050 [-0.0049, 0.0149]; n=200; changed=1 |
| O/body/action:confront | -0.0017 [-0.0077, 0.0044]; n=200 | F1 (interpret): -0.0013 [-0.0055, 0.0030]; n=200; changed=22<br>F2 (pertinence): -0.0013 [-0.0057, 0.0032]; n=200; changed=24<br>F3 (interpret): -0.0013 [-0.0054, 0.0029]; n=200; changed=20<br>F4 (learning, pertinence): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F5 (learning): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F6 (pertinence, interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F7 (interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F8 (learning): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F9 (generate): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F10 (generate): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F11 (generate): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F12 (interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F13 (interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2 |
| O/body/censored | -0.0550 [-0.1147, 0.0047]; n=200 | F1 (interpret): -0.0400 [-0.0860, 0.0060]; n=200; changed=22<br>F2 (pertinence): 0.0050 [-0.0444, 0.0544]; n=200; changed=25<br>F3 (interpret): 0.0150 [-0.0146, 0.0446]; n=200; changed=9 |
| O/body/informative | 0.0100 [-0.0212, 0.0412]; n=200 | F1 (interpret): -0.0050 [-0.0312, 0.0212]; n=200; changed=7<br>F2 (pertinence): 0.0100 [-0.0142, 0.0342]; n=200; changed=6<br>F3 (interpret): 0 [-0.0242, 0.0242]; n=200; changed=6 |
| O/body/learning-epochs | -0.0833 [-0.8963, 0.7296]; n=24 | F1 (interpret): 0.1667 [-0.1810, 0.5143]; n=24; changed=1<br>F2 (pertinence): 0.0870 [-0.0944, 0.2683]; n=23; changed=1<br>F3 (interpret): -0.3333 [-1.0287, 0.3620]; n=24; changed=1 |
| O/body/outcome:bad | 0.0012 [-0.0152, 0.0175]; n=142 | F1 (interpret): -0.0024 [-0.0098, 0.0051]; n=141; changed=2<br>F2 (pertinence): -0.0024 [-0.0098, 0.0051]; n=141; changed=2<br>F3 (interpret): -0.0024 [-0.0070, 0.0023]; n=141; changed=1 |
| O/body/outcome:good | -0.0012 [-0.0175, 0.0152]; n=142 | F1 (interpret): 0.0024 [-0.0051, 0.0098]; n=141; changed=2<br>F2 (pertinence): 0.0024 [-0.0051, 0.0098]; n=141; changed=2<br>F3 (interpret): 0.0024 [-0.0023, 0.0070]; n=141; changed=1 |
| O/body/receipts | -0.0200 [-0.0926, 0.0526]; n=200 | F1 (interpret): -0.0150 [-0.0663, 0.0363]; n=200; changed=21<br>F2 (pertinence): -0.0150 [-0.0682, 0.0382]; n=200; changed=23<br>F3 (interpret): -0.0150 [-0.0644, 0.0344]; n=200; changed=19 |
| O/body/stabilized | 0.0650 [0.0089, 0.1211]; n=200 | F1 (interpret): 0.0350 [-0.0055, 0.0755]; n=200; changed=17<br>F2 (pertinence): 0.0050 [-0.0424, 0.0524]; n=200; changed=23<br>F3 (interpret): -0.0150 [-0.0477, 0.0177]; n=200; changed=11 |
| O/people/action:accept_promise | -0.0104 [-0.0162, -0.0046]; n=200 | F1 (interpret): -0.0004 [-0.0047, 0.0039]; n=200; changed=21<br>F2 (pertinence): -0.0042 [-0.0083, -4.932e-6]; n=200; changed=20<br>F3 (interpret): -0.0004 [-0.0031, 0.0023]; n=200; changed=11 |
| O/people/action:accept_trade | -0.0008 [-0.0056, 0.0040]; n=200 | F1 (interpret): -0.0017 [-0.0053, 0.0020]; n=200; changed=15<br>F2 (pertinence): 0.0029 [-0.0012, 0.0070]; n=200; changed=19<br>F3 (interpret): -0.0046 [-0.0075, -0.0017]; n=200; changed=14<br>F4 (learning, pertinence): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F5 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F6 (pertinence, interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F7 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F8 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F9 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F10 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F11 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F12 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F13 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1 |
| O/people/action:accept_work | 0.0071 [0.0019, 0.0123]; n=200 | F1 (interpret): 0.0033 [-0.0001, 0.0068]; n=200; changed=15<br>F2 (pertinence): -2.776e-19 [-0.0045, 0.0045]; n=200; changed=24<br>F3 (interpret): 0.0050 [0.0020, 0.0080]; n=200; changed=14 |
| O/people/action:chase | 0.0092 [0.0030, 0.0153]; n=200 | F1 (interpret): 0.0017 [-0.0030, 0.0063]; n=200; changed=23<br>F2 (pertinence): -1.249e-18 [-0.0044, 0.0044]; n=200; changed=26<br>F3 (interpret): 0.0071 [0.0029, 0.0112]; n=200; changed=21<br>F4 (learning, pertinence): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F5 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F6 (pertinence, interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F7 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F8 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F9 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F10 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F11 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F12 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F13 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1 |
| O/people/action:give | -0.0025 [-0.0070, 0.0020]; n=200 | F1 (interpret): -0.0008 [-0.0037, 0.0020]; n=200; changed=12<br>F2 (pertinence): 0.0025 [-0.0010, 0.0060]; n=200; changed=18<br>F3 (interpret): -0.0038 [-0.0067, -0.0008]; n=200; changed=13 |
| O/people/action:let_go | -0.0092 [-0.0145, -0.0039]; n=200 | F1 (interpret): -0.0017 [-0.0055, 0.0022]; n=200; changed=16<br>F2 (pertinence): -0.0004 [-0.0049, 0.0040]; n=200; changed=23<br>F3 (interpret): -0.0075 [-0.0122, -0.0028]; n=200; changed=20 |
| O/people/action:pay | 0.0037 [-0.0027, 0.0102]; n=200 | F1 (interpret): -0.0033 [-0.0080, 0.0013]; n=200; changed=27<br>F2 (pertinence): 0.0038 [-0.0011, 0.0086]; n=200; changed=26<br>F3 (interpret): -0.0067 [-0.0109, -0.0024]; n=200; changed=30<br>F4 (learning, pertinence): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F5 (learning): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F6 (pertinence, interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F7 (interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F8 (learning): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F9 (generate): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F10 (generate): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F11 (generate): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F12 (interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F13 (interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2 |
| O/people/action:refuse | 0.0033 [-0.0013, 0.0080]; n=200 | F1 (interpret): 0.0012 [-0.0021, 0.0046]; n=200; changed=17<br>F2 (pertinence): -0.0013 [-0.0048, 0.0023]; n=200; changed=16<br>F3 (interpret): 0.0037 [0.0008, 0.0067]; n=200; changed=13 |
| O/people/action:renege | 1.388e-19 [-0.0074, 0.0074]; n=200 | F1 (interpret): 0.0029 [-0.0013, 0.0072]; n=200; changed=25<br>F2 (pertinence): -0.0029 [-0.0086, 0.0027]; n=200; changed=30<br>F3 (interpret): 0.0058 [0.0010, 0.0107]; n=200; changed=28<br>F4 (learning, pertinence): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F5 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F6 (pertinence, interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F7 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F8 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F9 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F10 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F11 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F12 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F13 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1 |
| O/people/action:wait | 0.0013 [-0.0009, 0.0034]; n=200 | F1 (interpret): 0 [-0.0012, 0.0012]; n=200; changed=2<br>F2 (pertinence): 0.0008 [-0.0008, 0.0025]; n=200; changed=4<br>F3 (interpret): 0.0025 [0.0002, 0.0048]; n=200; changed=8 |
| O/people/outcome:bad | 0.0005 [-0.0061, 0.0070]; n=200 | F1 (interpret): -0.0016 [-0.0051, 0.0019]; n=200; changed=27<br>F2 (pertinence): 0.0015 [-0.0038, 0.0069]; n=200; changed=29<br>F3 (interpret): -0.0028 [-0.0078, 0.0021]; n=200; changed=31 |
| O/people/outcome:good | -0.0008 [-0.0070, 0.0054]; n=200 | F1 (interpret): 0.0012 [-0.0025, 0.0049]; n=200; changed=26<br>F2 (pertinence): -0.0020 [-0.0068, 0.0029]; n=200; changed=26<br>F3 (interpret): 0.0027 [-0.0022, 0.0077]; n=200; changed=30 |
| O/people/outcome:unfinished | 0.0003 [-0.0013, 0.0020]; n=200 | F1 (interpret): 0.0004 [-0.0006, 0.0013]; n=200; changed=3<br>F2 (pertinence): 0.0004 [-0.0012, 0.0021]; n=200; changed=6<br>F3 (interpret): 0.0001 [-0.0011, 0.0013]; n=200; changed=3 |
| O/people/receipts | 0.0200 [-0.0526, 0.0926]; n=200 | F1 (interpret): 0.0150 [-0.0363, 0.0663]; n=200; changed=21<br>F2 (pertinence): 0.0150 [-0.0382, 0.0682]; n=200; changed=23<br>F3 (interpret): 0.0150 [-0.0344, 0.0644]; n=200; changed=19 |

### v1/ESTP minus null

| Metric | Paired difference [95% interval]; pairs | Formula-off interventions |
|---|---|---|
| A/body/action:fight | 0.0008 [-0.0012, 0.0028]; n=200 | F2 (pertinence): -6.939e-20 [-0.0012, 0.0012]; n=200; changed=2<br>F3 (interpret): 0.0013 [-0.0002, 0.0027]; n=200; changed=3 |
| A/body/action:steal | 0.0008 [-0.0012, 0.0028]; n=200 | F2 (pertinence): 0.0017 [3.494e-5, 0.0033]; n=200; changed=4<br>F3 (interpret): -0.0008 [-0.0020, 0.0003]; n=200; changed=2 |
| A/body/censored | -0.0050 [-0.0564, 0.0464]; n=200 | F2 (pertinence): 0.0050 [-0.0444, 0.0544]; n=200; changed=25<br>F3 (interpret): 0.0100 [-0.0212, 0.0412]; n=200; changed=10 |
| A/body/learning-epochs | 0.0400 [-0.2696, 0.3496]; n=75 | F2 (pertinence): 0.1081 [-0.1964, 0.4127]; n=74; changed=16 |
| A/body/outcome:bad | -0.0071 [-0.0248, 0.0106]; n=184 | F2 (pertinence): -0.0052 [-0.0134, 0.0031]; n=184; changed=5<br>F3 (interpret): -0.0054 [-0.0221, 0.0112]; n=184; changed=5 |
| A/body/outcome:good | 0.0023 [-0.0150, 0.0195]; n=184 | F2 (pertinence): 0.0004 [-0.0068, 0.0076]; n=184; changed=4<br>F3 (interpret): 0.0054 [-0.0112, 0.0221]; n=184; changed=5 |
| A/body/outcome:unfinished | 0.0048 [-0.0017, 0.0113]; n=184 | F2 (pertinence): 0.0048 [-0.0017, 0.0113]; n=184; changed=3 |
| A/body/receipts | 0.0200 [-0.0078, 0.0478]; n=200 | F2 (pertinence): 0.0200 [-0.0041, 0.0441]; n=200; changed=6<br>F3 (interpret): 0.0050 [-0.0121, 0.0221]; n=200; changed=3 |
| A/body/stabilized | 0.0050 [-0.0464, 0.0564]; n=200 | F2 (pertinence): -0.0050 [-0.0544, 0.0444]; n=200; changed=25<br>F3 (interpret): -0.0100 [-0.0412, 0.0212]; n=200; changed=10 |
| A/people/action:ask | -0.0017 [-0.0033, -3.494e-5]; n=200 | F3 (interpret): -0.0017 [-0.0033, -3.494e-5]; n=200; changed=4 |
| A/people/action:break | -0.0013 [-0.0034, 0.0009]; n=200 | F2 (pertinence): -0.0008 [-0.0020, 0.0003]; n=200; changed=2<br>F3 (interpret): -0.0008 [-0.0028, 0.0012]; n=200; changed=6 |
| A/people/action:deceive | -0.0013 [-0.0034, 0.0009]; n=200 | F2 (pertinence): -0.0017 [-0.0033, -3.494e-5]; n=200; changed=4<br>F3 (interpret): 0 [-0.0023, 0.0023]; n=200; changed=5 |
| A/people/action:keep | 0.0013 [-0.0015, 0.0040]; n=200 | F2 (pertinence): 0.0017 [3.494e-5, 0.0033]; n=200; changed=4<br>F3 (interpret): -2.776e-19 [-0.0023, 0.0023]; n=200; changed=8 |
| A/people/action:leave | 0 [-0.0023, 0.0023]; n=200 | F2 (pertinence): -0.0008 [-0.0025, 0.0008]; n=200; changed=4<br>F3 (interpret): 0.0008 [-0.0008, 0.0025]; n=200; changed=4 |
| A/people/action:trade | 0.0013 [-0.0009, 0.0034]; n=200 | F3 (interpret): 0.0012 [-0.0009, 0.0034]; n=200; changed=7 |
| A/people/action:wait | -0.0008 [-0.0020, 0.0003]; n=200 | F3 (interpret): -0.0008 [-0.0020, 0.0003]; n=200; changed=2 |
| A/people/action:work | 0.0008 [-0.0012, 0.0028]; n=200 | F3 (interpret): 0.0008 [-0.0018, 0.0034]; n=200; changed=7 |
| A/people/censored | -0.0350 [-0.0674, -0.0026]; n=200 | F2 (pertinence): -0.0250 [-0.0509, 0.0009]; n=200; changed=7<br>F3 (interpret): -0.0250 [-0.0509, 0.0009]; n=200; changed=7 |
| A/people/outcome:bad | 0.0041 [-0.0003, 0.0086]; n=200 | F2 (pertinence): 0.0006 [-0.0019, 0.0032]; n=200; changed=10<br>F3 (interpret): 0.0031 [-0.0006, 0.0068]; n=200; changed=8 |
| A/people/outcome:good | -0.0018 [-0.0057, 0.0020]; n=200 | F2 (pertinence): -0.0001 [-0.0030, 0.0027]; n=200; changed=7<br>F3 (interpret): -0.0020 [-0.0054, 0.0013]; n=200; changed=9 |
| A/people/outcome:unfinished | -0.0023 [-0.0045, -0.0001]; n=200 | F2 (pertinence): -0.0005 [-0.0027, 0.0017]; n=200; changed=7<br>F3 (interpret): -0.0011 [-0.0025, 0.0004]; n=200; changed=4 |
| A/people/receipts | -0.0200 [-0.0478, 0.0078]; n=200 | F2 (pertinence): -0.0200 [-0.0441, 0.0041]; n=200; changed=6<br>F3 (interpret): -0.0050 [-0.0221, 0.0121]; n=200; changed=3 |
| A/people/stabilized | 0.0350 [0.0026, 0.0674]; n=200 | F2 (pertinence): 0.0250 [-0.0009, 0.0509]; n=200; changed=7<br>F3 (interpret): 0.0250 [-0.0009, 0.0509]; n=200; changed=7 |
| B/body/action:fight | 0.0017 [-0.0009, 0.0043]; n=200 | F1 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F2 (pertinence): 0.0012 [-0.0012, 0.0037]; n=200; changed=6<br>F3 (interpret): 0.0013 [-0.0002, 0.0027]; n=200; changed=4<br>F4 (learning, pertinence): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F5 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F6 (pertinence, interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F7 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F8 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F9 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F10 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F11 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F12 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F13 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1 |
| B/body/action:steal | -0.0017 [-0.0043, 0.0009]; n=200 | F2 (pertinence): -0.0021 [-0.0042, 0.0001]; n=200; changed=7<br>F3 (interpret): -0.0004 [-0.0023, 0.0014]; n=200; changed=5 |
| B/body/censored | 0 [-0.0420, 0.0420]; n=200 | F2 (pertinence): -0.0100 [-0.0519, 0.0319]; n=200; changed=18<br>F3 (interpret): 0.0050 [-0.0121, 0.0221]; n=200; changed=3 |
| B/body/informative | 0 [-0.0140, 0.0140]; n=200 | F2 (pertinence): -0.0050 [-0.0149, 0.0049]; n=200; changed=1<br>F3 (interpret): 0 [-0.0140, 0.0140]; n=200; changed=2 |
| B/body/learning-epochs | -0.1039 [-0.3246, 0.1168]; n=77 | F2 (pertinence): 0.0263 [-0.2278, 0.2805]; n=76; changed=13<br>F3 (interpret): -0.0519 [-0.1559, 0.0520]; n=77; changed=1 |
| B/body/outcome:bad | -0.0020 [-0.0088, 0.0049]; n=186 | F2 (pertinence): -0.0038 [-0.0115, 0.0040]; n=186; changed=6 |
| B/body/outcome:good | 0.0020 [-0.0049, 0.0088]; n=186 | F2 (pertinence): 0.0048 [-0.0032, 0.0128]; n=186; changed=7 |
| B/body/receipts | 0 [-0.0343, 0.0343]; n=200 | F2 (pertinence): -0.0100 [-0.0379, 0.0179]; n=200; changed=8<br>F3 (interpret): 0.0100 [-0.0142, 0.0342]; n=200; changed=6 |
| B/body/stabilized | 0 [-0.0396, 0.0396]; n=200 | F2 (pertinence): 0.0050 [-0.0358, 0.0458]; n=200; changed=17<br>F3 (interpret): -0.0050 [-0.0221, 0.0121]; n=200; changed=3 |
| B/people/action:ask | -0.0008 [-0.0020, 0.0003]; n=200 | F2 (pertinence): -0.0004 [-0.0012, 0.0004]; n=200; changed=1<br>F3 (interpret): -0.0004 [-0.0012, 0.0004]; n=200; changed=1 |
| B/people/action:break | -0.0021 [-0.0045, 0.0004]; n=200 | F2 (pertinence): 0.0004 [-0.0004, 0.0012]; n=200; changed=1<br>F3 (interpret): -0.0021 [-0.0048, 0.0006]; n=200; changed=11 |
| B/people/action:deceive | -0.0021 [-0.0057, 0.0015]; n=200 | F2 (pertinence): 0.0017 [-0.0003, 0.0037]; n=200; changed=6<br>F3 (interpret): -0.0029 [-0.0061, 0.0002]; n=200; changed=12 |
| B/people/action:keep | 0.0033 [0.0008, 0.0059]; n=200 | F1 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F2 (pertinence): 0.0004 [-0.0010, 0.0018]; n=200; changed=3<br>F3 (interpret): 0.0025 [0.0002, 0.0048]; n=200; changed=8<br>F4 (learning, pertinence): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F5 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F6 (pertinence, interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F7 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F8 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F9 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F10 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F11 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F12 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F13 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1 |
| B/people/action:leave | -0.0017 [-0.0040, 0.0007]; n=200 | F2 (pertinence): -0.0017 [-0.0037, 0.0003]; n=200; changed=6<br>F3 (interpret): 0 [-0.0016, 0.0016]; n=200; changed=4 |
| B/people/action:trade | 0.0013 [-0.0006, 0.0031]; n=200 | F2 (pertinence): 0.0013 [-0.0002, 0.0027]; n=200; changed=3<br>F3 (interpret): 0.0004 [-0.0004, 0.0012]; n=200; changed=1 |
| B/people/action:wait | -0.0008 [-0.0020, 0.0003]; n=200 | F3 (interpret): -0.0013 [-0.0027, 0.0002]; n=200; changed=3 |
| B/people/action:work | 0.0029 [-2.670e-5, 0.0059]; n=200 | F2 (pertinence): -0.0008 [-0.0025, 0.0008]; n=200; changed=4<br>F3 (interpret): 0.0029 [0.0005, 0.0054]; n=200; changed=9 |
| B/people/censored | -0.0250 [-0.0576, 0.0076]; n=200 | F2 (pertinence): -0.0100 [-0.0297, 0.0097]; n=200; changed=4<br>F3 (interpret): -0.0300 [-0.0610, 0.0010]; n=200; changed=10 |
| B/people/learning-epochs | 0.1111 [-0.1452, 0.3674]; n=9 | F2 (pertinence): 0.1111 [-0.1452, 0.3674]; n=9; changed=1 |
| B/people/outcome:bad | -0.0020 [-0.0058, 0.0018]; n=200 | F2 (pertinence): -0.0027 [-0.0063, 0.0008]; n=200; changed=15<br>F3 (interpret): -0.0002 [-0.0027, 0.0024]; n=200; changed=11 |
| B/people/outcome:good | 0.0007 [-0.0029, 0.0042]; n=200 | F2 (pertinence): 0.0008 [-0.0022, 0.0037]; n=200; changed=11<br>F3 (interpret): -0.0006 [-0.0028, 0.0015]; n=200; changed=9 |
| B/people/outcome:unfinished | 0.0013 [-0.0011, 0.0038]; n=200 | F2 (pertinence): 0.0019 [-0.0009, 0.0048]; n=200; changed=12<br>F3 (interpret): 0.0008 [-0.0005, 0.0021]; n=200; changed=7 |
| B/people/receipts | 0 [-0.0343, 0.0343]; n=200 | F2 (pertinence): 0.0100 [-0.0179, 0.0379]; n=200; changed=8<br>F3 (interpret): -0.0100 [-0.0342, 0.0142]; n=200; changed=6 |
| B/people/stabilized | 0.0250 [-0.0076, 0.0576]; n=200 | F2 (pertinence): 0.0100 [-0.0097, 0.0297]; n=200; changed=4<br>F3 (interpret): 0.0300 [-0.0010, 0.0610]; n=200; changed=10 |
| O/body/action:confront | 0.0012 [-0.0040, 0.0065]; n=200 | F1 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F2 (pertinence): 0.0021 [-0.0017, 0.0058]; n=200; changed=21<br>F3 (interpret): -0.0021 [-0.0057, 0.0015]; n=200; changed=16<br>F4 (learning, pertinence): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F5 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F6 (pertinence, interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F7 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F8 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F9 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F10 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F11 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F12 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F13 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1 |
| O/body/censored | -0.0200 [-0.0704, 0.0304]; n=200 | F2 (pertinence): -0.0100 [-0.0542, 0.0342]; n=200; changed=20<br>F3 (interpret): -0.0350 [-0.0643, -0.0057]; n=200; changed=9 |
| O/body/informative | -0.0050 [-0.0347, 0.0247]; n=200 | F2 (pertinence): -0.0050 [-0.0221, 0.0121]; n=200; changed=3<br>F3 (interpret): -0.0200 [-0.0441, 0.0041]; n=200; changed=6 |
| O/body/learning-epochs | -0.2800 [-0.6315, 0.0715]; n=25 | F2 (pertinence): -0.2800 [-0.6315, 0.0715]; n=25; changed=3<br>F3 (interpret): 0.0833 [-0.0905, 0.2572]; n=24; changed=1 |
| O/body/outcome:bad | 0.0047 [-0.0027, 0.0121]; n=141 | F2 (pertinence): 0.0047 [-0.0027, 0.0121]; n=141; changed=2 |
| O/body/outcome:good | -0.0047 [-0.0121, 0.0027]; n=141 | F2 (pertinence): -0.0047 [-0.0121, 0.0027]; n=141; changed=2 |
| O/body/receipts | 0.0150 [-0.0483, 0.0783]; n=200 | F2 (pertinence): 0.0250 [-0.0202, 0.0702]; n=200; changed=21<br>F3 (interpret): -0.0250 [-0.0680, 0.0180]; n=200; changed=16 |
| O/body/stabilized | 0.0150 [-0.0303, 0.0603]; n=200 | F2 (pertinence): 0.0050 [-0.0358, 0.0458]; n=200; changed=17<br>F3 (interpret): 0.0150 [-0.0070, 0.0370]; n=200; changed=5 |
| O/people/action:accept_promise | 0.0012 [-0.0033, 0.0058]; n=200 | F2 (pertinence): 0.0004 [-0.0030, 0.0038]; n=200; changed=14<br>F3 (interpret): 6.939e-20 [-0.0026, 0.0026]; n=200; changed=10 |
| O/people/action:accept_trade | 0.0037 [-0.0007, 0.0082]; n=200 | F2 (pertinence): -0.0008 [-0.0045, 0.0029]; n=200; changed=12<br>F3 (interpret): 0.0025 [-0.0013, 0.0063]; n=200; changed=16 |
| O/people/action:accept_work | -0.0062 [-0.0112, -0.0013]; n=200 | F2 (pertinence): -0.0021 [-0.0065, 0.0023]; n=200; changed=18<br>F3 (interpret): -0.0029 [-0.0063, 0.0005]; n=200; changed=14 |
| O/people/action:chase | -0.0054 [-0.0106, -0.0002]; n=200 | F2 (pertinence): 0.0017 [-0.0024, 0.0057]; n=200; changed=21<br>F3 (interpret): -0.0050 [-0.0091, -0.0009]; n=200; changed=20 |
| O/people/action:give | 0.0017 [-0.0030, 0.0063]; n=200 | F2 (pertinence): -0.0029 [-0.0063, 0.0005]; n=200; changed=14<br>F3 (interpret): 0.0037 [9.883e-6, 0.0075]; n=200; changed=21 |
| O/people/action:let_go | 0.0088 [0.0036, 0.0139]; n=200 | F1 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F2 (pertinence): -0.0017 [-0.0052, 0.0018]; n=200; changed=19<br>F3 (interpret): 0.0092 [0.0052, 0.0132]; n=200; changed=23<br>F4 (learning, pertinence): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F5 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F6 (pertinence, interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F7 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F8 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F9 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F10 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F11 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F12 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F13 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1 |
| O/people/action:pay | 0.0071 [0.0011, 0.0131]; n=200 | F1 (interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F2 (pertinence): 0.0042 [4.932e-6, 0.0083]; n=200; changed=24<br>F3 (interpret): 0.0037 [-0.0002, 0.0077]; n=200; changed=24<br>F4 (learning, pertinence): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F5 (learning): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F6 (pertinence, interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F7 (interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F8 (learning): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F9 (generate): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F10 (generate): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F11 (generate): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F12 (interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F13 (interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2 |
| O/people/action:refuse | -0.0021 [-0.0068, 0.0026]; n=200 | F2 (pertinence): 0.0042 [0.0009, 0.0074]; n=200; changed=13<br>F3 (interpret): -0.0038 [-0.0078, 0.0003]; n=200; changed=22 |
| O/people/action:renege | -0.0079 [-0.0137, -0.0021]; n=200 | F2 (pertinence): -0.0058 [-0.0106, -0.0011]; n=200; changed=28<br>F3 (interpret): -0.0029 [-0.0068, 0.0010]; n=200; changed=23 |
| O/people/action:wait | -0.0021 [-0.0042, 0.0001]; n=200 | F2 (pertinence): 0.0008 [-0.0003, 0.0020]; n=200; changed=2<br>F3 (interpret): -0.0025 [-0.0045, -0.0005]; n=200; changed=6 |
| O/people/outcome:bad | 0.0029 [-0.0030, 0.0088]; n=200 | F2 (pertinence): -0.0029 [-0.0067, 0.0009]; n=200; changed=26<br>F3 (interpret): 0.0046 [-0.0003, 0.0095]; n=200; changed=28 |
| O/people/outcome:good | -0.0029 [-0.0088, 0.0030]; n=200 | F2 (pertinence): 0.0033 [-0.0006, 0.0072]; n=200; changed=27<br>F3 (interpret): -0.0045 [-0.0094, 0.0004]; n=200; changed=27 |
| O/people/outcome:unfinished | -3.535e-5 [-0.0002, 0.0001]; n=200 | F2 (pertinence): -0.0005 [-0.0014, 0.0004]; n=200; changed=1<br>F3 (interpret): -0.0001 [-0.0002, 3.560e-5]; n=200; changed=2 |
| O/people/receipts | -0.0150 [-0.0783, 0.0483]; n=200 | F2 (pertinence): -0.0250 [-0.0702, 0.0202]; n=200; changed=21<br>F3 (interpret): 0.0250 [-0.0180, 0.0680]; n=200; changed=16 |

### v1/ISTP minus null

| Metric | Paired difference [95% interval]; pairs | Formula-off interventions |
|---|---|---|
| A/body/action:fight | 0.0021 [-0.0009, 0.0050]; n=200 | F1 (interpret): 0.0021 [-0.0004, 0.0045]; n=200; changed=9<br>F2 (pertinence): 0.0012 [-0.0009, 0.0034]; n=200; changed=7<br>F3 (interpret): 0.0004 [-0.0014, 0.0023]; n=200; changed=5 |
| A/body/action:steal | -0.0013 [-0.0042, 0.0017]; n=200 | F1 (interpret): -0.0008 [-0.0034, 0.0018]; n=200; changed=7<br>F2 (pertinence): -0.0013 [-0.0031, 0.0006]; n=200; changed=5<br>F3 (interpret): 2.082e-19 [-0.0023, 0.0023]; n=200; changed=8 |
| A/body/censored | -0.0300 [-0.0908, 0.0308]; n=200 | F1 (interpret): -0.0200 [-0.0704, 0.0304]; n=200; changed=26<br>F2 (pertinence): 0.0050 [-0.0403, 0.0503]; n=200; changed=21<br>F3 (interpret): 0.0150 [-0.0070, 0.0370]; n=200; changed=5 |
| A/body/informative | 0.0050 [-0.0049, 0.0149]; n=200 | F1 (interpret): 0.0050 [-0.0049, 0.0149]; n=200; changed=1 |
| A/body/learning-epochs | 0.5890 [0.2821, 0.8960]; n=73 | F1 (interpret): 0.2676 [0.0203, 0.5149]; n=71; changed=10<br>F2 (pertinence): 0.1972 [-0.1377, 0.5321]; n=71; changed=9<br>F3 (interpret): 0.0833 [-0.0834, 0.2501]; n=72; changed=1 |
| A/body/outcome:bad | 0.0066 [-0.0062, 0.0194]; n=184 | F1 (interpret): 0.0059 [-0.0060, 0.0178]; n=184; changed=4<br>F2 (pertinence): 0.0029 [-0.0018, 0.0076]; n=184; changed=4<br>F3 (interpret): 0.0032 [-0.0085, 0.0149]; n=184; changed=5 |
| A/body/outcome:good | -0.0055 [-0.0189, 0.0078]; n=184 | F1 (interpret): -0.0059 [-0.0178, 0.0060]; n=184; changed=4<br>F2 (pertinence): -0.0029 [-0.0076, 0.0018]; n=184; changed=4<br>F3 (interpret): -0.0021 [-0.0144, 0.0102]; n=184; changed=5 |
| A/body/outcome:unfinished | -0.0011 [-0.0032, 0.0011]; n=184 | F3 (interpret): -0.0011 [-0.0032, 0.0011]; n=184; changed=1 |
| A/body/receipts | 0.0100 [-0.0242, 0.0442]; n=200 | F1 (interpret): 0.0150 [-0.0111, 0.0411]; n=200; changed=7<br>F2 (pertinence): 0 [-0.0242, 0.0242]; n=200; changed=6<br>F3 (interpret): 0.0050 [-0.0212, 0.0312]; n=200; changed=7 |
| A/body/stabilized | 0.0350 [-0.0250, 0.0950]; n=200 | F1 (interpret): 0.0250 [-0.0243, 0.0743]; n=200; changed=25<br>F2 (pertinence): -0.0050 [-0.0503, 0.0403]; n=200; changed=21<br>F3 (interpret): -0.0150 [-0.0370, 0.0070]; n=200; changed=5 |
| A/people/action:ask | 0.0004 [-0.0021, 0.0029]; n=200 | F1 (interpret): -0.0004 [-0.0018, 0.0010]; n=200; changed=3<br>F2 (pertinence): -0.0013 [-0.0031, 0.0006]; n=200; changed=2<br>F3 (interpret): 0.0008 [-0.0003, 0.0020]; n=200; changed=2 |
| A/people/action:break | 0.0008 [-0.0015, 0.0032]; n=200 | F1 (interpret): -0.0008 [-0.0028, 0.0012]; n=200; changed=6<br>F2 (pertinence): -0.0004 [-0.0018, 0.0010]; n=200; changed=3<br>F3 (interpret): 0.0029 [0.0002, 0.0056]; n=200; changed=11 |
| A/people/action:deceive | 0.0013 [-0.0017, 0.0042]; n=200 | F1 (interpret): 0 [-0.0020, 0.0020]; n=200; changed=6<br>F2 (pertinence): -0.0004 [-0.0023, 0.0014]; n=200; changed=5<br>F3 (interpret): -0.0004 [-0.0029, 0.0021]; n=200; changed=9 |
| A/people/action:keep | -1.388e-19 [-0.0039, 0.0039]; n=200 | F1 (interpret): 0.0012 [-0.0015, 0.0040]; n=200; changed=11<br>F2 (pertinence): -0.0004 [-0.0031, 0.0023]; n=200; changed=11<br>F3 (interpret): -0.0017 [-0.0047, 0.0014]; n=200; changed=14 |
| A/people/action:leave | -0.0021 [-0.0058, 0.0017]; n=200 | F1 (interpret): -0.0021 [-0.0048, 0.0006]; n=200; changed=11<br>F2 (pertinence): 0.0008 [-0.0020, 0.0037]; n=200; changed=12<br>F3 (interpret): -0.0008 [-0.0028, 0.0012]; n=200; changed=6 |
| A/people/action:trade | -0.0008 [-0.0037, 0.0020]; n=200 | F1 (interpret): 0.0008 [-0.0012, 0.0028]; n=200; changed=6<br>F2 (pertinence): 0.0004 [-0.0018, 0.0026]; n=200; changed=4<br>F3 (interpret): -0.0008 [-0.0025, 0.0008]; n=200; changed=4 |
| A/people/action:work | -0.0004 [-0.0034, 0.0026]; n=200 | F1 (interpret): 0 [-0.0020, 0.0020]; n=200; changed=6<br>F2 (pertinence): 0.0013 [-0.0009, 0.0034]; n=200; changed=4<br>F3 (interpret): -0.0008 [-0.0028, 0.0012]; n=200; changed=7<br>F4 (learning, pertinence): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F5 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F6 (pertinence, interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F7 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F8 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F9 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F10 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F11 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F12 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F13 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1 |
| A/people/censored | -0.0050 [-0.0378, 0.0278]; n=200 | F1 (interpret): 0.0100 [-0.0179, 0.0379]; n=200; changed=8<br>F2 (pertinence): -0.0150 [-0.0370, 0.0070]; n=200; changed=5<br>F3 (interpret): -0.0150 [-0.0370, 0.0070]; n=200; changed=5 |
| A/people/outcome:bad | 0.0010 [-0.0025, 0.0045]; n=200 | F1 (interpret): 0.0010 [-0.0022, 0.0042]; n=200; changed=10<br>F2 (pertinence): -0.0014 [-0.0043, 0.0016]; n=200; changed=11<br>F3 (interpret): -0.0024 [-0.0055, 0.0007]; n=200; changed=10 |
| A/people/outcome:good | -0.0014 [-0.0051, 0.0022]; n=200 | F1 (interpret): -0.0012 [-0.0043, 0.0019]; n=200; changed=8<br>F2 (pertinence): 0.0006 [-0.0024, 0.0036]; n=200; changed=11<br>F3 (interpret): 0.0013 [-0.0013, 0.0038]; n=200; changed=11 |
| A/people/outcome:unfinished | 0.0005 [-0.0022, 0.0031]; n=200 | F1 (interpret): 0.0002 [-0.0001, 0.0005]; n=200; changed=7<br>F2 (pertinence): 0.0008 [-0.0020, 0.0035]; n=200; changed=10<br>F3 (interpret): 0.0011 [-0.0004, 0.0026]; n=200; changed=7 |
| A/people/receipts | -0.0100 [-0.0442, 0.0242]; n=200 | F1 (interpret): -0.0150 [-0.0411, 0.0111]; n=200; changed=7<br>F2 (pertinence): 0 [-0.0242, 0.0242]; n=200; changed=6<br>F3 (interpret): -0.0050 [-0.0312, 0.0212]; n=200; changed=7 |
| A/people/stabilized | 0.0050 [-0.0278, 0.0378]; n=200 | F1 (interpret): -0.0100 [-0.0379, 0.0179]; n=200; changed=8<br>F2 (pertinence): 0.0150 [-0.0070, 0.0370]; n=200; changed=5<br>F3 (interpret): 0.0150 [-0.0070, 0.0370]; n=200; changed=5 |
| B/body/action:fight | 0.0017 [-0.0003, 0.0037]; n=200 | F1 (interpret): 0.0008 [-0.0008, 0.0025]; n=200; changed=4<br>F2 (pertinence): 0.0008 [-0.0008, 0.0025]; n=200; changed=4<br>F3 (interpret): 0.0013 [-0.0002, 0.0027]; n=200; changed=3 |
| B/body/action:steal | -0.0012 [-0.0037, 0.0012]; n=200 | F1 (interpret): -0.0017 [-0.0043, 0.0009]; n=200; changed=10<br>F2 (pertinence): -0.0004 [-0.0023, 0.0014]; n=200; changed=5<br>F3 (interpret): -4.163e-19 [-0.0020, 0.0020]; n=200; changed=6 |
| B/body/censored | -0.0050 [-0.0635, 0.0535]; n=200 | F1 (interpret): -0.0050 [-0.0458, 0.0358]; n=200; changed=17<br>F2 (pertinence): -0.0100 [-0.0584, 0.0384]; n=200; changed=24<br>F3 (interpret): 0 [-0.0280, 0.0280]; n=200; changed=8 |
| B/body/learning-epochs | -0.1324 [-0.5187, 0.2540]; n=68 | F1 (interpret): -0.1231 [-0.4529, 0.2067]; n=65; changed=5<br>F2 (pertinence): -0.1940 [-0.4957, 0.1076]; n=67; changed=5 |
| B/body/outcome:bad | 0.0118 [-0.0020, 0.0255]; n=187 | F1 (interpret): 0.0013 [-0.0074, 0.0100]; n=187; changed=6<br>F2 (pertinence): 0.0093 [-0.0032, 0.0217]; n=187; changed=7<br>F3 (interpret): 0.0049 [-0.0013, 0.0111]; n=186; changed=3 |
| B/body/outcome:good | -0.0133 [-0.0273, 0.0008]; n=187 | F1 (interpret): 2.969e-19 [-0.0083, 0.0083]; n=187; changed=5<br>F2 (pertinence): -0.0121 [-0.0252, 0.0009]; n=187; changed=9<br>F3 (interpret): -0.0036 [-0.0092, 0.0020]; n=186; changed=2 |
| B/body/outcome:unfinished | 0.0015 [-0.0047, 0.0077]; n=187 | F1 (interpret): -0.0013 [-0.0040, 0.0013]; n=187; changed=1<br>F2 (pertinence): 0.0029 [-0.0027, 0.0084]; n=187; changed=4<br>F3 (interpret): -0.0013 [-0.0040, 0.0013]; n=186; changed=1 |
| B/body/receipts | 0.0050 [-0.0247, 0.0347]; n=200 | F1 (interpret): -0.0100 [-0.0412, 0.0212]; n=200; changed=10<br>F2 (pertinence): 0.0050 [-0.0171, 0.0271]; n=200; changed=5<br>F3 (interpret): 0.0150 [-0.0020, 0.0320]; n=200; changed=3 |
| B/body/stabilized | 0.0050 [-0.0535, 0.0635]; n=200 | F1 (interpret): 0 [-0.0420, 0.0420]; n=200; changed=18<br>F2 (pertinence): 0.0100 [-0.0384, 0.0584]; n=200; changed=24<br>F3 (interpret): 0.0050 [-0.0212, 0.0312]; n=200; changed=7 |
| B/people/action:ask | 0.0013 [-0.0006, 0.0031]; n=200 | F1 (interpret): 0 [-0.0012, 0.0012]; n=200; changed=2<br>F2 (pertinence): 0.0004 [-0.0010, 0.0018]; n=200; changed=3<br>F3 (interpret): 0.0004 [-0.0004, 0.0012]; n=200; changed=1 |
| B/people/action:break | 0.0008 [-0.0018, 0.0034]; n=200 | F1 (interpret): 0 [-0.0016, 0.0016]; n=200; changed=4<br>F2 (pertinence): 6.939e-20 [-0.0012, 0.0012]; n=200; changed=2<br>F3 (interpret): 0.0021 [-0.0006, 0.0048]; n=200; changed=11 |
| B/people/action:deceive | 0.0008 [-0.0020, 0.0037]; n=200 | F1 (interpret): 1.388e-19 [-0.0035, 0.0035]; n=200; changed=18<br>F2 (pertinence): -0.0004 [-0.0023, 0.0014]; n=200; changed=5<br>F3 (interpret): 0.0017 [-0.0009, 0.0043]; n=200; changed=10 |
| B/people/action:keep | 6.939e-20 [-0.0026, 0.0026]; n=200 | F1 (interpret): 0.0008 [-0.0012, 0.0028]; n=200; changed=6<br>F2 (pertinence): 0.0004 [-0.0010, 0.0018]; n=200; changed=3<br>F3 (interpret): -0.0025 [-0.0048, -0.0002]; n=200; changed=8 |
| B/people/action:leave | -0.0017 [-0.0040, 0.0007]; n=200 | F1 (interpret): -0.0013 [-0.0031, 0.0006]; n=200; changed=5<br>F2 (pertinence): -6.939e-20 [-0.0016, 0.0016]; n=200; changed=4<br>F3 (interpret): -0.0004 [-0.0012, 0.0004]; n=200; changed=1 |
| B/people/action:trade | -0.0008 [-0.0034, 0.0018]; n=200 | F1 (interpret): 0.0013 [-0.0009, 0.0034]; n=200; changed=7<br>F2 (pertinence): 0.0004 [-0.0018, 0.0026]; n=200; changed=7<br>F3 (interpret): -0.0004 [-0.0012, 0.0004]; n=200; changed=1 |
| B/people/action:wait | -6.939e-20 [-0.0016, 0.0016]; n=200 | F1 (interpret): -0.0008 [-0.0020, 0.0003]; n=200; changed=2<br>F2 (pertinence): -0.0004 [-0.0012, 0.0004]; n=200; changed=1<br>F3 (interpret): 0.0008 [-0.0008, 0.0025]; n=200; changed=4 |
| B/people/action:work | -0.0008 [-0.0037, 0.0020]; n=200 | F1 (interpret): 0.0008 [-0.0027, 0.0043]; n=200; changed=15<br>F2 (pertinence): -0.0008 [-0.0028, 0.0012]; n=200; changed=6<br>F3 (interpret): -0.0029 [-0.0051, -0.0008]; n=200; changed=7 |
| B/people/censored | -0.0050 [-0.0407, 0.0307]; n=200 | F1 (interpret): 0.0100 [-0.0242, 0.0442]; n=200; changed=12<br>F2 (pertinence): -0.0050 [-0.0347, 0.0247]; n=200; changed=9<br>F3 (interpret): 0.0050 [-0.0171, 0.0271]; n=200; changed=5<br>F12 (interpret): -0.0050 [-0.0149, 0.0049]; n=200; changed=1 |
| B/people/learning-epochs | -0.1667 [-1.8482, 1.5149]; n=6 | F1 (interpret): -1.6000 [-3.0160, -0.1840]; n=5; changed=4<br>F2 (pertinence): -0.1667 [-0.5952, 0.2618]; n=6; changed=1<br>F3 (interpret): -0.5000 [-1.7855, 0.7855]; n=6; changed=1 |
| B/people/outcome:bad | 0.0008 [-0.0039, 0.0054]; n=200 | F1 (interpret): 0.0023 [-0.0011, 0.0058]; n=200; changed=18<br>F2 (pertinence): 0.0005 [-0.0034, 0.0043]; n=200; changed=15<br>F3 (interpret): 0.0009 [-0.0024, 0.0042]; n=200; changed=11 |
| B/people/outcome:good | -0.0012 [-0.0048, 0.0024]; n=200 | F1 (interpret): -0.0033 [-0.0068, 0.0003]; n=200; changed=15<br>F2 (pertinence): -0.0004 [-0.0032, 0.0024]; n=200; changed=11<br>F3 (interpret): -0.0014 [-0.0044, 0.0016]; n=200; changed=9 |
| B/people/outcome:unfinished | 0.0005 [-0.0032, 0.0041]; n=200 | F1 (interpret): 0.0009 [-0.0015, 0.0033]; n=200; changed=12<br>F2 (pertinence): -0.0001 [-0.0030, 0.0028]; n=200; changed=9<br>F3 (interpret): 0.0005 [-0.0021, 0.0030]; n=200; changed=7 |
| B/people/receipts | -0.0050 [-0.0347, 0.0247]; n=200 | F1 (interpret): 0.0100 [-0.0212, 0.0412]; n=200; changed=10<br>F2 (pertinence): -0.0050 [-0.0271, 0.0171]; n=200; changed=5<br>F3 (interpret): -0.0150 [-0.0320, 0.0020]; n=200; changed=3 |
| B/people/stabilized | 0.0050 [-0.0307, 0.0407]; n=200 | F1 (interpret): -0.0100 [-0.0442, 0.0242]; n=200; changed=12<br>F2 (pertinence): 0.0050 [-0.0247, 0.0347]; n=200; changed=9<br>F3 (interpret): -0.0050 [-0.0271, 0.0171]; n=200; changed=5<br>F12 (interpret): 0.0050 [-0.0049, 0.0149]; n=200; changed=1 |
| O/body/action:confront | -0.0017 [-0.0077, 0.0044]; n=200 | F1 (interpret): -0.0013 [-0.0055, 0.0030]; n=200; changed=22<br>F2 (pertinence): -0.0013 [-0.0057, 0.0032]; n=200; changed=24<br>F3 (interpret): -0.0013 [-0.0054, 0.0029]; n=200; changed=20<br>F4 (learning, pertinence): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F5 (learning): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F6 (pertinence, interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F7 (interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F8 (learning): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F9 (generate): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F10 (generate): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F11 (generate): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F12 (interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F13 (interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2 |
| O/body/censored | -0.0550 [-0.1147, 0.0047]; n=200 | F1 (interpret): -0.0400 [-0.0860, 0.0060]; n=200; changed=22<br>F2 (pertinence): 0.0050 [-0.0444, 0.0544]; n=200; changed=25<br>F3 (interpret): 0.0150 [-0.0146, 0.0446]; n=200; changed=9 |
| O/body/informative | 0.0100 [-0.0212, 0.0412]; n=200 | F1 (interpret): -0.0050 [-0.0312, 0.0212]; n=200; changed=7<br>F2 (pertinence): 0.0100 [-0.0142, 0.0342]; n=200; changed=6<br>F3 (interpret): 0 [-0.0242, 0.0242]; n=200; changed=6 |
| O/body/learning-epochs | -0.0833 [-0.8963, 0.7296]; n=24 | F1 (interpret): 0.1667 [-0.1810, 0.5143]; n=24; changed=1<br>F2 (pertinence): 0.0870 [-0.0944, 0.2683]; n=23; changed=1<br>F3 (interpret): -0.3333 [-1.0287, 0.3620]; n=24; changed=1 |
| O/body/outcome:bad | 0.0012 [-0.0152, 0.0175]; n=142 | F1 (interpret): -0.0024 [-0.0098, 0.0051]; n=141; changed=2<br>F2 (pertinence): -0.0024 [-0.0098, 0.0051]; n=141; changed=2<br>F3 (interpret): -0.0024 [-0.0070, 0.0023]; n=141; changed=1 |
| O/body/outcome:good | -0.0012 [-0.0175, 0.0152]; n=142 | F1 (interpret): 0.0024 [-0.0051, 0.0098]; n=141; changed=2<br>F2 (pertinence): 0.0024 [-0.0051, 0.0098]; n=141; changed=2<br>F3 (interpret): 0.0024 [-0.0023, 0.0070]; n=141; changed=1 |
| O/body/receipts | -0.0200 [-0.0926, 0.0526]; n=200 | F1 (interpret): -0.0150 [-0.0663, 0.0363]; n=200; changed=21<br>F2 (pertinence): -0.0150 [-0.0682, 0.0382]; n=200; changed=23<br>F3 (interpret): -0.0150 [-0.0644, 0.0344]; n=200; changed=19 |
| O/body/stabilized | 0.0650 [0.0089, 0.1211]; n=200 | F1 (interpret): 0.0350 [-0.0055, 0.0755]; n=200; changed=17<br>F2 (pertinence): 0.0050 [-0.0424, 0.0524]; n=200; changed=23<br>F3 (interpret): -0.0150 [-0.0477, 0.0177]; n=200; changed=11 |
| O/people/action:accept_promise | -0.0104 [-0.0162, -0.0046]; n=200 | F1 (interpret): -0.0004 [-0.0047, 0.0039]; n=200; changed=21<br>F2 (pertinence): -0.0042 [-0.0083, -4.932e-6]; n=200; changed=20<br>F3 (interpret): -0.0004 [-0.0031, 0.0023]; n=200; changed=11 |
| O/people/action:accept_trade | -0.0008 [-0.0056, 0.0040]; n=200 | F1 (interpret): -0.0017 [-0.0053, 0.0020]; n=200; changed=15<br>F2 (pertinence): 0.0029 [-0.0012, 0.0070]; n=200; changed=19<br>F3 (interpret): -0.0046 [-0.0075, -0.0017]; n=200; changed=14<br>F4 (learning, pertinence): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F5 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F6 (pertinence, interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F7 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F8 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F9 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F10 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F11 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F12 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F13 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1 |
| O/people/action:accept_work | 0.0071 [0.0019, 0.0123]; n=200 | F1 (interpret): 0.0033 [-0.0001, 0.0068]; n=200; changed=15<br>F2 (pertinence): -2.776e-19 [-0.0045, 0.0045]; n=200; changed=24<br>F3 (interpret): 0.0050 [0.0020, 0.0080]; n=200; changed=14 |
| O/people/action:chase | 0.0092 [0.0030, 0.0153]; n=200 | F1 (interpret): 0.0017 [-0.0030, 0.0063]; n=200; changed=23<br>F2 (pertinence): -1.249e-18 [-0.0044, 0.0044]; n=200; changed=26<br>F3 (interpret): 0.0071 [0.0029, 0.0112]; n=200; changed=21<br>F4 (learning, pertinence): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F5 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F6 (pertinence, interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F7 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F8 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F9 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F10 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F11 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F12 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F13 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1 |
| O/people/action:give | -0.0025 [-0.0070, 0.0020]; n=200 | F1 (interpret): -0.0008 [-0.0037, 0.0020]; n=200; changed=12<br>F2 (pertinence): 0.0025 [-0.0010, 0.0060]; n=200; changed=18<br>F3 (interpret): -0.0038 [-0.0067, -0.0008]; n=200; changed=13 |
| O/people/action:let_go | -0.0092 [-0.0145, -0.0039]; n=200 | F1 (interpret): -0.0017 [-0.0055, 0.0022]; n=200; changed=16<br>F2 (pertinence): -0.0004 [-0.0049, 0.0040]; n=200; changed=23<br>F3 (interpret): -0.0075 [-0.0122, -0.0028]; n=200; changed=20 |
| O/people/action:pay | 0.0037 [-0.0027, 0.0102]; n=200 | F1 (interpret): -0.0033 [-0.0080, 0.0013]; n=200; changed=27<br>F2 (pertinence): 0.0038 [-0.0011, 0.0086]; n=200; changed=26<br>F3 (interpret): -0.0067 [-0.0109, -0.0024]; n=200; changed=30<br>F4 (learning, pertinence): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F5 (learning): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F6 (pertinence, interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F7 (interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F8 (learning): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F9 (generate): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F10 (generate): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F11 (generate): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F12 (interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F13 (interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2 |
| O/people/action:refuse | 0.0033 [-0.0013, 0.0080]; n=200 | F1 (interpret): 0.0012 [-0.0021, 0.0046]; n=200; changed=17<br>F2 (pertinence): -0.0013 [-0.0048, 0.0023]; n=200; changed=16<br>F3 (interpret): 0.0037 [0.0008, 0.0067]; n=200; changed=13 |
| O/people/action:renege | 1.388e-19 [-0.0074, 0.0074]; n=200 | F1 (interpret): 0.0029 [-0.0013, 0.0072]; n=200; changed=25<br>F2 (pertinence): -0.0029 [-0.0086, 0.0027]; n=200; changed=30<br>F3 (interpret): 0.0058 [0.0010, 0.0107]; n=200; changed=28<br>F4 (learning, pertinence): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F5 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F6 (pertinence, interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F7 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F8 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F9 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F10 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F11 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F12 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F13 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1 |
| O/people/action:wait | 0.0013 [-0.0009, 0.0034]; n=200 | F1 (interpret): 0 [-0.0012, 0.0012]; n=200; changed=2<br>F2 (pertinence): 0.0008 [-0.0008, 0.0025]; n=200; changed=4<br>F3 (interpret): 0.0025 [0.0002, 0.0048]; n=200; changed=8 |
| O/people/outcome:bad | 0.0005 [-0.0061, 0.0070]; n=200 | F1 (interpret): -0.0016 [-0.0051, 0.0019]; n=200; changed=27<br>F2 (pertinence): 0.0015 [-0.0038, 0.0069]; n=200; changed=29<br>F3 (interpret): -0.0028 [-0.0078, 0.0021]; n=200; changed=31 |
| O/people/outcome:good | -0.0008 [-0.0070, 0.0054]; n=200 | F1 (interpret): 0.0012 [-0.0025, 0.0049]; n=200; changed=26<br>F2 (pertinence): -0.0020 [-0.0068, 0.0029]; n=200; changed=26<br>F3 (interpret): 0.0027 [-0.0022, 0.0077]; n=200; changed=30 |
| O/people/outcome:unfinished | 0.0003 [-0.0013, 0.0020]; n=200 | F1 (interpret): 0.0004 [-0.0006, 0.0013]; n=200; changed=3<br>F2 (pertinence): 0.0004 [-0.0012, 0.0021]; n=200; changed=6<br>F3 (interpret): 0.0001 [-0.0011, 0.0013]; n=200; changed=3 |
| O/people/receipts | 0.0200 [-0.0526, 0.0926]; n=200 | F1 (interpret): 0.0150 [-0.0363, 0.0663]; n=200; changed=21<br>F2 (pertinence): 0.0150 [-0.0382, 0.0682]; n=200; changed=23<br>F3 (interpret): 0.0150 [-0.0344, 0.0644]; n=200; changed=19 |

### v1/ENFP minus null

| Metric | Paired difference [95% interval]; pairs | Formula-off interventions |
|---|---|---|
| A/body/action:fight | 0.0008 [-0.0012, 0.0028]; n=200 | F2 (pertinence): -6.939e-20 [-0.0012, 0.0012]; n=200; changed=2<br>F3 (interpret): 0.0013 [-0.0002, 0.0027]; n=200; changed=3 |
| A/body/action:steal | 0.0008 [-0.0012, 0.0028]; n=200 | F2 (pertinence): 0.0017 [3.494e-5, 0.0033]; n=200; changed=4<br>F3 (interpret): -0.0008 [-0.0020, 0.0003]; n=200; changed=2 |
| A/body/censored | -0.0050 [-0.0564, 0.0464]; n=200 | F2 (pertinence): 0.0050 [-0.0444, 0.0544]; n=200; changed=25<br>F3 (interpret): 0.0100 [-0.0212, 0.0412]; n=200; changed=10 |
| A/body/learning-epochs | 0.0400 [-0.2696, 0.3496]; n=75 | F2 (pertinence): 0.1081 [-0.1964, 0.4127]; n=74; changed=16 |
| A/body/outcome:bad | -0.0071 [-0.0248, 0.0106]; n=184 | F2 (pertinence): -0.0052 [-0.0134, 0.0031]; n=184; changed=5<br>F3 (interpret): -0.0054 [-0.0221, 0.0112]; n=184; changed=5 |
| A/body/outcome:good | 0.0023 [-0.0150, 0.0195]; n=184 | F2 (pertinence): 0.0004 [-0.0068, 0.0076]; n=184; changed=4<br>F3 (interpret): 0.0054 [-0.0112, 0.0221]; n=184; changed=5 |
| A/body/outcome:unfinished | 0.0048 [-0.0017, 0.0113]; n=184 | F2 (pertinence): 0.0048 [-0.0017, 0.0113]; n=184; changed=3 |
| A/body/receipts | 0.0200 [-0.0078, 0.0478]; n=200 | F2 (pertinence): 0.0200 [-0.0041, 0.0441]; n=200; changed=6<br>F3 (interpret): 0.0050 [-0.0121, 0.0221]; n=200; changed=3 |
| A/body/stabilized | 0.0050 [-0.0464, 0.0564]; n=200 | F2 (pertinence): -0.0050 [-0.0544, 0.0444]; n=200; changed=25<br>F3 (interpret): -0.0100 [-0.0412, 0.0212]; n=200; changed=10 |
| A/people/action:ask | -0.0017 [-0.0033, -3.494e-5]; n=200 | F3 (interpret): -0.0017 [-0.0033, -3.494e-5]; n=200; changed=4 |
| A/people/action:break | -0.0013 [-0.0034, 0.0009]; n=200 | F2 (pertinence): -0.0008 [-0.0020, 0.0003]; n=200; changed=2<br>F3 (interpret): -0.0008 [-0.0028, 0.0012]; n=200; changed=6 |
| A/people/action:deceive | -0.0013 [-0.0034, 0.0009]; n=200 | F2 (pertinence): -0.0017 [-0.0033, -3.494e-5]; n=200; changed=4<br>F3 (interpret): 0 [-0.0023, 0.0023]; n=200; changed=5 |
| A/people/action:keep | 0.0013 [-0.0015, 0.0040]; n=200 | F2 (pertinence): 0.0017 [3.494e-5, 0.0033]; n=200; changed=4<br>F3 (interpret): -2.776e-19 [-0.0023, 0.0023]; n=200; changed=8 |
| A/people/action:leave | 0 [-0.0023, 0.0023]; n=200 | F2 (pertinence): -0.0008 [-0.0025, 0.0008]; n=200; changed=4<br>F3 (interpret): 0.0008 [-0.0008, 0.0025]; n=200; changed=4 |
| A/people/action:trade | 0.0013 [-0.0009, 0.0034]; n=200 | F3 (interpret): 0.0012 [-0.0009, 0.0034]; n=200; changed=7 |
| A/people/action:wait | -0.0008 [-0.0020, 0.0003]; n=200 | F3 (interpret): -0.0008 [-0.0020, 0.0003]; n=200; changed=2 |
| A/people/action:work | 0.0008 [-0.0012, 0.0028]; n=200 | F3 (interpret): 0.0008 [-0.0018, 0.0034]; n=200; changed=7 |
| A/people/censored | -0.0350 [-0.0674, -0.0026]; n=200 | F2 (pertinence): -0.0250 [-0.0509, 0.0009]; n=200; changed=7<br>F3 (interpret): -0.0250 [-0.0509, 0.0009]; n=200; changed=7 |
| A/people/outcome:bad | 0.0041 [-0.0003, 0.0086]; n=200 | F2 (pertinence): 0.0006 [-0.0019, 0.0032]; n=200; changed=10<br>F3 (interpret): 0.0031 [-0.0006, 0.0068]; n=200; changed=8 |
| A/people/outcome:good | -0.0018 [-0.0057, 0.0020]; n=200 | F2 (pertinence): -0.0001 [-0.0030, 0.0027]; n=200; changed=7<br>F3 (interpret): -0.0020 [-0.0054, 0.0013]; n=200; changed=9 |
| A/people/outcome:unfinished | -0.0023 [-0.0045, -0.0001]; n=200 | F2 (pertinence): -0.0005 [-0.0027, 0.0017]; n=200; changed=7<br>F3 (interpret): -0.0011 [-0.0025, 0.0004]; n=200; changed=4 |
| A/people/receipts | -0.0200 [-0.0478, 0.0078]; n=200 | F2 (pertinence): -0.0200 [-0.0441, 0.0041]; n=200; changed=6<br>F3 (interpret): -0.0050 [-0.0221, 0.0121]; n=200; changed=3 |
| A/people/stabilized | 0.0350 [0.0026, 0.0674]; n=200 | F2 (pertinence): 0.0250 [-0.0009, 0.0509]; n=200; changed=7<br>F3 (interpret): 0.0250 [-0.0009, 0.0509]; n=200; changed=7 |
| B/body/action:fight | 0.0017 [-0.0009, 0.0043]; n=200 | F1 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F2 (pertinence): 0.0012 [-0.0012, 0.0037]; n=200; changed=6<br>F3 (interpret): 0.0013 [-0.0002, 0.0027]; n=200; changed=4<br>F4 (learning, pertinence): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F5 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F6 (pertinence, interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F7 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F8 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F9 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F10 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F11 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F12 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F13 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1 |
| B/body/action:steal | -0.0017 [-0.0043, 0.0009]; n=200 | F2 (pertinence): -0.0021 [-0.0042, 0.0001]; n=200; changed=7<br>F3 (interpret): -0.0004 [-0.0023, 0.0014]; n=200; changed=5 |
| B/body/censored | 0 [-0.0420, 0.0420]; n=200 | F2 (pertinence): -0.0100 [-0.0519, 0.0319]; n=200; changed=18<br>F3 (interpret): 0.0050 [-0.0121, 0.0221]; n=200; changed=3 |
| B/body/informative | 0 [-0.0140, 0.0140]; n=200 | F2 (pertinence): -0.0050 [-0.0149, 0.0049]; n=200; changed=1<br>F3 (interpret): 0 [-0.0140, 0.0140]; n=200; changed=2 |
| B/body/learning-epochs | -0.1039 [-0.3246, 0.1168]; n=77 | F2 (pertinence): 0.0263 [-0.2278, 0.2805]; n=76; changed=13<br>F3 (interpret): -0.0519 [-0.1559, 0.0520]; n=77; changed=1 |
| B/body/outcome:bad | -0.0020 [-0.0088, 0.0049]; n=186 | F2 (pertinence): -0.0038 [-0.0115, 0.0040]; n=186; changed=6 |
| B/body/outcome:good | 0.0020 [-0.0049, 0.0088]; n=186 | F2 (pertinence): 0.0048 [-0.0032, 0.0128]; n=186; changed=7 |
| B/body/receipts | 0 [-0.0343, 0.0343]; n=200 | F2 (pertinence): -0.0100 [-0.0379, 0.0179]; n=200; changed=8<br>F3 (interpret): 0.0100 [-0.0142, 0.0342]; n=200; changed=6 |
| B/body/stabilized | 0 [-0.0396, 0.0396]; n=200 | F2 (pertinence): 0.0050 [-0.0358, 0.0458]; n=200; changed=17<br>F3 (interpret): -0.0050 [-0.0221, 0.0121]; n=200; changed=3 |
| B/people/action:ask | -0.0008 [-0.0020, 0.0003]; n=200 | F2 (pertinence): -0.0004 [-0.0012, 0.0004]; n=200; changed=1<br>F3 (interpret): -0.0004 [-0.0012, 0.0004]; n=200; changed=1 |
| B/people/action:break | -0.0021 [-0.0045, 0.0004]; n=200 | F2 (pertinence): 0.0004 [-0.0004, 0.0012]; n=200; changed=1<br>F3 (interpret): -0.0021 [-0.0048, 0.0006]; n=200; changed=11 |
| B/people/action:deceive | -0.0021 [-0.0057, 0.0015]; n=200 | F2 (pertinence): 0.0017 [-0.0003, 0.0037]; n=200; changed=6<br>F3 (interpret): -0.0029 [-0.0061, 0.0002]; n=200; changed=12 |
| B/people/action:keep | 0.0033 [0.0008, 0.0059]; n=200 | F1 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F2 (pertinence): 0.0004 [-0.0010, 0.0018]; n=200; changed=3<br>F3 (interpret): 0.0025 [0.0002, 0.0048]; n=200; changed=8<br>F4 (learning, pertinence): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F5 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F6 (pertinence, interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F7 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F8 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F9 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F10 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F11 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F12 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F13 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1 |
| B/people/action:leave | -0.0017 [-0.0040, 0.0007]; n=200 | F2 (pertinence): -0.0017 [-0.0037, 0.0003]; n=200; changed=6<br>F3 (interpret): 0 [-0.0016, 0.0016]; n=200; changed=4 |
| B/people/action:trade | 0.0013 [-0.0006, 0.0031]; n=200 | F2 (pertinence): 0.0013 [-0.0002, 0.0027]; n=200; changed=3<br>F3 (interpret): 0.0004 [-0.0004, 0.0012]; n=200; changed=1 |
| B/people/action:wait | -0.0008 [-0.0020, 0.0003]; n=200 | F3 (interpret): -0.0013 [-0.0027, 0.0002]; n=200; changed=3 |
| B/people/action:work | 0.0029 [-2.670e-5, 0.0059]; n=200 | F2 (pertinence): -0.0008 [-0.0025, 0.0008]; n=200; changed=4<br>F3 (interpret): 0.0029 [0.0005, 0.0054]; n=200; changed=9 |
| B/people/censored | -0.0250 [-0.0576, 0.0076]; n=200 | F2 (pertinence): -0.0100 [-0.0297, 0.0097]; n=200; changed=4<br>F3 (interpret): -0.0300 [-0.0610, 0.0010]; n=200; changed=10 |
| B/people/learning-epochs | 0.1111 [-0.1452, 0.3674]; n=9 | F2 (pertinence): 0.1111 [-0.1452, 0.3674]; n=9; changed=1 |
| B/people/outcome:bad | -0.0020 [-0.0058, 0.0018]; n=200 | F2 (pertinence): -0.0027 [-0.0063, 0.0008]; n=200; changed=15<br>F3 (interpret): -0.0002 [-0.0027, 0.0024]; n=200; changed=11 |
| B/people/outcome:good | 0.0007 [-0.0029, 0.0042]; n=200 | F2 (pertinence): 0.0008 [-0.0022, 0.0037]; n=200; changed=11<br>F3 (interpret): -0.0006 [-0.0028, 0.0015]; n=200; changed=9 |
| B/people/outcome:unfinished | 0.0013 [-0.0011, 0.0038]; n=200 | F2 (pertinence): 0.0019 [-0.0009, 0.0048]; n=200; changed=12<br>F3 (interpret): 0.0008 [-0.0005, 0.0021]; n=200; changed=7 |
| B/people/receipts | 0 [-0.0343, 0.0343]; n=200 | F2 (pertinence): 0.0100 [-0.0179, 0.0379]; n=200; changed=8<br>F3 (interpret): -0.0100 [-0.0342, 0.0142]; n=200; changed=6 |
| B/people/stabilized | 0.0250 [-0.0076, 0.0576]; n=200 | F2 (pertinence): 0.0100 [-0.0097, 0.0297]; n=200; changed=4<br>F3 (interpret): 0.0300 [-0.0010, 0.0610]; n=200; changed=10 |
| O/body/action:confront | 0.0012 [-0.0040, 0.0065]; n=200 | F1 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F2 (pertinence): 0.0021 [-0.0017, 0.0058]; n=200; changed=21<br>F3 (interpret): -0.0021 [-0.0057, 0.0015]; n=200; changed=16<br>F4 (learning, pertinence): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F5 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F6 (pertinence, interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F7 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F8 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F9 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F10 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F11 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F12 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F13 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1 |
| O/body/censored | -0.0200 [-0.0704, 0.0304]; n=200 | F2 (pertinence): -0.0100 [-0.0542, 0.0342]; n=200; changed=20<br>F3 (interpret): -0.0350 [-0.0643, -0.0057]; n=200; changed=9 |
| O/body/informative | -0.0050 [-0.0347, 0.0247]; n=200 | F2 (pertinence): -0.0050 [-0.0221, 0.0121]; n=200; changed=3<br>F3 (interpret): -0.0200 [-0.0441, 0.0041]; n=200; changed=6 |
| O/body/learning-epochs | -0.2800 [-0.6315, 0.0715]; n=25 | F2 (pertinence): -0.2800 [-0.6315, 0.0715]; n=25; changed=3<br>F3 (interpret): 0.0833 [-0.0905, 0.2572]; n=24; changed=1 |
| O/body/outcome:bad | 0.0047 [-0.0027, 0.0121]; n=141 | F2 (pertinence): 0.0047 [-0.0027, 0.0121]; n=141; changed=2 |
| O/body/outcome:good | -0.0047 [-0.0121, 0.0027]; n=141 | F2 (pertinence): -0.0047 [-0.0121, 0.0027]; n=141; changed=2 |
| O/body/receipts | 0.0150 [-0.0483, 0.0783]; n=200 | F2 (pertinence): 0.0250 [-0.0202, 0.0702]; n=200; changed=21<br>F3 (interpret): -0.0250 [-0.0680, 0.0180]; n=200; changed=16 |
| O/body/stabilized | 0.0150 [-0.0303, 0.0603]; n=200 | F2 (pertinence): 0.0050 [-0.0358, 0.0458]; n=200; changed=17<br>F3 (interpret): 0.0150 [-0.0070, 0.0370]; n=200; changed=5 |
| O/people/action:accept_promise | 0.0012 [-0.0033, 0.0058]; n=200 | F2 (pertinence): 0.0004 [-0.0030, 0.0038]; n=200; changed=14<br>F3 (interpret): 6.939e-20 [-0.0026, 0.0026]; n=200; changed=10 |
| O/people/action:accept_trade | 0.0037 [-0.0007, 0.0082]; n=200 | F2 (pertinence): -0.0008 [-0.0045, 0.0029]; n=200; changed=12<br>F3 (interpret): 0.0025 [-0.0013, 0.0063]; n=200; changed=16 |
| O/people/action:accept_work | -0.0062 [-0.0112, -0.0013]; n=200 | F2 (pertinence): -0.0021 [-0.0065, 0.0023]; n=200; changed=18<br>F3 (interpret): -0.0029 [-0.0063, 0.0005]; n=200; changed=14 |
| O/people/action:chase | -0.0054 [-0.0106, -0.0002]; n=200 | F2 (pertinence): 0.0017 [-0.0024, 0.0057]; n=200; changed=21<br>F3 (interpret): -0.0050 [-0.0091, -0.0009]; n=200; changed=20 |
| O/people/action:give | 0.0017 [-0.0030, 0.0063]; n=200 | F2 (pertinence): -0.0029 [-0.0063, 0.0005]; n=200; changed=14<br>F3 (interpret): 0.0037 [9.883e-6, 0.0075]; n=200; changed=21 |
| O/people/action:let_go | 0.0088 [0.0036, 0.0139]; n=200 | F1 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F2 (pertinence): -0.0017 [-0.0052, 0.0018]; n=200; changed=19<br>F3 (interpret): 0.0092 [0.0052, 0.0132]; n=200; changed=23<br>F4 (learning, pertinence): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F5 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F6 (pertinence, interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F7 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F8 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F9 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F10 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F11 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F12 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F13 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1 |
| O/people/action:pay | 0.0071 [0.0011, 0.0131]; n=200 | F1 (interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F2 (pertinence): 0.0042 [4.932e-6, 0.0083]; n=200; changed=24<br>F3 (interpret): 0.0037 [-0.0002, 0.0077]; n=200; changed=24<br>F4 (learning, pertinence): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F5 (learning): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F6 (pertinence, interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F7 (interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F8 (learning): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F9 (generate): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F10 (generate): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F11 (generate): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F12 (interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F13 (interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2 |
| O/people/action:refuse | -0.0021 [-0.0068, 0.0026]; n=200 | F2 (pertinence): 0.0042 [0.0009, 0.0074]; n=200; changed=13<br>F3 (interpret): -0.0038 [-0.0078, 0.0003]; n=200; changed=22 |
| O/people/action:renege | -0.0079 [-0.0137, -0.0021]; n=200 | F2 (pertinence): -0.0058 [-0.0106, -0.0011]; n=200; changed=28<br>F3 (interpret): -0.0029 [-0.0068, 0.0010]; n=200; changed=23 |
| O/people/action:wait | -0.0021 [-0.0042, 0.0001]; n=200 | F2 (pertinence): 0.0008 [-0.0003, 0.0020]; n=200; changed=2<br>F3 (interpret): -0.0025 [-0.0045, -0.0005]; n=200; changed=6 |
| O/people/outcome:bad | 0.0029 [-0.0030, 0.0088]; n=200 | F2 (pertinence): -0.0029 [-0.0067, 0.0009]; n=200; changed=26<br>F3 (interpret): 0.0046 [-0.0003, 0.0095]; n=200; changed=28 |
| O/people/outcome:good | -0.0029 [-0.0088, 0.0030]; n=200 | F2 (pertinence): 0.0033 [-0.0006, 0.0072]; n=200; changed=27<br>F3 (interpret): -0.0045 [-0.0094, 0.0004]; n=200; changed=27 |
| O/people/outcome:unfinished | -3.535e-5 [-0.0002, 0.0001]; n=200 | F2 (pertinence): -0.0005 [-0.0014, 0.0004]; n=200; changed=1<br>F3 (interpret): -0.0001 [-0.0002, 3.560e-5]; n=200; changed=2 |
| O/people/receipts | -0.0150 [-0.0783, 0.0483]; n=200 | F2 (pertinence): -0.0250 [-0.0702, 0.0202]; n=200; changed=21<br>F3 (interpret): 0.0250 [-0.0180, 0.0680]; n=200; changed=16 |

### v1/INFP minus null

| Metric | Paired difference [95% interval]; pairs | Formula-off interventions |
|---|---|---|
| A/body/action:fight | 0.0021 [-0.0009, 0.0050]; n=200 | F1 (interpret): 0.0021 [-0.0004, 0.0045]; n=200; changed=9<br>F2 (pertinence): 0.0012 [-0.0009, 0.0034]; n=200; changed=7<br>F3 (interpret): 0.0004 [-0.0014, 0.0023]; n=200; changed=5 |
| A/body/action:steal | -0.0013 [-0.0042, 0.0017]; n=200 | F1 (interpret): -0.0008 [-0.0034, 0.0018]; n=200; changed=7<br>F2 (pertinence): -0.0013 [-0.0031, 0.0006]; n=200; changed=5<br>F3 (interpret): 2.082e-19 [-0.0023, 0.0023]; n=200; changed=8 |
| A/body/censored | -0.0300 [-0.0908, 0.0308]; n=200 | F1 (interpret): -0.0200 [-0.0704, 0.0304]; n=200; changed=26<br>F2 (pertinence): 0.0050 [-0.0403, 0.0503]; n=200; changed=21<br>F3 (interpret): 0.0150 [-0.0070, 0.0370]; n=200; changed=5 |
| A/body/informative | 0.0050 [-0.0049, 0.0149]; n=200 | F1 (interpret): 0.0050 [-0.0049, 0.0149]; n=200; changed=1 |
| A/body/learning-epochs | 0.5890 [0.2821, 0.8960]; n=73 | F1 (interpret): 0.2676 [0.0203, 0.5149]; n=71; changed=10<br>F2 (pertinence): 0.1972 [-0.1377, 0.5321]; n=71; changed=9<br>F3 (interpret): 0.0833 [-0.0834, 0.2501]; n=72; changed=1 |
| A/body/outcome:bad | 0.0066 [-0.0062, 0.0194]; n=184 | F1 (interpret): 0.0059 [-0.0060, 0.0178]; n=184; changed=4<br>F2 (pertinence): 0.0029 [-0.0018, 0.0076]; n=184; changed=4<br>F3 (interpret): 0.0032 [-0.0085, 0.0149]; n=184; changed=5 |
| A/body/outcome:good | -0.0055 [-0.0189, 0.0078]; n=184 | F1 (interpret): -0.0059 [-0.0178, 0.0060]; n=184; changed=4<br>F2 (pertinence): -0.0029 [-0.0076, 0.0018]; n=184; changed=4<br>F3 (interpret): -0.0021 [-0.0144, 0.0102]; n=184; changed=5 |
| A/body/outcome:unfinished | -0.0011 [-0.0032, 0.0011]; n=184 | F3 (interpret): -0.0011 [-0.0032, 0.0011]; n=184; changed=1 |
| A/body/receipts | 0.0100 [-0.0242, 0.0442]; n=200 | F1 (interpret): 0.0150 [-0.0111, 0.0411]; n=200; changed=7<br>F2 (pertinence): 0 [-0.0242, 0.0242]; n=200; changed=6<br>F3 (interpret): 0.0050 [-0.0212, 0.0312]; n=200; changed=7 |
| A/body/stabilized | 0.0350 [-0.0250, 0.0950]; n=200 | F1 (interpret): 0.0250 [-0.0243, 0.0743]; n=200; changed=25<br>F2 (pertinence): -0.0050 [-0.0503, 0.0403]; n=200; changed=21<br>F3 (interpret): -0.0150 [-0.0370, 0.0070]; n=200; changed=5 |
| A/people/action:ask | 0.0004 [-0.0021, 0.0029]; n=200 | F1 (interpret): -0.0004 [-0.0018, 0.0010]; n=200; changed=3<br>F2 (pertinence): -0.0013 [-0.0031, 0.0006]; n=200; changed=2<br>F3 (interpret): 0.0008 [-0.0003, 0.0020]; n=200; changed=2 |
| A/people/action:break | 0.0008 [-0.0015, 0.0032]; n=200 | F1 (interpret): -0.0008 [-0.0028, 0.0012]; n=200; changed=6<br>F2 (pertinence): -0.0004 [-0.0018, 0.0010]; n=200; changed=3<br>F3 (interpret): 0.0029 [0.0002, 0.0056]; n=200; changed=11 |
| A/people/action:deceive | 0.0013 [-0.0017, 0.0042]; n=200 | F1 (interpret): 0 [-0.0020, 0.0020]; n=200; changed=6<br>F2 (pertinence): -0.0004 [-0.0023, 0.0014]; n=200; changed=5<br>F3 (interpret): -0.0004 [-0.0029, 0.0021]; n=200; changed=9 |
| A/people/action:keep | -1.388e-19 [-0.0039, 0.0039]; n=200 | F1 (interpret): 0.0012 [-0.0015, 0.0040]; n=200; changed=11<br>F2 (pertinence): -0.0004 [-0.0031, 0.0023]; n=200; changed=11<br>F3 (interpret): -0.0017 [-0.0047, 0.0014]; n=200; changed=14 |
| A/people/action:leave | -0.0021 [-0.0058, 0.0017]; n=200 | F1 (interpret): -0.0021 [-0.0048, 0.0006]; n=200; changed=11<br>F2 (pertinence): 0.0008 [-0.0020, 0.0037]; n=200; changed=12<br>F3 (interpret): -0.0008 [-0.0028, 0.0012]; n=200; changed=6 |
| A/people/action:trade | -0.0008 [-0.0037, 0.0020]; n=200 | F1 (interpret): 0.0008 [-0.0012, 0.0028]; n=200; changed=6<br>F2 (pertinence): 0.0004 [-0.0018, 0.0026]; n=200; changed=4<br>F3 (interpret): -0.0008 [-0.0025, 0.0008]; n=200; changed=4 |
| A/people/action:work | -0.0004 [-0.0034, 0.0026]; n=200 | F1 (interpret): 0 [-0.0020, 0.0020]; n=200; changed=6<br>F2 (pertinence): 0.0013 [-0.0009, 0.0034]; n=200; changed=4<br>F3 (interpret): -0.0008 [-0.0028, 0.0012]; n=200; changed=7<br>F4 (learning, pertinence): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F5 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F6 (pertinence, interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F7 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F8 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F9 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F10 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F11 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F12 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F13 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1 |
| A/people/censored | -0.0050 [-0.0378, 0.0278]; n=200 | F1 (interpret): 0.0100 [-0.0179, 0.0379]; n=200; changed=8<br>F2 (pertinence): -0.0150 [-0.0370, 0.0070]; n=200; changed=5<br>F3 (interpret): -0.0150 [-0.0370, 0.0070]; n=200; changed=5 |
| A/people/outcome:bad | 0.0010 [-0.0025, 0.0045]; n=200 | F1 (interpret): 0.0010 [-0.0022, 0.0042]; n=200; changed=10<br>F2 (pertinence): -0.0014 [-0.0043, 0.0016]; n=200; changed=11<br>F3 (interpret): -0.0024 [-0.0055, 0.0007]; n=200; changed=10 |
| A/people/outcome:good | -0.0014 [-0.0051, 0.0022]; n=200 | F1 (interpret): -0.0012 [-0.0043, 0.0019]; n=200; changed=8<br>F2 (pertinence): 0.0006 [-0.0024, 0.0036]; n=200; changed=11<br>F3 (interpret): 0.0013 [-0.0013, 0.0038]; n=200; changed=11 |
| A/people/outcome:unfinished | 0.0005 [-0.0022, 0.0031]; n=200 | F1 (interpret): 0.0002 [-0.0001, 0.0005]; n=200; changed=7<br>F2 (pertinence): 0.0008 [-0.0020, 0.0035]; n=200; changed=10<br>F3 (interpret): 0.0011 [-0.0004, 0.0026]; n=200; changed=7 |
| A/people/receipts | -0.0100 [-0.0442, 0.0242]; n=200 | F1 (interpret): -0.0150 [-0.0411, 0.0111]; n=200; changed=7<br>F2 (pertinence): 0 [-0.0242, 0.0242]; n=200; changed=6<br>F3 (interpret): -0.0050 [-0.0312, 0.0212]; n=200; changed=7 |
| A/people/stabilized | 0.0050 [-0.0278, 0.0378]; n=200 | F1 (interpret): -0.0100 [-0.0379, 0.0179]; n=200; changed=8<br>F2 (pertinence): 0.0150 [-0.0070, 0.0370]; n=200; changed=5<br>F3 (interpret): 0.0150 [-0.0070, 0.0370]; n=200; changed=5 |
| B/body/action:fight | 0.0017 [-0.0003, 0.0037]; n=200 | F1 (interpret): 0.0008 [-0.0008, 0.0025]; n=200; changed=4<br>F2 (pertinence): 0.0008 [-0.0008, 0.0025]; n=200; changed=4<br>F3 (interpret): 0.0013 [-0.0002, 0.0027]; n=200; changed=3 |
| B/body/action:steal | -0.0012 [-0.0037, 0.0012]; n=200 | F1 (interpret): -0.0017 [-0.0043, 0.0009]; n=200; changed=10<br>F2 (pertinence): -0.0004 [-0.0023, 0.0014]; n=200; changed=5<br>F3 (interpret): -4.163e-19 [-0.0020, 0.0020]; n=200; changed=6 |
| B/body/censored | -0.0050 [-0.0635, 0.0535]; n=200 | F1 (interpret): -0.0050 [-0.0458, 0.0358]; n=200; changed=17<br>F2 (pertinence): -0.0100 [-0.0584, 0.0384]; n=200; changed=24<br>F3 (interpret): 0 [-0.0280, 0.0280]; n=200; changed=8 |
| B/body/learning-epochs | -0.1324 [-0.5187, 0.2540]; n=68 | F1 (interpret): -0.1231 [-0.4529, 0.2067]; n=65; changed=5<br>F2 (pertinence): -0.1940 [-0.4957, 0.1076]; n=67; changed=5 |
| B/body/outcome:bad | 0.0118 [-0.0020, 0.0255]; n=187 | F1 (interpret): 0.0013 [-0.0074, 0.0100]; n=187; changed=6<br>F2 (pertinence): 0.0093 [-0.0032, 0.0217]; n=187; changed=7<br>F3 (interpret): 0.0049 [-0.0013, 0.0111]; n=186; changed=3 |
| B/body/outcome:good | -0.0133 [-0.0273, 0.0008]; n=187 | F1 (interpret): 2.969e-19 [-0.0083, 0.0083]; n=187; changed=5<br>F2 (pertinence): -0.0121 [-0.0252, 0.0009]; n=187; changed=9<br>F3 (interpret): -0.0036 [-0.0092, 0.0020]; n=186; changed=2 |
| B/body/outcome:unfinished | 0.0015 [-0.0047, 0.0077]; n=187 | F1 (interpret): -0.0013 [-0.0040, 0.0013]; n=187; changed=1<br>F2 (pertinence): 0.0029 [-0.0027, 0.0084]; n=187; changed=4<br>F3 (interpret): -0.0013 [-0.0040, 0.0013]; n=186; changed=1 |
| B/body/receipts | 0.0050 [-0.0247, 0.0347]; n=200 | F1 (interpret): -0.0100 [-0.0412, 0.0212]; n=200; changed=10<br>F2 (pertinence): 0.0050 [-0.0171, 0.0271]; n=200; changed=5<br>F3 (interpret): 0.0150 [-0.0020, 0.0320]; n=200; changed=3 |
| B/body/stabilized | 0.0050 [-0.0535, 0.0635]; n=200 | F1 (interpret): 0 [-0.0420, 0.0420]; n=200; changed=18<br>F2 (pertinence): 0.0100 [-0.0384, 0.0584]; n=200; changed=24<br>F3 (interpret): 0.0050 [-0.0212, 0.0312]; n=200; changed=7 |
| B/people/action:ask | 0.0013 [-0.0006, 0.0031]; n=200 | F1 (interpret): 0 [-0.0012, 0.0012]; n=200; changed=2<br>F2 (pertinence): 0.0004 [-0.0010, 0.0018]; n=200; changed=3<br>F3 (interpret): 0.0004 [-0.0004, 0.0012]; n=200; changed=1 |
| B/people/action:break | 0.0008 [-0.0018, 0.0034]; n=200 | F1 (interpret): 0 [-0.0016, 0.0016]; n=200; changed=4<br>F2 (pertinence): 6.939e-20 [-0.0012, 0.0012]; n=200; changed=2<br>F3 (interpret): 0.0021 [-0.0006, 0.0048]; n=200; changed=11 |
| B/people/action:deceive | 0.0008 [-0.0020, 0.0037]; n=200 | F1 (interpret): 1.388e-19 [-0.0035, 0.0035]; n=200; changed=18<br>F2 (pertinence): -0.0004 [-0.0023, 0.0014]; n=200; changed=5<br>F3 (interpret): 0.0017 [-0.0009, 0.0043]; n=200; changed=10 |
| B/people/action:keep | 6.939e-20 [-0.0026, 0.0026]; n=200 | F1 (interpret): 0.0008 [-0.0012, 0.0028]; n=200; changed=6<br>F2 (pertinence): 0.0004 [-0.0010, 0.0018]; n=200; changed=3<br>F3 (interpret): -0.0025 [-0.0048, -0.0002]; n=200; changed=8 |
| B/people/action:leave | -0.0017 [-0.0040, 0.0007]; n=200 | F1 (interpret): -0.0013 [-0.0031, 0.0006]; n=200; changed=5<br>F2 (pertinence): -6.939e-20 [-0.0016, 0.0016]; n=200; changed=4<br>F3 (interpret): -0.0004 [-0.0012, 0.0004]; n=200; changed=1 |
| B/people/action:trade | -0.0008 [-0.0034, 0.0018]; n=200 | F1 (interpret): 0.0013 [-0.0009, 0.0034]; n=200; changed=7<br>F2 (pertinence): 0.0004 [-0.0018, 0.0026]; n=200; changed=7<br>F3 (interpret): -0.0004 [-0.0012, 0.0004]; n=200; changed=1 |
| B/people/action:wait | -6.939e-20 [-0.0016, 0.0016]; n=200 | F1 (interpret): -0.0008 [-0.0020, 0.0003]; n=200; changed=2<br>F2 (pertinence): -0.0004 [-0.0012, 0.0004]; n=200; changed=1<br>F3 (interpret): 0.0008 [-0.0008, 0.0025]; n=200; changed=4 |
| B/people/action:work | -0.0008 [-0.0037, 0.0020]; n=200 | F1 (interpret): 0.0008 [-0.0027, 0.0043]; n=200; changed=15<br>F2 (pertinence): -0.0008 [-0.0028, 0.0012]; n=200; changed=6<br>F3 (interpret): -0.0029 [-0.0051, -0.0008]; n=200; changed=7 |
| B/people/censored | 0 [-0.0343, 0.0343]; n=200 | F1 (interpret): 0.0150 [-0.0206, 0.0506]; n=200; changed=13<br>F2 (pertinence): 0 [-0.0280, 0.0280]; n=200; changed=8<br>F3 (interpret): 0.0100 [-0.0097, 0.0297]; n=200; changed=4 |
| B/people/learning-epochs | -0.1667 [-1.8482, 1.5149]; n=6 | F1 (interpret): -1.6000 [-3.0160, -0.1840]; n=5; changed=4<br>F2 (pertinence): -0.1667 [-0.5952, 0.2618]; n=6; changed=1<br>F3 (interpret): -0.5000 [-1.7855, 0.7855]; n=6; changed=1 |
| B/people/outcome:bad | 0.0008 [-0.0039, 0.0054]; n=200 | F1 (interpret): 0.0023 [-0.0011, 0.0058]; n=200; changed=18<br>F2 (pertinence): 0.0005 [-0.0034, 0.0043]; n=200; changed=15<br>F3 (interpret): 0.0009 [-0.0024, 0.0042]; n=200; changed=11 |
| B/people/outcome:good | -0.0012 [-0.0048, 0.0024]; n=200 | F1 (interpret): -0.0033 [-0.0068, 0.0003]; n=200; changed=15<br>F2 (pertinence): -0.0004 [-0.0032, 0.0024]; n=200; changed=11<br>F3 (interpret): -0.0014 [-0.0044, 0.0016]; n=200; changed=9 |
| B/people/outcome:unfinished | 0.0005 [-0.0032, 0.0041]; n=200 | F1 (interpret): 0.0009 [-0.0015, 0.0033]; n=200; changed=12<br>F2 (pertinence): -0.0001 [-0.0030, 0.0028]; n=200; changed=9<br>F3 (interpret): 0.0005 [-0.0021, 0.0030]; n=200; changed=7 |
| B/people/receipts | -0.0050 [-0.0347, 0.0247]; n=200 | F1 (interpret): 0.0100 [-0.0212, 0.0412]; n=200; changed=10<br>F2 (pertinence): -0.0050 [-0.0271, 0.0171]; n=200; changed=5<br>F3 (interpret): -0.0150 [-0.0320, 0.0020]; n=200; changed=3 |
| B/people/stabilized | 0 [-0.0343, 0.0343]; n=200 | F1 (interpret): -0.0150 [-0.0506, 0.0206]; n=200; changed=13<br>F2 (pertinence): 0 [-0.0280, 0.0280]; n=200; changed=8<br>F3 (interpret): -0.0100 [-0.0297, 0.0097]; n=200; changed=4 |
| O/body/action:confront | -0.0017 [-0.0077, 0.0044]; n=200 | F1 (interpret): -0.0013 [-0.0055, 0.0030]; n=200; changed=22<br>F2 (pertinence): -0.0013 [-0.0057, 0.0032]; n=200; changed=24<br>F3 (interpret): -0.0013 [-0.0054, 0.0029]; n=200; changed=20<br>F4 (learning, pertinence): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F5 (learning): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F6 (pertinence, interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F7 (interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F8 (learning): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F9 (generate): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F10 (generate): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F11 (generate): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F12 (interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F13 (interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2 |
| O/body/censored | -0.0550 [-0.1147, 0.0047]; n=200 | F1 (interpret): -0.0400 [-0.0860, 0.0060]; n=200; changed=22<br>F2 (pertinence): 0.0050 [-0.0444, 0.0544]; n=200; changed=25<br>F3 (interpret): 0.0150 [-0.0146, 0.0446]; n=200; changed=9 |
| O/body/informative | 0.0100 [-0.0212, 0.0412]; n=200 | F1 (interpret): -0.0050 [-0.0312, 0.0212]; n=200; changed=7<br>F2 (pertinence): 0.0100 [-0.0142, 0.0342]; n=200; changed=6<br>F3 (interpret): 0 [-0.0242, 0.0242]; n=200; changed=6 |
| O/body/learning-epochs | -0.0833 [-0.8963, 0.7296]; n=24 | F1 (interpret): 0.1667 [-0.1810, 0.5143]; n=24; changed=1<br>F2 (pertinence): 0.0870 [-0.0944, 0.2683]; n=23; changed=1<br>F3 (interpret): -0.3333 [-1.0287, 0.3620]; n=24; changed=1 |
| O/body/outcome:bad | 0.0012 [-0.0152, 0.0175]; n=142 | F1 (interpret): -0.0024 [-0.0098, 0.0051]; n=141; changed=2<br>F2 (pertinence): -0.0024 [-0.0098, 0.0051]; n=141; changed=2<br>F3 (interpret): -0.0024 [-0.0070, 0.0023]; n=141; changed=1 |
| O/body/outcome:good | -0.0012 [-0.0175, 0.0152]; n=142 | F1 (interpret): 0.0024 [-0.0051, 0.0098]; n=141; changed=2<br>F2 (pertinence): 0.0024 [-0.0051, 0.0098]; n=141; changed=2<br>F3 (interpret): 0.0024 [-0.0023, 0.0070]; n=141; changed=1 |
| O/body/receipts | -0.0200 [-0.0926, 0.0526]; n=200 | F1 (interpret): -0.0150 [-0.0663, 0.0363]; n=200; changed=21<br>F2 (pertinence): -0.0150 [-0.0682, 0.0382]; n=200; changed=23<br>F3 (interpret): -0.0150 [-0.0644, 0.0344]; n=200; changed=19 |
| O/body/stabilized | 0.0650 [0.0089, 0.1211]; n=200 | F1 (interpret): 0.0350 [-0.0055, 0.0755]; n=200; changed=17<br>F2 (pertinence): 0.0050 [-0.0424, 0.0524]; n=200; changed=23<br>F3 (interpret): -0.0150 [-0.0477, 0.0177]; n=200; changed=11 |
| O/people/action:accept_promise | -0.0104 [-0.0162, -0.0046]; n=200 | F1 (interpret): -0.0004 [-0.0047, 0.0039]; n=200; changed=21<br>F2 (pertinence): -0.0042 [-0.0083, -4.932e-6]; n=200; changed=20<br>F3 (interpret): -0.0004 [-0.0031, 0.0023]; n=200; changed=11 |
| O/people/action:accept_trade | -0.0008 [-0.0056, 0.0040]; n=200 | F1 (interpret): -0.0017 [-0.0053, 0.0020]; n=200; changed=15<br>F2 (pertinence): 0.0029 [-0.0012, 0.0070]; n=200; changed=19<br>F3 (interpret): -0.0046 [-0.0075, -0.0017]; n=200; changed=14<br>F4 (learning, pertinence): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F5 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F6 (pertinence, interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F7 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F8 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F9 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F10 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F11 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F12 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F13 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1 |
| O/people/action:accept_work | 0.0071 [0.0019, 0.0123]; n=200 | F1 (interpret): 0.0033 [-0.0001, 0.0068]; n=200; changed=15<br>F2 (pertinence): -2.776e-19 [-0.0045, 0.0045]; n=200; changed=24<br>F3 (interpret): 0.0050 [0.0020, 0.0080]; n=200; changed=14 |
| O/people/action:chase | 0.0092 [0.0030, 0.0153]; n=200 | F1 (interpret): 0.0017 [-0.0030, 0.0063]; n=200; changed=23<br>F2 (pertinence): -1.249e-18 [-0.0044, 0.0044]; n=200; changed=26<br>F3 (interpret): 0.0071 [0.0029, 0.0112]; n=200; changed=21<br>F4 (learning, pertinence): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F5 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F6 (pertinence, interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F7 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F8 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F9 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F10 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F11 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F12 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F13 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1 |
| O/people/action:give | -0.0025 [-0.0070, 0.0020]; n=200 | F1 (interpret): -0.0008 [-0.0037, 0.0020]; n=200; changed=12<br>F2 (pertinence): 0.0025 [-0.0010, 0.0060]; n=200; changed=18<br>F3 (interpret): -0.0038 [-0.0067, -0.0008]; n=200; changed=13 |
| O/people/action:let_go | -0.0092 [-0.0145, -0.0039]; n=200 | F1 (interpret): -0.0017 [-0.0055, 0.0022]; n=200; changed=16<br>F2 (pertinence): -0.0004 [-0.0049, 0.0040]; n=200; changed=23<br>F3 (interpret): -0.0075 [-0.0122, -0.0028]; n=200; changed=20 |
| O/people/action:pay | 0.0037 [-0.0027, 0.0102]; n=200 | F1 (interpret): -0.0033 [-0.0080, 0.0013]; n=200; changed=27<br>F2 (pertinence): 0.0038 [-0.0011, 0.0086]; n=200; changed=26<br>F3 (interpret): -0.0067 [-0.0109, -0.0024]; n=200; changed=30<br>F4 (learning, pertinence): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F5 (learning): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F6 (pertinence, interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F7 (interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F8 (learning): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F9 (generate): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F10 (generate): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F11 (generate): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F12 (interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F13 (interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2 |
| O/people/action:refuse | 0.0033 [-0.0013, 0.0080]; n=200 | F1 (interpret): 0.0012 [-0.0021, 0.0046]; n=200; changed=17<br>F2 (pertinence): -0.0013 [-0.0048, 0.0023]; n=200; changed=16<br>F3 (interpret): 0.0037 [0.0008, 0.0067]; n=200; changed=13 |
| O/people/action:renege | 1.388e-19 [-0.0074, 0.0074]; n=200 | F1 (interpret): 0.0029 [-0.0013, 0.0072]; n=200; changed=25<br>F2 (pertinence): -0.0029 [-0.0086, 0.0027]; n=200; changed=30<br>F3 (interpret): 0.0058 [0.0010, 0.0107]; n=200; changed=28<br>F4 (learning, pertinence): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F5 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F6 (pertinence, interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F7 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F8 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F9 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F10 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F11 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F12 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F13 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1 |
| O/people/action:wait | 0.0013 [-0.0009, 0.0034]; n=200 | F1 (interpret): 0 [-0.0012, 0.0012]; n=200; changed=2<br>F2 (pertinence): 0.0008 [-0.0008, 0.0025]; n=200; changed=4<br>F3 (interpret): 0.0025 [0.0002, 0.0048]; n=200; changed=8 |
| O/people/outcome:bad | 0.0005 [-0.0061, 0.0070]; n=200 | F1 (interpret): -0.0016 [-0.0051, 0.0019]; n=200; changed=27<br>F2 (pertinence): 0.0015 [-0.0038, 0.0069]; n=200; changed=29<br>F3 (interpret): -0.0028 [-0.0078, 0.0021]; n=200; changed=31 |
| O/people/outcome:good | -0.0008 [-0.0070, 0.0054]; n=200 | F1 (interpret): 0.0012 [-0.0025, 0.0049]; n=200; changed=26<br>F2 (pertinence): -0.0020 [-0.0068, 0.0029]; n=200; changed=26<br>F3 (interpret): 0.0027 [-0.0022, 0.0077]; n=200; changed=30 |
| O/people/outcome:unfinished | 0.0003 [-0.0013, 0.0020]; n=200 | F1 (interpret): 0.0004 [-0.0006, 0.0013]; n=200; changed=3<br>F2 (pertinence): 0.0004 [-0.0012, 0.0021]; n=200; changed=6<br>F3 (interpret): 0.0001 [-0.0011, 0.0013]; n=200; changed=3 |
| O/people/receipts | 0.0200 [-0.0526, 0.0926]; n=200 | F1 (interpret): 0.0150 [-0.0363, 0.0663]; n=200; changed=21<br>F2 (pertinence): 0.0150 [-0.0382, 0.0682]; n=200; changed=23<br>F3 (interpret): 0.0150 [-0.0344, 0.0644]; n=200; changed=19 |

### v1/ESTJ minus null

| Metric | Paired difference [95% interval]; pairs | Formula-off interventions |
|---|---|---|
| A/body/action:fight | 0.0008 [-0.0012, 0.0028]; n=200 | F2 (pertinence): -6.939e-20 [-0.0012, 0.0012]; n=200; changed=2<br>F3 (interpret): 0.0013 [-0.0002, 0.0027]; n=200; changed=3 |
| A/body/action:steal | 0.0008 [-0.0012, 0.0028]; n=200 | F2 (pertinence): 0.0017 [3.494e-5, 0.0033]; n=200; changed=4<br>F3 (interpret): -0.0008 [-0.0020, 0.0003]; n=200; changed=2 |
| A/body/censored | -0.0050 [-0.0564, 0.0464]; n=200 | F2 (pertinence): 0.0050 [-0.0444, 0.0544]; n=200; changed=25<br>F3 (interpret): 0.0100 [-0.0212, 0.0412]; n=200; changed=10 |
| A/body/learning-epochs | 0.0400 [-0.2696, 0.3496]; n=75 | F2 (pertinence): 0.1081 [-0.1964, 0.4127]; n=74; changed=16 |
| A/body/outcome:bad | -0.0071 [-0.0248, 0.0106]; n=184 | F2 (pertinence): -0.0052 [-0.0134, 0.0031]; n=184; changed=5<br>F3 (interpret): -0.0054 [-0.0221, 0.0112]; n=184; changed=5 |
| A/body/outcome:good | 0.0023 [-0.0150, 0.0195]; n=184 | F2 (pertinence): 0.0004 [-0.0068, 0.0076]; n=184; changed=4<br>F3 (interpret): 0.0054 [-0.0112, 0.0221]; n=184; changed=5 |
| A/body/outcome:unfinished | 0.0048 [-0.0017, 0.0113]; n=184 | F2 (pertinence): 0.0048 [-0.0017, 0.0113]; n=184; changed=3 |
| A/body/receipts | 0.0200 [-0.0078, 0.0478]; n=200 | F2 (pertinence): 0.0200 [-0.0041, 0.0441]; n=200; changed=6<br>F3 (interpret): 0.0050 [-0.0121, 0.0221]; n=200; changed=3 |
| A/body/stabilized | 0.0050 [-0.0464, 0.0564]; n=200 | F2 (pertinence): -0.0050 [-0.0544, 0.0444]; n=200; changed=25<br>F3 (interpret): -0.0100 [-0.0412, 0.0212]; n=200; changed=10 |
| A/people/action:ask | -0.0017 [-0.0033, -3.494e-5]; n=200 | F3 (interpret): -0.0017 [-0.0033, -3.494e-5]; n=200; changed=4 |
| A/people/action:break | -0.0013 [-0.0034, 0.0009]; n=200 | F2 (pertinence): -0.0008 [-0.0020, 0.0003]; n=200; changed=2<br>F3 (interpret): -0.0008 [-0.0028, 0.0012]; n=200; changed=6 |
| A/people/action:deceive | -0.0013 [-0.0034, 0.0009]; n=200 | F2 (pertinence): -0.0017 [-0.0033, -3.494e-5]; n=200; changed=4<br>F3 (interpret): 0 [-0.0023, 0.0023]; n=200; changed=5 |
| A/people/action:keep | 0.0013 [-0.0015, 0.0040]; n=200 | F2 (pertinence): 0.0017 [3.494e-5, 0.0033]; n=200; changed=4<br>F3 (interpret): -2.776e-19 [-0.0023, 0.0023]; n=200; changed=8 |
| A/people/action:leave | 0 [-0.0023, 0.0023]; n=200 | F2 (pertinence): -0.0008 [-0.0025, 0.0008]; n=200; changed=4<br>F3 (interpret): 0.0008 [-0.0008, 0.0025]; n=200; changed=4 |
| A/people/action:trade | 0.0013 [-0.0009, 0.0034]; n=200 | F3 (interpret): 0.0012 [-0.0009, 0.0034]; n=200; changed=7 |
| A/people/action:wait | -0.0008 [-0.0020, 0.0003]; n=200 | F3 (interpret): -0.0008 [-0.0020, 0.0003]; n=200; changed=2 |
| A/people/action:work | 0.0008 [-0.0012, 0.0028]; n=200 | F3 (interpret): 0.0008 [-0.0018, 0.0034]; n=200; changed=7 |
| A/people/censored | -0.0350 [-0.0674, -0.0026]; n=200 | F2 (pertinence): -0.0250 [-0.0509, 0.0009]; n=200; changed=7<br>F3 (interpret): -0.0250 [-0.0509, 0.0009]; n=200; changed=7 |
| A/people/outcome:bad | 0.0041 [-0.0003, 0.0086]; n=200 | F2 (pertinence): 0.0006 [-0.0019, 0.0032]; n=200; changed=10<br>F3 (interpret): 0.0031 [-0.0006, 0.0068]; n=200; changed=8 |
| A/people/outcome:good | -0.0018 [-0.0057, 0.0020]; n=200 | F2 (pertinence): -0.0001 [-0.0030, 0.0027]; n=200; changed=7<br>F3 (interpret): -0.0020 [-0.0054, 0.0013]; n=200; changed=9 |
| A/people/outcome:unfinished | -0.0023 [-0.0045, -0.0001]; n=200 | F2 (pertinence): -0.0005 [-0.0027, 0.0017]; n=200; changed=7<br>F3 (interpret): -0.0011 [-0.0025, 0.0004]; n=200; changed=4 |
| A/people/receipts | -0.0200 [-0.0478, 0.0078]; n=200 | F2 (pertinence): -0.0200 [-0.0441, 0.0041]; n=200; changed=6<br>F3 (interpret): -0.0050 [-0.0221, 0.0121]; n=200; changed=3 |
| A/people/stabilized | 0.0350 [0.0026, 0.0674]; n=200 | F2 (pertinence): 0.0250 [-0.0009, 0.0509]; n=200; changed=7<br>F3 (interpret): 0.0250 [-0.0009, 0.0509]; n=200; changed=7 |
| B/body/action:fight | 0.0017 [-0.0009, 0.0043]; n=200 | F1 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F2 (pertinence): 0.0012 [-0.0012, 0.0037]; n=200; changed=6<br>F3 (interpret): 0.0013 [-0.0002, 0.0027]; n=200; changed=4<br>F4 (learning, pertinence): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F5 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F6 (pertinence, interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F7 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F8 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F9 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F10 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F11 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F12 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F13 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1 |
| B/body/action:steal | -0.0017 [-0.0043, 0.0009]; n=200 | F2 (pertinence): -0.0021 [-0.0042, 0.0001]; n=200; changed=7<br>F3 (interpret): -0.0004 [-0.0023, 0.0014]; n=200; changed=5 |
| B/body/censored | 0 [-0.0420, 0.0420]; n=200 | F2 (pertinence): -0.0100 [-0.0519, 0.0319]; n=200; changed=18<br>F3 (interpret): 0.0050 [-0.0121, 0.0221]; n=200; changed=3 |
| B/body/informative | 0 [-0.0140, 0.0140]; n=200 | F2 (pertinence): -0.0050 [-0.0149, 0.0049]; n=200; changed=1<br>F3 (interpret): 0 [-0.0140, 0.0140]; n=200; changed=2 |
| B/body/learning-epochs | -0.1039 [-0.3246, 0.1168]; n=77 | F2 (pertinence): 0.0263 [-0.2278, 0.2805]; n=76; changed=13<br>F3 (interpret): -0.0519 [-0.1559, 0.0520]; n=77; changed=1 |
| B/body/outcome:bad | -0.0020 [-0.0088, 0.0049]; n=186 | F2 (pertinence): -0.0038 [-0.0115, 0.0040]; n=186; changed=6 |
| B/body/outcome:good | 0.0020 [-0.0049, 0.0088]; n=186 | F2 (pertinence): 0.0048 [-0.0032, 0.0128]; n=186; changed=7 |
| B/body/receipts | 0 [-0.0343, 0.0343]; n=200 | F2 (pertinence): -0.0100 [-0.0379, 0.0179]; n=200; changed=8<br>F3 (interpret): 0.0100 [-0.0142, 0.0342]; n=200; changed=6 |
| B/body/stabilized | 0 [-0.0396, 0.0396]; n=200 | F2 (pertinence): 0.0050 [-0.0358, 0.0458]; n=200; changed=17<br>F3 (interpret): -0.0050 [-0.0221, 0.0121]; n=200; changed=3 |
| B/people/action:ask | -0.0008 [-0.0020, 0.0003]; n=200 | F2 (pertinence): -0.0004 [-0.0012, 0.0004]; n=200; changed=1<br>F3 (interpret): -0.0004 [-0.0012, 0.0004]; n=200; changed=1 |
| B/people/action:break | -0.0021 [-0.0045, 0.0004]; n=200 | F2 (pertinence): 0.0004 [-0.0004, 0.0012]; n=200; changed=1<br>F3 (interpret): -0.0021 [-0.0048, 0.0006]; n=200; changed=11 |
| B/people/action:deceive | -0.0021 [-0.0057, 0.0015]; n=200 | F2 (pertinence): 0.0017 [-0.0003, 0.0037]; n=200; changed=6<br>F3 (interpret): -0.0029 [-0.0061, 0.0002]; n=200; changed=12 |
| B/people/action:keep | 0.0033 [0.0008, 0.0059]; n=200 | F1 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F2 (pertinence): 0.0004 [-0.0010, 0.0018]; n=200; changed=3<br>F3 (interpret): 0.0025 [0.0002, 0.0048]; n=200; changed=8<br>F4 (learning, pertinence): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F5 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F6 (pertinence, interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F7 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F8 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F9 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F10 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F11 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F12 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F13 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1 |
| B/people/action:leave | -0.0017 [-0.0040, 0.0007]; n=200 | F2 (pertinence): -0.0017 [-0.0037, 0.0003]; n=200; changed=6<br>F3 (interpret): 0 [-0.0016, 0.0016]; n=200; changed=4 |
| B/people/action:trade | 0.0013 [-0.0006, 0.0031]; n=200 | F2 (pertinence): 0.0013 [-0.0002, 0.0027]; n=200; changed=3<br>F3 (interpret): 0.0004 [-0.0004, 0.0012]; n=200; changed=1 |
| B/people/action:wait | -0.0008 [-0.0020, 0.0003]; n=200 | F3 (interpret): -0.0013 [-0.0027, 0.0002]; n=200; changed=3 |
| B/people/action:work | 0.0029 [-2.670e-5, 0.0059]; n=200 | F2 (pertinence): -0.0008 [-0.0025, 0.0008]; n=200; changed=4<br>F3 (interpret): 0.0029 [0.0005, 0.0054]; n=200; changed=9 |
| B/people/censored | -0.0250 [-0.0576, 0.0076]; n=200 | F2 (pertinence): -0.0100 [-0.0297, 0.0097]; n=200; changed=4<br>F3 (interpret): -0.0300 [-0.0610, 0.0010]; n=200; changed=10 |
| B/people/learning-epochs | 0.1111 [-0.1452, 0.3674]; n=9 | F2 (pertinence): 0.1111 [-0.1452, 0.3674]; n=9; changed=1 |
| B/people/outcome:bad | -0.0020 [-0.0058, 0.0018]; n=200 | F2 (pertinence): -0.0027 [-0.0063, 0.0008]; n=200; changed=15<br>F3 (interpret): -0.0002 [-0.0027, 0.0024]; n=200; changed=11 |
| B/people/outcome:good | 0.0007 [-0.0029, 0.0042]; n=200 | F2 (pertinence): 0.0008 [-0.0022, 0.0037]; n=200; changed=11<br>F3 (interpret): -0.0006 [-0.0028, 0.0015]; n=200; changed=9 |
| B/people/outcome:unfinished | 0.0013 [-0.0011, 0.0038]; n=200 | F2 (pertinence): 0.0019 [-0.0009, 0.0048]; n=200; changed=12<br>F3 (interpret): 0.0008 [-0.0005, 0.0021]; n=200; changed=7 |
| B/people/receipts | 0 [-0.0343, 0.0343]; n=200 | F2 (pertinence): 0.0100 [-0.0179, 0.0379]; n=200; changed=8<br>F3 (interpret): -0.0100 [-0.0342, 0.0142]; n=200; changed=6 |
| B/people/stabilized | 0.0250 [-0.0076, 0.0576]; n=200 | F2 (pertinence): 0.0100 [-0.0097, 0.0297]; n=200; changed=4<br>F3 (interpret): 0.0300 [-0.0010, 0.0610]; n=200; changed=10 |
| O/body/action:confront | 0.0012 [-0.0040, 0.0065]; n=200 | F1 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F2 (pertinence): 0.0021 [-0.0017, 0.0058]; n=200; changed=21<br>F3 (interpret): -0.0021 [-0.0057, 0.0015]; n=200; changed=16<br>F4 (learning, pertinence): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F5 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F6 (pertinence, interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F7 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F8 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F9 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F10 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F11 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F12 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F13 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1 |
| O/body/censored | -0.0200 [-0.0704, 0.0304]; n=200 | F2 (pertinence): -0.0100 [-0.0542, 0.0342]; n=200; changed=20<br>F3 (interpret): -0.0350 [-0.0643, -0.0057]; n=200; changed=9 |
| O/body/informative | -0.0050 [-0.0347, 0.0247]; n=200 | F2 (pertinence): -0.0050 [-0.0221, 0.0121]; n=200; changed=3<br>F3 (interpret): -0.0200 [-0.0441, 0.0041]; n=200; changed=6 |
| O/body/learning-epochs | -0.2800 [-0.6315, 0.0715]; n=25 | F2 (pertinence): -0.2800 [-0.6315, 0.0715]; n=25; changed=3<br>F3 (interpret): 0.0833 [-0.0905, 0.2572]; n=24; changed=1 |
| O/body/outcome:bad | 0.0047 [-0.0027, 0.0121]; n=141 | F2 (pertinence): 0.0047 [-0.0027, 0.0121]; n=141; changed=2 |
| O/body/outcome:good | -0.0047 [-0.0121, 0.0027]; n=141 | F2 (pertinence): -0.0047 [-0.0121, 0.0027]; n=141; changed=2 |
| O/body/receipts | 0.0150 [-0.0483, 0.0783]; n=200 | F2 (pertinence): 0.0250 [-0.0202, 0.0702]; n=200; changed=21<br>F3 (interpret): -0.0250 [-0.0680, 0.0180]; n=200; changed=16 |
| O/body/stabilized | 0.0150 [-0.0303, 0.0603]; n=200 | F2 (pertinence): 0.0050 [-0.0358, 0.0458]; n=200; changed=17<br>F3 (interpret): 0.0150 [-0.0070, 0.0370]; n=200; changed=5 |
| O/people/action:accept_promise | 0.0012 [-0.0033, 0.0058]; n=200 | F2 (pertinence): 0.0004 [-0.0030, 0.0038]; n=200; changed=14<br>F3 (interpret): 6.939e-20 [-0.0026, 0.0026]; n=200; changed=10 |
| O/people/action:accept_trade | 0.0037 [-0.0007, 0.0082]; n=200 | F2 (pertinence): -0.0008 [-0.0045, 0.0029]; n=200; changed=12<br>F3 (interpret): 0.0025 [-0.0013, 0.0063]; n=200; changed=16 |
| O/people/action:accept_work | -0.0062 [-0.0112, -0.0013]; n=200 | F2 (pertinence): -0.0021 [-0.0065, 0.0023]; n=200; changed=18<br>F3 (interpret): -0.0029 [-0.0063, 0.0005]; n=200; changed=14 |
| O/people/action:chase | -0.0054 [-0.0106, -0.0002]; n=200 | F2 (pertinence): 0.0017 [-0.0024, 0.0057]; n=200; changed=21<br>F3 (interpret): -0.0050 [-0.0091, -0.0009]; n=200; changed=20 |
| O/people/action:give | 0.0017 [-0.0030, 0.0063]; n=200 | F2 (pertinence): -0.0029 [-0.0063, 0.0005]; n=200; changed=14<br>F3 (interpret): 0.0037 [9.883e-6, 0.0075]; n=200; changed=21 |
| O/people/action:let_go | 0.0088 [0.0036, 0.0139]; n=200 | F1 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F2 (pertinence): -0.0017 [-0.0052, 0.0018]; n=200; changed=19<br>F3 (interpret): 0.0092 [0.0052, 0.0132]; n=200; changed=23<br>F4 (learning, pertinence): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F5 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F6 (pertinence, interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F7 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F8 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F9 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F10 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F11 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F12 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F13 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1 |
| O/people/action:pay | 0.0071 [0.0011, 0.0131]; n=200 | F1 (interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F2 (pertinence): 0.0042 [4.932e-6, 0.0083]; n=200; changed=24<br>F3 (interpret): 0.0037 [-0.0002, 0.0077]; n=200; changed=24<br>F4 (learning, pertinence): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F5 (learning): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F6 (pertinence, interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F7 (interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F8 (learning): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F9 (generate): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F10 (generate): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F11 (generate): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F12 (interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F13 (interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2 |
| O/people/action:refuse | -0.0021 [-0.0068, 0.0026]; n=200 | F2 (pertinence): 0.0042 [0.0009, 0.0074]; n=200; changed=13<br>F3 (interpret): -0.0038 [-0.0078, 0.0003]; n=200; changed=22 |
| O/people/action:renege | -0.0079 [-0.0137, -0.0021]; n=200 | F2 (pertinence): -0.0058 [-0.0106, -0.0011]; n=200; changed=28<br>F3 (interpret): -0.0029 [-0.0068, 0.0010]; n=200; changed=23 |
| O/people/action:wait | -0.0021 [-0.0042, 0.0001]; n=200 | F2 (pertinence): 0.0008 [-0.0003, 0.0020]; n=200; changed=2<br>F3 (interpret): -0.0025 [-0.0045, -0.0005]; n=200; changed=6 |
| O/people/outcome:bad | 0.0029 [-0.0030, 0.0088]; n=200 | F2 (pertinence): -0.0029 [-0.0067, 0.0009]; n=200; changed=26<br>F3 (interpret): 0.0046 [-0.0003, 0.0095]; n=200; changed=28 |
| O/people/outcome:good | -0.0029 [-0.0088, 0.0030]; n=200 | F2 (pertinence): 0.0033 [-0.0006, 0.0072]; n=200; changed=27<br>F3 (interpret): -0.0045 [-0.0094, 0.0004]; n=200; changed=27 |
| O/people/outcome:unfinished | -3.535e-5 [-0.0002, 0.0001]; n=200 | F2 (pertinence): -0.0005 [-0.0014, 0.0004]; n=200; changed=1<br>F3 (interpret): -0.0001 [-0.0002, 3.560e-5]; n=200; changed=2 |
| O/people/receipts | -0.0150 [-0.0783, 0.0483]; n=200 | F2 (pertinence): -0.0250 [-0.0702, 0.0202]; n=200; changed=21<br>F3 (interpret): 0.0250 [-0.0180, 0.0680]; n=200; changed=16 |

### v1/ISTJ minus null

| Metric | Paired difference [95% interval]; pairs | Formula-off interventions |
|---|---|---|
| A/body/action:fight | 0.0021 [-0.0009, 0.0050]; n=200 | F1 (interpret): 0.0021 [-0.0004, 0.0045]; n=200; changed=9<br>F2 (pertinence): 0.0012 [-0.0009, 0.0034]; n=200; changed=7<br>F3 (interpret): 0.0004 [-0.0014, 0.0023]; n=200; changed=5 |
| A/body/action:steal | -0.0013 [-0.0042, 0.0017]; n=200 | F1 (interpret): -0.0008 [-0.0034, 0.0018]; n=200; changed=7<br>F2 (pertinence): -0.0013 [-0.0031, 0.0006]; n=200; changed=5<br>F3 (interpret): 2.082e-19 [-0.0023, 0.0023]; n=200; changed=8 |
| A/body/censored | -0.0300 [-0.0908, 0.0308]; n=200 | F1 (interpret): -0.0200 [-0.0704, 0.0304]; n=200; changed=26<br>F2 (pertinence): 0.0050 [-0.0403, 0.0503]; n=200; changed=21<br>F3 (interpret): 0.0150 [-0.0070, 0.0370]; n=200; changed=5 |
| A/body/informative | 0.0050 [-0.0049, 0.0149]; n=200 | F1 (interpret): 0.0050 [-0.0049, 0.0149]; n=200; changed=1 |
| A/body/learning-epochs | 0.5890 [0.2821, 0.8960]; n=73 | F1 (interpret): 0.2676 [0.0203, 0.5149]; n=71; changed=10<br>F2 (pertinence): 0.1972 [-0.1377, 0.5321]; n=71; changed=9<br>F3 (interpret): 0.0833 [-0.0834, 0.2501]; n=72; changed=1 |
| A/body/outcome:bad | 0.0066 [-0.0062, 0.0194]; n=184 | F1 (interpret): 0.0059 [-0.0060, 0.0178]; n=184; changed=4<br>F2 (pertinence): 0.0029 [-0.0018, 0.0076]; n=184; changed=4<br>F3 (interpret): 0.0032 [-0.0085, 0.0149]; n=184; changed=5 |
| A/body/outcome:good | -0.0055 [-0.0189, 0.0078]; n=184 | F1 (interpret): -0.0059 [-0.0178, 0.0060]; n=184; changed=4<br>F2 (pertinence): -0.0029 [-0.0076, 0.0018]; n=184; changed=4<br>F3 (interpret): -0.0021 [-0.0144, 0.0102]; n=184; changed=5 |
| A/body/outcome:unfinished | -0.0011 [-0.0032, 0.0011]; n=184 | F3 (interpret): -0.0011 [-0.0032, 0.0011]; n=184; changed=1 |
| A/body/receipts | 0.0100 [-0.0242, 0.0442]; n=200 | F1 (interpret): 0.0150 [-0.0111, 0.0411]; n=200; changed=7<br>F2 (pertinence): 0 [-0.0242, 0.0242]; n=200; changed=6<br>F3 (interpret): 0.0050 [-0.0212, 0.0312]; n=200; changed=7 |
| A/body/stabilized | 0.0350 [-0.0250, 0.0950]; n=200 | F1 (interpret): 0.0250 [-0.0243, 0.0743]; n=200; changed=25<br>F2 (pertinence): -0.0050 [-0.0503, 0.0403]; n=200; changed=21<br>F3 (interpret): -0.0150 [-0.0370, 0.0070]; n=200; changed=5 |
| A/people/action:ask | 0.0004 [-0.0021, 0.0029]; n=200 | F1 (interpret): -0.0004 [-0.0018, 0.0010]; n=200; changed=3<br>F2 (pertinence): -0.0013 [-0.0031, 0.0006]; n=200; changed=2<br>F3 (interpret): 0.0008 [-0.0003, 0.0020]; n=200; changed=2 |
| A/people/action:break | 0.0008 [-0.0015, 0.0032]; n=200 | F1 (interpret): -0.0008 [-0.0028, 0.0012]; n=200; changed=6<br>F2 (pertinence): -0.0004 [-0.0018, 0.0010]; n=200; changed=3<br>F3 (interpret): 0.0029 [0.0002, 0.0056]; n=200; changed=11 |
| A/people/action:deceive | 0.0013 [-0.0017, 0.0042]; n=200 | F1 (interpret): 0 [-0.0020, 0.0020]; n=200; changed=6<br>F2 (pertinence): -0.0004 [-0.0023, 0.0014]; n=200; changed=5<br>F3 (interpret): -0.0004 [-0.0029, 0.0021]; n=200; changed=9 |
| A/people/action:keep | -1.388e-19 [-0.0039, 0.0039]; n=200 | F1 (interpret): 0.0012 [-0.0015, 0.0040]; n=200; changed=11<br>F2 (pertinence): -0.0004 [-0.0031, 0.0023]; n=200; changed=11<br>F3 (interpret): -0.0017 [-0.0047, 0.0014]; n=200; changed=14 |
| A/people/action:leave | -0.0021 [-0.0058, 0.0017]; n=200 | F1 (interpret): -0.0021 [-0.0048, 0.0006]; n=200; changed=11<br>F2 (pertinence): 0.0008 [-0.0020, 0.0037]; n=200; changed=12<br>F3 (interpret): -0.0008 [-0.0028, 0.0012]; n=200; changed=6 |
| A/people/action:trade | -0.0008 [-0.0037, 0.0020]; n=200 | F1 (interpret): 0.0008 [-0.0012, 0.0028]; n=200; changed=6<br>F2 (pertinence): 0.0004 [-0.0018, 0.0026]; n=200; changed=4<br>F3 (interpret): -0.0008 [-0.0025, 0.0008]; n=200; changed=4 |
| A/people/action:work | -0.0004 [-0.0034, 0.0026]; n=200 | F1 (interpret): 0 [-0.0020, 0.0020]; n=200; changed=6<br>F2 (pertinence): 0.0013 [-0.0009, 0.0034]; n=200; changed=4<br>F3 (interpret): -0.0008 [-0.0028, 0.0012]; n=200; changed=7<br>F4 (learning, pertinence): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F5 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F6 (pertinence, interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F7 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F8 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F9 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F10 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F11 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F12 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F13 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1 |
| A/people/censored | -0.0050 [-0.0378, 0.0278]; n=200 | F1 (interpret): 0.0100 [-0.0179, 0.0379]; n=200; changed=8<br>F2 (pertinence): -0.0150 [-0.0370, 0.0070]; n=200; changed=5<br>F3 (interpret): -0.0150 [-0.0370, 0.0070]; n=200; changed=5 |
| A/people/outcome:bad | 0.0010 [-0.0025, 0.0045]; n=200 | F1 (interpret): 0.0010 [-0.0022, 0.0042]; n=200; changed=10<br>F2 (pertinence): -0.0014 [-0.0043, 0.0016]; n=200; changed=11<br>F3 (interpret): -0.0024 [-0.0055, 0.0007]; n=200; changed=10 |
| A/people/outcome:good | -0.0014 [-0.0051, 0.0022]; n=200 | F1 (interpret): -0.0012 [-0.0043, 0.0019]; n=200; changed=8<br>F2 (pertinence): 0.0006 [-0.0024, 0.0036]; n=200; changed=11<br>F3 (interpret): 0.0013 [-0.0013, 0.0038]; n=200; changed=11 |
| A/people/outcome:unfinished | 0.0005 [-0.0022, 0.0031]; n=200 | F1 (interpret): 0.0002 [-0.0001, 0.0005]; n=200; changed=7<br>F2 (pertinence): 0.0008 [-0.0020, 0.0035]; n=200; changed=10<br>F3 (interpret): 0.0011 [-0.0004, 0.0026]; n=200; changed=7 |
| A/people/receipts | -0.0100 [-0.0442, 0.0242]; n=200 | F1 (interpret): -0.0150 [-0.0411, 0.0111]; n=200; changed=7<br>F2 (pertinence): 0 [-0.0242, 0.0242]; n=200; changed=6<br>F3 (interpret): -0.0050 [-0.0312, 0.0212]; n=200; changed=7 |
| A/people/stabilized | 0.0050 [-0.0278, 0.0378]; n=200 | F1 (interpret): -0.0100 [-0.0379, 0.0179]; n=200; changed=8<br>F2 (pertinence): 0.0150 [-0.0070, 0.0370]; n=200; changed=5<br>F3 (interpret): 0.0150 [-0.0070, 0.0370]; n=200; changed=5 |
| B/body/action:fight | 0.0017 [-0.0003, 0.0037]; n=200 | F1 (interpret): 0.0008 [-0.0008, 0.0025]; n=200; changed=4<br>F2 (pertinence): 0.0008 [-0.0008, 0.0025]; n=200; changed=4<br>F3 (interpret): 0.0013 [-0.0002, 0.0027]; n=200; changed=3 |
| B/body/action:steal | -0.0012 [-0.0037, 0.0012]; n=200 | F1 (interpret): -0.0017 [-0.0043, 0.0009]; n=200; changed=10<br>F2 (pertinence): -0.0004 [-0.0023, 0.0014]; n=200; changed=5<br>F3 (interpret): -4.163e-19 [-0.0020, 0.0020]; n=200; changed=6 |
| B/body/censored | -0.0050 [-0.0635, 0.0535]; n=200 | F1 (interpret): -0.0050 [-0.0458, 0.0358]; n=200; changed=17<br>F2 (pertinence): -0.0100 [-0.0584, 0.0384]; n=200; changed=24<br>F3 (interpret): 0 [-0.0280, 0.0280]; n=200; changed=8 |
| B/body/learning-epochs | -0.1324 [-0.5187, 0.2540]; n=68 | F1 (interpret): -0.1231 [-0.4529, 0.2067]; n=65; changed=5<br>F2 (pertinence): -0.1940 [-0.4957, 0.1076]; n=67; changed=5 |
| B/body/outcome:bad | 0.0118 [-0.0020, 0.0255]; n=187 | F1 (interpret): 0.0013 [-0.0074, 0.0100]; n=187; changed=6<br>F2 (pertinence): 0.0093 [-0.0032, 0.0217]; n=187; changed=7<br>F3 (interpret): 0.0049 [-0.0013, 0.0111]; n=186; changed=3 |
| B/body/outcome:good | -0.0133 [-0.0273, 0.0008]; n=187 | F1 (interpret): 2.969e-19 [-0.0083, 0.0083]; n=187; changed=5<br>F2 (pertinence): -0.0121 [-0.0252, 0.0009]; n=187; changed=9<br>F3 (interpret): -0.0036 [-0.0092, 0.0020]; n=186; changed=2 |
| B/body/outcome:unfinished | 0.0015 [-0.0047, 0.0077]; n=187 | F1 (interpret): -0.0013 [-0.0040, 0.0013]; n=187; changed=1<br>F2 (pertinence): 0.0029 [-0.0027, 0.0084]; n=187; changed=4<br>F3 (interpret): -0.0013 [-0.0040, 0.0013]; n=186; changed=1 |
| B/body/receipts | 0.0050 [-0.0247, 0.0347]; n=200 | F1 (interpret): -0.0100 [-0.0412, 0.0212]; n=200; changed=10<br>F2 (pertinence): 0.0050 [-0.0171, 0.0271]; n=200; changed=5<br>F3 (interpret): 0.0150 [-0.0020, 0.0320]; n=200; changed=3 |
| B/body/stabilized | 0.0050 [-0.0535, 0.0635]; n=200 | F1 (interpret): 0 [-0.0420, 0.0420]; n=200; changed=18<br>F2 (pertinence): 0.0100 [-0.0384, 0.0584]; n=200; changed=24<br>F3 (interpret): 0.0050 [-0.0212, 0.0312]; n=200; changed=7 |
| B/people/action:ask | 0.0013 [-0.0006, 0.0031]; n=200 | F1 (interpret): 0 [-0.0012, 0.0012]; n=200; changed=2<br>F2 (pertinence): 0.0004 [-0.0010, 0.0018]; n=200; changed=3<br>F3 (interpret): 0.0004 [-0.0004, 0.0012]; n=200; changed=1 |
| B/people/action:break | 0.0008 [-0.0018, 0.0034]; n=200 | F1 (interpret): 0 [-0.0016, 0.0016]; n=200; changed=4<br>F2 (pertinence): 6.939e-20 [-0.0012, 0.0012]; n=200; changed=2<br>F3 (interpret): 0.0021 [-0.0006, 0.0048]; n=200; changed=11 |
| B/people/action:deceive | 0.0008 [-0.0020, 0.0037]; n=200 | F1 (interpret): 1.388e-19 [-0.0035, 0.0035]; n=200; changed=18<br>F2 (pertinence): -0.0004 [-0.0023, 0.0014]; n=200; changed=5<br>F3 (interpret): 0.0017 [-0.0009, 0.0043]; n=200; changed=10 |
| B/people/action:keep | 6.939e-20 [-0.0026, 0.0026]; n=200 | F1 (interpret): 0.0008 [-0.0012, 0.0028]; n=200; changed=6<br>F2 (pertinence): 0.0004 [-0.0010, 0.0018]; n=200; changed=3<br>F3 (interpret): -0.0025 [-0.0048, -0.0002]; n=200; changed=8 |
| B/people/action:leave | -0.0017 [-0.0040, 0.0007]; n=200 | F1 (interpret): -0.0013 [-0.0031, 0.0006]; n=200; changed=5<br>F2 (pertinence): -6.939e-20 [-0.0016, 0.0016]; n=200; changed=4<br>F3 (interpret): -0.0004 [-0.0012, 0.0004]; n=200; changed=1 |
| B/people/action:trade | -0.0008 [-0.0034, 0.0018]; n=200 | F1 (interpret): 0.0013 [-0.0009, 0.0034]; n=200; changed=7<br>F2 (pertinence): 0.0004 [-0.0018, 0.0026]; n=200; changed=7<br>F3 (interpret): -0.0004 [-0.0012, 0.0004]; n=200; changed=1 |
| B/people/action:wait | -6.939e-20 [-0.0016, 0.0016]; n=200 | F1 (interpret): -0.0008 [-0.0020, 0.0003]; n=200; changed=2<br>F2 (pertinence): -0.0004 [-0.0012, 0.0004]; n=200; changed=1<br>F3 (interpret): 0.0008 [-0.0008, 0.0025]; n=200; changed=4 |
| B/people/action:work | -0.0008 [-0.0037, 0.0020]; n=200 | F1 (interpret): 0.0008 [-0.0027, 0.0043]; n=200; changed=15<br>F2 (pertinence): -0.0008 [-0.0028, 0.0012]; n=200; changed=6<br>F3 (interpret): -0.0029 [-0.0051, -0.0008]; n=200; changed=7 |
| B/people/censored | 0 [-0.0343, 0.0343]; n=200 | F1 (interpret): 0.0150 [-0.0206, 0.0506]; n=200; changed=13<br>F2 (pertinence): 0 [-0.0280, 0.0280]; n=200; changed=8<br>F3 (interpret): 0.0100 [-0.0097, 0.0297]; n=200; changed=4 |
| B/people/learning-epochs | -0.1667 [-1.8482, 1.5149]; n=6 | F1 (interpret): -1.6000 [-3.0160, -0.1840]; n=5; changed=4<br>F2 (pertinence): -0.1667 [-0.5952, 0.2618]; n=6; changed=1<br>F3 (interpret): -0.5000 [-1.7855, 0.7855]; n=6; changed=1 |
| B/people/outcome:bad | 0.0008 [-0.0039, 0.0054]; n=200 | F1 (interpret): 0.0023 [-0.0011, 0.0058]; n=200; changed=18<br>F2 (pertinence): 0.0005 [-0.0034, 0.0043]; n=200; changed=15<br>F3 (interpret): 0.0009 [-0.0024, 0.0042]; n=200; changed=11 |
| B/people/outcome:good | -0.0012 [-0.0048, 0.0024]; n=200 | F1 (interpret): -0.0033 [-0.0068, 0.0003]; n=200; changed=15<br>F2 (pertinence): -0.0004 [-0.0032, 0.0024]; n=200; changed=11<br>F3 (interpret): -0.0014 [-0.0044, 0.0016]; n=200; changed=9 |
| B/people/outcome:unfinished | 0.0005 [-0.0032, 0.0041]; n=200 | F1 (interpret): 0.0009 [-0.0015, 0.0033]; n=200; changed=12<br>F2 (pertinence): -0.0001 [-0.0030, 0.0028]; n=200; changed=9<br>F3 (interpret): 0.0005 [-0.0021, 0.0030]; n=200; changed=7 |
| B/people/receipts | -0.0050 [-0.0347, 0.0247]; n=200 | F1 (interpret): 0.0100 [-0.0212, 0.0412]; n=200; changed=10<br>F2 (pertinence): -0.0050 [-0.0271, 0.0171]; n=200; changed=5<br>F3 (interpret): -0.0150 [-0.0320, 0.0020]; n=200; changed=3 |
| B/people/stabilized | 0 [-0.0343, 0.0343]; n=200 | F1 (interpret): -0.0150 [-0.0506, 0.0206]; n=200; changed=13<br>F2 (pertinence): 0 [-0.0280, 0.0280]; n=200; changed=8<br>F3 (interpret): -0.0100 [-0.0297, 0.0097]; n=200; changed=4 |
| O/body/action:confront | -0.0017 [-0.0077, 0.0044]; n=200 | F1 (interpret): -0.0013 [-0.0055, 0.0030]; n=200; changed=22<br>F2 (pertinence): -0.0013 [-0.0057, 0.0032]; n=200; changed=24<br>F3 (interpret): -0.0013 [-0.0054, 0.0029]; n=200; changed=20<br>F4 (learning, pertinence): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F5 (learning): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F6 (pertinence, interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F7 (interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F8 (learning): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F9 (generate): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F10 (generate): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F11 (generate): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F12 (interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F13 (interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2 |
| O/body/censored | -0.0550 [-0.1147, 0.0047]; n=200 | F1 (interpret): -0.0400 [-0.0860, 0.0060]; n=200; changed=22<br>F2 (pertinence): 0.0050 [-0.0444, 0.0544]; n=200; changed=25<br>F3 (interpret): 0.0150 [-0.0146, 0.0446]; n=200; changed=9 |
| O/body/informative | 0.0100 [-0.0212, 0.0412]; n=200 | F1 (interpret): -0.0050 [-0.0312, 0.0212]; n=200; changed=7<br>F2 (pertinence): 0.0100 [-0.0142, 0.0342]; n=200; changed=6<br>F3 (interpret): 0 [-0.0242, 0.0242]; n=200; changed=6 |
| O/body/learning-epochs | -0.0833 [-0.8963, 0.7296]; n=24 | F1 (interpret): 0.1667 [-0.1810, 0.5143]; n=24; changed=1<br>F2 (pertinence): 0.0870 [-0.0944, 0.2683]; n=23; changed=1<br>F3 (interpret): -0.3333 [-1.0287, 0.3620]; n=24; changed=1 |
| O/body/outcome:bad | 0.0012 [-0.0152, 0.0175]; n=142 | F1 (interpret): -0.0024 [-0.0098, 0.0051]; n=141; changed=2<br>F2 (pertinence): -0.0024 [-0.0098, 0.0051]; n=141; changed=2<br>F3 (interpret): -0.0024 [-0.0070, 0.0023]; n=141; changed=1 |
| O/body/outcome:good | -0.0012 [-0.0175, 0.0152]; n=142 | F1 (interpret): 0.0024 [-0.0051, 0.0098]; n=141; changed=2<br>F2 (pertinence): 0.0024 [-0.0051, 0.0098]; n=141; changed=2<br>F3 (interpret): 0.0024 [-0.0023, 0.0070]; n=141; changed=1 |
| O/body/receipts | -0.0200 [-0.0926, 0.0526]; n=200 | F1 (interpret): -0.0150 [-0.0663, 0.0363]; n=200; changed=21<br>F2 (pertinence): -0.0150 [-0.0682, 0.0382]; n=200; changed=23<br>F3 (interpret): -0.0150 [-0.0644, 0.0344]; n=200; changed=19 |
| O/body/stabilized | 0.0650 [0.0089, 0.1211]; n=200 | F1 (interpret): 0.0350 [-0.0055, 0.0755]; n=200; changed=17<br>F2 (pertinence): 0.0050 [-0.0424, 0.0524]; n=200; changed=23<br>F3 (interpret): -0.0150 [-0.0477, 0.0177]; n=200; changed=11 |
| O/people/action:accept_promise | -0.0104 [-0.0162, -0.0046]; n=200 | F1 (interpret): -0.0004 [-0.0047, 0.0039]; n=200; changed=21<br>F2 (pertinence): -0.0042 [-0.0083, -4.932e-6]; n=200; changed=20<br>F3 (interpret): -0.0004 [-0.0031, 0.0023]; n=200; changed=11 |
| O/people/action:accept_trade | -0.0008 [-0.0056, 0.0040]; n=200 | F1 (interpret): -0.0017 [-0.0053, 0.0020]; n=200; changed=15<br>F2 (pertinence): 0.0029 [-0.0012, 0.0070]; n=200; changed=19<br>F3 (interpret): -0.0046 [-0.0075, -0.0017]; n=200; changed=14<br>F4 (learning, pertinence): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F5 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F6 (pertinence, interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F7 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F8 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F9 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F10 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F11 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F12 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F13 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1 |
| O/people/action:accept_work | 0.0071 [0.0019, 0.0123]; n=200 | F1 (interpret): 0.0033 [-0.0001, 0.0068]; n=200; changed=15<br>F2 (pertinence): -2.776e-19 [-0.0045, 0.0045]; n=200; changed=24<br>F3 (interpret): 0.0050 [0.0020, 0.0080]; n=200; changed=14 |
| O/people/action:chase | 0.0092 [0.0030, 0.0153]; n=200 | F1 (interpret): 0.0017 [-0.0030, 0.0063]; n=200; changed=23<br>F2 (pertinence): -1.249e-18 [-0.0044, 0.0044]; n=200; changed=26<br>F3 (interpret): 0.0071 [0.0029, 0.0112]; n=200; changed=21<br>F4 (learning, pertinence): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F5 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F6 (pertinence, interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F7 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F8 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F9 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F10 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F11 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F12 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F13 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1 |
| O/people/action:give | -0.0025 [-0.0070, 0.0020]; n=200 | F1 (interpret): -0.0008 [-0.0037, 0.0020]; n=200; changed=12<br>F2 (pertinence): 0.0025 [-0.0010, 0.0060]; n=200; changed=18<br>F3 (interpret): -0.0038 [-0.0067, -0.0008]; n=200; changed=13 |
| O/people/action:let_go | -0.0092 [-0.0145, -0.0039]; n=200 | F1 (interpret): -0.0017 [-0.0055, 0.0022]; n=200; changed=16<br>F2 (pertinence): -0.0004 [-0.0049, 0.0040]; n=200; changed=23<br>F3 (interpret): -0.0075 [-0.0122, -0.0028]; n=200; changed=20 |
| O/people/action:pay | 0.0037 [-0.0027, 0.0102]; n=200 | F1 (interpret): -0.0033 [-0.0080, 0.0013]; n=200; changed=27<br>F2 (pertinence): 0.0038 [-0.0011, 0.0086]; n=200; changed=26<br>F3 (interpret): -0.0067 [-0.0109, -0.0024]; n=200; changed=30<br>F4 (learning, pertinence): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F5 (learning): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F6 (pertinence, interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F7 (interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F8 (learning): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F9 (generate): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F10 (generate): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F11 (generate): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F12 (interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F13 (interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2 |
| O/people/action:refuse | 0.0033 [-0.0013, 0.0080]; n=200 | F1 (interpret): 0.0012 [-0.0021, 0.0046]; n=200; changed=17<br>F2 (pertinence): -0.0013 [-0.0048, 0.0023]; n=200; changed=16<br>F3 (interpret): 0.0037 [0.0008, 0.0067]; n=200; changed=13 |
| O/people/action:renege | 1.388e-19 [-0.0074, 0.0074]; n=200 | F1 (interpret): 0.0029 [-0.0013, 0.0072]; n=200; changed=25<br>F2 (pertinence): -0.0029 [-0.0086, 0.0027]; n=200; changed=30<br>F3 (interpret): 0.0058 [0.0010, 0.0107]; n=200; changed=28<br>F4 (learning, pertinence): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F5 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F6 (pertinence, interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F7 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F8 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F9 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F10 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F11 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F12 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F13 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1 |
| O/people/action:wait | 0.0013 [-0.0009, 0.0034]; n=200 | F1 (interpret): 0 [-0.0012, 0.0012]; n=200; changed=2<br>F2 (pertinence): 0.0008 [-0.0008, 0.0025]; n=200; changed=4<br>F3 (interpret): 0.0025 [0.0002, 0.0048]; n=200; changed=8 |
| O/people/outcome:bad | 0.0005 [-0.0061, 0.0070]; n=200 | F1 (interpret): -0.0016 [-0.0051, 0.0019]; n=200; changed=27<br>F2 (pertinence): 0.0015 [-0.0038, 0.0069]; n=200; changed=29<br>F3 (interpret): -0.0028 [-0.0078, 0.0021]; n=200; changed=31 |
| O/people/outcome:good | -0.0008 [-0.0070, 0.0054]; n=200 | F1 (interpret): 0.0012 [-0.0025, 0.0049]; n=200; changed=26<br>F2 (pertinence): -0.0020 [-0.0068, 0.0029]; n=200; changed=26<br>F3 (interpret): 0.0027 [-0.0022, 0.0077]; n=200; changed=30 |
| O/people/outcome:unfinished | 0.0003 [-0.0013, 0.0020]; n=200 | F1 (interpret): 0.0004 [-0.0006, 0.0013]; n=200; changed=3<br>F2 (pertinence): 0.0004 [-0.0012, 0.0021]; n=200; changed=6<br>F3 (interpret): 0.0001 [-0.0011, 0.0013]; n=200; changed=3 |
| O/people/receipts | 0.0200 [-0.0526, 0.0926]; n=200 | F1 (interpret): 0.0150 [-0.0363, 0.0663]; n=200; changed=21<br>F2 (pertinence): 0.0150 [-0.0382, 0.0682]; n=200; changed=23<br>F3 (interpret): 0.0150 [-0.0344, 0.0644]; n=200; changed=19 |

### v1/ENTJ minus null

| Metric | Paired difference [95% interval]; pairs | Formula-off interventions |
|---|---|---|
| A/body/action:fight | 0.0008 [-0.0012, 0.0028]; n=200 | F2 (pertinence): -6.939e-20 [-0.0012, 0.0012]; n=200; changed=2<br>F3 (interpret): 0.0013 [-0.0002, 0.0027]; n=200; changed=3 |
| A/body/action:steal | 0.0008 [-0.0012, 0.0028]; n=200 | F2 (pertinence): 0.0017 [3.494e-5, 0.0033]; n=200; changed=4<br>F3 (interpret): -0.0008 [-0.0020, 0.0003]; n=200; changed=2 |
| A/body/censored | -0.0050 [-0.0564, 0.0464]; n=200 | F2 (pertinence): 0.0050 [-0.0444, 0.0544]; n=200; changed=25<br>F3 (interpret): 0.0100 [-0.0212, 0.0412]; n=200; changed=10 |
| A/body/learning-epochs | 0.0400 [-0.2696, 0.3496]; n=75 | F2 (pertinence): 0.1081 [-0.1964, 0.4127]; n=74; changed=16 |
| A/body/outcome:bad | -0.0071 [-0.0248, 0.0106]; n=184 | F2 (pertinence): -0.0052 [-0.0134, 0.0031]; n=184; changed=5<br>F3 (interpret): -0.0054 [-0.0221, 0.0112]; n=184; changed=5 |
| A/body/outcome:good | 0.0023 [-0.0150, 0.0195]; n=184 | F2 (pertinence): 0.0004 [-0.0068, 0.0076]; n=184; changed=4<br>F3 (interpret): 0.0054 [-0.0112, 0.0221]; n=184; changed=5 |
| A/body/outcome:unfinished | 0.0048 [-0.0017, 0.0113]; n=184 | F2 (pertinence): 0.0048 [-0.0017, 0.0113]; n=184; changed=3 |
| A/body/receipts | 0.0200 [-0.0078, 0.0478]; n=200 | F2 (pertinence): 0.0200 [-0.0041, 0.0441]; n=200; changed=6<br>F3 (interpret): 0.0050 [-0.0121, 0.0221]; n=200; changed=3 |
| A/body/stabilized | 0.0050 [-0.0464, 0.0564]; n=200 | F2 (pertinence): -0.0050 [-0.0544, 0.0444]; n=200; changed=25<br>F3 (interpret): -0.0100 [-0.0412, 0.0212]; n=200; changed=10 |
| A/people/action:ask | -0.0017 [-0.0033, -3.494e-5]; n=200 | F3 (interpret): -0.0017 [-0.0033, -3.494e-5]; n=200; changed=4 |
| A/people/action:break | -0.0013 [-0.0034, 0.0009]; n=200 | F2 (pertinence): -0.0008 [-0.0020, 0.0003]; n=200; changed=2<br>F3 (interpret): -0.0008 [-0.0028, 0.0012]; n=200; changed=6 |
| A/people/action:deceive | -0.0013 [-0.0034, 0.0009]; n=200 | F2 (pertinence): -0.0017 [-0.0033, -3.494e-5]; n=200; changed=4<br>F3 (interpret): 0 [-0.0023, 0.0023]; n=200; changed=5 |
| A/people/action:keep | 0.0013 [-0.0015, 0.0040]; n=200 | F2 (pertinence): 0.0017 [3.494e-5, 0.0033]; n=200; changed=4<br>F3 (interpret): -2.776e-19 [-0.0023, 0.0023]; n=200; changed=8 |
| A/people/action:leave | 0 [-0.0023, 0.0023]; n=200 | F2 (pertinence): -0.0008 [-0.0025, 0.0008]; n=200; changed=4<br>F3 (interpret): 0.0008 [-0.0008, 0.0025]; n=200; changed=4 |
| A/people/action:trade | 0.0013 [-0.0009, 0.0034]; n=200 | F3 (interpret): 0.0012 [-0.0009, 0.0034]; n=200; changed=7 |
| A/people/action:wait | -0.0008 [-0.0020, 0.0003]; n=200 | F3 (interpret): -0.0008 [-0.0020, 0.0003]; n=200; changed=2 |
| A/people/action:work | 0.0008 [-0.0012, 0.0028]; n=200 | F3 (interpret): 0.0008 [-0.0018, 0.0034]; n=200; changed=7 |
| A/people/censored | -0.0350 [-0.0674, -0.0026]; n=200 | F2 (pertinence): -0.0250 [-0.0509, 0.0009]; n=200; changed=7<br>F3 (interpret): -0.0250 [-0.0509, 0.0009]; n=200; changed=7 |
| A/people/outcome:bad | 0.0041 [-0.0003, 0.0086]; n=200 | F2 (pertinence): 0.0006 [-0.0019, 0.0032]; n=200; changed=10<br>F3 (interpret): 0.0031 [-0.0006, 0.0068]; n=200; changed=8 |
| A/people/outcome:good | -0.0018 [-0.0057, 0.0020]; n=200 | F2 (pertinence): -0.0001 [-0.0030, 0.0027]; n=200; changed=7<br>F3 (interpret): -0.0020 [-0.0054, 0.0013]; n=200; changed=9 |
| A/people/outcome:unfinished | -0.0023 [-0.0045, -0.0001]; n=200 | F2 (pertinence): -0.0005 [-0.0027, 0.0017]; n=200; changed=7<br>F3 (interpret): -0.0011 [-0.0025, 0.0004]; n=200; changed=4 |
| A/people/receipts | -0.0200 [-0.0478, 0.0078]; n=200 | F2 (pertinence): -0.0200 [-0.0441, 0.0041]; n=200; changed=6<br>F3 (interpret): -0.0050 [-0.0221, 0.0121]; n=200; changed=3 |
| A/people/stabilized | 0.0350 [0.0026, 0.0674]; n=200 | F2 (pertinence): 0.0250 [-0.0009, 0.0509]; n=200; changed=7<br>F3 (interpret): 0.0250 [-0.0009, 0.0509]; n=200; changed=7 |
| B/body/action:fight | 0.0017 [-0.0009, 0.0043]; n=200 | F1 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F2 (pertinence): 0.0012 [-0.0012, 0.0037]; n=200; changed=6<br>F3 (interpret): 0.0013 [-0.0002, 0.0027]; n=200; changed=4<br>F4 (learning, pertinence): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F5 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F6 (pertinence, interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F7 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F8 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F9 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F10 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F11 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F12 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F13 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1 |
| B/body/action:steal | -0.0017 [-0.0043, 0.0009]; n=200 | F2 (pertinence): -0.0021 [-0.0042, 0.0001]; n=200; changed=7<br>F3 (interpret): -0.0004 [-0.0023, 0.0014]; n=200; changed=5 |
| B/body/censored | 0 [-0.0420, 0.0420]; n=200 | F2 (pertinence): -0.0100 [-0.0519, 0.0319]; n=200; changed=18<br>F3 (interpret): 0.0050 [-0.0121, 0.0221]; n=200; changed=3 |
| B/body/informative | 0 [-0.0140, 0.0140]; n=200 | F2 (pertinence): -0.0050 [-0.0149, 0.0049]; n=200; changed=1<br>F3 (interpret): 0 [-0.0140, 0.0140]; n=200; changed=2 |
| B/body/learning-epochs | -0.1039 [-0.3246, 0.1168]; n=77 | F2 (pertinence): 0.0263 [-0.2278, 0.2805]; n=76; changed=13<br>F3 (interpret): -0.0519 [-0.1559, 0.0520]; n=77; changed=1 |
| B/body/outcome:bad | -0.0020 [-0.0088, 0.0049]; n=186 | F2 (pertinence): -0.0038 [-0.0115, 0.0040]; n=186; changed=6 |
| B/body/outcome:good | 0.0020 [-0.0049, 0.0088]; n=186 | F2 (pertinence): 0.0048 [-0.0032, 0.0128]; n=186; changed=7 |
| B/body/receipts | 0 [-0.0343, 0.0343]; n=200 | F2 (pertinence): -0.0100 [-0.0379, 0.0179]; n=200; changed=8<br>F3 (interpret): 0.0100 [-0.0142, 0.0342]; n=200; changed=6 |
| B/body/stabilized | 0 [-0.0396, 0.0396]; n=200 | F2 (pertinence): 0.0050 [-0.0358, 0.0458]; n=200; changed=17<br>F3 (interpret): -0.0050 [-0.0221, 0.0121]; n=200; changed=3 |
| B/people/action:ask | -0.0008 [-0.0020, 0.0003]; n=200 | F2 (pertinence): -0.0004 [-0.0012, 0.0004]; n=200; changed=1<br>F3 (interpret): -0.0004 [-0.0012, 0.0004]; n=200; changed=1 |
| B/people/action:break | -0.0021 [-0.0045, 0.0004]; n=200 | F2 (pertinence): 0.0004 [-0.0004, 0.0012]; n=200; changed=1<br>F3 (interpret): -0.0021 [-0.0048, 0.0006]; n=200; changed=11 |
| B/people/action:deceive | -0.0021 [-0.0057, 0.0015]; n=200 | F2 (pertinence): 0.0017 [-0.0003, 0.0037]; n=200; changed=6<br>F3 (interpret): -0.0029 [-0.0061, 0.0002]; n=200; changed=12 |
| B/people/action:keep | 0.0033 [0.0008, 0.0059]; n=200 | F1 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F2 (pertinence): 0.0004 [-0.0010, 0.0018]; n=200; changed=3<br>F3 (interpret): 0.0025 [0.0002, 0.0048]; n=200; changed=8<br>F4 (learning, pertinence): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F5 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F6 (pertinence, interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F7 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F8 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F9 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F10 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F11 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F12 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F13 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1 |
| B/people/action:leave | -0.0017 [-0.0040, 0.0007]; n=200 | F2 (pertinence): -0.0017 [-0.0037, 0.0003]; n=200; changed=6<br>F3 (interpret): 0 [-0.0016, 0.0016]; n=200; changed=4 |
| B/people/action:trade | 0.0013 [-0.0006, 0.0031]; n=200 | F2 (pertinence): 0.0013 [-0.0002, 0.0027]; n=200; changed=3<br>F3 (interpret): 0.0004 [-0.0004, 0.0012]; n=200; changed=1 |
| B/people/action:wait | -0.0008 [-0.0020, 0.0003]; n=200 | F3 (interpret): -0.0013 [-0.0027, 0.0002]; n=200; changed=3 |
| B/people/action:work | 0.0029 [-2.670e-5, 0.0059]; n=200 | F2 (pertinence): -0.0008 [-0.0025, 0.0008]; n=200; changed=4<br>F3 (interpret): 0.0029 [0.0005, 0.0054]; n=200; changed=9 |
| B/people/censored | -0.0250 [-0.0576, 0.0076]; n=200 | F2 (pertinence): -0.0100 [-0.0297, 0.0097]; n=200; changed=4<br>F3 (interpret): -0.0300 [-0.0610, 0.0010]; n=200; changed=10 |
| B/people/learning-epochs | 0.1111 [-0.1452, 0.3674]; n=9 | F2 (pertinence): 0.1111 [-0.1452, 0.3674]; n=9; changed=1 |
| B/people/outcome:bad | -0.0020 [-0.0058, 0.0018]; n=200 | F2 (pertinence): -0.0027 [-0.0063, 0.0008]; n=200; changed=15<br>F3 (interpret): -0.0002 [-0.0027, 0.0024]; n=200; changed=11 |
| B/people/outcome:good | 0.0007 [-0.0029, 0.0042]; n=200 | F2 (pertinence): 0.0008 [-0.0022, 0.0037]; n=200; changed=11<br>F3 (interpret): -0.0006 [-0.0028, 0.0015]; n=200; changed=9 |
| B/people/outcome:unfinished | 0.0013 [-0.0011, 0.0038]; n=200 | F2 (pertinence): 0.0019 [-0.0009, 0.0048]; n=200; changed=12<br>F3 (interpret): 0.0008 [-0.0005, 0.0021]; n=200; changed=7 |
| B/people/receipts | 0 [-0.0343, 0.0343]; n=200 | F2 (pertinence): 0.0100 [-0.0179, 0.0379]; n=200; changed=8<br>F3 (interpret): -0.0100 [-0.0342, 0.0142]; n=200; changed=6 |
| B/people/stabilized | 0.0250 [-0.0076, 0.0576]; n=200 | F2 (pertinence): 0.0100 [-0.0097, 0.0297]; n=200; changed=4<br>F3 (interpret): 0.0300 [-0.0010, 0.0610]; n=200; changed=10 |
| O/body/action:confront | 0.0012 [-0.0040, 0.0065]; n=200 | F1 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F2 (pertinence): 0.0021 [-0.0017, 0.0058]; n=200; changed=21<br>F3 (interpret): -0.0021 [-0.0057, 0.0015]; n=200; changed=16<br>F4 (learning, pertinence): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F5 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F6 (pertinence, interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F7 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F8 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F9 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F10 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F11 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F12 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F13 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1 |
| O/body/censored | -0.0200 [-0.0704, 0.0304]; n=200 | F2 (pertinence): -0.0100 [-0.0542, 0.0342]; n=200; changed=20<br>F3 (interpret): -0.0350 [-0.0643, -0.0057]; n=200; changed=9 |
| O/body/informative | -0.0050 [-0.0347, 0.0247]; n=200 | F2 (pertinence): -0.0050 [-0.0221, 0.0121]; n=200; changed=3<br>F3 (interpret): -0.0200 [-0.0441, 0.0041]; n=200; changed=6 |
| O/body/learning-epochs | -0.2800 [-0.6315, 0.0715]; n=25 | F2 (pertinence): -0.2800 [-0.6315, 0.0715]; n=25; changed=3<br>F3 (interpret): 0.0833 [-0.0905, 0.2572]; n=24; changed=1 |
| O/body/outcome:bad | 0.0047 [-0.0027, 0.0121]; n=141 | F2 (pertinence): 0.0047 [-0.0027, 0.0121]; n=141; changed=2 |
| O/body/outcome:good | -0.0047 [-0.0121, 0.0027]; n=141 | F2 (pertinence): -0.0047 [-0.0121, 0.0027]; n=141; changed=2 |
| O/body/receipts | 0.0150 [-0.0483, 0.0783]; n=200 | F2 (pertinence): 0.0250 [-0.0202, 0.0702]; n=200; changed=21<br>F3 (interpret): -0.0250 [-0.0680, 0.0180]; n=200; changed=16 |
| O/body/stabilized | 0.0150 [-0.0303, 0.0603]; n=200 | F2 (pertinence): 0.0050 [-0.0358, 0.0458]; n=200; changed=17<br>F3 (interpret): 0.0150 [-0.0070, 0.0370]; n=200; changed=5 |
| O/people/action:accept_promise | 0.0012 [-0.0033, 0.0058]; n=200 | F2 (pertinence): 0.0004 [-0.0030, 0.0038]; n=200; changed=14<br>F3 (interpret): 6.939e-20 [-0.0026, 0.0026]; n=200; changed=10 |
| O/people/action:accept_trade | 0.0037 [-0.0007, 0.0082]; n=200 | F2 (pertinence): -0.0008 [-0.0045, 0.0029]; n=200; changed=12<br>F3 (interpret): 0.0025 [-0.0013, 0.0063]; n=200; changed=16 |
| O/people/action:accept_work | -0.0062 [-0.0112, -0.0013]; n=200 | F2 (pertinence): -0.0021 [-0.0065, 0.0023]; n=200; changed=18<br>F3 (interpret): -0.0029 [-0.0063, 0.0005]; n=200; changed=14 |
| O/people/action:chase | -0.0054 [-0.0106, -0.0002]; n=200 | F2 (pertinence): 0.0017 [-0.0024, 0.0057]; n=200; changed=21<br>F3 (interpret): -0.0050 [-0.0091, -0.0009]; n=200; changed=20 |
| O/people/action:give | 0.0017 [-0.0030, 0.0063]; n=200 | F2 (pertinence): -0.0029 [-0.0063, 0.0005]; n=200; changed=14<br>F3 (interpret): 0.0037 [9.883e-6, 0.0075]; n=200; changed=21 |
| O/people/action:let_go | 0.0088 [0.0036, 0.0139]; n=200 | F1 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F2 (pertinence): -0.0017 [-0.0052, 0.0018]; n=200; changed=19<br>F3 (interpret): 0.0092 [0.0052, 0.0132]; n=200; changed=23<br>F4 (learning, pertinence): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F5 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F6 (pertinence, interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F7 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F8 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F9 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F10 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F11 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F12 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F13 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1 |
| O/people/action:pay | 0.0071 [0.0011, 0.0131]; n=200 | F1 (interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F2 (pertinence): 0.0042 [4.932e-6, 0.0083]; n=200; changed=24<br>F3 (interpret): 0.0037 [-0.0002, 0.0077]; n=200; changed=24<br>F4 (learning, pertinence): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F5 (learning): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F6 (pertinence, interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F7 (interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F8 (learning): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F9 (generate): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F10 (generate): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F11 (generate): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F12 (interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F13 (interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2 |
| O/people/action:refuse | -0.0021 [-0.0068, 0.0026]; n=200 | F2 (pertinence): 0.0042 [0.0009, 0.0074]; n=200; changed=13<br>F3 (interpret): -0.0038 [-0.0078, 0.0003]; n=200; changed=22 |
| O/people/action:renege | -0.0079 [-0.0137, -0.0021]; n=200 | F2 (pertinence): -0.0058 [-0.0106, -0.0011]; n=200; changed=28<br>F3 (interpret): -0.0029 [-0.0068, 0.0010]; n=200; changed=23 |
| O/people/action:wait | -0.0021 [-0.0042, 0.0001]; n=200 | F2 (pertinence): 0.0008 [-0.0003, 0.0020]; n=200; changed=2<br>F3 (interpret): -0.0025 [-0.0045, -0.0005]; n=200; changed=6 |
| O/people/outcome:bad | 0.0029 [-0.0030, 0.0088]; n=200 | F2 (pertinence): -0.0029 [-0.0067, 0.0009]; n=200; changed=26<br>F3 (interpret): 0.0046 [-0.0003, 0.0095]; n=200; changed=28 |
| O/people/outcome:good | -0.0029 [-0.0088, 0.0030]; n=200 | F2 (pertinence): 0.0033 [-0.0006, 0.0072]; n=200; changed=27<br>F3 (interpret): -0.0045 [-0.0094, 0.0004]; n=200; changed=27 |
| O/people/outcome:unfinished | -3.535e-5 [-0.0002, 0.0001]; n=200 | F2 (pertinence): -0.0005 [-0.0014, 0.0004]; n=200; changed=1<br>F3 (interpret): -0.0001 [-0.0002, 3.560e-5]; n=200; changed=2 |
| O/people/receipts | -0.0150 [-0.0783, 0.0483]; n=200 | F2 (pertinence): -0.0250 [-0.0702, 0.0202]; n=200; changed=21<br>F3 (interpret): 0.0250 [-0.0180, 0.0680]; n=200; changed=16 |

### v1/INTJ minus null

| Metric | Paired difference [95% interval]; pairs | Formula-off interventions |
|---|---|---|
| A/body/action:fight | 0.0021 [-0.0009, 0.0050]; n=200 | F1 (interpret): 0.0021 [-0.0004, 0.0045]; n=200; changed=9<br>F2 (pertinence): 0.0012 [-0.0009, 0.0034]; n=200; changed=7<br>F3 (interpret): 0.0004 [-0.0014, 0.0023]; n=200; changed=5 |
| A/body/action:steal | -0.0013 [-0.0042, 0.0017]; n=200 | F1 (interpret): -0.0008 [-0.0034, 0.0018]; n=200; changed=7<br>F2 (pertinence): -0.0013 [-0.0031, 0.0006]; n=200; changed=5<br>F3 (interpret): 2.082e-19 [-0.0023, 0.0023]; n=200; changed=8 |
| A/body/censored | -0.0300 [-0.0908, 0.0308]; n=200 | F1 (interpret): -0.0200 [-0.0704, 0.0304]; n=200; changed=26<br>F2 (pertinence): 0.0050 [-0.0403, 0.0503]; n=200; changed=21<br>F3 (interpret): 0.0150 [-0.0070, 0.0370]; n=200; changed=5 |
| A/body/informative | 0.0050 [-0.0049, 0.0149]; n=200 | F1 (interpret): 0.0050 [-0.0049, 0.0149]; n=200; changed=1 |
| A/body/learning-epochs | 0.5890 [0.2821, 0.8960]; n=73 | F1 (interpret): 0.2676 [0.0203, 0.5149]; n=71; changed=10<br>F2 (pertinence): 0.1972 [-0.1377, 0.5321]; n=71; changed=9<br>F3 (interpret): 0.0833 [-0.0834, 0.2501]; n=72; changed=1 |
| A/body/outcome:bad | 0.0066 [-0.0062, 0.0194]; n=184 | F1 (interpret): 0.0059 [-0.0060, 0.0178]; n=184; changed=4<br>F2 (pertinence): 0.0029 [-0.0018, 0.0076]; n=184; changed=4<br>F3 (interpret): 0.0032 [-0.0085, 0.0149]; n=184; changed=5 |
| A/body/outcome:good | -0.0055 [-0.0189, 0.0078]; n=184 | F1 (interpret): -0.0059 [-0.0178, 0.0060]; n=184; changed=4<br>F2 (pertinence): -0.0029 [-0.0076, 0.0018]; n=184; changed=4<br>F3 (interpret): -0.0021 [-0.0144, 0.0102]; n=184; changed=5 |
| A/body/outcome:unfinished | -0.0011 [-0.0032, 0.0011]; n=184 | F3 (interpret): -0.0011 [-0.0032, 0.0011]; n=184; changed=1 |
| A/body/receipts | 0.0100 [-0.0242, 0.0442]; n=200 | F1 (interpret): 0.0150 [-0.0111, 0.0411]; n=200; changed=7<br>F2 (pertinence): 0 [-0.0242, 0.0242]; n=200; changed=6<br>F3 (interpret): 0.0050 [-0.0212, 0.0312]; n=200; changed=7 |
| A/body/stabilized | 0.0350 [-0.0250, 0.0950]; n=200 | F1 (interpret): 0.0250 [-0.0243, 0.0743]; n=200; changed=25<br>F2 (pertinence): -0.0050 [-0.0503, 0.0403]; n=200; changed=21<br>F3 (interpret): -0.0150 [-0.0370, 0.0070]; n=200; changed=5 |
| A/people/action:ask | 0.0004 [-0.0021, 0.0029]; n=200 | F1 (interpret): -0.0004 [-0.0018, 0.0010]; n=200; changed=3<br>F2 (pertinence): -0.0013 [-0.0031, 0.0006]; n=200; changed=2<br>F3 (interpret): 0.0008 [-0.0003, 0.0020]; n=200; changed=2 |
| A/people/action:break | 0.0008 [-0.0015, 0.0032]; n=200 | F1 (interpret): -0.0008 [-0.0028, 0.0012]; n=200; changed=6<br>F2 (pertinence): -0.0004 [-0.0018, 0.0010]; n=200; changed=3<br>F3 (interpret): 0.0029 [0.0002, 0.0056]; n=200; changed=11 |
| A/people/action:deceive | 0.0013 [-0.0017, 0.0042]; n=200 | F1 (interpret): 0 [-0.0020, 0.0020]; n=200; changed=6<br>F2 (pertinence): -0.0004 [-0.0023, 0.0014]; n=200; changed=5<br>F3 (interpret): -0.0004 [-0.0029, 0.0021]; n=200; changed=9 |
| A/people/action:keep | -1.388e-19 [-0.0039, 0.0039]; n=200 | F1 (interpret): 0.0012 [-0.0015, 0.0040]; n=200; changed=11<br>F2 (pertinence): -0.0004 [-0.0031, 0.0023]; n=200; changed=11<br>F3 (interpret): -0.0017 [-0.0047, 0.0014]; n=200; changed=14 |
| A/people/action:leave | -0.0021 [-0.0058, 0.0017]; n=200 | F1 (interpret): -0.0021 [-0.0048, 0.0006]; n=200; changed=11<br>F2 (pertinence): 0.0008 [-0.0020, 0.0037]; n=200; changed=12<br>F3 (interpret): -0.0008 [-0.0028, 0.0012]; n=200; changed=6 |
| A/people/action:trade | -0.0008 [-0.0037, 0.0020]; n=200 | F1 (interpret): 0.0008 [-0.0012, 0.0028]; n=200; changed=6<br>F2 (pertinence): 0.0004 [-0.0018, 0.0026]; n=200; changed=4<br>F3 (interpret): -0.0008 [-0.0025, 0.0008]; n=200; changed=4 |
| A/people/action:work | -0.0004 [-0.0034, 0.0026]; n=200 | F1 (interpret): 0 [-0.0020, 0.0020]; n=200; changed=6<br>F2 (pertinence): 0.0013 [-0.0009, 0.0034]; n=200; changed=4<br>F3 (interpret): -0.0008 [-0.0028, 0.0012]; n=200; changed=7<br>F4 (learning, pertinence): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F5 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F6 (pertinence, interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F7 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F8 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F9 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F10 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F11 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F12 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F13 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1 |
| A/people/censored | -0.0050 [-0.0378, 0.0278]; n=200 | F1 (interpret): 0.0100 [-0.0179, 0.0379]; n=200; changed=8<br>F2 (pertinence): -0.0150 [-0.0370, 0.0070]; n=200; changed=5<br>F3 (interpret): -0.0150 [-0.0370, 0.0070]; n=200; changed=5 |
| A/people/outcome:bad | 0.0010 [-0.0025, 0.0045]; n=200 | F1 (interpret): 0.0010 [-0.0022, 0.0042]; n=200; changed=10<br>F2 (pertinence): -0.0014 [-0.0043, 0.0016]; n=200; changed=11<br>F3 (interpret): -0.0024 [-0.0055, 0.0007]; n=200; changed=10 |
| A/people/outcome:good | -0.0014 [-0.0051, 0.0022]; n=200 | F1 (interpret): -0.0012 [-0.0043, 0.0019]; n=200; changed=8<br>F2 (pertinence): 0.0006 [-0.0024, 0.0036]; n=200; changed=11<br>F3 (interpret): 0.0013 [-0.0013, 0.0038]; n=200; changed=11 |
| A/people/outcome:unfinished | 0.0005 [-0.0022, 0.0031]; n=200 | F1 (interpret): 0.0002 [-0.0001, 0.0005]; n=200; changed=7<br>F2 (pertinence): 0.0008 [-0.0020, 0.0035]; n=200; changed=10<br>F3 (interpret): 0.0011 [-0.0004, 0.0026]; n=200; changed=7 |
| A/people/receipts | -0.0100 [-0.0442, 0.0242]; n=200 | F1 (interpret): -0.0150 [-0.0411, 0.0111]; n=200; changed=7<br>F2 (pertinence): 0 [-0.0242, 0.0242]; n=200; changed=6<br>F3 (interpret): -0.0050 [-0.0312, 0.0212]; n=200; changed=7 |
| A/people/stabilized | 0.0050 [-0.0278, 0.0378]; n=200 | F1 (interpret): -0.0100 [-0.0379, 0.0179]; n=200; changed=8<br>F2 (pertinence): 0.0150 [-0.0070, 0.0370]; n=200; changed=5<br>F3 (interpret): 0.0150 [-0.0070, 0.0370]; n=200; changed=5 |
| B/body/action:fight | 0.0017 [-0.0003, 0.0037]; n=200 | F1 (interpret): 0.0008 [-0.0008, 0.0025]; n=200; changed=4<br>F2 (pertinence): 0.0008 [-0.0008, 0.0025]; n=200; changed=4<br>F3 (interpret): 0.0013 [-0.0002, 0.0027]; n=200; changed=3 |
| B/body/action:steal | -0.0012 [-0.0037, 0.0012]; n=200 | F1 (interpret): -0.0017 [-0.0043, 0.0009]; n=200; changed=10<br>F2 (pertinence): -0.0004 [-0.0023, 0.0014]; n=200; changed=5<br>F3 (interpret): -4.163e-19 [-0.0020, 0.0020]; n=200; changed=6 |
| B/body/censored | -0.0050 [-0.0635, 0.0535]; n=200 | F1 (interpret): -0.0050 [-0.0458, 0.0358]; n=200; changed=17<br>F2 (pertinence): -0.0100 [-0.0584, 0.0384]; n=200; changed=24<br>F3 (interpret): 0 [-0.0280, 0.0280]; n=200; changed=8 |
| B/body/learning-epochs | -0.1324 [-0.5187, 0.2540]; n=68 | F1 (interpret): -0.1231 [-0.4529, 0.2067]; n=65; changed=5<br>F2 (pertinence): -0.1940 [-0.4957, 0.1076]; n=67; changed=5 |
| B/body/outcome:bad | 0.0118 [-0.0020, 0.0255]; n=187 | F1 (interpret): 0.0013 [-0.0074, 0.0100]; n=187; changed=6<br>F2 (pertinence): 0.0093 [-0.0032, 0.0217]; n=187; changed=7<br>F3 (interpret): 0.0049 [-0.0013, 0.0111]; n=186; changed=3 |
| B/body/outcome:good | -0.0133 [-0.0273, 0.0008]; n=187 | F1 (interpret): 2.969e-19 [-0.0083, 0.0083]; n=187; changed=5<br>F2 (pertinence): -0.0121 [-0.0252, 0.0009]; n=187; changed=9<br>F3 (interpret): -0.0036 [-0.0092, 0.0020]; n=186; changed=2 |
| B/body/outcome:unfinished | 0.0015 [-0.0047, 0.0077]; n=187 | F1 (interpret): -0.0013 [-0.0040, 0.0013]; n=187; changed=1<br>F2 (pertinence): 0.0029 [-0.0027, 0.0084]; n=187; changed=4<br>F3 (interpret): -0.0013 [-0.0040, 0.0013]; n=186; changed=1 |
| B/body/receipts | 0.0050 [-0.0247, 0.0347]; n=200 | F1 (interpret): -0.0100 [-0.0412, 0.0212]; n=200; changed=10<br>F2 (pertinence): 0.0050 [-0.0171, 0.0271]; n=200; changed=5<br>F3 (interpret): 0.0150 [-0.0020, 0.0320]; n=200; changed=3 |
| B/body/stabilized | 0.0050 [-0.0535, 0.0635]; n=200 | F1 (interpret): 0 [-0.0420, 0.0420]; n=200; changed=18<br>F2 (pertinence): 0.0100 [-0.0384, 0.0584]; n=200; changed=24<br>F3 (interpret): 0.0050 [-0.0212, 0.0312]; n=200; changed=7 |
| B/people/action:ask | 0.0013 [-0.0006, 0.0031]; n=200 | F1 (interpret): 0 [-0.0012, 0.0012]; n=200; changed=2<br>F2 (pertinence): 0.0004 [-0.0010, 0.0018]; n=200; changed=3<br>F3 (interpret): 0.0004 [-0.0004, 0.0012]; n=200; changed=1 |
| B/people/action:break | 0.0008 [-0.0018, 0.0034]; n=200 | F1 (interpret): 0 [-0.0016, 0.0016]; n=200; changed=4<br>F2 (pertinence): 6.939e-20 [-0.0012, 0.0012]; n=200; changed=2<br>F3 (interpret): 0.0021 [-0.0006, 0.0048]; n=200; changed=11 |
| B/people/action:deceive | 0.0008 [-0.0020, 0.0037]; n=200 | F1 (interpret): 1.388e-19 [-0.0035, 0.0035]; n=200; changed=18<br>F2 (pertinence): -0.0004 [-0.0023, 0.0014]; n=200; changed=5<br>F3 (interpret): 0.0017 [-0.0009, 0.0043]; n=200; changed=10 |
| B/people/action:keep | 6.939e-20 [-0.0026, 0.0026]; n=200 | F1 (interpret): 0.0008 [-0.0012, 0.0028]; n=200; changed=6<br>F2 (pertinence): 0.0004 [-0.0010, 0.0018]; n=200; changed=3<br>F3 (interpret): -0.0025 [-0.0048, -0.0002]; n=200; changed=8 |
| B/people/action:leave | -0.0017 [-0.0040, 0.0007]; n=200 | F1 (interpret): -0.0013 [-0.0031, 0.0006]; n=200; changed=5<br>F2 (pertinence): -6.939e-20 [-0.0016, 0.0016]; n=200; changed=4<br>F3 (interpret): -0.0004 [-0.0012, 0.0004]; n=200; changed=1 |
| B/people/action:trade | -0.0008 [-0.0034, 0.0018]; n=200 | F1 (interpret): 0.0013 [-0.0009, 0.0034]; n=200; changed=7<br>F2 (pertinence): 0.0004 [-0.0018, 0.0026]; n=200; changed=7<br>F3 (interpret): -0.0004 [-0.0012, 0.0004]; n=200; changed=1 |
| B/people/action:wait | -6.939e-20 [-0.0016, 0.0016]; n=200 | F1 (interpret): -0.0008 [-0.0020, 0.0003]; n=200; changed=2<br>F2 (pertinence): -0.0004 [-0.0012, 0.0004]; n=200; changed=1<br>F3 (interpret): 0.0008 [-0.0008, 0.0025]; n=200; changed=4 |
| B/people/action:work | -0.0008 [-0.0037, 0.0020]; n=200 | F1 (interpret): 0.0008 [-0.0027, 0.0043]; n=200; changed=15<br>F2 (pertinence): -0.0008 [-0.0028, 0.0012]; n=200; changed=6<br>F3 (interpret): -0.0029 [-0.0051, -0.0008]; n=200; changed=7 |
| B/people/censored | -0.0050 [-0.0407, 0.0307]; n=200 | F1 (interpret): 0.0100 [-0.0242, 0.0442]; n=200; changed=12<br>F2 (pertinence): -0.0050 [-0.0347, 0.0247]; n=200; changed=9<br>F3 (interpret): 0.0050 [-0.0171, 0.0271]; n=200; changed=5<br>F12 (interpret): -0.0050 [-0.0149, 0.0049]; n=200; changed=1 |
| B/people/learning-epochs | -0.1667 [-1.8482, 1.5149]; n=6 | F1 (interpret): -1.6000 [-3.0160, -0.1840]; n=5; changed=4<br>F2 (pertinence): -0.1667 [-0.5952, 0.2618]; n=6; changed=1<br>F3 (interpret): -0.5000 [-1.7855, 0.7855]; n=6; changed=1 |
| B/people/outcome:bad | 0.0008 [-0.0039, 0.0054]; n=200 | F1 (interpret): 0.0023 [-0.0011, 0.0058]; n=200; changed=18<br>F2 (pertinence): 0.0005 [-0.0034, 0.0043]; n=200; changed=15<br>F3 (interpret): 0.0009 [-0.0024, 0.0042]; n=200; changed=11 |
| B/people/outcome:good | -0.0012 [-0.0048, 0.0024]; n=200 | F1 (interpret): -0.0033 [-0.0068, 0.0003]; n=200; changed=15<br>F2 (pertinence): -0.0004 [-0.0032, 0.0024]; n=200; changed=11<br>F3 (interpret): -0.0014 [-0.0044, 0.0016]; n=200; changed=9 |
| B/people/outcome:unfinished | 0.0005 [-0.0032, 0.0041]; n=200 | F1 (interpret): 0.0009 [-0.0015, 0.0033]; n=200; changed=12<br>F2 (pertinence): -0.0001 [-0.0030, 0.0028]; n=200; changed=9<br>F3 (interpret): 0.0005 [-0.0021, 0.0030]; n=200; changed=7 |
| B/people/receipts | -0.0050 [-0.0347, 0.0247]; n=200 | F1 (interpret): 0.0100 [-0.0212, 0.0412]; n=200; changed=10<br>F2 (pertinence): -0.0050 [-0.0271, 0.0171]; n=200; changed=5<br>F3 (interpret): -0.0150 [-0.0320, 0.0020]; n=200; changed=3 |
| B/people/stabilized | 0.0050 [-0.0307, 0.0407]; n=200 | F1 (interpret): -0.0100 [-0.0442, 0.0242]; n=200; changed=12<br>F2 (pertinence): 0.0050 [-0.0247, 0.0347]; n=200; changed=9<br>F3 (interpret): -0.0050 [-0.0271, 0.0171]; n=200; changed=5<br>F12 (interpret): 0.0050 [-0.0049, 0.0149]; n=200; changed=1 |
| O/body/action:confront | -0.0017 [-0.0077, 0.0044]; n=200 | F1 (interpret): -0.0013 [-0.0055, 0.0030]; n=200; changed=22<br>F2 (pertinence): -0.0013 [-0.0057, 0.0032]; n=200; changed=24<br>F3 (interpret): -0.0013 [-0.0054, 0.0029]; n=200; changed=20<br>F4 (learning, pertinence): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F5 (learning): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F6 (pertinence, interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F7 (interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F8 (learning): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F9 (generate): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F10 (generate): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F11 (generate): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F12 (interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F13 (interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2 |
| O/body/censored | -0.0550 [-0.1147, 0.0047]; n=200 | F1 (interpret): -0.0400 [-0.0860, 0.0060]; n=200; changed=22<br>F2 (pertinence): 0.0050 [-0.0444, 0.0544]; n=200; changed=25<br>F3 (interpret): 0.0150 [-0.0146, 0.0446]; n=200; changed=9 |
| O/body/informative | 0.0100 [-0.0212, 0.0412]; n=200 | F1 (interpret): -0.0050 [-0.0312, 0.0212]; n=200; changed=7<br>F2 (pertinence): 0.0100 [-0.0142, 0.0342]; n=200; changed=6<br>F3 (interpret): 0 [-0.0242, 0.0242]; n=200; changed=6 |
| O/body/learning-epochs | -0.0833 [-0.8963, 0.7296]; n=24 | F1 (interpret): 0.1667 [-0.1810, 0.5143]; n=24; changed=1<br>F2 (pertinence): 0.0870 [-0.0944, 0.2683]; n=23; changed=1<br>F3 (interpret): -0.3333 [-1.0287, 0.3620]; n=24; changed=1 |
| O/body/outcome:bad | 0.0012 [-0.0152, 0.0175]; n=142 | F1 (interpret): -0.0024 [-0.0098, 0.0051]; n=141; changed=2<br>F2 (pertinence): -0.0024 [-0.0098, 0.0051]; n=141; changed=2<br>F3 (interpret): -0.0024 [-0.0070, 0.0023]; n=141; changed=1 |
| O/body/outcome:good | -0.0012 [-0.0175, 0.0152]; n=142 | F1 (interpret): 0.0024 [-0.0051, 0.0098]; n=141; changed=2<br>F2 (pertinence): 0.0024 [-0.0051, 0.0098]; n=141; changed=2<br>F3 (interpret): 0.0024 [-0.0023, 0.0070]; n=141; changed=1 |
| O/body/receipts | -0.0200 [-0.0926, 0.0526]; n=200 | F1 (interpret): -0.0150 [-0.0663, 0.0363]; n=200; changed=21<br>F2 (pertinence): -0.0150 [-0.0682, 0.0382]; n=200; changed=23<br>F3 (interpret): -0.0150 [-0.0644, 0.0344]; n=200; changed=19 |
| O/body/stabilized | 0.0650 [0.0089, 0.1211]; n=200 | F1 (interpret): 0.0350 [-0.0055, 0.0755]; n=200; changed=17<br>F2 (pertinence): 0.0050 [-0.0424, 0.0524]; n=200; changed=23<br>F3 (interpret): -0.0150 [-0.0477, 0.0177]; n=200; changed=11 |
| O/people/action:accept_promise | -0.0104 [-0.0162, -0.0046]; n=200 | F1 (interpret): -0.0004 [-0.0047, 0.0039]; n=200; changed=21<br>F2 (pertinence): -0.0042 [-0.0083, -4.932e-6]; n=200; changed=20<br>F3 (interpret): -0.0004 [-0.0031, 0.0023]; n=200; changed=11 |
| O/people/action:accept_trade | -0.0008 [-0.0056, 0.0040]; n=200 | F1 (interpret): -0.0017 [-0.0053, 0.0020]; n=200; changed=15<br>F2 (pertinence): 0.0029 [-0.0012, 0.0070]; n=200; changed=19<br>F3 (interpret): -0.0046 [-0.0075, -0.0017]; n=200; changed=14<br>F4 (learning, pertinence): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F5 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F6 (pertinence, interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F7 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F8 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F9 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F10 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F11 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F12 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F13 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1 |
| O/people/action:accept_work | 0.0071 [0.0019, 0.0123]; n=200 | F1 (interpret): 0.0033 [-0.0001, 0.0068]; n=200; changed=15<br>F2 (pertinence): -2.776e-19 [-0.0045, 0.0045]; n=200; changed=24<br>F3 (interpret): 0.0050 [0.0020, 0.0080]; n=200; changed=14 |
| O/people/action:chase | 0.0092 [0.0030, 0.0153]; n=200 | F1 (interpret): 0.0017 [-0.0030, 0.0063]; n=200; changed=23<br>F2 (pertinence): -1.249e-18 [-0.0044, 0.0044]; n=200; changed=26<br>F3 (interpret): 0.0071 [0.0029, 0.0112]; n=200; changed=21<br>F4 (learning, pertinence): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F5 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F6 (pertinence, interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F7 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F8 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F9 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F10 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F11 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F12 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F13 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1 |
| O/people/action:give | -0.0025 [-0.0070, 0.0020]; n=200 | F1 (interpret): -0.0008 [-0.0037, 0.0020]; n=200; changed=12<br>F2 (pertinence): 0.0025 [-0.0010, 0.0060]; n=200; changed=18<br>F3 (interpret): -0.0038 [-0.0067, -0.0008]; n=200; changed=13 |
| O/people/action:let_go | -0.0092 [-0.0145, -0.0039]; n=200 | F1 (interpret): -0.0017 [-0.0055, 0.0022]; n=200; changed=16<br>F2 (pertinence): -0.0004 [-0.0049, 0.0040]; n=200; changed=23<br>F3 (interpret): -0.0075 [-0.0122, -0.0028]; n=200; changed=20 |
| O/people/action:pay | 0.0037 [-0.0027, 0.0102]; n=200 | F1 (interpret): -0.0033 [-0.0080, 0.0013]; n=200; changed=27<br>F2 (pertinence): 0.0038 [-0.0011, 0.0086]; n=200; changed=26<br>F3 (interpret): -0.0067 [-0.0109, -0.0024]; n=200; changed=30<br>F4 (learning, pertinence): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F5 (learning): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F6 (pertinence, interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F7 (interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F8 (learning): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F9 (generate): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F10 (generate): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F11 (generate): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F12 (interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F13 (interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2 |
| O/people/action:refuse | 0.0033 [-0.0013, 0.0080]; n=200 | F1 (interpret): 0.0012 [-0.0021, 0.0046]; n=200; changed=17<br>F2 (pertinence): -0.0013 [-0.0048, 0.0023]; n=200; changed=16<br>F3 (interpret): 0.0037 [0.0008, 0.0067]; n=200; changed=13 |
| O/people/action:renege | 1.388e-19 [-0.0074, 0.0074]; n=200 | F1 (interpret): 0.0029 [-0.0013, 0.0072]; n=200; changed=25<br>F2 (pertinence): -0.0029 [-0.0086, 0.0027]; n=200; changed=30<br>F3 (interpret): 0.0058 [0.0010, 0.0107]; n=200; changed=28<br>F4 (learning, pertinence): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F5 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F6 (pertinence, interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F7 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F8 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F9 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F10 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F11 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F12 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F13 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1 |
| O/people/action:wait | 0.0013 [-0.0009, 0.0034]; n=200 | F1 (interpret): 0 [-0.0012, 0.0012]; n=200; changed=2<br>F2 (pertinence): 0.0008 [-0.0008, 0.0025]; n=200; changed=4<br>F3 (interpret): 0.0025 [0.0002, 0.0048]; n=200; changed=8 |
| O/people/outcome:bad | 0.0005 [-0.0061, 0.0070]; n=200 | F1 (interpret): -0.0016 [-0.0051, 0.0019]; n=200; changed=27<br>F2 (pertinence): 0.0015 [-0.0038, 0.0069]; n=200; changed=29<br>F3 (interpret): -0.0028 [-0.0078, 0.0021]; n=200; changed=31 |
| O/people/outcome:good | -0.0008 [-0.0070, 0.0054]; n=200 | F1 (interpret): 0.0012 [-0.0025, 0.0049]; n=200; changed=26<br>F2 (pertinence): -0.0020 [-0.0068, 0.0029]; n=200; changed=26<br>F3 (interpret): 0.0027 [-0.0022, 0.0077]; n=200; changed=30 |
| O/people/outcome:unfinished | 0.0003 [-0.0013, 0.0020]; n=200 | F1 (interpret): 0.0004 [-0.0006, 0.0013]; n=200; changed=3<br>F2 (pertinence): 0.0004 [-0.0012, 0.0021]; n=200; changed=6<br>F3 (interpret): 0.0001 [-0.0011, 0.0013]; n=200; changed=3 |
| O/people/receipts | 0.0200 [-0.0526, 0.0926]; n=200 | F1 (interpret): 0.0150 [-0.0363, 0.0663]; n=200; changed=21<br>F2 (pertinence): 0.0150 [-0.0382, 0.0682]; n=200; changed=23<br>F3 (interpret): 0.0150 [-0.0344, 0.0644]; n=200; changed=19 |

### v1/ESFP minus null

| Metric | Paired difference [95% interval]; pairs | Formula-off interventions |
|---|---|---|
| A/body/action:fight | 0.0008 [-0.0012, 0.0028]; n=200 | F2 (pertinence): -6.939e-20 [-0.0012, 0.0012]; n=200; changed=2<br>F3 (interpret): 0.0013 [-0.0002, 0.0027]; n=200; changed=3 |
| A/body/action:steal | 0.0008 [-0.0012, 0.0028]; n=200 | F2 (pertinence): 0.0017 [3.494e-5, 0.0033]; n=200; changed=4<br>F3 (interpret): -0.0008 [-0.0020, 0.0003]; n=200; changed=2 |
| A/body/censored | -0.0050 [-0.0564, 0.0464]; n=200 | F2 (pertinence): 0.0050 [-0.0444, 0.0544]; n=200; changed=25<br>F3 (interpret): 0.0100 [-0.0212, 0.0412]; n=200; changed=10 |
| A/body/learning-epochs | 0.0400 [-0.2696, 0.3496]; n=75 | F2 (pertinence): 0.1081 [-0.1964, 0.4127]; n=74; changed=16 |
| A/body/outcome:bad | -0.0071 [-0.0248, 0.0106]; n=184 | F2 (pertinence): -0.0052 [-0.0134, 0.0031]; n=184; changed=5<br>F3 (interpret): -0.0054 [-0.0221, 0.0112]; n=184; changed=5 |
| A/body/outcome:good | 0.0023 [-0.0150, 0.0195]; n=184 | F2 (pertinence): 0.0004 [-0.0068, 0.0076]; n=184; changed=4<br>F3 (interpret): 0.0054 [-0.0112, 0.0221]; n=184; changed=5 |
| A/body/outcome:unfinished | 0.0048 [-0.0017, 0.0113]; n=184 | F2 (pertinence): 0.0048 [-0.0017, 0.0113]; n=184; changed=3 |
| A/body/receipts | 0.0200 [-0.0078, 0.0478]; n=200 | F2 (pertinence): 0.0200 [-0.0041, 0.0441]; n=200; changed=6<br>F3 (interpret): 0.0050 [-0.0121, 0.0221]; n=200; changed=3 |
| A/body/stabilized | 0.0050 [-0.0464, 0.0564]; n=200 | F2 (pertinence): -0.0050 [-0.0544, 0.0444]; n=200; changed=25<br>F3 (interpret): -0.0100 [-0.0412, 0.0212]; n=200; changed=10 |
| A/people/action:ask | -0.0017 [-0.0033, -3.494e-5]; n=200 | F3 (interpret): -0.0017 [-0.0033, -3.494e-5]; n=200; changed=4 |
| A/people/action:break | -0.0013 [-0.0034, 0.0009]; n=200 | F2 (pertinence): -0.0008 [-0.0020, 0.0003]; n=200; changed=2<br>F3 (interpret): -0.0008 [-0.0028, 0.0012]; n=200; changed=6 |
| A/people/action:deceive | -0.0013 [-0.0034, 0.0009]; n=200 | F2 (pertinence): -0.0017 [-0.0033, -3.494e-5]; n=200; changed=4<br>F3 (interpret): 0 [-0.0023, 0.0023]; n=200; changed=5 |
| A/people/action:keep | 0.0013 [-0.0015, 0.0040]; n=200 | F2 (pertinence): 0.0017 [3.494e-5, 0.0033]; n=200; changed=4<br>F3 (interpret): -2.776e-19 [-0.0023, 0.0023]; n=200; changed=8 |
| A/people/action:leave | 0 [-0.0023, 0.0023]; n=200 | F2 (pertinence): -0.0008 [-0.0025, 0.0008]; n=200; changed=4<br>F3 (interpret): 0.0008 [-0.0008, 0.0025]; n=200; changed=4 |
| A/people/action:trade | 0.0013 [-0.0009, 0.0034]; n=200 | F3 (interpret): 0.0012 [-0.0009, 0.0034]; n=200; changed=7 |
| A/people/action:wait | -0.0008 [-0.0020, 0.0003]; n=200 | F3 (interpret): -0.0008 [-0.0020, 0.0003]; n=200; changed=2 |
| A/people/action:work | 0.0008 [-0.0012, 0.0028]; n=200 | F3 (interpret): 0.0008 [-0.0018, 0.0034]; n=200; changed=7 |
| A/people/censored | -0.0350 [-0.0674, -0.0026]; n=200 | F2 (pertinence): -0.0250 [-0.0509, 0.0009]; n=200; changed=7<br>F3 (interpret): -0.0250 [-0.0509, 0.0009]; n=200; changed=7 |
| A/people/outcome:bad | 0.0041 [-0.0003, 0.0086]; n=200 | F2 (pertinence): 0.0006 [-0.0019, 0.0032]; n=200; changed=10<br>F3 (interpret): 0.0031 [-0.0006, 0.0068]; n=200; changed=8 |
| A/people/outcome:good | -0.0018 [-0.0057, 0.0020]; n=200 | F2 (pertinence): -0.0001 [-0.0030, 0.0027]; n=200; changed=7<br>F3 (interpret): -0.0020 [-0.0054, 0.0013]; n=200; changed=9 |
| A/people/outcome:unfinished | -0.0023 [-0.0045, -0.0001]; n=200 | F2 (pertinence): -0.0005 [-0.0027, 0.0017]; n=200; changed=7<br>F3 (interpret): -0.0011 [-0.0025, 0.0004]; n=200; changed=4 |
| A/people/receipts | -0.0200 [-0.0478, 0.0078]; n=200 | F2 (pertinence): -0.0200 [-0.0441, 0.0041]; n=200; changed=6<br>F3 (interpret): -0.0050 [-0.0221, 0.0121]; n=200; changed=3 |
| A/people/stabilized | 0.0350 [0.0026, 0.0674]; n=200 | F2 (pertinence): 0.0250 [-0.0009, 0.0509]; n=200; changed=7<br>F3 (interpret): 0.0250 [-0.0009, 0.0509]; n=200; changed=7 |
| B/body/action:fight | 0.0017 [-0.0009, 0.0043]; n=200 | F1 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F2 (pertinence): 0.0012 [-0.0012, 0.0037]; n=200; changed=6<br>F3 (interpret): 0.0013 [-0.0002, 0.0027]; n=200; changed=4<br>F4 (learning, pertinence): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F5 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F6 (pertinence, interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F7 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F8 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F9 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F10 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F11 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F12 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F13 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1 |
| B/body/action:steal | -0.0017 [-0.0043, 0.0009]; n=200 | F2 (pertinence): -0.0021 [-0.0042, 0.0001]; n=200; changed=7<br>F3 (interpret): -0.0004 [-0.0023, 0.0014]; n=200; changed=5 |
| B/body/censored | 0 [-0.0420, 0.0420]; n=200 | F2 (pertinence): -0.0100 [-0.0519, 0.0319]; n=200; changed=18<br>F3 (interpret): 0.0050 [-0.0121, 0.0221]; n=200; changed=3 |
| B/body/informative | 0 [-0.0140, 0.0140]; n=200 | F2 (pertinence): -0.0050 [-0.0149, 0.0049]; n=200; changed=1<br>F3 (interpret): 0 [-0.0140, 0.0140]; n=200; changed=2 |
| B/body/learning-epochs | -0.1039 [-0.3246, 0.1168]; n=77 | F2 (pertinence): 0.0263 [-0.2278, 0.2805]; n=76; changed=13<br>F3 (interpret): -0.0519 [-0.1559, 0.0520]; n=77; changed=1 |
| B/body/outcome:bad | -0.0020 [-0.0088, 0.0049]; n=186 | F2 (pertinence): -0.0038 [-0.0115, 0.0040]; n=186; changed=6 |
| B/body/outcome:good | 0.0020 [-0.0049, 0.0088]; n=186 | F2 (pertinence): 0.0048 [-0.0032, 0.0128]; n=186; changed=7 |
| B/body/receipts | 0 [-0.0343, 0.0343]; n=200 | F2 (pertinence): -0.0100 [-0.0379, 0.0179]; n=200; changed=8<br>F3 (interpret): 0.0100 [-0.0142, 0.0342]; n=200; changed=6 |
| B/body/stabilized | 0 [-0.0396, 0.0396]; n=200 | F2 (pertinence): 0.0050 [-0.0358, 0.0458]; n=200; changed=17<br>F3 (interpret): -0.0050 [-0.0221, 0.0121]; n=200; changed=3 |
| B/people/action:ask | -0.0008 [-0.0020, 0.0003]; n=200 | F2 (pertinence): -0.0004 [-0.0012, 0.0004]; n=200; changed=1<br>F3 (interpret): -0.0004 [-0.0012, 0.0004]; n=200; changed=1 |
| B/people/action:break | -0.0021 [-0.0045, 0.0004]; n=200 | F2 (pertinence): 0.0004 [-0.0004, 0.0012]; n=200; changed=1<br>F3 (interpret): -0.0021 [-0.0048, 0.0006]; n=200; changed=11 |
| B/people/action:deceive | -0.0021 [-0.0057, 0.0015]; n=200 | F2 (pertinence): 0.0017 [-0.0003, 0.0037]; n=200; changed=6<br>F3 (interpret): -0.0029 [-0.0061, 0.0002]; n=200; changed=12 |
| B/people/action:keep | 0.0033 [0.0008, 0.0059]; n=200 | F1 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F2 (pertinence): 0.0004 [-0.0010, 0.0018]; n=200; changed=3<br>F3 (interpret): 0.0025 [0.0002, 0.0048]; n=200; changed=8<br>F4 (learning, pertinence): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F5 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F6 (pertinence, interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F7 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F8 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F9 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F10 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F11 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F12 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F13 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1 |
| B/people/action:leave | -0.0017 [-0.0040, 0.0007]; n=200 | F2 (pertinence): -0.0017 [-0.0037, 0.0003]; n=200; changed=6<br>F3 (interpret): 0 [-0.0016, 0.0016]; n=200; changed=4 |
| B/people/action:trade | 0.0013 [-0.0006, 0.0031]; n=200 | F2 (pertinence): 0.0013 [-0.0002, 0.0027]; n=200; changed=3<br>F3 (interpret): 0.0004 [-0.0004, 0.0012]; n=200; changed=1 |
| B/people/action:wait | -0.0008 [-0.0020, 0.0003]; n=200 | F3 (interpret): -0.0013 [-0.0027, 0.0002]; n=200; changed=3 |
| B/people/action:work | 0.0029 [-2.670e-5, 0.0059]; n=200 | F2 (pertinence): -0.0008 [-0.0025, 0.0008]; n=200; changed=4<br>F3 (interpret): 0.0029 [0.0005, 0.0054]; n=200; changed=9 |
| B/people/censored | -0.0250 [-0.0576, 0.0076]; n=200 | F2 (pertinence): -0.0100 [-0.0297, 0.0097]; n=200; changed=4<br>F3 (interpret): -0.0300 [-0.0610, 0.0010]; n=200; changed=10 |
| B/people/learning-epochs | 0.1111 [-0.1452, 0.3674]; n=9 | F2 (pertinence): 0.1111 [-0.1452, 0.3674]; n=9; changed=1 |
| B/people/outcome:bad | -0.0020 [-0.0058, 0.0018]; n=200 | F2 (pertinence): -0.0027 [-0.0063, 0.0008]; n=200; changed=15<br>F3 (interpret): -0.0002 [-0.0027, 0.0024]; n=200; changed=11 |
| B/people/outcome:good | 0.0007 [-0.0029, 0.0042]; n=200 | F2 (pertinence): 0.0008 [-0.0022, 0.0037]; n=200; changed=11<br>F3 (interpret): -0.0006 [-0.0028, 0.0015]; n=200; changed=9 |
| B/people/outcome:unfinished | 0.0013 [-0.0011, 0.0038]; n=200 | F2 (pertinence): 0.0019 [-0.0009, 0.0048]; n=200; changed=12<br>F3 (interpret): 0.0008 [-0.0005, 0.0021]; n=200; changed=7 |
| B/people/receipts | 0 [-0.0343, 0.0343]; n=200 | F2 (pertinence): 0.0100 [-0.0179, 0.0379]; n=200; changed=8<br>F3 (interpret): -0.0100 [-0.0342, 0.0142]; n=200; changed=6 |
| B/people/stabilized | 0.0250 [-0.0076, 0.0576]; n=200 | F2 (pertinence): 0.0100 [-0.0097, 0.0297]; n=200; changed=4<br>F3 (interpret): 0.0300 [-0.0010, 0.0610]; n=200; changed=10 |
| O/body/action:confront | 0.0012 [-0.0040, 0.0065]; n=200 | F1 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F2 (pertinence): 0.0021 [-0.0017, 0.0058]; n=200; changed=21<br>F3 (interpret): -0.0021 [-0.0057, 0.0015]; n=200; changed=16<br>F4 (learning, pertinence): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F5 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F6 (pertinence, interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F7 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F8 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F9 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F10 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F11 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F12 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F13 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1 |
| O/body/censored | -0.0200 [-0.0704, 0.0304]; n=200 | F2 (pertinence): -0.0100 [-0.0542, 0.0342]; n=200; changed=20<br>F3 (interpret): -0.0350 [-0.0643, -0.0057]; n=200; changed=9 |
| O/body/informative | -0.0050 [-0.0347, 0.0247]; n=200 | F2 (pertinence): -0.0050 [-0.0221, 0.0121]; n=200; changed=3<br>F3 (interpret): -0.0200 [-0.0441, 0.0041]; n=200; changed=6 |
| O/body/learning-epochs | -0.2800 [-0.6315, 0.0715]; n=25 | F2 (pertinence): -0.2800 [-0.6315, 0.0715]; n=25; changed=3<br>F3 (interpret): 0.0833 [-0.0905, 0.2572]; n=24; changed=1 |
| O/body/outcome:bad | 0.0047 [-0.0027, 0.0121]; n=141 | F2 (pertinence): 0.0047 [-0.0027, 0.0121]; n=141; changed=2 |
| O/body/outcome:good | -0.0047 [-0.0121, 0.0027]; n=141 | F2 (pertinence): -0.0047 [-0.0121, 0.0027]; n=141; changed=2 |
| O/body/receipts | 0.0150 [-0.0483, 0.0783]; n=200 | F2 (pertinence): 0.0250 [-0.0202, 0.0702]; n=200; changed=21<br>F3 (interpret): -0.0250 [-0.0680, 0.0180]; n=200; changed=16 |
| O/body/stabilized | 0.0150 [-0.0303, 0.0603]; n=200 | F2 (pertinence): 0.0050 [-0.0358, 0.0458]; n=200; changed=17<br>F3 (interpret): 0.0150 [-0.0070, 0.0370]; n=200; changed=5 |
| O/people/action:accept_promise | 0.0012 [-0.0033, 0.0058]; n=200 | F2 (pertinence): 0.0004 [-0.0030, 0.0038]; n=200; changed=14<br>F3 (interpret): 6.939e-20 [-0.0026, 0.0026]; n=200; changed=10 |
| O/people/action:accept_trade | 0.0037 [-0.0007, 0.0082]; n=200 | F2 (pertinence): -0.0008 [-0.0045, 0.0029]; n=200; changed=12<br>F3 (interpret): 0.0025 [-0.0013, 0.0063]; n=200; changed=16 |
| O/people/action:accept_work | -0.0062 [-0.0112, -0.0013]; n=200 | F2 (pertinence): -0.0021 [-0.0065, 0.0023]; n=200; changed=18<br>F3 (interpret): -0.0029 [-0.0063, 0.0005]; n=200; changed=14 |
| O/people/action:chase | -0.0054 [-0.0106, -0.0002]; n=200 | F2 (pertinence): 0.0017 [-0.0024, 0.0057]; n=200; changed=21<br>F3 (interpret): -0.0050 [-0.0091, -0.0009]; n=200; changed=20 |
| O/people/action:give | 0.0017 [-0.0030, 0.0063]; n=200 | F2 (pertinence): -0.0029 [-0.0063, 0.0005]; n=200; changed=14<br>F3 (interpret): 0.0037 [9.883e-6, 0.0075]; n=200; changed=21 |
| O/people/action:let_go | 0.0088 [0.0036, 0.0139]; n=200 | F1 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F2 (pertinence): -0.0017 [-0.0052, 0.0018]; n=200; changed=19<br>F3 (interpret): 0.0092 [0.0052, 0.0132]; n=200; changed=23<br>F4 (learning, pertinence): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F5 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F6 (pertinence, interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F7 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F8 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F9 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F10 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F11 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F12 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F13 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1 |
| O/people/action:pay | 0.0071 [0.0011, 0.0131]; n=200 | F1 (interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F2 (pertinence): 0.0042 [4.932e-6, 0.0083]; n=200; changed=24<br>F3 (interpret): 0.0037 [-0.0002, 0.0077]; n=200; changed=24<br>F4 (learning, pertinence): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F5 (learning): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F6 (pertinence, interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F7 (interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F8 (learning): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F9 (generate): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F10 (generate): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F11 (generate): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F12 (interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F13 (interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2 |
| O/people/action:refuse | -0.0021 [-0.0068, 0.0026]; n=200 | F2 (pertinence): 0.0042 [0.0009, 0.0074]; n=200; changed=13<br>F3 (interpret): -0.0038 [-0.0078, 0.0003]; n=200; changed=22 |
| O/people/action:renege | -0.0079 [-0.0137, -0.0021]; n=200 | F2 (pertinence): -0.0058 [-0.0106, -0.0011]; n=200; changed=28<br>F3 (interpret): -0.0029 [-0.0068, 0.0010]; n=200; changed=23 |
| O/people/action:wait | -0.0021 [-0.0042, 0.0001]; n=200 | F2 (pertinence): 0.0008 [-0.0003, 0.0020]; n=200; changed=2<br>F3 (interpret): -0.0025 [-0.0045, -0.0005]; n=200; changed=6 |
| O/people/outcome:bad | 0.0029 [-0.0030, 0.0088]; n=200 | F2 (pertinence): -0.0029 [-0.0067, 0.0009]; n=200; changed=26<br>F3 (interpret): 0.0046 [-0.0003, 0.0095]; n=200; changed=28 |
| O/people/outcome:good | -0.0029 [-0.0088, 0.0030]; n=200 | F2 (pertinence): 0.0033 [-0.0006, 0.0072]; n=200; changed=27<br>F3 (interpret): -0.0045 [-0.0094, 0.0004]; n=200; changed=27 |
| O/people/outcome:unfinished | -3.535e-5 [-0.0002, 0.0001]; n=200 | F2 (pertinence): -0.0005 [-0.0014, 0.0004]; n=200; changed=1<br>F3 (interpret): -0.0001 [-0.0002, 3.560e-5]; n=200; changed=2 |
| O/people/receipts | -0.0150 [-0.0783, 0.0483]; n=200 | F2 (pertinence): -0.0250 [-0.0702, 0.0202]; n=200; changed=21<br>F3 (interpret): 0.0250 [-0.0180, 0.0680]; n=200; changed=16 |

### v1/ISFP minus null

| Metric | Paired difference [95% interval]; pairs | Formula-off interventions |
|---|---|---|
| A/body/action:fight | 0.0021 [-0.0009, 0.0050]; n=200 | F1 (interpret): 0.0021 [-0.0004, 0.0045]; n=200; changed=9<br>F2 (pertinence): 0.0012 [-0.0009, 0.0034]; n=200; changed=7<br>F3 (interpret): 0.0004 [-0.0014, 0.0023]; n=200; changed=5 |
| A/body/action:steal | -0.0013 [-0.0042, 0.0017]; n=200 | F1 (interpret): -0.0008 [-0.0034, 0.0018]; n=200; changed=7<br>F2 (pertinence): -0.0013 [-0.0031, 0.0006]; n=200; changed=5<br>F3 (interpret): 2.082e-19 [-0.0023, 0.0023]; n=200; changed=8 |
| A/body/censored | -0.0300 [-0.0908, 0.0308]; n=200 | F1 (interpret): -0.0200 [-0.0704, 0.0304]; n=200; changed=26<br>F2 (pertinence): 0.0050 [-0.0403, 0.0503]; n=200; changed=21<br>F3 (interpret): 0.0150 [-0.0070, 0.0370]; n=200; changed=5 |
| A/body/informative | 0.0050 [-0.0049, 0.0149]; n=200 | F1 (interpret): 0.0050 [-0.0049, 0.0149]; n=200; changed=1 |
| A/body/learning-epochs | 0.5890 [0.2821, 0.8960]; n=73 | F1 (interpret): 0.2676 [0.0203, 0.5149]; n=71; changed=10<br>F2 (pertinence): 0.1972 [-0.1377, 0.5321]; n=71; changed=9<br>F3 (interpret): 0.0833 [-0.0834, 0.2501]; n=72; changed=1 |
| A/body/outcome:bad | 0.0066 [-0.0062, 0.0194]; n=184 | F1 (interpret): 0.0059 [-0.0060, 0.0178]; n=184; changed=4<br>F2 (pertinence): 0.0029 [-0.0018, 0.0076]; n=184; changed=4<br>F3 (interpret): 0.0032 [-0.0085, 0.0149]; n=184; changed=5 |
| A/body/outcome:good | -0.0055 [-0.0189, 0.0078]; n=184 | F1 (interpret): -0.0059 [-0.0178, 0.0060]; n=184; changed=4<br>F2 (pertinence): -0.0029 [-0.0076, 0.0018]; n=184; changed=4<br>F3 (interpret): -0.0021 [-0.0144, 0.0102]; n=184; changed=5 |
| A/body/outcome:unfinished | -0.0011 [-0.0032, 0.0011]; n=184 | F3 (interpret): -0.0011 [-0.0032, 0.0011]; n=184; changed=1 |
| A/body/receipts | 0.0100 [-0.0242, 0.0442]; n=200 | F1 (interpret): 0.0150 [-0.0111, 0.0411]; n=200; changed=7<br>F2 (pertinence): 0 [-0.0242, 0.0242]; n=200; changed=6<br>F3 (interpret): 0.0050 [-0.0212, 0.0312]; n=200; changed=7 |
| A/body/stabilized | 0.0350 [-0.0250, 0.0950]; n=200 | F1 (interpret): 0.0250 [-0.0243, 0.0743]; n=200; changed=25<br>F2 (pertinence): -0.0050 [-0.0503, 0.0403]; n=200; changed=21<br>F3 (interpret): -0.0150 [-0.0370, 0.0070]; n=200; changed=5 |
| A/people/action:ask | 0.0004 [-0.0021, 0.0029]; n=200 | F1 (interpret): -0.0004 [-0.0018, 0.0010]; n=200; changed=3<br>F2 (pertinence): -0.0013 [-0.0031, 0.0006]; n=200; changed=2<br>F3 (interpret): 0.0008 [-0.0003, 0.0020]; n=200; changed=2 |
| A/people/action:break | 0.0008 [-0.0015, 0.0032]; n=200 | F1 (interpret): -0.0008 [-0.0028, 0.0012]; n=200; changed=6<br>F2 (pertinence): -0.0004 [-0.0018, 0.0010]; n=200; changed=3<br>F3 (interpret): 0.0029 [0.0002, 0.0056]; n=200; changed=11 |
| A/people/action:deceive | 0.0013 [-0.0017, 0.0042]; n=200 | F1 (interpret): 0 [-0.0020, 0.0020]; n=200; changed=6<br>F2 (pertinence): -0.0004 [-0.0023, 0.0014]; n=200; changed=5<br>F3 (interpret): -0.0004 [-0.0029, 0.0021]; n=200; changed=9 |
| A/people/action:keep | -1.388e-19 [-0.0039, 0.0039]; n=200 | F1 (interpret): 0.0012 [-0.0015, 0.0040]; n=200; changed=11<br>F2 (pertinence): -0.0004 [-0.0031, 0.0023]; n=200; changed=11<br>F3 (interpret): -0.0017 [-0.0047, 0.0014]; n=200; changed=14 |
| A/people/action:leave | -0.0021 [-0.0058, 0.0017]; n=200 | F1 (interpret): -0.0021 [-0.0048, 0.0006]; n=200; changed=11<br>F2 (pertinence): 0.0008 [-0.0020, 0.0037]; n=200; changed=12<br>F3 (interpret): -0.0008 [-0.0028, 0.0012]; n=200; changed=6 |
| A/people/action:trade | -0.0008 [-0.0037, 0.0020]; n=200 | F1 (interpret): 0.0008 [-0.0012, 0.0028]; n=200; changed=6<br>F2 (pertinence): 0.0004 [-0.0018, 0.0026]; n=200; changed=4<br>F3 (interpret): -0.0008 [-0.0025, 0.0008]; n=200; changed=4 |
| A/people/action:work | -0.0004 [-0.0034, 0.0026]; n=200 | F1 (interpret): 0 [-0.0020, 0.0020]; n=200; changed=6<br>F2 (pertinence): 0.0013 [-0.0009, 0.0034]; n=200; changed=4<br>F3 (interpret): -0.0008 [-0.0028, 0.0012]; n=200; changed=7<br>F4 (learning, pertinence): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F5 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F6 (pertinence, interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F7 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F8 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F9 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F10 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F11 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F12 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F13 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1 |
| A/people/censored | -0.0050 [-0.0378, 0.0278]; n=200 | F1 (interpret): 0.0100 [-0.0179, 0.0379]; n=200; changed=8<br>F2 (pertinence): -0.0150 [-0.0370, 0.0070]; n=200; changed=5<br>F3 (interpret): -0.0150 [-0.0370, 0.0070]; n=200; changed=5 |
| A/people/outcome:bad | 0.0010 [-0.0025, 0.0045]; n=200 | F1 (interpret): 0.0010 [-0.0022, 0.0042]; n=200; changed=10<br>F2 (pertinence): -0.0014 [-0.0043, 0.0016]; n=200; changed=11<br>F3 (interpret): -0.0024 [-0.0055, 0.0007]; n=200; changed=10 |
| A/people/outcome:good | -0.0014 [-0.0051, 0.0022]; n=200 | F1 (interpret): -0.0012 [-0.0043, 0.0019]; n=200; changed=8<br>F2 (pertinence): 0.0006 [-0.0024, 0.0036]; n=200; changed=11<br>F3 (interpret): 0.0013 [-0.0013, 0.0038]; n=200; changed=11 |
| A/people/outcome:unfinished | 0.0005 [-0.0022, 0.0031]; n=200 | F1 (interpret): 0.0002 [-0.0001, 0.0005]; n=200; changed=7<br>F2 (pertinence): 0.0008 [-0.0020, 0.0035]; n=200; changed=10<br>F3 (interpret): 0.0011 [-0.0004, 0.0026]; n=200; changed=7 |
| A/people/receipts | -0.0100 [-0.0442, 0.0242]; n=200 | F1 (interpret): -0.0150 [-0.0411, 0.0111]; n=200; changed=7<br>F2 (pertinence): 0 [-0.0242, 0.0242]; n=200; changed=6<br>F3 (interpret): -0.0050 [-0.0312, 0.0212]; n=200; changed=7 |
| A/people/stabilized | 0.0050 [-0.0278, 0.0378]; n=200 | F1 (interpret): -0.0100 [-0.0379, 0.0179]; n=200; changed=8<br>F2 (pertinence): 0.0150 [-0.0070, 0.0370]; n=200; changed=5<br>F3 (interpret): 0.0150 [-0.0070, 0.0370]; n=200; changed=5 |
| B/body/action:fight | 0.0017 [-0.0003, 0.0037]; n=200 | F1 (interpret): 0.0008 [-0.0008, 0.0025]; n=200; changed=4<br>F2 (pertinence): 0.0008 [-0.0008, 0.0025]; n=200; changed=4<br>F3 (interpret): 0.0013 [-0.0002, 0.0027]; n=200; changed=3 |
| B/body/action:steal | -0.0012 [-0.0037, 0.0012]; n=200 | F1 (interpret): -0.0017 [-0.0043, 0.0009]; n=200; changed=10<br>F2 (pertinence): -0.0004 [-0.0023, 0.0014]; n=200; changed=5<br>F3 (interpret): -4.163e-19 [-0.0020, 0.0020]; n=200; changed=6 |
| B/body/censored | -0.0050 [-0.0635, 0.0535]; n=200 | F1 (interpret): -0.0050 [-0.0458, 0.0358]; n=200; changed=17<br>F2 (pertinence): -0.0100 [-0.0584, 0.0384]; n=200; changed=24<br>F3 (interpret): 0 [-0.0280, 0.0280]; n=200; changed=8 |
| B/body/learning-epochs | -0.1324 [-0.5187, 0.2540]; n=68 | F1 (interpret): -0.1231 [-0.4529, 0.2067]; n=65; changed=5<br>F2 (pertinence): -0.1940 [-0.4957, 0.1076]; n=67; changed=5 |
| B/body/outcome:bad | 0.0118 [-0.0020, 0.0255]; n=187 | F1 (interpret): 0.0013 [-0.0074, 0.0100]; n=187; changed=6<br>F2 (pertinence): 0.0093 [-0.0032, 0.0217]; n=187; changed=7<br>F3 (interpret): 0.0049 [-0.0013, 0.0111]; n=186; changed=3 |
| B/body/outcome:good | -0.0133 [-0.0273, 0.0008]; n=187 | F1 (interpret): 2.969e-19 [-0.0083, 0.0083]; n=187; changed=5<br>F2 (pertinence): -0.0121 [-0.0252, 0.0009]; n=187; changed=9<br>F3 (interpret): -0.0036 [-0.0092, 0.0020]; n=186; changed=2 |
| B/body/outcome:unfinished | 0.0015 [-0.0047, 0.0077]; n=187 | F1 (interpret): -0.0013 [-0.0040, 0.0013]; n=187; changed=1<br>F2 (pertinence): 0.0029 [-0.0027, 0.0084]; n=187; changed=4<br>F3 (interpret): -0.0013 [-0.0040, 0.0013]; n=186; changed=1 |
| B/body/receipts | 0.0050 [-0.0247, 0.0347]; n=200 | F1 (interpret): -0.0100 [-0.0412, 0.0212]; n=200; changed=10<br>F2 (pertinence): 0.0050 [-0.0171, 0.0271]; n=200; changed=5<br>F3 (interpret): 0.0150 [-0.0020, 0.0320]; n=200; changed=3 |
| B/body/stabilized | 0.0050 [-0.0535, 0.0635]; n=200 | F1 (interpret): 0 [-0.0420, 0.0420]; n=200; changed=18<br>F2 (pertinence): 0.0100 [-0.0384, 0.0584]; n=200; changed=24<br>F3 (interpret): 0.0050 [-0.0212, 0.0312]; n=200; changed=7 |
| B/people/action:ask | 0.0013 [-0.0006, 0.0031]; n=200 | F1 (interpret): 0 [-0.0012, 0.0012]; n=200; changed=2<br>F2 (pertinence): 0.0004 [-0.0010, 0.0018]; n=200; changed=3<br>F3 (interpret): 0.0004 [-0.0004, 0.0012]; n=200; changed=1 |
| B/people/action:break | 0.0008 [-0.0018, 0.0034]; n=200 | F1 (interpret): 0 [-0.0016, 0.0016]; n=200; changed=4<br>F2 (pertinence): 6.939e-20 [-0.0012, 0.0012]; n=200; changed=2<br>F3 (interpret): 0.0021 [-0.0006, 0.0048]; n=200; changed=11 |
| B/people/action:deceive | 0.0008 [-0.0020, 0.0037]; n=200 | F1 (interpret): 1.388e-19 [-0.0035, 0.0035]; n=200; changed=18<br>F2 (pertinence): -0.0004 [-0.0023, 0.0014]; n=200; changed=5<br>F3 (interpret): 0.0017 [-0.0009, 0.0043]; n=200; changed=10 |
| B/people/action:keep | 6.939e-20 [-0.0026, 0.0026]; n=200 | F1 (interpret): 0.0008 [-0.0012, 0.0028]; n=200; changed=6<br>F2 (pertinence): 0.0004 [-0.0010, 0.0018]; n=200; changed=3<br>F3 (interpret): -0.0025 [-0.0048, -0.0002]; n=200; changed=8 |
| B/people/action:leave | -0.0017 [-0.0040, 0.0007]; n=200 | F1 (interpret): -0.0013 [-0.0031, 0.0006]; n=200; changed=5<br>F2 (pertinence): -6.939e-20 [-0.0016, 0.0016]; n=200; changed=4<br>F3 (interpret): -0.0004 [-0.0012, 0.0004]; n=200; changed=1 |
| B/people/action:trade | -0.0008 [-0.0034, 0.0018]; n=200 | F1 (interpret): 0.0013 [-0.0009, 0.0034]; n=200; changed=7<br>F2 (pertinence): 0.0004 [-0.0018, 0.0026]; n=200; changed=7<br>F3 (interpret): -0.0004 [-0.0012, 0.0004]; n=200; changed=1 |
| B/people/action:wait | -6.939e-20 [-0.0016, 0.0016]; n=200 | F1 (interpret): -0.0008 [-0.0020, 0.0003]; n=200; changed=2<br>F2 (pertinence): -0.0004 [-0.0012, 0.0004]; n=200; changed=1<br>F3 (interpret): 0.0008 [-0.0008, 0.0025]; n=200; changed=4 |
| B/people/action:work | -0.0008 [-0.0037, 0.0020]; n=200 | F1 (interpret): 0.0008 [-0.0027, 0.0043]; n=200; changed=15<br>F2 (pertinence): -0.0008 [-0.0028, 0.0012]; n=200; changed=6<br>F3 (interpret): -0.0029 [-0.0051, -0.0008]; n=200; changed=7 |
| B/people/censored | -0.0050 [-0.0407, 0.0307]; n=200 | F1 (interpret): 0.0100 [-0.0242, 0.0442]; n=200; changed=12<br>F2 (pertinence): -0.0050 [-0.0347, 0.0247]; n=200; changed=9<br>F3 (interpret): 0.0050 [-0.0171, 0.0271]; n=200; changed=5<br>F12 (interpret): -0.0050 [-0.0149, 0.0049]; n=200; changed=1 |
| B/people/learning-epochs | -0.1667 [-1.8482, 1.5149]; n=6 | F1 (interpret): -1.6000 [-3.0160, -0.1840]; n=5; changed=4<br>F2 (pertinence): -0.1667 [-0.5952, 0.2618]; n=6; changed=1<br>F3 (interpret): -0.5000 [-1.7855, 0.7855]; n=6; changed=1 |
| B/people/outcome:bad | 0.0008 [-0.0039, 0.0054]; n=200 | F1 (interpret): 0.0023 [-0.0011, 0.0058]; n=200; changed=18<br>F2 (pertinence): 0.0005 [-0.0034, 0.0043]; n=200; changed=15<br>F3 (interpret): 0.0009 [-0.0024, 0.0042]; n=200; changed=11 |
| B/people/outcome:good | -0.0012 [-0.0048, 0.0024]; n=200 | F1 (interpret): -0.0033 [-0.0068, 0.0003]; n=200; changed=15<br>F2 (pertinence): -0.0004 [-0.0032, 0.0024]; n=200; changed=11<br>F3 (interpret): -0.0014 [-0.0044, 0.0016]; n=200; changed=9 |
| B/people/outcome:unfinished | 0.0005 [-0.0032, 0.0041]; n=200 | F1 (interpret): 0.0009 [-0.0015, 0.0033]; n=200; changed=12<br>F2 (pertinence): -0.0001 [-0.0030, 0.0028]; n=200; changed=9<br>F3 (interpret): 0.0005 [-0.0021, 0.0030]; n=200; changed=7 |
| B/people/receipts | -0.0050 [-0.0347, 0.0247]; n=200 | F1 (interpret): 0.0100 [-0.0212, 0.0412]; n=200; changed=10<br>F2 (pertinence): -0.0050 [-0.0271, 0.0171]; n=200; changed=5<br>F3 (interpret): -0.0150 [-0.0320, 0.0020]; n=200; changed=3 |
| B/people/stabilized | 0.0050 [-0.0307, 0.0407]; n=200 | F1 (interpret): -0.0100 [-0.0442, 0.0242]; n=200; changed=12<br>F2 (pertinence): 0.0050 [-0.0247, 0.0347]; n=200; changed=9<br>F3 (interpret): -0.0050 [-0.0271, 0.0171]; n=200; changed=5<br>F12 (interpret): 0.0050 [-0.0049, 0.0149]; n=200; changed=1 |
| O/body/action:confront | -0.0017 [-0.0077, 0.0044]; n=200 | F1 (interpret): -0.0013 [-0.0055, 0.0030]; n=200; changed=22<br>F2 (pertinence): -0.0013 [-0.0057, 0.0032]; n=200; changed=24<br>F3 (interpret): -0.0013 [-0.0054, 0.0029]; n=200; changed=20<br>F4 (learning, pertinence): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F5 (learning): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F6 (pertinence, interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F7 (interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F8 (learning): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F9 (generate): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F10 (generate): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F11 (generate): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F12 (interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F13 (interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2 |
| O/body/censored | -0.0550 [-0.1147, 0.0047]; n=200 | F1 (interpret): -0.0400 [-0.0860, 0.0060]; n=200; changed=22<br>F2 (pertinence): 0.0050 [-0.0444, 0.0544]; n=200; changed=25<br>F3 (interpret): 0.0150 [-0.0146, 0.0446]; n=200; changed=9 |
| O/body/informative | 0.0100 [-0.0212, 0.0412]; n=200 | F1 (interpret): -0.0050 [-0.0312, 0.0212]; n=200; changed=7<br>F2 (pertinence): 0.0100 [-0.0142, 0.0342]; n=200; changed=6<br>F3 (interpret): 0 [-0.0242, 0.0242]; n=200; changed=6 |
| O/body/learning-epochs | -0.0833 [-0.8963, 0.7296]; n=24 | F1 (interpret): 0.1667 [-0.1810, 0.5143]; n=24; changed=1<br>F2 (pertinence): 0.0870 [-0.0944, 0.2683]; n=23; changed=1<br>F3 (interpret): -0.3333 [-1.0287, 0.3620]; n=24; changed=1 |
| O/body/outcome:bad | 0.0012 [-0.0152, 0.0175]; n=142 | F1 (interpret): -0.0024 [-0.0098, 0.0051]; n=141; changed=2<br>F2 (pertinence): -0.0024 [-0.0098, 0.0051]; n=141; changed=2<br>F3 (interpret): -0.0024 [-0.0070, 0.0023]; n=141; changed=1 |
| O/body/outcome:good | -0.0012 [-0.0175, 0.0152]; n=142 | F1 (interpret): 0.0024 [-0.0051, 0.0098]; n=141; changed=2<br>F2 (pertinence): 0.0024 [-0.0051, 0.0098]; n=141; changed=2<br>F3 (interpret): 0.0024 [-0.0023, 0.0070]; n=141; changed=1 |
| O/body/receipts | -0.0200 [-0.0926, 0.0526]; n=200 | F1 (interpret): -0.0150 [-0.0663, 0.0363]; n=200; changed=21<br>F2 (pertinence): -0.0150 [-0.0682, 0.0382]; n=200; changed=23<br>F3 (interpret): -0.0150 [-0.0644, 0.0344]; n=200; changed=19 |
| O/body/stabilized | 0.0650 [0.0089, 0.1211]; n=200 | F1 (interpret): 0.0350 [-0.0055, 0.0755]; n=200; changed=17<br>F2 (pertinence): 0.0050 [-0.0424, 0.0524]; n=200; changed=23<br>F3 (interpret): -0.0150 [-0.0477, 0.0177]; n=200; changed=11 |
| O/people/action:accept_promise | -0.0104 [-0.0162, -0.0046]; n=200 | F1 (interpret): -0.0004 [-0.0047, 0.0039]; n=200; changed=21<br>F2 (pertinence): -0.0042 [-0.0083, -4.932e-6]; n=200; changed=20<br>F3 (interpret): -0.0004 [-0.0031, 0.0023]; n=200; changed=11 |
| O/people/action:accept_trade | -0.0008 [-0.0056, 0.0040]; n=200 | F1 (interpret): -0.0017 [-0.0053, 0.0020]; n=200; changed=15<br>F2 (pertinence): 0.0029 [-0.0012, 0.0070]; n=200; changed=19<br>F3 (interpret): -0.0046 [-0.0075, -0.0017]; n=200; changed=14<br>F4 (learning, pertinence): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F5 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F6 (pertinence, interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F7 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F8 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F9 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F10 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F11 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F12 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F13 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1 |
| O/people/action:accept_work | 0.0071 [0.0019, 0.0123]; n=200 | F1 (interpret): 0.0033 [-0.0001, 0.0068]; n=200; changed=15<br>F2 (pertinence): -2.776e-19 [-0.0045, 0.0045]; n=200; changed=24<br>F3 (interpret): 0.0050 [0.0020, 0.0080]; n=200; changed=14 |
| O/people/action:chase | 0.0092 [0.0030, 0.0153]; n=200 | F1 (interpret): 0.0017 [-0.0030, 0.0063]; n=200; changed=23<br>F2 (pertinence): -1.249e-18 [-0.0044, 0.0044]; n=200; changed=26<br>F3 (interpret): 0.0071 [0.0029, 0.0112]; n=200; changed=21<br>F4 (learning, pertinence): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F5 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F6 (pertinence, interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F7 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F8 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F9 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F10 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F11 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F12 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F13 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1 |
| O/people/action:give | -0.0025 [-0.0070, 0.0020]; n=200 | F1 (interpret): -0.0008 [-0.0037, 0.0020]; n=200; changed=12<br>F2 (pertinence): 0.0025 [-0.0010, 0.0060]; n=200; changed=18<br>F3 (interpret): -0.0038 [-0.0067, -0.0008]; n=200; changed=13 |
| O/people/action:let_go | -0.0092 [-0.0145, -0.0039]; n=200 | F1 (interpret): -0.0017 [-0.0055, 0.0022]; n=200; changed=16<br>F2 (pertinence): -0.0004 [-0.0049, 0.0040]; n=200; changed=23<br>F3 (interpret): -0.0075 [-0.0122, -0.0028]; n=200; changed=20 |
| O/people/action:pay | 0.0037 [-0.0027, 0.0102]; n=200 | F1 (interpret): -0.0033 [-0.0080, 0.0013]; n=200; changed=27<br>F2 (pertinence): 0.0038 [-0.0011, 0.0086]; n=200; changed=26<br>F3 (interpret): -0.0067 [-0.0109, -0.0024]; n=200; changed=30<br>F4 (learning, pertinence): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F5 (learning): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F6 (pertinence, interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F7 (interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F8 (learning): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F9 (generate): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F10 (generate): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F11 (generate): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F12 (interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2<br>F13 (interpret): 1.388e-19 [-5.435e-20, 3.319e-19]; n=200; changed=2 |
| O/people/action:refuse | 0.0033 [-0.0013, 0.0080]; n=200 | F1 (interpret): 0.0012 [-0.0021, 0.0046]; n=200; changed=17<br>F2 (pertinence): -0.0013 [-0.0048, 0.0023]; n=200; changed=16<br>F3 (interpret): 0.0037 [0.0008, 0.0067]; n=200; changed=13 |
| O/people/action:renege | 1.388e-19 [-0.0074, 0.0074]; n=200 | F1 (interpret): 0.0029 [-0.0013, 0.0072]; n=200; changed=25<br>F2 (pertinence): -0.0029 [-0.0086, 0.0027]; n=200; changed=30<br>F3 (interpret): 0.0058 [0.0010, 0.0107]; n=200; changed=28<br>F4 (learning, pertinence): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F5 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F6 (pertinence, interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F7 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F8 (learning): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F9 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F10 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F11 (generate): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F12 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1<br>F13 (interpret): 6.939e-20 [-6.752e-20, 2.063e-19]; n=200; changed=1 |
| O/people/action:wait | 0.0013 [-0.0009, 0.0034]; n=200 | F1 (interpret): 0 [-0.0012, 0.0012]; n=200; changed=2<br>F2 (pertinence): 0.0008 [-0.0008, 0.0025]; n=200; changed=4<br>F3 (interpret): 0.0025 [0.0002, 0.0048]; n=200; changed=8 |
| O/people/outcome:bad | 0.0005 [-0.0061, 0.0070]; n=200 | F1 (interpret): -0.0016 [-0.0051, 0.0019]; n=200; changed=27<br>F2 (pertinence): 0.0015 [-0.0038, 0.0069]; n=200; changed=29<br>F3 (interpret): -0.0028 [-0.0078, 0.0021]; n=200; changed=31 |
| O/people/outcome:good | -0.0008 [-0.0070, 0.0054]; n=200 | F1 (interpret): 0.0012 [-0.0025, 0.0049]; n=200; changed=26<br>F2 (pertinence): -0.0020 [-0.0068, 0.0029]; n=200; changed=26<br>F3 (interpret): 0.0027 [-0.0022, 0.0077]; n=200; changed=30 |
| O/people/outcome:unfinished | 0.0003 [-0.0013, 0.0020]; n=200 | F1 (interpret): 0.0004 [-0.0006, 0.0013]; n=200; changed=3<br>F2 (pertinence): 0.0004 [-0.0012, 0.0021]; n=200; changed=6<br>F3 (interpret): 0.0001 [-0.0011, 0.0013]; n=200; changed=3 |
| O/people/receipts | 0.0200 [-0.0526, 0.0926]; n=200 | F1 (interpret): 0.0150 [-0.0363, 0.0663]; n=200; changed=21<br>F2 (pertinence): 0.0150 [-0.0382, 0.0682]; n=200; changed=23<br>F3 (interpret): 0.0150 [-0.0344, 0.0644]; n=200; changed=19 |

### Complete ablation ledger

All 13 hook formulas are checked for all 16 stacks on all 200 seeds. This ledger includes zero effects. A full-trace change may be diagnostic only; a metric change can include coverage/missingness and is not a significance test.

| Configuration | Formula (hook) | Full-trace changed seeds / 200 | Any measured metric changed seeds / 200 |
|---|---|---|---|
| v1/ENTP | F1 (interpret) | 200 | 0 |
| v1/ENTP | F2 (pertinence) | 200 | 125 |
| v1/ENTP | F3 (interpret) | 200 | 99 |
| v1/ENTP | F4 (learning, pertinence) | 0 | 0 |
| v1/ENTP | F5 (learning) | 0 | 0 |
| v1/ENTP | F6 (pertinence, interpret) | 0 | 0 |
| v1/ENTP | F7 (interpret) | 0 | 0 |
| v1/ENTP | F8 (learning) | 200 | 0 |
| v1/ENTP | F9 (generate) | 0 | 0 |
| v1/ENTP | F10 (generate) | 0 | 0 |
| v1/ENTP | F11 (generate) | 0 | 0 |
| v1/ENTP | F12 (interpret) | 0 | 0 |
| v1/ENTP | F13 (interpret) | 0 | 0 |
| v1/INTP | F1 (interpret) | 200 | 138 |
| v1/INTP | F2 (pertinence) | 200 | 122 |
| v1/INTP | F3 (interpret) | 200 | 106 |
| v1/INTP | F4 (learning, pertinence) | 0 | 0 |
| v1/INTP | F5 (learning) | 0 | 0 |
| v1/INTP | F6 (pertinence, interpret) | 0 | 0 |
| v1/INTP | F7 (interpret) | 0 | 0 |
| v1/INTP | F8 (learning) | 200 | 0 |
| v1/INTP | F9 (generate) | 0 | 0 |
| v1/INTP | F10 (generate) | 0 | 0 |
| v1/INTP | F11 (generate) | 0 | 0 |
| v1/INTP | F12 (interpret) | 0 | 0 |
| v1/INTP | F13 (interpret) | 0 | 0 |
| v1/ESFJ | F1 (interpret) | 200 | 0 |
| v1/ESFJ | F2 (pertinence) | 200 | 125 |
| v1/ESFJ | F3 (interpret) | 200 | 99 |
| v1/ESFJ | F4 (learning, pertinence) | 0 | 0 |
| v1/ESFJ | F5 (learning) | 0 | 0 |
| v1/ESFJ | F6 (pertinence, interpret) | 0 | 0 |
| v1/ESFJ | F7 (interpret) | 0 | 0 |
| v1/ESFJ | F8 (learning) | 200 | 0 |
| v1/ESFJ | F9 (generate) | 0 | 0 |
| v1/ESFJ | F10 (generate) | 0 | 0 |
| v1/ESFJ | F11 (generate) | 0 | 0 |
| v1/ESFJ | F12 (interpret) | 0 | 0 |
| v1/ESFJ | F13 (interpret) | 0 | 0 |
| v1/ISFJ | F1 (interpret) | 200 | 138 |
| v1/ISFJ | F2 (pertinence) | 200 | 122 |
| v1/ISFJ | F3 (interpret) | 200 | 106 |
| v1/ISFJ | F4 (learning, pertinence) | 0 | 0 |
| v1/ISFJ | F5 (learning) | 0 | 0 |
| v1/ISFJ | F6 (pertinence, interpret) | 0 | 0 |
| v1/ISFJ | F7 (interpret) | 0 | 0 |
| v1/ISFJ | F8 (learning) | 200 | 0 |
| v1/ISFJ | F9 (generate) | 0 | 0 |
| v1/ISFJ | F10 (generate) | 0 | 0 |
| v1/ISFJ | F11 (generate) | 0 | 0 |
| v1/ISFJ | F12 (interpret) | 0 | 0 |
| v1/ISFJ | F13 (interpret) | 0 | 0 |
| v1/ENFJ | F1 (interpret) | 200 | 0 |
| v1/ENFJ | F2 (pertinence) | 200 | 125 |
| v1/ENFJ | F3 (interpret) | 200 | 99 |
| v1/ENFJ | F4 (learning, pertinence) | 0 | 0 |
| v1/ENFJ | F5 (learning) | 0 | 0 |
| v1/ENFJ | F6 (pertinence, interpret) | 0 | 0 |
| v1/ENFJ | F7 (interpret) | 0 | 0 |
| v1/ENFJ | F8 (learning) | 0 | 0 |
| v1/ENFJ | F9 (generate) | 0 | 0 |
| v1/ENFJ | F10 (generate) | 0 | 0 |
| v1/ENFJ | F11 (generate) | 0 | 0 |
| v1/ENFJ | F12 (interpret) | 200 | 0 |
| v1/ENFJ | F13 (interpret) | 0 | 0 |
| v1/INFJ | F1 (interpret) | 200 | 137 |
| v1/INFJ | F2 (pertinence) | 200 | 122 |
| v1/INFJ | F3 (interpret) | 200 | 106 |
| v1/INFJ | F4 (learning, pertinence) | 0 | 0 |
| v1/INFJ | F5 (learning) | 0 | 0 |
| v1/INFJ | F6 (pertinence, interpret) | 0 | 0 |
| v1/INFJ | F7 (interpret) | 0 | 0 |
| v1/INFJ | F8 (learning) | 0 | 0 |
| v1/INFJ | F9 (generate) | 0 | 0 |
| v1/INFJ | F10 (generate) | 0 | 0 |
| v1/INFJ | F11 (generate) | 0 | 0 |
| v1/INFJ | F12 (interpret) | 200 | 1 |
| v1/INFJ | F13 (interpret) | 0 | 0 |
| v1/ESTP | F1 (interpret) | 200 | 0 |
| v1/ESTP | F2 (pertinence) | 200 | 125 |
| v1/ESTP | F3 (interpret) | 200 | 99 |
| v1/ESTP | F4 (learning, pertinence) | 0 | 0 |
| v1/ESTP | F5 (learning) | 0 | 0 |
| v1/ESTP | F6 (pertinence, interpret) | 0 | 0 |
| v1/ESTP | F7 (interpret) | 0 | 0 |
| v1/ESTP | F8 (learning) | 0 | 0 |
| v1/ESTP | F9 (generate) | 0 | 0 |
| v1/ESTP | F10 (generate) | 0 | 0 |
| v1/ESTP | F11 (generate) | 0 | 0 |
| v1/ESTP | F12 (interpret) | 200 | 0 |
| v1/ESTP | F13 (interpret) | 0 | 0 |
| v1/ISTP | F1 (interpret) | 200 | 137 |
| v1/ISTP | F2 (pertinence) | 200 | 122 |
| v1/ISTP | F3 (interpret) | 200 | 106 |
| v1/ISTP | F4 (learning, pertinence) | 0 | 0 |
| v1/ISTP | F5 (learning) | 0 | 0 |
| v1/ISTP | F6 (pertinence, interpret) | 0 | 0 |
| v1/ISTP | F7 (interpret) | 0 | 0 |
| v1/ISTP | F8 (learning) | 0 | 0 |
| v1/ISTP | F9 (generate) | 0 | 0 |
| v1/ISTP | F10 (generate) | 0 | 0 |
| v1/ISTP | F11 (generate) | 0 | 0 |
| v1/ISTP | F12 (interpret) | 200 | 1 |
| v1/ISTP | F13 (interpret) | 0 | 0 |
| v1/ENFP | F1 (interpret) | 200 | 0 |
| v1/ENFP | F2 (pertinence) | 200 | 125 |
| v1/ENFP | F3 (interpret) | 200 | 99 |
| v1/ENFP | F4 (learning, pertinence) | 0 | 0 |
| v1/ENFP | F5 (learning) | 0 | 0 |
| v1/ENFP | F6 (pertinence, interpret) | 0 | 0 |
| v1/ENFP | F7 (interpret) | 0 | 0 |
| v1/ENFP | F8 (learning) | 200 | 0 |
| v1/ENFP | F9 (generate) | 0 | 0 |
| v1/ENFP | F10 (generate) | 0 | 0 |
| v1/ENFP | F11 (generate) | 0 | 0 |
| v1/ENFP | F12 (interpret) | 0 | 0 |
| v1/ENFP | F13 (interpret) | 0 | 0 |
| v1/INFP | F1 (interpret) | 200 | 138 |
| v1/INFP | F2 (pertinence) | 200 | 122 |
| v1/INFP | F3 (interpret) | 200 | 106 |
| v1/INFP | F4 (learning, pertinence) | 0 | 0 |
| v1/INFP | F5 (learning) | 0 | 0 |
| v1/INFP | F6 (pertinence, interpret) | 0 | 0 |
| v1/INFP | F7 (interpret) | 0 | 0 |
| v1/INFP | F8 (learning) | 200 | 0 |
| v1/INFP | F9 (generate) | 0 | 0 |
| v1/INFP | F10 (generate) | 0 | 0 |
| v1/INFP | F11 (generate) | 0 | 0 |
| v1/INFP | F12 (interpret) | 0 | 0 |
| v1/INFP | F13 (interpret) | 0 | 0 |
| v1/ESTJ | F1 (interpret) | 200 | 0 |
| v1/ESTJ | F2 (pertinence) | 200 | 125 |
| v1/ESTJ | F3 (interpret) | 200 | 99 |
| v1/ESTJ | F4 (learning, pertinence) | 0 | 0 |
| v1/ESTJ | F5 (learning) | 0 | 0 |
| v1/ESTJ | F6 (pertinence, interpret) | 0 | 0 |
| v1/ESTJ | F7 (interpret) | 0 | 0 |
| v1/ESTJ | F8 (learning) | 200 | 0 |
| v1/ESTJ | F9 (generate) | 0 | 0 |
| v1/ESTJ | F10 (generate) | 0 | 0 |
| v1/ESTJ | F11 (generate) | 0 | 0 |
| v1/ESTJ | F12 (interpret) | 0 | 0 |
| v1/ESTJ | F13 (interpret) | 0 | 0 |
| v1/ISTJ | F1 (interpret) | 200 | 138 |
| v1/ISTJ | F2 (pertinence) | 200 | 122 |
| v1/ISTJ | F3 (interpret) | 200 | 106 |
| v1/ISTJ | F4 (learning, pertinence) | 0 | 0 |
| v1/ISTJ | F5 (learning) | 0 | 0 |
| v1/ISTJ | F6 (pertinence, interpret) | 0 | 0 |
| v1/ISTJ | F7 (interpret) | 0 | 0 |
| v1/ISTJ | F8 (learning) | 200 | 0 |
| v1/ISTJ | F9 (generate) | 0 | 0 |
| v1/ISTJ | F10 (generate) | 0 | 0 |
| v1/ISTJ | F11 (generate) | 0 | 0 |
| v1/ISTJ | F12 (interpret) | 0 | 0 |
| v1/ISTJ | F13 (interpret) | 0 | 0 |
| v1/ENTJ | F1 (interpret) | 200 | 0 |
| v1/ENTJ | F2 (pertinence) | 200 | 125 |
| v1/ENTJ | F3 (interpret) | 200 | 99 |
| v1/ENTJ | F4 (learning, pertinence) | 0 | 0 |
| v1/ENTJ | F5 (learning) | 0 | 0 |
| v1/ENTJ | F6 (pertinence, interpret) | 0 | 0 |
| v1/ENTJ | F7 (interpret) | 0 | 0 |
| v1/ENTJ | F8 (learning) | 0 | 0 |
| v1/ENTJ | F9 (generate) | 0 | 0 |
| v1/ENTJ | F10 (generate) | 0 | 0 |
| v1/ENTJ | F11 (generate) | 0 | 0 |
| v1/ENTJ | F12 (interpret) | 200 | 0 |
| v1/ENTJ | F13 (interpret) | 0 | 0 |
| v1/INTJ | F1 (interpret) | 200 | 137 |
| v1/INTJ | F2 (pertinence) | 200 | 122 |
| v1/INTJ | F3 (interpret) | 200 | 106 |
| v1/INTJ | F4 (learning, pertinence) | 0 | 0 |
| v1/INTJ | F5 (learning) | 0 | 0 |
| v1/INTJ | F6 (pertinence, interpret) | 0 | 0 |
| v1/INTJ | F7 (interpret) | 0 | 0 |
| v1/INTJ | F8 (learning) | 0 | 0 |
| v1/INTJ | F9 (generate) | 0 | 0 |
| v1/INTJ | F10 (generate) | 0 | 0 |
| v1/INTJ | F11 (generate) | 0 | 0 |
| v1/INTJ | F12 (interpret) | 200 | 1 |
| v1/INTJ | F13 (interpret) | 0 | 0 |
| v1/ESFP | F1 (interpret) | 200 | 0 |
| v1/ESFP | F2 (pertinence) | 200 | 125 |
| v1/ESFP | F3 (interpret) | 200 | 99 |
| v1/ESFP | F4 (learning, pertinence) | 0 | 0 |
| v1/ESFP | F5 (learning) | 0 | 0 |
| v1/ESFP | F6 (pertinence, interpret) | 0 | 0 |
| v1/ESFP | F7 (interpret) | 0 | 0 |
| v1/ESFP | F8 (learning) | 0 | 0 |
| v1/ESFP | F9 (generate) | 0 | 0 |
| v1/ESFP | F10 (generate) | 0 | 0 |
| v1/ESFP | F11 (generate) | 0 | 0 |
| v1/ESFP | F12 (interpret) | 200 | 0 |
| v1/ESFP | F13 (interpret) | 0 | 0 |
| v1/ISFP | F1 (interpret) | 200 | 137 |
| v1/ISFP | F2 (pertinence) | 200 | 122 |
| v1/ISFP | F3 (interpret) | 200 | 106 |
| v1/ISFP | F4 (learning, pertinence) | 0 | 0 |
| v1/ISFP | F5 (learning) | 0 | 0 |
| v1/ISFP | F6 (pertinence, interpret) | 0 | 0 |
| v1/ISFP | F7 (interpret) | 0 | 0 |
| v1/ISFP | F8 (learning) | 0 | 0 |
| v1/ISFP | F9 (generate) | 0 | 0 |
| v1/ISFP | F10 (generate) | 0 | 0 |
| v1/ISFP | F11 (generate) | 0 | 0 |
| v1/ISFP | F12 (interpret) | 200 | 1 |
| v1/ISFP | F13 (interpret) | 0 | 0 |

## What this does not show

One scenario cannot test T-1 (stable differences) or T-2 (derived traits). DESIGN §9 requires scenarios rewarding each of the four extraverted domains (space, adaptation, meta, cohesion), plus the randomized-theta null and shuffled-hook controls for T-1. Later units add these domain and trait-indicator scenarios.
T-2 needs behavioral indicators of novelty/compounds, completion/commitment, risk under outcome variance, and social interaction/testimony across those scenarios. McCrae & Costa (1989) is the specified external comparison for derived trait correlations; no comparison to that data is performed here. No empirical validation is claimed (level 5).
A/B retain identical knowledge, needs, capability, cognitive parameters and personality; their kernel streams remain distinct. This preserves CB-6's configuration symmetry, but the existing baseline 500-seed symmetry certification is not a new 500-seed personality test. O has the same personality but retains the fixture's different role, initial needs and goal.
The existing host's missing adapters and unconsumed controls limit mechanism coverage as listed above. A zero ablation cannot validate an unexercised formula. No source formulas, baseline tests, or default personality were changed. Sibling repositories (kernel, realism, settlement, economy, pirate-ship) were not audited or modified under the folder-only task restriction; this is public-API fixture integration, not cross-engine validation.
