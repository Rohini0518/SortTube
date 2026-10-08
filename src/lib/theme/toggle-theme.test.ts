import { describe, it, expect } from "vitest";
import { toggleTheme } from "./toggle-theme";

describe("toggleTheme", () => {
  it("flips dark to light", () => {
    expect(toggleTheme("dark")).toBe("light");
  });

  it("flips light to dark", () => {
    expect(toggleTheme("light")).toBe("dark");
  });
});
