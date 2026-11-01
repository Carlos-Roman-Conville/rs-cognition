# Cognition: design (P7 baseline, Cognition keeper, 2026-10-30)

**Status: approved (Rex, 2026-10-30)**: C-Q1 to C-Q8 as proposed; C-Q4 kept (personality only after CB-1 to CB-7
pass); the crude-formula plan of §9; with the universal motivational architecture folded into §2.2. The belt units
in `Games/Card Games/_agent/queue/cognition/` are released. C-R2 (appetite and the eating rule) was settled by Rex on
2026-10-30 (DUP-49, overlap batch 2).

Every item is marked **(Rex)** = Rex's decision, **proposed** = the Cognition keeper's proposal, or **open** = a
question for Rex or another owner (§12 lists them). Evidence levels are PLATFORM.md §4: (1) physical or
mathematical law, (2) empirically supported statistical relationship, (3) historical observation, (4) simplified
simulation approximation, (5) hypothetical or experimental model, (6) fiction. **Most of cognition is level 4–5**:
the forms below are published models with some human data behind them, but nobody has a validated model of a whole
mind. Where a part rests on a strong empirical regularity (the power law of forgetting, signal-detection theory,
loss aversion, the Luce choice rule) it says so; everything else is a labelled approximation with an experiment
that would test it (§10).

## 0. What Cognition is, and its fence

**(Rex, 2026-10-30)** The engine generates an organism's **intentions** from perceived conditions, internal needs,
knowledge, memory and cognitive structure, and keeps the **objective world state apart from the individual's
subjective interpretation**. Baseline first, with no personality model: (1) perception and a subjective world
representation; (2) needs, goals and motivational priorities; (3) knowledge and memory, including incomplete and
wrong beliefs; (4) action generation, evaluation and selection; (5) learning: observe the result, attribute the
cause, update beliefs. The decision policy is

```
a_t = π(o_t, m_t, n_t, p)
```

with `o_t` the observation, `m_t` memory and beliefs, `n_t` needs, and `p` the personality structure: present in
the interface from the start, set to a **null model** in the baseline. Personality is the second, experimental
layer (§9): Rex's eight-function model changes **how experience is processed** (attention, interpretation,
strategy generation, learning), never assigns behaviours to types (CTRL-7: one optional configurable model, never
hardcoded).

**The ordering principle (ENGINES.md):** physics decides what can happen, biology what an organism can do,
cognition **what it attempts**, society the institutions and incentives around the attempt. Cognition outputs
intentions; it never decides whether an attempt succeeds.

**Boundaries (Rex):**

| Not Cognition's | Owner | How Cognition gets it |
|---|---|---|
| Neurological signalling: substances, receptors, arousal, mood bias | Reality, `realism/src/neurology.ts` | read through a port (optional in the baseline; §8) |
| Hunger's body side: physiological signals vs eating decisions | **(Rex, 2026-10-30, DUP-49)** Reality owns hunger, satiety and taste perception as signals; Cognition owns food preference, anticipated enjoyment, appetite motivation and the eating decision | hunger, satiety and taste signal ports; **Cognition owns the felt need, its priority, and the eating decision** |
| Physical capability | Reality, `capacity.functional` (DUP-15) | a capacity port, stub until built |
| Light and sound reaching an observer | Reality, P2 optics and acoustics | a detectability port, a declared stub until P2 |
| Whether an action succeeds, and the world's state | the engine that owns that state (Reality, Economy, Settlement, Society, Government) | outcome events back to the mind |
| Time, ids, events, RNG, replay, units | Kernel | `@rex/kernel` (§7) |
| Norms, sanctions, institutions | Society (P6), Government (P8) | later, as beliefs and incentives; none in the baseline (open C-Q6) |
| The pirate STATS attributes, alignment square, 16 response charts, PSYCHOLOGY.md meters | pirate plugin | they stay pirate reads of Cognition's outputs (§11) |

**Package rules (Rex, via the controller):** `Toolchain/cognition/` is its own git repo, TypeScript with vitest like
the engines, imports `@rex/kernel` (`file:../kernel`) and nothing from any engine or game. Independent of
pirate-ship.

## 1. Objective world vs subjective mind (proposed)

Two kinds of state, never mixed:

- **Objective state** belongs to the engines (or, in the benchmark, the fixture world, §6). Cognition never holds
  or reads it.
- **Subjective state** is the mind's own: its beliefs about what exists and what it is like, its memories, its
  needs as felt, its intentions. It may be incomplete or wrong.

The only place where truth touches a mind is the **sensory boundary**: a host supplies *stimuli* (the true value
of something plus how detectable it is to this observer); perception (§2.1) turns them into *observations* that
may be missed, noisy or wrong. Everything downstream of perception sees observations, never stimuli. Enforced by
types and a test: the policy `π`, belief update, evaluation and learning take no argument that carries a true
value, and a fence test checks no module past `perception.ts` imports the `Stimulus` type.

The same applies to other minds: an agent never reads another agent's beliefs or parameters, only what that agent
did or said (observations and testimony).

**Backend records are never read by a mind (Rex, 2026-10-31; DUP-61, §17).** The History record (`history.*`) and
the collective knowledge stock (`knowledge.*`) are aggregates computed *from* minds and surviving records; no
`mind.*` quantity holds a copy of either, and no Cognition module reads them. The fence test gains both prefixes
when the communication and history rows are built.

## 2. The five baseline mechanisms

Notation for one mind at decision epoch `t` (period `Δ`, a host parameter, §7). Probabilities are dimensionless
(`1`); time in SimTime ms, converted to seconds where a formula says so. Φ is the standard normal CDF.

### 2.1 Perception and attention → observations (mechanism rows `cognition.perception.detect`, `cognition.attention.allocate`)

**Input (per stimulus `c`):** `{ cue, about (entity id), attribute, value v* (categorical or real), detectability
d'_c ≥ 0 (at full attention), channel (sight | sound | touch | report), relevance tags }`. Until P2 optics and
acoustics exist, `d'` is a **declared stub** the host sets (benchmark fixture values, labelled); afterwards
Reality supplies it per observer and cue (signal-to-noise at the observer).

**Attention (level 2 for the form, 4 for the mapping).** A limited capacity is shared among the cues present by
Bundesen's Theory of Visual Attention weight rule (Bundesen 1990; Bundesen, Habekost & Kyllingsbæk 2005):

```
w_c = s_c · Σ_j η(c, j) · π_j          a_c = w_c / Σ_c' w_c'
```

`s_c` the cue's sensory salience (from `d'_c`), `η(c, j) ∈ [0,1]` how strongly cue `c` belongs to category `j`
(host relevance tags: "food", "threat", "person"), and `π_j` the **pertinence** of category `j` for this mind now:
`π_j = π0_j + Σ_k priority_k · rel(j, k)` (need priorities from §2.2; proposed). The personality hook multiplies
`π_j` (§9); the null model leaves it.

**Detection (signal-detection theory, level 2).** Attention acts as sampling, so effective sensitivity is
`d'_eff = d'_c · √a_c` (ideal-observer √n scaling, level 1 as mathematics, level 4 as the attention model). With
criterion `k` (a cognitive parameter): hit `P_H = Φ(d'_eff/2 − k)`, false alarm `P_FA = Φ(−d'_eff/2 − k)` (Green &
Swets 1966; Macmillan & Creelman 2005). A draw from stream `cognition.perception.detect` decides whether the cue is
detected; a false alarm creates an observation of a cue that is not there (an absent cue the host declares as a
possible location, e.g. "someone behind the stall").

**Identification (level 4).** A detected categorical attribute with `K` values is reported correctly with
`q = 1/K + (1 − 1/K) · (2Φ(d'_eff/√2) − 1)` (interpolates chance to perfect), otherwise as one of the other values
uniformly. A real-valued attribute is reported as `x = v* + ε`, `ε ~ N(0, σ²)`, `σ = w_ch · |v*| / √a_c` (Weber's
law, level 2; `w_ch` a Weber fraction per channel, researched per channel by the unit that builds it).

**Output:** `Observation { cue, about, attribute, reported value, channel, t, model: {P_H, P_FA, q or σ} }`: the
mind's own model of how reliable that observation was, which belief update uses. **No true value is carried.**
Also an explicit **null observation** for every attended location with no detection (missing a thing is evidence).

### 2.2 Needs, goals and motivational priorities (rows `cognition.needs.drive`, `cognition.goals.objectives`)

**(Rex, 2026-10-30) A universal motivational architecture.** Motivations **compete and interact by circumstance**;
nothing executes top-down. A hungry person can protect a child; someone in danger can pursue status. The frameworks
used, each for what its evidence supports:

| Framework | Used for | Evidence (PLATFORM §4) |
|---|---|---|
| Homeostatic regulation (Cannon 1932; Keramati & Gutkin 2014 as the RL formulation) | physiological needs as deviations from setpoints; reward as drive reduction | physiology strong (2); the motivational model 4 |
| Allostatic regulation (Sterling & Eyer 1988; Sterling 2012) | anticipated bodily demands: acting before a deficit arrives | 3–4 |
| Self-Determination Theory (Deci & Ryan 1985, 2000; Ryan & Deci 2017) | autonomy, competence and relatedness as psychological needs | 2 (substantial cross-cultural support) |
| Maslow 1943 | the **classification** of needs only (physiological, safety, belonging, esteem/status, growth/curiosity); **never** a priority pyramid; the strict hierarchy is weakly supported (Wahba & Bridwell 1976) | 3 as a taxonomy |
| Reinforcement learning (Sutton & Barto 2018; Schultz, Dayan & Montague 1997, reward prediction error) | how outcomes alter future choices (§2.5) | 2 |
| Expected-utility decision theory (von Neumann & Morgenstern 1944; prospect-theory loss aversion) | choosing among actions (§2.4) | 1 normative, 2 descriptive with known violations |
| Active inference (Friston 2010; Parr, Pezzulo & Friston 2022) | a possible unifying framework, held as an alternative to test, not adopted | 5 (debated) |

**Motivational pressure (proposed starting model).**

```
M_i(t) = w_i · D_i(t) · S_i(t)          priority_i(t) = M_i(t) / Σ_j M_j(t)
```

`w_i` the individual's sensitivity to need `i` (configuration; identical across the benchmark's minds), `D_i(t) =
|h*_i − h_i(t)| ∈ [0,1]` the degree of unmet need, `S_i(t) ≥ 0` the situational salience: how strongly the mind's
current observations and beliefs bear on the need (`S_i = 1 + Σ_c a_c · η(c, i)` over attended cues tagged with the
need, e.g. food in sight raises hunger's salience; proposed, level 4). Priority feeds attention pertinence (§2.1) and
which goals are formed; the reward that evaluation uses stays the homeostatic drive reduction below, so pressure
steers attention and goal formation while drive reduction scores outcomes: two roles, one deficit, no second
penalty. **Open extensions** (C-M1…C-M3): interactions between needs (one need's pressure scaling another's), urgency
thresholds (a deficit beyond which a need preempts), allostatic anticipation (`D_i` including the deficit the mind
predicts over its horizon), and long-term goals feeding `M` as needs do.

**Boundaries (Rex, restated).** Reality owns physiological signals and biological deficits: hunger, thirst, pain,
fatigue, temperature, reproductive state. Cognition owns motivational appraisal, competing priorities, goal
formation (safety, belonging, autonomy, status, curiosity, goals, values) and action selection. Cognition computes no
biological need and applies no duplicate motivational penalty: a physiological `D_i` is Reality's signal read
through its port, and the drive never feeds back a physiological effect. **Personality never manufactures
motivations** (§9): its hooks cannot touch `w_i`, `D_i`, setpoints or the need list; an Ne-dominant is not
automatically more curious or less hungry.

**Appetite and eating (Rex, 2026-10-30, DUP-49).** Eating is an action evaluated and selected like any other
(`cognition.decision.select`), with the hunger need's deficit read from `body.hunger_signal`. Food preference and
anticipated enjoyment are Cognition's; their form is §13 preference learning, which is not designed yet. The old
nutrition-library thresholds (eat if appetite > 0.3 or hunger > 0.8) are **not adopted** as rules. Cultural food
norms are Society's and unowned until Society exists.

**Needs are data, extensible from the first unit (Rex).** A need is a record, never an enum:
`{ id, category (Maslow class; SDT tag autonomy | competence | relatedness where it applies), source, setpoint,
weight w, salience tags }`, where `source` is one of `{ signal: <quantity id> }` (Reality's deficit, e.g.
`body.hunger_signal`), `{ appraisal: <belief query> }` (e.g. safety = believed probability of serious harm),
`{ accumulator: { rate, reset_on: <outcome tags> } }` (e.g. social connection). Adding a need (thirst, warmth,
status, curiosity, autonomy) is a configuration row, no code. **The benchmark's set stays hunger, safety, social
connection (Rex, C-Q5).**

| Need | Deficit `h_k` comes from | Owner of the signal |
|---|---|---|
| hunger | the body's hunger signal (`realism.nutrition.hunger_fullness`, documented-only today; a host stub until P3 builds it) | Reality (body); Cognition owns `h` as felt and its priority |
| safety | the mind's own believed probability of serious harm over its horizon, from beliefs (§2.3), plus pain if present (`body.pain`, Reality) | Cognition (belief); Reality (pain) |
| social connection | grows with time since the last positive interaction, `dh/dt = 1/τ_soc`, reduced by interactions the mind evaluates as positive (level 5; social homeostasis, Matthews & Tye 2019, level 3–4 as an observation) | Cognition |

**Drive and reward (Keramati & Gutkin 2014, homeostatic reinforcement learning; level 4).**

```
D(h) = ( Σ_k w_k · |h*_k − h_k|^n )^(1/m)        n > m ≥ 1        r(h → h') = D(h) − D(h')
```

Reward is drive reduction; with `n > m` urgency grows faster than the deficit, so a starving mind weighs food above
everything (the model's documented property; the paper's defaults `n = 4, m = 3` are the proposed starting values).
**Priority** is the share of motivational pressure `M` defined above (it replaces the drive-gradient share of the
first draft); it feeds attention pertinence (§2.1) and is reported in every decision trace with `w`, `D` and `S`.

**Personal objectives.** A host (or Story, ENGINES.md "story defines motives") may give a mind standing goals
`g = { id, value V_g, progress p_g ∈ [0,1], deadline? }`; an outcome that advances `p_g` adds `V_g · Δp_g` to the
reward. The baseline benchmark gives the owner one ("keep the stock"), the hungry pair none.

### 2.3 Knowledge and memory, with incomplete and wrong beliefs (rows `cognition.belief.update`, `cognition.memory.episodic`)

**Beliefs: the subjective world.** A belief is a distribution the mind holds about `(entity, attribute)`:
categorical → a probability vector; real → a Gaussian `(μ, σ²)`; existence → `P(exists)`. Entities are referred to
by the mind's own handles (qualified kernel ids in the baseline; mistaken identity is open, C-Q9). A mind starts
with host-given **priors**: ignorance (uniform, wide), knowledge, or **false** knowledge (a confident wrong prior).
Nothing forces a belief to be true.

**Update (Bayes, with conservatism; level 4, the conservatism phenomenon level 2, Edwards 1968).**

```
categorical:   P'(v) ∝ P(v) · L(obs | v)^η
real (Kalman): K = σ² / (σ² + σ_obs²/η),  μ' = μ + K (x − μ),  σ'² = (1 − K) σ²
existence:     detected: L = (P_H | exists, P_FA | absent);  attended but not detected: L = (1 − P_H, 1 − P_FA)
```

`L` comes from the observation's own reliability model (§2.1), so the observer is calibrated to its senses
(miscalibration is a later parameter, open). `η ∈ (0, 1]` is **belief inertia**: η = 1 is a Bayesian observer,
lower η under-updates (a cognitive parameter, and the personality "interpretation" hook, §9).

**Testimony.** A message "attribute = v" from speaker `j` is evidence weighted by the listener's belief that `j`
is honest and informed, `r_j` = the mean of a Beta(α_j, β_j) belief about `j`'s reliability:
`L(v') = r_j · [v' = v] + (1 − r_j)/K`. Lying works exactly to the extent the listener trusts the liar, and an
exposed lie lowers `r_j` (§2.5): deception has consequences through beliefs, not through a rule. The per-speaker
reliability is the registry quantity `mind.source_credibility` (planned writer `cognition.communication.credibility`);
it lives in the mind, never on Society's network tie (DUP-60).

**Change over time.** Between observations, real beliefs widen, `σ² ← σ² + q_k · Δt` (the mind's expectation that
the attribute drifts), and categorical beliefs relax toward their prior at rate `λ_b = ln 2 / h_b` (level 4).

**Episodic memory (ACT-R base-level learning; level 2 for the power law of forgetting).** Each experience is an
episode `e = { id, t, context features, action, outcome, reward, prediction error, attributed cause }`. Its
activation at time `t` (seconds) is

```
B_e(t) = ln( Σ_j (t − t_j)^(−d) )        P_retrieve(e) = 1 / (1 + exp(−(B_e − τ)/s))
```

with `t_j` the encoding and each later retrieval (Anderson & Lebiere 1998; Anderson & Schooler 1991); `d = 0.5` is
ACT-R's researched default, `τ` (threshold) and `s` (noise) cognitive parameters. Retrieval noise draws from stream
`cognition.memory.retrieve`. Forgetting therefore follows a power law of time (Wixted & Ebbesen 1991; Rubin &
Wenzel 1996), which is the validation target V1 (§10).

**Knowledge used to predict outcomes: one model, two sources.** To avoid two competing expectation mechanisms, the
predicted outcome distribution of action `a` in context `c` is a single Dirichlet–categorical whose counts combine
the mind's **theory** (derived from beliefs) and its **experience** (episodes weighted by how retrievable they are):

```
n_o(a, c) = α0 · P_theory(o | a, c, beliefs)  +  Σ_{e ∈ E(a,c)} P_retrieve(e) · [o_e = o]
P̂(o | a, c) = n_o / Σ_o' n_o'
```

`α0` (prior strength) is a cognitive parameter: high α0 trusts theory over experience. `P_theory` is the action's
**naive model** (§2.4), evaluated on the mind's current beliefs, never the truth. This is instance-based learning
on an ACT-R memory (Gonzalez, Lerch & Lebiere 2003; Gonzalez & Dutt 2011), level 4, with a published human
benchmark (V2, §10).

### 2.4 Action generation, evaluation and selection (rows `cognition.decision.generate`, `cognition.decision.evaluate`, `cognition.decision.select`)

**Repertoire (data).** Actions are **affordances supplied by the host as data**, never coded per scenario in
Cognition: `{ id, target kind, preconditions (over beliefs), outcome space O_a, duration in epochs, capacity
required, cost (effort), naive model }`. The naive model is a small declared expression the mind evaluates on its
beliefs (e.g. P(win a fight) from believed strengths, §6). A "wait" action always exists.

**Generation.** Candidates = repertoire entries whose believed preconditions hold with probability ≥ `θ_pre`
(proposed 0.5) and whose required capacity the body has (`capacity.functional`, stub). The personality hook may
reorder or add recombinations of repertoire entries (§9); the null model returns the list unchanged.

**Social affordances (agreed with Society, 2026-10-31; IF-46, proposed to Rex).** Society supplies the social
candidate actions open to a person (join, leave, found, propose, support or oppose, pay, attend, participate, marry,
move, seek or avoid contact) with their charter terms, as repertoire entries: host data like any other action.
Generation filters them by the mind's **believed** preconditions (`θ_pre`), never by Society's truth; Society checks
whether the action is actually open when the intention is attempted, and a refusal is an outcome the mind learns
from (§2.5). Charter terms reach the mind as observations or testimony (§1); Society never writes a belief.

**Resolution of an intention (CG-16, IF-26, IF-27; agreed with Reality, Life and Economy 2026-11-01; Settlement
pending; Rex approved integration first, CHAINS.md).** Cognition decides whether a mind attempts an act (the
`cognition.intention` event, payload `Intention`); it never decides whether the act succeeds. Resolution is the
shared contract `shared.action.resolution` (registry-owned, like `shared.contract.labour_supply`):
`resolve(intention, truth) → { status, stimuli, transfers }`, implemented by the engine that owns the action kind in
`shared.action.kind`. One resolver per intention; the kind table says which.

| Action kinds | Resolver | What it checks and moves |
|---|---|---|
| `move`, `gather` (first units, against the S1 fixtures), later contact and strikes | Reality | reachability, distance → time from a speed with its surface term (research unit 3020, CG-5; Life owns the body-speed side); reach and contact; the transfer debits the owning ledger (plants: Life's `plant_state`; water: Reality's hydrology once CG-2 exists); the owner refuses an overdraw, the resolver never decides stock |
| `eat` (body side) | Life | preconditions in truth: body alive, can swallow and the gut works (anatomy feed gate, intestines), the food id exists in nutrition, taken mass > 0; then `eatMeal({food, kg})`: Δbody = +E_kept, Δwaste = +rest (CG-13); the source debit is its owner's (Economy `takeMass` for an inventory item, Life's `plant_state` via IF-42 for wild food), in the same transaction |
| `buy`, `sell` | Economy | `economy.trade.trade` at the market price, refused when the price is above `terms.price_max` or below `terms.price_min`, beyond stock, or with no price; `terms.quantity` in the good's units |
| `consume` | Economy then Life | `takeMass` (Δinventory = −q, q = `terms.kg`) then `eatMeal` (CG-19 pair), one transaction |
| `work`, `refuse_work` | Settlement with Economy | CONTRACTS §16: the host (or Reality's population provider, the LabourSupply owner) reads the latest `work`/`refuse_work` intention from the event stream and answers `hours(person, role, day)` (`terms.hours`; 0 after `refuse_work`); Settlement takes that answer through its declared ports and never reads the stream; `terms.wage_min` is served by CONTRACTS §19 `reservationWage?(person, role, day)`, money per filled post-day, read only by Economy's wage quote as a floor; staffing gains no rule: working for less is the mind's decision, closed by `refuse_work`; agreed, CONTRACTS §19 (2026-11-01), economy da42670, settlement 87ff281) |
| social acts (join, propose, marry, …) | Society | openness at the attempt (IF-46, the social-affordances paragraph above) |
| attempted violations | Government | whether an enforceable violation occurred and whether enforcement follows (IF-43) |

- **Success is the resolver's equation, never Cognition's.** Reality supplies the act's physical demand (mass,
distance, terrain); Life supplies `body.capacity_functional` (DUP-15): a record of named capacities in physical
units (sustained power, force per muscle group, gut function, reach and grip, fatigue and organ state), with a 0–1
fraction-of-normal view for display only. demand > capacity → `failed` (attempted; effort and time spent) or
`impossible` (cannot start, e.g. an organ at its crisis floor). Where the act is a rate the outcome scales
deterministically: `work done = min(demand, capacity) × duration`. No probability unless a source gives the
variability (tremor, measured performance spread), then a seeded draw with its source.
- **The resolver never reads the mind.** The candidate's `capacityRequired`, `duration`, `cost`, `preconditions` and
the intention's `expectedOutcomes` are beliefs (§1); a resolver's signature takes only `id`, `action`, `target`
and `terms` (Life adds a fence test on its side). Detectability (`realism.perception.detectability`, Life's) is an
input to the mind's perception, never a filter the resolver applies.
- **One transaction per intention (PLATFORM §7a).** Source debit by its owner, destination credit, the effort and
time cost through Life's energy ledger (also on `failed`), then the outcome event, inside one `kernel.transaction`;
through `kernel.transfer` once kernel v0.1.0 lands. Δsource = −q and Δdestination = +q; losses accounted
separately. A smaller available q than requested resolves `completed` with the smaller q (Economy unit 3010
tests that); an overdraw is refused by the owner.
- **Status.** `impossible`: a precondition is false in truth, no transfer. `failed`: attempted, effort and time
only; a refusal (Economy's `refused { cause, reason }`, Society's closed action) is `failed` with the reason among
the stimuli, and the mind learns from it (§2.5). `completed`: the transfer happened. (C-Q25, decided by the controller 2026-11-01, recorded for Rex to overrule).
- **One outcome event type for every kind: `shared.action.outcome { cause, status, stimuli, payload? }`** (registered
under CG-18; `cause` = the intention event id). Engine-native records (a trade, a `refused`, a future
`contact_event`) travel as the payload or as siblings in the same transaction; Economy's commands take an optional
`cause?` copied onto their events. Settlement's `hire` takes `cause?` and, when it applies, emits its native `postFilled { post, holder, wage, cause }` and `shared.action.outcome { cause, status: completed, stimuli, payload: postFilled }` in one transaction: the hire resolves the `work` intention; each later day's assigned hours and wage payments are ordinary state the mind perceives, not a new outcome; "not hired" is `failed` from the side that declines (the employer's decision or Economy's clearing). The host adapter turns the outcome event into Cognition's `outcome` command;
there is no `cognition.outcome` type and no second channel. Duplicate or uncaused outcomes stay ignored and logged.
- **Stimuli are raw truth at the scene**, perceived by each mind through its own perception (§2.1): scene changes
observable by anyone present (the food item reduced or gone, the actor's new position); interoceptive signals to
the actor only (taste from the food's composition, gastric fill from the mass eaten; Life owns both, DUP-49).
Delayed consequences are **not** in the outcome event: `body.satiety_signal` and `body.hunger_signal` change over
the following hours as ordinary body signals, and §2.5's attribution handles the delay.
- **`terms?: Readonly<Record<string, number>>`** on `Candidate` and `Intention` (unit 3044): numbers only, filled by
the host's repertoire entry and passed through untouched; the host maps its action names to each engine's
operations (fixture names `acquire`, `sell`, `consume`, `work`, `refuse_work`); which market and whose inventory
are resolved by the host from the mind's holder and location, never terms. Economy reads the event stream (one
substrate, never a copy). **Convention for `work` (controller, 2026-11-01; IF-27):** `terms` stays numbers only;
the role or post handle goes in `target`, chosen by the generate step from the roles the mind perceives (IF-46
affordances, never Settlement's internal list); a `work` intention with no `target` is not hired: the host resolves
it `failed`, reason "no target". No type change.
- **Never both (CG-23).** A buy by an individually simulated mind is a trade, not per-capita demand; a person with
a `work` intention is not in the cohort's labour supply; the population provider's headcount must exclude
simulated minds (Life's rule, C-Q26: each person or organism is held at exactly one resolution, an individual record or a cohort member; promotion and demotion move the count in the same transaction, Σ individuals + Σ cohort counts invariant; Society inherits it unchanged under DUP-41).
- **Verification at the commits.** Economy: an `acquire` with quantity 3 and `price_max` ≥ price makes one trade,
market stock −3, holder +3, 3 × price on Settlement's ledger in one transaction, outcome event with the
intention's cause; below the price, refused with no state change; replay identical. A `work` intention for 8
hours gives `hours = 8`, Settlement assigns at most 8, the wage quote counts them, `refuse_work` gives 0, and the
person is absent from the cohort supply. Life: the eat resolver's fence test and CG-13's conservation. Reality:
move and gather conservation against S1. Cognition: the existing `outcome` tests plus the `terms` pass-through.
The hungry pair's `world.resolve` stub is replaced only once CG-24 and DUP-15 are built.

**Evaluation (expected value of drive reduction; level 4, loss aversion level 2).**

```
EU(a) = γ^(dur_a − 1) · Σ_o P̂(o | a, c) · v( r(o) + Σ_g V_g Δp_g(o) − cost_a )
v(x) = x if x ≥ 0, λ·x if x < 0
```

`r(o)` is the predicted drive reduction (§2.2) after the outcome's predicted changes to needs; `λ` loss aversion
(Kahneman & Tversky 1979; Tversky & Kahneman 1992 median ≈ 2.25, level 2); `γ` the per-epoch discount (exponential;
hyperbolic is an alternative to test, open). Lookahead is **one action deep** in the baseline: multi-step plans
appear as multi-epoch actions (work) and as learned values; deeper planning is a later mechanism (open C-Q8).

**Payment acceptance (`cognition.valuation.payment_acceptance`, a specialisation of this evaluation; multi-economy
design v2 with Cognition's amendments 1–5, agreed through the controller 2026-11-01; keeper's form, proposed, level
4–5).** Whether a mind takes an asset as payment is the evaluation above applied to an exchange. No second
evaluator exists: an exchange outcome gains one more term inside `r(o)`, the value of the holdings it changes. Money
is never a property of an asset (Rex, R1). An asset is worth holding for what it does for the mind's needs, and for
what the mind believes others will give for it (Menger 1892, saleability; Jones 1976 and Kiyotaki & Wright 1989,
media of exchange that emerge from beliefs about acceptance; level 4).

- **Assets are host data.** `GenerationInputs.assets` lists, for each asset `m` the mind may hold: its id;
  `usefulness`, the deficit reduction per unit for each need (from goods data; Reality and Life own the physical
  facts); optionally `issuer` (an entity handle); and the belief keys the mind uses: `accepted` (a categorical belief
  `(m, accepted@<market>)` over `yes | no`), `rate:<b>` (a real belief, units of `b` per unit of `m`) and `genuine`
  (a categorical belief `(m, genuine)`). A key with no belief yet contributes nothing (ignorance, not a default).
- **Value of one unit to mind `i` (proposed):**

```
D_i(m) = r(needs after one unit of m reduces each deficit by usefulness_m)            direct usefulness, §2.2
E_i(m) = γ · P_i(genuine m) · T_i(issuer m) · max_{b ≠ m} [ P_i(m accepted) · μ_i(rate m→b) · D_i(b) ]
V_i(m) = D_i(m) + E_i(m)
```

  `E` is expected exchangeability, one exchange deep like every other lookahead here (C-Q8). `T_i` is the mind's
  trust that the issuer will honour the asset (`cognition.relationship.trust`); it is 1 for an asset with no issuer.
  `P_i(genuine)` comes from perception with its precision (counterfeit recognition). Transaction and verification
  cost is the action's `cost`. Every input is the mind's own belief. Society's acceptance share and Government's
  legal tender reach these beliefs only as host-delivered observations or testimony (§2.3, weighted by
  `cognition.communication.credibility`), and they may be wrong or stale.
- **Exchange candidates.** A repertoire entry may declare `exchange: { give: { asset, units }, want: { asset,
  units? } }`. Its outcome `filled` adds `Σ_legs Δunits · V_i(asset)` to `r(o)`. Giving is therefore a loss, and `λ`
  applies to it as to any loss. The outcome `not filled` adds nothing. The asset pair also names the action id or
  `target` (the convention for `terms`: numbers only). `accept` carries the offer handle in `target` and both legs'
  units. A refusal comes back as `shared.action.outcome` `failed` with its reason among the stimuli, and §2.5 learns
  from it through the host's naive model. A `not-accepted` refusal therefore moves the mind's belief that the payee
  accepts `m`.
- **Reservation ratio, derived and never stored.** For an `offer` whose `want.units` is omitted, the mind computes
  `ratioMin = r*`, the least ratio of `want` per unit of `give` at which the offer's `EU` equals the best
  alternative's (the highest `EU` among the other candidates, excluding exchanges on the same pair). It finds `r*`
  by bisection on this same `EU`, which rises with `r`. The offer's own `EU` for selection is evaluated at the believed
  rate `μ_i(rate give→want)`, so the mind offers when it expects to gain. If it expects to lose, it does not offer.
  The committed intention carries `terms.ratioMin = r*` and `terms.giveUnits`. The host builds Economy's `offer` with
  `want.units = ratioMin · giveUnits`. With no rate belief, or no `r*` within the bound, there is no offer candidate.
- **Fence.** Cognition never reads Society's `acceptance` or Government's `legalTender`. Acceptance is never seeded.
  The host seeds needs, prior beliefs about who accepts what, and trust priors, and it records the seed. Personality
  v1 (F1–F13) is untouched. The null personality is the default, so no stack assigns acceptance.
- **Tests (the agreement's §8 rows a–d):** (a) with Society's share changed and the mind's observations unchanged,
  decisions are byte-identical. (b) Changing the perceived share moves `P_i(m accepted)`, and through it `E`, `V` and
  `EU`, and nothing else: needs, trust and personality outputs are unchanged. (c) A `not-accepted` refusal gives a KL
  greater than 0 on the payee-acceptance belief. (d) Under the null personality, no configuration path assigns
  acceptance. Open: P_fill does not yet depend on the ratio offered (PA-Q1; a market-depth belief would make `r*` a
  fixed point). The bisection bound is the keeper's (PA-Q2).

**Selection (Luce choice rule / softmax; level 2 as a descriptive choice model, Luce 1959).**

```
P(a) = exp(β · EU(a)) / Σ_a' exp(β · EU(a'))
```

drawn from stream `cognition.decision.select`. **Commitment** (Bratman 1987; Cohen & Levesque 1990; level 5 as a
quantitative rule): a current intention `ι` is kept until it completes, fails, becomes impossible, or
`max_a EU(a) − EU(ι) > κ`. The committed intention is emitted as a kernel event `cognition.intention { mind, action,
target, expected outcome distribution }`; the host resolves it. Every decision writes a **decision trace** (each
candidate, its `P̂`, `EU`, `P(a)`, the beliefs and needs used): the traceable "why" PLATFORM §11a requires.

### 2.5 Learning: observe, attribute, update (rows `cognition.learning.outcome`, `cognition.learning.attribution`)

When the host emits an outcome event whose `cause` is the mind's intention event id (kernel causality, §7):

1. **Observe.** The outcome reaches the mind as observations (§2.1): what it perceives of the result, not the result.
2. **Prediction error.** `δ = r_obs − EU(ι)`: recorded on the episode and in the trace. `r_obs` is the subjective
   value of the perceived outcome category under the same utility and needs that `EU` uses (keeper ruling
   2026-10-30, COG-11); there is no second reward channel, so learning and `δ` cannot disagree in sign.
3. **Encode** the episode (§2.3); its future retrievability now feeds `P̂` for that action and context.
4. **Update beliefs** about the latent attributes the outcome bears on (the owner's strength, generosity,
   vigilance; a speaker's reliability), by the same update rule as §2.3 with the naive model as likelihood:
   `P'(θ_latent) ∝ P(θ_latent) · P_theory(o_obs | a, θ_latent)^η`.
5. **Attribute the cause (level 5; Kelley 1967 covariation, Bayesian inverse planning, Baker, Saxe & Tenenbaum
   2009, level 4).** The candidate causes are the latents updated in step 4 plus "chance". The attributed cause is
   the latent whose posterior moved furthest from its prior (KL divergence), "chance" if none moved by more than
   `ε_attr`; ties broken by declared latent order. Attribution is a **read-out of the belief update, not a second
   update**, so no duplicate mechanism; Society (P6) will consume it ("who is blamed", ENGINES.md).

Later decisions change through two channels only: the beliefs feeding `P_theory`, and the episodes feeding the
experience counts. No reward-to-action shortcut exists, so every change in behaviour is traceable to a belief or a
memory.

## 3. The policy interface (proposed)

```ts
interface PersonalityModel {           // p: the slot, CTRL-7
  id: string
  pertinence(base: Record<string, number>, ctx: MindView): Record<string, number>      // attention, §2.1
  interpret(base: InterpretParams, domain: Domain, ctx: MindView): InterpretParams      // interpretation: η, α0, λ, confidence, Weber w, testimony floor (§2.3, §2.4; §9)
  generate(candidates: readonly Candidate[], base: GenerateParams, ctx: MindView)
    : { candidates: readonly Candidate[]; params: GenerateParams }                       // strategy generation: κ, recombinations, other-mind model (§2.4; §9)
  learning(base: LearningParams, domain: Domain, ctx: MindView): LearningParams        // learning: rate, memory decay d, belief half-life (§2.3, §2.5; §9)
}
const nullPersonality: PersonalityModel  // identity on every hook

function policy(o: Observation[], m: MemoryState /* beliefs + episodes */, n: NeedState,
                p: PersonalityModel, theta: CognitiveParams, rng: RandomStream, t: SimTime)
  : { intention: Intention; trace: DecisionTrace; next: MemoryState }
```

`MindView` is a read-only view of the mind's own beliefs, needs and parameters (never the world). `π` is pure given
its arguments and the stream state, so a run is replayable. `Domain` is defined in §9 (Rex's four extraverted
domains plus body, people, strategy, none); the null model ignores it.

**Cognitive parameters θ** (individual, not personality; the benchmark varies these): decision temperature `β`,
loss aversion `λ`, discount `γ`, belief inertia `η`, prior strength `α0`, memory decay `d`, retrieval threshold
`τ` and noise `s`, commitment `κ`, perception criterion `k`. Each has a researched default where one exists (`d`,
`s`, `λ`, `n`, `m`) and a proposed default otherwise; ranges are recorded with their sources by the unit that
implements the parameter.

## 4. State, reducer, events (proposed)

A population of minds is one reducer state (`MindsState`: minds by id in mint order, counters, the stream state),
reduced by commands `observe`, `decide`, `outcome`, `tickNeeds`, `addMind`, with the kernel `Runner` (log,
events, replay). Ids from kernel `mint`: `mind.0001`, `bel.0001`, `ep.0001`, `int.0001`. Events emitted:
`cognition.intention`, `cognition.attribution`. Events consumed: the host's outcome events (with `cause`), the
host's stimuli and need signals for the epoch.

## 5. Quantities and registry rows (proposed to the registry keeper)

Planned rows, owning engine `cognition`, domain C, scope universal:

| Row | Evidence | Writes (quantity ids, proposed scope `mind.`) | Reads |
|---|---|---|---|
| `cognition.attention.allocate` | 2 form / 4 mapping | `mind.attention_share` (1) | stimuli (host), `mind.need_priority` |
| `cognition.perception.detect` | 2 (SDT) / 4 | `mind.observation` (record) | `body.detectability` (stub → Reality P2), `mind.attention_share` |
| `cognition.belief.update` | 4 (conservatism 2) | `mind.belief` (record) | `mind.observation`, `mind.testimony` (a host input until `cognition.communication.language` exists) |
| `cognition.memory.episodic` | 2 (forgetting) / 4 | `mind.episode` (record), `mind.retrieval_p` (1) | outcomes, `mind.prediction_error` |
| `cognition.needs.drive` | 4 | `mind.need_deficit` (1), `mind.drive` (1), `mind.need_priority` (1) | `body.hunger_signal` (stub → nutrition), `body.pain`, `mind.belief` (safety) |
| `cognition.goals.objectives` | 4 | `mind.goal_progress` (1) | host goals, outcomes |
| `cognition.decision.generate` | 4 | `mind.candidates` (record) | repertoire (host data), `mind.belief`, `body.capacity_functional` (stub → Reality) |
| `cognition.decision.evaluate` | 4 (λ 2) | `mind.expected_utility` (1) | `mind.belief`, `mind.episode`, `mind.drive` |
| `cognition.decision.select` | 2 (Luce) / 5 (commitment) | `mind.intention` (record) | `mind.expected_utility` |
| `cognition.learning.outcome` | 4 | `mind.prediction_error` (1) | outcome events |
| `cognition.learning.attribution` | 5 | `mind.attribution` (record) | `mind.belief` before and after |
| `cognition.personality.slot` | n/a (structural; null model) | none (modulates the four hooks) | `mind.*` views |
| `cognition.personality.eight_function` | 5 (Rex's theory as hypothesis) | none | planned, second layer (§9) |

Later P7 rows, not in this baseline (planned, named so nobody else builds them): `cognition.skill.practice` (power
law of practice and decay: the universal STATS skill, rust and talent), `cognition.emotion.appraisal`,
`cognition.communication.language`, `cognition.relationship.trust`, `cognition.planning.lookahead`.

**Conversational plausibility, organic flow (Rex, 2026-10-31; proposed, not built).** Rex's direction (ENGINES.md,
"Conversational plausibility, organic flow"), part of the planned communication subsystem
(`cognition.communication.*`). Recorded only; designed when the controller releases it.
- **A reply answers why this is being said, why now and how it fits between us, never a keyword (Rex).** Saying
  "buried treasure" to a stranger unlocks nothing: they may ask "what?", assume a pitch, grow suspicious, laugh or
  wait for an explanation. Coherence earns no trust by itself.
- **Conversation state, beside personality (Rex):** one record per mind and partner with six parts: shared context,
  which is **what this mind believes is shared** (Rex, 2026-10-31): a per-mind belief (§2.3), never one record both
  parties hold, so one may think an introduction explained everything while the other still has no idea why they are
  approached, and the mismatch yields confusion without a script (what was just said, whether the remark has an
  understandable link); perceived intention (help,
  flirting, threat, joke, fishing, time-wasting), read through beliefs (§2.3) and possibly wrong; willingness to
  engage (want of company, somewhere to be, safety, interest); relationship and boundaries (what may be asked of
  this person, how much explanation they expect, how readily they forgive awkwardness); current emotional and bodily
  state (loneliness, embarrassment, irritation, fatigue, fear, urgency, distraction; the bodily part read from
  Reality's ports, §8); conversational history (interruptions, ignored answers, unexplained topic changes, shown
  listening, repairs).
- **Tolerance is a derived assessment (C-Q12 decided (Rex, 2026-10-31)):** "willingness to put up with bullshit"
  is **never a need record** under `M_i` (§2.2) and **never an independently draining patience bar**. Its causes
  stay separate records: social need (the current want of connection, the social-connection need's drive, §2.2);
  available attention (effort that can be spent, §2.1); relationship and expectations (trust and whether the
  exchange is expected to be worthwhile: beliefs, §2.3, and expected utility, §2.4); interaction history
  (confusion, irritation, interest, successful repairs: episodes, §2.3). From them the mind derives, when it
  evaluates its next turn, whether another turn feels worth attempting; the assessment may be cached for
  efficiency, never updated on its own. The same confusing remark may exhaust a busy stranger, intrigue a
  researcher and delight a close friend.
- **The next utterance is a choice (Rex):** answer, ask for clarification, interpret, redirect, challenge or leave,
  evaluated and selected through the existing `cognition.decision.select` (§2.4), never a scripted reply.
- **Emergent, never scripted (Rex):** awkwardness arises when expectations do not line up; lingering when someone
  still wants contact but has no confident next move (hesitating, repeating, a weak follow-up, staying after the
  other has begun closing). An urgent warning may interrupt anything; an unrelated remark may work between close
  friends; a clumsy person may still be welcomed.
- **Dispositions influence, the label describes (Rex, corrected 2026-10-31):** dispositions act through the four
  hooks (§9), never as a decision; the personality label describes the resulting pattern (§14.1). Openness is not
  willingness to talk to a stranger; a reserved person may want company tonight; a lonely one may tolerate a clumsy
  approach or read it as rejection.
- **Big Five is a measurement, never a driver (Rex):** derived traits are measured from the emergent conversational
  behaviour and compared with McCrae & Costa 1989 in T-2 (§9 "Tests of the layer").
- **Quantities, proposed to the registry (planned):** `mind.conversation_state` (record, the six parts above, per
  partner), `mind.conversation_tolerance` (1, 0–1, **derived** from the causes above, cacheable, no writer of its
  own), `mind.believed_shared_context` (record, per mind and partner, a belief), `mind.engagement_willingness`
  (1, 0–1). Registered 2026-10-31 (planned) with the writer row
  `cognition.communication.conversation_state` (reads testimony, credibility, drive, episodes and beliefs;
  consumers `cognition.decision.generate` and `cognition.decision.select`); `cognition.communication.comprehend`
  keeps one job, writing `mind.testimony`. **Verification state: planned; nothing is implemented.** These entries
  record the proposed design; no commit yet demonstrates the behaviour (Rex, 2026-10-31).

DUP-46 (personality, ownership-gap): these rows are the universal home; the pirate charts and STATS sliders stay
pirate (CTRL-7). `realism.nutrition.hunger_fullness`: Cognition reads it, never writes it; if Reality's row
includes "appetite as felt priority", the boundary is the deficit signal (Reality) vs the drive and priority
(Cognition) (to agree with Reality, §12).

## 6. The first benchmark: the hungry pair (Rex's scenario; the fixture world proposed)

**(Rex)** Two hungry individuals, food nearby, its owner stronger than either. Actions: ask, trade, work, steal,
deceive, fight, leave. Identical knowledge, needs, capabilities and opportunities; vary only cognitive parameters;
controlled comparisons across identical seeds through the Kernel's replay. The pass: agents select actions,
experience consequences, update beliefs and change later decisions, with no scripted outcome.

**The fixture world (proposed; `bench/hungry-pair/`, a test fixture, never an engine mechanism).** The world rules
below stand in for engines that do not exist yet; each is labelled **fixture**, each has a named future owner, and
none is a rule of the platform. They are open for Rex as a set (C-Q1).

- **Minds:** A and B (hungry: hunger deficit starts 0.6, identical priors, identical repertoire, identical
  capacity); O, the owner, is **also a mind** of the same engine (fed, deficit 0.1; goal "keep the stock", a value
  per unit held; social need like everyone). The owner's answers to ask, trade, work and promises are therefore its
  own decisions, not scripted responses.
- **Food:** a stock of `F = 6` units at O's stall (fixture). Eating one unit lowers hunger deficit by `u = 0.25`;
  hunger rises by `Δ/T_h` per epoch, `T_h` = 1 day (fixture standing in for nutrition, P3).
- **ask:** A asks O; O chooses give one unit / refuse.
- **trade:** A and B each hold one tradeable item of equal value; A offers it; O chooses accept / refuse.
- **work:** A offers labour; if O accepts, A works 3 epochs, then O chooses pay one unit / renege.
- **deceive:** A promises later labour for food now (testimony O weighs by its belief in A's reliability); if O
  gives, A then chooses to keep or break the promise (its own later decision); a broken promise is an outcome O
  observes.
- **steal:** succeeds unless O detects it; O's detection is O's perception (§2.1) with `d'` (fixture) scaled by O's
  attention to its stock; if detected, O chooses its response (confront and fight, chase off, let go) and remembers.
- **fight:** contest by a Bradley–Terry rule on capacity, `P(A wins) = s_A^k / (s_A^k + s_O^k)`, `s_O / s_A = 1.5`,
  `k = 2` (fixture, standing in for the P2 two-fighters demonstration); the loser's capacity drops by 0.3 for
  2 days and pain rises (stand-in for Reality's injury); the winner takes one unit.
- **leave:** the agent walks to a distant source: 6 epochs away, finds one unit with probability 0.5 (fixture).
- **Naive models** each mind uses (the same forms on its **beliefs**, not on the truth): P(O gives) from its belief
  about O's generosity; P(win) from believed strengths by the same Bradley–Terry form; P(detected) from its belief
  about O's vigilance; P(promise accepted) from its belief about O's trust in it.
- **Run:** epoch `Δ` = 10 minutes, 144 epochs (one day; fixture), seeds 1…N; every run records its seed, writes its
  trace (decisions, outcomes, belief deltas, attributions) and replays from its initial snapshot.

**Acceptance tests (proposed).** Verification of the mathematics (the engine does what §2 states) and of Rex's
pass criterion; none expects a particular behaviour:

| Id | Test |
|---|---|
| CB-1 determinism and replay | the same seed and parameters give a byte-identical canonical trace; restoring the initial snapshot and replaying the kernel input log reproduces it; a different seed changes only state downstream of a stream |
| CB-2 selection | every committed intention has a decision trace with ≥ 2 evaluated candidates, `Σ P(a) = 1`, and the chosen action drawn from that distribution |
| CB-3 consequences | every intention gets exactly one outcome event whose `cause` is its id, and the outcome changes at least one need or one belief; a receipt censored by the run's horizon (unfinished at the end) needs only its causal link (keeper ruling, COG-10) |
| CB-4 belief update | after each informative outcome the belief it bears on moves (KL > 0) in the direction its likelihood implies (verification) |
| CB-5 later decisions change | (a) when `δ < 0` for action `a`, `EU(a)` in the same context is lower at the next evaluation, all cases; (b) with common random numbers, runs with learning on vs frozen (`η = 0`, no encoding) diverge after the first informative outcome in a stated share of seeds, reported |
| CB-6 no script | (a) A and B with identical parameters have statistically indistinguishable action distributions over 500 seeds (χ², p > 0.01), and swapping their ids, each mind keeping its own stream (stream keys travel with the mind), swaps their traces exactly, which tests that no code reads the id label (keeper ruling, COG-12); (b) the fixture and the engine contain no branch on an agent id or parameter value that picks an action or an outcome (a Haiku check unit reads the code; it is certified by that unit's CHECK.md, not by the bench report, whose CB-6 verdict covers (a) and (c); keeper ruling, COG-18); (c) across seeds the default-parameter runs show more than one action sequence |
| CB-7 controlled comparisons | for each θ dimension, paired runs differing only in it over 200 seeds with common random numbers, reported as action frequencies and outcomes with 95 % intervals; direction checks the mathematics implies: higher `λ` → in a fixed context, each candidate's EU falls by `(λ'−λ)` times its discounted expected loss, and the probability of the candidate with the largest expected-loss share falls (the formula's actual consequence, asserted at the evaluation level); the population fight + steal frequency is reported, not asserted (keeper ruling, COG-19: the earlier population claim was my over-reach, since λ scales every candidate's losses; unit 2700 measured −.0025 [−.0074, +.0024]); higher `β` → lower choice entropy; higher `κ` → fewer intention switches; higher `d` → a smaller effect of an early loss on late choices |
| P7-3 swap | swapping the null personality for a test model that only changes `pertinence` changes the traces, with no file outside `cognition/` touched |

CB-7's directions are consequences of the formulas (verification), **not validation**: no independent data says how
real hungry people choose in this scene. That is stated in the report (§10).

## 7. What Cognition consumes from the Kernel (to agree with the Kernel keeper)

| Kernel service | Use |
|---|---|
| `SimTime`, `MINUTE` etc. | epoch period `Δ` (host parameter; benchmark 10 min); memory activation in seconds |
| `Scheduler`, `Process` | one process `cognition.tick` per population, phase `cognition`. **Agreed with the Kernel keeper (2026-10-30, kernel unit 2660):** the default order becomes `fast, cognition, host, day.settlement, day.economy, aggregate`: `cognition` after physiology at the same instant, `host` the phase where a host resolves intentions (named `host`, not `resolution`, to avoid confusion with kernel DESIGN §9) |
| `EventBus` | emits `cognition.intention` / `cognition.attribution`; reads the host's outcome events by cursor; **causality**: an outcome's `cause` is the intention event id, which is how learning finds what it is learning about |
| `streams` | `cognition.perception.detect`, `cognition.memory.retrieve`, `cognition.decision.select`. **Agreed (kernel unit 2660):** `streams(runSeed).get(mechanismId, entityId)`, seeded `mix32(mix32(runSeed, fnv1a32(mechanismId)), fnv1a32(entityId))`, so a mind's draws are independent of how many minds exist and of call order; snapshot key `<mechanism id>@<entity id>`; `kernel.json` lists mechanism ids only. Call `get('cognition.decision.select', 'cognition/mind.0002')` |
| `mint`, `qualify` | `mind.`, `bel.`, `ep.`, `int.` ids; `cognition/mind.0001` at the boundary |
| `Runner`, `take`/`restore`, `canonical` | the reducer, replay from the initial snapshot, byte-identical comparison |
| `ports`, `kernel.json` | declared inputs (`body.hunger_signal`, `body.pain`, `body.capacity_functional`, `body.detectability`) and outputs (§5) |
| `transaction` | not needed in the baseline (Cognition never writes another engine's state) |

## 8. What Cognition consumes from Reality (to agree with the Reality & Species keeper)

| Input | Unit | Today | Contract proposed |
|---|---|---|---|
| detectability `d'` per observer and cue (sight, sound): `body.detectability` | 1 | none (P2) | **agreed (Reality, registry; renamed from `percept.detectability`, alias recorded):** a host stub until P2 optics and acoustics write it per observer, cue and channel; Reality = signal at the observer, Cognition = attention, criterion, identification, belief. **d' already includes the observer's eyesight and hearing (DUP-37, the capacity combination): perception never applies a sensory-capacity factor again** |
| hunger signal | 1 (0–1) | `realism.nutrition.hunger_fullness` documented-only | **agreed:** Reality writes `body.hunger_signal` (fullness and hunger stay Reality's signals, built later from gut and energy state); Cognition reads it as the deficit and writes only the felt drive and priority, which never feed back a second physiological effect. Thirst, cold and pain (`body.pain`, written by `realism.medicine.pain`) by the same pattern; for sleep, the **single** sleep-pressure quantity DUP-12 settles on (proposed: neurology's adenosine pressure), never `body.sleep_debt` as well. **Settled by Rex 2026-10-30 (DUP-49):** the nutrition library's `appetite` and `eating-rule` rows become restatements citing Cognition |
| satiety signal | 1 (0–1) | registered 2026-10-30 (planned), writer `realism.nutrition.hunger_fullness` (documented-only) | **agreed (DUP-49):** Reality writes `body.satiety_signal`; Cognition reads it as part of the hunger need's deficit; added to `kernel.json` ports when Reality builds the writer |
| taste percept | 1 (0–1) per taste category (`indexed_by` taste category) | registered 2026-10-30 (planned), writer `realism.perception.taste` (planned, not built) | **agreed (DUP-49):** Reality writes `body.taste_percept` (the sensory half of palatability); Cognition's preferences evaluate it (the evaluative half); until the writer exists the percept is **absent**, never given a default; added to `kernel.json` ports when Reality builds the writer |
| functional capacity | 1 (0–1 per action class) | DUP-15, planned | Reality writes `body.capacity_functional`; generation reads it; Cognition never computes strength |
| mood and arousal bias | 1 | `realism.neurology.circuits` writes `body.circuit_outputs` | **not read in the baseline**; when read, as a modulation of `β`, `λ` or pertinence that Reality's row defines, never a second mood model |
| transmitter levels | by transmitter row | planned (Reality neurology, 2026-10-31) | **agreed (planned, §16):** Reality writes `body.transmitter_levels`, indexed by its neurology transmitter rows (gaba, glutamate, serotonin, noradrenaline, opioid, …); Cognition reads it at §16.1 stage 4 as an interoceptive stimulus (§2.1), never as a mood number; **absent, no default, until Reality's researched units land** |
| hormone levels | by hormone id | planned (Reality neurology, 2026-10-31) | **agreed (planned, §16):** Reality writes `body.hormone_levels`, indexed by hormone id (cortisol, adrenaline, oxytocin, …); each hormone exists only with a researched row giving its cited effect and kinetics; read at stage 4 like the transmitters; **absent, no default, until those units land** |

**Outputs to Reality (planned, 2026-10-31; §16):** `mind.appraisal` (record: the interpretation a mind forms of an
event, §16.1 stage 2; writer the reserved row `cognition.emotion.appraisal`, registered planned) and
`mind.recalled_body_state` (record: the body state stored with an episode, re-emitted on retrieval, §16.1; writer
`cognition.memory.retrieval`, planned). Both are ports on Reality's neurology. Which appraisal moves which substance,
and by how much, comes from sources: Reality's post-P1 research units, one per substance family. Neither is in
`kernel.json` until built.

Until Reality writes these, the benchmark fixture supplies them, labelled fixture.

## 9. The second layer: personality (Rex's theory; crude formulas written now, switched on after the baseline)

**(Rex)** The eight-function model is the intended personality architecture: the underlying cognitive structure
changes how experience is processed (attention allocation, interpretation, strategy generation, learning), while
experience, knowledge and circumstances shape observable behaviour. It never assigns predetermined behaviours to
types.

**(Rex, 2026-10-30) The framing.** The eight functions are the lower layer of abstraction: primitives, "like
binary code". The Big Five and neuroscience are higher-level descriptions of outcomes. The strongest demonstration
Rex accepts follows from this: the function model should **derive** higher-level traits (openness,
conscientiousness, risk-taking, social behaviour) from its mechanisms rather than define them. That is test T-2
below.

**(Rex, 2026-10-30) How the layer is built.**
1. **Crude formulas now, only from what is written.** Each statement in the codex (`FUNCTIONS.md`, `THEORY.md`)
   becomes a formula marked `crude`, with the exact file and section beside it, so every formula traces to Rex's
   line. Constants the text does not give are marked "crude constant, not in source".
2. **Gaps stay off, never guessed.** Fi, Fe, Ti and the eight stack positions have no core codex entries yet.
   Their hooks exist and do nothing until Rex writes them (FUNCTIONS.md rule 4: a gap is a gap).
3. **Codex edits flag the formulas they touch.** The fingerprint check is described below.
4. **Every version is kept.** Formula sets are versioned (`v1`, `v2`, …) and never edited once frozen. Old and new
   run side by side under the same seeds, so a change to the theory shows its effect on behaviour. That comparison
   is also a test of the theory.
5. **Order (C-Q4, kept).** The crude formulas are written now but switch on only after the baseline passes CB-1 to
   CB-7. Odd behaviour is then attributable either to the baseline or to the theory, never to both.

**Source.** The source is Rex's personality-matrix project, `Writing/Cognitive Function Diagnostic/personality
matrix/`. It is read, never edited. Part A of FUNCTIONS.md (the day-cycle and weather auras) gives no formula,
because its own text says the auras "describe aura, not mechanism". THEORY.md §1–§5 (face as phenotype) gives
none either: that is appearance, not cognition. Only THEORY.md §1's focus line feeds attention (F6).

### The hooks (refining §3)

```ts
interface PersonalityModel {
  id: string; version: string
  pertinence(base: Record<string, number>, ctx: MindView): Record<string, number>          // attention
  interpret(base: InterpretParams, domain: Domain, ctx: MindView): InterpretParams         // η, α0, λ, confidence, Weber w, testimony floor
  generate(candidates: readonly Candidate[], base: GenerateParams, ctx: MindView): { candidates: readonly Candidate[]; params: GenerateParams } // κ, recombinations, other-mind model
  learning(base: LearningParams, domain: Domain, ctx: MindView): LearningParams            // learning rate, memory decay d, belief half-life
}
type Domain = 'space' | 'adaptation' | 'meta' | 'cohesion' | 'body' | 'people' | 'strategy' | 'none'
```

Actions, cues and latents carry domain tags as host data. Rex's four extraverted domains come from "Ecosystems":
space (Se/Si), adaptation (Ne/Ni), meta (Te/Ti) and cohesion (Fe/Fi). `nullPersonality` is identity on every hook.

### The stack and the weights (crude)

A configuration is an ordered stack of the four functions of a type. The stacks per type come from THEORY.md §3a
and §3d, e.g. ENFJ = Fe Ni Se Ti. A function in position `i` = 1…4 has weight

```
ω_f = (5 − i) / 4        (1, 0.75, 0.5, 0.25);   ω_f = 0 for a function not in positions 1–4
```

The source is FUNCTIONS.md "The advantage–hypocrisy cycle", **Stack position and confidence**: "the lower it sits
in the stack, the less confident the user is". Only the order is sourced; the linear form is a crude constant.
Positions 5–8 (Oppositional … Devil) are **off**: FUNCTIONS.md "Not yet written".

The attitude tilt is

```
Δ = ρ_E − ρ_I        ρ_E = Σ_{f extraverted} ω_f / Σ ω_f,    ρ_I = 1 − ρ_E
```

It counts all four positions, because FUNCTIONS.md "Attitudes" is stated "for all eight functions". With the
standard alternating stack, Δ = +0.2 for an extraverted dominant and −0.2 for an introverted one.

### v1 formulas (all `crude`; each cites FUNCTIONS.md unless marked THEORY.md)

| Id | Statement (section) | Hook | Formula |
|---|---|---|---|
| F1 | Attitudes: **Direction of data**, **The ratio**, **Never pure** [CARLOS] | interpret | `η_obs' = clamp(η·(1 + Δ), η_min, 1)`; `α0' = α0·(1 − Δ)`. External data weighs more for an extraverted tilt, internal theory more for an introverted one. Both channels are always present, because \|Δ\| < 1 |
| F2 | Attitudes: **Mastery and scope** [CARLOS] | pertinence | `π_j' = π_j^(1 − Δ)`, renormalised. An extraverted tilt flattens attention (wide, "scattered"); an introverted tilt sharpens it ("focused") |
| F3 | Attitudes: **Failure and resilience** [CARLOS] | interpret | `λ' = λ·(1 − Δ)·(1 − max(Δ,0)·n_fail/(n_fail + N½))`. `N½ = 10` is a crude constant, not in the source. Extraverts fail more, get used to it and become resilient; introverts fear failure more. Isolation is not a formula: it should emerge from the higher λ on social failures |
| F4 | **Systems vs people**: the shared mechanism, "what it learns from a loss" [CARLOS] | learning, pertinence | For domain `d` of extraverted function X (Te → meta, Ne → adaptation, Se → space): `lr_d' = lr·(1 + ω_X)`, and cues tagged `d` get `π' = π·(1 + ω_X)` ("first to key into it … most aggressive and effective"). Fe → cohesion is **off** |
| F5 | **Refinement: the introverted form outpaces all** [CARLOS] | learning | For domain `d` of introverted function Y (Si → space, Ni → adaptation): `lr_d' = lr_d'·(1 + r·ω_Y)`, `r = 1.5`, a crude constant chosen so Y outpaces X at equal weight. Ti → meta and Fi → cohesion are **off**. The timing claim is [DERIVED] and not encoded |
| F6 | **Se**: Domain, Time frame, Precision, Limit [CARLOS]; THEORY.md §1, focus "sensation → Se" | pertinence, interpret | Cues tagged physical and present: `π' = π·(1 + ω_Se)`. Weber fraction on the **targeted** entity only: `w' = w·(1 − ω_Se/2)`; precision around the target is unchanged. Present observations of people: `η' = η + ω_Se·(1 − η)/2` ("judgments revised continually by the current moment") |
| F7 | **Stack position and confidence** [CARLOS] | interpret | Believed own success probability for actions tagged `d`: `P' = P·(0.5 + ω_d/2)`, with `ω_d` the larger weight of the on functions owning `d`. No change if both of the domain's functions are off. "More likely to avoid" is not a formula: it should emerge from the lower EU |
| F8 | **Si**: Mechanism, Accumulation, Time frame [CARLOS] | learning | Episodes tagged body, or about a specific person: `d' = d·(1 − ω_Si/2)` (retained longer). Belief half-life for person attributes: `h_b' = h_b·(1 + ω_Si)` ("fleshes out the organism"). B1, whether the weakness emphasis is central, is open, so that emphasis is **off** |
| F9 | **Ne**: Mechanism [CARLOS] | generate | Add up to `k = round(ω_Ne·K)` two-step compounds (a then b), where a's believed outcome satisfies a precondition of b. `K = 3` is a crude constant. These are candidates only; B2, whether Ne acts or only predicts, is open, and an answer of "only predicts" would turn F9 into a prediction-only use |
| F10 | **Ni**: Mechanism [CARLOS]; "Extraverted vs introverted perception" [DERIVED] | generate | For outcomes that depend on another mind's choice: `P_theory = (1 − ω_Ni)·P_belief + ω_Ni·P_selfsim`. `P_selfsim` runs the mind's own policy in the other's believed situation ("how would I strategize in their position") |
| F11 | **Ne and Ni — fate** [CARLOS] | generate | Commitment `κ' = κ·(1 + ω_Ni − ω_Ne)`, floored at 0 ("Ni is fate. Ne holds back fate") |
| F12 | **Interaction: Se with Ni** [CARLOS] | interpret | For beliefs about a person: `α0_person' = α0·(1 + ω_Ni)` (a settled idea of who someone is). F6's η raise still applies to present evidence, so the in-the-moment read usually wins. The grudge exception is **off** until B3 (grudge or grip) is answered |
| F13 | **Te**: "accepts all data as good data" (INTJ notes, quoted there) [CARLOS] | interpret | Testimony reliability `r' = r + ω_Te·(1 − r)/2`. "More examples, quicker meaning" is covered by F4's meta learning rate. Te with inferior Fi, and lead-Fi contrasts, are **off** (Fi) |

**Off in v1, with the reason** (each hook is present and acts as identity):
- **Fe, Fi, Ti core functions.** No core definition yet ("Not yet written"). The partial statements that exist
  (Fe's row in the systems table; Ti and Fi in the refinement table) are held until Rex writes the core entries.
- **Positions 5–8.** Not written.
- **The coping exception.** Its "up to roughly 50/50" needs a coping state the codex does not define.
- **The advantage–hypocrisy cycle.** It would need communication (`cognition.communication.language`, reserved),
  and as written it describes moves, so encoding it would risk prescribing behaviour. Held for Rex.
- **Ecosystems (four domains compete).** That is a Society-level claim (P6), not a mind formula. Cognition supplies
  only the learning speeds it would rest on.

**Data and versions.** v1 lives in `personality/eight-function/v1/`:
- `formulas.json` holds, per id: the citation (file, exact section heading, tag), status (`crude` / `off`), hook,
  form, and constants, each marked sourced or crude.
- `src/personality/eight-function/v1.ts` implements it.
- A frozen version is never edited. A rederivation writes `v2` beside it.
- `bench/personality-versions.ts` runs the null model and every version under the same seeds and reports the
  differences.

**The codex fingerprint check (proposed).**
- `personality/fingerprints.json` stores a SHA-256 of each cited section: the text from its heading to the next
  heading of the same or higher level, with line endings normalised.
- `scripts/codex-fingerprint.ts --check` recomputes the hashes from the matrix files (read only).
- If a cited section changed or vanished, it lists every formula built on it as **stale** and, with `--emit-task`,
  writes one WORK file `NNNN-cognition-rederive-<version>-<ids>.md` into the cognition lane. The number comes from
  `next_number.py`, and no duplicate is written while one for the same ids is queued.
- The rederive unit writes the next version, keeps the old one, and records the new fingerprints. The new version
  becomes the default only after the keeper reviews it and the side-by-side report.
- The Cognition keeper runs the check at the start of every turn. A Haiku unit checks the script on a fixture copy
  of the matrix.

### Dynamic function allocation: the light and the crystal (Rex, 2026-10-30; proposed, not built)

Rex's direction (ENGINES.md, "Dynamic function allocation, the light and the crystal"). Nothing here changes v1,
which stays frozen; this is the shape of a later version, built only after the baseline is stable and the
controller releases it.

- **The type hierarchy is a baseline, never a fixed allocation per decision (Rex).** An ESTP generally favours Se,
  but Ti, Fe or Ni can be the primary influence on a given decision through situation, experience and motivation.
  The variation emerges from the mathematics, never from hardcoded exceptions.
- **Active influence, proposed (provisional, level 5):**
  `A_f(t) = B_f·R_f(t)·L_f(t)·M_f(t) / Σ_j B_j·R_j(t)·L_j(t)·M_j(t)`, with `B_f` the baseline preference
  (**the light**), `R_f` the function's relevance to the situation, `L_f` learned competence and habit (part of
  **the crystal**), `M_f` motivational and emotional modulation. A softmax over function scores is preferred in
  implementation (Rex).
- **Experience changes the activation conditions (the crystal; Rex).** Repeated consequences raise how strongly a
  situation activates a function (a painful record of appearance-led partner choices raises future-oriented
  evaluation in later partner choices). **Misattribution is allowed**: the lesson learned can be the wrong one (an
  aversion to a feature instead of a lesson about compatibility), through the attribution step of §2.5. One
  baseline therefore gives different trajectories.
- **Attention allocation ≠ evaluation influence (Rex).** A function can receive most of the processing without
  deciding the action. Proposed: two allocations, one weighting the `pertinence` hook (attention) and one weighting
  `interpret` and `generate` (evaluation), each of the form above.
- **Where it attaches (proposed):** the same four v1 hooks (`pertinence`, `interpret`, `generate`, `learning`);
  `A_f(t)` would replace v1's fixed stack-position weights as the weight on each function's hook contribution, and
  `learning` would update `L_f`. Personality still never touches needs.
- **Registry rows (planned, registered 2026-10-30):** mechanisms `cognition.personality.function_allocation` and
  `cognition.personality.function_sensitivity` (evidence level 5); quantity `mind.function_allocation`.
- **A dominant function has a statistical tendency toward more allocation; an inferior function is never prevented
  from leading a decision (Rex).** Rex's statement of this point was cut off mid-sentence; the rest is **open**
  (C-Q11). Nothing is completed or inferred here.

### Tests of the layer (after the baseline passes; level-5 hypothesis tests, a negative result is a result)

- **T-1 Stable differences across situations.** Run each configuration through `S` scenarios: the hungry pair, plus
  scenarios that reward each of the four extraverted domains, × many seeds. The claim passes if
  between-configuration variance exceeds within-configuration variance across scenarios (intraclass correlation,
  with a stated threshold) **and** beats two controls: the null model with randomly drawn θ, and a shuffled-hook
  model with the same number of free parameters. The effect must show as **speed and effectiveness of learning in
  a domain** ("Systems vs people"), not as a fixed action preference.
- **T-2 Derived traits (Rex's strongest demonstration).** From behaviour alone, compute trait indicators: openness
  (rate of novel or compound actions), conscientiousness (intentions completed, commitment kept), risk-taking
  (choices under outcome variance), social behaviour (rate of ask, trade and testimony). No trait is defined in the
  model. Compare the indicators across the 16 configurations with the published correlations between MBTI
  preferences and the Big Five (McCrae & Costa 1989: E–I with Extraversion, S–N with Openness, J–P with
  Conscientiousness, T–F with Agreeableness). Validation data: that study, as independent evidence. Tolerance: the
  sign of each published correlation reproduced, magnitudes reported. This is the one place the personality layer
  has external data.
- **T-3 Version comparison.** Every new version is run against the previous one and the null model under the same
  seeds; the report states which behaviours moved and which formulas caused the movement.

**C-Q3, "light and crystal" (Rex, 2026-10-30).** It is not written down anywhere yet. It stays open until Rex writes
it into the matrix, and it is never invented here.

## 10. Verification and validation (PLATFORM §11a)

Three states, never conflated: implemented ≠ integrated ≠ validated. For each mechanism the unit that builds it
supplies sources and model (above), verification tests (each formula as stated, boundary cases: `a_c = 0`,
`d' = 0`, `η = 1` equals Bayes exactly, `κ = 0` never sticks, `β → ∞` argmax, `β = 0` uniform), stability (no NaN
for zero counts, probabilities stay in [0, 1] and normalised, activation of an episode encoded at `t` is finite at
`t + 1 ms`), and integration tests with every mechanism it reads or feeds.

| Id | Validation against independent data | Data | Tolerance (proposed) |
|---|---|---|---|
| V1 forgetting | retention as a function of delay from the memory mechanism alone | Rubin & Wenzel 1996 (210 retention data sets, 105 functions); Wixted & Ebbesen 1991; Ebbinghaus 1885 savings | the simulated retention curve is fit by the power function at least as well as the median power-function R² Rubin & Wenzel report; the fitted exponent is compared with published power exponents for comparable materials (Wixted & Ebbesen 1991) when fetched, otherwise reported, not asserted (keeper ruling, COG-14: Rubin & Wenzel give no exponent range) |
| V2 learning and choice | repeated decisions from experience with feedback, the engine's evaluation + selection + memory on the published problems | Technion Prediction Tournament (Erev et al. 2010), the competing model IBL (Gonzalez & Dutt 2011) | mean squared deviation of the risky-choice rate no worse than the published IBL baseline × 1.5 (open: data access, C-Q7) |
| V3 detection | ROC of the perception mechanism | Green & Swets 1966 (the equal-variance model's ROC shape) | exact: verification, not validation |
| V4 loss aversion | the evaluation on mixed gambles | Tversky & Kahneman 1992 acceptance data | acceptance boundary at the configured λ (verification); validation pending |
| V5 the benchmark | **no independent data exist** for this scene; the honest result is explicit uncertainty. The experiment that would test it: a laboratory scarcity game with a stronger owner (dictator / ultimatum and theft-option designs in experimental economics) | none in hand | reported, never claimed |

The registry keeper re-audits; a Haiku check unit that did not write the code checks the fence and the tests
(PLATFORM §11a's independence qualification).

## 11. What the pirate repo holds that is Cognition's (AUDIT §2 row C, §3b; nothing moves now)

| Pirate item | Becomes | Stays pirate |
|---|---|---|
| STATS cognitive attributes (Wits, Memory, Perception, Pattern Recognition, Intuition, Spatial Reasoning, Nerve) | Cognition parameters and capacities (e.g. Memory ↔ `d`, `τ`; Perception ↔ `k`, attention capacity), read by a pirate adapter | the 1–20 scale and its gameplay meaning |
| PSYCHOLOGY.md pushes (stress, fear, morale as inputs) | Cognition's needs and, later, `cognition.emotion.appraisal` | the meters |
| Detection by sight and sound (COMBAT §6) | Reality's signal + Cognition's detection (§2.1, §8) | combat's encounter rules |
| 16 MBTI response charts, alignment square, sliders | — | all of it (CTRL-7); a future pirate adapter may read the eight-function layer's outputs |

Re-seating is the PL track's (pirate keepers), after this baseline passes.

## 12. Open items

| Id | Item | Whose |
|---|---|---|
| C-Q1 | The hungry-pair fixture world (§6): owner as a mind, the stub rules and their numbers, labelled fixture | Rex (approve as a test fixture) |
| C-Q2 | The cognitive parameters varied (§3 θ) and that needs weights are *not* varied (Rex: identical needs) | Rex |
| C-Q3 | "Light and crystal" | **(Rex, 2026-10-30)** named in ENGINES.md ("Dynamic function allocation, the light and the crystal"): the light = the baseline hierarchy B_f, the crystal = learned activation conditions (§9, proposed, not built); still to be written into the personality matrix before any formula cites it; never invented |
| C-Q11 | The end of Rex's "an inferior function is never prevented from leading a decision" point (his paste was cut off mid-sentence) | open (Rex) |
| C-Q12 | Conversational plausibility (§5): whether the tolerance budget is a need record under M_i (§2.2) or a separate conversation state | **(Rex, 2026-10-31)** decided: a derived assessment from separate causes, never a need or a draining bar; shared context is a per-mind belief (§5) |
| C-Q13 | Which memory parameters Reality's neurology constrains (§14.1) | open (Rex, with the Reality keeper) |
| C-Q14 | The gaze interpretation hypothesis set and its calibration sources (§14.2) | open (Rex) |
| C-Q15 | Which reasoning-process parameters a substance may move, and each substance's sourced model (§14.5) | open (Rex, with the Reality keeper) |
| C-Q16 | §16.2 memory profiles for Se, Ne and Te (how each stores, what triggers recall, articulation) | open (Rex) |
| C-Q17 | §16.4 the episode detail vector and the cue-type retrieval weights, and their sources | open (keeper proposal; Rex and the personality matrix) |
| C-Q18 | §18 reconstruction vs selection in Fe users | **(Rex, 2026-10-31, amended)** both: selection in a recognised bubble, reconstruction when no meaning fits or one is supplied (also within a conversation); selection success follows the similarity of the current bubble to the exposure history, not width alone |
| C-Q19 | §18 semantic profiles for Se, Si, Ne and Ni, and Fi's "what it notices" | **(Rex, 2026-10-31)** Se/Si/Ne/Ni roles accepted provisionally as pool feeders (§18.2), never an exclusive boundary: judging functions bias attention upstream (§16). Still open: whether Ne/Ni actively resolve meaning; Fi's "what it notices" |
| C-Q20 | §19 sources and ranges for k_f, C_f,0 and the form of R_f (learning-opportunity availability and relevance) | open (Rex; versioned, crude until sourced) |
| C-Q21 | §19 how developed competence C_f enters the L_f term of §9's allocation, and whether function experience E_f decays without practice | open (keeper proposal; Rex) |
| C-Q22 | §18.4 Fi coherence: among valued things, or with the internal identity | **(Rex, 2026-11-01)** both, as two levels of one mechanism: compatibility among valued things builds an evaluative structure and identity, which then feeds back (λ_t · identityFit(X, I_t)); I_t is Cognition's existing self-model, never a separate store; changes through experience, never fixed by type |
| C-Q23 | §18.4 which existing structure is the self-model I_t: the mind's beliefs about itself (§2.3, about = own handle), §13a mechanism 1's identity nodes, or both | open (keeper proposal: both, beliefs for traits, identity nodes for memberships) |
| C-Q24 | §18.5 coherence principles for Ni (tentative: integrated pattern or anticipated trajectory), Se and Ne; and the form of match and update for Si | open (Rex) |
| C-Q25 | §2.4 resolution: does a refused social or market act count as `failed` (the mind learns from the refusal) or as its own status | **(controller, 2026-11-01)** `failed` with the reason among the stimuli, so the mind learns from the refusal through ordinary perception and belief update; recorded for Rex to overrule |
| C-Q26 | §2.4 never-both: which engine owns excluding individually simulated minds from the population headcount that feeds per-capita demand and cohort labour supply (Life or Reality) | Life (controller, 2026-11-01; Reality and Life agree): one resolution per person, headcount conserved under promote/demote; Reality checks conservation through Life's CG-23 tests |
| C-Q4 | The personality layer switches on only after CB-1…CB-7 pass on the null model | **(Rex, 2026-10-30)** kept; crude formulas written now (§9) |
| C-Q10 | §9 v1 formulas F1–F13 and their crude constants (linear ω, N½ = 10, r = 1.5, K = 3, the /2 factors); what is off | Rex (each traces to his line) |
| C-Q5 | Baseline need set: hunger, safety, social connection | Rex |
| C-Q6 | The baseline has **no internalised norms**: lying and stealing cost only what their consequences cost (beliefs, retaliation); norms arrive with Society and personality | Rex; **answered by the Society seam (2026-10-31, pending the controller's confirmation of Rex's reading):** norms reach minds only as observed acts and messages through `society.affordance` and the network; Society acts on what people do, never on what they think |
| C-Q7 | V2 needs the Technion Prediction Tournament data (public, Erev et al. 2010); the unit fetches it, or Rex downloads it if the belt cannot | Rex if fetch fails |
| C-Q8 | One-action lookahead in the baseline; planning later | Rex |
| C-Q9 | Mistaken identity (beliefs keyed by the mind's own handles) deferred | proposed |
| C-M1 | Interactions between needs (one need's pressure scaling another's) | open, after the baseline |
| C-M2 | Urgency thresholds (preemption beyond a deficit) | open, after the baseline |
| C-M3 | Allostatic anticipation and long-term goals in `M` | open, after the baseline |
| C-K1 | Per-mind RNG streams | **agreed 2026-10-30**: `get(mechanismId, entityId)`, kernel unit 2660 (§7) |
| C-K2 | `cognition` and `host` phases | **agreed 2026-10-30**, kernel unit 2660 (§7) |
| C-K3 | Knowledge & Technology holder port (KNT-C1): read-only view over `mind.belief` (holds j = categorical belief about the mind's handle for j, attribute `truth`, P(true) ≥ K&T's θ_hold; "heard of" ≠ "holds"; host supplies the handle map) and a future `mind.skill` ([0,1] per technique, from reserved `cognition.skill.practice`); discovery from an outcome is §2.5, invention of new techniques is generation and open (their KNT-6); skill units Rex's (their KNT-7). See knowledge/DESIGN.md §1.2, §1.7, §2, §6 | **agreed 2026-10-31** |
| C-S1 | DUP-60 transmission (batch 2b, Rex 2026-10-31): Society's network is the one substrate; Cognition keeps what each mind encodes, understands and believes; one entry point into a mind (`mind.testimony` via comprehend); beliefs move only on a received message or a lived observation | **agreed 2026-10-31**; combined tests are integration tests (§11b) for the first integrated experiment |
| C-S2 | DUP-61 collective knowledge (batch 2b, Rex 2026-10-31): K&T owns the stock as an aggregate; `cognition.belief.update` stays per-mind; no copy of the stock in a mind; no mind reads `knowledge.*` (§1) | **agreed 2026-10-31** |
| C-R1 | Port names and the hunger boundary | **agreed 2026-10-30** with Reality and the registry; `percept.detectability` renamed `body.detectability` (§8) |
| C-R2 | Appetite and the eating rule (nutrition.json) move to Cognition as decisions; fullness and hunger stay Reality's signals | **(Rex, 2026-10-30)** DUP-49 approved: four-owner split (§0, §2.2, §8) |
| C-G1 | `mind.` scope, 13 rows, 5 reserved rows, 14 quantities + `mind.testimony` | **registered 2026-10-30** (planned); DUP-46's owner still Rex's in batch 5 |
| C-B1 | Baseline acceptance rulings after unit 2670 parked (COG-10 to COG-15): horizon-censored receipts, `r_obs` as the valuation of the perceived outcome, id swap with transported streams, λ on fight + steal combined, the full 500/200-seed studies run as `npm run bench` with verdicts read by the gate, V1's criterion | keeper ruling 2026-10-30; units 2700, 2701 |
| C-B2 | CB-6b certified by the independent check unit; CB-7 λ asserted at the evaluation level, population effect reported (COG-18, COG-19) | keeper ruling 2026-10-30; unit 2705 |
| C-V2 | V2 fails on default θ (trial-MSD lower bound .00527 > 1.5 × IBL .0005). Reported, not tuned; fitting θ to the TPT estimation set is a reviewed parameter change (PLATFORM §11a) after the baseline | open (keeper review; Rex sees the report) |

## 13. Preference learning (Rex, 2026-10-30; placeholder; designed after CB-1…CB-7 pass)

A **general preference-learning architecture** (ENGINES.md, "General preference learning"). Attraction is its
first application (§13b), not a special system, and there is **no catalogue of attraction types**. The same
mechanisms serve admiration, distrust, occupational preference, taste and aversion. Nothing here is built or
queued; the section fixes boundaries so no baseline unit forecloses it.

### 13a. The mechanisms (Rex; forms proposed)

1. **Semantic representation**: characteristics, abilities, behaviours, identities and relationships as nodes,
   linked to observed behaviour and to each other. These are beliefs (§2.3), so they can be wrong.
2. **Preferences** `P_i,k(t)` toward any characteristic k: positive, negative, neutral or context-dependent,
   each with its own **weight** (how strongly it influences evaluation). The profile and the weights are separate
   state, and experience changes the weights.
3. **Associative learning, generalisation and causal misattribution**: an experience is attributed to a
   characteristic by the existing attribution read-out (§2.6), and the preference generalises along whatever the
   mind attributed it to, rightly or wrongly. One bad artist may become a dislike of artists, of expressive
   people or of admired people, depending on the attribution.
4. **Social transmission**: family, peers, institutions and culture, arriving as Society inputs.
5. **Contextual, nonlinear evaluation of combinations**: a characteristic's value may depend on context and on
   the other characteristics present. The form is open (P-Q2).
6. **Separate quantities**: attraction, romantic attachment, sexual motivation, partner selection and
   reproductive intention, each its own quantity or decision.

**Baseline evaluation (proposed):** `A_ij = Σ_k P_i,k · X̂_ij,k` over the other *as perceived* (`X̂`, through §2.1
perception and the mind's semantic links), never the true record. Mechanism 5 later replaces the sum.

**Predispositions and malleability (Rex):** predispositions initialise as distributions and tendencies, not fixed
values. Malleability varies per preference. **Sexual orientation is a fixed-malleability class: reward,
punishment and social pressure never freely rewrite it.** Its learning rate toward those signals is zero by
construction, not tuned.

**Boundaries (unchanged):** Reality owns phenotype and capability; Society owns norms and transmission; Cognition
owns beliefs, preferences, associations and evaluation.

### 13b. First application: attraction and partner selection

**Cognition owns (Rex):**
- **Individual preference structure `P_i`** (13a, mechanism 2): three interacting influences, namely biological
  tendencies (inherited and developmental), social transmission (family, peers, culture, status) and experiential
  associations (personal history, learned associations).
- **Interpersonal attraction** `A_ij(t) = F(P_i, X̂_ij, C_i, E_i, R_ij, S_t)`, where `X̂_ij` is the other
  *as perceived*, never the true phenotype. Baseline form: the 13a sum; `F` beyond it is open.
- **Attachment.**
- **Sexual motivation as a need**: a §2.2 need record, with a category and a source, under the same `M_i` as
  every other need.
- **Partner choice as a decision**: attraction weighed against anticipated social consequences (§2.5), with
  Society's pressures as inputs.
- **Relationship learning** (§2.4/§2.6 applied to `R_ij`).

**Style and presentation (Rex, 2026-10-30; ENGINES.md "Style and presentation"):** between the phenotype and
perceived attractiveness sits how a person chooses or learns to present themselves: clothing from inventory,
grooming, accessories, a personal aesthetic, behavioural presentation.
- **Cognition owns the choice**: a decision (§2.5) over the available materials, money, climate, norms, the
  mind's preferences and what it has learned attracts others. A mind may change its presentation deliberately to
  change how it is perceived.
- **Cognition owns the observer's interpretation**: style emits signals that the observer reads through their own
  beliefs (§2.3), rightly or wrongly. Style is never a guaranteed indicator of personality.
- **Economy** owns the garments and accessories as goods; **Society** owns their cultural meaning.
- **Composition (registry, 2026-10-31):** the planned row `shared.presentation.set` is Cognition's; it composes worn
  items, grooming, body modifications and behavioural presentation into the one `body.presentation` record that observers
  read, and writes nothing else. Each part keeps its owner (Economy the goods, Life the body, Society the meaning).

**Social influence has two causal pathways, both real (Rex):**
- on **attraction**: exposure and learning change what someone finds attractive (`P_i` and its weights move);
- on **behaviour**: attraction is unchanged, but partner choice changes through anticipated consequences (§2.5
  with Society's pressures).

The model must be able to produce either pathway alone or both, and tests must tell them apart.

**Cultural salience and the zeitgeist in attraction (Rex, 2026-10-30; proposed, not built).** Rex's direction
(ENGINES.md, "Cultural salience and the zeitgeist in attraction"):
- **Two independent inputs to attraction (Rex):** perceived **social valuation** `V_i` (what the surrounding
  community admires, endorses or rewards; Society supplies it, read as a social input, 13a mechanism 4) and
  perceived **sensory appeal** `S_i` (what is visibly fashionable or physically appealing, read from the phenotype
  and style *as perceived*).
- **Cultural salience** is how often and how prominently a characteristic appears in a person's environment.
  Society decides what is prominent or rewarded; Cognition decides what each individual notices (§2.1), how it is
  interpreted and whether it moves attraction.
- **Baseline shape, proposed:** `A_i = F(V_i, S_i, C_i, E_i)`, with `C_i` the cognitive-function weighting and
  `E_i` experience and learned associations. Its relation to the 13a sum `A_ij = Σ_k P_i,k · X̂_ij,k` and the form
  of `F` are open, to be designed with §13.
- **Function sensitivities are hypotheses, never laws (Rex):** Fe to collective valuation, Se to sensory
  presentation, Fi to personal significance, Si to familiarity and remembered ideals, Ne to novelty, Ni to symbolic
  meaning and anticipated trajectory, Te to demonstrated competence, Ti to coherence of thought. Each is a level-5
  hypothesis tested like T-1 and T-2. Fe and Se shape *sensitivity*, never conformity.
- **Four separate outcomes (Rex):** awareness of a trend, personal evaluation of it, willingness to conform to it,
  and attraction toward people displaying it. A style can be fashionable without a person liking it, and attractive
  to someone despite their community's disapproval.
- **Feedback loop (Rex):** people adopt styles, others react, the reactions move social popularity, and popularity
  moves future preferences.
- **Registry rows (planned, registered 2026-10-30):** mechanisms `cognition.attraction.social_valuation`,
  `cognition.attraction.sensory_appeal` and Society's `society.culture.salience`; quantities
  `mind.perceived_social_valuation`, `mind.perceived_sensory_appeal`, `mind.cultural_salience`.

**Others own:**
- **Reality / Life & Species**: the phenotype record that perception reads (face, body, composition, surface,
  movement, voice, scent, expression).
- **Society**: beauty ideals, family expectation, peer pressure and status norms, which reach Cognition as inputs
  only.
- **Life & Species**: reproduction (fertility, conception).

**Invariants (Rex):**
1. Attraction ≠ partner choice ≠ sexual behaviour ≠ reproduction. Each is a separate quantity or decision, and
   none is derived from another by identity.
2. No universal attractiveness score. Attractiveness exists only as `A_ij`, per perceiver; there is no population
   norm, so no "girls like X, guys like Y".
3. Little or no attraction (sexual or romantic) is a valid parameter region, not a defect. Tests must cover it,
   and nothing may treat it as an error or a fallback.
4. Dispositions (§9) influence attention and evaluation only, and the personality label describes the resulting
   pattern (Rex, corrected 2026-10-31, §14.1), never a rule like "Se prefers muscular". The §9 fingerprint and
   citation rules apply.
5. Variety with consistent inherited and transmitted factors. Population-level patterns may only emerge from
   `P_i` transmission, never be written in.

**Planned experiment (Rex):** several minds are given the same potential partners but different inherited
tendencies, histories and cultural environments. The check is that attraction and partner selection diverge
coherently, each difference traceable to its cause (inherited, experiential or cultural; the attraction or the
behaviour pathway), with replayed seeds as in §6.

**Open (to settle when this is designed; nothing registered beyond the registry keeper's rows):**
- P-Q1: the semantic representation (graph of nodes and typed links? embeddings?) and how observed behaviour
  links to it, with evidence levels.
- P-Q2: the nonlinear combination form (mechanism 5) and its source.
- P-Q3: the generalisation rule along semantic links (e.g. similarity-based generalisation; Shepard 1987), and
  how attribution strength sets its breadth.
- P-Q4: the malleability classes besides sexual orientation, and who sets each (Rex).
- A-Q1: the form of `P_i` for attraction (feature weights over perceived traits? prototypes? both?), with evidence
  levels.
- A-Q2: how social transmission of `P_i` works (a family/peer update rule), and how much belongs to Society versus
  Cognition.
- A-Q3: the attachment model and its source (e.g. attachment-theory literature), and whether it is a need, a
  belief state or both.
- A-Q4: the sexual-motivation need's source (signal from Reality, appraisal or accumulator, §2.2), and its
  boundary with Life & Species' physiology.
- A-Q5: the benchmark scenario and the validation data (a §10-style V-item) before any unit is drafted.
- A-Q6: which perceived features the §2.1 attention weights cover, and the phenotype port names (agreed with
  Reality and the registry).

## 14. Five directions (Rex, 2026-10-31; recorded design, not built)

Rex's directions (ENGINES.md, "Five Cognition directions"). Design may be recorded here; no code and no benchmark
change until the controller releases the baseline follow-up work (T-1/T-2). Row ids are planned registry rows.

### 14.1 Memory sits below personality (Rex)

- **Stages (Rex):** attention (what is noticed: goals, interests, danger, novelty, distraction, existing knowledge;
  §2.1) → encoding (what becomes a memory, and in what detail) → consolidation (what becomes durable; sleep is a
  biological influence here, read from Reality) → retrieval (what the situation or another's remark brings back;
  §2.3's ACT-R activation) → communication (what is mentioned, concealed or questioned). **Remembering and saying are
  separate acts**: communication is a decision (§2.4), never an automatic read-out of memory.
- **No type-specific memory rule (Rex):** three witnesses of one dockside argument remember different things through
  attention, experience, goals and state alone.
- **Ownership (Rex):** Reality's neuroscience owns the biological constraints; Cognition owns attention and
  remembering. Which memory parameters Reality constrains is **open** (C-Q13).
- **The personality label is descriptive (Rex's correction):** dispositions influence behaviour; the label describes
  the resulting pattern. A measured trait used to predict attention is an empirical approximation, never a neural
  mechanism. "Grey matter" is not a capacity number.
- **Rows (planned):** `cognition.memory.encoding`, `cognition.memory.consolidation`, `cognition.memory.retrieval`
  beside the existing `cognition.memory.episodic`; attention is `cognition.attention.allocate`; saying is the
  communication subsystem (`cognition.communication.encode`).
- **Writer split (keeper proposal, 2026-10-31; Rex may overrule):** today the built `cognition.memory.episodic` is
  the only writer of `mind.episode` and `mind.retrieval_p`, and its retrieval noise draws from the kernel stream
  `cognition.memory.retrieve` (a registry alias of episodic, kept so seeded runs do not change). The three stages
  write nothing until they are built. When built: encoding writes `mind.episode` (which events become episodes, and
  in what detail); consolidation writes a new `mind.memory_durability` (per-episode durability; sleep is a Reality
  input); retrieval writes `mind.retrieval_p` and takes over the stream alias; episodic then becomes an alias of the
  three stages, and `kernel.json` changes in the same commit. Continuity during absence (14.3) writes nothing of its
  own: it advances the existing needs, beliefs and episodes at coarse resolution.

### 14.2 Gaze and eye contact (Rex; nonverbal communication)

- **Three separate things (Rex):** the visible behaviour (where, how long, looking away, expression, posture,
  distance; an intention chosen through §2.4 and carried out by the body), the observer's interpretation (attraction,
  anger, curiosity, challenge, submission, mere attention) and the response (return, smile, avoid, question,
  approach, defend; again a §2.4 decision).
- **Interpretation is several hypotheses with likelihoods (Rex):** each new cue shifts them; they are carried forward
  and revised, like any belief (§2.3), and may be wrong. Randomness represents uncertainty and never replaces
  causes. Weights are researched and calibrated: no rule like "three seconds means attraction". Cultural and
  individual differences and misunderstanding are included. The interpretation feeds attention (§2.1) and the memory
  of the encounter (14.1).
- **Open:** the hypothesis set and its calibration sources (C-Q14).
- **Rows (planned):** `cognition.communication.gaze` (nonverbal interpretation); quantity `mind.gaze_hypotheses`
  (record per observer and partner: hypotheses with likelihoods).

### 14.3 Intermittent characters: continuity during absence (Rex)

- People whose lives cross the player's only sometimes: regular (an annual visitor, a seasonal worker), irregular but
  explainable (a ship's route, weather, repairs, business), conditional (family, debt, need, wanting to see you),
  apparently one-time.
- **Continuity during absence (Rex):** they return changed, remember the last conversation (14.1) and come for a new
  reason; they are simulated only enough to account for meaningful change. An expected person may fail to arrive, and
  that absence matters without becoming a quest.
- **Ownership:** who these people are, and their schedules, belong to the pirate plugin (its story and town keepers);
  Cognition supplies the continuity of their minds.
- **Row (planned):** `cognition.continuity.absence`.

### 14.4 Tattoos, body features and names (Rex; with §13b "Style and presentation")

- Three separate things: the feature; its intended meaning (belonging, religion, rebellion, remembrance, taste), which
  Society and the bearer supply; and the observer's interpretation (§2.1, §2.3), which may be wrong.
- **"Exotic" means unfamiliar to this observer (Rex),** never a property of the name or the person: it is read from the
  observer's own experience (episodes, 14.1).
- Cultural tattoos may encode rebellion factors (Rex), read through the same three-way split.
- No new row: perception, belief and §13b's style and presentation cover it.

### 14.5 Drugs alter the person, not only the state (Rex, firmly)

- **Repeated exposure can lastingly change how someone thinks, reacts and relates (Rex),** including the **reasoning
  process itself**: association speed, what counts as evidence, how certain they become, whether contradictions are
  noticed, working memory, checking of conclusions, belief updating. The baseline is altered by history and **never
  reset when the substance wears off**.
- **Separate processes, each substance its own researched model (Rex):** immediate effects (attention, arousal,
  inhibition, perception, body); tolerance and dependence, with withdrawal apart from intoxication; learning and
  craving (people, places and situations associated with relief or reward, through §2.5 and 14.1); longer-term
  adaptation and recovery on their own timescales with individual variability (lasting ≠ irreversible); injury or
  illness as a separate pathway.
- **Ownership (Rex):** Reality's neurology and pharmacokinetics own the biology; Cognition owns the altered processes,
  read as changes to its own parameters (§3 θ, §2.3 belief updating, §2.1 attention) through a port.
- The research target is a formula for lasting change in brain chemistry and synapses that later shows as personality
  presentation; the personality measurement describes the resulting pattern (14.1).
- **Open:** which reasoning-process parameters a substance may move, and each substance's sourced model (C-Q15).
- **Rows (planned):** `cognition.substance.adaptation` (lasting changes to reasoning-process parameters); quantity
  `mind.process_baseline` (record: the mind's reasoning-process parameters as altered by its history).

## 15. Contract fields: rate limiter and failure mode (registry schema 4; keeper, proposed 2026-10-31)

The registry (schema 4, Rex 2026-10-31) asks every built row what limits its rate and what makes it fail; these
entries describe the built code and DESIGN, they add no new mechanism, and a field the design does not state is
written "none stated".

| Row | Rate limiter | Failure mode |
|---|---|---|
| `cognition.attention.allocate` | Attention shares `a_c = w_c/Σ w'` sum to 1 per mind per tick (§2.1 Bundesen; `allocateAttention` renormalises; proposed zero-total convention: no attended cues). | No allocation when total weight is zero (proposed); invalid salience, relevance or hook output throws (`attention.ts`). |
| `cognition.perception.detect` | One detection pass per attended stimulus per tick; effective sensitivity `d'_eff = d'_c·√a_c` (§2.1) bounded by declared `d'` and the attention share. | Misses and false alarms by SDT (`P_H`, `P_FA`, §2.1); wrong categorical or Weber-noisy real reports; explicit null observations when not detected; invalid shares, criterion or stream draw throws (`perception.ts`). |
| `cognition.belief.update` | Conservatism `η ∈ (0,1]` on each update (§2.3); between observations, categorical relaxation `λ_b` and real drift `q_k·Δt` (§2.3). | Wrong or false priors by design (§2.3); under-update when `η < 1`; testimony weighted by reliability `r_j`; kind or support mismatch throws (`beliefs.ts`). |
| `cognition.memory.episodic` | Retrieval probability from activation `B_e`, threshold `τ`, noise `s`, decay `d` (§2.3 ACT-R); one stream draw per retrieval attempt (`cognition.memory.retrieve`, §7). | Forgetting and failed retrieval when the draw exceeds `P_retrieve(e)`; `P̂` underweights irretrievable episodes (§2.3); invalid decay, context or stream throws (`memory.ts`). |
| `cognition.needs.drive` | Motivational priorities `priority_i = M_i/Σ_j M_j` with `M_i = w_i D_i S_i` (§2.2); drive `D(h)` uses host parameters `n`, `m`. | Mis-priorities from wrong deficits (Reality signals, appraisal beliefs, accumulator `dh/dt = 1/τ_soc`, §2.2); missing inputs or non-unit deficits throw (`needs.ts`). |
| `cognition.goals.objectives` | Host standing goals with `p_g ∈ [0,1]`; reward term `V_g·Δp_g` per update (§2.2; `goalReward`). | Progress and reward follow host-supplied `goalProgress`, not ground truth; out-of-range progress throws (`needs.ts`, `mind.ts`). |
| `cognition.decision.generate` | Candidates are repertoire entries whose believed preconditions meet `θ_pre` (proposed 0.5) and whose capacity `≤ body.capacity_functional` (§2.4); personality hook may reorder or add compounds (§9). | Actions omitted when preconditions or capacity fail; invalid repertoire or hook output throws (`actions.ts`). |
| `cognition.decision.evaluate` | One `EU(a)` per candidate with one-step lookahead and discount `γ` (§2.4); `P̂` from theory plus retrievable episodes (§2.3). | Wrong expected utility from mistaken beliefs and `P_theory`; loss aversion `λ` on negative outcomes (§2.4); unknown predicted need or goal throws (`evaluate.ts`). |
| `cognition.decision.select` | At most one newly minted intention per re-choice; softmax with `β` (§2.4 Luce); commitment keeps the current intention while `max_a EU(a) − EU(ι) ≤ κ` (§2.4, §5). | A worse action chosen by the softmax draw; kept intention when advantage within `κ`; invalid utilities, `κ`, or stream draw throws (`select.ts`). |
| `cognition.learning.outcome` | Runs when an outcome event's `cause` is this mind's intention id (§2.5, §7); records `δ = r_obs − EU(ι)` and optionally encodes an episode. | Wrong learning signal from misperceived outcomes (§2.5); unknown or already-settled intentions get empty feedback (`process.ts`); timeline or outcome-space mismatch throws (`learning.ts`). |
| `cognition.learning.attribution` | Attributed cause is the latent with largest KL move from its prior, else "chance" if no move exceeds `ε_attr` (§2.5); ties by declared latent order. | Misattribution when the wrong latent wins or none clears `ε_attr`; duplicate latent ids or invalid reliability update throws (`learning.ts`). |
| `cognition.personality.slot` | Structural null model: identity on pertinence, interpret, generate and learning hooks (§9 `nullPersonality`; DESIGN §5 registry n/a). | Baseline adds no failure beyond the hooked rows; when a non-null model is configured, hooks may mis-modulate `π`, `η`, `κ`, learning rate and `d` (§9). |
| `cognition.personality.eight_function` | Switched on only after baseline CB-1–CB-7 (§9 C-Q4); v1 adjusts declared parameters through the four hooks when configured (`personality/eight-function/v1.ts`). | Hypothesis-level wrong modulation when enabled (§9 level 5); invalid stack or parameters throw in v1 (`personality/eight-function/v1.ts`). |

## 16. The experience pipeline and memory profiles (Rex, 2026-10-31; recorded design, not built)

Rex's model, given to the Cognition keeper directly on 2026-10-31. It is a piece of the whole: it fixes the order
in which an experience is processed and how it is kept, and it dictates what a person later says and how. Nothing
here is built; §14.1's stages and §9's hooks are where it attaches.

### 16.1 The pipeline (Rex)

1. **Perception filter: the extraverted function.** The scene contains everything; the dominant extraverted function
decides which parts of the data are weighted. Se and Fe pull the raw content of the image (a police beating of
protesters: the violence, the people, what is literally happening), reading it more closely to what the image is; Te
and Ne weight other features (logistics, possibilities, what it implies). Attaches to §2.1 attention and §14.1
attention.
2. **Encoding: the introverted function.** The filtered data is processed into the mind's internal format (§14.1
encoding).
3. **Chemical response.** That interpretation triggers the body's chemistry (Reality's neurology and endocrine layer,
read through §8's ports; Cognition never computes the chemistry).
4. **Re-interpretation.** The body state is read again, externally (how it makes you react) and internally (how it
makes you feel). That second read is what becomes the emotion: the data goes to the brain, the brain interprets it
and determines a response, and the response is re-interpreted as emotion.
5. **Experience feeds stages 1, 2 and 4.** Two people with the same functions still react differently; the key to the
differences is not just the function but experience.

**What is stored (Rex):** the event, plus the interpretation, plus the body state at the time. A retrieved memory can
re-trigger the chemistry: a remembered betrayal still raises the heart rate years later. (Retrieval therefore has an
output back to Reality's neurology, proposed as a port; nothing built.)

**The objective output (Rex):** the description of an emotion is irrelevant to the objective output. What matters is
what the person responds with and how: after an experience, what they talk about and in what manner. The pipeline must
dictate responses for everything; emotion words are at most a measurement of the pattern (§14.1, descriptive label).

### 16.2 Memory is three values, not one (Rex)

- **Stored:** did the brain keep it? (§14.1 encoding and consolidation)
- **Retrievable:** what cue brings it back? (§14.1 retrieval; §2.3 activation)
- **Articulable:** can the person explain it? (§14.1 communication; a separate act from remembering)

Memory is not Si's. Si is the stereotypical example because it details the self and the situation physically, but
every function stores, recalls and articulates in its own way, and **functions in a stack modify each other's memory**:
a person's recall is the stack interacting, never the dominant function's profile alone (Ni with Te organises the
lattice that Ni alone cannot recall concretely).

| Function | How it stores | What triggers recall | Articulation |
|---|---|---|---|
| **Si** | physical detail, the self in the situation | sensory similarity | high, concrete |
| **Fi** | deep, experiential | emotional resonance | low: it remembers but cannot explain well |
| **Ti** | connective: what links to its structure sticks | logical connection to existing pieces | high when connected, weak for isolated facts |
| **Ni** | abstract lattice (crystal structure) | pattern match | low concrete recall unless Te organises it |
| **Fe** | comprehension of what it is looking at | social or situational meaning | grasps what it saw |
| **Se** | **open** (C-Q16) | **open** | **open** |
| **Ne** | **open** (C-Q16) | **open** | **open** |
| **Te** | **open** (C-Q16); organises Ni's lattice when both are in the stack | **open** | **open** |

These profiles are **hypotheses in Rex's theory** (§9: function sensitivities are hypotheses, never laws), to be
expressed as hooks on the memory stages and tested like T-1 and T-2, never as a rule "type X remembers more". §9's
fingerprint and citation rules apply once Rex writes them into the personality matrix.

### 16.3 Requirements (Rex)

- **The chemistry must be present:** the brain's and the body's chemicals, with their cited physiological effects, must
exist in the simulation for this to work. That is Reality's (neurology, endocrine, pharmacokinetics; §8); Cognition
reads the state and never a summary "mood number" in its place. Raised with the Reality keeper.
- **Next after this:** how memory affects interpretation (stages 1, 2 and 4 reading retrieved memories), to be
designed on top of this section.

### 16.4 A mathematical form (keeper, proposed; Rex asked how this could become mathematics)

Nothing new is needed below the hooks; each stage already has a quantity:
- Stage 1 is attention weight `w_c` per cue (§2.1); the extraverted function's profile is a `pertinence` hook that
reweights cue categories (already v1's F2 shape).
- Stage 2 is what the episode record carries: **encoding writes a detail vector** per episode (physical detail, felt
valence, structural links, abstract pattern, social meaning), and the introverted function's profile sets how much of
each dimension is encoded (an `interpret`-stage hook on §14.1 encoding).
- Stage 3 is Reality's: `body.circuit_outputs` (§8) and the endocrine state, written by Reality from the appraisal
Cognition emits (the output `mind.appraisal`, registered planned 2026-10-31 with writer `cognition.emotion.appraisal`; the
endocrine state is `body.transmitter_levels` and `body.hormone_levels`, §8).
- Stage 4 is perception again: the body state enters as a stimulus (interoception, §2.1) and is interpreted through
beliefs (§2.3); the emotion is the belief the mind forms about its own state, descriptive.
- **Retrievable** is §2.3's activation with **cue-type weights**: the trigger column says which similarity (sensory,
emotional, logical, pattern, social) spreads activation to the episode, per function profile.
- **Articulable** is a communication-stage limit: how much of the stored detail vector the mind can put into testimony
(`cognition.communication.encode`), per profile; Fi and Ni low, Si and Ti (when connected) high.
- **Stored = event + interpretation + body state**, so the episode record gains the body state at encoding, and
retrieval emits it back to Reality as a re-trigger (proposed port `mind.recalled_body_state`).
- **Stack interaction:** the hooks of every function in the stack apply, weighted by §9's dynamic allocation
`A_f(t)`, which is how Te organises Ni's recall without a special case.
Open: the form of the detail vector and the cue-type weights, and their sources (C-Q17).

## 17. Knowledge of history (Rex, 2026-10-31; recorded design, not built)

**(Rex)** The History engine is the backend record of what occurred in the simulation: it aggregates, compares against
real history for validation, and **never determines what happens and is never read by anyone in the world**. What a
person knows of the past comes only through Cognition, by fallible routes. Those beliefs about the past, not the
record, drive choices through the ordinary decision mechanism (§2.4). The record and the beliefs diverge by design:
myth, propaganda, lost knowledge and archaeology arise from the gap, without scripts.

**The four routes (Rex), as registry rows (planned, 2026-10-31):**

| Route | Row | What it is | Writes |
|---|---|---|---|
| memory of events lived through | `cognition.history.lived_memory` | a route over the existing memory stages (§2.3, §14.1, §16): attention, encoding, consolidation, retrieval | nothing of its own |
| written records | `cognition.history.written_record` | reading a persistent message through perceive and comprehend (§2.1, communication subsystem); one knows only what the writer chose to record and how, and only if the medium persisted: persistence, fidelity and accessibility come from `world.medium_properties` | nothing of its own |
| inference from evidence that remains | `cognition.history.inference` | perception plus belief update (§2.3), which may be wrong | `mind.inferred_past` (record: hypotheses about past events with likelihoods) |
| oral transmission | `cognition.history.oral_transmission` | communication plus memory across minds, carried on Society's network (DUP-60) | nothing of its own |

The backend row `history.record.backend` (engine History) writes `history.record`.

**Invariant (Rex; on all five rows):** no mechanism in any engine reads the History record. In Cognition this is the §1
fence extended: `history.*` is objective state, and nothing past perception may take it. A check that no `kernel.json`
process reads `history.*` is ROADMAP P10 test 2; Cognition's own fence test gains the same assertion when the rows are
built.

**Consequence (Rex, review finding 1):** polity formation, war decisions and collapse belong to Government and Society;
History keeps aggregation and the harness.

## 18. Semantic systems: meaning pools and bubble exposure (Rex, 2026-10-31; recorded design, not built)

Rex's model, given to the Cognition keeper on 2026-10-31 (reviewed with ChatGPT; his words count as his). It belongs
to the communication subsystem (comprehend and encode, §5) and to §16's encoding stage, and it is the semantic half of
the four hooks in §9. The function profiles below are **hypotheses in Rex's theory** (§9: never laws), expressed as
parameters of one shared mechanism, never as a rule that a type reasons well or badly.

### 18.1 The mechanism (Rex)

- **`meaning(signal, context)`** can change its output while the definition of the function stays fixed. A word ("fine", "loyalty", "respect") carries a **pool of candidate meanings**; context (speaker, relationship, situation, time) selects which one is active and with what likelihood. The engine keeps the candidates separate and updates their likelihoods from context (§2.3 beliefs); it never declares two meanings identical.
- **An undeclared change of meaning inside one argument is an error** (equivocation): a symbol must keep its assigned meaning throughout a reasoning chain unless the change is declared.
- **Selection and reconstruction (Rex):** **selection** happens within one interaction: the pool is held and
  context picks ("loyalty" resolves to obedience before the boss and to solidarity among coworkers within the same
  hour). **Reconstruction** happens whenever no held meaning fits or someone supplies a new one, including within a
  single conversation (a listener rebuilds a meaning on the spot when the speaker explains their usage); a new
  meaning is often a blend of existing ones, and it accumulates and persists across interactions when the group
  reinforces it, so the pool drifts over time.
- **Bubble exposure (Rex):** every group (a culture, a faction, nerds, jocks, a party) has its own semantic outline: what its words mean, what insults and what compliments. A mind's pool is built from the bubbles it has been inside. **Narrow exposure** (one or two bubbles) makes those meanings feel universal, carried into every room, misreading people who use the same words differently; **wide exposure** holds many outlines, resolves terms by the bubble one is in, and gives a word weight only when someone present would be hurt by it, with time needed to work out how to handle it. The exposure history is per mind and comes from lived contact (§14.1, §16), never from a type. **Exposure has depth, not just membership (Rex, review note 1):** passing through ten bubbles is not living in ten; depth comes from time spent, closeness to members and the emotional salience of the episodes. **Context includes who is present (Rex, review note 2):** `context` carries the listeners present and their bubbles, not only the speaker and the situation, since a worldly mind weighs a word by who nearby would be hurt.
- **Emergent conflict, not scripted (Rex):** a fixed-definition speaker sees equivocation; a context-resolving listener sees rigidity that ignores what the situation obviously means. Neither is malfunctioning; they run different semantic systems. Rex observed this live when a language model (distributional semantics: a word is known by the company it keeps, Firth) resolved his fixed definition of "illogical" by its social weight instead; replacing the word with one that had no conflicting social meanings removed the friction.

### 18.2 Function profiles (Rex; hypotheses, parameters of the one mechanism)

| Function | Pool | Selection | Reconstruction | What it notices in others |
|---|---|---|---|---|
| **Fe** | large, built from many external bubbles; maps where each meaning comes from | context-weighted, by the bubble one is in | low threshold; driven by the group's usage; the pool drifts | who present would be hurt by a word |
| **Ti** | one meaning per reasoning chain, held by internal consistency | fixed for the chain | only by explicit redefinition | a switch of meaning mid-argument (equivocation) |
| **Te** | one, anchored to the shared external definition, meant to work across every bubble | fixed | by changing the shared standard; pushes others to adopt it | departures from the shared definition |
| **Fi** | one fixed internal referent authored from personal values (its own bubble) plus a **lossy encoder** to public words | fixed referent | the referent does not drift; its expression does | **open** |

Symmetry (Rex): Fe/Ti is many external outlines against one internal structure; Te/Fi is one shared standard
against one private standard.

**Perceiving functions (Rex, 2026-10-31, accepted provisionally):** as starting definitions, the perceiving functions
feed what goes into the pool: **Se** the details available in the current sensory input; **Si** comparison with
personally retained experiences; **Ne** alternative interpretations and possible connections; **Ni** patterns
inferred across multiple observations. This is **never an exclusive boundary**: the judging functions (Fe, Te, Fi,
Ti) also bias upstream which information gets attention, which connections matter and which interpretation is
retained (§16.1 stage 1, where Fe and Te shape what is noticed in the first place), and the processes interact
rather than passing information one way. Each function therefore has two roles, by attitude (§16: extraverted
filters, introverted encodes) and by kind (perceiving feeds, judging assigns), and the two axes coexist. Whether Ne
or Ni also actively resolve meaning, rather than only supplying candidates, stays **open** (C-Q19), as does Fi's
"what it notices".

### 18.3 Where it attaches (keeper, proposed)

- **Comprehend** (`cognition.communication.comprehend`, §5): a received word is resolved against the listener's pool with context (speaker, relationship, situation, time, **and the listeners present with their bubbles**), producing `mind.testimony` with the selected meaning and its likelihood, and alternatives kept (§2.3). Misreading is the selected meaning differing from the speaker's intended one; no script.
- **Encode** (`cognition.communication.encode`): the speaker's chosen public word for an internal referent; Fi's lossy encoder lives here.
- **Reconstruction** is learning (§2.5): a new candidate enters the pool when no candidate fits and the group's reaction reinforces it; social transmission on Society's network (DUP-60) carries a bubble's outline.
- **Quantities (proposed to the registry, planned):** `mind.meaning_pool` (record per mind and term: candidate meanings with likelihoods and the bubble each came from) and `mind.bubble_exposure` (record per mind: groups lived in, weighted by time spent, closeness to members and the emotional salience of the episodes; **derived**, no writer of its own, from `mind.episode` and Society's membership, so there is no second store of the past; registered 2026-10-31). Both come from history; personality sets only the pool's parameters (size, selection weighting, reconstruction threshold) through the §9 hooks. `mind.meaning_pool` is written by comprehend (registered 2026-10-31).
- **Test (level 5):** two minds with the same words and different exposure histories misread each other in a predictable direction (the one whose history is least similar to the current bubble reconstructs or universalises); a Ti-weighted mind flags the Fe-weighted mind's mid-argument shift and the Fe-weighted mind flags the Ti-weighted mind's rigidity, from the parameters alone.

**C-Q18 answered (Rex, 2026-10-31, amended the same day): both.** Fe selects from its existing pool when it
recognises the bubble it is in. When it enters an unfamiliar bubble, or meets a person whose usage matches no held
meaning, it reconstructs, and that takes time ("needs time to understand how to handle it"); reconstruction is fed by
the new group's usage, and the new meaning stays in the pool if reinforced. **Selection succeeds according to how
similar the current bubble is to the mind's exposure history, not to exposure width alone:** a mind familiar with
ten communities dropped into an alien eleventh is back to reconstructing; narrow exposure means the mind either
reconstructs constantly or forces home-bubble meanings onto the new group.

### 18.4 Internal coherence: Ti and Fi share one compatibility primitive (Rex, 2026-11-01; proposed, not built)

Rex's observation (2026-11-01, reviewed; his words count as his): Ti and Fi may share one underlying operation,
**coherence building over an internal structure**, and differ in what counts as a valid connection. Ti assembles
conceptual pieces by logical compatibility ("Lego pieces that fit together"); Fi assembles personally meaningful
pieces by evaluative compatibility. Fi then has a more precise role than "liking things": it **organises individual
likes into a coherent system of personal meaning**.

- **One primitive, two criteria (proposed form):** a compatibility function over two items given a structure,
`C_Fi(x_i, x_j | P)` with `P` the mind's accumulated personal evaluative structure (§13a mechanism 2, the
preference structure), and `C_Ti(a, b | L)` with `L` the mind's conceptual structure (§2.3 beliefs and their
links). Items carry perceived characteristics `x_i = (colour, shape, texture, symbolism, style, …)` as read by
perception (§2.1), never true values. The same operation serves both; the criterion differs. This is §13a
mechanism 5 (contextual, nonlinear evaluation of combinations) given a concrete shape, and it is one reusable
computational primitive, not two functions made identical.
- **Proposed scores (Rex, refined the same day):** for a set of items `X = {x_1 … x_n}`,
`C_Fi(X) = Σ_i w_i · fit(x_i, P) + Σ_{i<j} v_ij · compat(x_i, x_j)`: the first term how well each item fits the
internal structure `P`, the second the compatibility between items; and `C_Fe(X, c) = meaning(X, c)`, the meaning
the assembled expression acquires in context `c` (the social environment, the audiences present, cultural
associations, the intended communication; §18.1 meaning pools). Fi weighs relations among the components; Fe
weighs the meaning their combination produces in a context. Proposed abstractions, not established equations.
- **Fe assembles differently (Rex):** through contextual integration, how a combination will be read by the
audiences present, whether it communicates a recognisable social identity, whether its apparent contradictions
produce an intended impression (§18.1, §18.2 Fe). Fi asks whether the pieces belong together within its internal
structure; Fe asks how they acquire meaning together within an interpersonal context.
- **Rex's observation on styles:** romantic goth, mall goth and cybergoth have different visual vocabularies yet
each is internally coherent: different goths are input reorientations of one Fi operation with different
preference structures, not Fe-heavy remixing. The operation is therefore never tied to a colour, aesthetic or
movement; a mind may prefer black and spikes, another white, clean lines and smooth surfaces, through the same
operation. Pointillism keeps one construction principle; a mixed-media work gains coherence from an overarching
message. **Refinement (Rex accepted):** mixing unlike things does not by itself mean Fe, and one consistent style
does not by itself mean Fi: an Fi mind may combine radically different materials that fit a personal structure,
and an Fe mind may hold one style because it communicates. The criterion for coherence decides, never the visible
amount of variation, or the engine would classify by finished products instead of modelling the process.
- **One primitive for the four judging functions (Rex, proposed):** Ti = internal conceptual compatibility; Fi =
internal evaluative compatibility; Te = external definitional and procedural consistency (explicit shared
definitions, §18.2); Fe = external contextual and interpersonal coherence (meaning resolved through context).
Ti and Fi construct internally coherent systems; Te and Fe construct externally meaningful ones. The engine then
needs one coherence-evaluation operation over relationships between components, with each function supplying its
compatibility criterion, instead of four unrelated algorithms. Registered as an extension of the existing Fi/Fe
semantic (§18) and preference (§13) mechanisms, never a new engine or row.
- **What this does not say (Rex):** nothing about how an outfit looks. An Fi mind may combine gothic, military and
formal pieces because they form a personally coherent identity; an Fe mind may combine the same pieces because
they make a compelling social expression in a setting. The finished choices can be identical; the assembling
process differs. No rule "Fi minimal, Fe maximal".
- **Systematic without being verbal (Rex; §16.2 Fi row):** an Fi mind may consistently reject combinations it
cannot explain ("that doesn't feel right"); the compatibility structure can be stable and testable even when
articulation is low.
- **General, not aesthetic (Rex):** the same Fi operation reaches music and artistic taste, personal values,
romantic preferences (§13b), identity formation, moral judgement, and attachment to objects, places and people.
It is a general mechanism of §13, with clothing (§13b "Style and presentation") its first observable case.
- **Test to design (level 5):** give an Fi-weighted mind a wardrobe of items with perceived characteristics and
let it assemble outfits over hundreds of decisions; measure whether accepted and rejected combinations show
stable relations in colour, shape, symbolism and texture; repeat after changing the mind's experiences and
bubble exposure (§18.1) and test that the structure evolves while keeping recognisable coherence; an Fe-weighted
mind under the same wardrobe should vary with the audience present, an Fi-weighted one should not. **Prediction
(Rex):** asked to assemble an aesthetic from unrelated components, Fi-weighted minds seek compatibility with an
internal pattern, Fe-weighted minds seek a context that makes the combination meaningful; tested with the same
components, different audiences and different learned aesthetic histories. The Function Activation Ledger
(bench/diagnostics) records which function assembled each choice.

| | Ti | Fi |
|---|---|---|
| **Organises** | concepts and their relationships | preferences and personal significance |
| **Seeks** | logical coherence | evaluative coherence |
| **Rejects** | contradiction | internal incompatibility |
| **Preserves** | conceptual identity | personal significance |
| **Can struggle with** | unresolved logical inconsistency | expressing why something feels incompatible |

Provisional definitions within Rex's model (§9: hypotheses, never laws), not established properties of types. The
strongest point (Rex): Fi's apparent subjectivity need not imply randomness; it can be a highly systematic
construction of internally compatible expressions whose governing criteria are personal rather than explicitly
logical.
**C-Q22 answered (Rex, 2026-11-01): both, as two levels of the same Fi mechanism.** Fi first establishes
compatibility among individually valued things; repeated compatible combinations build an internal evaluative
structure and a developing identity; that identity then constrains which new combinations feel compatible. Identity
need not be the source of every preference: it can emerge from accumulated preferences and experiences and then feed
back. (Someone first likes black clothing, silver jewellery and certain silhouettes independently; repeated
combination yields a coherent gothic aesthetic; later they reject items not disliked in themselves but conflicting
with the established identity.) The extended score, proposed:
`C_Fi(X, t) = Σ_i w_i · fit(x_i, P_t) + Σ_{i<j} v_ij · compat(x_i, x_j) + λ_t · identityFit(X, I_t)`, the three terms
being individual preference, component coherence and identity coherence, with `I_t` the developing identity structure
and `λ_t` how strongly identity weighs at time `t`; `I_t` changes through experience, so no identity is fully formed
at birth. **Rules (Rex):** `I_t` is **Cognition's existing self-model, never a separate Fi-only identity store**
(the mind's beliefs about itself, §2.3 with `about` = its own handle, and §13a mechanism 1's identity nodes; which
of these is `I_t` is C-Q23); identity must change through experience; no fixed aesthetic, moral code or preference
structure is imposed by type; internal compatibility stays distinct from external contextual coherence (Fe); a
provisional hypothesis within §18.4, not a law; nothing here interrupts the frozen F1–F13 experiments or the ledger.
**Implications (Rex):** Fi can grow more internally structured through experience without growing more externally
articulate (§16.2); and a developmental prediction, younger Fi-weighted minds lean on individual preferences while
accumulated experience produces increasingly organised evaluative structure and identity-based judgement, arising
from learning history and never from an age unlock (§19).

### 18.5 Reference matching: Si as consistency with an internalised representation (Rex, 2026-11-01; proposed, a start, not built)

Rex's observation (2026-11-01, reviewed; "not the end of how this functions, but its start"): Si preserves
coherence with an **internalised representation of what something is supposed to be**: a role, a character, a
precedent. A child hears what a knight is, from stories, observed knights and social expectation, builds a
representation of knighthood, and organises behaviour around it. **It reproduces what it believes a knight is, never
what a knight objectively is** (§1: beliefs can be wrong), and that belief depends on what was experienced and how
the other functions interpreted it.

- **Proposed form:** `C_Si(a, R_i) = match(a, R_i)`, the degree to which a contemplated or observed action `a` fits
the mind's learned representation `R_i` of the relevant role, identity or precedent; and
`R_i(t+1) = update(R_i(t), O_t, I_t)`, the representation developing from new information `O_t` (observations,
testimony, §2.1, §2.3) as interpreted `I_t`, where **the auxiliary function shapes the interpretation**.
- **ISTJ (Si–Te) vs ISFJ (Si–Fe), proposed:** the same Si operation over the same role gives different outcomes
by the auxiliary: Te reads knighthood through explicit rules, duties, definitions and procedures (§18.2 Te), so
consistency is acting by the understood rules, and the rigidity is treating a rule as authoritative despite
changed circumstances; Fe reads it through social meanings, expectations and contextual interpretation (§18.1
meaning pools), so consistency is acting by the understood social meaning, often more strictly than any rule
states, and the rigidity is treating a socially constructed interpretation as authoritative despite conflicting
evidence. **Neither is correct by construction:** both can build inaccurate representations; they make different
kinds of interpretive error (Rex's doctor: a representation "a doctor cures sick people" meets a physician who
cannot cure one illness, and the mind either judges the physician incompetent or revises the representation; an
Ne-weighted mind may already hold that doctors do not know every method).
- **Refinement (Rex accepted): role consistency is one application of a general reference-matching operation**,
which also serves a remembered person, a familiar environment, a learned procedure, a social role, an expected
pattern of behaviour and a personal history. That is why Si reaches both memory (§16.2: physical detail, sensory
similarity) and behaviour without two mechanisms: both compare the present against an internally retained
reference.
- **Reference fidelity and reference authority are different variables (Rex, 2026-11-01):** three separate
quantities: `R_i`, the internal reference representation; `F_i`, confidence in the reference's accuracy; `A_i`,
the authority assigned to it. The Si matching operation compares behaviour against `R_i` only; Cognition's
existing belief system supplies `F_i` (§2.3, the belief's probability) and its motivation system supplies `A_i`
(§2.2 needs and goals, the weight of conforming). A mind may remember a knight's code accurately and consider it
unimportant; another may hold an inaccurate version as an absolute obligation. **Si is therefore never
automatically obedient, traditional or rigid.**
- **Si against Fi (Rex):** Fi may reject a role because it conflicts with the personal evaluative structure
(§18.4); Si may preserve a role because it matches the learned understanding of who one is supposed to be. A mind
can therefore strongly identify as a knight while personally disliking much of knighthood, and the tension emerges
without a script.
- **The coherence table so far (Rex; provisional):**

| Function | What it attempts to preserve |
|---|---|
| **Ti** | internal conceptual consistency (§18.4) |
| **Fi** | internal evaluative consistency (§18.4) |
| **Te** | external definitional and procedural consistency (§18.4) |
| **Fe** | external contextual and interpersonal coherence (§18.4) |
| **Si** | consistency with an internalised representation or precedent (this section) |
| **Ni** | **tentative:** consistency with an integrated underlying pattern or anticipated trajectory (open, C-Q24) |

Se and Ne are not yet given a coherence principle (C-Q24).

- **Test to design (Rex; level 5):** several simulated children receive different accounts of what a knight is
(formal rules; heroic stories; observing real knights behaving imperfectly), develop through experience (§19), and
are later placed where the learned representation conflicts with reality; measure which aspects of the role each
function configuration preserves, reinterprets or abandons; with `F_i` and `A_i` separate, the experiment also
tells apart a mind preserving an inaccurate representation from one that understands the role accurately and
deliberately rejects it. It runs after the S1 and ledger chains, as a later test of Si with Te, Fe, Fi and
accumulated experience. **Si does not preserve the past; it preserves an interpretation of the past, which can
be wrong.**

## 19. Developmental cognitive functions (Rex, 2026-10-31; planned, personality layer; not built)

Rex's direction (ENGINES.md, "Developmental cognitive functions"). It extends §9's dynamic allocation with development
over a life. **It does not interrupt the baseline or T-1/T-2 (Rex).** Versioned formulas under §9's rules; nothing is
built.

- **All four functions of a type's stack are present and available from birth (Rex).** What differs is the attention,
  experience, practice and learning each receives through life. **No hardcoded ages, maturity thresholds or unlocks.**
- **The hierarchy sets the speed of development and where focus is spent, never whether a function exists (Rex).** The
  dominant gets the greatest early allocation and develops fastest; the auxiliary develops to support it; the tertiary
  later, assisting the first two; the inferior is the last to be substantially integrated, yet present and usable at
  any age. Learning is more pronounced for data relevant to the first function, then the second, less for the third and
  fourth.
- **Four separate quantities per function `f` (Rex; forms provisional, not laws):**
  1. baseline attention preference `B_f` (the light; §9 "Dynamic function allocation"; existing);
  2. active allocation `A_f(t)` (§9, the same paragraph; existing);
  3. accumulated function-relevant experience `E_f(t+Δt) = E_f(t) + A_f(t)·R_f(t)·Δt`, with `R_f` the availability and
     relevance of learning opportunities in the situation (registry quantity `mind.function_experience`, planned);
  4. developed competence `C_f(t) = C_f,0 + k_f·log(1 + E_f(t))`, diminishing returns (registry quantity
     `mind.function_competence`, planned; `k_f` and `C_f,0` are versioned constants, sourced or marked crude). Both are
     written by the planned row `cognition.personality.function_development` (registered 2026-10-31);
     `cognition.personality.function_allocation` keeps `A_f` and reads competence as `L_f`.
- **Feedback (Rex):** competence feeds back into future allocation (it is the `L_f` term of §9's `A_f(t)`), so two
  people with one hierarchy diverge by environment: an ESTP raised on abstract planning develops more Ni facility than one
  rewarded for immediate action. **The baseline `B_f` never changes.**
- **Invariant (Rex):** cognitive competence ≠ domain knowledge ≠ learned skill ≠ intelligence. A developed Ti with little
  mathematics, or much mathematics reached by other strategies, are both possible. Development never substitutes for the
  learning system (§2.5, beliefs and episodes) or the skill system (reserved `cognition.skill.practice`, `mind.skill`;
  the K&T holder port's skill item stays separate, C-K3).
- **Test to design (Rex; level 5):** identical hierarchies in different environments give different trajectories of `E_f`
  and `C_f`; a null control with uniform `B_f` shows no hierarchy-driven ordering; no trajectory depends on age as such.
- **Open:** the sources and ranges for `k_f`, `C_f,0` and the form of `R_f` (C-Q20); how `C_f` enters `L_f` in §9's
  allocation and whether `E_f` decays without practice (C-Q21).

## 20. Social categorisation and learned group association (Rex, 2026-11-01; recorded design, not built)

Rex's direction, given to the Cognition keeper on 2026-11-01 (reviewed with ChatGPT; his words count as his).
**There is no prejudice equation and no prejudice engine.** Beliefs about groups of people come from the ordinary
pipeline: what a mind notices (§2.1), how it reads and attributes an experience (§2.5), what it stores and retrieves
(§2.3, §16) and what it hears from others (§2.3 testimony, §18 bubbles). The same mechanism yields prejudice, positive
stereotypes, professional reputations, cultural expectations, social trust and accurate distinctions. Groups are
§13a's characteristics applied to people, so this section specialises §13a mechanisms 1 to 4 and adds no gear.

### 20.1 Five stages, kept distinct (Rex)

| Stage | What happens | Where it lives |
|---|---|---|
| 1. Observe a characteristic | an accent, clothing or a community mark is a cue with relevance tag `group:g`; whether it is attended depends on `a_c` | §2.1 (`cognition.attention.allocate`) |
| 2. Encode an association | the episode stores the cues that were attended with the outcome | §2.3, §16 (`cognition.memory.episodic`) |
| 3. Attribute a cause | the candidate causes are the individual, the circumstance, the group and chance | §2.5 (`cognition.learning.attribution`, `cognition.preference.misattribution`) |
| 4. Generalise to the category | the mind's belief about the group's latent attribute moves | §2.3 (`cognition.belief.update`), §13a.3 (`cognition.preference.associative_learning`) |
| 5. Apply to another individual | the group belief becomes the prior for a new member of the group | §2.4 (`cognition.decision.evaluate`) through `P_theory` |

Membership is itself a belief: `(person, member_of) = g` is perceived from cues and can be wrong. A group is an
entity handle in the mind's beliefs (§2.3), so a group belief is an ordinary `(g, attribute)` belief and needs no
new quantity. The true attributes of individuals are host truth; the mind holds only its beliefs (§1).

### 20.2 The update (keeper, proposed)

Individuals sit inside groups as a two-level belief: each person `i` has a latent `θ_i` (e.g. honesty), and each group
`g` has a latent `θ_g` that sets the prior for its members (a hierarchical model, level 4). An outcome attributed to
`i` updates `θ_i` by §2.3's rule. It also updates `θ_g`, with the evidence tempered by the attention the group cue
received and the significance of the experience:

```
P'(θ_g) ∝ P(θ_g) · L(obs | θ_g)^(η · ã_g · S_e)        ã_g = a_g / max_c a_c ,  S_e ∈ [0, 1]
```

The form in Rex's note, `B' = B + α·A_g·S_e·(I(e) − B)`, is this same update for a real-valued belief: the Kalman form
of §2.3 with `σ_obs² / (η·ã_g·S_e)` gives `μ' = μ + K(x − μ)`, where `K` plays the part of `α·A_g·S_e` and `x` the
interpreted experience `I(e)`. There is one belief rule (§8), not a second learning rule. **The gate is attention:** a
group cue that was not attended (`ã_g = 0`) updates no group belief, whatever happened. Attribution remains a
read-out (§2.5): it reports whether the individual, the circumstance or the group moved most.

**Application.** A first encounter with a new person `k` sets the prior for `θ_k` as
`P(θ_k) = Σ_g P(k ∈ g | cues) · P(θ_g) + (1 − Σ_g P(k ∈ g | cues)) · P_0(θ)`. Evidence about `k` then individuates:
as `k`'s own episodes accumulate, `θ_k`'s posterior leaves the group prior. Nothing stops a mind from learning an
accurate group difference, overgeneralising from one case, or revising a belief after contrary experience.

### 20.3 Expectation-driven attention (Rex; proposed, level 5)

A confident group belief raises the pertinence of the cues that bear on it. When a mind believes group `g` is
dishonest, a member's dishonest act gets more attention than the same act by someone else, and contrary acts may get
less. Form (proposed): `π_j` gains a term `ρ · c_g · rel(j, θ_g)`, where `c_g = 1 − H(P(θ_g)) / H_max` is the belief's
confidence and `rel(j, θ_g)` is how strongly cue category `j` bears on the latent. The asymmetry for contrary evidence
is open (G-Q1). This is how a belief can reinforce itself without any scripted outcome (illusory correlation, Hamilton
& Gifford 1976; confirmation bias, Nickerson 1998; level 5 as a model). `ρ` has no source yet (G-Q1).

### 20.4 Transmission (with §18 and Society)

Group beliefs also arrive as testimony (§2.3, weighted by `cognition.communication.credibility`) and through the
bubbles a mind lives in (§18): a town's view of a faction spreads by talk and reputation, persists across
generations and weakens through individual experience. Society owns the network and the norms (DUP-60); Cognition
owns each mind's beliefs and their update. Society never writes a belief.

### 20.5 The eight functions (Rex; hypotheses, parameters of the one mechanism)

The functions change **how each stage runs**, never whether a mind becomes prejudiced or immune. No function is
inherently more prejudiced; outcomes depend on exposure, interpretation, learning, transmission and correction.
Memory belongs to the whole mind (§16.2), so an Se-weighted mind can hold a lasting group belief.

| Function | Proposed route (Rex) | Hook it would act through (§9) |
|---|---|---|
| **Si** | compares an observed person with remembered experiences or internalised representations; repeated association (§18.5 reference matching) | pertinence on group cues; learning |
| **Se** | weights the immediate observable characteristics and behaviour now; need not build the same lasting generalisation | pertinence on present physical cues |
| **Ti** | takes in a group claim if it fits its internal explanatory structure (§18.4 coherence) | interpret (testimony fit) |
| **Fi** | links a group, symbol or characteristic to personally significant positive or negative experiences | interpret (significance `S_e`) |
| **Fe** | learns how groups around it judge other groups (§18 bubbles) | learning from testimony and transmission |
| **Te** | adopts external classifications, rules and institutional descriptions | interpret (testimony from institutions) |
| **Ne** | generates alternative explanations, which may challenge or reinforce a generalisation | generate (alternative causes for attribution) |
| **Ni** | folds observations into an overall reading of a group or its intentions | learning (pattern across episodes) |

These rows are a later personality version. **F1–F13 (v1) stay frozen** during S1 to S6; nothing here changes them.

### 20.6 Function Activation Ledger (planned extension)

The ledger (`bench/diagnostics/`) records, per episode and per function group, the contribution to each stage: the
attention share given to group cues (`ã_g`), the attribution read-out (individual, circumstance, group or chance),
the KL of the group-belief update, and the group prior applied at a first encounter. It uses the existing processing
trace; there is no second logging system. Shared formulas overlap, so contributions are not additive (as in S1).

### 20.7 The experiment (Rex; planned, after S1 to S6 unless Rex releases it earlier)

**The merchant scenario.** Two communities of merchants with visible marks (accent, clothing). Two worlds:
(a) **equal truth**, where the honesty distribution is the same in both communities, so any group difference a mind
learns is an overgeneralisation; (b) **different truth**, where the communities differ, so learning the difference is
accurate. Every configuration sees the same individuals, events and seeds; only the cognitive configuration
changes (null, the 16 stacks under that later version, and sweeps of `η`, `ρ` and `S_e`).

**Measured, never asserted:** the group belief against the truth over time; the prior applied to a new member at
first encounter; individuation speed (episodes until `θ_k` leaves the group prior); the attention share on group
cues; the self-reinforcement loop (whether `ã_g` rises with confidence in `θ_g`); revision after contrary
experience; and the ledger's per-stage contributions. Classification uses the S1 rule (stable, context-dependent,
none). The T-1 controls apply: a randomised `θ` with the null personality, and hook outputs shuffled across functions.

### 20.8 Registry (audited 2026-11-01)

Reused with no new row: `cognition.attention.allocate`, `cognition.belief.update`, `cognition.memory.episodic`,
`cognition.learning.attribution`, `cognition.preference.semantic_representation`,
`cognition.preference.associative_learning`, `cognition.preference.misattribution`,
`cognition.communication.credibility`, `cognition.relationship.trust`, `cognition.decision.evaluate`, and Society's
transmission network (DUP-60). Group beliefs are ordinary `mind.belief` entries. If the registry wants this
application named, it is a note on `cognition.preference.associative_learning`, not a new mechanism.

### 20.9 Open

- **G-Q1:** `ρ` and the asymmetry for contrary evidence in §20.3: the form and the source.
- **G-Q2:** the significance `S_e`. The candidates are the prediction error `|δ|` scaled to [0, 1], the need priority
  at stake, or both. The source is open.
- **G-Q3:** generalisation across nested and overlapping groups (a merchant who is also a foreigner and a woman):
  how the membership weights split. This is the same question as P-Q3.
- **G-Q4:** Rex to confirm §20.5's rows as his hypotheses, especially the Ne, Ni, Fe and Te rows, which came with this
  note.


## 21. Contextual meaning, private judgement and public expression (Rex, 2026-11-01; design review, recorded, not built)

Rex's brief (2026-11-01, reviewed with ChatGPT; his words count as his). **Observation A:** a statement with a clear
operational definition may be read for its social implications instead (calling Ti "logical" heard as ranking
people). **Observation B:** an evaluator may privately judge that someone meets a criterion and still say something
weaker, because of what the stronger words would do socially. **Hypothesis:** contextual social meaning can shape
interpretation and expression, and can interfere with applying an explicit definition. **Principle (Rex):** never
create a behavioural trait when the behaviour can emerge from more basic operations. There is no
`selfLabelResistance`, no Fe rejection threshold and no rule that a type qualifies. The same machinery serves
compliments, insults, moral judgements, social roles, factual claims and descriptions of others, not only labels
about oneself.

### 21.1 Three stages, mapped to what exists (keeper's review)

| Stage | What it does | Home in this design | State |
|---|---|---|---|
| A. Semantic interpretation | what does this expression mean here? | §18 meaning pools: `cognition.communication.comprehend` resolves a word against `mind.meaning_pool` with context (speaker, relationship, situation, time and the listeners present) | designed (§18), quantities registered (planned), **not built** |
| B. Private evaluation | does that meaning hold, of me or of them? | §2.3 belief update on the resolved claim; the self-model is the mind's beliefs about its own handle plus §13a identity nodes (C-Q23, open) | belief update built; self-model **open** (C-Q23) |
| C. Response selection | what do I say, if anything? | §5 "the next utterance is a choice", through `cognition.decision.select`; content chosen by `cognition.communication.encode` | selection built; communication **not built** |

**Private and public are already two records.** A mind's belief (stage B) and the content of its utterance (stage
C) are separate. §2.3 already lets a speaker say what it does not believe, and an exposed lie costs it through the
listener's `r_j`. Nothing new is needed to let expression diverge from judgement. The trace must log both side by
side (§21.5).

### 21.2 Stage A: meaning as a distribution (Rex's analogy, proposed)

`P_i(m | L, c)` is mind `i`'s distribution over the candidate meanings `m` of expression `L` in context `c`: exactly
§18's pool with context-selected likelihoods. Several meanings may stay live until context shifts them ("loyal" as
obedience, affection, reliability or solidarity). This is a probabilistic reading of Rex's analogy, not a claim about
quantum cognition. The resolved interpretation is the distribution itself, `L_i(c) = P_i(· | L, c)`, built from the
pool `M_i`, the episodes in context `c`, the function allocation and the current beliefs. Those are the existing
inputs, not new state. An explicit operational definition is one more candidate meaning, introduced by testimony.
Whether it wins in a context is the same selection as any other meaning, so "definition versus social meaning" is
a competition inside the pool, never a mode switch.

### 21.3 Stage B: a context-indexed self, learned (proposed)

`S_i(c)` is the mind's belief about its own attributes in context `c`: ordinary §2.3 beliefs `(self, attribute@c)`,
the same context-indexing as `accepted@market` (§2.4) and the same two-level structure as §20.2. Each context's
self-belief is nested under a whole-person self-belief and updated from:
- the mind's own observed behaviour in that context (self-perception; Bem 1972, level 4);
- others' descriptions of it, as testimony weighted by `cognition.communication.credibility` (reflected appraisal;
  Cooley 1902, level 5).
**Variation across contexts is an outcome.** It is large only when behaviour and feedback really differ between
contexts and the update keeps them apart, and small when they agree. No type sets it (Rex). The functions act only
through the existing hooks: which cues and listeners get attention (pertinence), how readily contexts pool or
separate (interpret: `η` and the testimony fit of §18.4), and how meanings are selected or rebuilt (§18.2's
profiles). Two Fe-weighted minds with different histories end up with different variation. A Ti-weighted mind can
hold several context selves and organise them under one definition.

### 21.4 The two diagnostics (Rex's equations; keeper's choice of distance)

Both are **read-outs written to the trace, never read by any rule** (like attribution, §2.5).

```
D_i(L) = Σ_c w_c · d_c          d_c = 1 − Σ_m P_i(m | L, c) · P_i(self has m | c)
V_i(L) = ½ Σ_{c,k} w_c w_k · JS( P_i(· | L, c) , P_i(· | L, k) )
```

- **Distance (keeper).** Both sides are distributions, so no scalar distance is assumed. `d_c` is the mind's own
  probability that the label, as it reads it in context `c`, does not hold of it there. It uses one meaning space:
  each candidate meaning is an attribute node of §13a mechanism 1, so the self-belief can be asked about it.
  Between interpretations, `JS` is the Jensen–Shannon divergence (Lin 1991; base 2, bounded in [0, 1]).
- **Context weights from exposure, with overlap counted once.** Each retrievable episode `e` carries its weight
  `P_retrieve(e) · s_e` (§2.3, §16's salience). It is split equally over the `|C(e)|` contexts it belongs to:
  `w_c ∝ Σ_e P_retrieve(e) · s_e · [e ∈ c] / |C(e)|`, then normalised. A shared family-and-church dinner counts once
  in total, not once per group. Closeness enters through the episodes with close others (`cognition.relationship.trust`).
  The split rule is the keeper's (SR-Q3). `mind.bubble_exposure` (§18.3) is the record these sums are kept in;
  there is no second exposure store.
- **The four cases** of the brief (high or low `D` against high or low `V`) are therefore separable in a trace.
  Neither number drives behaviour.

### 21.5 Stage C: what is said (existing machinery)

The host's repertoire offers utterance acts (accept, reject, qualify, reinterpret, ignore), each with a content that
encode builds from the mind's private belief. Selection is the ordinary EU over each act's predicted outcomes. These
include the listener's predicted reaction (a naive model over the mind's beliefs about that audience: trust, status,
expected offence), the relationship episodes at stake, and the believed cost if a gap between the said and the
believed is exposed (§2.3). **No distance threshold maps to a response.** Partial fit makes "qualify" more likely only
when its predicted outcomes are better. The same private belief can therefore be stated plainly before a friend,
qualified before a rival and denied before an authority, and the trace says which stage made the difference.

### 21.6 Function Activation Ledger (planned extension)

Per statement and mind, the trace records stage A's `P_i(· | L, c)` and `V_i`; stage B's self-belief prior and
posterior, the KL and `D_i`; and stage C's candidate utterances with the EU split into accuracy-related and
audience-related outcome terms, the chosen act and the **gap** between the believed claim and the expressed claim.
The ledger attributes changes per stage and per function group as in S1 (overlapping groups; not additive).
Everything goes in the existing processing trace, with no second log.

### 21.7 Experiments (Rex; planned, after the communication subsystem exists and after S1–S6)

- **A, audiences.** The same evidence and statement are given to every configuration. A private evaluation comes
  first, then a public answer before a supportive friend, a competitive colleague and an authority. Measure which
  stage moved: interpretation (`V`, `P(m)`), evaluation (`D`, the self or other belief) or expression (the gap).
- **B, histories.** Identical function allocation with different exposure histories. Does contextual self-variation
  differ? This tests that it is learned, not typed.
- **C, definition against social meaning.** A term with an explicit definition is placed among bubbles where it
  carries other meanings. Record whether the definition is kept, the meaning shifts, several stay live, or only the
  expression changes.
- **D, overlap.** Independent contexts are compared with contexts that share members. With the split rule, shared
  episodes must not raise their contexts' combined weight.
All are measured and never asserted. They use the S1 classification rule and the T-1 controls. F1–F13 stay frozen.

### 21.8 Exists, proposed, missing; registry

- **Exists (built):** belief update with conservatism, testimony and credibility weighting (§2.3); episodes and
  retrieval (§2.3); EU and selection (§2.4); the trace and the ledger (`bench/diagnostics/`).
- **Designed, not built:** meaning pools and bubble exposure (§18; `mind.meaning_pool` and `mind.bubble_exposure`
  registered, planned); comprehend and encode (§5); conversation state (§5); the §18.4 coherence primitive;
  `cognition.relationship.trust`.
- **Missing, and decided here as proposals:** context-indexed self-beliefs (§21.3, ordinary beliefs, no new store);
  the diagnostics `D` and `V` (trace fields only); the overlap split for `w_c`.
- **Registry:** no new mechanism and no new quantity. If the registry wants the diagnostics named, they are
  documented outputs of `cognition.communication.comprehend` (V) and `cognition.belief.update` (D), not rows that
  write state.
- **Order:** the experiments need §5's comprehend and encode and §18's pools built first. That is the real gap, and
  it is a build the controller releases, not part of the current scenarios.

### 21.9 Open

- **SR-Q1 = C-Q23:** which structure is the self-model. This design assumes the keeper's proposal: beliefs for
  traits, identity nodes for memberships.
- **SR-Q2:** the shared meaning space, meaning how candidate meanings map to §13a attribute nodes; this is tied to P-Q1.
- **SR-Q3:** the overlap split (equal shares per episode) and the form of the context-self pooling (§21.3); both are
  the keeper's proposals.
- **SR-Q4:** which audience features the utterance's naive model reads. The host offers them as beliefs; the list is
  open.

## Sources (to be confirmed and expanded by each unit)

Anderson & Lebiere 1998, *The Atomic Components of Thought*; Anderson & Schooler 1991, *Psychological Science* 2;
Baker, Saxe & Tenenbaum 2009, *Cognition* 113; Bratman 1987, *Intention, Plans, and Practical Reason*; Bundesen
1990, *Psychological Review* 97; Bundesen, Habekost & Kyllingsbæk 2005, *Psychological Review* 112; Cohen &
Levesque 1990, *Artificial Intelligence* 42; Edwards 1968, in *Formal Representation of Human Judgment*; Erev et
al. 2010, *Journal of Behavioral Decision Making* 23; Gonzalez, Lerch & Lebiere 2003, *Cognitive Science* 27;
Gonzalez & Dutt 2011, *Psychological Review* 118; Green & Swets 1966, *Signal Detection Theory and Psychophysics*;
Kahneman & Tversky 1979, *Econometrica* 47; Kelley 1967, *Nebraska Symposium on Motivation*; Keramati & Gutkin
2014, *eLife* 3; Luce 1959, *Individual Choice Behavior*; Macmillan & Creelman 2005, *Detection Theory*; Matthews &
Tye 2019, *Nature Neuroscience* 22; Rubin & Wenzel 1996, *Psychological Review* 103; Tversky & Kahneman 1992,
*Journal of Risk and Uncertainty* 5; Wixted & Ebbesen 1991, *Psychological Science* 2.

## Log

| Date | What |
|---|---|
| 2026-10-30 | Lane opened (Rex's directive); design drafted for approval; units 2659… drafted behind the marker |
| 2026-10-30 | Kernel, Reality and registry keepers replied: C-K1, C-K2, C-R1, C-G1 agreed (kernel unit 2660; rows and quantities registered as planned; `body.detectability` rename); C-R2 (appetite and eating rule) raised for Rex |
| 2026-10-30 | Rex's direction on the personality layer folded into §9: crude cited formulas F1–F13, gaps off, codex fingerprint check, versions side by side, T-2 derived traits; units 2673–2676 |
| 2026-10-30 | **Approved by Rex** (C-Q1–C-Q8 as proposed, C-Q4 kept, crude-formula plan); §2.2 amended with the universal motivational architecture (`M_i = w_i D_i S_i`, needs as data, Maslow as classification only); marker 2659 released |
| 2026-10-30 | §13 attraction and partner selection placeholder (Rex, via the controller): boundaries, invariants, open A-Q1–A-Q6; nothing built or registered |
| 2026-10-30 | §13 refinements (Rex): preference vs weight, two social-influence pathways, the divergence experiment |
| 2026-10-30 | §13 style and presentation (Rex): presentation choice and observer interpretation are Cognition's; goods Economy's, meaning Society's |
| 2026-10-30 | §13 reframed as general preference learning (Rex): 13a mechanisms 1–6, baseline `A = Σ P·X̂`, malleability classes with sexual orientation fixed; attraction becomes 13b, the first application |
| 2026-10-30 | Units 2670/2671 parked honestly; keeper rulings C-B1 (CB-3 censoring, `r_obs` definition, CB-6a transported streams, CB-7 λ combined, bench out of the gate, V1 criterion and the 210/105 count); C-V2 V2 failure recorded |
| 2026-10-30 | Unit 2700: CB-1 to CB-5 pass, V1 passes (2701). Rulings C-B2: CB-6b belongs to the check unit; CB-7 λ restated as its evaluation-level consequence, population effect reported |
| 2026-10-30 | DUP-49 recorded (unit 2720): four-owner split — Reality (hunger, satiety, taste perception, digestion and physiological responses); Cognition (food preferences, anticipated enjoyment, appetite-related motivation, the decision to eat); Society (cultural food norms, taboos and learned expectations, unowned until Society exists); the pirate game (period-specific foods, presentation and intentional gameplay rules) |
| 2026-10-30 | Rex's two directions (dynamic function allocation, the light and the crystal, §9; cultural salience and the zeitgeist, §13b) were recorded as proposed by unit 2721, not built, C-Q11 open |
| 2026-10-31 | Rex's conversational-plausibility direction recorded in §5 as proposed by unit 2734, not built, C-Q12 open |
| 2026-10-31 | Fixture inline labels (COG-22) and the conversation-state writer row recorded (unit 2735). |
| 2026-10-31 | C-Q12 decided by Rex (tolerance derived, shared context a per-mind belief), recorded in §5 and §12 (unit 2736); planned, nothing implemented. |
| 2026-10-31 | Rex's five directions recorded as §14 (memory below personality, gaze, intermittent characters, features and names, lasting drug effects); 'personality weights' wording corrected to descriptive; C-Q13 to C-Q15 open (unit 2737). Not built. |
| 2026-10-31 | §14.1 memory writer split (keeper proposal) and §15 contract fields for the 13 built rows recorded (unit 2739; COG-33). |
| 2026-10-31 | Rex's experience pipeline and memory profiles recorded as §16 (perception filter → encoding → chemical response → re-interpretation; memory as stored / retrievable / articulable; function profiles; stack interaction); C-Q16, C-Q17 open (unit 2746). Not built. |
| 2026-10-31 | §8 gains Reality's `body.transmitter_levels` and `body.hormone_levels` (planned, absent until researched) and the outputs `mind.appraisal` / `mind.recalled_body_state` for §16 (unit 2747). |
| 2026-10-31 | §17 knowledge of history (Rex: History is the backend record, never read in-world; four fallible routes as planned rows; `mind.inferred_past`); §13b names `shared.presentation.set` as Cognition's composition row (unit 2774). Not built. |
| 2026-10-31 | Seams recorded: DUP-60/DUP-61 (C-S1, C-S2), the K&T holder port (C-K3), the Society affordance port (§2.4, C-Q6 answered pending the controller), `mind.source_credibility` (§2.3), backend records never read by a mind (§1) (unit 2804). |
| 2026-10-31 | §18 semantic systems recorded (Rex: meaning pools, selection vs reconstruction, bubble exposure, Fe/Ti/Te/Fi profiles as hypotheses; keeper's attachment to comprehend/encode); C-Q18 answered by Rex (both, by familiarity of the bubble), C-Q19 open with a frame offered; exposure depth and who-is-present context added (unit 2817). Not built. |
| 2026-10-31 | §18 amended (Rex): perceiving-function roles accepted provisionally, not an exclusive boundary; C-Q18 selection by bubble similarity, reconstruction also within a conversation (unit 2820). |
| 2026-10-31 | §19 developmental cognitive functions recorded (Rex: all four stack functions from birth, no age unlocks; hierarchy sets speed and focus; E_f and C_f with feedback into allocation; competence ≠ knowledge ≠ skill ≠ intelligence); C-Q20, C-Q21 open (unit 2896). Not built; does not interrupt the baseline or T-1/T-2. |
| 2026-11-01 | §18.4 Ti/Fi shared compatibility primitive recorded (Rex: one coherence operation, two criteria; Fe by contextual integration; general mechanism of §13; outfit test); C-Q22 answered by Rex (two levels, identityFit term, self-model never a separate store), C-Q23 open; §18.5 Si reference matching recorded (Rex: C_Si = match(a, R_i), R_i updated through the auxiliary's interpretation; ISTJ/ISFJ contrast; knight test), C-Q24 open (unit 2921). Not built. |
| 2026-11-01 | §20 social categorisation and learned group association recorded (Rex: no prejudice equation; five stages; attention-gated group-belief update as the one belief rule; expectation-driven attention; eight-function routes as hypotheses; merchant experiment; registry audited, no new row); G-Q1 to G-Q4 open (unit 5277). |
| 2026-11-01 | §2.4 payment acceptance recorded (multi-economy v2, Cognition amendments 1–5; asset value = direct usefulness + one-step expected exchangeability inside r(o); exchange candidates; derived ratioMin by bisection; fence; tests a–d); PA-Q1, PA-Q2 open (unit 5294). |
| 2026-11-01 | §21 contextual meaning, private judgement and public expression recorded (Rex's brief; keeper's design review: three stages mapped to §18, §2.3, §5; context-indexed self as ordinary beliefs; D and V as trace-only diagnostics with JS and expected-fit distances; overlap split per episode; experiments A–D after the communication build); SR-Q1 to SR-Q4 open (unit 5321). |
