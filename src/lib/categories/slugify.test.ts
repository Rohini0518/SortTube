import { describe, it, expect } from "vitest";
import { slugify } from "./slugify";

describe("slugify", () => {
  it("lowercases and hyphenates spaces", () => {
    expect(slugify("Travel Diaries")).toBe("travel-diaries");
  });

  it("strips punctuation into single hyphens", () => {
    expect(slugify("Sci-Fi & Fantasy!")).toBe("sci-fi-fantasy");
  });

  it("trims leading/trailing whitespace and hyphens", () => {
    expect(slugify("  Hello World  ")).toBe("hello-world");
  });

  it("returns an empty string when nothing alphanumeric survives", () => {
    expect(slugify("!!!")).toBe("");
  });
});
