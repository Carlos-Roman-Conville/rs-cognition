# Cognition: PLAN.md (draft, Cognition keeper, 2026-11-02; awaiting Rex's approval)

**What this file is.** Cognition's one planning document under [`PLAN-SPEC.md`](../PLAN-SPEC.md). Per PLAN-SPEC §1 and
Rex (2026-11-02), Rex's `FUNCTION-DESIGN.md` *is* this plan: it is carried **verbatim** as Part B. The PLAN-SPEC frame
(pass 1 below, pass 2 in Part A) is added around it, and what it lacks is imported verbatim from
`Toolchain/cognition/DESIGN.md` (repo HEAD df0b6c0, DESIGN.md last changed 22e79fa, read with `git show HEAD:DESIGN.md`) as Part C, each section
marked with its source. Part D is the import map. Nothing in Part B is edited here; its working copy stays
`HQ/handoffs/function-design/FUNCTION-DESIGN.md` until Rex approves this file. HQ is not a repo; nothing is committed.

| Part | Contents |
|---|---|
| Pass 1 | one page: present, missing, owned, inputs, outputs, M1a role, evidence, assumptions, next task |
| A | PLAN-SPEC §1–§8 for the whole engine (pass 2), citing Part B and Part C |
| B | Rex's FUNCTION-DESIGN.md, verbatim (sha256 recorded in Part D) |
| C | imported from DESIGN.md: fence, perception, needs, beliefs and memory, decision and intention emission, the resolution contract (CG-16, IF-26, IF-27), learning, interfaces, registry rows, communication, benchmark, Kernel and Reality ports (neuroscience), V&V, open items, memory/neuroscience directions, contract fields, experience pipeline, knowledge of history |
| D | import map: every DESIGN.md section → imported, superseded (why) or reference |

---

## Pass 1 (one page, 2026-11-02)

**Role in M1a.** need → decision → intention → outcome perceived → the next decision changes. Hunger deficit read from
`body.hunger_signal` → drive and priority → candidates (acquire, eat, …) → EU → `cognition.intention` → the owning
engine resolves → `shared.action.outcome` → perceived stimuli (scene change; taste and gastric fill to the actor) →
episode, belief update, prediction error → later the falling hunger signal and the new episode change the next choice.
Cognition never decides success, never debits a stock, never moves the body.

**The boundary** (`src/process.ts:62`, `run()`): outcome events read by cursor and turned into perceived feedback by
the host's `readOutcome` (`:29–30`, `:67–83`); then per mind the host's `epoch()` supplies observations, need inputs,
`capacityFunctional` and context (`:7–13`, `:84–97`; perception itself runs host-side with the mind's stream, `:8`) → `observe`, `tickNeeds`, `decide` → `cognition.intention`
emitted. **Observations and needs in, intentions out, perceived outcomes back.** Nothing else crosses.

**Mechanisms present (built, CB-1..CB-7 PASS):** attention (`attention.ts:41`), SDT perception (`perception.ts:90`),
Bayes/Kalman/testimony beliefs (`beliefs.ts:107–205`), ACT-R episodes (`memory.ts:36`), needs and homeostatic drive
(`needs.ts:32`, `:93`), goals, generation (`actions.ts:110`), EU evaluation (`evaluate.ts`), softmax + commitment
(`select.ts:54`), learning and attribution (`learning.ts:155`, `:171`), payment acceptance (`valuation.ts:64`),
communication §5.1 (`src/communication/`), personality slot and V1 F1–F13 (frozen).

**Missing (confirmed):** (1) **intentions with no physical resolver:** `move`, `gather` (Reality), `eat` body side
(Life) (COG-50). Economy and Settlement sides landed (4192e27, 4831b5a, 7e49d3c); the host labour provider for
`work`/`refuse_work` is built (realism 4074843, fix 1008a49, `src/labour-intentions.ts`; IF-27 closed; REG-40). (2) The hungry pair eats by a **fixture trigger**, not a decision
(`bench/hungry-pair/world.ts:221–227`); its resolver is `world.resolve` (`:194`). (3) `capacityFunctional` is one
scalar (`process.ts:11`, `actions.ts:31`) where DESIGN §2.4 / DUP-15 specify a record of named capacities.
(4) `body.satiety_signal` and `body.taste_percept` not yet ports (writers unbuilt). **Missing (designed or planned):**
memory encoding/consolidation/retrieval split, `emotion.appraisal`, `skill.practice`, `planning.lookahead`,
`relationship.trust`, need interactions, urgency and allostasis (C-M1–C-M3). **Risk:** registry lists the §5.1
communication rows as `planned` though built (COG-60).

**Quantities owned:** `mind.attention_share`, `observation`, `belief`, `episode`, `retrieval_p`, `need_deficit` (felt),
`drive`, `need_priority`, `goal_progress`, `candidates`, `expected_utility`, `intention`, `prediction_error`,
`attribution`, `testimony`, `source_credibility`, `meaning_pool`, `conversation_state` (+ derived tolerance). All
invariants and update rules, none conserved (no mass or energy is Cognition's).

**External inputs:** `body.hunger_signal`, `body.pain`, `body.capacity_functional`, `body.detectability` (Life's `realism.perception.detectability` from Reality's `world.signal_at_point`; host stubs
today), stimuli, outcome events, repertoire and affordances (host data; IF-46), testimony, kernel time and streams.
**Outputs:** `cognition.intention` (with `terms`), `cognition.attribution`, decision traces (to become the
`cognition.decision` event, M1a-27), `world.message`; planned
`mind.appraisal`, `mind.recalled_body_state` to Reality.

**Evidence and validation:** V1 forgetting PASS; **V2 learning-and-choice FAIL** (trial-MSD lower bound .00527 >
1.5 × IBL .0005; C-V2), reported, never tuned; V3, V4 verification; V5 no data. Most forms level 4–5.

**Flagged assumptions:** M = w·D·S (level 4); Keramati n = 4, m = 3; θ_pre = 0.5; ε_attr = 1e-6; pool α = 1;
one-step lookahead (C-Q8); fixture world (C-Q1); scalar capacity.

**Eight-function work: experimental, does not block M1a.** V1 frozen; V2 foundation built in `experimental/`
(5441–5452, 5463, 5468); **Ni unbuilt** (C-Q24, Ni-Q1); **5444 (Ti/Fi coherence) and 5445 (Si) held** (Ti-Q1, Fi-Q1,
Coh-Q1, Si-Q2); Ti experiment 5470 queued behind STOP. The null personality is the M1a configuration.

**Review adopted (Rex, 2026-11-02; A.9):** lanes CN-1–CN-8; first the CN-1, CN-5, CN-7 contracts, then CN-8's
eating test. Learning reuses the predicted category value (COG-75, C-Q29); per-epoch discount and unmapped cost
(COG-76, C-Q30, C-Q31); believed vs actual capacity (C-Q32). Senses: one attention budget, decision-time information
only; M1a uses fixture oral feedback; preference waits for CN-7.
**Contracts (A.10, keeper's proposals):** CN-1 (hunger as built; satiety an observation, C-Q33), CN-5 (generation reads
believed capability only), CN-7 (consequence beliefs learned from observed, attributed signal changes; the control
experiment); C-Q30 discount e^(−ρT) (COG-76), C-Q31 effort valuation in utility/J (COG-77).
**Accepted (Rex, 2026-11-02) with three amendments; executable forms in A.11:** consequences as a joint Kalman
regression over background and act kinds; capability from perceived failure by a declared Bayesian rule; zero pressure
keeps base attention; time is physical (diffusion noise), joint covariance kept, technical failures settle the
intention. Next: four executable tests on labelled hunger fixtures (A.11.4), not a validated bodily loop.
Implementation waits only for the interface agreements (A.11.5).
**C-G3 (A.12, keeper's bounded proposal under Rex's release, 2026-11-02):** five sourced grounds as Beta beliefs
(procedure, promise kept, subsistence left, others comply, breaches enforced), a declared weighted read-out into
`ought_obey:<domain>`; mechanism tests only, no test requires legitimacy to fall; M5, off M1a's path.

**Next dependency-ready task (after approval; nothing queued now):** M1a on Cognition's side: `eat` as a repertoire
action decided like any other, resolved through `shared.action.resolution` by Life's eat resolver (a labelled fixture
stub of the same signature until Life lands it), replacing the fixture trigger; paired provisioned/deprived seeds.
Depends on Life (eat resolver, DUP-15 capacity record) and the registry's map.

---

# Part A: the plan, PLAN-SPEC §1–§8 (pass 2, 2026-11-02)

**Citation convention.** `B/§n` = Rex's FUNCTION-DESIGN.md section n (Part B, verbatim). `C/§n` = DESIGN.md section n,
imported verbatim in Part C. `D/§n` = DESIGN.md section n left as reference in the repo (Part D says why). File
references are to `Toolchain/cognition/` at HEAD df0b6c0. Status words follow the repo, never the design (COG-64).
Every open item keeps its existing id; this plan adds no new question ids. New defects found while writing are COG-73
and COG-74 in `ISSUES.md`.

**Lanes.** The baseline is organised in lanes CN-1–CN-8 (A.9, Rex 2026-11-02).

**Two tracks.** The **baseline track** (perception → needs → beliefs and memory → decision → intention → learning,
with the null personality) is what M1a–M5 need. The **eight-function track** (Part B: V1 frozen, V2 experimental, the
Ti experiment, S1–S6) is a hypothesis programme that modulates the baseline through four hooks only (C/§3). It runs
beside the ladder and never blocks a milestone; every milestone runs with `nullPersonality`.

## A.1 Purpose and boundaries

**What Cognition determines.** What an organism **attempts**: from perceived conditions, felt needs, beliefs and
memory it forms intentions, and from the perceived results it learns (C/§0, `a_t = π(o_t, m_t, n_t, p)`). It keeps the
objective world apart from the mind's subjective interpretation (C/§1): truth touches a mind only at the sensory
boundary, as stimuli turned into fallible observations.

**What it receives.** Observations (from stimuli the host or Reality supplies with their detectability), body signals
through ports (hunger, satiety, pain, functional capacity, later transmitters and hormones), host-data repertoires and
social affordances, testimony (messages), outcome events caused by its own intentions, kernel time, ids and streams
(C/§7, C/§8, A.4).

**The boundary in code.** `src/process.ts:62` `run()`: (1) outcome events read by cursor; the host's `readOutcome`
returns **perceived** observations, never raw results (`:29–30`, `:67–83`); (2) per mind, the host's `epoch()`
supplies observations, need inputs, `capacityFunctional` and context (`:7–13`, `:84–97`); (3) `observe`, `tickNeeds`,
`decide`; (4) `cognition.intention` emitted. Observations and needs in, intentions out, perceived outcomes back.

**What it must never calculate** (owned elsewhere; C/§0 table, C/§2.4 resolution table):

| Never Cognition's | Owner |
|---|---|
| whether an attempt succeeds; any stock, transfer or world state | the resolver for the action kind (Reality move/gather; Life eat; Economy buy/sell/consume; Settlement with Economy work; Society social acts; Government violations) |
| physiological signals: hunger, satiety, taste percept, pain, fatigue, capacity, chemistry | Life / Reality (DUP-49, DUP-15; C/§8) |
| light and sound at the observer (`d'`) | Life, `realism.perception.detectability`, from Reality's `world.signal_at_point` (DC-12); host stub until then |
| norms, sanctions, institutions; network ties; legal tender; acceptance shares | Society, Government (they reach minds only as observations and testimony; C-Q6, C-S1, DUP-60) |
| collective knowledge stock; the history record | Knowledge, History (no mind reads `knowledge.*` or `history.*`; C/§1, C/§17, C-S2) |
| time, ids, RNG, events, replay | Kernel (C/§7) |
| behaviour assigned to a type; motivations manufactured by personality | nobody: forbidden (C/§2.2, CTRL-7, B/§1) |

## A.2 State

All Cognition state is per mind, subjective, in one reducer state `MindsState` (C/§4; `src/mind.ts:54`). **None of it
is conserved**: no mass, element or energy is Cognition's. Each quantity has an invariant and an update rule instead.

| Quantity | Unit / range | Meaning (behavioural) | Kind: invariant and update rule |
|---|---|---|---|
| `mind.attention_share` a_c | 1, [0,1], Σ_c = 1 per mind per tick | share of limited capacity on cue c | invariant: sums to 1 (0 cues → none); recomputed each tick (C/§2.1) |
| `mind.observation` | record | reported value + the mind's own reliability model; null observations | never carries a true value (fence test); appended per tick |
| `mind.belief` | categorical P vector / Gaussian (μ, σ²) / P(exists) | the subjective world, may be false | invariant: normalised, σ² > 0; Bayes with inertia η, drift between observations (C/§2.3) |
| `mind.episode` | record | lived experience: context, action, outcome, reward, δ, cause | append-only; activation by ACT-R (C/§2.3) |
| `mind.retrieval_p` | 1, (0,1) | probability an episode comes back | derived from activation each use |
| `mind.need_deficit` (felt) | 1, [0,1] | felt degree of unmet need | read from a signal, appraisal or accumulator (C/§2.2); throws on missing input (`needs.ts:26–29`) |
| `mind.drive` | 1, ≥ 0 | homeostatic drive D(h) | derived; reward = drive reduction |
| `mind.need_priority` | 1, [0,1], Σ = 1 | motivational share M_i / Σ M | derived each tick |
| `mind.goal_progress` | 1, [0,1] | host standing goals' progress | host-supplied; reward V_g Δp_g |
| `mind.candidates` | record | actions believed feasible now | rebuilt per decision |
| `mind.expected_utility` | utility units (drive-reduction scale) | EU(a) | derived per decision |
| `mind.intention` | record (id, action, target, terms, expected outcomes) | the committed attempt | one active per mind; kept while advantage ≤ κ; settled once by its outcome |
| `mind.prediction_error` δ | utility units | r_obs − EU(ι) | per outcome |
| `mind.attribution` | record | latent blamed, or "chance" | read-out of the belief update, never a second update |
| `mind.testimony` | record | pending received claims | settled by later direct observation |
| `mind.source_credibility` r_j | Beta(α, β), mean in [0,1] | trust in a speaker's reports | +1 α / +1 β per settled claim (C/§5.1) |
| `mind.meaning_pool` | counts n_{m,b} ≥ 0 | candidate meanings per term per bubble | reinforcement +1; reconstruction adds 1 count |
| `mind.conversation_state`, `believed_shared_context`, `engagement_willingness`, `conversation_tolerance` | record; 1, [0,1] | per partner; tolerance derived, cacheable, never a bar | C/§5.1 |
| cognitive parameters θ | see A.5 | individual, not personality | configuration; never tuned to an outcome |
| personality V1/V2 state | Part B §10, §11 | experimental track only | null in every milestone |

Planned, not built (registry rows exist, `planned`): `mind.memory_durability`, `mind.appraisal`,
`mind.recalled_body_state`, `mind.process_baseline`, `mind.gaze_hypotheses`, `mind.inferred_past`,
`mind.function_allocation`, `mind.skill`.

## A.3 Mechanisms (each a complete chain: input from → computes → output changes)

The equations are in Part C verbatim; this table is the chain and its domain. "Stops applying" names where the form is
no longer claimed.

| # | Mechanism (row) | Input from | Computes | Output changes | Stops applying |
|---|---|---|---|---|---|
| 1 | attention (`cognition.attention.allocate`, C/§2.1) | stimuli (host / Reality), need priority (#5) | TVA weights w_c, shares a_c | which cues perception samples | capacity is one shared pool; no eye movement or gaze (C-Q14) |
| 2 | perception (`perception.detect`, C/§2.1) | `body.detectability` d' (Life), a_c, criterion k, stream | SDT hit / false alarm; identification; Weber noise | `mind.observation` (+ null observations) | equal-variance SDT; d' already includes sensory capacity (DUP-37) |
| 3 | belief update (`belief.update`, C/§2.3) | observations, testimony with r_j | Bayes^η, Kalman, existence; drift | `mind.belief` | entities by the mind's handles; no mistaken identity (C-Q9) |
| 4 | episodic memory (`memory.episodic`, C/§2.3) | outcomes, δ, context | ACT-R activation, P_retrieve; experience counts in P̂ | `mind.episode`, `retrieval_p`, prediction P̂ | one store; encoding / consolidation / retrieval split planned (C/§14.1) |
| 5 | needs and drive (`needs.drive`, C/§2.2) | `body.hunger_signal` (and later satiety), `body.pain`, safety belief, social accumulator, attended cues | felt deficit D_i, salience S_i, M_i = w·D·S, priority; D(h) | priority → attention pertinence and goals; drive → reward | no need interactions, urgency preemption or allostasis yet (C-M1–C-M3) |
| 6 | goals (`goals.objectives`) | host goals, outcomes | V_g Δp_g | reward term | host-supplied progress |
| 7 | generation (`decision.generate`, C/§2.4) | repertoire and affordances (host data; IF-46), beliefs, `body.capacity_functional` | candidates with believed preconditions ≥ θ_pre and capacity | `mind.candidates` | capacity is a **scalar** today (COG-73) |
| 8 | evaluation (`decision.evaluate`, C/§2.4) | P̂ (theory + experience), drive, goals, costs | EU with loss aversion and discount | `mind.expected_utility` | one-action lookahead (C-Q8) |
| 8a | payment acceptance (`valuation.payment_acceptance`, C/§2.4) | asset beliefs (accepted, rate, genuine), trust | V = D + E inside r(o); reservation ratio by bisection | EU of exchanges; `terms.ratioMin` | one exchange deep; P_fill independent of ratio (PA-Q1) |
| 9 | selection and emission (`decision.select`, C/§2.4) | EU, β, κ, stream | Luce softmax; commitment | `mind.intention`; event `cognition.intention` with `terms`; decision trace | — |
| 10 | resolution (not Cognition's; `shared.action.resolution`, C/§2.4) | intention + truth | status, stimuli, transfers in one transaction | `shared.action.outcome { cause }` | resolver per kind; **move, gather, eat unbuilt** (COG-50); labour provider built (realism 4074843, IF-27 closed) |
| 11 | learning (`learning.outcome`, C/§2.5) | outcome event with this mind's cause → perceived observations | δ; encode episode; latent belief update | beliefs and episodes (the only two channels to later choices) | no reward-to-action shortcut, by design |
| 12 | attribution (`learning.attribution`, C/§2.5) | belief before / after | max-KL latent or "chance" (ε_attr) | `mind.attribution` (read by Society later) | read-out only |
| 13 | communication (comprehend, credibility, persuasion read-out, encode, conversation state; C/§5.1) | `world.message_received` as a stimulus | meaning mixture → testimony; credibility; tolerance as P(stay) | testimony, r_j, pools, `world.message` | language competence, gaze, trust row not built |
| 14 | personality slot (C/§3) | MindView | identity (null) | nothing in milestones | V1 F1–F13 frozen; V2 experimental (B/§10, B/§11) |

**Planned mechanisms, with their chains** (designed, not built): memory stages and the experience pipeline (C/§14.1,
B/§5: attention → encoding detail vector → consolidation with sleep from Life → retrieval with cue-type weights →
articulation limit in encode); appraisal → Reality chemistry → interoceptive re-read (C/§8 outputs, B/§5.1 stages 3–4;
needs Reality's transmitter and hormone writers); substance adaptation (C/§14.5; C-Q15); history routes (C/§17);
preference learning and attraction (B/§9.1, D/§13); group association (B/§9.3, D/§20); contextual meaning (B/§9.4,
D/§21); legitimacy (B/§9.6, `HQ/handoffs/cognition/C-G3-DESIGN.md`; C-G2, C-G3a); skill practice (below); planning lookahead (C-Q8).

**Skill practice (`cognition.skill.practice`, reserved; KNT-7; DC-14; designed here as a chain, parameters open).**
Needed by M2: Settlement's `labour_cap` derives productivity from Life capacity and effort, Reality task demand, the
method Knowledge gates, and Cognition skill read through KNT-7 (DC-14, controller 2026-11-02, Rex may override);
Knowledge's holder port reads the same skill against `k.minSkill` (C-K3; knowledge DESIGN §1, §2). Until the port
exists the host skill tables stay as labelled stand-ins (`settlement/providers.ts:19`, `economy/providers.ts:53`).
- **Chain.** An attempt of an action tagged with technique `k` (host data on the repertoire entry) → its perceived
  outcome (#11; completed or failed, with duration) → practice record for `k` (from the mind's episodes, no second
  store) → skill `S_k` → exported as `mind.skill` (1, [0,1] per technique: fraction of the technique's expert
  performance) → read by Settlement's `labour_cap` (KNT-7) and Knowledge's holder port; decays without practice.
- **Form: no supported relationship chosen yet.** Candidates with measured support: the power law of practice
  (Newell & Rosenbloom 1981) and the exponential, which fits individual learners better (Heathcote, Brown & Mewhort
  2000); decay without practice from the skill-retention meta-analysis (Arthur et al. 1998). Needed before a number is
  claimed: the measure of "performance" per technique (time per unit or output per hour, Reality's task demand) and
  initial values per technique. Rates, decay and transfer between techniques are open under **KNT-7** (Rex's).
- **Boundary to keep (risk, for Rex with KNT-7).** C/§2.4 says a resolver never reads the mind. `mind.skill` is
  therefore procedural memory exported through a port like a body quantity, never a belief; the mind's *belief* about
  its own skill (confidence, B/§4.7) is a separate `mind.belief` that only decisions read. If Rex prefers skill to sit
  with Life as a body capacity, this row moves and Cognition keeps only the belief.

**Invention (INV-01; missing).** Rex turned aggregate invention off for M1a–M2. Individual invention begins when
generation (#7) proposes a candidate **outside** the host repertoire; today generation draws only from the repertoire
(V1's F9 compounds recombine repertoire entries only). It needs multi-step lookahead (C-Q8) and a believed outcome
model for an action never tried (from beliefs about materials and physics, which Reality's resolvers then test).
Not designed; not before M2; its stage is the registry's map's to place.

**The M1a chain, end to end** (PLAN-SPEC §4): `body.hunger_signal` (Life) → #5 deficit and priority → #1 food cues
pertinent → #2 observation "food within reach" → #3 belief → #7 candidates `acquire` / `eat` (host repertoire, believed
preconditions) → #8 EU from predicted drive reduction → #9 `cognition.intention {eat, target, terms.kg}` → #10 Life's
eat resolver: owner debits the source once (Economy `takeMass` or Life `plant_state`), Life credits the body once
(`eatMeal`), one transaction → `shared.action.outcome` → taste and gastric fill to the actor, scene change to all → #11
δ, episode, beliefs → hours later `body.satiety_signal` / `hunger_signal` fall (Life) → #5 lower deficit → the next
decision changes. Cognition's links (#1–#9, #11) are built; the **eat** decision is not yet exercised because the
hungry pair eats by a fixture trigger (`bench/hungry-pair/world.ts:221–227`, COG-74).

## A.4 Inputs and outputs

| Quantity / event | Producer → consumer | Unit, range | Timing | Failure and rollback |
|---|---|---|---|---|
| stimuli (scene) | host / Reality → #1, #2 | record; d' ≥ 0 | each cognition tick (phase `cognition`, after physiology) | invalid d' throws; no rollback needed (pure) |
| `body.detectability` | Life (`realism.perception.detectability`, from Reality's `world.signal_at_point`; DC-12; host stub today) → #2 | 1, ≥ 0 | per tick | stub labelled; absent cue = not observable |
| `body.hunger_signal` | Life (nutrition; host stub) → #5 | 1, [0,1] | per tick | missing input throws (`needs.ts:26–29`) |
| `body.satiety_signal`, `body.taste_percept` | Life → #5, preferences | 1, [0,1] | per tick | absent, never defaulted; port added when the writer lands |
| `body.pain` | Reality medicine → #5 (safety) | 1, [0,1] | per tick | as hunger |
| `body.capacity_functional` | Life (DUP-15) → #7 | **record of named capacities in physical units** (contract); scalar today | per decision | mismatch is COG-73 |
| `body.transmitter_levels`, `body.hormone_levels` | Reality neurology → pipeline stage 4 | per row | planned | absent, no default |
| repertoire, social affordances (IF-46) | host, Society → #7 | host data | per decision | believed preconditions only; Society checks openness at the attempt |
| `world.message_received` | Reality transmission / host → #13 | stimulus, channel `report` | on delivery | ordinary detection |
| `cognition.intention` (`Intention`, `terms?` numbers only) | #9 → the resolver of its kind (C/§2.4 table) | event | emitted at decide; resolved in phase `host` | at most one active per mind; never read by a resolver beyond id, action, target, terms |
| `shared.action.outcome { cause, status, stimuli, payload? }` | resolver → host adapter → #11 | event; status impossible / failed / completed | after resolution, consumed next tick | **one transaction per intention** (resolver's `kernel.transaction`); unknown or duplicate causes logged and ignored (`process.ts:73–80`); refusal = `failed` with reason (C-Q25) |
| `cognition.attribution` | #12 → Society (planned consumer) | event | per outcome | read-out only |
| `cognition.decision` (accepted for M1a-27, not built) | #8–#9 → History (run record; IT-M1a-4 "the next evaluation of eating is lower") | event; payload = the existing decision trace: mind, t, needs and priorities used, each candidate (action, target, P̂ summary, EU, P(a)), chosen or kept intention id | once per `decide`, also when commitment keeps the intention; `cause` = the previous outcome event when one triggered re-evaluation | read-only record; nothing in any engine decides from it |
| `world.message` | #13 encode → Reality transmission | record | when a say-intention is chosen | medium capacity truncates |
| labour hours (`work`/`refuse_work`) | host labour provider (built: realism 4074843, `src/labour-intentions.ts`; IF-27 closed) reads the stream → Settlement ports → Economy | hours/day | daily | Settlement never reads the stream (CONTRACTS §16, §19) |
| reservation wage | Cognition-derived host answer → Economy wage quote | money / post-day | daily | floor only (CONTRACTS §19) |
| recognition reader | Cognition (v0.1.0) → Government | belief view | on read | read-only |
| KNT-C1 holder port | Cognition → Knowledge | read-only view over `mind.belief` | on read | "heard of" ≠ "holds" (C-K3) |
| `mind.appraisal`, `mind.recalled_body_state` | Cognition → Reality neurology | record | planned | not in kernel.json until built |
| `mind.skill` (KNT-7) | `cognition.skill.practice` → Settlement `labour_cap` (DC-14), Knowledge holder port | 1, [0,1] per technique | daily or per practice outcome | planned; host skill tables are labelled stand-ins until then |

**Every transfer happens once.** Cognition debits and credits nothing. For each flow it touches: food — the owner
debits (Economy `takeMass` for inventory, Life `plant_state` via IF-42 for wild food), Life credits the body
(`eatMeal`: Δbody = +E_kept, Δwaste = +rest, CG-13); effort and time — Life's energy ledger, also on `failed`; money —
Economy's trade on Settlement's ledger; labour — Settlement assigns hours, Economy pays. **Never both (CG-23, C-Q26):** a
simulated mind's buy is a trade, not per-capita demand; a person with a `work` intention is not in the cohort supply.

## A.5 Evidence

Labels: **measured** (an empirical value from a cited study), **calibrated estimate** (a published model default or fit
to independent data), **assumption** (keeper's proposal, no source), **fiction** (fixture or story value). PLATFORM §4
levels are in Part C.

| Equation or parameter | Value | Source | Label |
|---|---|---|---|
| TVA attention weights | form | Bundesen 1990; Bundesen et al. 2005 | calibrated estimate (form level 2, mapping level 4) |
| pertinence π_j = π0 + Σ priority·rel | form | keeper | assumption |
| SDT hit / false alarm, √a scaling | form | Green & Swets 1966; Macmillan & Creelman 2005 | measured form; scaling assumption |
| criterion k | 0 | neutral | assumption |
| identification q, Weber fraction w_ch | form; w per channel | Weber's law; per-channel values unresearched | form measured; values open |
| M = w·D·S, S = 1 + Σ a·η | form | keeper | assumption (level 4) |
| homeostatic drive D(h), n, m | 4, 3 | Keramati & Gutkin 2014 | calibrated estimate |
| loss aversion λ | 2.25 | Tversky & Kahneman 1992 median | measured |
| ACT-R decay d | 0.5 | Anderson & Lebiere 1998 | calibrated estimate |
| retrieval τ, noise s | 0, 0.4 | baseline | assumption |
| Bayes inertia η | 1 | Bayesian baseline; conservatism Edwards 1968 | assumption |
| prior strength α0 | 1 | — | assumption |
| β, γ, κ | 1, 0.99, 0 | — | assumption |
| θ_pre | 0.5 | — | assumption |
| ε_attr | 1e-6 nats | `learning.ts:98` | assumption |
| Luce choice | form | Luce 1959 | measured form |
| commitment | form | Bratman 1987; Cohen & Levesque 1990 | assumption (level 5 quantitatively) |
| attribution by max KL | form | Kelley 1967; Baker, Saxe & Tenenbaum 2009 | assumption |
| pool concentration α, reconstruction count | 1, 1 | keeper (`sourced: false`) | assumption |
| payment acceptance V = D + E | form | Menger 1892; Jones 1976; Kiyotaki & Wright 1989 | assumption (level 4–5); PA-Q2 bound assumption |
| hungry-pair world (F = 6, u = 0.25, s_O/s_A = 1.5, k = 2, 6 epochs, 0.5) | — | C/§6 | **fiction** (fixture, C-Q1) |
| V1 constants (linear ω, N½ = 10, r = 1.5, K = 3, /2) | — | B/§10 | assumption ("crude", C-Q10) |
| V2 constants | — | B/§11 | assumption (estimate); never tuned |

## A.6 Status (each column separate)

designed · implemented · connected (wired to another engine's real producer or consumer in a run) · numerically
checked (tests of the formula as stated) · empirically validated (against independent data).

| Mechanism | Designed | Implemented | Connected | Numerically checked | Validated |
|---|---|---|---|---|---|
| attention, perception | yes | yes | no (host stub d') | yes (V3 ROC exact; tests) | no data |
| belief update, testimony | yes | yes | no | yes (CB-4) | no |
| episodic memory | yes | yes | no | yes | **V1 forgetting PASS** |
| needs and drive | yes | yes | no (hunger signal a stub) | yes | no |
| generate / evaluate / select | yes | yes | no | yes (CB-2, CB-5, CB-7; V4 verification) | **V2 learning-and-choice FAIL** (C-V2) |
| intention emission with `terms` | yes | yes | Economy (4192e27, 4831b5a) and Settlement (7e49d3c) sides landed; no integrated run yet | yes (`intention-terms.test.ts`) | n/a |
| resolution move / gather / eat | yes (C/§2.4) | **no** | no | no | no |
| labour provider (`work`/`refuse_work`) | yes | yes (realism 4074843, 1008a49) | IF-27 closed (registry) | 14/14 at 9cec538 (registry) | no |
| learning, attribution | yes | yes | no | yes (CB-3, CB-4, CB-5) | no |
| payment acceptance | yes | yes | Economy demo fixture (COG-61) | yes (tests a–d) | no |
| communication §5.1 | yes | yes (25d4e7b…c7ecfd4) | no | yes (six tests) | no; registry still says planned (COG-73 risk) |
| memory stages, appraisal, pipeline | yes | no | no | no | no |
| skill practice (KNT-7) | chain only (A.3); form open | no | no (host stand-ins) | no | no |
| invention (INV-01) | no | no | no | no | no |
| personality V1 | yes | yes, frozen | n/a | yes | T-1/T-2 not passed (S1, S3: no stable separation) |
| personality V2 | yes | foundation only (5441–5452, 5463, 5468); Ni none; 5444, 5445 held | n/a | isolation tests | no |
| Ti experiment | yes (B/§12.7) | 5465–5467; 5470 queued | n/a | crashed at 40 seeds (COG-72) | no |

## A.7 Validation

| Mechanism | Must reproduce | Tolerance | State |
|---|---|---|---|
| perception | equal-variance ROC (V3) | exact | verification passes |
| memory | power-law retention (V1, Rubin & Wenzel 1996) | power-fit R² ≥ their median | PASS |
| decision from experience | Technion Prediction Tournament (V2, Erev et al. 2010) | MSD ≤ 1.5 × IBL | **FAIL**; θ fitted only on the estimation set and tested on the competition set, as a reviewed change (C-V2) |
| evaluation | mixed-gamble boundary at λ (V4) | exact (verification); validation pending | — |
| the hungry pair | none exists (V5) | reported, never claimed | — |
| baseline acceptance | CB-1..CB-7, P7-3 (C/§6) | as stated there | PASS |
| communication | six level-5 tests (C/§5.1) | qualitative, as stated | pass |
| **M1a (Cognition's part)** | paired seeds: provisioned (food in reach) and deprived (none); in both, every eat intention gets one outcome, inventory decrements once, the body receives once; in the provisioned run the hunger-priority share and the next choice change after satiety falls; in the deprived run deficits rise through their states, choices are recorded, never tuned toward survival | exact for the counts; outcomes reported | not run |
| eight-function layer | T-1, T-2 (McCrae & Costa 1989 signs), T-3 (C/§10, B/§12) | signs; magnitudes reported | not passed; never tuned |

Calibration is allowed only on independent estimation data and tested on held-out data; no parameter is tuned to make
an agent survive, separate types or pass a gate.

## A.8 Build order (keyed to PLAN-SPEC §4; nothing is queued until Rex approves and the registry's map is reconciled)

| Stage | Cognition's work | Depends on | Smallest demonstration |
|---|---|---|---|
| **M1a** (CN-1, CN-5, CN-7 contracts, then CN-8; A.9) | (1) `eat` as a host repertoire action decided like any other; remove the fixture eating trigger from the M1a scenario (COG-74); (2) `capacityFunctional` as the DUP-15 record (COG-73), generation reading the named capacity the action declares; (3) satiety port in `kernel.json` when Life's writer lands; (4) a fixture stub resolver of the `shared.action.resolution` signature, labelled, until Life's eat resolver lands | Life eat resolver; Life DUP-15 record; registry `shared.action.*` rows; (5) emit `cognition.decision` (M1a-27) so IT-M1a-4 reads from the run record | paired provisioned / deprived run: need → decide → acquire → eat → perceived outcome → changed next decision; transfer counts exact |
| **M1b** | no new mechanism: travel time and effort enter as believed `duration` and `cost`, learned from perceived `move` outcomes through #11 | Reality move resolver; Life walking cost | the same loop across distance; beliefs about travel time converge on experience |
| **M2** | failed attempts (demand > capacity) are perceived and learned from; fatigue reaches choice only through `body.capacity_functional` and the hunger/fatigue signals, never a success-probability rule | Life fatigue on capacities; labour provider built (realism 4074843) | getting food costs time and capacity; choices shift as capacity falls |
| **M2 (skill)** | `cognition.skill.practice` and the `mind.skill` port for KNT-7 / DC-14, once Rex settles KNT-7 (form, rates, decay, owner) | Knowledge's KNT-7; Reality task demand (performance measure) | productivity in `labour_cap` derived from practised skill instead of the host table |
| **M3–M4** | none required; beliefs about yields learned from outcomes. Planting needs multi-step lookahead (C-Q8): flagged as the first M3 risk | Life plants, soil; Reality weather | — |
| **M5** | communication (built), credibility, payment acceptance (built), social affordances (IF-46), legitimacy (C-G3, on Rex's word), group association (D/§20), trust row | Society, Government, Economy | trade, ownership and obedience decided by the same minds on the same stocks |
| after M2 | invention INV-01 (aggregate invention off for M1a–M2, Rex) | C-Q8 lookahead; Reality resolvers | a mind proposes and tries a new action; the outcome decides |
| beside the ladder | memory stages and the experience pipeline (needs Reality chemistry), substance adaptation (C-Q15) | Reality neurology | — |
| experimental track | Ti experiment (5470) → report to Rex; S2, S4–S6; V1/V2 comparison; 5444, 5445 only on Rex's answers; Ni after C-Q24 | Rex's answers | never blocks a stage above |

## A.9 The baseline review: lanes CN-1–CN-8 and the sense scaffold (Rex, 2026-11-02; adopted)

Rex's review of this plan, vetted by him before pasting; recorded as his position. Keeper's verification against the
code is marked **(keeper, read, not run)**. New open ids: C-Q29–C-Q32. New defects: COG-75, COG-76.

**Lanes.** The baseline is planned and audited in eight lanes, each with the same card: question, boundary, model,
evidence, functional tests, realism tests, connection test. The eight-function work stays a separate track, tested
against the working baseline afterwards with the null personality as the M1a configuration.

| Lane | Mechanism (A.3 #) | What to build or resolve | Functional test | Realism check |
|---|---|---|---|---|
| CN-1 bodily signals and felt needs | #5: M_i = w_i d_i S_i, p_i = M_i / Σ M_j | exact hunger and satiety meanings, timing, mappings; physiology stays Life's | missing signal fails explicitly; zero pressure defined; no signal counted twice | predicted responses across measured hunger/satiety conditions; pressure form stays proposed |
| CN-2 attention and perception | #1–#2 | the sensory contracts below; Life/Reality detectability | truth never enters the mind; controlled hit and false-alarm cases | detection and attention against independent observations in the chosen domain |
| CN-3 beliefs and expected consequences | #3, P̂ = theory + experience | where initial food beliefs come from; what experience can change | a false belief is holdable; contrary evidence moves it; missing model data never teaches "bread cannot be eaten" | belief revision and generalisation against behavioural evidence |
| CN-4 remembering experience | #4 ACT-R | context matching; scope of the current model (stage split can wait) | older and repeated episodes follow the equation; irrelevant episodes do not enter P̂ | recall/forgetting data, separate from decision accuracy |
| CN-5 actions and believed feasibility | #7 | eat as an ordinary candidate; named capacities; believed ability ≠ actual success (C-Q32) | eat, wait and rejected candidates appear with reasons; a mistaken feasibility belief can reach the resolver without guaranteeing success | whether the generation assumptions represent the restricted task |
| CN-6 evaluation, choice, commitment | #8–#9 | predicted bodily effects; subjective effort cost (C-Q31); time basis of discounting (C-Q30) | hand-calculated examples match; Σ P = 1; changing epoch length does not silently change preferences | choice frequencies and persistence against held-out behavioural data |
| CN-7 outcome perception and learning | #11–#12, δ = r_obs − EU | what r_obs means; how delayed bodily feedback is associated with eating (C-Q29) | one outcome learned once; refused transactions never create meals; technical failures never become physical lessons | learning from repeated, delayed and misleading feedback |
| CN-8 the closed eating loop | the M1a chain (A.3) | replace the fixture trigger (COG-74) with a selected intention and the shared resolver | trace signal → candidate → choice → transfer → bodily feedback → next evaluation; hunger changes the evaluation of eating (it need not force eating every time) | passing shows integration only; physiological and behavioural validity keep their own evidence |

**Order (Rex):** first the CN-1, CN-5 and CN-7 contracts, then CN-8's executable eating test; the other lanes'
equations are audited alongside. The largest open question: whether experience updates the agent's understanding of
actual bodily consequences, or only its probability of reaching a predefined outcome (C-Q29).

**The four issues, verified (keeper, read, not run).**
1. **Eating is a fixture trigger** (`bench/hungry-pair/world.ts:221–227`): confirmed, COG-74.
2. **Learning reuses the saved predicted value of the perceived category** (`src/learning.ts:194–200` takes the
   perceived category's utility row computed at evaluation, `src/evaluate.ts:84–90`, as r_obs). Confirmed: two meals
   perceived as the same category give the same δ whatever Life's later signals do; actual relief reaches later
   choices only through the next tick's felt deficit, never into the meal's expected consequence. Required test: same
   category, different subsequent Life signals; can the agent learn the difference? If not, record it and define the
   missing mechanism; never substitute a fixed bread reward. COG-75; C-Q29.
3. **Discounting is per epoch** (`src/evaluate.ts:132`, γ^(duration − 1); duration a positive integer of epochs,
   `src/actions.ts:66`): confirmed; the same physical duration discounts differently at a different epoch length. The
   plan must declare the reference interval and conversion rule; a continuous form such as e^(−ρT) is one candidate,
   not adopted. `candidate.cost` is subtracted inside utility (`src/evaluate.ts:90`) with no stated mapping from
   anticipated effort; it must never become a second physiological energy debit (Life's ledger is the one). COG-76;
   C-Q30, C-Q31.
4. **Capacity filtering** (`src/actions.ts:152–153`) compares required capacity with the body's actual capacity, so
   the mind would know its exact physical limits. The contract must separate what the person believes they can do,
   what bodily conditions prevent issuing an action at all, and what the resolver determines after the attempt. For
   adjacent eating, only the capabilities eating requires. COG-73 (extended); C-Q32.

**Personality terms (Rex):** allocation = processing budget assigned to a function; competence = measured performance
of its operation on specified tasks and budgets; confidence = the mind's belief about an answer's or method's likely
success (B/§4.7). The V2 validation failure (C-V2) stays visible: built decision machinery is not validated behaviour.

**Senses (Rex, 2026-11-02).** Hunger explains why someone seeks food, not where it is, what it is like or which food
they prefer. Proposed division for the simulator, not a requirement to build every channel before the first meal:

| Channel | Contribution to eating |
|---|---|
| vision | location, appearance, amount, visible condition |
| smell | odour cues informing identification and expectation |
| touch | contact, texture, temperature in handling and eating |
| taste | sensory information produced by oral contact |
| hearing | environmental or food-handling cues where the scenario has them |
| internal sensing | hunger, fullness, later bodily effects (Life) |

- **Ownership:** Reality = physical properties and signals at the person's location; Life = what the organs and body
  can detect given their condition; Cognition = attention, interpretation, recognition, expectation, learned
  preference. Food never emits an instruction such as "delicious: +10".
- **One attention budget.** All channels land in the one allocator (#1; shares sum to one across channels). Separate
  sensory observations may enter it; their interface and timing are standardised, their packaging is not prescribed.
- **Timing rule:** only information available at decision time enters evaluation (CN-6). Before eating, the agent uses
  remembered or expected taste, never the taste of the coming bite. Existing fullness may influence the next bite;
  oral feedback arrives after the contact event (not necessarily swallowing); later bodily feedback arrives when Life
  produces it (CN-7).
- **Three quantities kept separate:** expected liking (before), experienced sensory response (during), later bodily
  consequences (after), each with its timestamp and attribution. Whether learning combines them into one utility,
  keeps separate predictions or uses several prediction errors is an explicit model choice still to make (C-Q29);
  "liking + relief" with arbitrary weights is not adopted.
- **Named assumptions:** hand-to-mouth movement is an assumed capability in the first fixture (no motor-control
  claim). Odour and taste depend on concentration, temperature and staleness: a fixed value per food is allowed only as
  a labelled fixture, never as the food-sensing model.

**Sequence (Rex):**
1. **M1a:** declared initial food knowledge (the adjacent bread's identity is a fixture), internal signals, labelled
   contact and oral-feedback fixtures. No general sensory identification, no motor-control claim.
2. **CN-7:** how observed consequences update predictions, delayed feedback included, sensory and bodily observations
   kept distinguishable (C-Q29). This gates preference.
3. **Two-food experiment:** learned expectations and preference, first with declared distinguishable cues; vision or
   smell only where the experiment tests recognition through them; realistic sensory recognition is a separate test.
   Preference learning attaches to CN-3, CN-6 and CN-7 (B/§9.1, D/§13), not as its own reward channel.

**Open (Rex):**
- **C-Q29:** how observed consequences, including delayed bodily feedback and sensory experience, update the meal's
  expected consequences (one utility, separate predictions, or several prediction errors).
- **C-Q30:** the reference interval and conversion rule for discounting across epoch lengths.
- **C-Q31:** the mapping from anticipated effort to `candidate.cost`, without a second energy debit.
- **C-Q32:** the three-way capacity contract (believed ability, issue-blocking bodily condition, resolver outcome).

**Refinements adopted (Rex, 2026-11-02, second review).** CN-1, CN-5 and CN-7 proceed to contract design (A.10);
CN-8 is implemented only after those contracts agree; full sensory physiology stays planned with its interfaces
scaffolded; Personality V2 continues as a separate experimental track. The keeper proposes the forms and evidence for
C-Q29–C-Q32, each as a proposal with acceptance cases, never a settled equation. Further points recorded as Rex's:
- **Action success ≠ experienced benefit.** Three records are kept apart: the prediction before acting, the immediate
  outcome of the attempt, and later observations that may be attributed to it. The mind never knows which act caused a
  later bodily change; attribution uses only its own information and causal expectations, competing explanations
  included.
- **The learning test needs a control.** A different next choice after a bigger meal may only mean a hungrier agent.
  At the test evaluation, current pressures, available actions, evaluation parameters and current sensory inputs are
  held identical; learned predicted consequences are compared first, then the EU of eating; the chosen action alone
  proves little. A no-learning control and a competing-cause case are included; attribution is not required to name an
  unknowable cause.
- **One physical-time convention** for discounting and effort, so a step-size change does not change the meaning of a
  ten-minute walk. Exponential discounting fixes units; it does not establish that exponential discounting is the
  right behavioural model, and a different decision interval can still change how often a mind reconsiders.
- **Effort:** predicted expenditure, its subjective valuation and the actual expenditure are three separate
  quantities. A conversion to utility has explicit units and its own justification; valuation need not rest on joules
  alone; sharing a physical estimate is not itself a defect; the prediction may learn from bodily experience.
- **Capability, bounded for M1a:** believed capability is a declared initial belief whose uncertainty is a labelled
  fixture assumption; no error distribution is presented as established physiology; interoceptive noise comes later.
- **Rejection reasons are believed reasons.** Generation's reasons reflect the mind's information. Resolver diagnostics
  may record objective reasons separately; they never enter the mind automatically.
- **Sensory availability and attention are separate.** The trace keeps stimulus → detection → attention →
  interpretation → memory visible: a stimulus can reach a person unattended, or be attended and misread. (In the built
  model attention sets the effective sensitivity of detection, `d'_eff = d'·√a`, C/§2.1; the trace therefore records
  availability (d' from Life), the attention share, the detection draw, the interpreted value and the encoded episode
  as five separate fields.)
- **The declared-cue two-food test proves learning across distinguishable foods only.** Its cues are fixtures, so it
  is never cited as validation of any sensory route.
- **COG-76 is split:** the discount convention (closeable by rule, COG-76) and the effort-to-cost mapping (model
  selection, COG-77) close independently.

## A.10 Contracts CN-1, CN-5, CN-7 (keeper's proposals, 2026-11-02; accepted by Rex with amendments, A.11)

Each contract states its inputs, the proposed form, what stays open, and acceptance cases. Labels follow A.5. Nothing
here is built; the current code is cited where the proposal changes it.

### CN-1 Bodily signals and felt needs

- **Inputs (Life E5, life PLAN A8).** `body.hunger_signal` and `body.satiety_signal`, each dimensionless in [0, 1],
  written by Life every fast step (10 s) before the cognition phase; Cognition reads the latest value once per decision
  epoch. Both are **absent, not 0,** when the body is dead. Life's mapping from physiology to each signal is Life's
  (level 4, validated by Life against visual-analogue ratings); Cognition never recomputes or rescales it.
- **Hunger need (as built, kept).** `D_hunger = body.hunger_signal` (`src/needs.ts:43–46`; setpoint 0); pressure
  `M = w·D·S`, priority `M/ΣM`. Each signal enters one need's deficit at most once; the drive never feeds back a
  physiological effect.
- **Satiety (proposal; C-Q33).** Satiety is **not** subtracted from the hunger deficit (Life keeps the two signals
  independent, and Cognition must not derive one from the other). Proposed: it enters the mind as an interoceptive
  observation available at decision time (the timing rule, A.9), so a mind can learn from experience whether eating
  while full is followed by discomfort or no further relief (CN-7's consequence beliefs). Whether satiety should also
  act directly on the felt need (an inhibitory term) is open: no source has been chosen.
- **Missing and absent signals.** A required signal missing from the inputs throws (current behaviour, `needs.ts:26–29`).
  A dead body is the host's case: on `body.death` the host stops scheduling that mind's epoch (no decision is attempted
  from absent signals). Proposed host rule, for the History/Kernel harness spec (M1a-13).
- **Zero pressure (proposal).** Today ΣM = 0 gives every need priority 1/N (`needs.ts:88–90`, a proposed convention),
  which still raises the pertinence of need-tagged cues when nothing presses. Proposed: priority 0 for every need when
  ΣM = 0, so pertinence falls back to its base π0. Assumption; acceptance case below.
- **Timing.** Signals are sampled, never integrated, by Cognition; an epoch longer than Life's step sees only the
  latest value (stated limitation: within-epoch peaks are not felt).
- **Acceptance cases.** (1) Missing hunger signal throws; dead body → no decision called. (2) Zero pressure →
  all priorities 0 and pertinence = π0. (3) With everything else fixed, a higher hunger signal raises the hunger
  priority share monotonically. (4) Changing the satiety signal with the hunger signal fixed leaves `D_hunger`
  unchanged (no double count). (5) Replay byte-identical.

### CN-5 Available actions and believed feasibility (proposal for C-Q32)

- **`eat` is an ordinary repertoire entry** (host data, M1a-11): target = the food handle the mind believes in;
  `terms.kg`; preconditions over beliefs (the food exists within reach; the mind may take it: household membership and
  right of use as the mind believes them, M1a-14); outcome space `completed | failed | impossible` with predicted
  consequences from CN-7's consequence beliefs. `wait` always exists.
- **Three quantities, three owners.** Believed capability (Cognition: `mind.belief` about `(self, capacity:<name>)`,
  a Gaussian in that capacity's physical unit); actual capacity (Life, `body.capacity_functional`, A11); task demand
  and outcome (Reality / the resolver).
- **Generation reads beliefs only (change).** Today generation compares the required capacity with the body's actual
  capacity (`src/actions.ts:152–153`). Proposed: the precondition "able" has believed probability
  `P_able = Φ((μ_c − d̂_c) / σ_c)` for each named capacity c the action declares, with d̂_c the mind's believed demand,
  and must meet θ_pre like any other precondition. The body's actual capacity never enters generation.
- **Issue-blocking conditions.** What prevents an action from being issued at all is a body state, not a belief. At M1a
  the only one is "no live body" (CN-1). Others (unconsciousness, sleep) wait for Life to write them.
- **M1a bound (Rex).** Believed capability is a declared initial belief `(μ_0, σ_0)` per capacity eating requires,
  labelled fixture. If Life's LN-8 finds that eating has no source-supported capacity demand, `eat` declares none and
  M1a has no capability check on eating.
- **Learning capability from outcomes (proposal; superseded by A.11.2, Rex's amendment 2).** A `completed` outcome is evidence that capability ≥ demand; a
  `failed` outcome whose perceived reason is capacity is evidence that capability < demand. The update is a censored
  Gaussian update (moment matching of a Gaussian prior with a step likelihood; assumed-density filtering, Minka 2001;
  the mathematics is exact for the step, the use for capability is an assumption). Failures with any other perceived
  reason, including a technical rollback, leave capability beliefs untouched.
- **Rejection reasons are believed.** Each rejected candidate records the belief that failed: the precondition id and
  its believed probability against θ_pre, or `P_able` for the named capacity. No objective quantity enters the trace.
- **Acceptance cases.** (1) Eat, wait and rejected candidates appear, each rejection with its believed reason only.
  (2) A mind whose belief overestimates its capability issues the action; the resolver returns `failed`; capability
  belief moves down. (3) An underestimating mind does not attempt; nothing teaches it otherwise until it observes
  evidence (stated consequence). (4) A technical failure changes no capability belief. (5) The trace contains no value of
  `body.capacity_functional` (fence test).

### CN-7 Outcome perception and learning (proposal for C-Q29; priority COG-75)

- **Three records per intention.** (a) Prediction at decision: the candidate's outcome distribution, each outcome's
  predicted need changes, EU (already in the trace, `cognition.decision`, M1a-27). (b) Immediate outcome:
  `shared.action.outcome` status and stimuli (scene change; gastric fill and taste to the actor, M1a-20). (c) Later
  observations: the interoceptive signals of the following epochs, kept with timestamps.
- **What is learned (proposal; wording per Rex: an *estimated* consequence, A.11.1).** Besides the outcome-category probabilities (built, the Dirichlet of C/§2.3), the mind
  keeps a **consequence belief** per (action, target kind, need k): the change in that need's signal that follows the act
  over the mind's attribution window, Gaussian `(μ_ak, σ²_ak)`. Its prior mean is the host's declared naive effect (so
  today's behaviour is the prior, not a rule). Evaluation predicts the deficit after a completed act as
  `current deficit + μ_ak`, so learned relief reaches EU through the same drive function D (one value function; no new
  weight).
- **Observed reward.** r_obs for the consequence is the drive reduction computed from the **observed** signal change
  attributed to the act, never the saved value of the perceived category (`src/learning.ts:194–200` changes). The
  immediate category δ stays as built for the outcome-probability channel; the consequence channel has its own
  prediction error `δ_k = Δh_observed,k − μ_ak`.
- **Attribution of delayed changes (proposal; superseded by A.11.1, Rex's amendment 1).** At each epoch within the window, the residual signal change
  `e = Δh_observed − E[Δh_background]` is shared among the mind's candidate causes: the acts it remembers in the window
  (episodes) and a background cause (the signal's drift with no act, itself a belief the mind learns). Responsibility
  `ρ_i ∝ P_i(effect) · K_i(t − t_i)`, normalised over the candidates, where P_i is the mind's prior that cause i changes
  that signal and K_i its believed delay profile (initial profile a labelled fixture). Each cause's consequence belief
  takes a Kalman update with the residual weighted by ρ_i (observation variance divided by ρ_i). Forms from causal
  learning with temporal contiguity (Buehner & May 2003; Griffiths & Tenenbaum 2005), level 4; the delay prior and
  window are assumptions. The mind can credit the wrong cause; that is a result, not a fault.
- **Guards.** One outcome event is learned once (the built cursor rule). A `failed` or `impossible` eat creates no
  meal consequence: only a completed act enters the candidate causes for food effects. A rollback is perceived as
  `failed` with its reason and teaches no physical lesson (CN-5 guard).
- **Preference stays out** until this contract is agreed (A.9): sensory liking will be one more consequence channel
  with its own prediction, never added to relief with an arbitrary weight.
- **The decisive experiment (Rex).** Matched agents A and B (same seed, priors, parameters, repertoire) each eat once:
  the same food kind, both outcomes `completed`, but Life's later signals differ (A's hunger falls more; labelled
  fixture signals until Life's LN-6 writer exists). Then both are restored to identical current pressures, actions,
  parameters and sensory inputs, keeping their memories and beliefs. Pass if: (1) μ for eating differs in the direction
  of the observed relief; (2) EU(eat) differs in that direction with pressures fixed; (3) with learning off (η = 0, no
  encoding) neither differs; (4) competing cause: an unattributable hunger change at a time with no act goes to the
  background belief, and when an unrelated act coincides with the meal the credit is split by the mind's priors and
  delays, not by the true cause; (5) a refused eat changes no consequence belief. If (1) or (2) fails, the missing
  mechanism is recorded; no fixed reward is substituted.

### C-Q30 Discount convention (closeable by rule; COG-76)

Proposed rule: `D(T) = e^(−ρ·T)`, ρ in s⁻¹, T the believed time to the outcome in seconds (from the action's believed
duration, no longer an integer of epochs, `src/actions.ts:66`). Today's γ = 0.99 per 10-minute epoch converts to
ρ = −ln(0.99)/600 s ≈ 1.68 × 10⁻⁵ s⁻¹, so the benchmark's discounting is preserved at Δ = 10 min; the first-epoch
exemption of `γ^(dur−1)` (`src/evaluate.ts:132`) is not kept, so CB-7 is re-run and the change reported. Exponential
is the unit convention only; hyperbolic discounting (Mazur 1987) remains an alternative to test, and reconsideration
frequency still depends on Δ (stated). Acceptance: the same physical duration gets the same discount at Δ = 1, 10 and
60 min.

### C-Q31 Effort valuation (model selection; COG-77)

Three quantities: predicted expenditure Ê_a (a mind belief per action, in J, prior from the host's declared cost,
learned from perceived bodily feedback once Life writes an exertion signal), its subjective valuation
`c_a = κ_E · Ê_a` with κ_E in utility per J (its own parameter, with its own evidence; other effort channels such as
time or discomfort may add terms with their own units), and the actual expenditure (Life, A12; never read by
Cognition). Cognition never writes energy; Life never reads c_a. The functional form of effort discounting is open
(linear here; parabolic and hyperbolic forms are reported in effort-discounting studies, e.g. Hartmann et al. 2013,
Klein-Flügge et al. 2015). Acceptance: changing κ_E changes choices and not Life's expenditure; changing Life's effort
model changes Life's expenditure and reaches the mind only through later perceived experience.

### New open items

- **C-Q33:** whether satiety acts on the felt need directly (an inhibitory term) or only as an observation the mind
  learns from (CN-1 proposal: observation only, until a source is chosen).
- C-Q29–C-Q32 now carry the proposals above for Rex's answer.

**Status of A.10 (Rex, 2026-11-02): accepted for implementation and testing, with three amendments.** This accepts a
candidate model, not a claim that the psychology is validated. Decisions:

| Proposal | Rex's decision |
|---|---|
| hunger reads Life's signal | accepted for this lane, meaning and range explicit (CN-1) |
| satiety observed, not subtracted (C-Q33) | accepted provisionally; first confirm what Life's hunger signal already includes, so no influence is added twice |
| real-time exponential discounting (C-Q30) | accepted as the declared candidate model; the changed first-step treatment is tested explicitly |
| predicted joules × utility per joule (C-Q31) | accepted as a restricted effort-cost model; coefficient labelled; perceived experience may inform predictions later |
| the controlled learning experiment | accepted; learned predictions compared before EU, current conditions fixed |

**Amendments (Rex):** (1) the mind learns an **estimated** consequence of a meal from observed changes, allowing for
alternative causes and uncertainty, never the meal's "actual effect"; CN-7 needs exact attribution and update
equations, their initial assumptions and their zero-evidence behaviour, and unexpected evidence must revise
expectations rather than confirm them. (2) Capability learning uses **perceived** evidence of failure: perceived
effort and outcome under a declared attribution rule; the resolver's true cause stays in diagnostic records, never in
what Cognition receives; technical failures teach nothing. (3) Zero need pressure must not disable perception or
ordinary action: need-driven attention can be zero without all attention being zero. **Next (Rex):** no further broad
review; the keeper turns the remaining details into concrete proposals (A.11) and tests them within these bounds;
implementation follows once the affected interface agreements are settled.

## A.11 Executable forms for CN-7 and CN-5 (keeper, 2026-11-02; within A.10 as amended)

These replace A.10's "Attribution of delayed changes" bullet and its "Learning capability from outcomes" bullet. The
built engine already uses the same Gaussian/Kalman machinery (C/§2.3), so no new kind of mechanism enters.

### A.11.1 Estimated consequences of acts (CN-7, C-Q29)

**What the mind observes.** For need k with signal `h_t` (Life, [0, 1], sampled once per epoch of Δ seconds) the
observed change `y_t = h_t − h_(t−1)`. It does not observe causes.

**What it believes (one joint Gaussian per need, per mind).** A parameter vector
`x = (β, θ_1, …, θ_J)`: β is the background drift of the signal per second with no act; θ_j is the **estimated total
consequence** on that signal of one completed act of kind j (an action and target kind, e.g. eat × bread). Belief
`x ~ N(μ, Σ)`.

**Its causal model (the mind's, labelled assumption):**

```
y_t = β·Δ_t + Σ_j θ_j · φ_j,t + ε_t          ε_t ~ N(0, σ_w² · Δ_t)
φ_j,t = Σ_{completed acts i of kind j} G(t − t_i) − G(t_prev − t_i)
```

Time is physical: `t`, `t_prev` and `t_i` in seconds, `Δ_t = t − t_prev` the elapsed time since the last sample
(not a count of epochs). `G(τ)` is the mind's believed cumulative delay profile in seconds (0 before the act, rising to
1 at the end of its window W): the share of an act's consequence it expects to have appeared τ seconds after the act.
**The noise is a diffusion** (variance per second σ_w²), so the evidence carried by an elapsed interval does not depend
on how many samples it is cut into: for the background drift the posterior after time T is exactly the same at any
sampling interval (precision T/σ_w²), and for act effects it is the same up to how finely G is sampled (Rex,
2026-11-02: update frequency must not manufacture learning or bodily effects). Only `completed` acts of the
mind's own episodes enter φ; `failed` and `impossible` acts never do.

**Update each epoch (exact Bayesian linear regression; Kalman filter on static parameters):**

```
prediction      ŷ = φ_tᵀ μ                    (φ_t = (Δ, φ_1,t, …, φ_J,t))
innovation      e = y_t − ŷ
gain            K = Σ φ_t / (φ_tᵀ Σ φ_t + σ_w²·Δ_t/η)
posterior       μ' = μ + K e,    Σ' = Σ − K φ_tᵀ Σ + Q·Δ_t
```

η is the built belief inertia (C/§2.3; η = 1 Bayesian, η = 0 freezes learning, the experiment's control); Q is a
small diagonal drift so old evidence can be outweighed when the world changes (the C/§2.3 `q_k` convention).

**Properties that answer the amendment.**
- *Unexpected evidence revises:* the update is proportional to the innovation e; a meal followed by less relief than
  expected lowers μ_θ; nothing in the update favours the prior's direction.
- *Competing causes keep joint uncertainty:* the belief is one joint Gaussian and its full covariance Σ is kept, never
  only per-cause variances. If a meal and an unrelated act always coincide, the observations constrain only the sum of
  their effects: the variance of the sum shrinks, the variance of their difference stays at its prior value, and the
  two estimates acquire a negative covariance. The split follows the priors and is reported as ambiguous, not as two
  confident values. An unexplained change at a time with no act moves only β.
- *Zero evidence:* no completed act of kind j inside its window → φ_j = 0 → μ_θj and its variance are unchanged
  (except Q); no act at all → only β learns; no signal (dead body) → no update. A food never eaten keeps its prior; a
  refused or failed eat teaches nothing about the food.

**Initial assumptions (all labelled fixture, per scenario):** μ_θ = the host's declared naive effect of the act (so
today's behaviour is the prior, not a rule); prior variance wide enough that one meal moves it (σ_θ,0 stated per
scenario); μ_β, σ_β,0; σ_ε (the mind's belief about signal noise; interoceptive noise comes later); G (one declared
profile per act kind); W; Q. None is presented as physiology; the delay profile is the mind's belief, never Life's
digestion model.

**Into evaluation.** For a completed act of kind j the predicted deficit change is μ_θj, realised over G; the
evaluation uses the predicted deficit `D + μ_θj` with the C-Q30 discount at the believed mean delay
`T̄_j = Δ · Σ_τ τ (G(τ) − G(τ−1))`. Drive reduction is still the one function D(h) (C/§2.2); no new weight.

**Evidence labels.** This is a **proposed Bayesian associative-learning model** (level 4–5). The calculation is exact
*under its own assumptions* (linear, additive, Gaussian, diffusion noise); that exactness says nothing about whether
people learn this way. Kalman-filter models of associative learning are one published family (Dayan & Kakade 2001;
Kruschke 2008), with temporal contiguity in causal judgement (Buehner & May 2003). **Relationship to Rescorla–Wagner
(Rescorla & Wagner 1972), stated with its assumptions:** the update reduces to the Rescorla–Wagner delta rule when the
gain is held constant (a fixed learning rate in place of Σφ/(φᵀΣφ + noise)), the covariance is ignored (no
explaining-away between cues), and the present cues' effects add linearly; under those assumptions the two coincide,
otherwise they differ (e.g. backward blocking occurs here and not in Rescorla–Wagner). Stated limit: interacting causes
(a meal that relieves hunger only when rested) are not represented.

**Added acceptance cases (to A.10's experiment):** (a) a surprising outcome moves μ against the prior's direction;
(b) with an act and an unrelated act always together, the reported split equals the prior ratio and Σ shows the
confounding; (c) a hunger change with no act moves β only; (d) η = 0 → no change; (e) a refused eat → no change in θ.

### A.11.2 Capability from perceived evidence (CN-5, C-Q32)

**What the mind receives.** The outcome status (`completed` or `failed`), the scene stimuli it perceives, and, when
Life writes it, a perceived-exertion interoceptive signal (absent today, never defaulted). **It does not receive the
resolver's cause.** The resolver's true cause goes into a diagnostic field read by History only; the host adapter
(`readOutcome`, `src/process.ts:29–30`) never passes it to the mind (fence test).

**Declared attribution rule (the mind's, for a failed attempt of an action needing capacity c with believed demand
d̂):** candidate explanations are "not capable enough", "a precondition was false", and "other or chance":

```
P(fail | c, pre ok)   = 1 − (1 − ε)·Φ((c − d̂)/s)       s: believed performance spread; ε: believed other-failure rate
P(fail | pre false)   = 1
P(complete | c, pre ok) = (1 − ε)·Φ((c − d̂)/s)
```

With the prior c ~ N(μ_c, σ_c²) and the believed precondition probabilities, Bayes gives the posterior over the
explanations, and the Gaussian belief about c is updated by moment matching against the likelihood above (assumed-density
filtering; the probit moments are closed-form, Rasmussen & Williams 2006 §3.6; Minka 2001). The same failure also
lowers the believed precondition probabilities in proportion to their share of the explanation. With s → 0, ε → 0 and
true preconditions it reduces to the censored step of A.10. A perceived-exertion signal, once it exists, enters as a
further observation of `d̂/c` with its own noise.

**Rules.** Technical failures (rollbacks and harness faults) provide no evidence for learning, **but they must still
settle the execution state** (Rex, 2026-11-02). The harness either retries the intention explicitly (the same
intention id, one later outcome) or emits exactly one settling outcome `failed { reason: technical }`. The host adapter
turns that outcome into empty perceived feedback: the intention is closed in the mind (no pending intention remains, so
the mind decides again at its next epoch), and no prediction error, episode, consequence or capability update is
recorded. The mind never waits for an outcome that will not come; a cancel without an outcome is not allowed. Rejection reasons in generation stay the
believed ones (A.10). Initial μ_c, σ_c, s, ε: labelled fixtures; no error distribution is presented as physiology.

**Acceptance cases:** (0) after a technical failure the mind holds no pending intention, decides again, and its
beliefs, episodes and consequence estimates are byte-identical to before; (a) a failure with a believed-likely false precondition moves capability less than one with
believed-true preconditions (explaining away); (b) repeated completions raise μ_c only as far as the demands met;
(c) the mind's inputs contain no resolver cause (fence); (d) a technical failure changes nothing.

### A.11.3 Zero need pressure (CN-1, amendment 3)

With ΣM = 0 every need priority is 0 (A.10), so need-driven pertinence is 0, but base pertinence π0_j stays (C/§2.1:
`π_j = π0_j + Σ_k priority_k · rel(j, k)`). Requirement on the host: π0_j > 0 for the declared cue categories (the
hungry-pair fixture uses base 1, `bench/hungry-pair/world.ts:74`). Evaluation and selection are unchanged: every
candidate is still evaluated, `wait` included, and the softmax still sums to 1. **Acceptance case:** an agent with all
deficits 0 attends to a food cue (share > 0), may detect it, and produces a decision trace with at least two evaluated
candidates and Σ P = 1.

### A.11.4 What the first tests prove, and what they do not (Rex, 2026-11-02)

Cognition is tested against **labelled hunger-signal fixtures** before Life's LN-6 lands. Those runs test Cognition's
learning and decision machinery only; they are **not** a validated bodily eating loop, and hunger stays an unresolved
physiological dependency until Life's signal exists and is validated. Perceived exertion stays explicitly unavailable
(absent) until Life supplies it.

**The next result is executable evidence, four tests (after the interface agreements):**
1. Different experiences produce different learned meal predictions under identical current conditions (the A.10
   experiment: predictions compared first, then EU(eat), with the η = 0 control).
2. Confounded causes remain uncertain: with two acts always together, the variance of the difference of their effects
   stays at its prior while the variance of the sum shrinks, and the covariance is negative.
3. Refused meals and technical failures do not teach successful ingestion: no θ, capability, episode or prediction-error
   change; the technical failure still settles the intention.
4. Update frequency manufactures no learning or bodily effect: the same fixture trajectory and elapsed time sampled at
   Δ = 1, 10 and 60 min give the same background posterior exactly and the same act-effect posterior within a stated
   tolerance (set before the run from G's sampling), and Cognition writes no bodily quantity at any Δ.

### A.11.5 Remaining confirmations before implementation

- **Life (C-Q33), answered 2026-11-02:** "hunger inputs not selected; LN-6 declares them, and declares any overlap
  with satiety." Candidates only (Life PLAN A8): time post-absorptive, glycogen fraction, fat-store trend; none is gastric
  fill or nutrient sensing. LN-6's card must state whether `body.hunger_signal` carries any gastric-fill or
  nutrient-sensing influence; if it does, CN-1 is revisited before Life builds {SIGNALS}. Until then the satiety
  observation adds no term to the felt need (A.10), so nothing is counted twice.
- **C-Q30 first step (test):** a one-epoch action, discount 1 today, gets `e^(−ρΔ)` ≈ 0.99 at Δ = 10 min; the test
  asserts the new value and the CB-7 re-run reports the differences.
- **Interfaces to settle (registry map):** M1a-06 (satiety as observation), M1a-26 / E6 (generation stops reading
  capacity), M1a-20 (diagnostic cause separated from stimuli; technical failure = no feedback), M1a-27
  (`cognition.decision`).

## A.12 C-G3: belief that an office ought to be obeyed, from perceived events (keeper's bounded proposal, 2026-11-02)

**Status.** Rex released C-G3 for a bounded Cognition design proposal (relayed by the Government keeper, 2026-11-02):
"specify observable inputs, belief-update candidates, assumptions and acceptance tests. Do not choose an equation
merely to produce declining legitimacy." The proposal and the choice are the keeper's. This section **supersedes
`C-G3-DESIGN.md` §3 (the likelihood-ratio table) and §5 (its direction checks)** where they differ; its §2 rules and
§4 fields stand. Nothing is built. The port is unchanged: `ought_obey:<domain>` per office, read through
`createRecognitionReader`; Government writes no belief. Placement: M5 (§A.6), off M1a's critical path.

**Consequence of Rex's rule.** No acceptance test requires the belief to fall, or to rise, in any scenario. The tests
are on the mechanism (fence, zero evidence, symmetry, time basis, source orderings on supplied events). Scenario
directions (the manor variants A and B) are **predictions registered per candidate before the run and reported**,
never pass bars, and no candidate is chosen, rejected or tuned on whether legitimacy declines. The former
C-G3-DESIGN §5 checks ("A falls during dearth") are withdrawn as checks for that reason (COG-78).

### A.12.1 Observable inputs

Government emits events; the host delivers each one as a stimulus only to those who perceive it (witness, party,
recipient of a message), per Rex's Government rule §B: what happened, what was recorded and what is believed are kept
apart, and minds form beliefs from records and observations, never from the facts.

| Event (Government, as perceived) | What the mind receives | Route | Never |
|---|---|---|---|
| assessment, with what the payer had | office, law, procedure, amount owed, payer's holdings if visible to the perceiver | party or witness | a judgement of fairness |
| levy taken | amount moved, from whom, by which office | party, witness, or seeing the goods move | the ledger itself |
| refusal or inability to pay | the fact: owed Y, paid Z, holdings X where visible | party, witness | a label of defiance or intent |
| sanction ordered / attempted / executed | each stage separately, with its procedure (`via`, court, judges) | party, witness, told | "executed" without the owner's confirmation being perceived |
| relief promised / paid | the promise (amount, due day) and, separately, any payment | recipient, witness, told | payment inferred from the promise |
| others' payment or compliance | another household paid / did not, where witnessed | witness, told | a population rate |
| succession open / settled / unresolved | the state and, if perceived, the procedure used | witness, told | who "really" holds the office |
| an official's report | a message: author, content, recipient | recipient (testimony, §5.1) | the content as fact |

Mind-side inputs: the household's own holdings (perceived), its **believed subsistence requirement** (a belief; from
Life's signals once LN-6 lands, a labelled fixture until then, as A.11.4), its credibility beliefs `r_j` (§5.1), and
its existing beliefs about the office.

### A.12.2 Candidate grounds (each sourced; each can be switched off per run)

| Ground | Source | Evidence item (success / failure) | Event kinds that supply it |
|---|---|---|---|
| G1 procedure | Tyler 1990, 2006; Sunshine & Tyler 2003 | the office's act followed its declared procedure / did not | assessment, levy, sanction stages, settled succession where the procedure is perceived |
| G2 promise kept | Levi 1988, 1997 (trustworthiness) | a promised relief paid by its due day / unpaid at due day | relief promised, relief paid |
| G3 subsistence left | Scott 1976 (what is left, not what is taken) | after the claim, the payer's holdings are at or above the believed subsistence requirement / below it | assessment with holdings, levy, remission |
| G4 others comply | Levi 1997 (ethical reciprocity); Fischbacher, Gächter & Fehr 2001 | a witnessed other paid / did not | others' payment, reports of payment (at `r_j`) |
| G5 breaches enforced | Levi 1988 (assurance against free riders); Levi, Sacks & Tyler 2009 (effectiveness) | a breach known to the mind ended in an executed sanction / was dropped or the attempt failed | sanction stages, `violationOutcome` |

Notes kept with the table:
- G3 judges own claims, and others' when the mind perceives their holdings and believes their need. A remission is
  not a separate item: it enters G3 through the margin it leaves, so relief is not counted twice.
- Fischbacher, Gächter & Fehr 2001 is about **contributions conditional on beliefs about others' contributions**
  (about half conditional cooperators, about a third free riders, in their public-goods experiment). It bears on the
  compliance decision (C-G2) more than on `ought_obey`; whether G4 also enters `ought_obey` (Levi's contingent
  consent) is C-G3d. G4 is kept as its own belief `others_comply:<domain>` either way, so C-G2 can read it.
- A failed enforcement attempt is also evidence about the office's capability. That is a separate belief
  (`can_enforce:<domain>`, Government R9: power reported apart from recognition), not legitimacy; G5 counts it only
  as "not enforced", per its source.
- Succession supplies G1 evidence only when a procedure is perceived. No source gives "unresolved succession" a
  weight of its own, so it carries none; it changes attribution (A.12.4).
- Each item carries the holder of the office at the time, so a later per-holder reading needs no new data (C-G3b).

### A.12.3 Belief-update candidates

- **U1, direct likelihood ratios** (C-G3-DESIGN §3): each perceived event multiplies `P(ought_obey)` by
  `LR_{k,c}^η` per feature. Every `LR` magnitude is unsourced (only the ordering is), all of them act on one number,
  and a feature's influence cannot be inspected apart from the others.
- **U2, grounds as beliefs, then a declared read-out (keeper's choice).** Each ground `g` is a two-category belief
  about the office, `Beta(a_g, b_g)`, counted by §2.3's existing categorical update with conservatism `η` (success
  `a_g += η·c`, failure `b_g += η·c`; `c` = the observation's confidence, `r_j` for testimony). Between items the
  counts relax toward the prior at `λ_b` in **physical seconds** (COG-76's convention): `a_g ← a_g⁰ + (a_g − a_g⁰)·e^(−λ_b·Δt)`,
  likewise `b_g`. The port value is a declared read-out:

  ```
  P(ought_obey) = Σ_g w_g · m_g        m_g = a_g / (a_g + b_g),   Σ_g w_g = 1 over the grounds enabled
  ```

  `w_g` are per-person weights (default equal over the enabled grounds; heterogeneity is a person parameter,
  assumption). No new learning rule: the Beta is the two-category case of §2.3's Dirichlet counting, as for `r_j`.
- **U3, conjunction (rejected).** Levi's "contingent" could be read as `Π_g m_g`. A product of probabilities falls as
  grounds are added even with balanced evidence: it would manufacture declining legitimacy from the model's
  structure, which Rex's rule excludes.

**Why U2.** Every number the read-out uses is an evidence count the trace shows (`a_g`, `b_g`, its events), zero
evidence leaves each ground at its prior, success and failure are symmetric by construction, and the only unsourced
part (the weights and priors) is isolated in one place for C-G3a. The choice is made before any run.

### A.12.4 Assumptions (each labelled)

- Grounds are counted independently given the office (assumption; an event can supply several grounds, each once).
- Evidence weight is one item per perceived event per ground, scaled by confidence (assumption, as §5.1).
- Priors `a_g⁰ = b_g⁰ = 1` (uniform; assumption) and weights `w_g` equal (assumption): both C-G3a.
- Attribution: to the office the mind believes responsible (§2.5; ordering court for `via: court`, assessing office for
  a levy, delegation chain as host data). During an open or unresolved succession the item attaches to the office,
  tagged with the acting claimant. Misattribution is allowed.
- Subsistence: the mind's own believed requirement, never Life's true requirement (labelled fixture before LN-6).
- Inability versus refusal: no event carries intent. Whether a perceived non-payment with visible holdings below the
  amount owed counts as "did not comply" in G4 is C-G3c; both arms are implemented as a switch and reported.
- A report's existence is evidence that it was made; its content enters only through the §5.1 testimony mixture at
  `r_j`, and a contradiction by the mind's own observation lowers `r_j` (built).
- `ought_obey` stays null until the mind first perceives an item about the office (C-G3-DESIGN §4 invariant).
- Evidence levels: grounds and their orderings level 4 (survey and experimental studies, historical analysis); the
  read-out, priors and weights assumptions; the model as a whole level 5.

### A.12.5 Acceptance tests (mechanism only; supplied events)

1. **Fence.** A change to Government's objective records, or a private payment entered in the ledger, with no stimulus
   to the mind leaves its beliefs byte-identical (Government §B test).
2. **Zero evidence.** No item → each ground at its prior and `ought_obey` null until the first item; afterwards only
   relaxation moves it.
3. **Symmetry, no built-in direction.** For each ground, mirrored sequences (success ↔ failure) move `m_g` and the port
   value symmetrically about the prior; balanced evidence on a newly enabled ground leaves `P(ought_obey)` unchanged.
4. **Event → ground table.** Each row of A.12.2 has a unit test: the event kind supplies exactly the listed ground and
   sign, and no other.
5. **Time basis.** The same events and elapsed time stepped at Δ = 1, 10 and 60 min give the same counts and port value
   (A.11.4 test 4, same reason).
6. **No intent label.** No delivered stimulus contains a refusal or defiance label; C-G3c's two arms give different G4
   counts on the same events, and nothing else differs.
7. **False report.** An official reports "collected 7" when 10 were taken: the principal's belief follows the report
   at `r_j`; when the principal perceives the 10, `r_j` falls; the ledger is never read.
8. **Source orderings.** Tyler: with G1 enabled, the same short outcome lowers the port value more under an improper
   procedure than under the declared one. Scott: the same levy lowers G3 only when it leaves the payer below the
   believed requirement. Levi: an unpaid promise lowers G2; no promise leaves G2 untouched. G4 counts witnessed
   payments only.
9. **Manor demonstration (reported, not a bar).** Variants A and B, same seeds and shock as unit 5084: trajectories of
   the port value and of each `m_g`; one ablation per ground; weights and priors ×0.5 and ×2. Predictions per
   candidate are written before the run and compared after; none is a pass condition.

### A.12.6 Formation track F-1 to F-4: what it needs from Cognition

Government's formation track (its PLAN, Review amendments §A, §B, §E) is deferred and not an M1a prerequisite. Its
Cognition needs, against what exists:
- **Built:** communication (§5.1: comprehension, credibility, encoding), decisions under uncertainty (EU, A.10–A.11
  learned consequences), belief revision from observation and testimony, refusal as an ordinary choice not to act.
- **Missing (COG-79):** a message content for a proposed **arrangement** (who does what, when, with what in return);
  a commitment to an accepted arrangement (today κ commits a mind to its own intention, not to an agreement); threat
  and offer contents whose credibility rests on believed capability (`can_enforce`); INV-01 for arrangements outside
  the repertoire.
- **Rule for the design:** no act such as "choose a leader" is built in. The repertoire is host data; negotiation,
  turn-taking, a shared procedure, delegation, coercion and refusal must all be reachable, and if every run produces
  a coordinator the test is scripted and fails (Government F-1 bar). Minds act on records and observations, never on
  Government's facts. Designed with the Society, Government and Economy keepers after M1a.

### A.12.7 Open for Rex

- **C-G3a** (kept; now covers the weights `w_g` and priors, since U2 withdraws the LR table): accept the equal weights
  and uniform priors, set them, or ask for a research unit.
- **C-G3b:** `ought_obey` per office (port as is) or per (office, holder). Provisional: per office, items tagged with
  the holder.
- **C-G3c:** does a perceived inability to pay count as non-compliance in G4? Both arms built as a switch.
- **C-G3d:** does G4 (others comply) enter `ought_obey` (Levi's contingent consent) or only C-G2's compliance decision
  (Fischbacher, Gächter & Fehr)? Provisional: enabled as a switch, default off for `ought_obey`, always available to C-G2.
- **C-G2**, unchanged: how the belief enters the compliance decision.

---

# Part B: Rex's FUNCTION-DESIGN.md, verbatim

> **Imported verbatim** from `HQ/handoffs/function-design/FUNCTION-DESIGN.md` (sha256 `fe70d5b0009517a3b02609183e4e6936bad61ec87c85d8791f47aaf3dc1d0f7d`, = repo commit 1e0fa63 text). Not one byte changed between the two markers below; section numbers inside it (§1–§16) are its own. Edits go to that working copy until Rex approves this plan; then this part is re-copied.

<!-- BEGIN FUNCTION-DESIGN.md verbatim -->
# FUNCTION DESIGN: the eight-function theory in the Cognition engine

**A working document for Rex.** It holds, in one place, every part of Rex's cognitive-function theory as it reaches
the Cognition engine: the principles, the structure of the eight functions, each function's definition and
mathematics, the shared operations, the stack and development, memory, meaning, coherence, the applications, the
tests and their results so far, and every open question. Rex adds to it, strikes from it and rewrites it freely. It is
his theory register.

**What this document is, and what it is not.**
- `DESIGN.md` is the engine's specification. It says what the code does or will do, with registry rows and contracts.
  This document is the theory those sections implement. Where the two differ, `DESIGN.md` describes the engine and
  this document describes the theory. A change here reaches the engine only as a dated design change, built through
  the belt.
- Rex's personality matrix (`Writing/Cognitive Function Diagnostic/personality matrix/`: `FUNCTIONS.md`,
  `THEORY.md`) is the primary source of the theory's statements. It is never edited from the engine side. Formulas
  cite its headings. This document summarises those statements; it does not replace them.
- Everything here is a **hypothesis within Rex's theory**, never a law about people or types (DESIGN §9). A negative
  result is a result.

**Status markers used throughout.**

| Marker | Meaning |
|---|---|
| **(Rex)** | Rex's own statement or decision, with its date |
| **(keeper)** | the Cognition keeper's proposal, which Rex may overrule |
| **estimate** | a number with no source, chosen to be reasonable and labelled; never tuned to force a result |
| **crude** | a V1 constant not given by the matrix text |
| **open** | not decided; never filled in by guessing |
| **V1 built** | implemented and frozen in Personality V1 (F1–F13) |
| **designed** | recorded as design; not implemented |
| **planned** | named and registered, not designed in detail |
| **proposed** | a candidate Rex has brought in, recorded for checking; not yet his decision |
| **superseded** | kept for the record; a later dated statement replaces it (named in place) |

**How changes are made.** Older statements are never silently rewritten: the original stays, the new statement is
recorded beside it with its date, and its status says whether it is accepted, proposed or superseded. The change log
(§16) says what came in, what changed and what was flagged.

**The revision standard (Rex, 2026-11-01, from the review consensus).** Every mathematical revision states the
intended cognitive operation, shows where the existing equation fails (a counterexample or a derivation), names the
properties the replacement must preserve, and says whether it is a proposal or an approved design. A plausible concern
alone never changes an equation. The standing risk the reviews named: substituting an easy numerical proxy (strength,
co-occurrence, pairwise agreement) for the transformation Rex intends.

**Section map.**
1. Founding principles
2. The structure of the eight functions
3. The eight functions, one by one (§3.9: the derivation table)
4. The stack, allocation and development (§4.8–§4.9: abstraction and dark abstraction)
5. The experience pipeline and memory
6. Meaning: semantic systems
7. Coherence: the shared primitive
8. Reference matching: Si
9. Applications: preference, attraction, groups, self and expression, communication, legitimacy, aura and culture
10. Personality V1 (frozen) in full
11. Personality V2 (designed; foundation built)
12. How the theory is tested
13. Results so far
14. Equation inventory
15. Open questions register
16. Change log

---

## 1. Founding principles

These hold for every part of the theory. Each is Rex's unless marked.

1. **Functions change how experience is processed, never what a person must do (Rex).** The eight-function model
   is the underlying cognitive structure. It changes attention allocation, interpretation, strategy generation and
   learning. Experience, knowledge and circumstances shape observable behaviour. No type is assigned a behaviour.
2. **The functions are the lower layer of abstraction (Rex, 2026-10-30).** They are primitives, "like binary code".
   The Big Five and neuroscience describe outcomes at a higher level. The strongest demonstration is that the
   function model **derives** higher-level traits (openness, conscientiousness, risk-taking, social behaviour)
   from its mechanisms rather than defining them (test T-2).
3. **Do not create a behavioural trait when the behaviour can emerge from more basic operations (Rex,
   2026-11-01).** There is no prejudice equation, no "label resistance" parameter, no honesty score, no patience bar.
4. **The label describes; it does not cause (Rex, corrected 2026-10-31).** Dispositions influence behaviour. The
   personality label describes the resulting pattern. A measured trait used to predict attention is an empirical
   approximation, never a neural mechanism.
5. **Hypotheses, never laws (Rex).** Every function sensitivity is a level-5 hypothesis tested like T-1 and T-2.
6. **Gaps stay gaps (Rex, matrix rule 4).** A function or position the matrix has not written stays off. It is
   never guessed.
7. **Memory belongs to the whole mind (Rex).** Memory is not Si's. Every function stores, recalls and articulates
   in its own way, and the functions in a stack modify each other's memory.
8. **All four stack functions exist from birth (Rex).** The hierarchy sets the speed of development and where focus
   is spent, never whether a function exists. There are no age unlocks.
9. **An inferior function is never prevented from leading a decision (Rex).** A dominant function has a statistical
   tendency toward more allocation. The rest of this statement is open (C-Q11).
10. **Personality never touches needs (keeper, from Rex's architecture).** It acts through the four processing hooks
    (attention, interpretation, generation, learning). It reads needs and never writes them, and it adds no goal.
11. **Objective world and subjective mind are separate (Rex).** A mind reproduces what it believes, never what is
    true. Its beliefs can be wrong. Every function works on the mind's perceptions and beliefs, never on the truth.
12. **Big Five is a measurement, never a driver (Rex).** Traits are measured from the emergent behaviour and
    compared with McCrae & Costa 1989.
13. **Formulas are versioned, never overwritten (Rex).** V1 stays frozen for comparison. A new version is built
    beside it and run on the same seeds.
14. **Never tune to force separation (Rex, 2026-11-01).** Results are reported as found, including negative ones and
    identical type pairs.

---

## 2. The structure of the eight functions

### 2.1 The eight functions and their four domains

The four domains come from the matrix's "Ecosystems" (Rex). Each domain belongs to one extraverted-introverted pair.

| Domain | Extraverted | Introverted | Kind |
|---|---|---|---|
| `space` (concrete, physical) | Se | Si | perceiving, sensory |
| `adaptation` (possibility, pattern) | Ne | Ni | perceiving, intuitive |
| `meta` (systems, logic, procedure) | Te | Ti | judging, thinking |
| `cohesion` (people, value, meaning) | Fe | Fi | judging, feeling |

The engine's `Domain` tag also allows `body`, `people`, `strategy` and `none` for cues, actions and latents. Actions,
cues and latents carry domain tags as host data.

**Two pairing systems, never confused.** This table pairs functions that share a **domain** (Se with Si, Ne with Ni,
Te with Ti, Fe with Fi: same information, opposite attitude). §2.2's orientation table pairs functions on a
**stack axis** (Se with Ni, Ne with Si, Te with Fi, Fe with Ti: opposite attitude and the other domain of the same kind,
the pairs that sit dominant–inferior or auxiliary–tertiary in every stack, §4.1). Ne and Si do not share a domain;
they share an axis. Equations that use domains read this table; equations that use axes read §2.2.

### 2.2 Attitude: extraverted and introverted

**V1 reading (Rex, matrix "Attitudes: extraverted vs introverted, for all eight functions" [CARLOS, 2026-10-24]).**
- **Direction of data.** Extraverted functions weigh external data more; introverted functions weigh internal theory
  more. Both channels are always present ("never pure").
- **Mastery and scope.** An extraverted tilt spreads attention wide ("scattered"); an introverted tilt focuses it.
- **Failure and resilience.** Extraverts fail more, get used to it and become resilient; introverts fear failure more.
- **The ratio.** The mix of the two attitudes in a stack sets a tilt `Δ` (§4.2).

**The orientation principle (Rex, 2026-11-02; kept as the organising principle in ENGINES.md, "Cognition audit
accepted"; not yet written into DESIGN §22).** Rex's newer and deeper reading:
- **Introverted functions (Si, Ni, Ti, Fi) organise incoming information against an internally maintained
  reference.** They preserve a reference structure and evaluate inputs against it.
- **Extraverted functions (Se, Ne, Te, Fe) adapt their operation to changing external conditions.** They hold an
  operative objective and let the means, meanings or arrangements change.
- **"Fixed" and "fluid" describe what an operation prioritises, never whether it can learn.** Introverted references
  update through learning; an extraverted objective can itself change.
- **The pairs set one domain against two orientations:**

| Pair | Extraverted: adapts | Introverted: preserves |
|---|---|---|
| Ne / Si | generates alternative pathways and possibilities | learned references and precedents |
| Se / Ni | responds to changing immediate physical conditions | an integrated pattern or anticipated trajectory |
| Fe / Ti | resolves meaning through changing interpersonal contexts | conceptual definitions and logical consistency |
| Te / Fi | reconfigures external systems toward an objective | internal evaluative coherence and personal significance |

- **Te, resolved by the principle (Rex).** Earlier, Te was described as "semantically fixed", which seemed to break
  the pattern. The factory example resolves it: Te keeps the measure fixed ("units produced per hour") so that it can
  freely rearrange staffing, machines and methods. **Fixed vocabulary in service of fluid structure.** Te is flexible
  about methods, not about the objective in force, which is why a Te user can look rigid while changing everything
  around them. Whether Te also changes its measures when another measure would serve the objective better is open
  (Te-Q1).
- **What each extraverted function holds steady while it adapts (Rex, refined 2026-11-02):** Te holds the
  performance criteria and changes procedures, resources and arrangements. Fe holds the interpersonal objective and
  changes meanings, interpretations and expression. Se holds engagement with present conditions and changes actions
  and responses. Ne holds exploration and changes the possibilities generated. The objective of an extraverted
  function is identifiable within an operation but can change through experience, competing motivation or another
  function's influence. It is not permanently fixed (Rex's refinement).
- **Where an extraverted objective comes from (open, Ori-Q1).** One suggestion was that the axis partner supplies the
  anchor: Te optimises toward what Fi values, Ne explores around what Si holds as precedent, Se acts within the
  trajectory Ni anticipates. For Fe, the immediate objective may come from the group, with Ti supplying a consistency
  check. **Keeper note:** in the engine, objectives are needs and goals (DESIGN §2.2), and personality never sets a goal. The
  compatible reading is that the partner shapes how outcomes are weighed (evaluation), not what the mind wants. The
  choice is Rex's.
- **A common interface (proposed; Rex 2026-11-02):** `Y_f = F_f(X, R, G, C)`, where `X` is the incoming information,
  `R` an internally maintained reference, `G` the active objective, `C` the external circumstances, and `Y_f` the
  function's contribution. The four domains set what is processed; the orientation sets whether the operation mainly
  evaluates against `R` or adapts to `C` in pursuit of `G`. Two families: introverted `Y_I = F(X, R_i)`, extraverted
  `Y_E = F(X, C_t, G_t)`. **Not a single rigidity slider (Rex):** the reference and the objective are different
  variables. In the engine they already are: `R` is stored state (beliefs, the self-model, meaning pools), `G` is
  needs and goals, `C` is the current context (bubble, audience, present cues).
- **Feedback loops between the pairs (Rex).** Ne explores and Si compares, and the comparison shapes the next
  exploration. Se meets the present and Ni integrates it into a trajectory. Fe resolves contextual meaning and Ti
  checks consistency. Te reconfigures toward an objective, and its consequences can change Fi's valuations. Each pair
  is a loop between external adaptation and internal stabilisation.
- **Status:** a candidate unifying architecture. Do not replace V1 with it. Next step (keeper, offered): a table
  mapping each V1 formula and each V2 operation to its domain, its reference or objective, what it preserves, what it
  changes and what it learns (§11.6).

### 2.3 Perceiving and judging

- **Perceiving functions feed what enters the meaning pool (Rex, 2026-10-31, accepted provisionally):** Se the
  details in the current sensory input; Si comparison with personally retained experience; Ne alternative
  interpretations and possible connections; Ni patterns inferred across many observations.
- **This is never an exclusive boundary (Rex).** Judging functions (Fe, Te, Fi, Ti) also bias upstream which
  information gets attention, which connections matter and which interpretation is kept. Every function has two
  roles: by attitude (extraverted filters, introverted encodes; §5.1) and by kind (perceiving feeds, judging
  assigns). The two axes coexist.

### 2.4 Systems versus people (Rex, matrix "Systems vs people" [CARLOS, 2026-10-24])

- **The shared mechanism is "what it learns from a loss".** Each extraverted function keys into its domain: Te into
  systems (meta), Ne into adaptation, Se into space, Fe into cohesion. It is "first to key into it, most aggressive
  and effective" in learning there.
- **The introverted form outpaces all (Rex, "Refinement: the introverted form outpaces all").** Within a domain, the
  introverted function ends up learning more deeply than the extraverted one, at equal weight. The timing claim is
  [DERIVED] and not encoded in V1.

### 2.5 Ecosystems

The four domains compete at the level of society (Rex, "Ecosystems"). That is Society's claim, not a mind formula.
Cognition supplies only the learning speeds it rests on.

---

## 3. The eight functions, one by one

Each entry gives: the definition as it stands, its sources, its role in each mechanism, its V1 formulas, its V2
operation, its tests and its open items. **Bold** marks what is Rex's.

### 3.1 Se: concrete reality observation (extraverted sensing)

- **Definition (Rex, matrix "Se: concrete reality observation" [CARLOS]).** The domain is what is physically present
  now. Judgements are "revised continually by the current moment". Precision is highest on the targeted thing.
- **Focus (Rex, THEORY.md §1).** "sensation → Se": the one face-theory line that feeds attention.
- **Orientation (Rex, 2026-11-02).** Holds engagement with present conditions; changes its actions as conditions
  change. Se users do not feel others can predict their movements: they experience action as responsive to the
  present, while an Ni observer may still see the pattern in their choices. Both can be true.
- **Attention.** Pertinence on cues tagged physical and present (V1 F6). In the experience pipeline, Se pulls the raw
  content of a scene, closer to what the image literally is (§5.1).
- **Meaning.** Feeds the details in the current sensory input into the pool (§6.3).
- **Memory.** **open** (C-Q16).
- **Coherence principle.** **open** (C-Q24).
- **Attraction sensitivity (hypothesis).** Sensory presentation (§9.1).
- **Group beliefs (hypothesis).** Weights immediate observable characteristics and behaviour now; need not build the
  same lasting generalisation (§9.3).
- **V1:** F6 (pertinence, Weber precision on the target, η for present observations of people); F4 (learning in
  `space`); F12 (with Ni).
- **V2 operation (designed): immediate response.** For each precondition with a present-tagged observation this
  epoch, `p' = (1 − ψ)·p_belief + ψ·p_present`, `ψ = min(1, A^att_Se · g_Se)`. A candidate ineligible under a stale
  belief becomes eligible when a present cue supports it.
- **What "the present moment" is (Rex, 2026-11-01; proposed).** Rex's observation: the present moment is the
  impression given in that moment. Taking up space, being cool ("aura farming"), saying something nerdy that loses
  aura are present-moment events; Se users tend not to want to lose aura, which Rex links to primal dominance displays
  (wolf packs establishing superiority through acts). Rex's own refinement in the same paste: aura is present for all
  four extraverted functions, what a society counts as aura varies, and Se's is the most obvious and most basic form
  (§9.9).
- **Candidate Se operation (proposed, 2026-11-01).** The present moment as the current observable state of the
  environment, including the signals others can perceive:

```
Y_Se(t) = F(O_t, ΔO_t, Aff_t)      O_t current observations; ΔO_t their change since the last epoch;
                                   Aff_t the action possibilities available now
```

  Se prioritises actionable information from the current observable state. The V2 operation above is the `Aff_t` part
  (present evidence on preconditions); `ΔO_t`, change detection, is new. Which Se's defining transformation is,
  affordances, change or both, is open (Se-Q1).
- **Keeper check.** Recorded as Rex's observation with a route that needs no new mechanism: Se's attention weight on
  present observable cues includes other people's visible reactions, so a change in how one is being received is
  salient to an Se-weighted mind. Whether the mind then acts to avoid losing aura comes from its own needs and beliefs
  (principle 10), never from a coded Se motive; an Se-weighted mind indifferent to prestige stays possible. "Se users
  avoid aura loss" is therefore a prediction to test, not a rule (Se-Q2).
- **Se and Ni, the two ends of one axis (proposed).** `Se: O_t → immediate affordances`; `Ni: O_{0:t} → integrated
  relational model` (§3.4). A fighter: Se reads the opponent's stance, weight and distance and finds the opening that
  exists now; Ni integrates the opponent's recurring movements and anticipates the opening several moves later. One
  situation can exercise both; the ledger (§11.5) measures which one changed the decision.
- **S1 finding.** The ledger's Se group had a utility effect whose interval excludes zero (§13.2).

### 3.2 Si: bodily precision and reference matching (introverted sensing)

- **Definition (Rex, matrix "Si: bodily precision" [CARLOS]).** Mechanism: details the self and the situation
  physically, accumulates over time, "fleshes out the organism". Whether the weakness emphasis is central is open (B1).
- **Reference matching (Rex, 2026-11-01).** Si preserves coherence with an internalised representation of what
  something is supposed to be: a role, a character, a precedent. **It reproduces what it believes a knight is, never
  what a knight objectively is.** **Si does not preserve the past; it preserves an interpretation of the past, which
  can be wrong.** The full mechanism is §8.
- **Orientation.** Preserves internalised experiential references; changes current interpretations relative to
  remembered precedent.
- **Memory (Rex, §5.3).** Stores physical detail and the self in the situation; recall triggered by sensory
  similarity; articulation high and concrete. Si is the stereotypical memory function, but memory is not Si's.
- **Meaning.** Feeds comparison with personally retained experience into the pool.
- **Coherence principle (Rex).** Consistency with an internalised representation or precedent.
- **Attraction sensitivity (hypothesis).** Familiarity and remembered ideals.
- **Group beliefs (hypothesis).** Repeatedly associates observable characteristics with remembered experiences or
  learned social representations; compares a current person against an internal reference.
- **ISTJ against ISFJ (Rex).** The same Si operation over the same role gives different outcomes by the auxiliary:
  Te reads the role through explicit rules and procedures, Fe through social meanings and expectations. Neither is
  correct by construction; each makes its own kind of interpretive error.
- **Si against Fi (Rex).** Fi may reject a role that conflicts with its personal evaluative structure; Si may keep a
  role that matches the learned understanding of who one is supposed to be. A mind can identify strongly as a knight
  while disliking much of knighthood.
- **V1:** F5 (outpaces in `space`); F8 (body and person episodes kept longer; person-belief half-life longer).
- **V2 operations (designed):** reference matching and reference update (§8.3).
- **S1 finding.** The ledger's Si group had a utility effect whose interval excludes zero (§13.2).

### 3.3 Ne: theoretical recombination (extraverted intuition)

- **Definition (Rex, matrix "Ne: theoretical recombination" [CARLOS]).** Mechanism: recombines possibilities into new
  sequences and connections. Whether Ne acts on them or only predicts is open (B2).
- **Fate (Rex, matrix "Ne and Ni: fate").** "Ni is fate. Ne holds back fate."
- **Orientation (Rex, 2026-11-02).** Branching pathways; dislikes a fixed path. Holds exploration and changes the
  possibilities it generates.
- **Attention.** In the pipeline, Ne weights what a scene implies and what is possible (§5.1).
- **Meaning.** Feeds alternative interpretations and possible connections. Whether Ne actively resolves meaning is
  open (C-Q19).
- **Memory.** **open** (C-Q16).
- **Coherence principle.** **open** (C-Q24).
- **Attraction sensitivity (hypothesis).** Novelty.
- **Group beliefs (hypothesis).** Generates alternative explanations, which may challenge or reinforce a
  generalisation. An Ne-weighted mind may already hold that "doctors do not know every method" (Rex's doctor example).
- **V1:** F9 (two-step compounds in generate); F11 (holds back commitment); F4 (learning in `adaptation`).
- **V2 operation (designed): branching.** Adds `k_Ne = round(A^eval_Ne · g_Ne · 2)` two-entry compositions chosen by
  novelty `1/(1 + n_episodes(pair, context))`.

### 3.4 Ni: self-referenced strategy (introverted intuition)

- **Definition (Rex, matrix "Ni: self-referenced strategy" [CARLOS]).** Mechanism: anticipates others by asking how
  it would strategise in their position. "Extraverted vs introverted perception" [DERIVED].
- **Fate (Rex).** "Ni is fate": Ni raises commitment.
- **Memory (Rex, §5.3).** Stores an abstract lattice (a crystal structure); recall triggered by pattern match; low
  concrete recall unless Te organises it. Ni with Te organises the lattice that Ni alone cannot recall concretely.
- **Coherence principle (Rex, tentative).** Consistency with an integrated underlying pattern or anticipated
  trajectory (C-Q24). Under the 2026-11-01 proposal below, the pattern is the reference and the trajectory one of its
  products.
- **Open, and why it matters (Rex, 2026-11-02).** Does Ni preserve an anticipated outcome, a causal model of how
  events connect, or one interpretation toward which observations are organised? These are mathematically different:
  an anticipated outcome judges events by whether they support it; a causal model can revise its prediction while
  keeping its structure. **No V2 Ni operation is built until this is settled, and V1's other-mind projection (F10)
  is never substituted as V2's Ni.**

#### Ni as relational integration (proposed, 2026-11-01; candidate answer to C-Q24)

Brought in by Rex from a ChatGPT proposal reviewed by Gemini (two answers) and Venice, with ChatGPT's assessment of
the three reviews. Recorded as a proposal; whether it becomes Ni's foundation is Rex's decision (Ni-Q1).

- **The claim.** Ni constructs and maintains an **integrated internal representation of relationships** between
  observations. Causal explanations and anticipated trajectories are **products** of that structure, not the
  reference itself: "the anticipated confrontation is not the internal reference; the reference is the integrated
  pattern that makes that anticipation possible." This answers C-Q24's three-way choice (outcome, causal model,
  pattern) with the most general option: a relational pattern of which causal models and trajectories are special
  cases.
- **Against Si (the ten conflicts).** Two minds observe the same ten conflicts between two factions. Si keeps
  experiential references (who attacked, what happened, which circumstances resemble earlier encounters) and
  predicts from what happened under comparable circumstances; it updates by revising remembered references. Ni keeps
  the relations connecting the conflicts (escalation, reciprocal retaliation, deteriorating trust) and predicts from
  what that structure implies; it updates by reorganising the pattern. Both can predict the next conflict; the
  difference is the representation that produces the prediction. The relations survive a change of surface details
  (faction names, weapons, places).
- **The representation.** A typed relational graph `M_i = (V_i, E_i, W_i)`: `V_i` abstract concepts, events or
  inferred states; `E_i` typed relations (temporal, causal, spatial, strategic, conceptual); `W_i` the mind's
  confidence in each relation. Venice's warning holds: a flat weighted graph cannot hold relations between relations,
  which structural transfer needs, so relations can themselves be nodes (a typed graph with reified relations, or a
  hypergraph). Example: not only "retaliation follows threat", but "the threat–retaliation link is strengthened by an
  escalation loop".
- **The objective (proposed; an outline, not yet computable):**

```
M* = argmin_M [ E_trajectory(M) + λ·K(M) + γ·E_relations(M) ]
E_relations(M) = Σ_{(a,b) ∈ R} w_ab · d( r_ab^observed, r_ab^M )
```

  `E_trajectory` the error in anticipated developments; `K(M)` the representational complexity; `E_relations` how
  poorly the model keeps the relations the mind has inferred from observation; `λ`, `γ` the competing pressures.
  `r^observed` is the mind's own estimate of a relation, never privileged access to objective causality (principle
  11), so the term compares two subjective structures.
- **What is not yet defined (Venice; accepted in ChatGPT's assessment).** How observations become candidate
  structures; how relations are represented and compared (`d`); how `E_trajectory` and `K` are computed; how the mind
  chooses between competing structures; how the result reaches Cognition's predictions and decisions; whether
  `E_relations` double-counts `E_trajectory`. Until then this is a design objective, not an algorithm (Ni-Q2, Ni-Q3).
  Candidate toolkits named in the paste: structure mapping (Gentner 1983), minimum description length (Rissanen 1978),
  Bayesian model comparison; structure learning with a complexity prior is one worked precedent (Kemp & Tenenbaum
  2008, keeper-added).
- **Apophenia, the failure mode (Gemini B; refined by ChatGPT).** An Ni-weighted mind can force a new observation into
  an existing template on structural resemblance alone: two of three events that preceded betrayal before, so it
  anticipates betrayal. A complexity penalty does not prevent this: one grand theory of everything is simple. The
  paste separates `E_prediction` (how well outcomes are anticipated) from `E_contradiction` (how much observed evidence
  conflicts with the represented relations), with care not to count one error twice, and keeps uncertainty about
  whether a relation exists at all. A pattern can be coherent, predictive and wrong at once.
- **Rigidity, if it emerges (proposed; not a result).** The mind can keep the model and reinterpret the observation,
  or reorganise: reorganise when `ΔE > C_revision`, the expected gain in fit against the cost of restructuring, with
  `C_revision` from accumulated confidence and model size, never a stubbornness coefficient. Gemini's claim that this
  already explains Ni rigidity is not adopted: rigidity is a consequence to test.
- **Ni against Ti (ChatGPT; the boundary all three reviews missed).** Ni asks what pattern connects these
  observations; its reference is an integrated inferred structure; its output a pattern reading and its implications;
  its error a compelling pattern that is not real. Ti asks whether the conceptual relations are consistent; its
  reference is definitions and logical relations; its output a coherence assessment; its error a consistent structure
  on false premises. Interfaces: Ni infers that events belong to one pattern, Ti checks the explanation's consistency,
  Te uses it to reorganise external circumstances, Se supplies fresh observations that can contradict it.
- **Not adopted from the reviews.** That Ni is inherently more visionary, more accurate or more rigid; that Ni is
  merely structure mapping renamed (structure mapping is a general capability; what would be Ni's is the priority given
  to building, keeping, revising and recruiting relational structures over time). Venice's point that the eight
  functions are stipulated, not derived, is correct and stands: the architecture starts from Rex's eight categories.
- **Keeper check against the engine (2026-11-01).**
  1. *No second store.* `V`, `E` and `W` must be beliefs in the one belief store (relations as belief records with
     their probabilities), the way `cognition.belief.system_formation` is registered: "a configuration of the built
     belief update, never a second belief store". V2's rule "no duplicate memory state" (§11.1) requires it.
  2. *Rigidity without a new parameter.* The belief rule already resists isolated contradictions (accumulated counts
     move little), and "reinterpret the observation" already exists as attribution (`cognition.learning.attribution`:
     blame the circumstance or chance instead of the pattern). But those are shared engine parameters and mechanisms,
     which V2 never attributes to a function (§11.5). So Ni's share of rigidity must come from its own operation, for
     example its structure deciding which cause attribution considers, and `C_revision` needs a form that does not
     duplicate belief inertia (Ni-Q4).
  3. *Fit with what is already recorded.* Rex's memory profile for Ni (§5.3: an abstract lattice, recall by pattern
     match, low concrete recall) is what a relational graph that drops surface detail would give. Ni's open encoding
     dimension in §5.5 ("pattern") could be the relation features this operation keeps (C-Q17).
  4. *Constants.* `λ`, `γ` and `w_ab` have no values and no sources: **open**, never tuned.
  5. *Orientation.* An internal reference (the relational structure) against which inputs are organised: consistent
     with the orientation principle (§2.2). V1's F10 stays V1's.
  6. *The matrix.* Rex's matrix entry for Ni ("self-referenced strategy") is V1's source and is not edited from here;
     whether it is a product of relational integration or a separate statement is Rex's (Ni-Q1).
- **Second review round (2026-11-01; Venice, a mathematical reviewer, ChatGPT), with the keeper's check of each.**
  1. *The objective can validate itself (valid).* `E_relations` compares the model with relations the mind itself
     inferred, so a model can agree with its own inferences and score well while wrong. **Required:** an independent
     check: `E_trajectory` is measured against later observations the model did not produce. That is the term that
     makes apophenia costly.
  2. *A motivational anchor (Venice; Ni-Q5).* Venice: `M*` optimises model quality without serving a need, the same
     defect as C-Q27. ChatGPT's reply: a learning objective that governs how a representation updates is not an
     organism-level goal. **Keeper check:** ChatGPT's reply holds if, and only if, `M*` acts in the learning hook (how
     the structure updates when observations arrive, as belief update already does) and never in decision: Ni never
     adds candidates or utility for gathering information to improve its model; any such seeking comes from a need.
     Stated that way it respects principle 10 without amending it.
  3. *Ni's "priority" has nowhere to live (Venice; overstated).* The baseline `B_f` (the light) is exactly "this mind
     weights Ni by default", and allocation carries it per decision. What is true is that `B_f` is V1's crude
     position-derived weight (C-Q10), so the priority is representable but not yet sourced.
  4. *V1's Ni never fired (Venice; partly).* In S1 the generate hook never changed a candidate, so F9–F11, V1's Ni
     included, showed no effect. Under the four-class rule that is **not exercised** (S1 is a space scenario with no
     compound or other-mind opportunities), not a negative result; S3 and S4 are designed to exercise F10 and F11. Still
     true: there is no V1 evidence about Ni for V2 to beat.
- **Experiment.** §12.5 (surface against structure, with and without a hint).
- **Attraction sensitivity (hypothesis).** Symbolic meaning and anticipated trajectory.
- **Group beliefs (hypothesis).** Integrates observations into an overall reading of a group or its intentions.
- **V1:** F10 (self-simulation of another mind); F11 (raises commitment); F12 (with Se, a settled idea of who someone
  is); F5 (outpaces in `adaptation`).

### 3.5 Te: external systems and efficiency (extraverted thinking)

- **Definition (Rex, matrix "Te" notes, quoted in INTJ notes [CARLOS]).** "Accepts all data as good data"; more
  examples give quicker meaning.
- **Semantics (Rex, §6.2).** One meaning, anchored to the shared external definition, meant to work across every
  bubble; changes meaning only by changing the shared standard, and pushes others to adopt it; notices departures
  from the shared definition.
- **Orientation (Rex, 2026-11-02).** Reconfigures external systems toward an objective: fixed measures, fluid
  arrangements (§2.2).
- **Coherence principle (Rex).** External definitional and procedural consistency.
- **Memory.** **open** (C-Q16). When both are in the stack, Te organises Ni's lattice.
- **Attraction sensitivity (hypothesis).** Demonstrated competence.
- **Group beliefs (hypothesis).** Adopts external classifications, rules and institutional descriptions.
- **With Si (ISTJ, Rex).** Reads a role through explicit rules and procedures; its rigidity is treating a rule as
  authoritative despite changed circumstances.
- **V1:** F13 (testimony reliability floor); F4 (learning in `meta`). Te with inferior Fi is off.
- **V2 operation (designed): external reconfiguration.** For the active goal, adds compositions of repertoire entries
  (reordered or substituted steps) that maximise believed goal progress per unit of cost and duration; removes none.

### 3.6 Ti: internal conceptual consistency (introverted thinking)

- **Definition.** No core matrix entry yet ("Not yet written"); off in V1.
- **Coherence (Rex, 2026-11-01).** Assembles conceptual pieces by logical compatibility ("Lego pieces that fit
  together"). Organises concepts and their relationships; seeks logical coherence; rejects contradiction; preserves
  conceptual identity; can struggle with unresolved logical inconsistency (§7).
- **Semantics (Rex, §6.2).** One meaning per reasoning chain, held by internal consistency; reconstructs only by
  explicit redefinition; notices a switch of meaning mid-argument (equivocation).
- **Memory (Rex, §5.3).** Connective: what links to its structure sticks; recall triggered by logical connection to
  existing pieces; articulation high when connected, weak for isolated facts.
- **Orientation.** Preserves internal conceptual relationships.
- **Attraction sensitivity (hypothesis).** Coherence of thought.
- **Group beliefs (hypothesis).** Takes in a group claim if it fits its internal explanatory structure.
- **V2 operation (designed): coherence with the conceptual criterion** (§7.4).

### 3.7 Fe: external contextual and interpersonal coherence (extraverted feeling)

- **Definition.** No core matrix entry yet; off in V1. Partial statements exist (Fe's row in "Systems vs people"),
  held until Rex writes the core entry.
- **Semantics (Rex, §6.2).** A large pool built from many external bubbles; maps where each meaning comes from;
  context-weighted selection by the bubble one is in; low reconstruction threshold, driven by the group's usage, so
  the pool drifts; notices who present would be hurt by a word.
- **Selection and reconstruction (Rex, C-Q18).** Both: selection in a recognised bubble, reconstruction when no held
  meaning fits; success follows the similarity of the current bubble to the exposure history.
- **Coherence (Rex).** Assembles through contextual integration: how a combination will be read by the audiences
  present, whether it communicates a recognisable social identity. `C_Fe(X, c) = meaning(X, c)`.
- **Memory (Rex, §5.3).** Stores comprehension of what it is looking at; recall triggered by social or situational
  meaning; grasps what it saw.
- **Pipeline (Rex).** Fe (with Se) pulls the raw content of a scene; Fe and Te shape what is noticed in the first place.
- **Self and labels (Rex, 2026-11-01).** A mind whose meanings resolve by context may also hold a context-dependent
  self. A fixed label ("you are X") can be accurate in some rooms and wrong in others. Fe against inferior Ti:
  contextual compatibility against definitional consistency. Variation emerges from experience, never from type
  (§9.4).
- **Attraction sensitivity (hypothesis).** Collective valuation. Fe shapes sensitivity, never conformity.
- **Group beliefs (hypothesis).** Learns how groups around it judge other groups.
- **With Si (ISFJ, Rex).** Reads a role through social meaning, often more strictly than any rule states; its
  rigidity is treating a socially constructed interpretation as authoritative despite conflicting evidence.
- **V2 operation (designed): contextual semantic modification** (§6.4).

### 3.8 Fi: internal evaluative coherence (introverted feeling)

- **Definition.** No core matrix entry yet; off in V1.
- **Coherence (Rex, 2026-11-01).** Organises individual likes into a coherent system of personal meaning: assembles
  personally meaningful pieces by evaluative compatibility. Seeks evaluative coherence; rejects internal
  incompatibility; preserves personal significance; can struggle to express why something feels incompatible.
  **Fi's subjectivity need not imply randomness:** it can be a highly systematic construction whose criteria are
  personal rather than explicitly logical.
- **Two levels (Rex, C-Q22).** Compatibility among valued things builds an evaluative structure and an identity, and
  the identity then constrains which new combinations feel compatible. Identity need not be the source of every
  preference: it can emerge from accumulated preferences and feed back. The gothic example: black clothing, silver
  jewellery and certain silhouettes, first liked independently, become a coherent aesthetic; later, items not
  disliked in themselves are rejected because they conflict with the established identity.
- **General, not aesthetic (Rex).** The same operation reaches music and art, personal values, romantic preference,
  identity, moral judgement, and attachment to objects, places and people.
- **Semantics (Rex, §6.2).** One fixed internal referent, authored from personal values (its own bubble), plus a
  **lossy encoder** to public words: the referent does not drift, its expression does. Fi's "what it notices" is open.
- **Memory (Rex, §5.3).** Deep and experiential; recall triggered by emotional resonance; low articulation: it
  remembers but cannot explain well. Fi can grow more internally structured without growing more articulate.
- **Developmental prediction (Rex).** Younger Fi-weighted minds lean on individual preferences; accumulated experience
  produces organised evaluative structure and identity-based judgement, from learning history, never an age unlock.
- **Attraction sensitivity (hypothesis).** Personal significance.
- **Group beliefs (hypothesis).** Links a group, symbol or characteristic to personally significant positive or
  negative experiences.
- **V2 operation (designed): coherence with the evaluative criterion** (§7.4).

### 3.9 The derivation table

One row per function, the same questions for each, so a new statement can be checked for what it adds and what it
overlaps. Only what is recorded above is filled in; everything else is **open**. Domain and attitude are in §2.1;
orientation in §2.2.

| Function | Holds (reference or objective) | Transformation | Distinct from | Failure mode | Distinguishing test |
|---|---|---|---|---|---|
| Se | engagement with present conditions | present evidence on preconditions (V2); change detection proposed (§3.1) | Ni (same axis): now against across time | open | Se-Q1; S1 (Se ledger effect) |
| Si | interpreted experiential references | reference matching and update (§8) | Ni: surface-indexed references against relations | treating a remembered rule or social reading as authoritative despite change (ISTJ, ISFJ) | knight test (§8.4); §12.5 |
| Ne | exploration | branching: novel two-entry compositions (§3.3) | Si (same axis); Ni: external alternatives against internal integration | open | open |
| Ni | an integrated relational pattern (proposed) | relational integration (proposed, §3.4) | Si (§3.4); Ti: pattern-finding against consistency-checking | apophenia: a compelling pattern that is not real | §12.5 |
| Te | the performance measure in force | external reconfiguration toward the objective (§3.5) | Fi (same axis) | treating a rule as authoritative despite changed circumstances (with Si) | open |
| Ti | conceptual definitions and logical relations | coherence, conceptual criterion (§7) | Ni (§3.4); Fi: same primitive, other criterion | a consistent structure built on false premises | coherence tests (§7.5) |
| Fe | the interpersonal objective | contextual semantic modification (§6.4) | Ti (same axis); Fi: audience-dependent against audience-independent | a socially constructed interpretation held authoritative (with Si) | wardrobe test, audience variant (§7.5) |
| Fi | personal evaluative structure and identity | coherence, evaluative criterion (§7) | Ti: same primitive, other criterion; Fe | cannot articulate why something feels incompatible | wardrobe test (§7.5) |

---

## 4. The stack, allocation and development

### 4.1 The stack (Rex, THEORY.md §3a, §3d)

A type is an ordered stack of four functions: dominant, auxiliary, tertiary, inferior (for example ENFJ = Fe Ni Se
Ti). Positions 5–8 (Oppositional to Devil) are named in the matrix but not written, so they are off. The sixteen
stacks are stored in `personality/eight-function/stacks.json`.

### 4.2 V1 weights and tilt (V1 built; crude)

```
ω_f = (5 − i) / 4        positions i = 1…4 give 1, 0.75, 0.5, 0.25;   ω_f = 0 off the stack
Δ = ρ_E − ρ_I            ρ_E = Σ_{f extraverted} ω_f / Σ ω_f,   ρ_I = 1 − ρ_E
```

Source: matrix "The advantage–hypocrisy cycle", **Stack position and confidence**: "the lower it sits in the stack,
the less confident the user is". Only the order is sourced; the linear form is crude. With the standard alternating
stack, `Δ = +0.2` for an extraverted dominant and `−0.2` for an introverted one.

### 4.3 The light and the crystal: dynamic allocation (Rex, 2026-10-30; designed)

- **The hierarchy is a baseline, never a fixed allocation per decision (Rex).** An ESTP generally favours Se, but Ti,
  Fe or Ni can be the primary influence on a given decision through situation, experience and motivation. The
  variation emerges from the mathematics, never from hardcoded exceptions.
- **The light** is the baseline preference `B_f` (the hierarchy). It never changes.
- **The crystal** is the learned activation conditions: experience changes how strongly a situation activates a
  function. A painful record of appearance-led partner choices raises future-oriented evaluation in later partner
  choices. **Misattribution is allowed**: the lesson learned can be the wrong one.
- **Attention allocation is not evaluation influence (Rex).** A function can receive most of the processing without
  deciding the action. Two allocations: attention (weights the pertinence hook) and evaluation (weights interpret and
  generate).
- **The form (Rex, softmax preferred):**

```
A_f(t) = B_f·R_f(t)·L_f(t)·M_f(t) / Σ_j B_j·R_j(t)·L_j(t)·M_j(t)
       = softmax_f( ln B_f + ln R_f + ln L_f + ln M_f )
```

`R_f` relevance to the situation; `L_f` learned competence and habit (part of the crystal); `M_f` motivational and
emotional modulation.

**Superseded for V2 (Rex, 2026-11-02, §4.5).** `L_f` mixed competence and habit. §4.5 splits them: habit `H_f` takes
`L_f`'s place in allocation, and competence acts only through the execution gain `g_f`. This form is kept as the
2026-10-30 statement.

### 4.4 Development over a life (Rex, 2026-10-31; designed)

- All four stack functions are present and usable from birth. The dominant gets the greatest early allocation and
  develops fastest; the auxiliary develops to support it; the tertiary later; the inferior last, yet usable at any
  age. Learning is strongest for data relevant to the first function, then the second, less for the third and fourth.
- **Four separate quantities per function (Rex; forms provisional):**

```
B_f                                   baseline preference (the light); never changes
A_f(t)                                active allocation (§4.3)
E_f(t + Δt) = E_f(t) + A_f(t)·R_f(t)·Δt          accumulated function-relevant experience
C_f(t) = C_f,0 + k_f·log(1 + E_f(t))             developed competence, diminishing returns
```

**Superseded as a definition (Rex, 2026-11-01, §4.7).** This form makes competence rise with exposure whether or not
the operation improves. Experience is an input that may produce competence, not competence itself. `E_f` stays as
practice history; the logarithmic curve stays as a hypothesis about development, to be tested (§12.7).

- **Feedback (Rex).** Competence feeds back into future allocation, so two people with one hierarchy diverge by
  environment: an ESTP raised on abstract planning develops more Ni facility than one rewarded for immediate action.
  **Read with §4.5 (2026-11-02):** in V2 the feedback is indirect, never a competence multiplier in allocation. A
  competent function's operation succeeds more often; the mind learns beliefs about those successes; its choices,
  following its beliefs, lead it into more situations in that domain, so the relevance `R_f` it meets rises, which
  raises `E_f` and so the habit `H_f`. The ESTP example still holds by that route.
- **Invariant (Rex).** Cognitive competence ≠ domain knowledge ≠ learned skill ≠ intelligence.
- **Open.** Sources and ranges for `k_f`, `C_f,0` and the form of `R_f` (C-Q20); whether `E_f` decays without
  practice (C-Q21).

### 4.5 Usage is not competence (Rex, 2026-11-02; V2 design)

Choosing to use a function and being good at it are different quantities. In V2 (§11.3):

```
A^x_f = softmax_f( ln B_f + ln R^x_f + ln H_f + ln M_f )     x ∈ {attention, evaluation}
H_f   = (1 + E_f) / (1 + Ē)                                  usage habit: the choice to use f grows with use
M_f   = exp( Σ_k p_k · rel(f, d_k) )                         motivation, from the mind's own need priorities
g_f   = C_f / C_f,0                                          competence scales how strongly the operation acts
```

Competence never enters allocation. Habit and motivation forms are estimates (sources: habit strength rises with
repetition, Lally et al. 2010; Wood & Neal 2007).

**Two defects found 2026-11-01 (review consensus; both verified by the keeper against these equations and against
`experimental/personality-v2/v2.ts`, built by 5443 with exactly these forms).**
- **Habit lock-in.** `Ē` is shared by every function, so it cancels when the softmax normalises:
  `A_f / A_j = (B_f R_f M_f / B_j R_j M_j) · (1 + E_f)/(1 + E_j)`. The habit ratio between two functions grows without
  bound: 10,000 against 10 experience units is about 909 to 1, so a situation would need to be about 909 times more
  relevant to the weaker function to recruit it. That breaks principle 9 in practice (an inferior function is never
  prevented from leading) and it does not match its own source: Lally et al. 2010 found habit strength rising on an
  asymptotic curve, steep early and flattening with repetition, not linearly.
- **Competence as loudness.** `g_f = C_f / C_f,0` multiplies each operation's strength (`ψ`, `φ`, the `k` counts, the
  coherence and Si terms). A practised function therefore pushes harder without working better: an experienced Ti makes
  a wrong coherence judgement count more, without detecting contradictions any better.

### 4.6 Saturating habit; competence as processing quality (Rex, 2026-11-01; adopted direction, forms open)

Rex adopted the review consensus as the V2 direction. It supersedes `H_f` and `g_f` of §4.5 (kept above for the record).

**Habit saturates (strong candidate):**

```
H_f = 1 + h · (1 − exp(−E_f / E_0))
```

- `H_f = 1` with no experience; rises with diminishing returns; approaches `1 + h`, so the habit ratio between any two
  functions is at most `1 + h` and a strong enough situation can always recruit a weaker function (principle 9).
- `E_0` sets how fast habit forms; `h` how much habit can ever weigh. Both **estimate**. The curve's shape is
  **researched** (Lally et al. 2010: an asymptotic curve; median 66 days to reach 95 % of the plateau, range 18 to 254,
  in daily repetitions). How `E_f`'s units (allocation × relevance × time) map onto repetitions is open (H-Q1); `h` has
  no source (H-Q2).
- **Values the Cognition keeper set for unit 5463 (estimates, 2026-11-01):** `h = 1`, so habit can at most double a
  function's weight against another's; `E_0 = 22`, which puts 95 % of the plateau at `3·E_0 = 66`, Lally's median,
  read as if one unit of `E_f` were one daily repetition (that reading is H-Q1). Both stay Rex's to set.
- **Saturation is not decay.** A deep habit still does not weaken with disuse under this form; that stays C-Q21, a
  separate learning-and-forgetting rule. Lifetime experience `E_f` still feeds competence even when habit changes.
- **Provisional, held fixed (Rex's paste, 2026-11-01).** `h = 1` and `E_0 = 22` are transparent simulation settings, not
  psychological findings; `E_0` means nothing until an experience unit is defined (H-Q1). They stay unchanged during the
  Ti experiment (§12.7). No decay is built yet.
- **A cap is not a guarantee.** Capping habit does not by itself let an inferior function lead: allocation still
  depends on `B_f`, relevance, motivation and eligibility. Principle 9 needs a direct test of the whole allocation rule
  (P9-T, §15).
- **Disuse, four quantities kept apart (proposed, for C-Q21).** Practice history `E_f` never disappears. Habit, how
  readily a context recruits an operation, may weaken when that context recurs **and another function is chosen**; that
  history is recorded separately from time that simply passes with no opportunity. Learned capability (`θ_f`, §4.7)
  needs its own loss mechanism, if any. Confidence changes only through evidence.

**Competence improves the operation, never its loudness (agreed direction; made precise in §4.7):**

| Function | What greater competence could improve (candidate operational tests; equations open) |
|---|---|
| Se | telling actionable present changes from noise under equal observation conditions |
| Si | telling relevant precedents from misleading similarities |
| Ne | more distinct, admissible possibilities within the same search budget, not merely more candidates |
| Ni | representations that predict or transfer better to new cases without needless complexity |
| Te | arrangements that better satisfy the declared objective under the same constraints |
| Ti | detecting contradictions, including larger combinations, while avoiding false contradiction reports (§7.4) |
| Fe | predicting different listeners' readings more accurately, including their disagreement (§6.4) |
| Fi | identifying compatibility and conflict within the mind's own evaluative structure, including unfamiliar combinations; the evaluator never decides which values are correct |

- Each effect must improve a **measurable property of that function's own operation** (accuracy, discrimination,
  search depth, representation), per the revision standard.
- **Confidence is separate from competence** (refined in §4.7): beliefs in the one belief store, never a meter, so a
  practised mind can be confidently wrong when its experience misled it.
- **Boundary.** This is the function's processing quality across domains, not a task skill (`cognition.skill.practice`,
  reserved) and not intelligence (§4.4 invariant).

**The developmental cycle (Rex's light and crystal, kept):** allocation → practice → competence → processing quality
→ outcomes and learning → future allocation. **Not guaranteed upward:** competence does not force more use. The mind's
own beliefs, preferences and needs mediate the return path, so a mind can become excellent at something and then avoid
it because what came with it was unpleasant (§4.4's indirect route).

### 4.7 The competence architecture (Rex, 2026-11-01; adopted direction for V2, Comp-Q1; per-function algorithms open)

Brought in through Rex's paste of a review conversation (ChatGPT and a second reviewer). It settles what the
quantities are; it does not yet give any function's learning algorithm.

**Three quantities, each answering a different observable question:**

| Quantity | Definition | How it is measured | Can be high while the others are low |
|---|---|---|---|
| Allocation | the processing resource the mind assigns to an operation on this occasion | time, comparisons, retrieval attempts or search steps assigned, and the work actually done | great effort, poor result |
| Competence | how well the operation performs with given information and resources | error, discrimination or solution quality at a fixed budget | good result with little effort |
| Confidence | how reliable the mind believes a particular result is | its probability for a defined claim, compared later with the feedback it received | certainty while wrong |

**The processing cycle:**

```
b_f = A_f · B                                   allocation as a budget: share A_f of the total B
y_f = Run_f(x, R, θ_f, b_f)                     the operation: input x, reference R, learned parameters θ_f, budget b_f
θ_f(t + 1) = Learn_f(θ_f(t), e_t, r̂_t)          learning from experience e_t and the feedback r̂_t the mind actually receives
C_f(T, b) = Evaluate_f(θ_f, T, b)               competence: measured outside the mind on a task set T at budget b
```

- **The mind's state is `θ_f`, not a competence number.** `θ_f` must name something concrete the operation does
  differently (which constraints Ti checks first, which combinations it examines, how it ranks contradicting evidence);
  otherwise it is a competence multiplier renamed. Competence is a measurement of `θ_f`'s performance, a profile over
  tasks and budgets, never a universal personality score and never known to the mind.
- **Quality and efficiency stay separate:** quality at a fixed budget, and the budget needed to reach a fixed quality.
- **Knowledge is not capability.** Knowing more facts can improve results without improving the operation. Tests
  sometimes hold knowledge fixed and sometimes let it vary; the two effects can interact (a better retrieval strategy may
  help only once enough is known).
- **A changed `θ_f` is not proof of improvement.** Only performance on fresh problems shows whether a change helped;
  parameters can change and help nothing, or help familiar tasks and hurt transfer. Attribution compares old and new
  `θ_f` with the same knowledge, problems and budget.
- **Feedback stays subjective.** The evaluator may know the true outcome; it never gives it to the mind (principle 11).
  That leaves room for misplaced confidence, ambiguous feedback and unnoticed mistakes.
- **Two confidences, both beliefs, both context-dependent:** confidence in an **answer** ("this negotiation probably
  breaks down tomorrow", `q = P_mind(this prediction is correct | evidence)`) and confidence in a **method** ("this
  approach usually helps with this kind of problem"). Method confidence can encourage recruiting an operation; answer
  confidence can end checking early. Neither raises allocation automatically.
- **Insufficient processing gives no definite conclusion.** Ti's output distinguishes **contradiction found**,
  **consistency established within a stated scope**, and **unresolved** (the budget ran out). Without the third, a
  shallow search would treat "I didn't find it" as "it isn't there", and deeper search would look like competence. The
  same rule applies to every function.
- **Costs are assumptions.** One Ti check and one Se comparison need not cost the same. A shared abstract budget with
  operation-specific costs is a simulation convention: every cost is labelled estimate, and comparisons are repeated
  under different plausible costs so the accounting never manufactures a function's advantage (Bud-Q1).
- **V1 is unchanged; no generic competence multiplier is built.**

**The developmental chains (replacing §4.6's cycle as a statement of mechanism):**
`allocation → practice → learning (Δθ_f) → processing capability`, and separately
`feedback → confidence → believed value of processing → future allocation`. Misleading positive feedback can make a
mind confident in a poorly developed operation and recruit it more; discouraging feedback can make a capable mind avoid
one. Both emerge from the same mechanisms.

**A stopping rule (proposed; Stop-Q1):**

```
E_mind[ ΔU of the next available computation ] ≤ C_processing        stop processing
```

"The next computation" is one defined step (retrieve another precedent, examine another constraint, generate another
arrangement); the estimate is bounded and approximate so that valuing thought does not become an unbounded problem of
its own, and the cost includes time and opportunity (a useful thought can be too slow for the situation). It uses the
mind's believed gain and cost, never the simulator's knowledge. The form is rational metareasoning's value of
computation (Russell & Wefald 1991; Lieder & Griffiths 2017, keeper-added sources).

**Keeper check (2026-11-01).**
1. *Allocation becomes a budget: a real architectural change.* Today allocation weights the hooks; the baseline decides
   in one pass with one-action lookahead (DESIGN §2.4, C-Q8) and has no processing budget anywhere. Inside V2 the budget
   can live within each operation's hook call (Ti examines at most `b_Ti` constraint combinations), which keeps V2 to
   existing hooks (§11.1). `B` itself has no source: **estimate** or **fiction**, with sensitivity runs; whether it later
   reads fatigue or arousal (Reality's) is open (Bud-Q1).
2. *The stopping rule is not a personality mechanism.* Deciding when to stop thinking is general cognition, so it needs
   a core owner (the reserved `cognition.planning.lookahead` or a new decision row), with personality only reading it.
   It is not part of the Ti experiment (Stop-Q1).
3. *How confidence reaches allocation* needs a term the softmax does not yet have (the believed benefit of processing
   with `f`, beside habit and motivation): Alloc-Q1.
4. *Registry.* `cognition.personality.function_development` still writes `mind.function_competence` with the log form
   and "competence feeds back into allocation"; under this architecture the mind's state is `θ_f` and competence is a
   diagnostic, like the ledger. `cognition.personality.function_allocation` still shows `L_f`. Both are the Cognition
   keeper's rows to update.
5. *Boundary.* `θ_f` is a function's processing strategy across domains: not a belief (knowledge stays in the belief
   store, so no duplicate memory), not a task skill (`cognition.skill.practice`), not intelligence (§4.4).

### 4.8 Abstraction: one function expressed through another (Rex, 2026-11-02; proposed)

**Rex's statement.** Abstraction is when one function is pulled through another and expressed through it, with its
lingering essence still visible. For an ESTP, inferior Ni pushed through dominant Se: what comes out looks like Se, but
Ni's shape shows. Like a fist pushed through playdough, or an object pressed into a pin-art board: the impression on
the other side is not the object's exact shape, because the medium alters it. Rex expects this is where the
calculation becomes hard to measure, because the concept is nebulous.

*Term:* Rex's "abstraction" here means cross-function expression. It is not principle 2's "lower layer of abstraction"
(levels of description) and not Ni's relational integration (§3.4).

**What it adds.** Until now functions combine as weighted contributions (`Y = Σ_f A_f Y_f`, addition). Abstraction is
**composition**: one function's output becomes another's input, and order matters (`Run_Se(x; z_Ni) ≠ Run_Ni(x; z_Se)`).
That gives the dominant–inferior relation a possible asymmetry that addition cannot express.

**The interface (proposed; the smallest form, from the review round):**

```
z_f       = Run_f(x, R_f, θ_f, b_f)                    the source function's output (§4.7)
z_{f→g}   = P_{f→g}(z_f)                               what crosses: a selection or reformatting the receiver can read
y_g       = Run_g(x, R_g, θ_g, b_g; z_{f→g})           the receiver processes its own input with the source's output available
```

- **The source stays intact.** Ni can keep a rich model while only one prediction ("the opponent shifts left,
  confidence 0.7") reaches Se. Failing to express the whole model does not degrade it. This is closer to the pin-art
  board than "lossy encoding": the object is unchanged; the impression depends on the medium.
- **What survives is a named property.** For Ni through Se in a fight: Ni's directional expectation survives; Se adds
  its translation into an action available here and now; the relational explanation need not appear in the action.
  "Essence" is measured as that property, not as a score.
- **No encoder–decoder and no 64 pair equations yet.** `P_{f→g}` starts as a projection onto fields the receiver
  already reads.
- **Three claims, tested separately:** (1) one function supplies information to another (changing the supplied
  information changes the receiver); (2) the receiver transforms it (the same source output gives different results
  under different receivers or contexts); (3) dominance sets the usual direction (the allocation and routing rules
  produce that asymmetry across situations). (1) and (2) do not establish (3). "The inferior expresses through the
  dominant" stays Rex's hypothesis about the usual route, never a compulsory route written into every decision.
- **Both directions.** The dominant can also be expressed through the inferior; hierarchy may set how often each
  direction is used and how practised the receiver is. Two kinds of weakness follow: **weak generation** (the source
  produces poor information) and **weak integration** (good information, poorly taken up).
- **Routing is a third relation**, beside allocation and competence: which path a function's output takes. An ESTP can
  use Ni directly, Se directly, or Ni through Se; the ledger must tell the three apart, and record the connection's
  influence separately so one contribution is not counted as Ni's and again as Se's.
- **Allocation, competence, confidence, transformation** stay four things; there is no "abstraction" score.

**Keeper check (2026-11-02).**
1. *One crossing already exists.* §5.1 (Rex) has the extraverted function filter and the introverted function encode:
   every experience already passes one function's output to another. DeepSeek read this as the routing mechanism;
   ChatGPT rejected it as "stages, not routing". Both are half right: §5.1 is one fixed crossing per experience, not a
   general router. Abstraction must reuse that crossing for the filter-to-encode case rather than build a second one
   (one owner per mechanism), and generalise only beyond it.
2. *Allocation untouched.* Abstraction acts on what happens to information after recruitment (expression fidelity),
   never on allocation, so §4.6's lock-in repair and principle 9 hold at any depth (Abs-Q2).
3. *Fidelity is a diagnostic, not the mechanism.* A product of per-stage retentions `Q_k = Π r_i` is commutative: it
   cannot tell Ni → Ti → Se from Ni → Se → Ti, the very order that composition was introduced to capture (DeepSeek;
   verified). The transformations stay ordered; retention is measured afterwards.
4. *Leading is not routing.* An inferior function can supply the decisive information while its expression passes
   through others (Ni spots the danger; the action comes out as Se). So a serial route does not by itself break
   principle 9 (ChatGPT, against DeepSeek's "serial is excluded"); it stays a candidate.
5. *No new hook needed for V2 tests:* the source output enters the receiver as an extra input inside V2's own
   operations (§11.1, existing hooks only).

### 4.9 Dark abstraction and the shadow positions (Rex, 2026-11-02; proposed)

**Rex's statements and questions.**
- **Dark abstraction** is when the shadow functions present themselves.
- **Do abstractions co-occur with the other functions?** When an ESTP uses Ni, is Ni pushed through Fe, then Ti, then
  Se, or does it happen in isolation? And does Fi then pass through all seven?
- **A possible reason for the hierarchy:** the fourth function may be weaker because it is abstracted through so many
  others, and positions 5–8 so weak that they are called shadows because each function in front muddles their
  representation, so they often come out negatively unless one is at ease with them ("whatever that means, or if that
  is even possible").

**What this would give (if it holds):** a mechanism for the eight positions instead of eight assigned strengths.
Whether it does is untested; a mechanism that *can* produce position differences is not yet a derivation of the
eight-position hierarchy (ChatGPT, against DeepSeek's "the positions are now derivable").

**Three candidate causes of difficult expression, kept separate and measurable (review consensus):**

| Hypothesis | What makes expression difficult | Distinguishing prediction |
|---|---|---|
| A. Transformation depth | the output passes through several operations and changes form | difficulty grows with particular routes or depth |
| B. Criterion collision (DeepSeek) | the output arrives intact and fails the receiving function's coherence criterion (§7.1) | difficulty grows with criterion distance, even on a direct connection |
| C. Low practice or competence | the source operation itself performs poorly | difficulty persists when its output is used directly |

They can coexist; the engine measures each one's share.

**Criterion collision, in more detail (proposed).** Fi's valuation passing through Ti is checked for contradiction; an
evaluative claim is not propositional, so it can fail Ti's check though nothing was lost. Outcomes: Ti recognises it as
personally meaningful without proving it; translates it into a consistency argument; finds no justification and treats
it as unimportant; or builds a consistent justification that does not explain the original. DeepSeek's examples: an
INTJ's eighth-position Si arrives as a technically true, beside-the-point exception that fails Ni's pattern; an INFP's
eighth-position Te turns a valuation into "what's the number for this". Form:

```
c_{f,g} = K_g(z_f, R_g)        whether receiver g can interpret and use the source's output under its own criterion
```

with **understanding, accepting and integrating kept apart**: Ti can understand an Fi valuation without endorsing it,
and Ni can recognise a contradicting Si detail without revising its model. Otherwise every disagreement would be coded
as a processing failure.

**What reaches expression: four outcomes the trace must tell apart** (the original signal, the receiver's
interpretation and the final output recorded separately):
1. **Successful abstraction:** correctly translated; different form, relevant significance kept (the pin-art case).
2. **Suppression:** understood, then withheld or overridden.
3. **Transformation failure:** misread; the expression no longer represents the source.
4. **Irrelevance:** the receiver finds it beside the task; neither suppression nor failure.

**Negativity is never a coefficient.** Collision does not by itself mean resentment: the mind may feel confusion,
curiosity, frustration, indifference, or satisfaction at resolving it. An emotional response comes from the existing
pipeline (§5.1 stages 3–4: appraisal, Life's chemistry, re-interpretation), meeting the mind's needs, expectations and
memories. No shadow output is multiplied by a negative number.

**"At ease" (proposed; Abs-Q4).** DeepSeek: being at ease with a shadow function is `θ_g` learning to admit the
source's criterion as a valid check (a Ti search order that includes evaluative consistency among the constraints it
tests), i.e. §4.7's `Learn_g`, with no new machinery. Open alternatives: it changes competence, interpretability,
integration or routing. **Keeper note:** Rex's matrix already has a "balanced" column for the advantage–hypocrisy cycle
("true balanced Se takes up space without formulating a guilt mentality") and states that the lower a function sits, the
less confident the user is and the more they avoid its domain. "At ease" may be that balanced column, and the lower
confidence is now a belief learned from experience (§4.7), never assigned by position. Whether they are the same is
Rex's.

**Keeper check (2026-11-02).**
1. *Positions 5–8 are not written (principle 6).* The matrix names them (Oppositional, Critical Parent, Deceiving, Devil)
   but writes no behaviour for them, and `stacks.json` holds four functions per type. The paste's ESTP shadow order
   (Si, Te, Fi, Ne) is a common convention, not Rex's text. Nothing about positions 5–8 enters executable V2 until Rex
   gives the order (Abs-Q0). A seven-stage chain for the eighth position cannot be claimed while the stack stops at four.
2. *Four mechanisms or eight?* If depth and criterion distance produce the positions, the eight functions could reduce
   to four mechanisms with attitude as a modifier (DeepSeek). That collides with §3's eight distinct operations, though
   it may sit with the orientation principle (§2.2), where attitude is what an operation holds fixed. Rex's to decide
   deliberately (Abs-Q3).
3. *Does the eighth generate its own information?* If it does, shadow weakness comes from routing and expression; if it
   is reconstructed from the first seven, the shadows are emergent transformations, not independent operations. That
   decides whether the architecture needs eight mechanisms (Abs-Q3).
4. *Rex's own question* is the one to answer first: is a shadow function's information **unwelcome** to the dominant
   structure (collision) or **hard to express accurately** (transformation)? The two lead to different mathematics
   (Abs-Q1, Abs-Q5).

---

## 5. The experience pipeline and memory

### 5.1 The pipeline (Rex, 2026-10-31)

**Reading of stages 1 and 2 (2026-11-01, from Rex's §2.3).** "The extraverted function filters, the introverted one
encodes" names which function **leads** each stage, not an exclusive responsibility: §2.3 says judging and perceiving
roles are never exclusive, every function stores (principle 7, §5.3), and in V2 every function's encoding weight
applies, scaled by its allocation (§5.5), Fe's included.

1. **Perception filter: the extraverted function.** The scene contains everything; the extraverted function decides
   which parts are weighted. Se and Fe pull the raw content (in a police beating of protesters: the violence, the
   people, what is literally happening); Te and Ne weight logistics, possibilities and implications.
2. **Encoding: the introverted function.** The filtered data is processed into the mind's internal format.
3. **Chemical response.** The interpretation triggers the body's chemistry (Life and Reality; Cognition never
   computes the chemistry).
4. **Re-interpretation.** The body state is read again, externally (how it makes you react) and internally (how it
   makes you feel). **That second read is the emotion.**
5. **Experience feeds stages 1, 2 and 4.** Two people with the same functions still react differently; the key to the
   difference is experience, not only the function.

**What is stored (Rex):** the event, plus the interpretation, plus the body state. A retrieved memory can re-trigger
the chemistry: a remembered betrayal still raises the heart rate years later.

**The objective output (Rex):** what the person says afterwards and how. The description of an emotion is irrelevant
to the objective output.

**Requirement (Rex):** every brain and body chemical present, with cited physiological effects (Life owns them;
Cognition reads them).

### 5.2 Memory stages (Rex, 2026-10-31)

Attention (what is noticed) → encoding (what becomes a memory, in what detail) → consolidation (what becomes durable;
sleep from Reality) → retrieval (what the situation or a remark brings back) → communication (what is mentioned,
concealed or questioned). **Remembering and saying are separate acts.** Three witnesses of one dockside argument
remember different things through attention, experience, goals and state alone.

### 5.3 Memory is three values (Rex)

- **Stored:** did the brain keep it?
- **Retrievable:** what cue brings it back?
- **Articulable:** can the person explain it?

| Function | How it stores | What triggers recall | Articulation |
|---|---|---|---|
| Si | physical detail, the self in the situation | sensory similarity | high, concrete |
| Fi | deep, experiential | emotional resonance | low: remembers but cannot explain well |
| Ti | connective: what links to its structure sticks | logical connection to existing pieces | high when connected, weak for isolated facts |
| Ni | abstract lattice (crystal structure) | pattern match | low concrete recall unless Te organises it |
| Fe | comprehension of what it is looking at | social or situational meaning | grasps what it saw |
| Se | **open** (C-Q16) | **open** | **open** |
| Ne | **open** (C-Q16) | **open** | **open** |
| Te | **open** (C-Q16); organises Ni's lattice when both are in the stack | **open** | **open** |

### 5.4 The mathematical form (keeper, proposed; Rex asked how this could become mathematics)

- Stage 1 is the attention weight per cue: `w_c = s_c · Σ_j η(c, j) · π_j`, `a_c = w_c / Σ w`, with pertinence `π_j`
  reweighted by each extraverted function (V1's F2 shape).
- Stage 2: encoding writes a **detail vector** per episode, `(physical, valence, structural, pattern, social)`; the
  introverted function's profile sets how much of each dimension is encoded.
- Stage 3 is Life's: `body.circuit_outputs`, transmitter and hormone levels.
- Stage 4 is perception again: the body state enters as interoception and is interpreted through beliefs; the emotion
  is the belief the mind forms about its own state.
- **Retrievable** is ACT-R activation `B_e(t) = ln Σ_j (t − t_j)^(−d)`, `P_retrieve = 1/(1 + e^{−(B_e − τ)/s})`, with
  cue-type weights (sensory, emotional, logical, pattern, social) per function profile (open, C-Q17).
- **Articulable** is a communication-stage limit on how much of the stored detail can be put into words: Fi and Ni
  low, Si and Ti (when connected) high.
- **Stack interaction:** every function's hooks apply, weighted by allocation, which is how Te organises Ni's recall
  without a special case.

### 5.5 Attention-weighted encoding (Rex, 2026-11-02; V2 design)

Different configurations learn different details from one experience:

```
e_c = a_c · (1 + Σ_f A^att_f · g_f · enc_{f, dim(c)})       stored if e_c ≥ τ_enc = 0.1 (estimate)
```

`enc` weights follow §5.3 (Si physical, Fi valence, Ti structural, Fe social); Ni's pattern dimension is open. Later
predictions condition only on stored features, so two minds given the same experience can predict differently.

---

## 6. Meaning: semantic systems

### 6.1 Semantically fluid, never illogical (Rex, 2026-10-31)

- `meaning(signal, context)` changes its output while the definition of the function stays fixed. A word ("fine",
  "loyalty", "respect") carries a **pool of candidate meanings**; context (speaker, relationship, situation, time, the
  listeners present) selects which is active and how likely.
- **An undeclared change of meaning inside one argument is an error** (equivocation).
- **Selection** happens within one interaction ("loyalty" resolves to obedience before the boss, solidarity among
  coworkers within the same hour). **Reconstruction** happens when no held meaning fits or someone supplies a new one,
  even within one conversation; a new meaning is often a blend, and it persists when the group reinforces it, so the
  pool drifts.
- **Bubble exposure.** Every group has its own semantic outline: what its words mean, what insults and what
  compliments. A mind's pool comes from the bubbles it has lived in. Narrow exposure makes meanings feel universal;
  wide exposure resolves by the bubble one is in and weighs a word by who present would be hurt. **Exposure has depth,
  not just membership:** time spent, closeness to members, emotional salience.
- **Emergent conflict, never scripted.** A fixed-definition speaker sees equivocation; a context-resolving listener
  sees rigidity. Neither malfunctions; they run different semantic systems. Rex observed this live with a language
  model that resolved his fixed definition of "illogical" by its social weight; replacing the word with one free of
  conflicting social meanings removed the friction.

### 6.2 Function profiles (Rex; hypotheses, parameters of one mechanism)

| Function | Pool | Selection | Reconstruction | What it notices in others |
|---|---|---|---|---|
| Fe | large, from many external bubbles; maps where each meaning comes from | context-weighted, by the bubble one is in | low threshold; group-driven; the pool drifts | who present would be hurt by a word |
| Ti | one meaning per reasoning chain | fixed for the chain | only by explicit redefinition | a switch of meaning mid-argument |
| Te | one, anchored to the shared external definition | fixed | by changing the shared standard; pushes others to adopt it | departures from the shared definition |
| Fi | one fixed internal referent from personal values, plus a lossy encoder to public words | fixed referent | the referent does not drift; its expression does | **open** |

Symmetry (Rex): Fe/Ti is many external outlines against one internal structure; Te/Fi is one shared standard against
one private standard.

### 6.3 The equations as built in the engine (DESIGN §5.1; built)

```
P(m | w, c) = ( n_{m,b*} + α · P_pool(m) ) / ( N_{b*} + α ),     P_pool(m) = n_m / N        (two-level Dirichlet)
L(v') = Σ_m P(m | w, c) · [ r_j · [v' = v_m] + (1 − r_j)/K ]                                (testimony mixture)
F = Σ_m P(m | w, c) · P_prior(claim_m holds);   F < θ_pre ⇒ confusion                       (fit)
w_b ∝ Σ_e P_retrieve(e) · s_e · [e ∈ b] / |C(e)|                                            (bubble exposure, overlap counted once)
```

`α` (pool concentration) defaults to 1 (estimate); an unfamiliar bubble falls back to the whole pool, which is how
home meanings get forced on a new group. Reconstruction adds one count; reinforcement adds one count when a reading is
confirmed. An equivocation cue is recorded when the most probable meaning of a term changes inside one conversation
without a declared change; attention decides whether it is noticed.

### 6.4 Fe contextual semantic modification (Rex, 2026-11-02; V2 design)

```
P'(m) ∝ P(m | w, b*)^(1−φ) · Π_{b ∈ audience} P(m | w, b)^(φ / |audience|),     φ = min(1, A^eval_Fe · g_Fe · 0.5)
```

The resolved meaning shifts with who is present only when Fe executes. `φ_0 = 0.5` is an estimate.

**Corrected direction (Rex, 2026-11-01, review consensus): Fe maps what each listener will hear; it does not adopt
it.** The pooling above moves Fe's own resolved meaning toward the audience's reading, which models Fe as taking on
what the room means. Rex's profile (§6.2) has Fe map where each meaning comes from and notice who present would be hurt
by a word; an Fe-weighted mind can understand two audiences perfectly and still choose words that comfort one,
challenge the other or conceal something. The proposed form keeps two outputs apart:

```
P_self(m | w, b*)                       Fe's own reading, selected by the bubble it is in (§6.2, C-Q18; unchanged)
{ P(m | w, b) : b ∈ audience }          its model of each listener's reading, kept distinct, never pooled
```

and leaves expression to ordinary cognition: §9.4's third stage (response selection: communicate, persuade, conceal,
confront, accommodate) reads the audience map like any other belief. Fe competence (§4.6) is how accurately the map
matches what listeners actually resolve. No new mechanism: the per-bubble distributions are §6.3's. **Keeper check:**
the reviewers' numerical point, that the product can become undefined when one audience gives a meaning zero
probability, does not hold with the built Dirichlet smoothing (`α > 0` keeps every pooled meaning positive); the
conceptual point holds. Unit 5446 was to build the pooling.

---

## 7. Coherence: the shared primitive

### 7.1 One primitive, two criteria (Rex, 2026-11-01)

Ti and Fi share one underlying operation, **coherence building over an internal structure**, and differ in what
counts as a valid connection. Ti assembles conceptual pieces by logical compatibility; Fi assembles personally
meaningful pieces by evaluative compatibility.

```
C_Fi(x_i, x_j | P)          P = the mind's accumulated personal evaluative structure (preferences)
C_Ti(a, b | L)              L = the mind's conceptual structure (beliefs and their links)
```

Items carry perceived characteristics `x_i = (colour, shape, texture, symbolism, style, …)`, never true values.

### 7.2 The scores (Rex, refined 2026-11-01)

```
C_Fi(X) = Σ_i w_i · fit(x_i, P) + Σ_{i<j} v_ij · compat(x_i, x_j)
C_Fi(X, t) = Σ_i w_i · fit(x_i, P_t) + Σ_{i<j} v_ij · compat(x_i, x_j) + λ_t · identityFit(X, I_t)     (C-Q22)
C_Fe(X, c) = meaning(X, c)
```

Individual preference, component coherence, identity coherence. `I_t` is Cognition's existing self-model, never a
separate Fi store (which structure exactly is C-Q23); it changes through experience and is never fixed by type.

### 7.3 One primitive, every function's criterion (Rex)

The primitive began with the four judging functions; Rex has since given Si a criterion and Ni a tentative one, so it
is not judging-only. Whether Se and Ne have one is open.

| Function | Coherence it seeks |
|---|---|
| Ti | internal conceptual consistency |
| Fi | internal evaluative consistency |
| Te | external definitional and procedural consistency |
| Fe | external contextual and interpersonal coherence |
| Si | consistency with an internalised representation or precedent (§8) |
| Ni | **tentative:** consistency with an integrated pattern or anticipated trajectory (C-Q24) |
| Se, Ne | **open** (C-Q24) |

Ti and Fi build internally coherent systems; Te and Fe build externally meaningful ones.

**What this does not say (Rex).** Nothing about how an outfit looks. Mixing unlike things does not by itself mean Fe,
and one consistent style does not by itself mean Fi. The criterion for coherence decides, never the visible amount of
variation; otherwise the engine would classify finished products instead of modelling the process. Romantic goth,
mall goth and cybergoth are input reorientations of one Fi operation with different preference structures.

| | Ti | Fi |
|---|---|---|
| Organises | concepts and their relationships | preferences and personal significance |
| Seeks | logical coherence | evaluative coherence |
| Rejects | contradiction | internal incompatibility |
| Preserves | conceptual identity | personal significance |
| Can struggle with | unresolved logical inconsistency | expressing why something feels incompatible |

### 7.4 How coherence becomes executable and enters decisions (V2 design, 2026-11-02; resolves C-Q27)

```
compat_Ti(x_i, x_j) = the mind's belief that the two items' claims are not contradictory
fit_Fi(x)           = mean valence of the mind's episodes containing feature x
compat_Fi(x_i, x_j) = (positive − negative episodes containing both) / (n + 1)
EU'(a) = EU(a) + Σ_f A^eval_f · g_f · s · tanh( C_f(X_a) / n_pairs ),     s = 0.25 × (max EU − min EU)   (estimate)
```

A composition candidate (an outfit, a plan, an argument) gains expected utility in proportion to its coherence under
each judging function's criterion, scaled by allocation and competence.

**Challenged (2026-11-01, from Rex's paste of ChatGPT's document review; C-Q27 reopened).** Recognising coherence and
valuing it are separate operations: a mind can see that an argument is coherent without wanting to act on it, or that
an outfit is coherent without wanting to wear it. As written, the term adds utility to a coherent candidate whether or
not it serves any need, which works as a preference for coherence itself, close to the goal that principle 10 says
personality never adds. **Keeper check:** the concern holds mechanically; the term is not gated by any need. Rex's
statements still require coherence to change choices (Fi rejects items that conflict with an established identity,
§3.8). **Keeper proposal (Rex decides):** apply the coherence term only among candidates that serve an active need or
goal, so coherence decides between ways of meeting a need and never creates a reason to act. An alternative is to let
coherence act through belief (an incoherent plan is believed less likely to succeed), which adds no value term at
all. Unit 5444 was narrowed before it ran (Cognition keeper, 2026-11-01): it builds the Ti and Fi coherence scores as
execution records only and adds nothing to EU until Rex decides.

**A route per function for C-Q27 (proposed 2026-11-01 by one reviewer; the most specific proposal so far).**
- **Ti → through belief.** An incoherent argument or plan is believed less likely to work. That is how Ti's rejection
  of contradiction should reach choice, and it adds no value term.
- **Fi → gated utility.** The belief route fails for Fi: when an Fi mind rejects an item that clashes with its identity
  (the goth example, §3.8), it does not believe the item will fail at anything; it just does not fit. Gating keeps
  principle 10: the need for clothing gives the reason to act, and Fi coherence decides among the outfits that meet it.
- Qualification from the consensus: Ti coherence may affect more than predicted success, and Fi can change beliefs as
  well as valuation; the split is a candidate, not the final answer. **Keeper check:** both halves respect principle 10;
  neither adds a need.

**Four defects in the current forms (2026-11-01 reviews; each verified by the keeper).**
1. **The scale depends on irrelevant alternatives.** `s = 0.25 × (max EU − min EU)` is set by the spread of the whole
   candidate set. Add one extreme, unrelated option and `s` grows, the coherence bonus grows against the gap between two
   close options, and their order can flip. §8.3's Si term uses the same `s`. **Required of a replacement:** the scale
   comes from the stake of the need the candidates serve, never from the range of options (Coh-Q1; form open). This
   matters only on the utility route.
2. **Ti's pairwise sum misses spread-out contradictions.** The claims A, "A implies B" and "not B" are consistent pair
   by pair and inconsistent together. **Required:** Ti checks consistency of the whole set. Proposal: `C_Ti` counts the
   inconsistent subsets the mind finds up to a search depth; joint consistency is hard in general (satisfiability is
   NP-complete, Cook 1971), so the depth is bounded, and that depth is a natural Ti competence effect (§4.6) (Ti-Q1).
   Its output has three values: contradiction found, consistency established within scope, unresolved (§4.7).
3. **Fi's pair score is association, not evaluative compatibility.** `(pos − neg)/(n + 1)` over episodes containing both
   items measures learned co-occurrence. Two things can each be pleasant and still clash together, and a pair never
   experienced together scores zero. **Required:** association stays as evidence; the operation also needs compatibility
   learned over feature pairs, so it reaches new items sharing features, and the identity term (C-Q22, C-Q23) for clashes
   with the established structure (Fi-Q1).
4. **`C_Fe` has the wrong type.** `meaning(X, c)` returns a distribution over meanings; every other coherence score is a
   number. Proposal under §6.4's corrected Fe: `C_Fe(X, c) = Σ_{b ∈ audience} w_b · P(X is read as intended | b)`, the
   expected chance the combination communicates what it is meant to (Fe-Q1).

### 7.5 Tests (Rex)

The wardrobe test: give an Fi-weighted mind items with perceived characteristics; over hundreds of decisions, the
accepted and rejected combinations should show stable relations; after changing its experiences and exposure, the
structure should evolve while staying recognisably coherent. An Fe-weighted mind under the same wardrobe should vary
with the audience present; an Fi-weighted one should not. **Prediction (Rex):** asked to assemble an aesthetic from
unrelated components, Fi-weighted minds seek compatibility with an internal pattern, Fe-weighted minds seek a context
that makes the combination meaningful.

---

## 8. Reference matching: Si

### 8.1 The mechanism (Rex, 2026-11-01; "not the end of how this functions, but its start")

A child hears what a knight is from stories, observed knights and social expectation, builds a representation of
knighthood and organises behaviour around it.

```
C_Si(a, R_i) = match(a, R_i)              how well an action fits the learned representation
R_i(t + 1) = update(R_i(t), O_t, I_t)     the representation develops from observations, interpreted
```

The auxiliary shapes the interpretation `I_t` (ISTJ through rules, ISFJ through social meaning). Neither is correct
by construction. Rex's doctor: a representation "a doctor cures sick people" meets a physician who cannot cure one
illness; the mind either judges the physician incompetent or revises the representation.

**Role consistency is one application of a general reference-matching operation (Rex):** a remembered person, a
familiar environment, a learned procedure, a social role, an expected pattern of behaviour, a personal history. That
is why Si reaches both memory and behaviour without two mechanisms.

### 8.2 Fidelity and authority are separate (Rex, 2026-11-01)

- `R_i`: the internal reference representation.
- `F_i`: confidence in its accuracy (the belief's probability).
- `A_i`: the authority assigned to it (the weight of conforming, from motivation).

A mind may remember a knight's code accurately and consider it unimportant; another may hold an inaccurate version as
an absolute obligation. **Si is therefore never automatically obedient, traditional or rigid.**

### 8.3 Executable form (V2 design, 2026-11-02)

```
match(a, R) = Σ_x P(x ∈ R) · [x ∈ a] / Σ_x P(x ∈ R)
EU'(a) = EU(a) + A^eval_Si · g_Si · s · tanh(match − ½) · A_i,     A_i = P(role applies to me) × p_relatedness
```

`R` is a set of feature beliefs about the role. It updates by ordinary belief updating from observed exemplars
labelled with the role (performing or omitting a feature) and from testimony; the auxiliary acts through its
interpretation contribution. Authority reads the mind's own beliefs and need priority, never a personality goal.

**Prohibited features (2026-11-01, from the document review; proposed).** The review said the match rewards expected
features but does not penalise missing or contradictory ones. **Keeper check:** half right. Missing expected features
already lower the score, because every expected feature is in the denominator. Contradictory features are not
represented: an action that carries every expected knightly feature and also takes a bribe scores the same as one
that does not, because nothing in the sum penalises an extra feature the reference forbids. **Keeper proposal (Rex decides):** the reference
holds two kinds of feature belief, expected `P(x ∈ R)` and prohibited `P(x ∈ R̄)`, both learned by the same update from
exemplars and testimony:

```
match(a, R) = ( Σ_x P(x ∈ R)·[x ∈ a] − Σ_x P(x ∈ R̄)·[x ∈ a] ) / ( Σ_x P(x ∈ R) + Σ_x P(x ∈ R̄) )      in [−1, 1]
```

entering the decision term with `C = match` in place of `match − ½`. Unit 5445 builds §8.3 as written until Rex
decides (Si-Q1).

**Matching is general; why it matters comes from the task (2026-11-01 reviews; keeper-verified).** §8.1 makes role
consistency one application of reference matching (a remembered person, a familiar environment, a procedure, a
history), but §8.3 computes the match only inside a decision term for the mind's own actions, weighted by
`P(role applies to me) × relatedness`. That covers role conformity and nothing else: it cannot check a machine against
its remembered operating pattern, or recognise that someone else is acting like a knight without the "I should act
like one" part. **Required (Si-Q2):** `match(·, R)` applies to any observed or proposed thing (an action of one's own,
another person's behaviour, an object's state); its output enters ordinary cognition as evidence (a mismatching machine
is believed faulty; a person matching "knight" is believed to be one), and the authority-weighted term for one's own
role is one use of it, not its definition. This keeps §8.2's split of fidelity and authority in the formula, not only
in the prose. The same `s` defect as §7.4 applies to the authority term.

### 8.4 The knight test (Rex; planned after the S1 and ledger chains)

Several simulated children receive different accounts of what a knight is (formal rules; heroic stories; real knights
behaving imperfectly), develop through experience, and later meet situations where the learned representation
conflicts with reality. Measure which aspects of the role each configuration preserves, reinterprets or abandons;
with `F_i` and `A_i` separate, the test also tells apart a mind keeping an inaccurate representation from one that
understands the role accurately and rejects it.

---

## 9. Applications

### 9.1 Preference learning and attraction (Rex, 2026-10-30; designed)

**General preference learning (§13a).** Six mechanisms: semantic representation of characteristics, abilities,
behaviours, identities and relationships (beliefs, which can be wrong); preferences `P_i,k(t)` toward any
characteristic, each with its own weight; associative learning and generalisation along whatever the attribution step
blamed, rightly or wrongly (one bad artist may become a dislike of artists, of expressive people, or of admired
people); social transmission; contextual nonlinear evaluation of combinations (§7 gives it a concrete shape); and
separate quantities for attraction, attachment, sexual motivation, partner selection and reproductive intention.

```
A_ij = Σ_k P_i,k · X̂_ij,k                          baseline: the other as perceived, never the true record
A_ij(t) = F(P_i, X̂_ij, C_i, E_i, R_ij, S_t)         full attraction (form beyond the sum open)
A_i = F(V_i, S_i, C_i, E_i)                          cultural salience: social valuation V, sensory appeal S
```

**Predispositions** initialise as distributions; malleability varies per preference. **Sexual orientation is a
fixed-malleability class:** its learning rate toward reward, punishment and social pressure is zero by construction.

**Function sensitivities in attraction (hypotheses):** Fe collective valuation, Se sensory presentation, Fi personal
significance, Si familiarity and remembered ideals, Ne novelty, Ni symbolic meaning and anticipated trajectory, Te
demonstrated competence, Ti coherence of thought. Fe and Se shape sensitivity, never conformity.

**Invariants (Rex):** attraction ≠ partner choice ≠ sexual behaviour ≠ reproduction; no universal attractiveness
score; little or no attraction is valid; dispositions influence attention and evaluation only, never "Se prefers
muscular"; population patterns only emerge. **Two pathways of social influence:** on attraction (preferences move) and
on behaviour (choice changes through anticipated consequences). **Four separate outcomes:** awareness of a trend,
personal evaluation, willingness to conform, attraction toward people displaying it.

**Style and presentation (Rex).** Cognition owns the choice of presentation and the observer's interpretation; style
is never a guaranteed indicator of personality.

### 9.2 Tattoos, names and the "exotic" (Rex, 2026-10-31)

The feature, its intended meaning (belonging, religion, rebellion, remembrance, taste) and the observer's
interpretation are three separate things. **"Exotic" means unfamiliar to this observer,** never a property of the
name or the person.

### 9.3 Social categorisation and learned group association (Rex, 2026-11-01; DESIGN §20)

- **No prejudice equation.** Beliefs about groups come from ordinary cognition. The same mechanism yields prejudice,
  positive stereotypes, reputations, cultural expectations, social trust and accurate distinctions.
- **Five stages, kept distinct:** observe a characteristic; encode an association; attribute a cause (the individual,
  the circumstance, the group or chance); generalise to the category; apply to another individual. Membership is
  itself a belief and can be wrong.

```
B'_g = B_g + α · A_g · S_e · ( I(e) − B_g )                          (Rex's form)
P'(θ_g) ∝ P(θ_g) · L(obs | θ_g)^(η · ã_g · S_e),   ã_g = a_g / max_c a_c      (the same update in the engine's one belief rule)
P(θ_k) = Σ_g P(k ∈ g | cues) · P(θ_g) + (1 − Σ_g P(k ∈ g | cues)) · P_0(θ)     (prior for a new person; individuation follows)
π_j += ρ · c_g · rel(j, θ_g),   c_g = 1 − H(P(θ_g)) / H_max         (expectation-driven attention; ρ open)
```

**Defect in the prior for a new person (2026-11-01 review; keeper-verified).** Groups overlap (a person can be a
merchant and a foreigner), so `Σ_g P(k ∈ g | cues)` can exceed 1; the weight on `P_0` then turns negative and the
mixture is no longer a probability. **Required:** mixture weights that stay non-negative and sum to one under overlap,
for example `w_g = P(k ∈ g) / max(1, Σ_g P(k ∈ g))` with `w_0 = 1 − Σ_g w_g`, or combining overlapping group beliefs by
the belief rule rather than by mixture. Which, is G-Q3 (overlapping groups), already open.

**The gate is attention:** an experience whose group cue was not attended updates no group belief. A confident belief
raises attention to confirming cues (illusory correlation, Hamilton & Gifford 1976; confirmation bias, Nickerson 1998).
**Function routes (Rex; hypotheses):** given per function in §3; no function is inherently more prejudiced; Se can hold
lasting group beliefs because memory belongs to the whole mind. **Experiment:** merchant communities in an
equal-truth world (any learned difference is an overgeneralisation) and a different-truth world (learning the
difference is accurate). Open: G-Q1 to G-Q4.

### 9.4 Contextual meaning, private judgement and public expression (Rex, 2026-11-01; DESIGN §21)

- **Observations (Rex).** A clearly defined statement can be read for its social implications instead (calling Ti
  "logical" heard as ranking people). An evaluator can privately judge someone exceptionally intelligent and say
  "above average" because of what the stronger words would do socially. **Hypothesis:** contextual social meaning can
  shape interpretation and expression, and can interfere with applying an explicit definition.
- **Three stages:** semantic interpretation (§6) → private evaluation (beliefs, the self-model) → response selection
  (an ordinary decision among accept, reject, qualify, reinterpret, ignore). Private judgement and public expression
  stay separately observable.
- **A context-indexed self**, learned from one's own behaviour in each context (self-perception, Bem 1972) and from
  others' descriptions (reflected appraisal, Cooley 1902). Variation across contexts is an outcome, never set by type:
  two Fe-weighted minds with different histories differ; a Ti-weighted mind can hold several context selves organised
  under one definition.
- **Two diagnostics, never drivers:**

```
D_i(L) = Σ_c w_c · d_c,      d_c = 1 − Σ_m P_i(m | L, c) · P_i(self has m | c)          identity mismatch
V_i(L) = ½ Σ_{c,k} w_c w_k · JS( P_i(· | L, c), P_i(· | L, k) )                         semantic variability
w_c ∝ Σ_e P_retrieve(e) · s_e · [e ∈ c] / |C(e)|                                        context weight, overlap counted once
```

High or low mismatch against high or low variability gives four separable cases. **No response threshold:** the same
private belief can come out plain to a friend, qualified to a rival and denied to an authority, and the trace says which
stage made the difference. **Experiments A to D:** audiences, histories, definition against social meaning, overlapping
bubbles. Open: SR-Q1 to SR-Q4.

### 9.5 Communication and conversation (Rex, 2026-10-30 and 2026-10-31; built in DESIGN §5.1)

- A message delivers information; the receiving mind decides what it means. Transmission ≠ comprehension ≠
  acceptance ≠ compliance.
- **Persuasion** is never a charisma roll: a message changes a specific part of the listener's evaluation and can be
  strong yet irrelevant to the real objection, fail, or strengthen opposition.
- **Personality shapes which arguments are generated and attended to, never one technique per type** (Rex).
- **Conversation** answers why this is being said, why now, how it fits between us. Tolerance is a derived assessment,
  never a need: `tolerance = σ(β · (max EU(turn) − EU(leave)))`. Openness is not willingness to talk to a stranger.

### 9.6 Legitimacy (C-G3 design, 2026-11-02; awaiting Rex)

A household's belief that an authority ought to be obeyed moves with what it perceives: procedure (court or lawful
assessment), outcome against its own expectation, enforcement of breaches it knows of, benevolence (remission).
Procedure outweighs outcome (Tyler 1990, 2006; Sunshine & Tyler 2003; Levi, Sacks & Tyler 2009). Every magnitude is an
estimate. Design in `HQ/handoffs/cognition/C-G3-DESIGN.md`. No function-specific rule is proposed there yet.

### 9.7 Drugs and lasting change (Rex, 2026-10-31)

Repeated exposure can lastingly change how someone thinks, reacts and relates, including the reasoning process itself
(association speed, what counts as evidence, certainty, noticing contradictions, working memory, checking conclusions,
belief updating). The baseline is altered by history and never reset when the substance wears off. The personality
measurement describes the resulting pattern.

### 9.8 Neuroticism (Rex, 2026-11-01)

No dedicated Neuroticism mechanism. Investigate whether neuroticism-related patterns emerge from stress, appraisal,
physiological and learning mechanisms; a later stress-response experiment (S7) will test it.

### 9.9 Aura and cultural valuation (Rex, 2026-11-01; proposed)

**Rex's statements.**
- **Aura is in all four extraverted functions; what a society counts as aura varies.** Se's is the most obvious and
  most basic form (coolness, taking up space, not doing something that looks uncool; the primal dominance displays of a
  wolf pack). Society gives credence to one extraverted function's quality: **Se coolness, Ne creativity, Te
  efficiency, Fe group harmony.**
- **Each culture pairs one extraverted function with one introverted function** to set its standards. The order is
  irrelevant; the two do not overlap. Standards work as an axis: do this and it is acceptable and earns points; do that
  and you will not be seen as this.
- **Countercultures.** Subgroups inside a culture counter it: Se cultures that prize coolness tend to have low-standing
  Ne groups, and Ne groups tend to think Se groups boorish. Whether a symmetry lies behind this is open (Rex).

**The form (proposed with ChatGPT; a diagnostic, never a stored statistic):**

```
Aura_{i,j,c}(t) = Σ_d w_{i,c,d} · q̂_{i,j,d}(t)
```

the aura observer `i` attributes to person `j` in context `c`: `w_{i,c,d}` how strongly `i` values quality `d` in that
context, `q̂_{i,j,d}` `i`'s perceived evidence that `j` has it. The same behaviour can give
`Aura_{i,j,c1} ≠ Aura_{i,j,c2}`: someone awkward to the wider culture can be brilliant to a subgroup.

**Keeper check (2026-11-01).**
- **No new mechanism.** This is the same weighted sum of perceived qualities as baseline attraction (§9.1,
  `A_ij = Σ_k P_i,k · X̂_ij,k`) with weights indexed by context. The registry already says admiration is a consumer of
  `cognition.preference.contextual_evaluation` and `cognition.preference.individual`, "never separate rows", and the
  perceived social valuation is `cognition.attraction.social_valuation`. The context weights `w_{i,c,d}` are what §6.1's
  bubbles already carry ("what insults and what compliments"), learned by exposure. Symbol renamed from the paste's
  `A_{i,j,c}` because `A` is already allocation (§4) and attraction (§9.1).
- **Se versus aura.** Se processes the immediate observable state (§3.1); what that state means socially is Cognition's
  interpretation and Society's standards. The same physical behaviour can read as dominant, obnoxious or unremarkable
  in three rooms. Aura is the observer's evaluation, never a property of Se or of the person.
- **Rex's pairing against the paste's challenge (for Rex).** Rex states one extraverted and one introverted function per
  culture, order irrelevant, no overlap. The paste's ChatGPT text proposes instead that the valued qualities `d` are
  learned by each culture and not fixed to the four extraverted functions, that emphasis is a distribution (a maritime
  culture can value courage, navigation, loyalty and commerce at once), and that the two roles (rewarded activity,
  standard that judges it) may not be interchangeable. Mechanically, a fixed one-pair rule per culture would be a
  hardcoded social rule (principles 3 and 6); the compatible form keeps the qualities learned and makes Rex's pairing
  the **prediction**: stable cultures concentrate their weight on one extraverted quality judged by one internal
  standard, with countercultures concentrating elsewhere. Which of the two Rex intends is Cul-Q1.
- **Whose.** Culture-level standards and the competition between them are Society's (Domain F; §2.5 already records
  the four domains competing at the level of society as Society's claim). Cognition supplies the observer's evaluation
  and how each function's processing makes a quality salient.
- **Illustrative pairs from the paste, not rules:** Se with Fi (distinctive, internally coherent personal style); Ne with
  Ti (original but logically integrated ideas); Te with Si (reliable improvements to established procedure); Fe with Ni
  (a collectively interpreted future). Each joins functions from different domains, one perceiving and one judging,
  which is one reading of "the two do not overlap" (Cul-Q2).

---

## 10. Personality V1 (frozen) in full

V1 is built and immutable. It lives in `personality/eight-function/v1/formulas.json` and
`src/personality/eight-function/v1.ts`. All constants are crude unless marked.

### 10.1 The hooks

```ts
pertinence(base, ctx)                 // attention: multiplies category pertinence π_j
interpret(base, domain, ctx)          // η, α0, λ, confidence, Weber w, testimony floor
generate(candidates, base, ctx)       // κ, recombinations, other-mind model
learning(base, domain, ctx)           // learning rate, memory decay d, belief half-life
```

`nullPersonality` is identity on every hook.

### 10.2 The thirteen formulas

| Id | Rex's statement (matrix section) | Hook | Formula |
|---|---|---|---|
| F1 | Attitudes: Direction of data, The ratio, Never pure | interpret | `η' = clamp(η·(1 + Δ), η_min, 1)`; `α0' = α0·(1 − Δ)` |
| F2 | Attitudes: Mastery and scope | pertinence | `π_j' = π_j^(1 − Δ)`, renormalised |
| F3 | Attitudes: Failure and resilience | interpret | `λ' = λ·(1 − Δ)·(1 − max(Δ, 0)·n_fail/(n_fail + N½))`, `N½ = 10` (crude) |
| F4 | Systems vs people: what it learns from a loss | learning, pertinence | domain `d` of extraverted X: `lr_d' = lr·(1 + ω_X)`; cues tagged `d`: `π' = π·(1 + ω_X)`; Fe off |
| F5 | Refinement: the introverted form outpaces all | learning | domain `d` of introverted Y: `lr_d' = lr_d'·(1 + r·ω_Y)`, `r = 1.5` (crude); Ti, Fi off |
| F6 | Se: Domain, Time frame, Precision, Limit; THEORY §1 | pertinence, interpret | physical + present cues `π' = π·(1 + ω_Se)`; targeted Weber `w' = w·(1 − ω_Se/2)`; present person observations `η' = η + ω_Se·(1 − η)/2` |
| F7 | Stack position and confidence | interpret | believed own success for actions in `d`: `P' = P·(0.5 + ω_d/2)` |
| F8 | Si: Mechanism, Accumulation, Time frame | learning | body or person episodes `d' = d·(1 − ω_Si/2)`; person-belief half-life `h_b' = h_b·(1 + ω_Si)` |
| F9 | Ne: Mechanism | generate | up to `k = round(ω_Ne·K)` two-step compounds, `K = 3` (crude) |
| F10 | Ni: Mechanism; Extraverted vs introverted perception [DERIVED] | generate | `P_theory = (1 − ω_Ni)·P_belief + ω_Ni·P_selfsim` |
| F11 | Ne and Ni: fate | generate | `κ' = κ·(1 + ω_Ni − ω_Ne)`, floored at 0 |
| F12 | Interaction: Se with Ni | interpret | person beliefs `α0_person' = α0·(1 + ω_Ni)`; grudge exception off (B3) |
| F13 | Te: accepts all data as good data | interpret | testimony reliability `r' = r + ω_Te·(1 − r)/2` |

### 10.3 Off in V1, with the reason

Fe, Fi and Ti core functions (not written); positions 5–8 (not written); the coping exception (no coping state
defined); the advantage–hypocrisy cycle (needs communication and risks prescribing moves); Ecosystems (a Society
claim). Matrix questions held: B1 (Si weakness emphasis), B2 (Ne acts or only predicts), B3 (grudge or grip).

### 10.4 The codex fingerprint

Every cited matrix section is hashed. If Rex edits a cited section, the formulas built on it are listed as stale and a
rederive unit is queued. Old versions are kept and compared. The check runs every keeper turn.

### 10.5 Known limits of V1

Whole formulas sum several functions' effects, so one function's effect cannot be isolated (COG-48). Several formulas
had nothing to act on in early fixtures. V1 stays frozen for historical comparison.

---

## 11. Personality V2 (designed; foundation built, operations not built)

### 11.1 Rex's strategy and priorities (2026-11-01, 2026-11-02)

Keep V1 immutable; build V2 now in isolation; compare on identical scenarios and seeds. Priorities: V1 preserved;
each defined operation as an executable transformation with a targeted test (Ti/Fi coherence, Si reference matching,
Fe contextual semantics, Te external reconfiguration, Ne branching, Se immediate response, experience-dependent
allocation); Ni open; coherence into decisions, Si reference update and experience and competence in allocation as
explicit mathematics; a ledger separating allocation, execution and influence; attention-weighted encoding;
deterministic replay; no hardcoded behaviours, duplicate memory or personality goals.

### 11.2 Per-function architecture

Each function's contribution is separate, so masking one function removes exactly its effect. Each operation runs
only when its function's allocation is positive, scaled by `A · g`.

### 11.3 Allocation

The V2 allocation is §4.5: habit and motivation set the choice to use a function, and competence scales how strongly
its operation acts. **Direction changed 2026-11-01 (§4.6):** habit saturates, and competence improves the operation's
quality instead of its strength. 5443 built the §4.5 forms; they are superseded, not yet rebuilt.

### 11.4 The operations

| Function | Operation | Equation (summary) | Section |
|---|---|---|---|
| Ti | conceptual coherence | `C_Ti` from beliefs about contradiction; whole-set check required (Ti-Q1) | §7.4 |
| Fi | evaluative coherence | `C_Fi` from episode valence; feature-level compatibility required (Fi-Q1) | §7.4 |
| (C-Q27) | coherence into decisions | `A·g·s·tanh(C/n_pairs)`, reopened; `s` defect (Coh-Q1); Ti-belief / Fi-gated split proposed | §7.4 |
| Si | reference matching and update | `match(·, R)`, general; authority-weighted for one's own role (Si-Q2) | §8.3 |
| Fe | audience interpretation | own reading plus a kept-apart reading per listener; expression by response selection (Fe-Q2) | §6.4 |
| Te | external reconfiguration | adds goal-efficient arrangements, removes none | §3.5 |
| Ne | branching | adds novel two-entry compositions | §3.3 |
| Se | immediate response | present evidence on preconditions | §3.1 |
| Ni | **open**; relational integration proposed (Ni-Q1) | `M* = argmin [E_traj + λK + γE_rel]`, not yet computable | §3.4 |
| all | attention-weighted encoding | `e_c` with `τ_enc` | §5.5 |

**Numerical artifacts (2026-11-01 review; implementation refinements, Num-Q1).**
- `k_Te`, `k_Ne = round(A·g·2)` jump: nothing below `A·g = 0.25`, then one composition, then two at 0.75. A small
  change in allocation flips a whole candidate in or out. A smooth form (the expected count, realised by seeded
  stochastic rounding so replay stays deterministic) avoids the jump.
- `ψ = min(1, A·g)` and `φ = min(1, A·g·φ_0)` clip: with gain above 1 a moderate allocation already saturates. Under
  §4.6 the gain leaves these terms, which removes most of it.
- Encoding may count attention twice: `a_c` is already reweighted by the attention allocation, and `e_c` multiplies by
  `A^att` again (§5.5). To check when unit 5450 is drafted.
- **Cognition keeper's rulings (2026-11-01, Num-Q1):** Te and Ne add the expected count `2·A` rounded stochastically
  from a seeded stream; Se uses `ψ = A^att` (no gain, no clip above 1 since `A ≤ 1`); encoding counts attention once,
  because V2 sets no pertinence weights, and a test checks `a_c` is untouched. The multiplier 2 and the form of `ψ`
  remain estimates.

### 11.5 The ledger for V2

Per epoch, function and operation: **allocation** (capacity assigned), **execution** (the operation ran, its inputs and
output), **influence** (rerun with the operation masked: what belief, interpretation, candidate or decision changed).
Shared engine parameters are never attributed to a function.

### 11.6 Offered next step: the orientation map

A table mapping every V1 formula and V2 operation to its domain, its reference or objective, what it preserves, what it
changes and what it learns, to test the orientation principle (§2.2) against the formulas. Not yet written.

### 11.7 Build state

As of 2026-11-01 (Cognition keeper's reports): **landed** 5441 (the §22 correction, b460f15), 5442 (the optional
engine hook points, 63823f9), 5443 (the V2 package in `experimental/personality-v2/` with §4.5's allocation, 98a3046) and
5463 (saturating habit; `g_f` removed from every operation). **Queued:** 5468 (removes the competence number 5463 still
computed in allocation; keeps `E_f` for habit), 5459 and 5464 (DESIGN.md amendments; §22.7 states the §4.7
architecture), 5446 (Fe as the audience map, §6.4), 5447 Te, 5448 Ne, 5449 Se and 5450 encoding (without `g`; Num-Q1
rulings), 5451 ledger and the V1/V2 comparison (P9-T noted for its tests), 5452 isolation tests, and the Ti
proof-of-mechanism experiment 5465–5467 (§12.7). **Held until Rex rules:** 5444 Ti/Fi coherence and 5445 Si. Stop-Q1 is
recorded as core cognition's, not built; the registry keeper was asked to update the two stale personality rows. The
operations are not built until their units land. §3.9 is a first step toward §11.6's map.

---

## 12. How the theory is tested

### 12.1 The three tests (DESIGN §9)

- **T-1, stable differences.** A stack's behaviour differs from null and from other stacks in the direction the
  formulas imply, stably across seeds, and not under two controls: random parameters with the null personality, and
  the stack with its hook outputs shuffled across functions. The effect should show as speed and effectiveness of
  learning in a domain, not as a fixed action preference.
- **T-2, derived traits.** Big Five indicators computed from behaviour alone (openness from novel or compound actions,
  conscientiousness from completed intentions, risk-taking under outcome variance, social behaviour from ask, trade and
  testimony) compared across the sixteen stacks with McCrae & Costa 1989 (E–I with Extraversion, S–N with Openness, T–F
  with Agreeableness, J–P with Conscientiousness; Neuroticism unrelated to the four letters). The sign of each
  published correlation reproduced; magnitudes reported.
- **T-3, version comparison.** Each new version against the previous one and the null model on the same seeds.

### 12.2 The scenarios (S1 to S6, Rex released 2026-11-01 and 2026-11-02)

| Scenario | Domain lever | What it can reach | T-2 indicator |
|---|---|---|---|
| S1 Forage field | `space`; physical, present, targeted cues | F6, F4/F5 for Se/Si, F2 | Openness (novel patches), Conscientiousness (return to known) |
| S2 Shifting market | `adaptation`; regime changes; compounds | F4/F5 for Ne/Ni, F9, F8 | Openness (switching, recombination) |
| S3 Workshop | `meta`; multi-step tasks; κ > 0; foreman testimony | F7, F11, F13, F1 | Conscientiousness (completion, verification) |
| S4 Village gathering | `cohesion`; other minds | F10, F12, F3 | Agreeableness, Extraversion |
| S5 Developmental cohort | all four, over a life | development (§4.4) | T-2 across ages; no age effect without experience |
| S6 Cross-scenario T-2 | none | all | all five, against McCrae & Costa 1989 |

Every scenario records a processing trace: attention shares, interpretation parameters and belief changes, the
generated candidates, the expected utility per candidate and the learning changes.

### 12.3 The classification rule (Rex, 2026-11-02)

Four classes: **stable**, **context-dependent**, **none**, and **not exercised** (a function whose opportunities had
no input; never labelled ineffective). Thresholds are fixed before a scenario's results are examined, recorded in the
scenarios design: significance 0.05 (Fisher 1925 convention), seed consistency 0.6 (keeper-chosen), minimum input rate
0.05 (keeper-chosen). Earlier results keep their original rule; reclassifications are addenda.

### 12.4 The Function Activation Ledger

Records, per function group, activations, opportunities, the utility effect of removing it, its learning contribution,
and its eligibility (active, eligible, no input). V1's groups overlap, so totals are not additive causal shares. V2 adds
exact masking and the allocation, execution and influence split (§11.5).

### 12.5 The Ni–Si transfer experiment (proposed, 2026-11-01)

Si-weighted and Ni-weighted minds receive identical histories, then new situations on two independent dimensions,
each run with and without a hint pointing at the relational structure:

| | High structural similarity | Low structural similarity |
|---|---|---|
| **High surface similarity** | both match | familiar appearance, different dynamics |
| **Low surface similarity** | unfamiliar appearance, same dynamics | neither matches |

- **Prediction (from §3.4 and §5.3):** Si-weighted processing favours experiential (surface) similarity; Ni-weighted
  processing favours relational similarity. §5.3 already records the matching recall cues (Si by sensory similarity,
  Ni by pattern match).
- **Measures:** not only prediction accuracy but which memories or patterns are retrieved, which evidence is treated
  as relevant, and how much new experience is needed to revise the interpretation.
- **Failure is decomposed (ChatGPT's correction to Venice).** If the Ni-weighted mind loses its structural advantage
  without a hint, that does not by itself falsify the mechanism: construction, retrieval and application are tested
  separately. Human analogy research separates them the same way: surface similarity drives what is retrieved,
  structural similarity what is judged sound (Gentner, Rattermann & Forbus 1993), and spontaneous transfer is rare
  until a hint is given (Gick & Holyoak 1980). That is the general human baseline the function hypothesis is tested
  against.
- **Confound with encoding (Venice; valid).** §5.3 and §5.5 already encode Si as physical detail and Ni as an abstract
  lattice, and §8.3's match is a feature-set match that cannot hold a relation. Run as written, Si-weighted minds look
  surface-biased because they were built to encode surfaces, so the result is close to guaranteed and tests the encoding
  profile, not the operation. **Required:** a second arm with encoding equalised (the same features and relations stored
  for both, by masking the encoding term, §11.5), so any remaining difference comes from what each operation recruits.
- **Precondition:** an Ni operation (Ni-Q1, Ni-Q2). Until then the experiment is designed, not runnable.

### 12.6 Identifiability (2026-11-01 review)

Different mechanisms can produce the same behaviour, so a behavioural difference alone never names the operation that
caused it. The ledger's masking (§11.5) attributes influence inside one run; each experiment must also include at least
one condition where the candidate mechanisms predict **different** outcomes (as §12.5's second arm does), or its result
is reported as unattributed.

### 12.7 The Ti proof-of-mechanism experiment (Rex, 2026-11-01; first, before the other seven functions)

Does a simulated mind improve its contradiction detection through experience, rather than by getting more processing
or memorising answers? Run in isolation; it does not replace the V2 Ti operation (versioning discipline).

- **Operation:** `y_Ti = Run_Ti(X, L, θ_Ti, b_Ti)` returns a conclusion (contradiction found / consistency established
  within scope / unresolved), the resources used and the evidence for the conclusion. `θ_Ti` is concrete: constraint
  search order, which combinations are examined, how contradicting evidence is prioritised.
- **Sequence:** baseline on unseen problems with fixed knowledge and budget; training with feedback that is accurate,
  incomplete or misleading; transfer to new problems, including unfamiliar combinations of constraints; old against new
  `θ_Ti` on identical problems, knowledge and budgets; the whole at several budgets, to separate better quality from more
  computation.
- **Varied separately:** knowledge, budget, training history, feedback accuracy.
- **Measured:** correct detections, false contradiction reports, unresolved cases, resources used, transfer
  performance, confidence before feedback.
- **Never inferred:** improvement from a parameter change or from more practice alone. No generic multiplier.
- **Held fixed:** habit (`h = 1`, `E_0 = 22`); no decay.
- **Report** the exact operation, learning update and results before generalising to Se, Si, Ne, Ni, Te, Fe, Fi.
- Why Ti first: its outputs can be checked against formally defined logic problems without settling subjective values
  or social readings.
- **As designed by the Cognition keeper (2026-11-01; units 5465 design, 5466 operation, 5467 learning, runner and
  report; in `experimental/ti-mechanism/`, not touching V2's Ti).**
  - *Problems:* propositional clause sets from chain, parity, pigeonhole and random 3-SAT families near the
    clause-to-variable ratio 4.26, where random instances are hardest (researched: Mitchell, Selman & Levesque 1992;
    Crawford & Auton 1993). Knowledge `L`: none, accurate, or partly false. Labels come from an exact evaluator outside
    the mind.
  - *Run_Ti:* a budgeted DPLL search (Davis, Logemann & Loveland 1962) returning contradiction, consistent within scope
    or unresolved, with steps used and evidence.
  - *θ_Ti:* softmax branching weights over atom features (occurrences by clause length, polarity, recent conflicts,
    family tags): the search order.
  - *Learn:* REINFORCE (Williams 1992) from received feedback only, under accurate, incomplete (`p_miss = 0.5`) and
    misleading (`p_flip = 0.3`) regimes; both estimates.
  - *Answer confidence:* a Beta belief recorded before feedback.
  - *Controls:* shuffled `θ` and a memorising learner; every number marked estimate; cost sensitivity included.
  - **Keeper check:** matches §4.7 and §12.7 point by point; `θ_Ti` is concrete (a search order), competence is measured
    by the evaluator, the mind learns only from what it is told. One thing to watch in the report: "family tags" among
    the features let `θ_Ti` key on which family a problem comes from rather than its structure; the transfer test on
    unseen family mixes and the memorising control are what tell the two apart, so the report should show transfer with
    and without that feature. **Added (2026-11-01):** 5466 gains a switch that removes every tag-dependent feature (tested); 5467 adds a no-tags arm and reports transfer with and without tags beside the memorising control in one table.


### 12.8 Competing architectures, with the simulator as the testing ground (Rex, 2026-11-02; adopted direction)

**Rex's position.** Build competing models and see which gives the most realistic outcomes; the game simulator is the
testing ground, so whichever backend gives more realistic outcomes, with all the variables of existence present,
decides validity.

**How the reviews sharpen it (consensus, keeper-checked):**
- **Factors, not five unrelated backends.** Routing (independent contributions; compulsory serial chain; selective,
  context-dependent connections), criterion handling (preserve the source criterion; translate it; apply the
  receiver's criterion indiscriminately), learning (fixed against learned routes), source capability (equal first,
  varied later). Then an effect can be traced to route, translation, learning or their interaction. Criterion collision
  must arise from specified operations and inputs, never from a switch that directly produces difficulty.
- **A competitor without eight functions.** Comparing only eight-function variants answers "which interaction works
  best given eight functions", not "are eight needed". **Keeper note:** that competitor already exists: the null
  personality (`nullPersonality`, identity on every hook) is general cognition with memory, needs, learning and context
  but no functions, and T-1 already uses it with random parameters as a control (§12.1). The ladder is: null → eight
  functions without routing → selective routing → serial routing.
- **Realism needs outside observations.** A flexible model can be adjusted until it looks right. Develop on one set of
  scenarios, freeze, then test on unseen ones; compare with independent data (habit curves, analogical transfer,
  conformity, choice and confidence calibration, demographic and historical records), consistent with "historical data
  first" (PRODUCTION §5). The ledger's traces explain the model; they do not validate its psychology, because people
  carry no routing labels: comparisons with people use observable consequences (choices, response times, confidence,
  explanations, recall errors, reactions to changed information, learning across encounters).
- **Having every variable is not having the right relations.** Different equations over the same variables give
  different worlds, and two wrong mechanisms can cancel (too much conflict in cognition hidden by a too-forgiving social
  system). Whole-world runs ask both: does it reproduce the pattern, and through a credible chain of intermediate
  effects?
- **Report separately, never one score:** fit to observations, which mechanism explains each success and failure,
  generalisation to unseen conditions, computational cost (parameter count is not complexity). A weighted total
  `S(M) = Σ w_k D_k + λC` would need weights nobody has sourced.
- **Four result classes** (aligned with §12.3): supported, contradicted, inconclusive, not exercised. A strongly
  contradicted preregistered prediction counts heavily; it does not automatically eliminate a whole architecture.
- **The winner** is "best supported for the tested conditions", not "the valid model of cognition"; models may stay
  indistinguishable, or each win in different settings.
- **Two layers.** Layer 1: small controlled mechanism tests where the models disagree. Layer 2: whole-world runs with
  Life, Reality, Society, Economy and Government, from identical starts and seeds, read alongside short controlled
  scenarios because long runs diverge in environment as well as cognition.

**First experiment (proposed): direct against mediated, one pair.** Hold the source output and total budget fixed;
vary only how the receiver takes it: (A) source output used directly; (B) source → receiver, compatible; (C) source →
receiver, criterion mismatch; (D) source → intermediate → receiver. Measure fidelity (what survived), comprehension
(was it understood), integration (accepted, rejected, unresolved), expression (what reached the decision), and the four
outcomes of §4.9; any emotional response measured separately through the mind–body pipeline. The reviews proposed Fi →
Ti. **Keeper check:** neither Fi's nor Ti's V2 operation is built (5444 is held on C-Q27, Ti-Q1, Fi-Q1), so Fi → Ti
cannot run until those are ruled; a pair from operations already queued (Se, Ne, Te, Fe) could run sooner (Abs-Q6).
Positions 5–8 and any negativity assumption stay out of executable V2.
---

## 13. Results so far

### 13.1 T-3, the hungry pair (unit 2676)

Null against null byte-identical; every formula off equals null. Measured metrics responded to removing F1, F2, F3 and
F12; F8 changed traces only. F4–F7, F9–F11 and F13 had nothing to act on in that fixture. The sixteen stacks collapsed
to three measured behaviours, which is why the domain scenarios were designed.

### 13.2 S1, the forage field (e85813b, 2026-11-01; V1)

- 200 seeds × 17 configurations. Under the original rule: **0 stable, 0 context-dependent, 64 none** (16 stacks × 4
  metrics). Every paired-difference interval includes zero.
- 56 of 64 stack-metric vectors differ from null on some seeds. **ISFJ and ISTJ equal null on every seed and metric.**
  Measured behaviours: sixteen stacks gave eight distinct patterns on these metrics.
- Eight stacks changed cue shares; eight changed only parameters. The generate hook never changed a candidate.
- Ledger (24 seeds): **Se and Si are the only groups whose utility effect excludes zero**, and the only ones with
  learning. The judging groups had no eligible input in S1; under the new rule they read **not exercised**, not "none".
- The T-1 controls were not run then (no runner option); they are being added before S3.
- **Rex's instruction:** preserve all of this, including the negative findings and the identical pairs; never tune V1.

### 13.3 Still to come

S3 (built next on the lane), S2, S4, S5, S6, the V1 against V2 comparison, the knight test, the wardrobe test, the
merchant experiment, the audience experiments, the Ni–Si transfer experiment (§12.5), the Ti proof-of-mechanism
experiment (§12.7, first).

---

## 14. Equation inventory

Every equation in the document, where it is defined, and its status. A refinement that changes one row names the rows
it invalidates in the change log.

| Equation | Purpose | Section | Status |
|---|---|---|---|
| F1–F13 | V1 personality adjustments on the four hooks | §10.2 | V1 built, frozen |
| `ω_f = (5 − i)/4`, `Δ = ρ_E − ρ_I` | V1 stack weights and attitude tilt | §4.2 | V1 built; crude |
| `A_f = softmax(ln B + ln R + ln L + ln M)` | the light and the crystal | §4.3 | designed 2026-10-30; superseded for V2 by §4.5 |
| `E_f`, `C_f = C_f,0 + k_f·log(1 + E_f)` | experience and competence over a life | §4.4 | `E_f` kept as practice history; the log form superseded as a definition (§4.7), kept as a hypothesis |
| `A^x_f`, `H_f`, `M_f`, `g_f` | V2 allocation: habit, motivation, competence as gain | §4.5 | built in `experimental/` (5443); `H_f` and `g_f` superseded by §4.6 |
| `w_c`, `a_c`; ACT-R `B_e`, `P_retrieve` | attention and retrievability | §5.4 | attention and memory built; per-function cue weights open (C-Q17) |
| `e_c = a_c·(1 + Σ A·g·enc)`, `τ_enc` | attention-weighted encoding | §5.5 | V2 designed (5450); `τ_enc` estimate |
| `P(m|w,c)`, `L(v')`, `F`, `w_b` | meaning pools, testimony, fit, bubble exposure | §6.3 | built |
| `P'(m)` with `φ` | Fe contextual semantic modification | §6.4 | V2 designed (5446); `φ_0` estimate |
| `C_Fi`, `C_Ti`, `C_Fe` | coherence scores | §7.2, §7.4 | V2 designed (5444); identity term waits on C-Q23 |
| `EU'(a) = EU(a) + Σ A·g·s·tanh(C/n)` | coherence into decisions | §7.4 | V2 designed (5444); **reopened** (C-Q27) |
| `match(a, R)`, authority `A_i` | Si reference matching | §8.3 | V2 designed (5445); prohibited-feature form proposed (Si-Q1) |
| Te reconfiguration, `k_Te` | Te adds goal-efficient arrangements | §3.5 | V2 designed (5447) |
| `k_Ne`, novelty | Ne branching | §3.3 | V2 designed (5448) |
| `p' = (1 − ψ)p_belief + ψ p_present` | Se immediate response | §3.1 | V2 designed (5449) |
| `Y_Se = F(O_t, ΔO_t, Aff_t)` | Se as the present observable state | §3.1 | proposed (Se-Q1) |
| `M* = argmin[E_traj + λK + γE_rel]`, `E_rel`, `ΔE > C_revision` | Ni relational integration | §3.4 | proposed, not computable (Ni-Q1 to Ni-Q4) |
| `A_ij = Σ P·X̂`; `A_ij(t) = F(…)`; `A_i = F(V, S, C, E)` | attraction and cultural salience | §9.1 | designed (preference learning) |
| `Aura_{i,j,c} = Σ w·q̂` | contextual social valuation | §9.9 | proposed diagnostic (Cul-Q1) |
| `B'_g`, group prior, expectation-driven `π_j` | group association | §9.3 | designed; `ρ` open |
| `D_i(L)`, `V_i(L)`, `w_c` | identity mismatch and semantic variability | §9.4 | designed diagnostics |
| `tolerance = σ(β·(max EU(turn) − EU(leave)))` | conversation tolerance | §9.5 | built |
| `Y_f = F_f(X, R, G, C)` | the common interface (orientation) | §2.2 | proposed architecture |
| `H_f = 1 + h·(1 − e^(−E_f/E_0))` | saturating habit | §4.6 | adopted direction; queued (5463) with `h = 1`, `E_0 = 22` as estimates (H-Q1, H-Q2) |
| competence effects per function; confidence as a belief | processing quality, not strength | §4.6 | adopted direction; equations open |
| `b_f = A_f·B`; `y_f = Run_f(x, R, θ_f, b_f)`; `θ_f ← Learn_f`; `C_f(T, b) = Evaluate_f` | the competence architecture | §4.7 | adopted direction (Comp-Q1); algorithms open; `B` and costs estimates (Bud-Q1) |
| `E_mind[ΔU next step] ≤ C_processing` | when to stop processing | §4.7 | proposed; needs a core owner (Stop-Q1) |
| `z_{f→g} = P_{f→g}(z_f)`; `y_g = Run_g(…; z_{f→g})` | abstraction: one function expressed through another | §4.8 | proposed |
| `c_{f,g} = K_g(z_f, R_g)` | criterion collision | §4.9 | proposed (Abs-Q1) |
| `P_self`, `{P(m|w,b)}` per listener | Fe audience interpretation | §6.4 | adopted direction (Fe-Q2) |
| `C_Fe = Σ_b w_b·P(read as intended | b)` | Fe coherence as a number | §7.4 | proposed (Fe-Q1) |

---

## 15. Open questions register

Every open item that touches the function theory. "Whose" says who decides.

| Id | Question | Whose |
|---|---|---|
| C-Q10 | V1's crude formulas and constants (linear ω, N½ = 10, r = 1.5, K = 3, the /2 factors) | Rex (held) |
| C-Q11 | The end of "an inferior function is never prevented from leading a decision" | Rex |
| C-Q16 | Memory profiles of Se, Ne and Te | Rex |
| C-Q17 | The episode detail vector and the cue-type retrieval weights, and their sources | Rex, matrix |
| C-Q19 | Whether Ne and Ni actively resolve meaning; Fi's "what it notices" | Rex |
| C-Q20 | Sources and ranges for `k_f`, `C_f,0`, the form of `R_f` | Rex |
| C-Q21 | Whether function experience decays without practice; separate from habit saturation. Proposed (§4.6): history never decays; habit may weaken when a context recurs and another function is chosen, recorded apart from mere elapsed time; capability loss needs its own rule; not built yet | Rex |
| C-Q23 | Which structure is the self-model behind Fi's identity term (keeper: beliefs for traits, identity nodes for memberships) | Rex |
| C-Q24 | Coherence principles for Ni, Se and Ne; Ni's exact reference (outcome, causal model or pattern). Candidate answer for Ni: the relational pattern, with outcomes and causal models as its products (§3.4; Ni-Q1) | Rex |
| C-Q27 | How coherence or Si match enters a decision. Designed in V2 (§7.4, §8.3); **reopened 2026-11-01**: the term adds value without a need. Keeper proposal: gate it to candidates that serve an active need, or act through belief | Rex |
| Ni-Q1 | Adopt relational integration as Ni's foundation (closing C-Q24 for Ni)? And is the matrix's "self-referenced strategy" one of its products or a separate statement? | Rex |
| Ni-Q2 | How Ni's structures are built and chosen: how observations become candidate relations, the distance `d`, `E_trajectory`, `K(M)`, and how the result reaches predictions and decisions | Rex; Cognition keeper drafts |
| Ni-Q3 | Whether `E_relations` and `E_contradiction` double-count `E_trajectory`; values or sources for `λ`, `γ`, `w_ab` | Rex |
| Ni-Q4 | The form of `C_revision`, so Ni's rigidity comes from its own operation and does not duplicate shared belief inertia or attribution | Rex; Cognition keeper drafts |
| Se-Q1 | Se's defining transformation: action affordances, change detection, or both | Rex |
| Se-Q2 | "Se users avoid aura loss": confirm it is a prediction tested through attention and the mind's own needs, never a coded Se motive | Rex |
| Si-Q1 | Add prohibited features to Si's reference (`R̄`, §8.3)? | Rex |
| Cul-Q1 | Is one extraverted plus one introverted function per culture a rule, or the predicted outcome of learned cultural weights (§9.9)? Is the order of the two really irrelevant? | Rex; touches Society |
| Cul-Q2 | What "the two do not overlap" means: different domains, or something else | Rex |
| H-Q1 | How `E_f`'s units map onto Lally et al.'s daily repetitions, to set `E_0` | Rex; Cognition keeper drafts |
| H-Q2 | The ceiling `h` on habit (no source) | Rex |
| Comp-Q1 | The competence architecture. **Direction adopted 2026-11-01 (§4.7);** each function's `Run_f` and `Learn_f` open, Ti first (§12.7) | Rex; Cognition keeper drafts |
| Bud-Q1 | The total budget `B` and each operation's cost (estimate or fiction, with sensitivity runs); whether `B` later reads fatigue or arousal (Reality) | Rex |
| Stop-Q1 | The stopping rule's owner (core Cognition, not personality) and its bounded estimate | Rex; Cognition keeper |
| Alloc-Q1 | How method confidence (the believed benefit of processing with `f`) enters allocation beside habit and motivation | Rex |
| P9-T | A direct test that an inferior function can lead under the full allocation rule (principle 9) | Cognition keeper |
| Abs-Q0 | The order of positions 5–8 for each type (the matrix names the positions, not which function sits in each) | Rex |
| Abs-Q1 | Is a shadow function's information unwelcome to the receiving structure (criterion collision), hard to express (transformation), or both? | Rex |
| Abs-Q2 | Abstraction acts on expression only, never on allocation, so principle 9 holds at any depth? | Rex |
| Abs-Q3 | Does the eighth position generate its own information, or is it reconstructed from the first seven? And do the eight functions reduce to four mechanisms with attitude as a modifier (against §3's eight operations)? | Rex |
| Abs-Q4 | What "at ease" changes: competence (`θ` admits the source criterion), interpretability, integration or routing; and is it the matrix's "balanced" column? | Rex |
| Abs-Q5 | Routing: independent, serial, selective or a mix; what sets the active route; does the receiver select, reinterpret or reconstruct? | Rex; tested by §12.8 |
| Abs-Q6 | The first direct-against-mediated pair (Fi → Ti waits on 5444; a pair from Se, Ne, Te, Fe could run sooner) | Rex; Cognition keeper drafts |
| Coh-Q1 | The scale of the coherence and Si terms, from the stake of the need served instead of the candidate range | Rex |
| Ti-Q1 | Whole-set consistency for Ti, with a bounded search depth as Ti competence | Rex |
| Fi-Q1 | Fi compatibility over feature pairs plus the identity term, with association as evidence only | Rex |
| Fe-Q1 | `C_Fe` as the expected chance of being read as intended | Rex |
| Fe-Q2 | Confirm Fe keeps its own reading and a per-listener map, and expression is ordinary response selection (replaces the §6.4 pooling) | Rex |
| Si-Q2 | General matching (own actions, others' behaviour, objects) as evidence; role authority as one use | Rex |
| Ni-Q5 | Ni's objective only in learning, never in decision (principle 10 kept), or a motivational anchor | Rex |
| Num-Q1 | Smooth `k` counts, clipping, possible double attention in encoding (§11.4) | **ruled by the Cognition keeper 2026-11-01** (§11.4); Rex may replace the estimates |
| C-Q28 | The form of motivational modulation `M_f` | **proposed in V2** (§4.5); Rex may replace |
| Te-Q1 | Does Te keep its measures fixed while reconfiguring, or change measures when another serves the objective better? | Rex |
| Ori-Q1 | Where an extraverted function's objective comes from (axis partner, group, need, task), compatible with "personality never sets a goal" | Rex |
| B1, B2, B3 | Matrix questions: Si weakness emphasis; Ne acts or only predicts; grudge or grip | Rex |
| G-Q1 to G-Q4 | Group association: strength and asymmetry of expectation-driven attention; significance of an experience; overlapping groups (now also: the new-person prior is not a probability under overlap, §9.3); confirm the Ne, Ni, Fe, Te routes | Rex |
| SR-Q1 to SR-Q4 | Contextual meaning: the self-model (= C-Q23); the shared meaning space; overlap split and context pooling; audience features | Rex |
| P-Q1 to P-Q4, A-Q1 to A-Q6 | Preference learning and attraction forms, sources and scenarios | Rex |
| C-G2, C-G3a | Legitimacy: how the belief enters obedience; the estimated likelihood ratios | Rex |
| COG-48 | A per-function mask inside frozen V1 (V2 solves it for V2) | Rex |
| SC-2, SC-3 | Scenario estimates (S3 commitment, S5 upbringing length) | keeper; Rex may set |
| V2 estimates | `s`, `φ_0 = 0.5`, the `k` multipliers, `τ_enc = 0.1`, the habit and motivation forms | Rex |

---

## 16. Change log

| Date | Change |
|---|---|
| 2026-11-02 | Document created by the Cognition keeper at Rex's request, from DESIGN §9, §13, §14, §16, §18–§22, the scenarios design, the S1 report and Rex's statements of 2026-10-30 to 2026-11-02, including the orientation principle (§2.2), recorded here for the first time. |
| 2026-11-01 | **First paste to the Function design keeper:** ChatGPT's Ni proposal, Gemini (two answers) and Venice reviews, ChatGPT's assessment of the reviews; Rex's Se and aura observation with ChatGPT's reply; ChatGPT's review of this document. **Came in and was recorded:** Ni as relational integration, with the graph, the objective, apophenia, rigidity as a consequence to test, the Ni–Ti boundary and what was not adopted (§3.4); Se as the present observable state and the Se–Ni axis (§3.1); aura and cultural valuation (§9.9); the Ni–Si transfer experiment (§12.5). **Changed:** two status markers and a rule against silent rewrites (header); the domain-pair and axis-pair distinction (§2.1); the orientation principle's status (§2.2, it is recorded in ENGINES); §4.3 and §4.4 marked superseded for V2 by §4.5, with the indirect route by which competence still reaches allocation; §5.1 stage roles read as leading, not exclusive; §7 and §7.3 retitled (coherence is not judging-only); §11.7 build state corrected (5441–5443 landed); new §3.9 derivation table and §14 equation inventory; open questions renumbered §15, this log §16. **Flagged:** C-Q27 reopened (the coherence term adds value without a need; keeper proposal to gate it); Si's match does not penalise forbidden features (half the review's point; keeper proposal Si-Q1); Ni's graph must live in the belief store and its rigidity must not reuse shared belief inertia (§3.4 check); `λ`, `γ`, `w_ab` have no values; Rex's one-pair-per-culture rule against the paste's learned-distribution form (Cul-Q1, touches Society). **Not adopted, as the paste itself concluded:** Gemini's claims that rigidity is explained and that Ni is more visionary or accurate; Venice's "structure mapping renamed". New open items Ni-Q1–Q4, Se-Q1–Q2, Si-Q1, Cul-Q1–Q2. |
| 2026-11-01 | Cognition keeper's reply recorded: 5444 narrowed (coherence scores as execution records, no EU term until C-Q27 is decided); 5445 keeps the positive-only match (Si-Q1 open); 5459 amends DESIGN.md to match §4.4, §5.1, §2.2 and the reopened items (§7.4, §11.7). |
| 2026-11-01 | **Second paste:** review round by several AIs (a five-point formula reviewer, Venice on Ni, a reviewer proposing a Ti/Fi split, a mathematical reviewer's ten-item list as summarised by ChatGPT, a checker's verification, ChatGPT's syntheses); Rex: alter by the consensus. **Adopted as Rex's direction (consensus):** the revision standard (header); saturating habit replacing linear habit, decay kept separate (§4.6); competence as processing quality, confidence as a belief (§4.6); Fe keeps a per-listener map and leaves expression to response selection (§6.4). **Recorded as verified defects, forms open:** coherence scale `s` depends on irrelevant alternatives (§7.4, also §8.3); Ti pairwise misses three-way contradictions; Fi pair score is association; `C_Fe` type mismatch; Si matching narrowed to own-role conformity (§8.3); Ni objective self-validating; group prior invalid under overlap (§9.3); round/clip/encoding artifacts (§11.4); §12.5 confounded with encoding; identifiability (§12.6). **Keeper checks that disagreed with a reviewer:** Fe product cannot go undefined with Dirichlet smoothing; Ni's priority is representable through `B_f` (crude, C-Q10); V1's Ni in S1 is not exercised, not a negative; Ni-Q5 resolves without amending principle 10 if `M*` stays in learning. Superseded in place: §4.5 `H_f` and `g_f`; §6.4 pooling. Units affected: 5443 (built forms), 5445, 5446, 5447–5450; Cognition keeper told. New questions H-Q1–Q2, Comp-Q1, Coh-Q1, Ti-Q1, Fi-Q1, Fe-Q1–Q2, Si-Q2, Ni-Q5, Num-Q1. |
| 2026-11-01 | Cognition keeper's application of 7cd2d0b recorded: 5463 saturating habit (`h = 1`, `E_0 = 22`, estimates) and `g_f` removed; 5446 redrafted as the Fe audience map; 5447–5450 without `g`, Num-Q1 ruled; 5444 and 5445 held until Rex rules; 5464 records it in DESIGN §22.7 (§4.6, §11.4, §11.7, §14, §15). |
| 2026-11-01 | **Third paste:** Rex's review conversation on line item 1 (competence), ChatGPT and a second reviewer. **Adopted as Rex's direction:** the competence architecture (§4.7): allocation as a budget, the operation `Run_f`, learned parameters `θ_f`, competence measured outside the mind as a profile over tasks and budgets; quality and efficiency separate; knowledge separate from capability; answer and method confidence as beliefs; Ti's three outcomes; costs as labelled assumptions; the Ti proof-of-mechanism experiment first (§12.7); habit constants provisional and fixed, no decay yet (§4.6). **Changed:** §4.4's log competence form superseded as a definition, kept as a hypothesis; §4.6's competence table replaced by the reviewers' operational tests; §4.6 confidence and disuse refined; §7.4 Ti outcomes. **Flagged:** allocation-as-budget is new to the engine (no budget exists; the baseline decides in one pass), so inside V2 the budget lives in each hook call (Bud-Q1); the stopping rule is general cognition and needs a core owner, not personality (Stop-Q1); confidence needs a term to reach allocation (Alloc-Q1); registry rows `function_development` and `function_allocation` still carry the log form, competence feedback and `L_f`; principle 9 needs a direct test (P9-T). Recorded as Rex's adopted direction from this paste; the paste's own note that 'approved' is Rex's word stands, so he may overrule. |
| 2026-11-01 | Cognition keeper's reply on de6625b recorded: 5468 removes the competence number from V2 allocation; the Ti experiment designed as 5465–5467 (budgeted DPLL over chain, parity, pigeonhole and near-4.26 random 3-SAT; θ as branching weights; REINFORCE from received feedback; Beta answer confidence; shuffled-θ and memorising controls) (§12.7, §11.7). Flagged in §12.7: the family-tag feature could let θ learn problem families instead of structure; the report should show transfer with and without it. |
| 2026-11-01 | Family-tag check answered: 5466 switch, 5467 no-tags arm and one comparison table (§12.7). |
| 2026-11-02 | **Fourth paste:** Rex's abstraction idea (one function expressed through another; the pin-art board), dark abstraction and the shadow positions, and his proposal to test competing models in the simulator; reviews by ChatGPT (several), Gemini and DeepSeek with ChatGPT's syntheses. **Recorded:** §4.8 abstraction as composition with the smallest interface (source output as an extra input through a projection; source intact; three claims tested separately; both directions; routing as a third relation); §4.9 dark abstraction with three candidate causes (depth, criterion collision, low practice), the four expression outcomes and 'at ease'; §12.8 competing architectures as factors, the simulator as testing ground, held-out tests and outside observations, four result classes, and a direct-against-mediated first experiment. **Keeper checks:** §5.1 already holds one fixed crossing (reuse it); a product of retentions cannot express order; abstraction never touches allocation; leading is not routing, so serial stays a candidate; positions 5–8 are unwritten (principle 6), so nothing about them is executable until Rex gives their order; the competitor without functions already exists as the null personality; Fi → Ti cannot run until 5444 is ruled; 'at ease' may be the matrix's 'balanced' column. **Not adopted:** that the positions are already derivable; that serial routing is excluded; a single weighted realism score; resentment as a direct result of collision. New open items Abs-Q0 to Abs-Q6. |

<!-- END FUNCTION-DESIGN.md verbatim -->

---

# Part C: imported from DESIGN.md, verbatim

> Source: `Toolchain/cognition/DESIGN.md` at repo HEAD df0b6c0 (last changed 22e79fa), read with `git show HEAD:DESIGN.md` (LF), sha256 `78c0d0fec17004e88279b258c4e3c2fe2f2a89448967785face495668a02b495`. Each section below is copied byte-for-byte between its markers; nothing is reworded. DESIGN.md stays in the repo as reference; when this plan is approved, edits to these sections are made here and DESIGN.md is marked superseded section by section (Part D).

## C/§0 — imported from DESIGN.md §0 (lines 17–55): fence and boundaries (A.1)

<!-- BEGIN DESIGN.md §0 verbatim -->
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
<!-- END DESIGN.md §0 verbatim -->

## C/§1 — imported from DESIGN.md §1 (lines 57–78): objective vs subjective world (A.1)

<!-- BEGIN DESIGN.md §1 verbatim -->
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
<!-- END DESIGN.md §1 verbatim -->

## C/§2 — imported from DESIGN.md §2 (lines 80–430): perception, needs, beliefs and memory, decision, intention emission and the resolution contract CG-16/IF-26/IF-27 with IF-46, payment acceptance, learning (A.3, A.4)

<!-- BEGIN DESIGN.md §2 verbatim -->
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
<!-- END DESIGN.md §2 verbatim -->

## C/§3 — imported from DESIGN.md §3 (lines 432–458): policy interface and θ (A.2, A.5)

<!-- BEGIN DESIGN.md §3 verbatim -->
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
<!-- END DESIGN.md §3 verbatim -->

## C/§4 — imported from DESIGN.md §4 (lines 460–466): state, reducer, events (A.2)

<!-- BEGIN DESIGN.md §4 verbatim -->
## 4. State, reducer, events (proposed)

A population of minds is one reducer state (`MindsState`: minds by id in mint order, counters, the stream state),
reduced by commands `observe`, `decide`, `outcome`, `tickNeeds`, `addMind`, with the kernel `Runner` (log,
events, replay). Ids from kernel `mint`: `mind.0001`, `bel.0001`, `ep.0001`, `int.0001`. Events emitted:
`cognition.intention`, `cognition.attribution`. Events consumed: the host's outcome events (with `cause`), the
host's stimuli and need signals for the epoch.
<!-- END DESIGN.md §4 verbatim -->

## C/§5 — imported from DESIGN.md §5 (lines 468–652): registry rows; §5.1 the communication build (A.3 #13)

<!-- BEGIN DESIGN.md §5 verbatim -->
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

### 5.1 The communication build (released by the controller 2026-11-01; keeper's forms, proposed)

Rex's rules (ENGINES.md "Communication and information transmission", "Conversational plausibility"; §18) bind
this section: **a message delivers information, and the receiving mind decides what it means. Transmission is not
comprehension, comprehension is not acceptance, and acceptance is not compliance.** A message is a Stimulus, so
perception is reused, never duplicated, and belief change goes through §2.3's update, never a second
belief-changing system. There is no charisma roll, no resistance score, no keyword unlock and no patience bar.
Every quantity named below is already registered. This build adds no mechanism row.

**Message (`cognition.communication.message`, format only).** `world.message = { id, sender, receivers, medium, t,
utterances }`. Each utterance is `{ act, term, about, claim?, declared? }`:
- `act` is host data, such as assert, ask, request, offer, warn, joke or greet.
- `term` is the public word.
- `about` is the entity handle the speaker refers to.
- `claim` is the speaker's intended `(attribute, value)`.
- `declared` is an explicit definition the speaker supplies for `term`.
Transmission is Reality's (`realism.communication.transmission`). The host delivers `world.message_received` to each
mind as a Stimulus with channel `report` and its detectability. Whether an unintended receiver notices it
(`cognition.communication.detection`) is ordinary §2.1 detection; no new code exists for it.

**Comprehend (`cognition.communication.comprehend`; writes `mind.testimony` and `mind.meaning_pool`).**
- **Pool.** A mind's pool for a term `w` holds candidate meanings `m`. Each maps the term to an `(attribute, value
  rule)`, and each carries usage counts `n_{m,b}` per bubble `b` it was met in.
- **Selection** in the current bubble `b*` (the host gives the setting's group handle; §18.3's context also counts
  the speaker and the listeners present as bubbles) is a two-level Dirichlet:
  `P(m | w, c) = ( n_{m,b*} + α · P_pool(m) ) / ( N_{b*} + α )`, where `P_pool(m) = n_m / N`. This is the same
  nesting as §20.2 (Teh et al. 2006, hierarchical Dirichlet; level 4).
  `α` is the pool's concentration, default 1 (keeper, `sourced: false`). It is the interpret hook's new parameter
  `poolConcentration`; the null model and v1 leave it at 1.
- **Familiarity.** A mind familiar with `b*` resolves by that bubble's usage. In an unfamiliar bubble
  (`N_{b*} ≈ 0`) it falls back on its whole pool and forces its home meanings, as Rex's C-Q18 answer describes.
  This is an outcome, not a rule.
- **Testimony.** Testimony is the meaning mixture through §2.3's likelihood:
  `L(v') = Σ_m P(m | w, c) · [ r_j · [v' = v_m] + (1 − r_j)/K ]`, with `r_j` the speaker's credibility. With one
  certain meaning it reduces exactly to §2.3. A `declared` definition enters the pool as a candidate (see below);
  it is not an override.
- **Fit and reconstruction.** The fit of the resolved reading is `F = Σ_m P(m | w, c) · P_prior(claim_m holds)`. If
  `F < θ_pre` (§2.4's threshold, reused), or the term has no pool, the mind records a **confusion** observation:
  `{ speaker, term, F }` in its processing trace and as an internal cue for the next decision. Reconstruction adds
  a candidate with one count in `b*` when the speaker declares a meaning, or when the host shows the group's usage
  (`{ term, meaning, bubble }` observed). A candidate grows only as later uses reinforce it, so the pool drifts
  (§18.1).
- **Reinforcement.** When a resolved reading is confirmed (a later observation or reply agrees, with no repair),
  `n_{m,b*} += 1`.
- **Equivocation.** Comprehend keeps the reading of each term per partner per conversation. If the most probable
  meaning of `w` changes inside one conversation without a `declared` change, the listener records an
  **equivocation** cue `{ speaker, term, from, to }`. Whether it is noticed is attention (pertinence of the
  category `equivocation`). The interpret hook parameter `equivocationPertinence` defaults to 0 and takes effect
  only when a personality version supplies it.

**Bubble exposure (`mind.bubble_exposure`).** It is derived from episodes, never stored twice:
`w_b ∝ Σ_e P_retrieve(e) · s_e · [e ∈ b] / |C(e)|`, which is §21.4's split, so an episode shared by several groups
counts once.

**Credibility (`cognition.communication.credibility`; writes `mind.source_credibility`).** Each received claim is
kept as a pending testimony `{ speaker, about, attribute, value, t }` in `mind.testimony`. A later direct observation
of the same `(about, attribute)` settles it. If it matches, `r_j` gains `+1` on α; if it does not, `+1` on β, each
weighted by the observation's confidence (`updateReliability`). This is §2.3's "an exposed lie lowers `r_j`", made
explicit. Credibility stays in the mind, never on Society's tie (DUP-60).

**Persuasion (`cognition.communication.persuasion`; writes `mind.evaluation_target`, a read-out).** For each
utterance, the target is the belief its testimony moved. Its effect is the change in each candidate's `EU` from the
belief before to the belief after. The listener's **real objection** for an action `a` is the belief, among those
`a`'s naive model reads, whose change toward the speaker's claim would most reduce `max_{a'} EU(a') − EU(a)`. It is
computed by evaluating one counterfactual belief at a time. The record says whether the message hit it. Nothing reads
this record to decide anything. A message can be logically strong and miss, and it can backfire when the listener's
beliefs about the speaker's motive (conversation state) make the claim evidence of a pitch. Both are outcomes.

**Encode (`cognition.communication.encode`; writes `world.message`).** Saying is an intention chosen by
`cognition.decision.select` among the host's utterance acts. Encode only builds the content:
- **Claim.** By default the claim is the mind's most probable value (honest). A deceiving act carries its declared
  claim as host data, as in the hungry pair's deceive.
- **Word.** The word is `argmax_w P_self(m_target | w, b*)`: the speaker's own pool used as its model of what the
  listener will understand. This is the believed shared context, so it can be wrong.
- **Articulability.** Articulability (§16.2) is the encode parameter `articulability ∈ [0, 1]`, default 1. It is the
  share of the claim's detail that can be said. Fi's lossy encoder is this parameter in a later personality version.
- **Capacity.** The medium's capacity (`world.medium_properties`) truncates the utterance list in order.
  `society.comm_network` and `society.comm_restriction` are host-side inputs to who can be addressed and which
  medium is open; encode does not read them as rules.
- **Consistency.** The speaker keeps its own term bindings per conversation, so it does not switch meanings
  silently.

**Conversation state (`cognition.communication.conversation_state`; writes `mind.conversation_state`,
`mind.believed_shared_context`, `mind.engagement_willingness`).** One record per mind and partner:
- **Believed shared context.** The `(about, attribute)` pairs this mind believes the partner knows. They are added
  when the mind said or heard them with that partner, and they are its belief only.
- **Perceived intention.** A categorical belief over host-declared intention kinds (help, pitch, threat, joke,
  flirt, fishing, time-wasting). It is updated by §2.3 from each utterance act with a host likelihood table. An
  utterance about something outside the believed shared context, with no link, raises the confusion cue.
- **Relationship and history.** Relationship and history are the mind's episodes with that partner (context =
  partner) and its credibility for them. No new store.
- **Tolerance (C-Q12, derived, cacheable).** `mind.conversation_tolerance = σ( β · ( max_{a ∈ turns} EU(a) − EU(leave) ) )`,
  where `σ` is the logistic function. It uses the existing `β` and the EU of the host's conversational acts
  (answer, ask for clarification, interpret, redirect, challenge, leave). It is the selection probability of
  staying against leaving, so it is in [0, 1] and is never a need or a draining bar. Its causes stay separate:
  the social-connection drive (§2.2), available attention (§2.1), beliefs and EU (§2.3, §2.4), and episodes.
  `mind.engagement_willingness` is the same read-out before the first turn.
- **Emergence.** Awkwardness, lingering and repair emerge from these beliefs and choices. No script exists.

**Not in this build:** gaze (C-Q14 open), learned language competence (`cognition.communication.language`; needs
`cognition.skill.practice`), the §16 chemistry stages (Life's REAL-29), and `cognition.relationship.trust`. All
new interpret and encode parameters default to neutral, so the null model, personality v1 (F1–F13 frozen) and every
existing result are unchanged. **Tests (level 5):**
- A stranger told "buried treasure" with no shared context records confusion, and a close friend does not.
- Two minds with different bubble histories resolve the same word differently.
- An undeclared mid-conversation switch produces an equivocation cue.
- A contradicted claim lowers `r_j`.
- A message can miss the listener's real objection.
- Tolerance falls when leaving is worth more than staying, and rises for a partner the mind values.
<!-- END DESIGN.md §5 verbatim -->

## C/§6 — imported from DESIGN.md §6 (lines 654–704): the hungry-pair benchmark and CB-1..CB-7 (A.7)

<!-- BEGIN DESIGN.md §6 verbatim -->
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
<!-- END DESIGN.md §6 verbatim -->

## C/§7 — imported from DESIGN.md §7 (lines 706–717): Kernel contract (A.4)

<!-- BEGIN DESIGN.md §7 verbatim -->
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
<!-- END DESIGN.md §7 verbatim -->

## C/§8 — imported from DESIGN.md §8 (lines 719–739): Reality ports: neuroscience inputs and outputs (A.4)

<!-- BEGIN DESIGN.md §8 verbatim -->
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
<!-- END DESIGN.md §8 verbatim -->

## C/§10 — imported from DESIGN.md §10 (lines 911–928): verification and validation V1–V5 (A.7)

<!-- BEGIN DESIGN.md §10 verbatim -->
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
<!-- END DESIGN.md §10 verbatim -->

## C/§12 — imported from DESIGN.md §12 (lines 941–984): open items, every id as it stands

<!-- BEGIN DESIGN.md §12 verbatim -->
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
<!-- END DESIGN.md §12 verbatim -->

## C/§14 — imported from DESIGN.md §14 (lines 1125–1209): memory below personality, gaze, absence, drugs (neuroscience directions)

<!-- BEGIN DESIGN.md §14 verbatim -->
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
<!-- END DESIGN.md §14 verbatim -->

## C/§15 — imported from DESIGN.md §15 (lines 1211–1231): contract fields: rate limiter and failure mode per built row

<!-- BEGIN DESIGN.md §15 verbatim -->
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
<!-- END DESIGN.md §15 verbatim -->

## C/§16 — imported from DESIGN.md §16 (lines 1233–1320): experience pipeline, memory three values, mathematical form (neuroscience; Part B §5 condenses it)

<!-- BEGIN DESIGN.md §16 verbatim -->
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
encoding). Read as: the introverted function **leads** encoding; every function's encoding weights apply, weighted by
allocation (§16.4, §22.4).
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
<!-- END DESIGN.md §16 verbatim -->

## C/§17 — imported from DESIGN.md §17 (lines 1322–1347): knowledge of history (History / Knowledge contract)

<!-- BEGIN DESIGN.md §17 verbatim -->
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
<!-- END DESIGN.md §17 verbatim -->

## C/Sources — imported from DESIGN.md Sources (lines 2003–2014): bibliography behind A.5

<!-- BEGIN DESIGN.md §Sources verbatim -->
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
<!-- END DESIGN.md §Sources verbatim -->
---

# Part D: import map (every DESIGN.md section, 2026-11-02)

**imported** = copied verbatim into Part C. **superseded** = Part B carries a later dated statement of the same thing;
DESIGN's text is kept in the repo for the record, never followed where it differs. **reference** = stays in DESIGN.md
and is cited by file and section; Part B carries its theory in condensed form or it belongs to another track. Where an
imported section and Part B differ, Part B is Rex's and the later text (e.g. C/§16.1 stage 2 vs B/§5.1 "leads").

| DESIGN.md section | Disposition | Where in this plan / why |
|---|---|---|
| Header, status, evidence levels (l. 1–15) | reference | A.5 uses its PLATFORM §4 levels; approval status superseded by this plan once Rex approves |
| §0 What Cognition is, and its fence | imported | C/§0; A.1 |
| §1 Objective world vs subjective mind | imported | C/§1; A.1 |
| §2.1 Perception and attention | imported | C/§2; A.3 #1–#2 |
| §2.2 Needs, goals and motivational priorities | imported | C/§2; A.3 #5–#6 |
| §2.3 Knowledge and memory, beliefs | imported | C/§2; A.3 #3–#4 |
| §2.4 Action generation, evaluation, selection; social affordances (IF-46); resolution of an intention (CG-16, IF-26, IF-27); payment acceptance | imported | C/§2; A.3 #7–#10, A.4 |
| §2.5 Learning: observe, attribute, update | imported | C/§2; A.3 #11–#12 |
| §3 The policy interface | imported | C/§3; A.2 θ |
| §4 State, reducer, events | imported | C/§4; A.2 |
| §5 Quantities and registry rows; conversational plausibility | imported | C/§5; A.2 |
| §5.1 The communication build | imported | C/§5; A.3 #13 |
| §6 The hungry pair, CB-1..CB-7, P7-3 | imported | C/§6; A.7; fixture labelled fiction in A.5 |
| §7 Kernel contract | imported | C/§7; A.4 |
| §8 Reality ports (detectability, hunger, satiety, taste, capacity, mood, transmitters, hormones; appraisal and recalled-body outputs) | imported | C/§8; A.4 (the neuroscience interface) |
| §9 Personality: framing, how built, source, hooks, stack and weights, F1–F13, off list, data and versions, fingerprint check | superseded | B/§10 (V1 in full), B/§2–§3; DESIGN keeps the formulas.json linkage for the frozen code |
| §9 Dynamic function allocation (light and crystal) | superseded | B/§4.3, then B/§4.6–§4.7 and B/§11.3 (Rex, 2026-11-01/02) |
| §9 Tests of the layer T-1..T-3; C-Q3 | superseded | B/§12.1; C-Q3 also in C/§12 |
| §10 Verification and validation | imported | C/§10; A.7 |
| §11 What the pirate repo holds | reference | pirate re-seating is the PL track's, not a Cognition mechanism |
| §12 Open items | imported | C/§12; ids unchanged |
| §13 Preference learning, §13a mechanisms, §13b attraction | reference | B/§9.1 carries the theory; full forms and registry rows stay in D/§13; nothing built; M5+ (A.8) |
| §14.1 Memory sits below personality | imported | C/§14; A.3 planned |
| §14.2 Gaze | imported | C/§14; C-Q14 |
| §14.3 Intermittent characters | imported | C/§14 |
| §14.4 Tattoos, body features, names | imported | C/§14; B/§9.2 |
| §14.5 Drugs alter the person | imported | C/§14; C-Q15 |
| §15 Contract fields: rate limiter and failure mode | imported | C/§15; A.4 failure column |
| §16 Experience pipeline, memory three values, requirements, mathematical form | imported | C/§16 (full forms); B/§5 is Rex's later condensed text and wins where different |
| §17 Knowledge of history | imported | C/§17; A.4 |
| §18.1–§18.3 Semantic systems, function profiles, attachment | reference | B/§6.1–§6.3; the built part is C/§5.1 |
| §18.4 Ti/Fi shared compatibility primitive | superseded | B/§7 (Rex, 2026-11-01 refinement; §7.4 V2 form, C-Q27 reopened per COG-66) |
| §18.5 Si reference matching | superseded | B/§8 (§8.3 executable form, 2026-11-02) |
| §19 Developmental cognitive functions | superseded | B/§4.4–§4.7: competence measured outside the mind (Rex, 2026-11-01; COG-70); C-Q20/C-Q21 rewording still owed |
| §20 Social categorisation and group association | reference | B/§9.3; DESIGN keeps the update (§20.2), experiment (§20.7) and registry audit; G-Q1–G-Q4 |
| §21 Contextual meaning, private judgement, public expression | reference | B/§9.4; DESIGN keeps the diagnostics (§21.4) and experiments; SR-Q1–SR-Q4 |
| §22.1–§22.6 Personality V2 | superseded | B/§11, B/§4.6–§4.7, B/§7.4, B/§8.3; §22.7 itself records that the review consensus supersedes §22.3–§22.4 |
| §22.7 Review consensus adopted by Rex | superseded | B/§11 and B/§4.7 carry it |
| Sources | imported | C/Sources; A.5 |
| Log | reference | history of DESIGN changes; this plan's own log starts at approval |

**Other files, all reference:** `HQ/handoffs/cognition/C-G3-DESIGN.md` (legitimacy; B/§9.6; C-G2, C-G3a);
`bench/scenarios/` DESIGN (S1–S6, classification rule; B/§12.2–§12.3); `bench/hungry-pair/REPORT.md` (CB verdicts);
`validation/` (empty in the tree: the V1 PASS and V2 FAIL results are recorded in C/§12 C-V2 and `HANDOFF-ARCHIVE-2026-11-01.md`; a tracked report is a gap noted in COG-73); `CHECK.md` (CB-6b certificate); `experimental/personality-v2`, `experimental/ti-mechanism`
(experimental track); `HQ/handoffs/cognition/FUNCTION-DESIGN.source.md` (an older copy of Part B, superseded by Part B).

**Gaps found (neither DESIGN nor Part B says it, or the code disagrees):** COG-73 (scalar `capacityFunctional` vs the
DUP-15 record; registry still lists the built communication rows as planned); COG-74 (the hungry pair eats by a fixture
trigger, so the eat decision of M1a has never run).
