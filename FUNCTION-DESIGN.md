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

**Section map.**
1. Founding principles
2. The structure of the eight functions
3. The eight functions, one by one
4. The stack, allocation and development
5. The experience pipeline and memory
6. Meaning: semantic systems
7. Coherence: the shared judging primitive
8. Reference matching: Si
9. Applications: preference, attraction, groups, self and expression, communication, legitimacy
10. Personality V1 (frozen) in full
11. Personality V2 (designed)
12. How the theory is tested
13. Results so far
14. Open questions register
15. Change log

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

### 2.2 Attitude: extraverted and introverted

**V1 reading (Rex, matrix "Attitudes: extraverted vs introverted, for all eight functions" [CARLOS, 2026-10-24]).**
- **Direction of data.** Extraverted functions weigh external data more; introverted functions weigh internal theory
  more. Both channels are always present ("never pure").
- **Mastery and scope.** An extraverted tilt spreads attention wide ("scattered"); an introverted tilt focuses it.
- **Failure and resilience.** Extraverts fail more, get used to it and become resilient; introverts fear failure more.
- **The ratio.** The mix of the two attitudes in a stack sets a tilt `Δ` (§4.2).

**The orientation principle (Rex, 2026-11-02; proposed, not yet in DESIGN).** Rex's newer and deeper reading:
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
  check. **Keeper note:** in the engine, objectives are needs and goals (§2.2), and personality never sets a goal. The
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
  trajectory (C-Q24).
- **Open, and why it matters (Rex, 2026-11-02).** Does Ni preserve an anticipated outcome, a causal model of how
  events connect, or one interpretation toward which observations are organised? These are mathematically different:
  an anticipated outcome judges events by whether they support it; a causal model can revise its prediction while
  keeping its structure. **No V2 Ni operation is built until this is settled, and V1's other-mind projection (F10)
  is never substituted as V2's Ni.**
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

- **Feedback (Rex).** Competence feeds back into future allocation, so two people with one hierarchy diverge by
  environment: an ESTP raised on abstract planning develops more Ni facility than one rewarded for immediate action.
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

---

## 5. The experience pipeline and memory

### 5.1 The pipeline (Rex, 2026-10-31)

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

---

## 7. Coherence: the shared judging primitive

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

### 7.3 One primitive for the four judging functions (Rex)

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

## 11. Personality V2 (designed, not built)

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
its operation acts.

### 11.4 The operations

| Function | Operation | Equation (summary) | Section |
|---|---|---|---|
| Ti | conceptual coherence | `C_Ti` from beliefs about contradiction | §7.4 |
| Fi | evaluative coherence | `C_Fi` from episode valence | §7.4 |
| (C-Q27) | coherence into EU | `A·g·s·tanh(C/n_pairs)` | §7.4 |
| Si | reference matching and update | `match(a, R)`, authority-weighted | §8.3 |
| Fe | contextual semantic modification | audience-weighted meaning selection | §6.4 |
| Te | external reconfiguration | adds goal-efficient arrangements, removes none | §3.5 |
| Ne | branching | adds novel two-entry compositions | §3.3 |
| Se | immediate response | present evidence on preconditions | §3.1 |
| Ni | **open** | none | §3.4 |
| all | attention-weighted encoding | `e_c` with `τ_enc` | §5.5 |

### 11.5 The ledger for V2

Per epoch, function and operation: **allocation** (capacity assigned), **execution** (the operation ran, its inputs and
output), **influence** (rerun with the operation masked: what belief, interpretation, candidate or decision changed).
Shared engine parameters are never attributed to a function.

### 11.6 Offered next step: the orientation map

A table mapping every V1 formula and V2 operation to its domain, its reference or objective, what it preserves, what it
changes and what it learns, to test the orientation principle (§2.2) against the formulas. Not yet written.

### 11.7 Build state

Units 5441 (design correction) to 5452 (isolation tests) are queued on the Cognition lane. Nothing of V2 is built
until they land.

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
merchant experiment, the audience experiments.

---

## 14. Open questions register

Every open item that touches the function theory. "Whose" says who decides.

| Id | Question | Whose |
|---|---|---|
| C-Q10 | V1's crude formulas and constants (linear ω, N½ = 10, r = 1.5, K = 3, the /2 factors) | Rex (held) |
| C-Q11 | The end of "an inferior function is never prevented from leading a decision" | Rex |
| C-Q16 | Memory profiles of Se, Ne and Te | Rex |
| C-Q17 | The episode detail vector and the cue-type retrieval weights, and their sources | Rex, matrix |
| C-Q19 | Whether Ne and Ni actively resolve meaning; Fi's "what it notices" | Rex |
| C-Q20 | Sources and ranges for `k_f`, `C_f,0`, the form of `R_f` | Rex |
| C-Q21 | Whether function experience decays without practice | Rex |
| C-Q23 | Which structure is the self-model behind Fi's identity term (keeper: beliefs for traits, identity nodes for memberships) | Rex |
| C-Q24 | Coherence principles for Ni, Se and Ne; Ni's exact reference (outcome, causal model or pattern) | Rex |
| C-Q27 | How coherence or Si match enters a decision | **resolved by the V2 design** (§7.4, §8.3); Rex may replace |
| C-Q28 | The form of motivational modulation `M_f` | **proposed in V2** (§4.5); Rex may replace |
| Te-Q1 | Does Te keep its measures fixed while reconfiguring, or change measures when another serves the objective better? | Rex |
| Ori-Q1 | Where an extraverted function's objective comes from (axis partner, group, need, task), compatible with "personality never sets a goal" | Rex |
| B1, B2, B3 | Matrix questions: Si weakness emphasis; Ne acts or only predicts; grudge or grip | Rex |
| G-Q1 to G-Q4 | Group association: strength and asymmetry of expectation-driven attention; significance of an experience; overlapping groups; confirm the Ne, Ni, Fe, Te routes | Rex |
| SR-Q1 to SR-Q4 | Contextual meaning: the self-model (= C-Q23); the shared meaning space; overlap split and context pooling; audience features | Rex |
| P-Q1 to P-Q4, A-Q1 to A-Q6 | Preference learning and attraction forms, sources and scenarios | Rex |
| C-G2, C-G3a | Legitimacy: how the belief enters obedience; the estimated likelihood ratios | Rex |
| COG-48 | A per-function mask inside frozen V1 (V2 solves it for V2) | Rex |
| SC-2, SC-3 | Scenario estimates (S3 commitment, S5 upbringing length) | keeper; Rex may set |
| V2 estimates | `s`, `φ_0 = 0.5`, the `k` multipliers, `τ_enc = 0.1`, the habit and motivation forms | Rex |

---

## 15. Change log

| Date | Change |
|---|---|
| 2026-11-02 | Document created by the Cognition keeper at Rex's request, from DESIGN §9, §13, §14, §16, §18–§22, the scenarios design, the S1 report and Rex's statements of 2026-10-30 to 2026-11-02, including the orientation principle (§2.2), recorded here for the first time. |
