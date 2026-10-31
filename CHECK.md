# CHECK: independent check of Cognition (unit 2672, PLATFORM §11a)

Checker: a session that wrote none of the code. Read: `src/**`, `bench/hungry-pair/*.ts`, `test/*.ts`,
`DESIGN.md` (§6 and §9 by search). Changed no code. Line numbers are as of commit `75d3856`.

1. PASS: `src/` imports only `@rex/kernel` and relative files. Kernel imports at `src/select.ts:1-2`, `src/mind.ts:1-2`; relative elsewhere (`src/select.ts:3-4`). Multi-line imports at `src/beliefs.ts:4` and `src/learning.ts:6` are relative. The JSON data imports are relative too: `src/process.ts:3`, `src/personality/eight-function/v1.ts:1-2`.
2. PASS: no `Math.random`, `Date.now`, `new Date(` or `performance.now` in `src/`. Search over `src/**/*.ts` returned no matches.
3. PASS: `Stimulus` appears only in `src/types.ts:17` (definition) and `src/perception.ts:3, 55, 91`.
4. PASS: no branch in `src/` picks an action or outcome by action id, agent id or parameter value. Action-id comparisons are identity checks only: commitment matching at `src/select.ts:61`, duplicate detection at `src/actions.ts:94`, the consistency check at `src/learning.ts:185`, and the trace lookup at `src/mind.ts:199`. Routing by mind and intention id is at `src/mind.ts:128-129`, `src/process.ts:72-77`. The personality `domain` branches (`src/personality/eight-function/v1.ts:141, 208, 212`) are domain categories from DESIGN §9 F4/F8, not ids or parameter values. Bench notes are in the section below.
5. PASS: every formula in `src/` has a DESIGN reference and a source comment next to it. Examples: softmax `src/select.ts:6-7` (DESIGN §2.4, Luce 1959); ACT-R activation `src/memory.ts:48-53`, logistic `src/memory.ts:78`; Bayes, Kalman, Beta and drift `src/beliefs.ts:102, 122, 171, 187, 194, 202`; KL `src/beliefs.ts:231` and `src/learning.ts:129`; drive `src/needs.ts:92-100`; EU `src/evaluate.ts:84-105`; SDT and Box–Muller `src/perception.ts:52, 83, 135`; personality formulas `src/personality/eight-function/v1.ts:79-155, 206-219`. Two numerical helpers have a source comment but no DESIGN section of their own: `src/learning.ts:109-127` (log Γ and ψ, DLMF §5.11) and `src/perception.ts:33` (Φ, Marsaglia 2004). Both are used only under DESIGN-cited formulas.
6. PASS: all of CB-1 to CB-7 and P7-3 exist in `test/bench-acceptance.test.ts`, and each asserts what DESIGN §6 says.
   - CB-1 (line 36): the stream-isolation assertion at lines 39-43, plus `requireCheck("CB-1")` for byte-identical replay (`bench/hungry-pair/acceptance.ts:176-179`).
   - CB-2 (line 45): `requireCheck("CB-2")`.
   - CB-3 (lines 46-54): `requireCheck("CB-3")`, plus horizon-censoring assertions at lines 49-53.
   - CB-4 (line 55): `requireCheck("CB-4")`.
   - CB-5a (line 56): `requireCheck("CB-5a")`. CB-5b (lines 57-66): `divergence` count and share bounds.
   - CB-6a (lines 68-75): χ² `p > 0.01` at line 73, and `requireCheck("CB-6a exact ID swap")` at line 75.
   - CB-6b (lines 76-86): regex guard only. The test says so, and the semantic audit is this document.
   - CB-6c (lines 87-89): more than one action sequence.
   - CB-7 (lines 90-133): paired intervals and sums at lines 90-109; the λ fixed-context check at lines 110-121; the population fight+steal interval is reported, not signed (line 114); β entropy lower at line 124; κ switches fewer at line 127; d reduces early-loss effect at lines 130-132.
   - P7-3 (lines 134-137): only `pertinence` is swapped, with `interpret`, `generate` and `learning` equal to the null model (line 135), and `requireCheck("P7-3")`. The trace-change assertion is `bench/hungry-pair/acceptance.ts:195-197`.
   - Caveat: the `requireCheck` assertions pass only if the diagnostic has `cases > 0` and `failures === 0` (`test/bench-acceptance.test.ts:29-34`). The substance is in `bench/hungry-pair/acceptance.ts`, not in the test body.
   - Caveat: the CB-7 direction tests run on 16 seeds (`SMOKE_SEEDS`, line 17). DESIGN §6 says 200. The 200-seed study is in `bench/hungry-pair/REPORT.md`, gated by the test at lines 157-160.
7. PASS: every fixture rule in `bench/` is labelled fixture. `bench/hungry-pair/world.ts:1` ("fixture only; no world rule in this file is a validated platform mechanism") and `bench/hungry-pair/models.ts:1` ("DESIGN §6 fixture models, not platform rules") label the file. Inline labels are at `world.ts:77-88, 152, 156, 217-226, 242, 269, 290, 296, 306, 339-346, 438-439, 459` and `models.ts:12-18, 34, 49, 86, 115, 132, 155, 163, 179`.
   - Gap for the keeper: the resolver and answer rules at `world.ts:352-426` and the relevance rule at `models.ts:147-153` carry only the file-level label, not an inline one.
8. NOT RUN HERE: test count and typecheck. This unit ran neither the suite nor `tsc`. Static count: 223 `it`/`test` declarations across 22 files in `test/` (`it.each` counted once, so the runtime count is higher). The runner's Gate records the real count and the typecheck result in `.gate.log`.

Verdict: PASS (items 1 to 7; item 8 is recorded by the runner's Gate run, not by this check)

## Notes for the keeper (not items; no FAIL)

- CB-6b, bench scope. Outside item 4's `src/` scope, the fixture world resolves outcomes by action id: `bench/hungry-pair/world.ts:358-380` (`intention.action` switch), `world.ts:245-253` (availability by job stage), `models.ts:125-129` (forecast by action), `models.ts:184-191` (effects by action id). This is fixture rule, not agent id or parameter value, so it does not breach CB-6b as written. The keeper should decide whether CB-6b means "engine and fixture" in that wider sense.
- Agent-id references in the bench analysis. `bench/hungry-pair/report.ts:28` and `bench/hungry-pair/lambda.ts:88` exclude `mind.0003` (the owner) from visitor statistics. They pick no action and change no outcome, so they are analysis filters. Noted, not counted against CB-6b.
- DESIGN §6 reads "CB-7 … over 200 seeds". The test runs 16 seeds, and the report carries the 200-seed study. See item 6.
