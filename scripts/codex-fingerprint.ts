// The codex fingerprint check (DESIGN §9). Hashes every matrix section a formula set cites, so an edit to Rex's
// codex can never silently leave a formula built on the old text. Reads the matrix folder, never writes to it.
//   --record <version>   write personality/fingerprints.json from personality/eight-function/<version>/formulas.json
//   --check              recompute; "fresh" and exit 0, or list each stale formula and exit 1
//   --emit-task          with stale formulas, write one rederive WORK file into the cognition lane (no duplicates)
//   --matrix <dir>       read the matrix files from <dir> instead of the recorded matrix_dir (tests)
//   --lane <dir>         the lane folder for --emit-task (tests)
/// <reference path="./node.d.ts" />
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";

declare const process: { argv: string[]; stdout: { write(text: string): void }; stderr: { write(text: string): void }; exitCode: number };

export interface SectionPrint { file: string; heading: string; sha256: string }
export interface Fingerprints {
  version: string;
  matrix_dir: string;
  sections: SectionPrint[];
  formulas: Record<string, string[]>;
}
export interface StaleFormula { id: string; sections: string[] }

interface Cite { file: string; heading: string }
interface FormulaCites { id: string; cite?: Cite; additional_cites?: Cite[] }

const ROOT = resolve(import.meta.dirname, "..");
const FINGERPRINTS = "personality/fingerprints.json";
const LANE = "../../Games/Card Games/_agent/queue/cognition";
const NEXT_NUMBER = "../../Games/Card Games/_agent/next_number.py";

export const sectionKey = (file: string, heading: string): string => `${basename(file)}#${heading}`;

/** The text from `heading` to the next heading of the same or higher level, LF-normalised; null when absent. */
export function sectionText(markdown: string, heading: string): string | null {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  const wanted = heading.trimEnd();
  const level = /^(#+) /.exec(wanted)?.[1].length ?? 0;
  if (level === 0) return null;
  let fenced = false;
  let start = -1;
  let end = lines.length;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trimEnd();
    if (line.startsWith("```")) { fenced = !fenced; continue; }
    if (fenced) continue;
    if (start < 0) {
      if (line === wanted) start = i;
      continue;
    }
    const m = /^(#+) /.exec(line);
    if (m && m[1].length <= level) { end = i; break; }
  }
  if (start < 0) return null;
  return lines.slice(start, end).join("\n").trimEnd();
}

const sha256 = (text: string): string => createHash("sha256").update(text).digest("hex");

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

function hashSection(matrixDir: string, file: string, heading: string): string | null {
  const path = join(matrixDir, basename(file));
  if (!existsSync(path)) return null;
  const text = sectionText(readFileSync(path, "utf8"), heading);
  return text === null ? null : sha256(text);
}

export function record(version: string, opts: { root?: string; matrixDir?: string; formulasPath?: string } = {}): Fingerprints {
  const root = opts.root ?? ROOT;
  const formulas = readJson<FormulaCites[]>(opts.formulasPath ?? join(root, "personality/eight-function", version, "formulas.json"));
  const sections = new Map<string, Cite>();
  const byFormula: Record<string, string[]> = {};
  let citedDir: string | null = null;
  for (const f of formulas) {
    const cites = [f.cite, ...(f.additional_cites ?? [])].filter((c): c is Cite => c !== undefined);
    if (cites.length === 0) continue;
    const keys: string[] = [];
    for (const c of cites) {
      const dir = dirname(c.file);
      if (citedDir !== null && citedDir !== dir) throw new Error(`formula ${f.id} cites ${dir}, other cites use ${citedDir}`);
      citedDir = dir;
      const key = sectionKey(c.file, c.heading);
      sections.set(key, c);
      if (!keys.includes(key)) keys.push(key);
    }
    byFormula[f.id] = keys;
  }
  const matrixDir = opts.matrixDir ?? resolve(root, citedDir ?? ".");
  const prints: SectionPrint[] = [];
  for (const c of sections.values()) {
    const sha = hashSection(matrixDir, c.file, c.heading);
    if (sha === null) throw new Error(`cited section not found: ${sectionKey(c.file, c.heading)}`);
    prints.push({ file: basename(c.file), heading: c.heading, sha256: sha });
  }
  return { version, matrix_dir: citedDir ?? ".", sections: prints, formulas: byFormula };
}

export function check(fp: Fingerprints, opts: { root?: string; matrixDir?: string } = {}): StaleFormula[] {
  const matrixDir = opts.matrixDir ?? resolve(opts.root ?? ROOT, fp.matrix_dir);
  const staleKeys = new Set<string>();
  for (const s of fp.sections) {
    if (hashSection(matrixDir, s.file, s.heading) !== s.sha256) staleKeys.add(sectionKey(s.file, s.heading));
  }
  const stale: StaleFormula[] = [];
  for (const [id, keys] of Object.entries(fp.formulas)) {
    const hit = keys.filter((k) => staleKeys.has(k));
    if (hit.length > 0) stale.push({ id, sections: hit });
  }
  return stale;
}

const nextVersion = (version: string): string => version.replace(/\d+$/, (n) => String(Number(n) + 1));

function taskText(fp: Fingerprints, stale: StaleFormula[]): string {
  const ids = stale.map((s) => s.id).join(", ");
  const next = nextVersion(fp.version);
  const sections = [...new Set(stale.flatMap((s) => s.sections))].map((k) => `- ${k}`).join("\n");
  const lines = stale.map((s) => `- ${s.id}: ${s.sections.join("; ")}`).join("\n");
  const gate = `test -f personality/eight-function/${next}/formulas.json && node --experimental-strip-types scripts/codex-fingerprint.ts --check && npx vitest run > .gate.log 2>&1 || { tail -40 .gate.log; exit 1; }; npx tsc --noEmit`;
  return `# WORK: cognition-rederive-${fp.version}-${stale.map((s) => s.id).join("-")} (${new Date().toISOString().slice(0, 10)})

Repo: E:/AI Programs/Toolchain/cognition
Model: codex   Effort: medium   Stage: 5
Budget: 3
Needs: none
Gate: ${gate}

## Task

Read codex/RULES.md first. The codex fingerprint check found formulas of personality version ${fp.version} built on matrix
sections that have since changed or vanished. Stale formulas: ${ids}.

Changed sections:
${sections}

Per formula:
${lines}

Write \`personality/eight-function/${next}/formulas.json\` beside \`${fp.version}\` (never edit \`${fp.version}\`, it is frozen), rederiving only
the stale formulas from the changed sections; copy every unchanged formula as it is. Then run
\`node --experimental-strip-types scripts/codex-fingerprint.ts --record ${next}\` to record the new fingerprints.
Never switch the default personality version: the Cognition keeper does that after reviewing the side-by-side report.
Never edit the matrix folder. A section that vanished and cannot be rederived is parked in HANDOFF.md Blocked.

**Done when:** \`personality/eight-function/${next}/formulas.json\` exists, \`--check\` is fresh against the new fingerprints, the
suite and typecheck pass; one commit, not pushed.

## Read

DESIGN.md   # section 9
codex/RULES.md
personality/**
scripts/codex-fingerprint.ts
../../Writing/Cognitive Function Diagnostic/personality matrix/FUNCTIONS.md
../../Writing/Cognitive Function Diagnostic/personality matrix/THEORY.md   # read only

## Don't

- the matrix folder (read only), the frozen \`${fp.version}\` formulas, the default version

## Notes

End the commit message with \`Co-Authored-By: OpenAI Codex <codex@openai.com>\`. While iterating run only your own tests
(a filter); the runner runs the Gate. There is no spending cap. Finish the unit.
`;
}

function pythonNumber(root: string): number {
  const r = spawnSync("python", [resolve(root, NEXT_NUMBER)], { encoding: "utf8" });
  const n = Number(r.stdout.trim());
  if (!Number.isInteger(n)) throw new Error(`next_number.py gave "${r.stdout.trim()}"`);
  return n;
}

/** Writes one rederive WORK file for the stale formulas; null when none are stale or one is already queued. */
export function emitTask(
  fp: Fingerprints,
  stale: StaleFormula[],
  opts: { root?: string; laneDir?: string; nextNumber?: () => number } = {},
): string | null {
  if (stale.length === 0) return null;
  const root = opts.root ?? ROOT;
  const laneDir = opts.laneDir ?? resolve(root, LANE);
  const suffix = `-cognition-rederive-${fp.version}-${stale.map((s) => s.id).join("-")}.md`;
  if (existsSync(laneDir) && readdirSync(laneDir).some((n) => n.endsWith(suffix) && /^\d+$/.test(n.slice(0, n.length - suffix.length)))) {
    return null;
  }
  mkdirSync(laneDir, { recursive: true });
  const n = (opts.nextNumber ?? (() => pythonNumber(root)))();
  const path = join(laneDir, `${n}${suffix}`);
  writeFileSync(path, taskText(fp, stale));
  return path;
}

function flag(args: string[], name: string): string | undefined {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
}

function main(args: string[]): number {
  const matrixDir = flag(args, "--matrix");
  const out = join(ROOT, FINGERPRINTS);
  const recordVersion = flag(args, "--record");
  if (recordVersion !== undefined) {
    const fp = record(recordVersion, { matrixDir });
    writeFileSync(out, JSON.stringify(fp, null, 2) + "\n");
    process.stdout.write(`recorded ${fp.sections.length} sections for ${Object.keys(fp.formulas).length} formulas (${fp.version})\n`);
    return 0;
  }
  if (!args.includes("--check") && !args.includes("--emit-task")) {
    process.stderr.write("usage: codex-fingerprint.ts --record <version> | --check | --emit-task [--matrix <dir>] [--lane <dir>]\n");
    return 2;
  }
  const fp = readJson<Fingerprints>(out);
  const stale = check(fp, { matrixDir });
  if (stale.length === 0) {
    process.stdout.write(`fresh (${fp.version}, ${fp.sections.length} sections)\n`);
    return 0;
  }
  for (const s of stale) process.stdout.write(`stale ${s.id}: ${s.sections.join("; ")}\n`);
  if (args.includes("--emit-task")) {
    const path = emitTask(fp, stale, { laneDir: flag(args, "--lane") });
    process.stdout.write(path === null ? "task already queued\n" : `wrote ${path}\n`);
  }
  return 1;
}

if (process.argv[1] !== undefined && resolve(process.argv[1]) === resolve(import.meta.filename)) {
  process.exitCode = main(process.argv.slice(2));
}
