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
