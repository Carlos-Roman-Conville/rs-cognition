import { defaultOrder, qualify, simTime, streams } from "@rex/kernel";
import type { EventBus, EventCursor, KernelEvent, OrderPosition, Process, ProcessContext, RandomStream, SimTime } from "@rex/kernel";
import declaration from "../kernel.json" with { type: "json" };
import type { CognitionEmission, Mind, MindCommand, MindsRunner, OutcomeFeedback } from "./mind.ts";
import type { Episode, Observation } from "./types.ts";

export interface CognitionEpoch {
  /** The host performs attention/perception at the sensory boundary using the supplied stream. */
  readonly observations: readonly Observation[];
  readonly needs: Extract<MindCommand, { type: "tickNeeds" }>["inputs"];
  readonly capacityFunctional: number;
  readonly context: Episode["context"];
  readonly goalProgress?: Readonly<Record<string, number>>;
}

/** Event cursors belong to the host (kernel events.ts); snapshot this alongside Runner and EventBus. */
export interface CognitionProcessState {
  readonly cursor: EventCursor;
  readonly intentions: readonly { readonly event: string; readonly intention: string }[];
}

export interface CognitionProcessOptions {
  readonly runner: MindsRunner;
  readonly bus: EventBus;
  /** DESIGN §7: required host Δ, no engine-selected decision cadence. */
  readonly period: SimTime;
  readonly epoch: (mind: Mind, t: SimTime, dt: SimTime, perception: RandomStream) => CognitionEpoch;
  readonly outcomeTypes: readonly string[];
  /** Host boundary adapter: return perceived observations, never raw resolved results. */
  readonly readOutcome: (event: KernelEvent) => OutcomeFeedback;
  /** Default phases, first/only cognition process; supply rank when the host extends/reorders them. */
  readonly position?: OrderPosition;
  readonly from?: CognitionProcessState;
}

/** DESIGN §4, §7: the one population process; host registers its id in the default cognition phase. */
export class CognitionProcess implements Process {
  readonly id = "cognition.tick";
  readonly phase = "cognition";
  readonly mechanisms = declaration.processes[0].mechanisms;
  readonly period: SimTime;
  private readonly options: CognitionProcessOptions;
  private readonly position: OrderPosition;
  private cursor: EventCursor;
  private intentions: CognitionProcessState["intentions"][number][];

  constructor(options: CognitionProcessOptions) {
    this.period = simTime(options.period);
    if (this.period === 0) throw new RangeError("Decision period must be positive");
    this.options = options;
    this.position = options.position ?? { phase: defaultOrder.phases.indexOf("cognition"), position: 0 };
    const from = options.from ?? { cursor: 0, intentions: [] }; // proposed initial unread cursor.
    options.bus.since(from.cursor); // Validate a restored cursor against the restored queue.
    this.cursor = from.cursor;
    this.intentions = structuredClone([...from.intentions]);
  }

  state(): CognitionProcessState {
    return structuredClone({ cursor: this.cursor, intentions: this.intentions });
  }

  run(ctx: ProcessContext): void {
    const { runner, bus } = this.options;
    const publish = (events: readonly CognitionEmission[]) => {
      for (const event of events) ctx.emit(event.type, event.payload, "cause" in event ? event.cause : undefined);
    };
    // Read a fixed visible prefix. Our new emissions are consumed on a later tick.
    for (const event of bus.since(this.cursor, { t: ctx.t, ...this.position })) {
      if (event.source === this.id && event.type === "cognition.intention") {
        const payload = event.payload as { id?: unknown } | null;
        const intention = runner.state.minds.flatMap((mind) => mind.intentions)
          .find((record) => qualify("cognition", record.intention.id) === payload?.id)?.intention;
        if (intention) this.intentions.push({ event: event.id, intention: intention.id });
      } else if (this.options.outcomeTypes.includes(event.type)) {
        const intention = this.intentions.find((record) => record.event === event.cause)?.intention;
        const pending = runner.state.minds.flatMap((mind) => mind.intentions)
          .find((record) => record.intention.id === intention);
        // Unknown causes are logged without interpreting their payload or applying any feedback.
        publish(runner.run({ type: "outcome", event: event.id, cause: event.cause, intention, t: event.t,
          feedback: !pending || pending.outcomeEvent !== undefined ? { observations: [] } : this.options.readOutcome(event) }).events);
      }
      this.cursor++;
    }
    // Array insertion is kernel mint order, including beyond four-digit ids; never lexically sort ids.
    for (const id of runner.state.minds.map((mind) => mind.id)) {
      const mind = runner.state.minds.find((entry) => entry.id === id)!;
      const random = streams(runner.state.runSeed);
      random.restore(runner.state.streams);
      const entity = qualify("cognition", id);
      const epoch = this.options.epoch(structuredClone(mind), ctx.t, ctx.dt,
        random.get("cognition.perception.detect", entity));
      runner.run({ type: "observe", mind: id, t: ctx.t, observations: epoch.observations,
        perceptionState: random.state()[`cognition.perception.detect@${entity}`] });
      runner.run({ type: "tickNeeds", mind: id, inputs: epoch.needs, goalProgress: epoch.goalProgress });
      publish(runner.run({ type: "decide", mind: id, t: ctx.t,
        capacityFunctional: epoch.capacityFunctional, context: epoch.context }).events);
    }
  }
}
