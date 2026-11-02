import type { AssetDefinition, MindView } from "./types.ts";
/** DESIGN §2.4: missing real rate beliefs are ignorance, not a seeded rate. */
export declare function believedRate(id: string, other: string, view: MindView, assets: readonly AssetDefinition[]): number | undefined;
/** DESIGN §2.4, §2.2 (Keramati & Gutkin 2014): one unit's direct drive reduction. */
export declare function directUsefulness(id: string, view: MindView, assets: readonly AssetDefinition[]): number;
/** DESIGN §2.4: keeper's proposed one-exchange-deep saleability model (Menger 1892). */
export declare function exchangeability(id: string, view: MindView, assets: readonly AssetDefinition[]): number;
/** DESIGN §2.4: V(m) = D(m) + E(m), proposed. */
export declare function assetValue(id: string, view: MindView, assets: readonly AssetDefinition[]): number;
