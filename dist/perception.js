function finite(value, name) {
    if (!Number.isFinite(value))
        throw new RangeError(`${name} must be finite`);
    return value;
}
function nonnegative(value, name) {
    if (finite(value, name) < 0)
        throw new RangeError(`${name} must be nonnegative`);
    return value;
}
function share(value) {
    if (nonnegative(value, "attention share") > 1)
        throw new RangeError("attention share must be <= 1");
    return value;
}
/** Standard normal CDF: integrated normal-density series (Marsaglia, 2004,
 * doi:10.18637/jss.v011.i04).
 * DESIGN §2.1 uses Phi. Saturation beyond 8 has absolute error < 6.3e-16.
 */
export function normalCdf(x) {
    if (Number.isNaN(x))
        throw new RangeError("CDF argument must not be NaN");
    if (x <= -8)
        return 0;
    if (x >= 8)
        return 1;
    let term = x;
    let sum = x;
    for (let denominator = 3;; denominator += 2) {
        term *= x * x / denominator;
        const next = sum + term;
        if (next === sum)
            break;
        sum = next;
    }
    return Math.max(0, Math.min(1, 0.5 + sum * Math.exp(-x * x / 2) / Math.sqrt(2 * Math.PI)));
}
/** DESIGN §2.1, §8: proposed s_c = d'_c; body.detectability already includes
 * eyesight/hearing (DUP-37). Never apply sensory capacity a second time.
 */
export function attentionCues(stimuli) {
    return stimuli.map((stimulus) => ({
        cue: stimulus.cue, salience: nonnegative(stimulus.detectability, "detectability"),
        relevance: { ...stimulus.relevance },
    }));
}
export function detectionModel(detectability, attention, k) {
    // DESIGN §2.1: sqrt sampling (level 4 mapping), equal-variance SDT (level 2),
    // Green & Swets 1966; Macmillan & Creelman 2005.
    const effective = nonnegative(detectability, "detectability") * Math.sqrt(share(attention));
    finite(k, "criterion");
    return { P_H: normalCdf(effective / 2 - k), P_FA: normalCdf(-effective / 2 - k) };
}
export function identificationProbability(effective, count) {
    nonnegative(effective, "effective sensitivity");
    if (!Number.isInteger(count) || count < 1)
        throw new RangeError("Category count must be a positive integer");
    // DESIGN §2.1: proposed level 4 chance-to-perfect interpolation.
    return 1 / count + (1 - 1 / count) * (2 * normalCdf(effective / Math.SQRT2) - 1);
}
function draw(stream) {
    const value = stream();
    if (!Number.isFinite(value) || value < 0 || value >= 1)
        throw new RangeError("Stream must return a value in [0,1)");
    return value;
}
/** DESIGN §2.1, §7: pass streams.get('cognition.perception.detect', mindId).
 * Every draw, including identification and Weber noise, uses ONLY this handle.
 * Input locations and shares align in host mint order; absent locations are
 * explicit present:false rows. Proposed absent-value convention: categorical
 * reports are uniform; a real row's value is the host's nominal phantom value,
 * not an existing object's truth. No observations are invented at other locations.
 */
export function perceive(stimuli, shares, params, t, stream) {
    if (stimuli.length !== shares.length)
        throw new RangeError("Each location needs an attention share");
    finite(t, "observation time");
    finite(params.k, "criterion");
    let total = 0;
    for (const attention of shares)
        total += share(attention);
    if (total > 1 + 1e-12)
        throw new RangeError("Attention shares must sum to at most one");
    const observations = [];
    for (let i = 0; i < stimuli.length; i++) {
        const stimulus = stimuli[i];
        const attention = shares[i];
        const model = detectionModel(stimulus.detectability, attention, params.k);
        if (attention === 0)
            continue; // DESIGN §10: no detection, null evidence or draws without attention.
        const metadata = {
            cue: stimulus.cue, about: stimulus.about, attribute: stimulus.attribute, channel: stimulus.channel, t,
        };
        if (draw(stream) >= (stimulus.present ? model.P_H : model.P_FA)) {
            observations.push({ ...metadata, kind: "null", model });
            continue;
        }
        if (stimulus.kind === "message") {
            if (stimulus.channel !== "report")
                throw new RangeError("Messages require the report channel");
            observations.push({ ...metadata, channel: "report", kind: "message", model,
                message: structuredClone(stimulus.message), context: structuredClone(stimulus.context) });
        }
        else if (stimulus.kind === "categorical") {
            const values = stimulus.values;
            if (values.length === 0 || new Set(values).size !== values.length ||
                (stimulus.present && !values.includes(stimulus.value))) {
                throw new RangeError("Categorical support must be nonempty, unique and include the present value");
            }
            const q = identificationProbability(stimulus.detectability * Math.sqrt(attention), values.length);
            let value;
            if (!stimulus.present) {
                value = values[Math.floor(draw(stream) * values.length)];
            }
            else if (draw(stream) < q) {
                value = stimulus.value;
            }
            else {
                const alternatives = values.filter((candidate) => candidate !== stimulus.value);
                value = alternatives[Math.floor(draw(stream) * alternatives.length)];
            }
            observations.push({ ...metadata, kind: "categorical", value, model: { ...model, q } });
        }
        else {
            const nominal = finite(stimulus.value, "real value");
            // DESIGN §2.1: Weber's law (level 2), sigma = w_ch |v*| / sqrt(a_c).
            const sigma = nonnegative(nonnegative(params.weberFractions[stimulus.channel], "Weber fraction") *
                Math.abs(nominal) / Math.sqrt(attention), "Weber sigma");
            // Box & Muller (1958): transform two uniforms; 1-U excludes log(0).
            const noise = sigma === 0 ? 0 : Math.sqrt(-2 * Math.log(1 - draw(stream))) *
                Math.cos(2 * Math.PI * draw(stream));
            const value = finite(nominal + sigma * noise, "reported real value");
            observations.push({ ...metadata, kind: "real", value, model: { ...model, sigma } });
        }
    }
    return observations;
}
/** DESIGN §5.1: expose internal cues at the existing sensory boundary for the next epoch.
 * Proposed detectability 1; callers combine these with external cues before allocating attention.
 */
export function equivocationStimuli(cues) {
    return cues.map((cue, i) => ({ cue: `equivocation:${i}`, about: cue.speaker,
        attribute: `equivocation:${cue.term}`, channel: "report", present: true, detectability: 1,
        relevance: { equivocation: 1 }, domain: "none", kind: "categorical", value: cue.to, values: [cue.to] }));
}
