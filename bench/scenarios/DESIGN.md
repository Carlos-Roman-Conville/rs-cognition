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
