/// <reference path="../scripts/node.d.ts" />
import { describe, expect, it } from "vitest";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { check, emitTask, record, sectionText } from "../scripts/codex-fingerprint.ts";
import type { Fingerprints } from "../scripts/codex-fingerprint.ts";

const FIXTURE = join(import.meta.dirname, "fixtures/matrix");
const dir = "../matrix";
const formulas = [
  { id: "A", cite: { file: `${dir}/FUNCTIONS.md`, heading: "### Alpha rule [CARLOS]" } },
  {
    id: "B",
    cite: { file: `${dir}/FUNCTIONS.md`, heading: "### Beta rule [CARLOS]" },
    additional_cites: [{ file: `${dir}/THEORY.md`, heading: "## 1. Core principle [CARLOS]" }],
  },
  { id: "C", cite: { file: `${dir}/THEORY.md`, heading: "## 1. Core principle [CARLOS]" } },
];

const scratch = (): string => mkdtempSync(join(tmpdir(), "codex-fp-"));

/** A scratch copy of the fixture matrix plus a formulas.json citing it, already recorded. */
function setup(): { matrix: string; fp: Fingerprints } {
  const root = scratch();
  const matrix = join(root, "matrix");
  mkdirSync(matrix);
  for (const f of ["FUNCTIONS.md", "THEORY.md"]) writeFileSync(join(matrix, f), readFileSync(join(FIXTURE, f), "utf8"));
  const formulasPath = join(root, "formulas.json");
  writeFileSync(formulasPath, JSON.stringify(formulas));
  return { matrix, fp: record("v1", { root, matrixDir: matrix, formulasPath }) };
}

const edit = (path: string, from: string, to: string): void => {
  writeFileSync(path, readFileSync(path, "utf8").replace(from, to));
};

describe("codex fingerprint", () => {
  it("cuts a section at the next heading of the same or higher level, ignoring line endings", () => {
    const md = readFileSync(join(FIXTURE, "FUNCTIONS.md"), "utf8");
    const alpha = sectionText(md, "### Alpha rule [CARLOS]");
    expect(alpha).toContain("Nested text belongs to Alpha.");
    expect(alpha).not.toContain("Beta");
    expect(sectionText(md.replace(/\n/g, "\r\n"), "### Alpha rule [CARLOS]")).toBe(alpha);
    expect(sectionText(md, "### Missing")).toBeNull();
  });

  it("is fresh when nothing changed", () => {
    const { matrix, fp } = setup();
    expect(fp.sections).toHaveLength(3);
    expect(check(fp, { matrixDir: matrix })).toEqual([]);
  });

  it("marks exactly the formulas of an edited cited section stale", () => {
    const { matrix, fp } = setup();
    edit(join(matrix, "FUNCTIONS.md"), "Beta says another thing.", "Beta says a new thing.");
    expect(check(fp, { matrixDir: matrix })).toEqual([{ id: "B", sections: ["FUNCTIONS.md#### Beta rule [CARLOS]"] }]);
  });

  it("marks every formula citing a shared section stale", () => {
    const { matrix, fp } = setup();
    edit(join(matrix, "THEORY.md"), "Face is truth.", "Face is not truth.");
    expect(check(fp, { matrixDir: matrix }).map((s) => s.id)).toEqual(["B", "C"]);
  });

  it("stays fresh when an uncited section is edited", () => {
    const { matrix, fp } = setup();
    edit(join(matrix, "THEORY.md"), "Not cited by any formula.", "Edited, still uncited.");
    edit(join(matrix, "FUNCTIONS.md"), "Nothing here.", "Something here.");
    expect(check(fp, { matrixDir: matrix })).toEqual([]);
  });

  it("marks a formula stale when its heading is removed", () => {
    const { matrix, fp } = setup();
    edit(join(matrix, "FUNCTIONS.md"), "### Alpha rule [CARLOS]", "Alpha rule renamed");
    expect(check(fp, { matrixDir: matrix }).map((s) => s.id)).toEqual(["A"]);
  });

  it("writes one task into the lane, and none the second time", () => {
    const { matrix, fp } = setup();
    edit(join(matrix, "FUNCTIONS.md"), "Alpha says one thing.", "Alpha says two things.");
    const stale = check(fp, { matrixDir: matrix });
    const lane = join(scratch(), "lane");
    const path = emitTask(fp, stale, { laneDir: lane, nextNumber: () => 9001 });
    expect(path).toBe(join(lane, "9001-cognition-rederive-v1-A.md"));
    const text = readFileSync(path as string, "utf8");
    expect(text).toContain("Model: codex");
    expect(text).toContain("Needs: none");
    expect(text).toContain("personality/eight-function/v2/formulas.json");
    expect(emitTask(fp, stale, { laneDir: lane, nextNumber: () => 9002 })).toBeNull();
    expect(readdirSync(lane)).toEqual(["9001-cognition-rederive-v1-A.md"]);
  });

  it("writes nothing when fresh", () => {
    const { fp } = setup();
    const lane = join(scratch(), "lane");
    expect(emitTask(fp, [], { laneDir: lane, nextNumber: () => 1 })).toBeNull();
    expect(existsSync(lane)).toBe(false);
  });
});
