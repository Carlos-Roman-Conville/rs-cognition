# Cognition: design (P7 baseline, Cognition keeper, 2026-10-30)

**Status: proposed, awaiting Rex's approval.** Nothing is built. The belt units in
`Games/Card Games/_agent/queue/cognition/` all wait on the marker unit 2659 (`cognition-design-approved-by-rex`).

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
| Hunger's body side: energy stores, appetite physiology | Reality, nutrition (`realism.nutrition.hunger_fullness`, documented-only today) | a hunger signal port; **Cognition owns the felt need and its priority** |
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

**Felt needs.** Each need `k` has an internal deficit `h_k ∈ [0,1]` and a setpoint `h*_k` (0 unless configured).
Species configuration lists the needs and weights; the baseline human set (proposed): hunger, safety, social
connection; others (thirst, warmth, rest, sex) are configuration rows added when their signals exist.

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
**Priority** of need `k` = its share of the drive gradient, `priority_k = (∂D/∂h_k) / Σ_j ∂D/∂h_j`; it feeds
attention pertinence (§2.1) and is reported in every decision trace.

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
exposed lie lowers `r_j` (§2.5): deception has consequences through beliefs, not through a rule.

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

**Evaluation (expected value of drive reduction; level 4, loss aversion level 2).**

```
EU(a) = γ^(dur_a − 1) · Σ_o P̂(o | a, c) · v( r(o) + Σ_g V_g Δp_g(o) − cost_a )
v(x) = x if x ≥ 0, λ·x if x < 0
```

`r(o)` is the predicted drive reduction (§2.2) after the outcome's predicted changes to needs; `λ` loss aversion
(Kahneman & Tversky 1979; Tversky & Kahneman 1992 median ≈ 2.25, level 2); `γ` the per-epoch discount (exponential;
hyperbolic is an alternative to test, open). Lookahead is **one action deep** in the baseline: multi-step plans
appear as multi-epoch actions (work) and as learned values; deeper planning is a later mechanism (open C-Q8).

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
2. **Prediction error.** `δ = r_obs − EU(ι)`: recorded on the episode and in the trace.
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
| CB-3 consequences | every intention gets exactly one outcome event whose `cause` is its id, and the outcome changes at least one need or one belief |
| CB-4 belief update | after each informative outcome the belief it bears on moves (KL > 0) in the direction its likelihood implies (verification) |
| CB-5 later decisions change | (a) when `δ < 0` for action `a`, `EU(a)` in the same context is lower at the next evaluation, all cases; (b) with common random numbers, runs with learning on vs frozen (`η = 0`, no encoding) diverge after the first informative outcome in a stated share of seeds, reported |
| CB-6 no script | (a) A and B with identical parameters have statistically indistinguishable action distributions over 500 seeds (χ², p > 0.01), and swapping their ids swaps their traces exactly; (b) the fixture and the engine contain no branch on an agent id or parameter value that picks an action or an outcome (a Haiku check unit reads the code); (c) across seeds the default-parameter runs show more than one action sequence |
| CB-7 controlled comparisons | for each θ dimension, paired runs differing only in it over 200 seeds with common random numbers, reported as action frequencies and outcomes with 95 % intervals; direction checks the mathematics implies: higher `λ` → fewer fight and steal choices; higher `β` → lower choice entropy; higher `κ` → fewer intention switches; higher `d` → a smaller effect of an early loss on late choices |
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
| hunger signal | 1 (0–1) | `realism.nutrition.hunger_fullness` documented-only | **agreed:** Reality writes `body.hunger_signal` (fullness and hunger stay Reality's signals, built later from gut and energy state); Cognition reads it as the deficit and writes only the felt drive and priority, which never feed back a second physiological effect. Thirst, cold and pain (`body.pain`, written by `realism.medicine.pain`) by the same pattern; for sleep, the **single** sleep-pressure quantity DUP-12 settles on (proposed: neurology's adenosine pressure), never `body.sleep_debt` as well. **New overlap (Reality → registry → Rex):** `nutrition.json`'s `appetite` (hunger × palatability × state) and `eating-rule` (eat if appetite > 0.3 or hunger > 0.8) are decisions, duplicate authority with Cognition's drive and selection; proposed owner Cognition (eating is an action evaluated like any other; palatability a taste percept Reality may keep), the rows becoming restatements; nothing moves until Rex approves (C-R2) |
| functional capacity | 1 (0–1 per action class) | DUP-15, planned | Reality writes `body.capacity_functional`; generation reads it; Cognition never computes strength |
| mood and arousal bias | 1 | `realism.neurology.circuits` writes `body.circuit_outputs` | **not read in the baseline**; when read, as a modulation of `β`, `λ` or pertinence that Reality's row defines, never a second mood model |

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
| V1 forgetting | retention as a function of delay from the memory mechanism alone | Rubin & Wenzel 1996 (105 retention data sets, power and related functions); Ebbinghaus 1885 savings | the fitted power exponent of simulated retention lies within the published range for comparable materials |
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
| C-Q3 | "Light and crystal" | **(Rex, 2026-10-30)** not written yet; open until he writes it into the matrix; never invented |
| C-Q4 | The personality layer switches on only after CB-1…CB-7 pass on the null model | **(Rex, 2026-10-30)** kept; crude formulas written now (§9) |
| C-Q10 | §9 v1 formulas F1–F13 and their crude constants (linear ω, N½ = 10, r = 1.5, K = 3, the /2 factors); what is off | Rex (each traces to his line) |
| C-Q5 | Baseline need set: hunger, safety, social connection | Rex |
| C-Q6 | The baseline has **no internalised norms**: lying and stealing cost only what their consequences cost (beliefs, retaliation); norms arrive with Society and personality | Rex |
| C-Q7 | V2 needs the Technion Prediction Tournament data (public, Erev et al. 2010); the unit fetches it, or Rex downloads it if the belt cannot | Rex if fetch fails |
| C-Q8 | One-action lookahead in the baseline; planning later | Rex |
| C-Q9 | Mistaken identity (beliefs keyed by the mind's own handles) deferred | proposed |
| C-K1 | Per-mind RNG streams | **agreed 2026-10-30**: `get(mechanismId, entityId)`, kernel unit 2660 (§7) |
| C-K2 | `cognition` and `host` phases | **agreed 2026-10-30**, kernel unit 2660 (§7) |
| C-R1 | Port names and the hunger boundary | **agreed 2026-10-30** with Reality and the registry; `percept.detectability` renamed `body.detectability` (§8) |
| C-R2 | Appetite and the eating rule (nutrition.json) move to Cognition as decisions; fullness and hunger stay Reality's signals | Rex (a new overlap group, raised by Reality to the registry keeper) |
| C-G1 | `mind.` scope, 13 rows, 5 reserved rows, 14 quantities + `mind.testimony` | **registered 2026-10-30** (planned); DUP-46's owner still Rex's in batch 5 |

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
