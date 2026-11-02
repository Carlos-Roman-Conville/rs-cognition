import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { goldenTraces } from "./personality-golden-fixtures.ts";

describe("DESIGN §22 legacy traces captured before optional hooks", () => {
  for (const { name, bytes } of goldenTraces()) it(name + " stays byte-identical", () => {
    expect(bytes).toBe(readFileSync(`${import.meta.dirname}/fixtures/personality-golden/${name}`, "utf8"));
  });
});
