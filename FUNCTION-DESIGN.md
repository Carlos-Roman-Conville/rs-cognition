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
4. The stack, allocation and development
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

As of 2026-11-01 (Cognition keeper's report after the review consensus): **landed** 5441 (the §22 correction,
b460f15), 5442 (the optional engine hook points, 63823f9) and 5443 (the V2 package in `experimental/personality-v2/`
with §4.5's allocation, 98a3046). **Queued:** 5459 (DESIGN.md amendment), 5463 (saturating habit, `g_f` removed from
every operation, competence recorded only), 5446 (Fe as the audience map, §6.4), 5447 Te, 5448 Ne, 5449 Se and 5450
encoding (all without `g`; Num-Q1 rulings below), 5451 ledger and the V1/V2 comparison, 5452 isolation tests, 5464
(DESIGN §22.7 recording these changes). **Held, out of the queue until Rex rules:** 5444 Ti/Fi coherence (Ti-Q1,
Fi-Q1, Fe-Q1, Coh-Q1, C-Q27) and 5445 Si (Si-Q1, Si-Q2, Coh-Q1). The operations are not built until their units land.
§3.9 is a first step toward §11.6's map.

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
