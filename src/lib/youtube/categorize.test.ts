import { describe, it, expect } from "vitest";
import { matchKeywordCategory } from "./categorize";

describe("matchKeywordCategory", () => {
  it("matches a news channel/title", () => {
    expect(matchKeywordCategory("Breaking News Tonight", "BBC News")).toEqual({
      category: "news",
      subcategory: undefined,
    });
  });

  it("matches tech with the correct subcategory", () => {
    expect(matchKeywordCategory("Learning React in 10 minutes", "Code Channel")).toEqual({
      category: "tech",
      subcategory: "frontend",
    });
  });

  it("matches sports", () => {
    expect(matchKeywordCategory("Full match highlights", "Sports Central")).toEqual({
      category: "sports",
      subcategory: undefined,
    });
  });

  it("returns null when nothing matches", () => {
    expect(matchKeywordCategory("Some Random Title", "Some Random Channel")).toBeNull();
  });
});
