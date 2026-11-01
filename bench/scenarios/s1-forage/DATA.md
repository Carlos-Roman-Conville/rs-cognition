# S1 Forage field fixture data

No value here tunes F1–F13; the formulas stay frozen (Rex, 2026-11-01).

| Field | Value / role | Provenance | S1-SOURCES reference |
|---|---|---|---|
| `grid.width`, `grid.height` | 6 × 6 patches | estimate | Scale (grid and epochs): not supported by Source A/B; stays estimate |
| `kinds[].berry-red` | Familiar kind, share ⅓ of grid | researched (yield pmf) | Source A: low tier maps to support {0,1,2} with tier spacing 0.5 |
| `kinds[].root-brown` | Familiar kind, share ⅓ of grid | researched (yield pmf) | Source A: high tier maps to support {0,1,2} with tier spacing 1.0 |
| `kinds[].fungus-pale` | Novel kind, share ⅓ of grid | estimate | Novel-kind variance: no source; uniform resample per visit (proposed estimate) |
| `kinds[].share` (each ⅓) | Two-thirds familiar, one-third novel | estimate | Proportion novel/familiar: DESIGN §2 one-third; not reported in sources |
| `kinds[].cues` | colour, size with `physical` tag | estimate | DESIGN §2 visible cues; attribute names not from foraging papers |
| `cueTags` | F6 tag names and physical attributes | estimate | DESIGN §2 and §9; `present` / `targeted` / `remembered` semantics from DESIGN |
| `actions` (4) | move, inspect, gather, wait | estimate | DESIGN §2 action list and domain `space`; prose preconditions/effects for host |
| `episodes.perKind` | 4 starting episodes per familiar kind | estimate | DESIGN §2: mind has episodes for familiar kinds; count not sourced |
| `sources` | Bibliography keys | researched | Copied from S1-SOURCES.md (levels as stated there) |
| `provenanceSummary` | 2 researched, 1 estimate, 0 null kinds | — | Counts over `kinds` only |

Familiar yield pmfs are fixed low-variance tier shapes from Source A (PMC11327252). Source B (constantino-daw-2015) supports the stability assumption for familiar kinds (σS/S0 = 0.1) but does not set the numeric pmf entries. Hutchinson 2008 and Wilke & Barrett 2009 are cited in `sources` as in S1-SOURCES; no fixture number is taken from them.
