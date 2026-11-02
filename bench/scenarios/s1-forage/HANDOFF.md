# S1 fixture handoff

## Blocked

- Unit 5436: DESIGN §10.2 expects judging groups to have no eligible input, but the saved 24-seed ledger gives each of Te/Ti/Fe/Fi 4608 active / 0 eligible-not-activated / 14976 no-input opportunities. The shared F1/F2/F3 fallback explicitly counts internal-state opportunities outside the nominal domain. The addendum applies §10.1 to the saved counts (o_f ≈ 0.2353); it does not invent domain-only eligibility or force “not exercised”. Keeper reconciliation of that expectation is pending. DESIGN and frozen formulas remain unchanged.

- Frozen v1 reports aggregate hook outputs, not causal formula ids. Hook counts and changed cue shares are measured; `byFormula` and hook `formulaIds` remain null. No formula attribution is inferred from a parameter name.

## Interpretation limits

- Data supplies categorical colour and size cues. The public sensory hook receives the nonzero proposed Weber fraction and records F6's targeted modification, but categorical identification does not consume Weber precision. No numeric cue was invented to force an F6 effect. F6's present-physical attention lever is active.
- `remembered` metadata records prior visits; frozen v1's context has no remembered flag. It is not given an extra return preference. Initial familiar-kind episodes use perceived kind context. Action models and learning remain subjective.
- Familiar PMFs stay fixed; every gather samples its kind PMF as the task explicitly requests. Novel PMF is the estimate in data.json; no new variance adjustment is made.
- This unit verifies implementation, not behavioral separation or human validity. The controls and 200-seed analysis from DESIGN §0 belong to the later report unit, not claims made here.

## Observation diagnostics (3013)

Public observe results now expose readonly prior/posterior belief updates, cue identity, observation index, target attribute/about and JSON-safe KL. S1 copies these into `observationBeliefDeltas`; attention and interpretation ledger records retain the base-trajectory deltas. These are subjective beliefs, not independent causal shares. Ablation logic is unchanged.
