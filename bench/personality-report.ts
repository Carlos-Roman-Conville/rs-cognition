// DESIGN §9 T-3 reporting: pure postprocessing of recorded measurements; no engine import.
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import stacks from "../personality/eight-function/stacks.json" with { type: "json" };
import type { PersonalityType } from "../src/index.ts";
import type { Metrics } from "./personality-metrics.ts";
import type { SeedResult } from "./personality-versions.ts";
import { sourceHash } from "./hungry-pair/report-integrity.ts";

export const SEEDS = 200;
export const EPOCHS = 12; // proposed comparison horizon: includes six-epoch travel; censored learning.
export const TYPES = Object.keys(stacks) as PersonalityType[];
export const FORMULAS = Array.from({ length: 13 }, (_, i) => `F${i + 1}`);
export interface VersionMetadata {
  id: string;
  formulas: { id: string; status: string; hook: string }[];
}

export function discoverVersionMetadata(root = join(import.meta.dirname, "../personality/eight-function")): VersionMetadata[] {
  const versions = readdirSync(root).filter((name) => /^v[1-9]\d*$/.test(name))
    .sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)));
  if (!versions.length) throw new Error("No frozen personality versions");
  return versions.map((id) => ({ id,
    formulas: JSON.parse(readFileSync(join(root, id, "formulas.json"), "utf8")) as VersionMetadata["formulas"],
  }));
}

const digest = (value: string) => createHash("sha256").update(value).digest("hex");
function evidenceHash(results: readonly SeedResult[]): string {
  // Stream ordinary JSON seed records in their recorded property order with LF delimiters.
  // This postprocessing protocol needs no live engine or monolithic multi-version string.
  const hash = createHash("sha256");
  for (const row of results) hash.update(JSON.stringify(row)).update("\n");
  return hash.digest("hex");
}

/** Seed-cluster mean with two-sided Student-t sampling interval; small conditional samples
 * use the next lower tabulated df (conservative), df>=200 uses 199. Proposed analysis.
 */
export function interval(values: readonly number[]) {
  const n = values.length;
  if (!n) return null;
  const mean = values.reduce((sum, value) => sum + value, 0) / n;
  if (n < 2) return { mean, low: null, high: null, n };
  const table = [[1, 12.707], [2, 4.303], [3, 3.183], [4, 2.777], [5, 2.571], [6, 2.447],
    [7, 2.365], [8, 2.307], [9, 2.263], [10, 2.229], [15, 2.132], [20, 2.086], [30, 2.043],
    [60, 2.001], [120, 1.980], [199, 1.973]];
  const critical = table.filter(([df]) => df <= n - 1).at(-1)![1];
  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (n - 1);
  const half = critical * Math.sqrt(variance / n);
  return { mean, low: mean - half, high: mean + half, n };
}

export function paired(left: readonly Metrics[], right: readonly Metrics[], key: string) {
  if (left.length !== right.length) throw new Error("Unpaired seeds");
  return interval(left.flatMap((row, i) => {
    const a = row[key], b = right[i][key];
    return typeof a === "number" && typeof b === "number" ? [a - b] : [];
  }));
}

const numbers = (rows: readonly Metrics[], key: string) => rows.flatMap((row) => typeof row[key] === "number" ? [row[key] as number] : []);
const metricsDiffer = (left: Metrics, right: Metrics) => Object.keys(left).length !== Object.keys(right).length ||
  Object.keys(left).some((key) => left[key] !== right[key]);
const formatNumber = (value: number) => value === 0 ? "0" : Math.abs(value) < 0.00005 ? value.toExponential(3) : value.toFixed(4);
function format(value: ReturnType<typeof interval>): string {
  if (!value) return "N/A (n=0)";
  return `${formatNumber(value.mean)} [${value.low === null ? "N/A" : formatNumber(value.low)}, ${value.high === null ? "N/A" : formatNumber(value.high)}]; n=${value.n}`;
}

export function renderReport(results: readonly SeedResult[], epochs = EPOCHS): string {
  if (results.length !== SEEDS || results.some((row, i) => row.seed !== i + 1 || row.epochs !== epochs || !row.nullRepeat)) throw new Error("Report needs ordered seeds 1–200 and passing controls");
  const versions = discoverVersionMetadata();
  for (const result of results) {
    if (result.allOff !== TYPES.length * versions.length) throw new Error("Missing all-off controls");
    for (const version of versions) for (const type of TYPES) {
      if (result.hashes[`${version.id}/${type}/all-off`] !== result.hashes.null) throw new Error("Failed all-off control");
      for (const suffix of ["", "/all-off", ...FORMULAS.map((id) => `/off:${id}`)]) {
        const key = `${version.id}/${type}${suffix}`;
        if (!result.metrics[key] || !/^[a-f0-9]{64}$/.test(result.hashes[key] ?? "")) throw new Error(`Missing ${key} evidence`);
      }
    }
  }
  const rows = (key: string) => results.map((row) => {
    if (!row.metrics[key]) throw new Error(`Missing ${key}, seed ${row.seed}`);
    return row.metrics[key];
  });
  const modelKeys = ["null", ...versions.flatMap((v) => TYPES.map((t) => `${v.id}/${t}`))];
  const allKeys = [...new Set(modelKeys.flatMap((key) => rows(key).flatMap((row) => Object.keys(row))))].sort();
  const sensitive = FORMULAS.filter((formula) => modelKeys.slice(1).some((key) => results.some((row) =>
    metricsDiffer(row.metrics[key], row.metrics[`${key}/off:${formula}`]))));
  const diagnosticOnly = FORMULAS.filter((formula) => !sensitive.includes(formula) && modelKeys.slice(1).some((key) =>
    results.some((row) => row.hashes[key] !== row.hashes[`${key}/off:${formula}`])));
  const lines = ["# Hungry pair: personality versions", "", "Status: T-3 comparison completed; experimental level 5, no empirical validation.", "",
    `Measured metrics respond to single-formula removal of: ${sensitive.join(", ") || "none"}. Trace-only sensitivity: ${diagnosticOnly.join(", ") || "none"}. These are observed interventions, not claims of statistical significance or validation; paired intervals and coverage appear below.`, "",
    "Reproduce from the repository root: `node --experimental-strip-types bench/personality-versions.ts`. The runner checks the baseline acceptance and independent audit artifacts before enabling comparison personalities.", "",
    `Protocol: seeds 1–${SEEDS}; ${epochs} epochs × 10 minutes per world; A, B and owner O receive the SAME model and type in each run.`,
    "The null model is run once per seed and reused as the paired control for every stack. All other tests and engine defaults remain nullPersonality.",
    "Common random numbers: identical seed, mind mint order and kernel mechanism/entity stream keys in every paired run. Branches may consume different numbers of draws; this is common-stream coupling, not forced event alignment.",
    `The ${epochs}-epoch comparison is shorter than DESIGN §6's 144-epoch demonstration. The production 12-epoch horizon includes the six-epoch travel duration but cannot establish day-long stabilization.`,
    "Host options: etaMin=0.01 (proposed); no extra context, compounds or other-mind adapter. All cognitive parameters and fixture rules remain at baseline settings.", "",
    `Source SHA256: ${sourceHash()}`,
    `Comparison code SHA256: ${digest(["bench/personality-versions.ts", "bench/personality-models.ts", "bench/personality-metrics.ts", "bench/personality-report.ts"].map((path) => readFileSync(path, "utf8").replace(/\r\n/g, "\n")).join("\n"))}`,
    `Frozen personality SHA256: ${sourceHash("personality/eight-function")}`,
    `Fixture SHA256: ${digest(["bench/hungry-pair/world.ts", "bench/hungry-pair/models.ts"].map((path) => readFileSync(path, "utf8").replace(/\r\n/g, "\n")).join("\n"))}`,
    `Seed metrics and trace hashes SHA256 (JSON per-seed records + LF): ${evidenceHash(results)}`, "",
    "## Verification and sampling", "",
    `Null-vs-null: ${results.filter((row) => row.nullRepeat).length}/200 independently repeated worlds are byte-identical (canonical full-run SHA256); all metric differences are exactly zero.`,
    `Every-formula-off vs null: ${results.reduce((sum, row) => sum + row.allOff, 0)}/${SEEDS * TYPES.length * versions.length} stack/seed controls pass. One stack per version/seed is independently rerun; the others additionally pass exhaustive hook-output equivalence to an executed world.`,
    `Full world executions: ${results.reduce((sum, row) => sum + row.executions, 0)}; exact equivalent configurations: ${results.reduce((sum, row) => sum + row.equivalent, 0)}. Each execution restores/replays cognition and host logs.`,
    "Execution sharing checks every hook call/input/output from a completed deterministic run, including replay; it never estimates equivalence from a few probe parameters. Any changed output forces a fresh world run. Each non-equivalent single-formula ablation is rerun under the same seed.",
    "Intervals are approximate two-sided 95% Student-t intervals across independent seeds, with conservative tabulated critical values; epochs are never treated as independent observations. A/B/O are reported separately. Paired intervals use seedwise differences and only common nonmissing pairs. Conditional estimates report n. n<2 has no estimable interval; N/A is never zero. Intervals are unadjusted exploratory intervals across many metrics, not significance declarations; proportion intervals are not clipped.", "",
    "## Measurements", "",
    "Action frequency is the share of each mind's decision epochs, including retained commitments, grouped by the selected action's host domain. Outcome frequencies use causal intention receipts within that domain (good/bad/unfinished), so their denominator differs from decision frequency. Receipts is a count per seed; unfinished explicitly includes horizon censoring.",
    "Learning speed: for each mind/domain, find its first completed informative outcome (any latent KL>0), using the selected action's domain. Sort all candidates in that domain by EU, retaining ties and candidate membership. Find the beginning of the final unchanged ranking suffix strictly after that outcome, requiring at least three consecutive epochs through the horizon and at least two candidates. Report epochs from feedback to that beginning. A later reversal invalidates an earlier plateau. This retrospective finite-horizon measure also reflects changing needs, observations and opportunities, so it does not isolate a learning-rate parameter.",
    "informative, stabilized and censored are per-seed indicator means. Censored means informative feedback occurred but the stability criterion was not observed; no-informative runs are separate. learning-epochs averages observed stabilizers only; differences can reflect selection into that subset. Inspect coverage alongside speed; this is not an uncensored population time-to-learning estimate.",
    "The host supplies decision domains body and people; wait may supply none. space/adaptation/meta/cohesion/strategy have no comparable action ranking in this fixture. They are retained below as untested (zero coverage, N/A speed), never inferred from a type name.", "",
    "## Hook coverage", "",
    "| Formula | Hook and scope in this experiment |", "|---|---|",
    "| F1 | interpret: eta in sensory belief updates (neutral none domain) and outcome learning; alpha0 in action evaluation. |",
    "| F2 | pertinence: attitude attention transform is wired at the public sensory boundary. |",
    "| F3 | interpret: lambda; absent failure-history adapter means n_fail=0. Resilience's history term is untested. |",
    "| F4/F5 | learning and F4 pertinence: no relevant space/adaptation/meta learning latents or cue-category domain tags. |",
    "| F6 | pertinence/interpret: absent physical/present/targeted tags; targeted perception wiring is untested. |",
    "| F7 | interpret: no on function owns the fixture's body/people/none action domains; confidence is identity here. |",
    "| F8 | learning: d/half-life appear in latent diagnostics; existing evaluation retrieval and fixture drift do not consume these overrides. Behavioral zero here is a wiring limit. |",
    "| F9/F10 | generate: no host compound executor or believed-other-mind adapter; these effects are untested. |",
    "| F11 | generate: commitment kappa is consumed by selection, but the baseline kappa=0 makes this multiplicative formula identity. Nonzero commitment effects are untested here. |",
    "| F12 | interpret: person alpha0 is consumed by evaluation. |",
    "| F13 | interpret: no testimony-context adapter; testimony wiring is untested. |",
    "| W / DELTA | Frozen stack weights and attitude derivation, retained for all hook ablations; F1–F13 are the separately switched hook formulas. |",
    "| OFF-* | Frozen explicitly off formulas remain identity throughout. |", "",
    "## Per-configuration action frequencies, outcomes and learning", ""];
  for (const model of modelKeys) {
    lines.push(`### ${model}`, "", "| Mind/domain/metric | Mean [95% interval]; seeds |", "|---|---|");
    for (const key of allKeys) {
      // Show all domain coverage and learning; suppress empty outcome rows in wholly absent domains.
      if (key.includes("/outcome:") && !numbers(rows(model), key).length) continue;
      if (key.endsWith("/receipts") && numbers(rows(model), key).every((n) => n === 0)) continue;
      lines.push(`| ${key} | ${format(interval(numbers(rows(model), key)))} |`);
    }
    lines.push("");
  }
  lines.push("## T-3: version comparisons and single-formula attribution", "",
    "Each row is configuration minus reference. Rows with exactly zero paired differences are omitted; N/A comparisons are not called zero. Formula entries report full version minus the same version with only that formula off, with paired 95% intervals and number of seeds whose metric changed. These are marginal interventions in a closed loop; effects can interact and do not sum to the total. Zero-centred intervals are not evidence of a reliable signed effect.",
    "For an adjacent-version comparison, ablate both sides and report how the version difference changes. v1 has no previous frozen version; its reference is null.", "");
  for (const [index, version] of versions.entries()) for (const type of TYPES) {
    const key = `${version.id}/${type}`;
    for (const reference of ["null", ...(index ? [`${versions[index - 1].id}/${type}`] : [])]) {
      lines.push(`### ${key} minus ${reference}`, "", "| Metric | Paired difference [95% interval]; pairs | Formula-off interventions |", "|---|---|---|");
      for (const metric of allKeys) {
        const left = rows(key), right = rows(reference);
        const difference = paired(left, right, metric);
        if (!difference || !left.some((row, i) => typeof row[metric] === "number" && typeof right[i][metric] === "number" && row[metric] !== right[i][metric])) continue;
        const effects: string[] = [];
        for (const formula of FORMULAS) {
          const off = rows(`${key}/off:${formula}`);
          const referenceOff = reference === "null" ? right : rows(`${reference}/off:${formula}`);
          // Complete cases on all four runs: do not conflate changed coverage with a speed effect.
          const values = left.flatMap((row, i) => {
            const a = row[metric], b = right[i][metric], c = off[i][metric], d = referenceOff[i][metric];
            return [a, b, c, d].every((v) => typeof v === "number") ? [(a as number) - (b as number) - (c as number) + (d as number)] : [];
          });
          const changed = values.filter((n) => n !== 0).length;
          if (changed) effects.push(`${formula} (${version.formulas.find((f) => f.id === formula)!.hook}): ${format(interval(values))}; changed=${changed}`);
        }
        lines.push(`| ${metric} | ${format(difference)} | ${effects.join("<br>") || "No single-formula effect on common observed pairs; joint effects/coverage remain unresolved."} |`);
      }
      lines.push("");
    }
  }
  lines.push("### Complete ablation ledger", "",
    "All 13 hook formulas are checked for all 16 stacks on all 200 seeds. This ledger includes zero effects. A full-trace change may be diagnostic only; a metric change can include coverage/missingness and is not a significance test.", "",
    "| Configuration | Formula (hook) | Full-trace changed seeds / 200 | Any measured metric changed seeds / 200 |", "|---|---|---|---|");
  for (const version of versions) for (const type of TYPES) for (const formula of FORMULAS) {
    const key = `${version.id}/${type}`, off = `${key}/off:${formula}`;
    const traces = results.filter((row) => row.hashes[key] !== row.hashes[off]).length;
    const metrics = results.filter((row) => metricsDiffer(row.metrics[key], row.metrics[off])).length;
    lines.push(`| ${key} | ${formula} (${version.formulas.find((f) => f.id === formula)!.hook}) | ${traces} | ${metrics} |`);
  }
  lines.push("");
  lines.push("## What this does not show", "",
    "One scenario cannot test T-1 (stable differences) or T-2 (derived traits). DESIGN §9 requires scenarios rewarding each of the four extraverted domains (space, adaptation, meta, cohesion), plus the randomized-theta null and shuffled-hook controls for T-1. Later units add these domain and trait-indicator scenarios.",
    "T-2 needs behavioral indicators of novelty/compounds, completion/commitment, risk under outcome variance, and social interaction/testimony across those scenarios. McCrae & Costa (1989) is the specified external comparison for derived trait correlations; no comparison to that data is performed here. No empirical validation is claimed (level 5).",
    "A/B retain identical knowledge, needs, capability, cognitive parameters and personality; their kernel streams remain distinct. This preserves CB-6's configuration symmetry, but the existing baseline 500-seed symmetry certification is not a new 500-seed personality test. O has the same personality but retains the fixture's different role, initial needs and goal.",
    "The existing host's missing adapters and unconsumed controls limit mechanism coverage as listed above. A zero ablation cannot validate an unexercised formula. No source formulas, baseline tests, or default personality were changed. Sibling repositories (kernel, realism, settlement, economy, pirate-ship) were not audited or modified under the folder-only task restriction; this is public-API fixture integration, not cross-engine validation.", "");
  return lines.join("\n");
}
