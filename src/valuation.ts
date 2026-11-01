import { getBelief } from "./beliefs.ts";
import { driveReward } from "./needs.ts";
import type { AssetDefinition, BeliefKey, MindView } from "./types.ts";

function asset(id: string, assets: readonly AssetDefinition[]): AssetDefinition {
  const found = assets.find((entry) => entry.id === id);
  if (!found) throw new RangeError(`Unknown exchange asset: ${id}`);
  return found;
}

function yes(key: BeliefKey | undefined, view: MindView): number {
  if (!key) return 0;
  const belief = getBelief(view.beliefs, key.about, key.attribute);
  if (!belief) return 0;
  if (belief.kind !== "categorical") throw new RangeError("Asset probability requires a categorical belief");
  const index = belief.values.indexOf("yes");
  return index < 0 ? 0 : belief.probabilities[index];
}

/** DESIGN §2.4: missing real rate beliefs are ignorance, not a seeded rate. */
export function believedRate(id: string, other: string, view: MindView, assets: readonly AssetDefinition[]): number | undefined {
  const key = asset(id, assets).rates?.[other];
  if (!key) return undefined;
  const belief = getBelief(view.beliefs, key.about, key.attribute);
  if (!belief) return undefined;
  if (belief.kind !== "gaussian") throw new RangeError("Exchange rate requires a real belief");
  if (!Number.isFinite(belief.mean) || belief.mean < 0) throw new RangeError("Exchange rate must be finite and nonnegative");
  return belief.mean;
}

/** DESIGN §2.4, §2.2 (Keramati & Gutkin 2014): one unit's direct drive reduction. */
export function directUsefulness(id: string, view: MindView, assets: readonly AssetDefinition[]): number {
  const definition = asset(id, assets);
  for (const reduction of Object.values(definition.usefulness)) {
    if (!Number.isFinite(reduction) || reduction < 0) throw new RangeError("Usefulness must be finite and nonnegative");
  }
  const before = view.needs.needs;
  const after = before.map((need) => ({ ...need,
    deficit: Math.max(0, need.deficit - (definition.usefulness[need.definition.id] ?? 0)) }));
  return driveReward(before, after, view.params.n, view.params.m);
}

function issuerTrust(definition: AssetDefinition): number {
  if (definition.issuer === undefined) return 1;
  // TODO(cognition.relationship.trust): no issuer trust accessor exists in the subjective MindView.
  return 1;
}

/** DESIGN §2.4: keeper's proposed one-exchange-deep saleability model (Menger 1892). */
export function exchangeability(id: string, view: MindView, assets: readonly AssetDefinition[]): number {
  const definition = asset(id, assets);
  const accepted = yes(definition.accepted, view);
  let best = 0;
  for (const other of assets) {
    if (other.id === id) continue;
    const rate = believedRate(id, other.id, view, assets);
    if (rate !== undefined) best = Math.max(best, accepted * rate * directUsefulness(other.id, view, assets));
  }
  const genuine = definition.genuine === undefined ? 1 : yes(definition.genuine, view);
  return view.params.gamma * genuine * issuerTrust(definition) * best;
}

/** DESIGN §2.4: V(m) = D(m) + E(m), proposed. */
export function assetValue(id: string, view: MindView, assets: readonly AssetDefinition[]): number {
  return directUsefulness(id, view, assets) + exchangeability(id, view, assets);
}
