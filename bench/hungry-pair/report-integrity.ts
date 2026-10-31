import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

/** Hash every source path and its text, including untracked files; canonicalize checkout line endings. */
export function sourceHash(root = "src", read = (path: string) => readFileSync(path, "utf8")): string {
  const hash = createHash("sha256");
  const visit = (directory: string, prefix: string) => {
    for (const name of readdirSync(directory).sort()) {
      const path = join(directory, name), relative = `${prefix}${name}`;
      if (statSync(path).isDirectory()) visit(path, `${relative}/`);
      else hash.update(JSON.stringify([relative, read(path).replace(/\r\n/g, "\n")]));
    }
  };
  visit(root, "");
  return hash.digest("hex");
}

/** C-B1: committed evidence must be successful, complete, sufficiently sampled and current. */
export function reportErrors(report: string, currentHash = sourceHash()): string[] {
  const errors: string[] = [];
  const verdicts = [...report.matchAll(/^Verdict (CB-[\w-]+): (PASS|FAIL) \(.+\)$/gm)];
  for (const line of report.split(/\r?\n/).filter((line) => line.startsWith("Verdict CB-"))) {
    if (!/^Verdict CB-[\w-]+: (PASS|FAIL) \(.+\)$/.test(line)) errors.push(`Malformed verdict: ${line}`);
  }
  for (let n = 1; n <= 7; n++) {
    if (!verdicts.some((row) => row[1] === `CB-${n}`)) errors.push(`Missing Verdict CB-${n}`);
  }
  for (const row of verdicts) if (row[2] === "FAIL") errors.push(`${row[1]} failed`);
  for (const [name, minimum] of [["symmetry", 500], ["paired-per-dimension", 200], ["learning-frozen", 200]] as const) {
    const count = Number(report.match(new RegExp(`^Seed count ${name}: (\\d+)$`, "m"))?.[1]);
    if (!(count >= minimum)) errors.push(`${name} seed count below ${minimum}`);
  }
  if (report.match(/^Source SHA256: ([a-f0-9]{64})$/m)?.[1] !== currentHash) errors.push("Stale src/ hash");
  if (!/^Git commit: [a-f0-9]{40}$/m.test(report)) errors.push("Missing git commit");
  return errors;
}
