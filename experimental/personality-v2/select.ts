import { createEightFunctionV1, nullPersonality } from "../../src/index.ts";
import type { PersonalityType, V1Options } from "../../src/index.ts";
import { createEightFunctionV2 } from "./v2.ts";
import type { V2Options } from "./v2.ts";

export type PersonalitySelection =
  | { readonly model: "null"; readonly version?: "v1" | "v2"; readonly type?: PersonalityType }
  | { readonly model: "eight-function"; readonly version: "v1"; readonly type: PersonalityType; readonly options: V1Options }
  | { readonly model: "eight-function"; readonly version: "v2"; readonly type: PersonalityType; readonly options?: V2Options };

/** DESIGN §22.2: experimental selection, with V1's required options preserved. */
export function createPersonality(config: PersonalitySelection) {
  if (config.model === "null") return nullPersonality;
  if (config.model !== "eight-function") throw new RangeError("Unknown personality model");
  if (config.version === "v1") return createEightFunctionV1(config.type, config.options);
  if (config.version === "v2") return createEightFunctionV2(config.type, config.options);
  throw new RangeError("Unknown personality version");
}
