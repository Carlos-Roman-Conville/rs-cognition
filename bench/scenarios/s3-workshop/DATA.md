# S3 Workshop fixture

DESIGN sections 4, 9 and 10.4 govern this fixture. Evidence level 5; no human-data validation or stack-separation claim.

## Fixed values

Two tasks, four steps, 16 epochs. Each attempted step has a hidden defect with probability 0.2, an SC-1 estimate. The host reserves two draws per epoch in `s3.defect@workshop`, in task-slot order. `s3.foreman@workshop` first selects reliability 0.9 or 0.4 with equal probability and subsequently draws each epoch's scripted instruction. "Half the seeds" means probability one half, not forced exact balance in a finite run. Task and worker display labels do not affect streams.

The runner computes kappa once: 0.25 times the median best-minus-second-best EU gap over the seed-1 null run with kappa zero. The median averages the central pair for even sample counts. It records seed, median gap and kappa in each output header. No floor, per-stack calibration, or fitted parameter is applied.

## Proposed host conventions where DESIGN leaves details open

- Initial hunger 0.7, increase 0.01 per epoch, payment 0.3 hunger relief per delivered four-step task, clamped to [0,1]. Delivery means four attempted steps, so payment does not expose hidden quality. `completionRate` measures deliveries / 2; `defectFreeCompletionRate` additionally measures deliveries without hidden defects. No quality information enters policy via these diagnostic metrics.
- An unfinished task's last defective step, when verified, is rolled back for a subsequent `continue` retry. Verification after delivery is diagnostic only. Earlier unverified defects remain hidden. Continuation and payment give identical observations for clean and defective steps.
- `switch` changes the active task; `ask(foreman)` requests the instruction again next epoch. Instructions are also supplied before every decision. The context alternates procedural/opinion by the active task's next step, not by time; ask/wait do not advance it. The foreman recommends readiness correctly with its reliability, otherwise incorrectly. It never reports actual defects.
- V1's documented context input is `V1Context.testimony: boolean`; it has no string context field. Procedural instructions set this flag, opinions do not. Both context tags are retained in the host trace. Public reliability is passed as the base testimony floor. Acceptance means effective reliability strictly greater than chance (0.5); accepted reports enter categorical evidence with that reliability as q, rejected reports supply no evidence. This is an explicit host adapter, not a modification of V1 or its communication defaults.
- Competence is a host SDT appraisal need on the belief `self.competence=yes`, setpoint 1, weight 1. Hunger is a signal need, weight 1. Both begin with neutral competence probability 0.5. Continue/verify feedback updates competence with proposed likelihoods 0.8/0.2 (reversed on observable failure); hidden defects do not affect this feedback. Task quality starts at 0.8 and updates only on verification with likelihood 0.9/0.1.
- All actions take one epoch, zero cost/capacity requirement, domain meta. Continue/switch/verify preconditions read observed affordance beliefs. Ask/wait have no preconditions. Success predictions are the mean of believed quality/readiness for continue, 0.9 for other actions. Proposed successful-outcome competence relief is 0.2 for continue, 0.1 for verify, 0.05 for ask; other actions give none. Continue forecasts one quarter of task payment. Forecasts read felt needs only.
- Counter and affordance evidence uses detectability 40 and Weber fraction 0.1; categorical counters remain perceptual inputs. Transient counters/affordances relax toward their priors with half-life 0.01 seconds, preventing a prior exact observation from permanently blocking a changed affordance. Other beliefs do not drift. One epoch is 1000ms.
- The host keeps a continuation active across unfinished task steps: after applying step feedback through the engine, it renews the public active intention/pending record for the next decision. This allows the unchanged engine commitment rule to apply. Other actions terminate after their outcome. The processing trace records the actual kept/rechosen intention and kappa.

## Frozen-model limitations

The scenario prose associates commitment with Te, but frozen V1 F11 is `kappa * (1 + w_Ni - w_Ne)`. Likewise V1's meta confidence ownership is Te, not Ti. This fixture uses those actual hooks without changing formulas or adding type-specific branches. Procedure/opinion acceptance differences under null may be zero; this is expected, not a fitted effect.

## Outputs and analysis

`run.ts --seeds N --stacks all|null --personality v1 --control none|random-theta|shuffled --ledger off|summary|detailed` emits JSONL records with the single host epoch log, metrics, calibration header and optional ledger. The default seed count is 200 for the keeper only. Tests use seeds 1 and 2. V2 and both are deliberately rejected.

Example keeper invocation (choose the seed count deliberately):

```sh
node --experimental-strip-types bench/scenarios/s3-workshop/run.ts --seeds 2 --stacks all --personality v1 --ledger summary > workshop.jsonl
node --experimental-strip-types bench/scenarios/s3-workshop/analyze.ts workshop.jsonl
```

Control runs use section 10.3's existing wrappers. Random-theta calibration runs all sixteen stacks on the same seed, using the already-fixed kappa; for changing instruction cue identities it retains observed min/max multipliers in first-seen cue order. This preserves the exact observed ranges. The header records the baseline kappa; `controlTheta.kappa` records the drawn control value.

Metrics retain denominators. Verification-before-continuation means the immediately preceding successful verify of the same task. Acceptance counts all low-reliability reports by context; zero input denominators return zero, identifiable from counts. Switches per completed task also returns zero when none complete, with the switch/completion counts retained.

Processing reductions reuse S1's hook totals and changed cue shares. The ledger uses the shared overlapping V1 formula-group ablations and full trajectory reruns. It retains active/eligible/no-input counts, delta-U margins, parameter changes, attention movement and learning KL. Those groups are not additive causal shares. Summary and detailed ledgers reduce the same host trace; there is no separate behavioral log.

`analyze.ts` accepts one or more JSONL paths and emits section 10.1 mechanism and behavior tables, separately per version and control, using `classify.ts` and its frozen thresholds/seed intervals. Supply unmodified null records for every seed, including when analyzing controls. Missing ledgers for V1 fail closed. Controls have no valid unpermuted function-group attribution: their mechanism table is explicitly unavailable, and their behavior rows identify unattributed control hook activity. No function is labeled ineffective because attribution is unavailable. Small-sample tables are diagnostics, not a 200-seed study.

A/B symmetry is checked using independent identical one-worker worlds, plus task-label swaps preserving slot order. S3 contains only one cognitive mind; the foreman is scripted, so there is no two-agent competition claim.
