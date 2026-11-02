import { canonical } from "@rex/kernel";
import { adapter, encode, decode, hookContexts } from "../../diagnostics/ablation.ts";
import type { Ablation } from "../../diagnostics/ablation.ts";
import { buildLedger } from "../../diagnostics/ledger.ts";
import type { LedgerLevel } from "../../diagnostics/ledger.ts";
import type { V1Context } from "../../../src/index.ts";
import { WorkshopWorld } from "./world.ts";
export function workshopLedger(run: ReturnType<WorkshopWorld["run"]>, level: LedgerLevel) {
  return buildLedger(run, level, (_base, disabled: Ablation) => {
    const world = new WorkshopWorld({ seed: run.seed, epochs: run.hostInputLog.length, configuration: run.configuration,
      kappa: run.header.kappa, taskIds: run.hostInputLog[0].before.tasks.map(t => t.id) as [string, string] });
    const ablate = adapter(run.configuration, disabled);
    let context: V1Context = {};
    const decide = world.agent.decide.bind(world.agent);
    world.agent.decide = (sensor, hunger, t, active) => decide((view, model, setContext) => sensor(view, model, next => { context = next; setContext(next); }), hunger, t, active);
    const model = world.agent.personality, original = { ...model };
    model.pertinence = (base, view) => ablate.transform("pertinence", base, original.pertinence(base, view), undefined, context) as ReturnType<typeof model.pertinence>;
    model.interpret = (base, domain, view) => ablate.transform("interpret", base, original.interpret(base, domain, view), domain, context) as ReturnType<typeof model.interpret>;
    model.generate = (candidates, base, view) => ablate.transform("generate", { candidates, params: base }, original.generate(candidates, base, view), undefined, context) as ReturnType<typeof model.generate>;
    model.learning = (base, domain, view) => ablate.transform("learning", base, original.learning(base, domain, view), domain, context) as ReturnType<typeof model.learning>;
    while (world.state.epoch < run.hostInputLog.length) {
      world.step();
      const row = world.hostInputLog.at(-1)!, contexts = hookContexts(row);
      row.trace.hooks.forEach((call, i) => {
        call.after = encode(ablate.transform(call.hook, decode(call.before), decode(call.after), call.domain, contexts[i]));
        const a = call.after as Record<string, unknown>, b = call.before as Record<string, unknown>;
        call.changed = Object.keys(b).filter(key => canonical(b[key]) !== canonical(a[key]));
      });
    }
    return world.run();
  });
}
