import { defaultOrder, qualify, simTime, streams } from "@rex/kernel";
import declaration from "../kernel.json" with { type: "json" };
/** DESIGN §4, §7: the one population process; host registers its id in the default cognition phase. */
export class CognitionProcess {
    id = "cognition.tick";
    phase = "cognition";
    mechanisms = declaration.processes[0].mechanisms;
    period;
    options;
    position;
    cursor;
    intentions;
    constructor(options) {
        this.period = simTime(options.period);
        if (this.period === 0)
            throw new RangeError("Decision period must be positive");
        this.options = options;
        this.position = options.position ?? { phase: defaultOrder.phases.indexOf("cognition"), position: 0 };
        const from = options.from ?? { cursor: 0, intentions: [] }; // proposed initial unread cursor.
        options.bus.since(from.cursor); // Validate a restored cursor against the restored queue.
        this.cursor = from.cursor;
        this.intentions = structuredClone([...from.intentions]);
    }
    state() {
        return structuredClone({ cursor: this.cursor, intentions: this.intentions });
    }
    run(ctx) {
        const { runner, bus } = this.options;
        const publish = (events) => {
            for (const event of events)
                ctx.emit(event.type, event.payload, "cause" in event ? event.cause : undefined);
        };
        // Read a fixed visible prefix. Our new emissions are consumed on a later tick.
        for (const event of bus.since(this.cursor, { t: ctx.t, ...this.position })) {
            if (event.source === this.id && event.type === "cognition.intention") {
                const payload = event.payload;
                const intention = runner.state.minds.flatMap((mind) => mind.intentions)
                    .find((record) => qualify("cognition", record.intention.id) === payload?.id)?.intention;
                if (intention)
                    this.intentions.push({ event: event.id, intention: intention.id });
            }
            else if (this.options.outcomeTypes.includes(event.type)) {
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
            const mind = runner.state.minds.find((entry) => entry.id === id);
            const random = streams(runner.state.runSeed);
            random.restore(runner.state.streams);
            const entity = qualify("cognition", id);
            const epoch = this.options.epoch(structuredClone(mind), ctx.t, ctx.dt, random.get("cognition.perception.detect", entity));
            runner.run({ type: "observe", mind: id, t: ctx.t, observations: epoch.observations,
                perceptionState: random.state()[`cognition.perception.detect@${entity}`] });
            runner.run({ type: "tickNeeds", mind: id, inputs: epoch.needs, goalProgress: epoch.goalProgress });
            publish(runner.run({ type: "decide", mind: id, t: ctx.t,
                capacityFunctional: epoch.capacityFunctional, context: epoch.context }).events);
        }
    }
}
