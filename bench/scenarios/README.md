# Domain scenario fixtures

Run S1 with Node's TypeScript stripping:

```sh
node --experimental-strip-types bench/scenarios/s1-forage/run.ts --seeds 8 --stacks null
node --experimental-strip-types bench/scenarios/s1-forage/run.ts --seeds 200 --stacks all > s1.jsonl
```

Defaults are 200 seeds and all configurations: null, then every frozen version × stack in the same catalogue used by `bench/personality-versions.ts`. Each JSON line contains the initial version-2 kernel snapshot, twelve host epochs, final state, replay result and metrics. Nothing writes to REPORT files. Runs replay themselves from the initial snapshot. Unknown future versions fail until an explicit S1 context adapter exists.

The world uses a seeded, share-preserving 6 × 6 layout and common seed/configuration inputs. A separate host yield stream advances for every patch each epoch, so differing action histories do not shift the yield opportunities. Perception reserves three draws per categorical cue (detection, identification, error), including unused draws, to keep sensory randomness aligned across configurations. All random streams use a mechanism id and qualified mind id. Physiology follows DESIGN §6: initial hunger .6, ten-minute epochs, Δ/day hunger growth, .25 relief per food unit. Initial placement is a visit. Targeted tags last for the sensing epoch after a successful inspection; remembered tags persist after a visit. All fixture choices are estimates unless data.json/DATA.md identify their provenance.

`perception.ts` is the only module accepting `Stimulus`. The world passes a sensory port to `cognition.ts`; policy adapters receive observations, beliefs and felt needs. The world resolves intentions using host geography and yields without reading beliefs or parameters. Preconditions use perceived affordances, refreshed through public belief drift. The observation trace is a public engine diagnostic; frozen personality files and behavior are unchanged.

`hostInputLog[epoch].trace` records:

- `attention`: public `allocateAttention` shares/weights/pertinence aligned to cue ids, with identity baseline shares for comparison.
- `interpretation`: public sensory `PersonalityModel.interpret` outputs per cue; selection candidates also retain engine evaluation interpretation parameters.
- `selection`, `candidates`, `evaluation`: existing `SelectionTrace`, its generated alternatives and each candidate's EU.
- `observationBeliefDeltas`: public observation updates in input order, with cue/index, attribute/about, prior/posterior beliefs and KL (singular KL is `"Infinity"`).
- `learning`, `beliefDeltas`: existing `LearningTrace` and its prior/posterior attribution updates.
- `hooks`: unchanged public hook inputs/outputs, changes counted by hook and parameter. Infinity sentinels are explicitly serialized as strings.

The public API does not emit v1 formula-level attribution. Those fields remain explicitly null; see [S1 HANDOFF](s1-forage/HANDOFF.md). The same handoff explains categorical cues' limits on F6 precision and the lack of a remembered-context flag in frozen v1.

Metric denominators are fixed before running: inspect-before-gather counts successful gathers preceded by a successful inspection of the same patch since its last successful gather; novel visits count moves to novel-kind patches over all successful moves (initial placement excluded); best-known returns count moves back to a previously visited patch with the highest past observed yield mean over moves made after any yield sample exists. Ties use patch mint order. Food is the sum of resolved gathered units. Zero-denominator shares are zero and raw counts accompany every share. Hook summaries count invocations that changed an output, parameter changes, and cue shares changed beyond 1e-12; formula attribution remains unavailable rather than guessed.

Verify only this scenario:

```sh
npx vitest run test/scenario-s1.test.ts
npx tsc --noEmit
```

To regenerate the report inputs, stream each run through a JSONL field filter (for example `node --input-type=module -e 'import readline from "node:readline"; for await (const line of readline.createInterface({input:process.stdin})) { const {scenario,seed,configuration,metrics,replayed}=JSON.parse(line); console.log(JSON.stringify({scenario,seed,configuration,metrics,replayed})); }'` in a POSIX shell): pipe `node --experimental-strip-types bench/scenarios/s1-forage/run.ts --seeds 200 --stacks all --ledger off` through that filter into `bench/scenarios/s1-forage/out/s1-200.metrics.jsonl`, and likewise `node --experimental-strip-types bench/scenarios/s1-forage/run.ts --seeds 24 --stacks all --ledger summary` into `bench/scenarios/s1-forage/out/s1-24-ledger.metrics.jsonl` (the latter also writes `ledger-report.json` and `ledger-report.md` in `out/`). Create the ignored output directory first if absent; do not retain the multi-megabyte full records. Then run `node --experimental-strip-types bench/scenarios/s1-forage/analyze.ts bench/scenarios/s1-forage/out/s1-200.metrics.jsonl bench/scenarios/s1-forage/out/s1-24-ledger.metrics.jsonl bench/scenarios/s1-forage/out/ledger-report.json bench/scenarios/s1-forage/out/ledger-report.md > bench/scenarios/s1-forage/REPORT.md`. The analysis takes explicit paths, validates seed pairing and ledger-subset equality, and performs no simulation; its unit test uses only hand-built fixtures.
