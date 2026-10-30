import { describe, expect, it } from "vitest";
import { streams } from "@rex/kernel";
import * as cognition from "../src/index.ts";

describe("scaffold", () => {
  it("loads the barrel and the kernel", () => {
    expect(cognition).toBeDefined();
    expect(streams).toBeDefined();
  });
});
