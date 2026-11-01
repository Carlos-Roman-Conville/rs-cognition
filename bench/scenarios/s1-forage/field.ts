import data from "./data.json" with { type: "json" };
import type { RandomStream } from "@rex/kernel";

export { data };
// fixture rule (DESIGN bench/scenarios §2): cadence/physiology inherited from DESIGN §6; all estimates.
export const FIXTURE = { epochs: 12, epochMs: 600_000, dayMs: 86_400_000, relief: 0.25, hunger: 0.6 };
export interface Patch { id: string; x: number; y: number; kind: string }
export interface FieldState {
  epoch: number; patches: Patch[]; position: string; visited: string[];
  targeted?: string; hunger: number; food: number;
}
export const clamp = (x: number) => Math.max(0, Math.min(1, x));
export const kindOf = (patch: Patch) => {
  const kind = data.kinds.find((kind) => kind.id === patch.kind);
  if (!kind) throw new RangeError(`Unknown patch kind ${patch.kind}`);
  return kind;
};
export const distance = (a: Patch, b: Patch) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

export function makeGrid(random: RandomStream, width = data.grid.width, height = data.grid.height): Patch[] {
  // fixture rule (DESIGN bench/scenarios §2): largest remainders preserve shares; row order breaks ties.
  if (![width, height].every((n) => Number.isSafeInteger(n) && n > 0)) throw new RangeError("Invalid grid");
  const count = width * height;
  const counts = data.kinds.map((kind) => Math.floor(count * kind.share));
  const order = data.kinds.map((kind, i) => ({ i, remainder: count * kind.share - counts[i] }))
    .sort((a, b) => b.remainder - a.remainder || a.i - b.i);
  const remaining = count - counts.reduce((a, b) => a + b, 0);
  for (let n = 0; n < remaining; n++) counts[order[n].i]++;
  const kinds = data.kinds.flatMap((kind, i) => Array<string>(counts[i]).fill(kind.id));
  // fixture rule (DESIGN bench/scenarios §2): seeded Fisher–Yates, then row-major patch mint order.
  for (let i = kinds.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [kinds[i], kinds[j]] = [kinds[j], kinds[i]];
  }
  return kinds.map((kind, i) => ({ id: `patch.${String(i + 1).padStart(4, "0")}`, x: i % width, y: Math.floor(i / width), kind }));
}

export function drawYield(patch: Patch, draw: number): number {
  // fixture rule (DESIGN bench/scenarios §2): fixed kind PMFs, independent draw at each gather opportunity.
  const distribution = kindOf(patch).yield;
  let cumulative = 0;
  return distribution.support[distribution.pmf.findIndex((p, i) => {
    cumulative += p;
    return draw < cumulative || i === distribution.pmf.length - 1;
  })];
}
