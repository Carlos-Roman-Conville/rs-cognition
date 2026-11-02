import { execFileSync } from "node:child_process";
// @ts-expect-error The repo omits Node process typings; provided by the test runtime.
import { execPath } from "node:process";
import { describe, expect, it } from "vitest";
import * as dist from "../dist/index.js";
import * as src from "../src/index.ts";

describe("compiled distribution", () => {
  it("exports the same runtime names as src", () => {
    expect(Object.keys(dist).sort()).toEqual(Object.keys(src).sort());
  });

  for (const specifier of ["./dist/index.js", "@rex/cognition"]) {
    it(`loads ${specifier} in plain Node, including root JSON data`, () => {
      const options = { cwd: new URL("..", import.meta.url), encoding: "utf8" as const };
      const output = execFileSync(execPath, [
        "-e",
        `import { recognition } from '${specifier}'; console.log(JSON.stringify(recognition({ entries: [] }, 'office', 'domain')));`,
      ], options);
      expect(JSON.parse(output)).toBeNull();
    });
  }
});
