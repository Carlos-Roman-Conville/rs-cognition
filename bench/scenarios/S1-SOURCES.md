# S1 Forage field: sources

Research for DESIGN §2 and open item SC-1 (S1 part). Evidence levels follow PLATFORM §4 (level 2 = empirically
supported). Sources fetched 2026-11-01. Nothing here is written into DESIGN.md; the data unit (2911) consumes it.

## Yield distribution

**Source A (fetched, full text).** "Differential patch-leaving behavior during probabilistic foraging in humans and
gerbils", PMC11327252, https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11327252/ (author list and venue not read from
the page; cite by title and URL). Human visual-search patch task, 42 analysed participants.
- Shape taken: **three discrete quality tiers**, initial reward probability 100% (high), 75% (medium), 50% (low),
  assigned randomly across patches, quality not shown on entry. Depletion exponential per capture:
  P = A·e^(−(n−1))/5 with A = 1, 0.75, 0.5.
- Reported outcomes by tier (human, rewards captured per patch): high 11, medium 8, low 5.
- Evidence level: 2 (empirical, human). Fit to DESIGN §2: S1 yields are {0, 1, 2} per patch with a visible cue. A
  three-tier quality (low / medium / high) maps onto {0, 1, 2}; the probabilities 0.5 / 0.75 / 1.0 are the sourced
  tier spacing. It **replaces the null for the familiar-kind yield distribution in shape** (three tiers, random
  assignment, quality hidden until sampled). The tier mix (equal shares) is the source's random assignment, not a
  reported proportion: label the shares estimate.

**Source B (fetched, full text).** Constantino, S. M. & Daw, N. D. (2015). "Learning the opportunity cost of time in
a patch-foraging task." *Cognitive, Affective, & Behavioral Neuroscience* 15(4): 837–853. PMC4624618,
https://pmc.ncbi.nlm.nih.gov/articles/PMC4624618. Depleting "trees": initial richness S0 = 10, depletion κ between
0.68 and 0.94, reward noise σr 0.13–0.37 (Exp. 1) or tree-quality noise σS = 1 and σκ = 0.07 (Exp. 2). Evidence level
2. Gives a continuous depleting-patch distribution; S1 gathers once per epoch with no depletion mechanic, so only
the noise scale (σS/S0 = 0.1) is usable, as a reference for **familiar-kind stability** (low variance). Supports
DESIGN's "yields of familiar kinds are stable"; the exact variance stays an estimate.

**Source C (identified, not read).** Hutchinson, J. M. C., Wilke, A. & Todd, P. M. (2008). "Patch leaving in humans:
can a generalist adapt its rules to dispersal of items across patches?" *Animal Behaviour* 75: 1331–1349,
doi:10.1016/j.anbehav.2007.09.006 (PDF on the first author's site). The PDF fetched as compressed binary and its
Methods could not be read. It is the fishing-task paper; its pond-item distributions are **not** recorded here.
Cited as a pointer only; no number is taken from it. (Wilke et al. 2009, *Cognitive Science* 33: 497–529, is its
companion; also not read.)

## Novel-kind variance

**What is supported.** Source B: participants were told patches had never been harvested and were a priori identical;
richness had to be learned from experience, and Experiment 2 added between-patch quality variance (σS = 1) on top
of stochastic depletion. Source A: quality unknown on entry, inferred from reward history; the paper reports no test
of novelty or uncertainty effects on leaving. Level 2 for "unknown quality is learned from samples"; **neither gives
a variance for an unfamiliar kind versus a familiar one.**

**Wilke, A. & Barrett, H. C. (2009).** "The hot hand phenomenon as a cognitive adaptation to clumped resources."
*Evolution and Human Behavior* 30: 161–169, doi:10.1016/j.evolhumbehav.2008.11.004. Known from a search summary
only (not fetched): US undergraduates and Shuar adults expected clumped (streaky) outcomes for foraged resources;
Americans less so for coins. Evidence level 2 for a clumpiness prior; secondary-source summary. It bears on whether a
mind expects neighbouring patches to share yield, not on novel-kind variance. Not used for any S1 number.

**Result.** No source fixes the variance of novel kinds. DESIGN §2's "novel kinds have higher variance" stays a
fixture assumption. **Proposed estimate (labelled estimate):** a novel kind draws its yield from the same three
tiers but is unstable across visits, resampled each visit from {0, 1, 2} uniformly (variance 2/3), while a familiar
kind has fixed yield per patch with tier mix as in Source A. Sourced anchor: the Source B ratio of tier noise to mean
(σS/S0 = 0.1) for familiar stability.

## Scale (grid and epochs)

- Source B: four 14-minute blocks per session; subjects averaged 611 harvest-or-exit decisions and 103 tree visits
  (Exp. 1) and 913 decisions and 95 tree visits (Exp. 2); 10–26 analysed per experiment. Level 2.
- Source A: 40 targets per display, 30-minute sessions (or 6 × 10 minutes), 3.5 s travel; 42 analysed. Level 2.
- Both designs run on the order of 100 patch visits per session against S1's 36 patches and 12 epochs per mind
  (432 maximum gather actions across 36 patches is not reached; a mind visits at most 12 patches). S1 is far
  smaller than any human design. The grid and epoch count are **not** supported by these sources; they stay
  **estimate**. The 200-seed run count is a simulation sample size, outside this research.

## What the sources do not give

- Variance of unfamiliar versus familiar resources (no source found that reports it).
- A proportion of novel to familiar kinds (the one-third in DESIGN §2 stays estimate).
- Tier mix proportions beyond "random" (Source A) and the pond distributions of Hutchinson et al. 2008 (unread).
- Hot-hand figures from the full text of Wilke & Barrett 2009 (not fetched).
- A 6 × 6 spatial grid: the cited tasks are non-spatial patch-switch tasks with travel time, not adjacency moves.

## Verdict

Item 1 (yield distribution): sourced at level 2 for shape (three tiers 0.5 / 0.75 / 1.0, hidden until sampled).
Item 2 (novel-kind variance): not sourced; the estimate above stands. Item 3 (scale): not sourced; estimate.

Verdict: estimate
