// DESIGN §6: fixture only; no world rule in this file is a validated platform mechanism.
import { canonical, defaultOrder, EventBus, qualify, restore, Runner, Scheduler, streams, take } from "@rex/kernel";
import type { KernelEvent, ProcessContext, RandomStream } from "@rex/kernel";
import {
  allocateAttention, attentionCues, categorical, CognitionProcess, createMindsState, driftBeliefs, gaussian,
  nullPersonality, perceive, reduceMinds, setBelief, updateTestimony,
} from "../../src/index.ts";
import type {
  AttentionCategory, CognitionEmission, CognitiveParams, Intention, LearningTrace, Mind, MindCommand,
  MindResult, MindsConfig, MindsState, PersonalityModel, SelectionTrace, Stimulus,
} from "../../src/index.ts";
import { clamp, cognitiveParams, fightProbability, FIXTURE, forecastConfig, initialMemory, initialNeeds, makeConfig } from "./models.ts";

export { FIXTURE, fightProbability } from "./models.ts";

export interface Body {
  id: string;
  role: "visitor" | "owner";
  hunger: number;
  held: number;
  items: number;
  baseCapacity: number;
  injuries: { until: number; drop: number }[];
  pain: number;
  positive: boolean;
}
interface Job {
  event: KernelEvent;
  actor: string;
  stage: "request" | "work" | "pay" | "promise" | "kept" | "away" | "detection" | "caught";
  due?: number;
  sponsor?: KernelEvent;
  keeper?: KernelEvent;
  detected?: boolean;
}
interface WorldState {
  epoch: number;
  stock: number;
  eaten: number;
  found: number;
  bodies: Body[];
  jobs: Job[];
  resolved: string[];
}
export interface Outcome {
  intention: string;
  mind: string;
  action: string;
  result: "good" | "bad" | "unfinished";
  reason: string;
  hunger: number;
  safety: number;
  social_connection: number;
  stock: number;
  promise?: { speaker: string; result: "kept" | "broken" };
}
export interface RunOptions {
  seed: number;
  params?: Partial<CognitiveParams>;
  /** fixture test/analysis controls; CLI always uses DESIGN §6's 144 epochs. */
  epochs?: number;
  encode?: boolean;
  personality?: PersonalityModel;
}
type Emitter = Pick<ProcessContext, "t" | "emit">;
type HostInput =
  | { type: "body" | "due"; t: number }
  | { type: "sense"; mind: string; detections: readonly { event: string; detected: boolean }[] }
  | { type: "intention"; event: KernelEvent; t: number }
  | { type: "close"; intentions: readonly KernelEvent[]; t: number }
  | { type: "checkpoint" };

const categories: readonly AttentionCategory[] = [
  { id: "food", base: 1, relevance: { hunger: 1 } },
  { id: "threat", base: 1, relevance: { safety: 1 } },
  { id: "person", base: 1, relevance: { social_connection: 1 } },
]; // fixture proposed host relevance map, DESIGN §2.1; Reality P2 / host knowledge.
const perceptionParams = (k: number) => ({ k, weberFractions: {
  sight: FIXTURE.weber, sound: FIXTURE.weber, touch: FIXTURE.weber, report: FIXTURE.weber,
} }); // fixture proposed Weber fractions, Reality P2; not human calibration.

function real(about: string, attribute: string, value: number, tag: string): Stimulus {
  return { cue: `${about}:${attribute}`, about, attribute, value, kind: "real", present: true,
    detectability: FIXTURE.detectability, channel: "sight", relevance: { [tag]: 1 }, domain: "body" };
}
function category(about: string, attribute: string, value: string, values: readonly string[], present = true): Stimulus {
  return { cue: `${about}:${attribute}`, about, attribute, value, values, present, kind: "categorical",
    detectability: FIXTURE.detectability, channel: "report", relevance: { person: 1 }, domain: "people" };
}

/** fixture host composition of public DESIGN §2.3 drift and §4 reducer; replay uses this same reducer.
 * Proposed volatile affordances have a one-second half-life, physical beliefs q=.001/s;
 * knowledge/personality latents do not drift. Future host knowledge model; not calibrated.
 */
export function reduceFixtureMinds(state: MindsState, command: MindCommand, configs: MindsConfig) {
  if (command.type === "observe" && command.observations.length > 0) {
    state = { ...state, minds: state.minds.map((mind) => {
      if (mind.id !== command.mind) return mind;
      const previous = Math.max(mind.observations[0]?.t ?? 0, mind.current?.t ?? 0, mind.memory.episodes.at(-1)?.t ?? 0);
      const beliefs = driftBeliefs(mind.memory.beliefs, Math.max(0, command.t - previous), (entry) => ({
        q: 0.001, halfLifeSeconds: entry.attribute.startsWith("available:") || entry.attribute === "request" ? 1 : Infinity,
      }));
      return { ...mind, memory: { ...mind.memory, beliefs } };
    }) };
  }
  if (command.type === "decide") {
    const mind = state.minds.find((entry) => entry.id === command.mind)!;
    configs = { ...configs, [mind.config]: forecastConfig(configs[mind.config], mind.needs) };
  }
  const result = reduceMinds(state, command, configs);
  const decision = command.type === "decide" ? result.state.minds.find((mind) => mind.id === command.mind)!.decisions.at(-1) : undefined;
  // fixture experiment storage: diagnostics live in the host trace, not in the state cloned on every command.
  // Keep every unresolved intention (including its original EU); completed records have their causal outcome in the log.
  return { ...result, decision, state: { ...result.state, minds: result.state.minds.map((mind) => ({ ...mind,
    decisions: [], learning: [], intentions: mind.intentions.filter((record) => record.outcomeEvent === undefined),
  })) } };
}

class FixtureRunner extends Runner<MindsState, MindCommand, MindResult & { decision?: SelectionTrace }, CognitionEmission> {
  readonly decisions: SelectionTrace[] = [];
  constructor(state: MindsState, configs: MindsConfig) {
    super(state, (previous, command) => reduceFixtureMinds(previous, command, configs));
  }
  override run(command: MindCommand) {
    const result = super.run(command);
    if (result.decision) this.decisions.push(result.decision);
    return result;
  }
}

export class HungryPairWorld {
  readonly options: RunOptions;
  readonly configs: MindsConfig;
  readonly runner: FixtureRunner;
  readonly bus = new EventBus();
  readonly random;
  readonly process: CognitionProcess;
  readonly scheduler: Scheduler;
  readonly initial;
  readonly history: WorldState[] = [];
  readonly hostInputLog: HostInput[] = [];
  readonly goalCapacity: number;
  state: WorldState;
  private cursor = 0;
  private finished = false;

  constructor(options: RunOptions) {
    this.options = options;
    const params = cognitiveParams(options.params);
    const epochs = options.epochs ?? FIXTURE.epochs;
    if (!Number.isSafeInteger(options.seed) || !Number.isSafeInteger(epochs) || epochs < 1) throw new RangeError("Invalid seed/epochs");
    // fixture proposed goal normalization, Story: an upper bound on all food available in this experiment.
    // V=bound and p=stock/bound give exactly one value per unit, including food recovered from a traveller.
    this.goalCapacity = FIXTURE.food + 2 * Math.ceil(epochs / FIXTURE.leaveEpochs);
    this.random = streams(options.seed);
    // fixture mint-order roster, DESIGN §6. Roles configure data, never choose an action for a mind.
    const roster = ["visitor", "visitor", "owner"] as const;
    const ids = roster.map((_, i) => qualify("cognition", `mind.${String(i + 1).padStart(4, "0")}`));
    const ownerId = ids[roster.indexOf("owner")];
    const configs: Record<string, ReturnType<typeof makeConfig>> = {};
    for (const [i, role] of roster.entries()) configs[ids[i]] = { ...makeConfig(role === "owner",
      role === "owner" ? ids.filter((id) => id !== ownerId) : [ownerId], options.encode), personality: options.personality };
    this.configs = configs;
    this.runner = new FixtureRunner(createMindsState(options.seed), configs);
    this.state = { epoch: 0, stock: FIXTURE.food, eaten: 0, found: 0, jobs: [], resolved: [], bodies: [] };
    for (const [i, role] of roster.entries()) {
      const owner = role === "owner";
      let memory = initialMemory(owner ? ids.filter((id) => id !== ownerId) : [ownerId]);
      memory = { ...memory, beliefs: setBelief(memory.beliefs, "self", "strength", gaussian(owner ? FIXTURE.ownerCapacity : FIXTURE.visitorCapacity, 1)) };
      for (const id of ids) memory = { ...memory, beliefs: setBelief(memory.beliefs, id, "strength", gaussian(FIXTURE.visitorCapacity, 1)) };
      for (const action of configs[ids[i]].generation.repertoire) memory = { ...memory,
        beliefs: setBelief(memory.beliefs, action.target!, `available:${action.id}`, categorical(["no", "yes"], [0.5, 0.5])) };
      const capacity = owner ? FIXTURE.ownerCapacity : FIXTURE.visitorCapacity;
      this.runner.run({ type: "addMind", mind: { config: ids[i], memory, needs: initialNeeds(memory, owner, this.goalCapacity), params,
        capacityFunctional: capacity, context: {} } });
      this.state.bodies.push({ id: ids[i], role, hunger: owner ? FIXTURE.ownerHunger : FIXTURE.visitorHunger,
        held: 0, items: owner ? 0 : 1, baseCapacity: capacity, injuries: [], pain: 0, positive: false });
    }
    this.process = new CognitionProcess({ runner: this.runner, bus: this.bus, period: FIXTURE.epochMs,
      outcomeTypes: ["fixture.outcome"], epoch: (mind, t, dt, rng) => this.epoch(mind, t, dt, rng),
      readOutcome: (event) => this.feedback(event) });
    this.scheduler = new Scheduler({ rng: this.random, emit: this.bus.emit, order: {
      phases: defaultOrder.phases, order: { ...defaultOrder.order, fast: ["fixture.body"],
        cognition: ["cognition.tick"], host: ["fixture.resolve"] },
    } });
    this.scheduler.register({ id: "fixture.body", phase: "fast", period: FIXTURE.epochMs, mechanisms: [],
      run: (ctx) => this.bodyStep(ctx.t) });
    this.scheduler.register(this.process);
    this.scheduler.register({ id: "fixture.resolve", phase: "host", period: FIXTURE.epochMs, mechanisms: [],
      run: (ctx) => {
        this.resolveDue(ctx);
        const events = this.bus.since(this.cursor, { t: ctx.t, phase: defaultOrder.phases.indexOf("host"), position: 0 });
        this.cursor += events.length;
        for (const event of events) if (event.type === "cognition.intention") this.resolve(event, ctx);
        this.assertInvariants();
        this.checkpoint();
      } });
    this.initial = take([{ id: "minds", snapshot: () => this.runner.state, restore: () => {} },
      { id: "world", snapshot: () => this.state, restore: () => {} }],
    { version: 2, t: 0, epoch: null, epochLabel: "fixture", catalogue_hash: null, seed: options.seed, eventCounter: 0, rng: this.random.state() });
    this.runner.log = []; // Initial snapshot includes addMind, so replay starts after roster construction.
    this.runner.events = [];
  }

  body(id: string): Body {
    const body = this.state.bodies.find((entry) => entry.id === id);
    if (!body) throw new RangeError(`Unknown body ${id}`);
    return body;
  }
  owner(): Body { return this.state.bodies.find((body) => body.role === "owner")!; }
  capacity(body: Body): number { return clamp(body.baseCapacity - body.injuries.reduce((sum, injury) => sum + injury.drop, 0)); }

  bodyStep(t: number): void {
    this.hostInputLog.push({ type: "body", t });
    this.state.epoch++;
    for (const body of this.state.bodies) {
      // fixture DESIGN §6: Δ/T_h, T_h = one day; future owner nutrition P3.
      body.hunger = clamp(body.hunger + FIXTURE.epochMs / FIXTURE.dayMs);
      body.injuries = body.injuries.filter((injury) => t < injury.until);
      body.pain = body.injuries.length ? FIXTURE.pain : 0; // fixture proposed pain recovery, Reality injury.
      this.eat(body);
    }
  }

  eat(body: Body): void {
    // fixture proposed eating trigger, nutrition P3 / pending C-R2: held units only, at deficit >= u.
    // O may eat from its own stock. No extra food is created; each unit lowers hunger by §6's u.
    while (body.hunger >= FIXTURE.foodRelief && (body.held > 0 || (body.role === "owner" && this.state.stock > 0))) {
      if (body.held > 0) body.held--; else this.state.stock--;
      body.hunger = clamp(body.hunger - FIXTURE.foodRelief);
      this.state.eaten++;
    }
  }

  /** Objective stimuli are constructed here and consumed only by the public sensory boundary. */
  stimuli(body: Body): Stimulus[] {
    const owner = this.owner();
    const harm = category("self", "serious_harm", body.pain > 0 ? "yes" : "no", ["no", "yes"]);
    const cues: Stimulus[] = [real("self", "hunger", body.hunger, "food"),
      { ...harm, relevance: { threat: 1 }, domain: "body" }, real("self", "strength", this.capacity(body), "threat"),
      real("self", "held", body.held, "food"), real("self", "item", body.items, "person")];
    // fixture proposed observable action opportunities, Economy / Society / host geography.
    // Each becomes a noisy perception and belief; the policy never receives the job table.
    for (const action of this.configs[body.id].generation.repertoire) {
      const job = this.state.jobs.find((entry) => entry.actor === (body.role === "owner" ? action.target : body.id));
      const request = job ? (job.event.payload as Intention).action : undefined;
      const matches: Record<string, boolean> = {
        give: job?.stage === "request" && request === "ask",
        refuse: job?.stage === "request", accept_trade: job?.stage === "request" && request === "trade",
        accept_work: job?.stage === "request" && request === "work", accept_promise: job?.stage === "request" && request === "deceive",
        pay: job?.stage === "pay", renege: job?.stage === "pay", confront: job?.stage === "caught",
        chase: job?.stage === "caught", let_go: job?.stage === "caught",
        keep: job?.stage === "promise", break: job?.stage === "promise",
      };
      const available = Object.hasOwn(matches, action.id) ? matches[action.id] : !job && (action.id !== "trade" || body.items > 0);
      cues.push(category(action.target!, `available:${action.id}`, available ? "yes" : "no", ["no", "yes"]));
    }
    if (this.state.jobs.some((job) => job.actor === body.id && job.stage === "away")) return cues;
    cues.push(real("stall", "stock", this.state.stock, "food"), real("owner", "strength", this.capacity(owner), "threat"));
    for (const other of this.state.bodies.filter((entry) => entry.id !== body.id)) {
      cues.push(real(other.id, "strength", this.capacity(other), "person"));
      const job = this.state.jobs.find((entry) => entry.actor === other.id);
      if (body.role === "owner") {
        cues.push(category(other.id, "request", job ? (job.event.payload as Intention).action : "none",
          ["none", "ask", "trade", "work", "deceive", "steal", "leave"]));
        const theft = category(other.id, "theft", "present", ["absent", "present"], job?.stage === "detection");
        cues.push({ ...theft, channel: "sight", relevance: { food: 1 }, domain: "space" });
        if (job && (job.event.payload as Intention).action === "deceive" && job.stage === "request") {
          // fixture testimony is the spoken claim, never truth about a future choice; Society / language.
          cues.push(category(other.id, "promise", "kept", ["broken", "kept"]));
        }
      }
    }
    return cues;
  }

  private epoch(mind: Mind, t: number, dt: number, rng: RandomStream) {
    const body = this.body(qualify("cognition", mind.id));
    const stimuli = this.stimuli(body);
    const view = { beliefs: mind.memory.beliefs, needs: mind.needs, params: mind.params };
    const attention = allocateAttention(attentionCues(stimuli), categories, view,
      (this.options.personality ?? nullPersonality).pertinence);
    let observations = perceive(stimuli, attention.shares, perceptionParams(mind.params.k), t, rng);
    // DESIGN §2.3 testimony weighting, using only perceived speech and the listener's own Beta belief.
    observations = observations.map((o) => {
      if (o.attribute !== "promise" || o.kind !== "categorical") return o;
      const reliability = mind.memory.reliability.find((entry) => entry.speaker === o.about)!.belief;
      const weighted = updateTestimony(categorical(["broken", "kept"], [0.5, 0.5]), o.value, reliability, 1);
      const trusted = weighted.probabilities[weighted.values.indexOf(o.value)];
      // fixture proposed composition of sensory identification and testimony, Society / language.
      return { ...o, model: { ...o.model, q: o.model.q * trusted + (1 - o.model.q) * (1 - trusted) } };
    });
    const detections: { event: string; detected: boolean }[] = [];
    if (body.role === "owner") for (const job of this.state.jobs.filter((entry) => entry.stage === "detection")) {
      const observed = observations.find((o) => o.about === job.actor && o.attribute === "theft");
      // fixture DESIGN §6: detection is O's own SDT detection at its allocated stock cue attention.
      detections.push({ event: job.event.id, detected: observed !== undefined && observed.kind !== "null" });
    }
    const positive = body.positive;
    this.sense(body.id, detections);
    const observedStock = observations.find((observation) => observation.about === "stall" && observation.attribute === "stock");
    return { observations, capacityFunctional: this.capacity(body), context: {},
      needs: { signals: { "body.hunger_signal": body.hunger, "body.pain": body.pain }, elapsedSeconds: dt / 1000,
        outcomeTags: positive ? ["positive_interaction"] : [],
        cues: stimuli.map((cue, i) => ({ attention: attention.shares[i], relevance: cue.relevance })) },
      // fixture proposed stock appraisal for the standing goal, Economy / Story: perceived count only.
      goalProgress: body.role === "owner" ? { keep_stock: observedStock?.kind === "real"
        ? clamp(observedStock.value / this.goalCapacity) : mind.needs.goals[0].progress } : undefined };
  }

  private sense(mind: string, detections: readonly { event: string; detected: boolean }[]): void {
    this.hostInputLog.push({ type: "sense", mind, detections: structuredClone(detections) });
    this.body(mind).positive = false;
    for (const detection of detections) this.state.jobs.find((job) => job.event.id === detection.event)!.detected = detection.detected;
  }
  private checkpoint(): void {
    this.hostInputLog.push({ type: "checkpoint" });
    this.history.push(structuredClone(this.state));
  }

  private transfer(body: Body): boolean {
    if (this.state.stock === 0) return false;
    this.state.stock--; body.held++; this.eat(body);
    return true;
  }
  private complete(event: KernelEvent, ctx: Emitter, good: boolean, reason: string, promise?: Outcome["promise"], unfinished = false): void {
    if (this.state.resolved.includes(event.id)) throw new Error(`Duplicate fixture outcome ${event.id}`);
    const intention = event.payload as Intention;
    const body = this.body(intention.mind);
    const payload: Outcome = { intention: intention.id, mind: body.id, action: intention.action,
      result: unfinished ? "unfinished" : good ? "good" : "bad", reason, hunger: body.hunger,
      safety: body.pain, social_connection: body.positive ? 0 : 1, stock: this.state.stock, ...(promise ? { promise } : {}) };
    this.state.resolved.push(event.id);
    ctx.emit("fixture.outcome", payload, event.id);
  }
  private remove(job: Job): void { this.state.jobs = this.state.jobs.filter((entry) => entry !== job); }

  private contest(attacker: Body, defender: Body, ctx: Emitter): boolean {
    // fixture DESIGN §6 Bradley–Terry; future owner P2 two-fighters demonstration.
    const won = this.random.get("fixture.fight", attacker.id)() < fightProbability(this.capacity(attacker), this.capacity(defender));
    const winner = won ? attacker : defender;
    const loser = won ? defender : attacker;
    // fixture DESIGN §6 capacity loss for two days; future owner Reality injury.
    loser.injuries.push({ drop: FIXTURE.injuryDrop, until: ctx.t + FIXTURE.injuryDays * FIXTURE.dayMs });
    loser.pain = FIXTURE.pain;
    // fixture proposed transfer interpretation: visitor winner takes stock; owner winner takes held food if any.
    if (winner.role === "owner") { if (loser.held > 0) { loser.held--; this.state.stock++; } }
    else this.transfer(winner);
    return won;
  }

  /** Host resolver; public for direct rule verification. It never selects a mind's action.
   * fixture rule (DESIGN §6): outcome rules keyed by action id are host data (COG-21), not a platform mechanism. */
  resolve(event: KernelEvent, ctx: Emitter): void {
    this.hostInputLog.push({ type: "intention", event: structuredClone(event), t: ctx.t });
    const intention = event.payload as Intention;
    const body = this.body(intention.mind);
    const ownJob = this.state.jobs.find((job) => job.actor === body.id);
    // fixture rule (DESIGN §6): wait always succeeds with no world change.
    if (intention.action === "wait") { this.complete(event, ctx, true, "waited"); return; }
    // fixture rule (DESIGN §6): keep extends a promise job; break completes it and fails the sponsor.
    if (intention.action === "keep" || intention.action === "break") {
      if (!ownJob || ownJob.stage !== "promise") { this.complete(event, ctx, false, "no outstanding promise"); return; }
      if (intention.action === "keep") {
        ownJob.stage = "kept"; ownJob.due = ctx.t + FIXTURE.workEpochs * FIXTURE.epochMs; ownJob.keeper = event;
      } else {
        this.complete(event, ctx, true, "broke promise");
        this.complete(ownJob.sponsor!, ctx, false, "promise broken", { speaker: body.id, result: "broken" });
        this.remove(ownJob);
      }
      return;
    }
    // fixture rule (DESIGN §6): owner responses are handled in answer(), not visitor job queue.
    if (body.role === "owner") { this.answer(event, ctx); return; }
    // fixture rule (DESIGN §6): one outstanding visitor job at a time.
    if (ownJob) { this.complete(event, ctx, false, "busy with an earlier undertaking"); return; }
    switch (intention.action) {
      // fixture rule (DESIGN §6): social requests enqueue a pending owner response.
      case "ask": case "trade": case "work": case "deceive":
        if (intention.action === "trade" && body.items === 0) this.complete(event, ctx, false, "no tradeable item");
        else this.state.jobs.push({ event, actor: body.id, stage: "request" });
        break;
      // fixture rule (DESIGN §6): theft enters detection before transfer.
      case "steal": this.state.jobs.push({ event, actor: body.id, stage: "detection" }); break;
      // fixture rule (DESIGN §6): fight resolves immediately via contest().
      case "fight": this.complete(event, ctx, this.contest(body, this.owner(), ctx), "contest"); break;
      // fixture rule (DESIGN §6): leave schedules return after FIXTURE.leaveEpochs.
      case "leave": this.state.jobs.push({ event, actor: body.id, stage: "away", due: ctx.t + FIXTURE.leaveEpochs * FIXTURE.epochMs }); break;
      // fixture rule (DESIGN §6): unknown visitor actions fail closed.
      default: this.complete(event, ctx, false, "unavailable action");
    }
  }

  private answer(event: KernelEvent, ctx: Emitter): void {
    const action = event.payload as Intention;
    const job = this.state.jobs.find((entry) => entry.actor === action.target);
    if (!job) { this.complete(event, ctx, false, "no request"); return; }
    const visitor = this.body(job.actor);
    const request = (job.event.payload as Intention).action;
    const social = () => { visitor.positive = true; this.owner().positive = true; };
    const finish = (good: boolean, reason: string, answered = good) => {
      this.complete(job.event, ctx, good, reason); this.complete(event, ctx, answered, reason); this.remove(job);
    };
    // fixture rule (DESIGN §6): owner may refuse an open request.
    if (action.action === "refuse" && job.stage === "request") { finish(false, "refused", true); return; }
    if (job.stage === "request") {
      // fixture rule (DESIGN §6): give or trade accepts transfer stock (and item on trade).
      if ((action.action === "give" && request === "ask") || (action.action === "accept_trade" && request === "trade")) {
        const gave = this.transfer(visitor);
        if (gave) { social(); if (request === "trade") { visitor.items--; this.owner().items++; } }
        finish(gave, gave ? "food transferred" : "stock empty"); return;
      }
      // fixture rule (DESIGN §6): accept_work starts timed labour before pay stage.
      if (action.action === "accept_work" && request === "work") {
        social(); job.stage = "work"; job.due = ctx.t + FIXTURE.workEpochs * FIXTURE.epochMs;
        this.complete(event, ctx, true, "labour accepted"); return;
      }
      // fixture rule (DESIGN §6): accept_promise advances food and binds a promise job.
      if (action.action === "accept_promise" && request === "deceive") {
        if (!this.transfer(visitor)) { finish(false, "stock empty"); return; }
        social(); this.complete(job.event, ctx, true, "food advanced on promise");
        job.stage = "promise"; job.sponsor = event; return;
      }
    }
    // fixture rule (DESIGN §6): after work, pay transfers stock or renege closes unpaid.
    if (job.stage === "pay" && ["pay", "renege"].includes(action.action)) {
      const paid = action.action === "pay" && this.transfer(visitor);
      if (paid) social(); finish(paid, paid ? "labour paid" : "labour unpaid", paid || action.action === "renege"); return;
    }
    // fixture rule (DESIGN §6): caught thief — confront, chase, or let go.
    if (job.stage === "caught" && ["confront", "chase", "let_go"].includes(action.action)) {
      // fixture rule (DESIGN §6): confront runs contest and clears the theft job.
      if (action.action === "confront") {
        const ownerWon = this.contest(this.owner(), visitor, ctx);
        this.complete(job.event, ctx, !ownerWon, "detected theft contest");
        this.complete(event, ctx, ownerWon, "confronted thief"); this.remove(job); return;
      }
      // fixture rule (DESIGN §6): chase off or let go may still transfer recovered food.
      const gotFood = action.action === "let_go" && this.transfer(visitor);
      this.complete(job.event, ctx, gotFood, action.action === "chase" ? "chased off" : "let go");
      this.complete(event, ctx, true, action.action); this.remove(job); return;
    }
    // fixture rule (DESIGN §6): owner action must match job stage and pending request type.
    this.complete(event, ctx, false, "response does not match current request");
  }

  resolveDue(ctx: Emitter): void {
    this.hostInputLog.push({ type: "due", t: ctx.t });
    for (const job of [...this.state.jobs]) {
      const body = this.body(job.actor);
      if (job.stage === "detection" && job.detected !== undefined) {
        if (job.detected) job.stage = "caught";
        else { this.complete(job.event, ctx, this.transfer(body), "theft undetected"); this.remove(job); }
      } else if (job.due !== undefined && ctx.t >= job.due) {
        if (job.stage === "work") { job.stage = "pay"; delete job.due; }
        else if (job.stage === "away") {
          // fixture DESIGN §6 distant source, future host geography / Economy endowment.
          const found = this.random.get("fixture.find", body.id)() < FIXTURE.findProbability;
          if (found) { body.held++; this.state.found++; this.eat(body); }
          this.complete(job.event, ctx, found, "returned from distant source"); this.remove(job);
        } else if (job.stage === "kept") {
          body.positive = true; this.owner().positive = true;
          this.complete(job.keeper!, ctx, true, "promised labour completed");
          this.complete(job.sponsor!, ctx, true, "promise kept", { speaker: body.id, result: "kept" }); this.remove(job);
        }
      }
    }
  }

  private feedback(event: KernelEvent) {
    const outcome = event.payload as Outcome;
    const mind = this.runner.state.minds.find((entry) => qualify("cognition", entry.id) === outcome.mind)!;
    const rng = streams(this.options.seed);
    rng.restore(this.runner.state.streams);
    const cues: Stimulus[] = [category("self", "result", outcome.result, ["good", "bad", "unfinished"]),
      ...(["hunger", "safety", "social_connection", "stock"] as const).map((attribute) => real("self", attribute, outcome[attribute], "food"))];
    if (outcome.promise) cues.push(category(outcome.promise.speaker, "promise_result", outcome.promise.result, ["broken", "kept"]));
    // fixture proposed explicit personal receipts: perfect detection/identification and no receipt noise.
    // All truth still enters through perceive; future owner host event adapters / Reality interoception.
    const observations = perceive(cues.map((cue) => ({ ...cue, detectability: 64 })), cues.map(() => 1 / cues.length),
      { k: 0, weberFractions: { sight: 0, sound: 0, touch: 0, report: 0 } }, event.t,
      rng.get("cognition.perception.detect", outcome.mind));
    this.runner.run({ type: "observe", mind: mind.id, t: event.t, observations: [],
      perceptionState: rng.state()[`cognition.perception.detect@${outcome.mind}`] });
    return { observations, status: outcome.result === "unfinished" ? "impossible" as const : "completed" as const };
  }

  assertInvariants(): void {
    const held = this.state.bodies.reduce((sum, body) => sum + body.held, 0);
    if (this.state.stock + this.state.eaten + held !== FIXTURE.food + this.state.found) throw new Error("Food conservation failed");
    if (![this.state.stock, this.state.eaten, this.state.found, ...this.state.bodies.map((body) => body.held)].every((n) => Number.isInteger(n) && n >= 0)) throw new Error("Invalid food count");
    if (this.state.bodies.some((body) => !Number.isFinite(body.hunger) || body.hunger < 0 || body.hunger > 1)) throw new Error("Hunger outside [0,1]");
  }

  private close(intentions: readonly KernelEvent[], ctx: Emitter): void {
    this.hostInputLog.push({ type: "close", intentions: structuredClone(intentions), t: ctx.t });
    for (const event of intentions) if (!this.state.resolved.includes(event.id)) this.complete(event, ctx, false, "unfinished at horizon", undefined, true);
  }

  private replayHost(): boolean {
    const replay = new HungryPairWorld(this.options);
    const kernel = restore([{ id: "world", snapshot: () => replay.state,
      restore: (state) => { replay.state = state as WorldState; } }], this.initial);
    replay.random.restore(kernel.rng);
    const outcomes: { t: number; payload: unknown; cause?: string }[] = [];
    for (const command of this.hostInputLog) {
      const t = "t" in command ? command.t : 0;
      const ctx: Emitter = { t, emit: (_type, payload, cause) => { outcomes.push({ t, payload, cause }); } };
      switch (command.type) {
        case "body": replay.bodyStep(t); break;
        case "sense": replay.sense(command.mind, command.detections); break;
        case "due": replay.resolveDue(ctx); break;
        case "intention": replay.resolve(command.event, ctx); break;
        case "checkpoint": replay.checkpoint(); break;
        case "close": replay.close(command.intentions, ctx); break;
      }
      replay.assertInvariants();
    }
    const original = this.bus.since().filter((event) => event.type === "fixture.outcome")
      .map(({ t, payload, cause }) => ({ t, payload, cause }));
    return canonical(replay.state) === canonical(this.state) && canonical(replay.history) === canonical(this.history) &&
      canonical(replay.random.state()) === canonical(this.random.state()) && canonical(outcomes) === canonical(original);
  }

  run() {
    if (this.finished) throw new Error("Fixture already finished");
    const epochs = this.options.epochs ?? FIXTURE.epochs;
    const t = epochs * FIXTURE.epochMs;
    this.scheduler.runUntil(t);
    const emit: Emitter = { t, emit: (type, payload, cause) => { this.bus.emit({ t, type, payload, cause,
      source: "fixture.close", phase: defaultOrder.phases.indexOf("host"), position: 1 }); } };
    // fixture proposed finite-horizon censoring, host experiment protocol: never pretend delayed work finished.
    const intentions = this.bus.since().filter((event) => event.type === "cognition.intention");
    this.close(intentions, emit);
    // Flush feedback at the same instant, without a 145th physiology/decision epoch.
    for (const event of this.bus.since().filter((entry) => entry.type === "fixture.outcome")) {
      const pending = this.runner.state.minds.flatMap((mind) => mind.intentions)
        .find((record) => qualify("cognition", record.intention.id) === (event.payload as Outcome).intention)!;
      if (!pending || pending.outcomeEvent !== undefined) continue;
      const result = this.runner.run({ type: "outcome", event: event.id, cause: event.cause,
        intention: pending.intention.id, t: event.t, feedback: this.feedback(event) });
      for (const attribution of result.events) emit.emit(attribution.type, attribution.payload, "cause" in attribution ? attribution.cause : undefined);
    }
    this.assertInvariants();
    let restored = createMindsState(this.options.seed);
    restore([{ id: "minds", snapshot: () => restored, restore: (state) => { restored = state as typeof restored; } }], this.initial);
    const replayDecisions: SelectionTrace[] = [];
    const replay = Runner.replay(this.runner.log, (state, command) => {
      const result = reduceFixtureMinds(state, command, this.configs);
      if (result.decision) replayDecisions.push(result.decision);
      return result;
    }, undefined, restored);
    const replayed = this.replayHost() && canonical(replay.state) === canonical(this.runner.state) && canonical(replay.events) === canonical(this.runner.events) &&
      canonical(replayDecisions) === canonical(this.runner.decisions);
    if (!replayed) throw new Error("Initial snapshot / kernel input log replay mismatch");
    this.finished = true;
    const events = this.bus.since();
    return { fixture: "hungry-pair", seed: this.options.seed, epochs, params: cognitiveParams(this.options.params),
      initial: this.initial, replayed, decisions: this.runner.decisions,
      outcomes: events.filter((event) => event.type === "fixture.outcome"),
      attributions: events.filter((event) => event.type === "cognition.attribution"),
      beliefDeltas: events.filter((event) => event.type === "cognition.attribution").map((event) => {
        const trace = event.payload as LearningTrace;
        return { mind: trace.mind, intention: trace.intention, t: trace.t, updates: trace.updates };
      }),
      final: this.state, history: this.history, inputLog: this.runner.log, hostInputLog: this.hostInputLog };
  }
}

export function runHungryPair(options: RunOptions) { return new HungryPairWorld(options).run(); }
