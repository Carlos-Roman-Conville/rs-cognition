# Hungry-pair fixture

This is the **DESIGN §6 fixture**, not a platform mechanism. Its rules are **never
validated**: tests verify implementation, mathematics, conservation and replay.
They do not establish how real people behave. No registry mechanism is introduced.
The fixture imports Cognition through `src/index.ts` and Kernel through its public
package; no engine or game is imported and `src/` is unchanged.

From the cognition repository, with its dependencies installed and Node 24:

```powershell
node --experimental-strip-types bench/hungry-pair/run.ts --seed 1 > trace.json
node --experimental-strip-types bench/hungry-pair/run.ts --seed 1 --param beta=2 --param lambda=3 > comparison.json
npx vitest run test/bench-world.test.ts
npx tsc --noEmit
```

The CLI requires an integer seed, accepts repeated `--param name=value` overrides,
and emits one canonical JSON value to stdout. Errors go to stderr with exit code 1.
Overrides apply equally to all three minds. Supported names are `beta`, `lambda`,
`gamma`, `eta`, `alpha0`, `d`, `tau`, `s`, `kappa`, `k`, `n`, `m`; defaults come from
the engine's documented cognitive parameters. There is no server or wall clock.
The programmatic `runHungryPair` API additionally accepts a shorter experiment,
an encoding switch, and a personality hook for verification. A learning freeze
requires both `params: { eta: 0 }` and `encode: false`; body/world time still advances.

## Fixture rules and future owners

| Fixture rule (DESIGN §6) | Implementation and future owner |
| --- | --- |
| Minds | Mint order A, B, O. A/B start with hunger .6, identical priors, needs, parameters, repertoire and capacity. O starts at .1 and is another Cognition mind, with a “keep the stock” goal worth one per stock unit. Role configuration is host/Story data; every choice uses the same engine. |
| Food and hunger | Six initial stall units. Hunger rises by Δ / one day, clamped to [0,1]. A unit eaten lowers it by .25. **Nutrition P3** owns the eventual body model. |
| Ask | O selects give or refuse; no automatic generosity roll. **Economy/Society** own future transfers and social interactions. |
| Trade | Each visitor starts with one equal-value item. Only O's accept-trade decision transfers an item and one food unit together; refusal transfers neither. **Economy**. |
| Work | O chooses accept/refuse. Accepted labour occupies three complete subsequent epochs; O then chooses pay one unit or renege. **Economy** and future host activities. |
| Deceive | A promise of later labour is perceived testimony. O's naive acceptance model uses its own Beta-weighted belief in the speaker's reliability. O chooses whether to advance food. The visitor later chooses keep/break; keeping requires three labour epochs. O receives an observed kept/broken outcome, updates reliability and remembers the experience. **Society / future language and trust mechanisms**. |
| Steal | Detection occurs at O's next sensory epoch, using O's own perception stream and attention share at the stock/theft cue. Undetected theft transfers one available unit. Detected theft waits for O to choose confront, chase off, or let go. Detection evidence enters O's beliefs; responses enter episodic memory. **Reality P2** supplies future detectability, **Society/host** owns responses. |
| Fight | Bradley–Terry: P(a wins) = s_a² / (s_a² + s_b²). Initial capacities are 2/3 and 1, so O/A = 1.5. The loser loses .3 capacity for two days and gains pain. A visitor winner takes one stall unit if available; an owner winner takes one held visitor unit if available. **P2 two-fighters demonstration** owns the future contest; **Reality's injury** owns damage/recovery. |
| Leave | Six complete epochs away, then one found unit with probability .5, otherwise none. **Host geography / Economy endowments**. |
| Wait | One epoch, zero cost/capacity requirement, always available as the engine fallback. **Host action vocabulary**. |
| Cadence | 10-minute Δ, 144 epochs: one day. Kernel Scheduler order is body-fixture (`fast`) → cognition → resolution (`host`). **Host experiment protocol**, not a universal cadence. |

## Explicit proposed fixture conventions

DESIGN §6 leaves some details unspecified. These conventions are labelled fixture
in the code, and belong to the future owners above:

- Eating consumes whole held units while hunger is at least .25; O can also eat
  from its stall. Transfers/finds permit immediate eating. This is a **nutrition
  P3 stand-in**, not a resolution of the pending C-R2 appetite/eating ownership issue.
- Injuries stack additively, capacity clamps at zero, pain is .3 while any injury
  remains, and each injury expires independently. A zero/zero contest is symmetric
  (.5). A win never creates food when the loser/source has none.
- One undertaking per visitor can be outstanding. Requests wait for an appropriate
  owner answer; other attempts can fail as busy, absent, mismatched, or empty-stock.
  O can select responses for either visitor; mint order resolves simultaneous events.
  Refusing/reneging succeeds as O's chosen action while failing the visitor's request.
- Action opportunities are uncertain observations. All attempted actions remain in
  the repertoire, so a mind can attempt an unavailable action and learn from it.
  There is no policy branch on an agent ID or cognitive-parameter value. `keep` and
  `break` are the additional later decisions required by the promise rule; O's
  response vocabulary is also data in `models.ts`.
- Proposed sensory d′ is 4 and Weber fractions .1. Attention uses food, threat and
  person categories, neutral base 1 and corresponding need relevance 1. A distant
  visitor sees only its own body, possessions and opportunities. At the stall,
  minds also see stock and other capacities; O receives requests, theft locations
  (including absent locations) and spoken promises. Opportunity/request beliefs
  relax to their priors with a one-second half-life; Gaussian beliefs widen at
  q=.001 per second. Other categorical knowledge does not drift.
- Receipt/outcome cues use d′=64, criterion 0 and Weber fractions 0: a proposed
  explicit personal receipt convention. They still pass through `perceive`.
  Testimony composes sensory identification with the listener's own Beta reliability.
  The speaker's claim is never treated as truth about its future choice.
- Priors are proposed, not calibrated: .5/.5 generosity, vigilance, trust,
  effectiveness and promise priors; Beta(1,1) reliability; .1 harm probability;
  Gaussian variance 1 for body/resource estimates. Opportunity priors are .5/.5.
  Hunger/safety/social weights are 1, setpoints 0; social deficit grows at 1/hour
  and resets after a positive interaction. These are the §2.2 benchmark need forms.
- Naive models use beliefs: generosity for requests, believed capacities for combat,
  one minus vigilance for theft, believed owner trust for a promised advance, and
  O's testimony belief for acceptance. Success mass is multiplied by believed
  opportunity. Leave's prior find chance is .5. Theory combines with episodic
  memory through the public engine. Subjective effects are projected from current
  felt needs/goal progress; they never apply body changes. Proposed action costs
  are .05 for trade, work, leave and keeping a promise, zero otherwise.
- The stock goal is normalized by the experiment's maximum possible food supply,
  with goal value equal to that bound: each stock unit is always worth exactly one.
  O's progress input uses its perceived stock count, retaining previous progress
  if the cue is missed. No objective stock count goes into policy evaluation.
- Proposed learning likelihoods are .2/.8 for the relevant generosity/vigilance/trust
  and generic effectiveness latent. Combat shifts the opponent-strength likelihood
  mean by ±.1 with variance .25. Kept/broken promises supply one Beta observation;
  unrelated feedback supplies zero weight. Attribution and episodic encoding are
  the engine's public mechanisms, with the original intention EU retained.
- At epoch 144, unresolved undertakings get one **unfinished at horizon** receipt,
  distinguished from failure and success. Feedback is flushed at the same instant
  without a 145th body or decision epoch. Censored jobs remain in the final world
  snapshot for inspection. No labour/travel duration is shortened to finish the run.

## Trace, replay and checks

JSON includes seed, parameters, initial snapshot, decisions, causal outcomes,
attributions, outcome-learning belief deltas (prior/posterior/KL), per-epoch world
history, final state, and both cognition and host input logs. Outcome `cause` is
the **Kernel intention event ID**; its payload also names the qualified Cognition
intention ID. Attribution `cause` points to the outcome event. Diagnostics preserve
mint/time order; JSON object keys use Kernel canonical ordering.

Every run restores the initial snapshot and replays the Kernel cognition command
log through the public mechanisms, checking state, decision traces, and emitted
events. It separately replays host commands and logged sensory detection results,
checking every world frame, outcome and fixture RNG state. Replay failure fails
the run. Independent repeated seeded runs verify canonical trace identity.

The host stores complete diagnostics outside mutable reducer state so Kernel
Runner does not repeatedly clone the growing trace. After public `reduceMinds`,
the fixture retains unresolved intentions with their original evaluation and
removes completed diagnostic records; the append-only logs retain all of them.
The same host reducer composes public belief drift and subjective forecasts during
replay. No `src/` mechanism is modified or duplicated. Host randomness uses separate
`fixture.fight` / `fixture.find` streams per actor; Cognition uses its declared
per-mind streams. No additional steal-detection coin is tossed.

Checks assert `stock + eaten + held = 6 + found`, hunger in [0,1], exact action
durations and transfers, one causal outcome per intention, probability
normalization, replay, and a complete seeded day. They are **verification only**.
The 500/200-seed CB-5/CB-6/CB-7 studies, empirical validation, registry integration,
and sibling-engine integration tests belong to later benchmark/engine units;
this fixture does not claim those gates have passed.
