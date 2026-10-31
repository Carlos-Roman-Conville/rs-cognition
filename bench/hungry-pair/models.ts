// DESIGN §6 fixture models, not platform rules. Future owners: Economy (exchange),
// Society (promises), Reality P3 (nutrition), P2 two-fighters demonstration (combat).
import {
  categorical, createBeliefStore, DEFAULT_COGNITIVE_PARAMS, evaluateNeeds,
  gaussian, getBelief, setBelief,
} from "../../src/index.ts";
import type {
  ActionDefinition, BeliefStore, CognitiveParams, LearningEvidence, LearningLatent,
  MemoryState, MindConfig, NeedDefinition, NeedState, PredictedOutcome,
} from "../../src/index.ts";

export const FIXTURE = Object.freeze({
  epochs: 144, epochMs: 600_000, dayMs: 86_400_000, // fixture §6, Kernel host cadence.
  food: 6, foodRelief: 0.25, visitorHunger: 0.6, ownerHunger: 0.1, // fixture §6, nutrition P3.
  visitorCapacity: 2 / 3, ownerCapacity: 1, fightExponent: 2, // fixture §6, P2: ratio 1.5, normalized to [0,1].
  injuryDrop: 0.3, injuryDays: 2, pain: 0.3, // fixture §6, Reality injury; pain magnitude proposed.
  workEpochs: 3, leaveEpochs: 6, findProbability: 0.5, // fixture §6, Economy / host geography.
  detectability: 4, weber: 0.1, // fixture proposed: Reality P2; not human calibration.
});

export const clamp = (value: number): number => Math.max(0, Math.min(1, value));

/** fixture DESIGN §6, Bradley–Terry on capacity; future owner P2 two-fighters demonstration. */
export function fightProbability(a: number, b: number): number {
  if (![a, b].every((x) => Number.isFinite(x) && x >= 0)) throw new RangeError("Invalid capacity");
  const scale = Math.max(a, b);
  if (scale === 0) return 0.5; // fixture proposed symmetric zero-capacity limit, P2.
  const left = (a / scale) ** FIXTURE.fightExponent;
  const right = (b / scale) ** FIXTURE.fightExponent;
  return left / (left + right);
}

export const NEEDS: readonly NeedDefinition[] = [
  // fixture proposed weights/setpoints and social rate, DESIGN §2.2; nutrition P3 / Cognition social appraisal.
  { id: "hunger", category: "physiological", source: { signal: "body.hunger_signal" }, setpoint: 0, weight: 1, salienceTags: ["food"] },
  { id: "safety", category: "safety", source: { appraisal: { about: "self", attribute: "serious_harm", value: "yes" } }, setpoint: 0, weight: 1, salienceTags: ["threat"] },
  { id: "social_connection", category: "belonging", sdt: "relatedness", source: { accumulator: { rate: 1 / 3600, reset_on: ["positive_interaction"] } }, setpoint: 0, weight: 1, salienceTags: ["person"] },
];

export function probability(beliefs: BeliefStore, about: string, attribute: string): number {
  const value = getBelief(beliefs, about, attribute);
  if (!value) throw new Error(`Missing fixture prior ${about}.${attribute}`);
  return value.kind === "categorical" ? value.probabilities[1]
    : value.kind === "gaussian" ? clamp(value.mean) : value.probability;
}

export function initialMemory(peers: readonly string[]): MemoryState {
  let beliefs = createBeliefStore();
  // fixture proposed priors, DESIGN §6: identical knowledge for both visitors; future host knowledge / Story.
  for (const attribute of ["generosity", "vigilance", "trust", "effectiveness"]) {
    beliefs = setBelief(beliefs, "owner", attribute, categorical(["low", "high"], [0.5, 0.5]));
  }
  for (const [about, attribute, mean] of [
    ["self", "strength", FIXTURE.visitorCapacity], ["owner", "strength", FIXTURE.ownerCapacity],
    ["self", "hunger", FIXTURE.visitorHunger],
    ["self", "held", 0], ["self", "item", 1], ["stall", "stock", FIXTURE.food],
  ] as const) beliefs = setBelief(beliefs, about, attribute, gaussian(mean, 1));
  beliefs = setBelief(beliefs, "self", "serious_harm", categorical(["no", "yes"], [0.9, 0.1]));
  for (const peer of peers) {
    beliefs = setBelief(beliefs, peer, "promise", categorical(["broken", "kept"], [0.5, 0.5]));
    beliefs = setBelief(beliefs, peer, "theft", categorical(["absent", "present"], [0.9, 0.1]));
    beliefs = setBelief(beliefs, peer, "request", categorical(["none", "ask", "trade", "work", "deceive", "steal", "leave"], [1, 1, 1, 1, 1, 1, 1]));
  }
  return { beliefs, episodes: [], reliability: peers.map((speaker) => ({ speaker, belief: { alpha: 1, beta: 1 } })) };
}

export function initialNeeds(memory: MemoryState, owner: boolean, goalCapacity: number = FIXTURE.food): NeedState {
  return { needs: evaluateNeeds(NEEDS, { beliefs: memory.beliefs,
    signals: { "body.hunger_signal": owner ? FIXTURE.ownerHunger : FIXTURE.visitorHunger },
    accumulators: { social_connection: 0 }, elapsedSeconds: 0, outcomeTags: [], cues: [] }),
    goals: owner ? [{ id: "keep_stock", value: goalCapacity, progress: FIXTURE.food / goalCapacity }] : [] };
}

type Model = "generosity" | "win" | "undetected" | "trust" | "certain" | "find" | "promise";
export interface RepertoireRow {
  readonly id: string;
  readonly model: Model;
  readonly duration: number;
  readonly cost: number;
  readonly food?: boolean;
  readonly social?: boolean;
  readonly stockCost?: boolean;
  readonly danger?: boolean;
}

// fixture DESIGN §6: host repertoire as data; costs absent in §6 are proposed subjective forecasts (Story).
export const VISITOR_REPERTOIRE: readonly RepertoireRow[] = [
  { id: "ask", model: "generosity", duration: 1, cost: 0, food: true, social: true },
  { id: "trade", model: "generosity", duration: 1, cost: 0.05, food: true, social: true },
  { id: "work", model: "generosity", duration: 3, cost: 0.05, food: true, social: true },
  { id: "deceive", model: "trust", duration: 1, cost: 0, food: true, social: true },
  { id: "steal", model: "undetected", duration: 1, cost: 0, food: true, danger: true },
  { id: "fight", model: "win", duration: 1, cost: 0, food: true, danger: true },
  { id: "leave", model: "find", duration: 6, cost: 0.05, food: true },
  { id: "keep", model: "certain", duration: 3, cost: 0.05, social: true },
  { id: "break", model: "certain", duration: 1, cost: 0 },
];
export const OWNER_REPERTOIRE: readonly RepertoireRow[] = [
  { id: "give", model: "certain", duration: 1, cost: 0, social: true, stockCost: true },
  { id: "refuse", model: "certain", duration: 1, cost: 0 },
  { id: "accept_trade", model: "certain", duration: 1, cost: 0, social: true, stockCost: true },
  { id: "accept_work", model: "certain", duration: 1, cost: 0, social: true },
  { id: "accept_promise", model: "promise", duration: 1, cost: 0, social: true, stockCost: true },
  { id: "pay", model: "certain", duration: 1, cost: 0, social: true, stockCost: true },
  { id: "renege", model: "certain", duration: 1, cost: 0 },
  { id: "confront", model: "win", duration: 1, cost: 0, danger: true },
  { id: "chase", model: "certain", duration: 1, cost: 0 },
  { id: "let_go", model: "certain", duration: 1, cost: 0, stockCost: true },
];
const WAIT: RepertoireRow = { id: "wait", model: "certain", duration: 1, cost: 0 };

function definition(row: RepertoireRow, target: string, owner: boolean): ActionDefinition {
  return { id: row.id, target, targetKind: "person", domain: row.danger ? "body" : "people",
    duration: row.duration, cost: row.cost, capacityRequired: 0, preconditions: [],
    // fixture proposed absolute forecasts (not body writes), DESIGN §6; nutrition P3 / Story.
    outcomeSpace: [
      { id: "good", success: true, deficits: { ...(row.food ? { hunger: 0.35 } : {}), ...(row.social ? { social_connection: 0 } : {}) },
        goalProgress: owner ? { keep_stock: row.stockCost ? 5 / 6 : 1 } : {} },
      { id: "bad", success: false, deficits: row.danger ? { safety: 0.4 } : {}, goalProgress: {} },
      { id: "unfinished", success: false, deficits: {}, goalProgress: {} },
    ],
    naiveModel: (beliefs) => {
      let p: number;
      switch (row.model) {
        case "win": p = fightProbability(probability(beliefs, "self", "strength"), probability(beliefs, owner ? target : "owner", "strength")); break;
        case "undetected": p = 1 - probability(beliefs, "owner", "vigilance"); break;
        case "promise": p = probability(beliefs, target, "promise"); break;
        case "certain": p = 1; break;
        case "find": p = FIXTURE.findProbability; break;
        default: p = probability(beliefs, "owner", row.model);
      }
      // fixture proposed opportunity forecast from perceived affordance, not the host's job table (Story).
      if (row.id !== "wait") p *= probability(beliefs, target, `available:${row.id}`);
      return categorical(["good", "bad", "unfinished"], [p, 1 - p, 0]);
    } };
}

const reported = (e: LearningEvidence, attribute: string) => e.observations.find((o) => o.attribute === attribute);
const result = (e: LearningEvidence) => {
  const observation = reported(e, "result");
  return observation?.kind === "categorical" ? observation.value : "bad";
};

export function makeConfig(owner: boolean, targets: readonly string[], encode = true): MindConfig {
  const rows = owner ? OWNER_REPERTOIRE : VISITOR_REPERTOIRE;
  const latents: LearningLatent[] = ["generosity", "vigilance", "trust", "effectiveness"].map((attribute) => ({
    id: attribute, kind: "discrete", about: "owner", attribute, domain: "people",
    likelihood: (e) => {
      const relevant = attribute === "effectiveness" ||
        (attribute === "generosity" && ["ask", "trade", "work"].includes(e.intention.action)) ||
        (attribute === "vigilance" && e.intention.action === "steal") ||
        (attribute === "trust" && e.intention.action === "deceive");
      if (!relevant || result(e) === "unfinished") return [1, 1];
      const high = (result(e) === "good") !== (attribute === "vigilance");
      // fixture proposed diagnostic likelihoods, DESIGN §2.5 / §6; host knowledge model, not calibrated.
      return high ? [0.2, 0.8] : [0.8, 0.2];
    },
  }));
  for (const target of owner ? targets : ["owner"]) latents.push({ id: `opponent_strength:${target}`, kind: "gaussian", about: target, attribute: "strength", domain: "body",
    likelihood: (e) => {
      const prior = getBelief(e.memory.beliefs, target, "strength");
      const mean = prior?.kind === "gaussian" ? prior.mean : 1;
      // fixture proposed conjugate approximation for a won/lost contest, P2 / host knowledge.
      return ["fight", "confront"].includes(e.intention.action) && (!owner || e.intention.target === target) && result(e) !== "unfinished"
        ? { mean: clamp(mean + (result(e) === "good" ? -0.1 : 0.1)), variance: 0.25 }
        : { mean, variance: 1e100 };
    } });
  for (const speaker of targets) latents.push({ id: `reliability:${speaker}`, kind: "reliability", speaker, domain: "people",
    likelihood: (e) => {
      const promise = reported(e, "promise_result");
      return { reliable: promise?.kind === "categorical" && promise.value === "kept",
        weight: promise?.about === speaker && promise.kind === "categorical" ? 1 : 0 };
    } });
  return { generation: { repertoire: targets.flatMap((target) => rows.map((row) => definition(row, target, owner))),
    wait: definition(WAIT, "self", owner) }, learning: { encode, latents,
    appraise: (e) => ({ outcome: result(e) }) } };
}

/** fixture subjective forecasts at decision time (DESIGN §2.4, §6), future host action models.
 * Absolute effects required by the public API are projected from this mind's felt needs and goals only.
 */
export function forecastConfig(config: MindConfig, needs: NeedState): MindConfig {
  const forecast = (action: ActionDefinition): ActionDefinition => {
    const row = [...VISITOR_REPERTOIRE, ...OWNER_REPERTOIRE, WAIT].find((entry) => entry.id === action.id)!;
    const deficit = (id: string) => needs.needs.find((need) => need.definition.id === id)!.deficit;
    return { ...action, outcomeSpace: action.outcomeSpace.map<PredictedOutcome>((effect) => {
      const deficits: Record<string, number> = {};
      if (effect.id === "good") {
        if (row.food) deficits.hunger = clamp(deficit("hunger") - FIXTURE.foodRelief);
        if (row.social) deficits.social_connection = 0;
      } else if (effect.id === "bad" && row.danger) deficits.safety = clamp(deficit("safety") + FIXTURE.pain);
      return { ...effect, deficits, goalProgress: effect.id === "good" ? Object.fromEntries(needs.goals.map((goal) =>
        [goal.id, clamp(goal.progress - (row.stockCost ? 1 / goal.value : 0))])) : {} };
    }) };
  };
  return { ...config, generation: { ...config.generation, repertoire: config.generation.repertoire.map(forecast), wait: forecast(config.generation.wait) } };
}

export function cognitiveParams(overrides: Partial<CognitiveParams> = {}): CognitiveParams {
  const params = { ...DEFAULT_COGNITIVE_PARAMS, ...overrides };
  for (const [key, value] of Object.entries(params)) {
    if (!Object.hasOwn(DEFAULT_COGNITIVE_PARAMS, key) || !Number.isFinite(value)) throw new RangeError(`Invalid parameter ${key}`);
  }
  if (params.beta < 0 || params.lambda < 0 || params.gamma < 0 || params.gamma > 1 || params.eta < 0 || params.eta > 1 ||
      params.alpha0 < 0 || params.d <= 0 || params.s <= 0 || params.kappa < 0 || params.m < 1 || params.n <= params.m) {
    throw new RangeError("Cognitive parameters outside DESIGN ranges");
  }
  return params;
}
