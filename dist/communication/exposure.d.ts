import type { SimTime } from "@rex/kernel";
import type { MemoryParams } from "../memory.ts";
import type { Episode } from "../types.ts";
/** DESIGN §5.1, §18.3: host context features `bubble:<handle>: true` mark group membership.
 * DESIGN §21.4 split: each episode contributes once, divided among its distinct groups.
 */
export declare function bubbleExposure(episodes: readonly Episode[], t: SimTime, params: MemoryParams): Readonly<Record<string, number>>;
