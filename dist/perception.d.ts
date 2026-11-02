import type { RandomStream, SimTime } from "@rex/kernel";
import type { AttentionCue } from "./attention.ts";
import type { Channel, DetectionModel, Observation, Stimulus } from "./types.ts";
export interface PerceptionParams {
    readonly k: number;
    /** DESIGN §2.1: Weber fractions must be calibrated by the host for its attributes.
     * No universal channel defaults are asserted: sight, for example, covers both
     * brightness and length. Fractions supplied by fixtures are proposed, not data.
     * Research context: Zhou, Duong & Simoncelli (2024), Fig. 4, treats visual
     * contrast and auditory loudness separately: doi:10.1073/pnas.2312293121.
     * Touch also needs an attribute-specific calibration; report has no physical
     * sensory Weber fraction and any supplied report fraction is proposed.
     */
    readonly weberFractions: Readonly<Record<Channel, number>>;
}
/** Standard normal CDF: integrated normal-density series (Marsaglia, 2004,
 * doi:10.18637/jss.v011.i04).
 * DESIGN §2.1 uses Phi. Saturation beyond 8 has absolute error < 6.3e-16.
 */
export declare function normalCdf(x: number): number;
/** DESIGN §2.1, §8: proposed s_c = d'_c; body.detectability already includes
 * eyesight/hearing (DUP-37). Never apply sensory capacity a second time.
 */
export declare function attentionCues(stimuli: readonly Stimulus[]): AttentionCue[];
export declare function detectionModel(detectability: number, attention: number, k: number): DetectionModel;
export declare function identificationProbability(effective: number, count: number): number;
/** DESIGN §2.1, §7: pass streams.get('cognition.perception.detect', mindId).
 * Every draw, including identification and Weber noise, uses ONLY this handle.
 * Input locations and shares align in host mint order; absent locations are
 * explicit present:false rows. Proposed absent-value convention: categorical
 * reports are uniform; a real row's value is the host's nominal phantom value,
 * not an existing object's truth. No observations are invented at other locations.
 */
export declare function perceive(stimuli: readonly Stimulus[], shares: readonly number[], params: PerceptionParams, t: SimTime, stream: RandomStream): Observation[];
/** DESIGN §5.1: expose internal cues at the existing sensory boundary for the next epoch.
 * Proposed detectability 1; callers combine these with external cues before allocating attention.
 */
export declare function equivocationStimuli(cues: readonly import("./communication/types.ts").EquivocationCue[]): Stimulus[];
