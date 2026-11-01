# Domain scenarios for T-1 / T-2 (Cognition keeper, design; Rex released 2026-10-31 23:50)

**Status: design only.** Nothing here runs. Codex builds each fixture later as a belt unit; Composer builds the
data tables. Every number is tagged **researched** (with its source), **estimate** (keeper's, to be replaced) or
**null** (deliberately absent until sourced). Nothing in F1–F13 is tuned to the hungry pair or to these scenarios.

## 0. Why

The T-3 run (`bench/hungry-pair/PERSONALITY-REPORT.md`, unit 2676) showed v1's 16 stacks collapsing to 3
behaviours in the hungry pair, because the fixture gives most formulas nothing to act on: only F1, F2, F3 and F12
moved a metric; F4–F7, F9–F11 and F13 never fired. The report's "Hook coverage" table names the missing levers:
the four extraverted domains `space`, `adaptation`, `meta`, `cohesion` (DESIGN §9, `Domain`), physical / present /
targeted cue tags (F6), domain ownership for confidence (F7), a compound-action executor (F9), a believed-other-mind
adapter (F10), commitment `κ > 0` (F11) and a testimony-context adapter (F13). Each scenario below supplies one or
two of those levers in the smallest world that can carry them.

T-1 (stable differences): a stack's behaviour differs from null and from other stacks in a direction the formulas
imply, stable across seeds, and absent under two controls: randomised θ with the null personality, and the same
stack with its hook outputs shuffled across functions. T-2 (derived traits): Big Five indicators derived from
behaviour across scenarios correlate with the stacks' type letters in the directions McCrae & Costa (1989) report
for the MBTI–NEO-PI relation (researched: E–I ↔ Extraversion, S–N ↔ Openness, T–F ↔ Agreeableness, J–P ↔
Conscientiousness; Neuroticism unrelated to the four letters). A negative result is a result (DESIGN §9).

## 1. Scenario list

| # | Scenario | Domain lever | Formulas it can reach (v1 hook) | T-2 indicator |
|---|---|---|---|---|
| S1 | Forage field | `space`; physical / present / targeted cue tags | F6 (pertinence, interpret), F4/F5 for Se/Si (learning, pertinence), F2 | Openness (novel patches), Conscientiousness (return to known) |
| S2 | Shifting market | `adaptation`; regime changes; compounds | F4/F5 for Ne/Ni, F9 (generate, compound executor), F8 (learning, half-life) | Openness (switching, recombination) |
| S3 | Workshop | `meta`; multi-step tasks; `κ > 0`; foreman testimony | F7 (interpret, confidence by domain ownership), F11 (generate, commitment), F13 (interpret, testimony context), F1 | Conscientiousness (completion, verification) |
| S4 | Village gathering | `cohesion`; other minds as adapters | F10 (generate, believed-other-mind), F12 (interpret, person α0), F3 (interpret, λ with failure history) | Agreeableness, Extraversion (support, join, share) |
| S5 | Developmental cohort | all four, over a life | the same formulas under `function_development` (DESIGN §19): E_f, C_f | T-2 across ages; no age effect without experience |
| S6 | Cross-scenario T-2 | — | derived-trait table from S1–S5 | all five, vs McCrae & Costa 1989 |

Common rules: identical needs, knowledge, capability and opportunities across stacks (DESIGN §6); only the
personality version and the stack vary; A/B symmetry and the id-swap test of CB-6 hold in every scenario; seeds
replay through the Kernel; `nullPersonality` is the control in every run; 12 epochs per world unless the scenario
says otherwise (estimate, inherited from the T-3 run; DESIGN §6's 144 is the demonstration length).

## 2. S1 Forage field (domain `space`)

**World (host data, fixture).** A 6 × 6 grid of patches (estimate). Each patch has a true yield in {0, 1, 2} food
units (fixture) and a visible cue: `physical` tags (colour, size: `present` when the mind stands on or beside the
patch, `targeted` when it inspects one) and a `remembered` tag for patches visited before. Two thirds of the patches
are of a familiar kind the mind has episodes for at start; one third are novel kinds with no episodes (estimate).
Yields of familiar kinds are stable; novel kinds have higher variance (fixture; the exact distributions are **null**
until a foraging source is chosen; candidate: patch-choice data in optimal-foraging reviews, researched later).
Hunger is the one need (DESIGN §6 signal); no other minds.

**Actions.** `move(adjacent)`, `inspect(patch)` (adds a `targeted` physical cue), `gather(patch)` (one epoch, lowers
hunger by the yield), `wait`. Preconditions over beliefs; outcomes by the host.

**Levers.** `physical` / `present` / `targeted` cue tags feed F6 (Se: pertinence and interpretation of present,
targeted perception); `space` is the domain of Se/Si, so F4 (learning from a loss in the extraverted function's
domain, pertinence) and F5 (the introverted form, Si, outpacing on `space`) have data; F2 reweights attitude
attention. Nothing is added for the other hooks.

**Metrics (per mind, per seed).** Share of `inspect` before `gather` (targeted perception); share of novel-patch
visits; return rate to the best known patch; food gathered. **T-1 expectation (formula-implied, not asserted
until the run):** Se-heavy stacks inspect more and act on present cues; Si-heavy stacks return to remembered
patches; Ne/Ni-heavy stacks visit novel patches more; the controls show none of these orderings.

**Runs.** 200 seeds × 16 stacks + null, common random numbers (estimate, matching the T-3 protocol); 12 epochs.

**T-2.** Novel-patch share → Openness indicator; return-to-known and gather-after-inspect → Conscientiousness
indicator (estimate of the mapping; the McCrae & Costa comparison is only at S6).

## 3. S2 Shifting market (domain `adaptation`)

**World (host data, fixture).** One mind trades three goods at a stall whose prices follow a regime: regime A for
the first third of the run, regime B after (a change in which good is profitable; fixture), with a second change in
half the seeds (estimate). Prices are observed with Weber noise (DESIGN §2.1). A `combine` action exists: two goods
make a third of higher value only in regime B (fixture), so recombination pays after the change.

**Actions.** `buy(good)`, `sell(good)`, `combine(good1, good2)` (a compound of two primitives, run through the
compound executor), `wait`. Need: a wealth-as-security appraisal need (DESIGN §2.2 appraisal source) plus hunger.

**Levers.** `adaptation` is Ne/Ni's domain (F4, F5); the compound executor gives F9 (Ne: generate recombinations)
something to run; the regime change makes F8's memory half-life matter (how long old prices weigh); F1's `α0` on
new price evidence. Other hooks untouched.

**Metrics.** Epochs from a regime change to the first profitable trade under the new regime (switch latency);
number of distinct `combine` pairs tried; profit; share of trades repeating the previous regime's best. **T-1
expectation:** Ne-heavy stacks try more combinations and switch sooner; Si-heavy stacks repeat the old regime
longer; Ni-heavy stacks switch after fewer observations once a pattern repeats (formula-implied; asserted only
after the run). Controls as in §0.

**Runs.** 200 seeds × 16 stacks + null, common random numbers; 18 epochs (estimate: six per regime third).

**T-2.** Distinct combinations and switch latency → Openness indicator; repetition of the old best → low Openness
/ high Conscientiousness indicator (estimate of the mapping).

## 4. S3 Workshop (domain `meta`)

**World (host data, fixture).** One mind and a foreman (a scripted testimony source, not a mind; fixture) in a
workshop with two multi-step tasks of four steps each (estimate). A step can fail silently (a hidden defect) with
probability p_defect (**null** until sourced; the fixture starts with an estimate the unit records). A `verify`
action reveals a defect in the last step. The foreman gives instructions as testimony before each step; the
foreman's reliability is drawn per seed from {high, low} (fixture), and the instruction's context tag (`procedural`
vs `opinion`) is attached, which is the F13 testimony-context lever. Need: a competence appraisal need (DESIGN §2.2;
SDT competence) plus hunger paid per finished task.

**Actions.** `continue(task)`, `switch(task)`, `verify`, `ask(foreman)`, `wait`. Commitment `κ` is set **> 0** in
this scenario's θ (value **estimate**, recorded in the fixture; the baseline keeps κ = 0 elsewhere) so F11 has an
effect to modulate.

**Levers.** `meta` is Te/Ti's domain: F7 (confidence by domain ownership) applies to steps in `meta`; F11 (Te:
commitment) acts on `κ`; F13 (Te: testimony reliability floor) acts on the foreman's instructions by context; F1
(`η`, `α0`) on the defect evidence. Nothing social beyond the scripted foreman.

**Metrics.** Task completion rate; switches per completed task; `verify` rate before `continue`; acceptance rate
of low-reliability `opinion` testimony vs `procedural`. **T-1 expectation:** Te-heavy stacks complete more and
switch less (F11), accept procedural testimony more readily (F13); Ti-heavy stacks verify more and accept less
testimony; Ne-heavy stacks switch more. Asserted only after the run; controls as in §0.

**Runs.** 200 seeds × 16 stacks + null; 16 epochs (estimate: two tasks × four steps × two).

**T-2.** Completion and verification → Conscientiousness indicator; switching → low Conscientiousness / Openness
indicator; testimony acceptance → Agreeableness indicator (estimate of the mapping).

## 5. S4 Village gathering (domain `cohesion`)

**World (host data, fixture).** Four minds (A, B, C, D; identical except the stack under test is given to all
four per run, preserving CB-6 symmetry) at a gathering with one shared decision: where to dig a well (two sites;
fixture). Each mind holds a prior belief about which site is better (fixture, varied per seed) and a social
connection need (DESIGN §6). Each mind has a **believed-other-mind adapter** (DESIGN §9 F10): a simple model of
what another mind wants, updated from what that mind says and does. A hidden-information twist in half the seeds:
one mind's prior is wrong (fixture), so deference costs.

**Actions.** `propose(site)`, `support(mind)`, `oppose(mind)`, `share(belief)` (testimony), `ask(mind)`,
`leave`. Outcome: the site with the most support after N epochs is dug; its true yield (fixture) feeds every
mind's hunger thereafter.

**Levers.** `cohesion` is Fe/Fi's domain (F4, F5 for those stacks); F10 (Fe: generate through a believed other
mind) has an adapter to run; F12 (Fe: person `α0`, trust in a person's testimony) acts on `share`; F3 (λ with a
failure history) gets a history when an earlier seed-phase proposal was opposed (the fixture provides a short
warm-up phase, estimate). The scripted parts are the sites' yields only; all speech is between minds.

**Metrics.** Share of `support`/`oppose` vs `propose`; agreement reached (epochs to a majority); deference rate to
a wrong prior; `share` rate; `leave` rate. **T-1 expectation:** Fe-heavy stacks support more and reach agreement
sooner, deferring more when a prior is wrong; Fi-heavy stacks propose and leave more; Te-heavy stacks oppose on the
evidence. Asserted only after the run; controls as in §0; the four-mind symmetry is tested by id rotation.

**Runs.** 200 seeds × 16 stacks + null; 12 epochs (estimate) plus a 4-epoch warm-up for F3's history.

**T-2.** Support and agreement → Agreeableness indicator; `propose`, `share` and `ask` counts → Extraversion
indicator; `leave` → low Extraversion (estimate of the mapping).

## 6. S5 Developmental cohort (DESIGN §19, `cognition.personality.function_development`)

**Purpose.** Give the developmental model something to measure against: identical hierarchies raised in different
environments must diverge in `E_f` and `C_f` (DESIGN §19), and nothing may depend on age as such.

**Cohort (fixture).** For each of the 16 stacks, three upbringings: **foraging** (a childhood of S1 worlds),
**abstract** (S2 and S3 worlds), **social** (S4 worlds); and three life stages at which the test battery S1–S4 is
run: early (few prior epochs of upbringing), mid, late (estimate: 0, 60 and 240 upbringing epochs; the counts are
estimates, chosen so `log(1 + E_f)` has visibly turned). An ESTP raised abstract should show more Ni facility than
one rewarded for immediate action (Rex's example, DESIGN §19), measured as the S2 switch-latency metric.

**Controls.** (a) `function_development` off: all three upbringings identical to the mid-stage default; (b) a
uniform baseline `B_f` for every function: no hierarchy-driven ordering of `C_f`; (c) age without experience: a mind
with late-stage epochs spent in `wait` worlds equals the early-stage mind (no age unlock).

**Metrics.** `E_f` and `C_f` trajectories per function; the S1–S4 metrics at each stage; rank order of `C_f`
against the stack position (dominant first, inferior last, DESIGN §19) and its dependence on upbringing.

**Runs.** 100 seeds × 16 stacks × 3 upbringings × 3 stages (estimate; heavy, so it runs as `npm run bench`
periodic validation under PLATFORM §11b, never in a gate).

**T-2.** The same derived indicators as S1–S4, now per stage: the McCrae & Costa correlations should hold at every
stage if the type letters describe the pattern; a stage effect that reorders them is a finding, not a failure.

## 7. S6 Cross-scenario T-2 (external yardstick: McCrae & Costa 1989)

**Derived indicators (one per Big Five domain; estimate of the mapping, to be fixed before any run and never
adjusted after).**

| Domain | Indicator built from | Scenarios |
|---|---|---|
| Openness | novel-patch share; distinct combinations; switch latency (inverted) | S1, S2 |
| Conscientiousness | return-to-known; completion rate; verification; (switching inverted) | S1, S3 |
| Extraversion | propose, share, ask counts; (leave inverted) | S4 |
| Agreeableness | support, deference, testimony acceptance | S3, S4 |
| Neuroticism | **null**: no indicator in S1–S5 (no threat or variance-under-loss scenario yet); reported as not measured |

**Comparison.** For each stack, four letters (E/I, S/N, T/F, J/P) and four derived scores; the test statistic is the
rank correlation between each letter and its McCrae & Costa domain (researched: E–I with Extraversion, S–N with
Openness, T–F with Agreeableness, J–P with Conscientiousness; their reported correlations are the reference
magnitudes, cited in the fixture when built). A pass is the four correlations having the reported sign with 95 %
intervals excluding zero over the seeds; a failure is reported as such. Neuroticism is not tested until a scenario
supplies it (open).

**Not shown by this battery.** No scenario validates a formula against human data (level 5 throughout); S6 is a
consistency check between behaviour and the type letters, not evidence that the letters are real. The controls of
§0 are mandatory in every scenario.

## 8. Build order and open items

Build order (units, later, when Rex releases the build): S1 fixture (Codex) → S3 (κ > 0 and the testimony-context
adapter are the two smallest new hooks) → S2 (compound executor) → S4 (believed-other-mind adapter, four minds) →
S5 (needs `function_development` built) → S6 report. Composer writes the data tables; every unit's Gate runs the
scenario's own tests and `tsc` only (PLATFORM §11b); the 200-seed studies run as `npm run bench`.

| Id | Open | Whose |
|---|---|---|
| SC-1 | Yield, price and defect distributions for S1–S3 (all **null**): sources to choose | keeper, researched |
| SC-2 | The κ value for S3 and the warm-up length for S4 (estimates) | keeper; Rex may set |
| SC-3 | Upbringing epoch counts for S5 (estimates) | keeper; Rex may set |
| SC-4 | A Neuroticism scenario (threat, variance under loss) | open (Rex) |
| SC-5 | Whether S4's four minds all carry the stack under test, or mixed stacks (which would break CB-6 symmetry inside a run) | open (Rex) |
