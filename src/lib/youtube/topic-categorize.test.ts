import { describe, it, expect } from "vitest";
import { matchTopicCategory } from "./topic-categorize";

const BUILT_INS = [
  { slug: "news", name: "News" },
  { slug: "tech", name: "Technology" },
  { slug: "ai", name: "AI" },
  { slug: "education", name: "Education" },
  { slug: "entertainment", name: "Entertainment" },
  { slug: "fitness", name: "Fitness" },
  { slug: "podcasts", name: "Podcasts" },
];

describe("matchTopicCategory", () => {
  it("resolves a direct equivalence to an existing category", () => {
    expect(
      matchTopicCategory(["https://en.wikipedia.org/wiki/Technology"], BUILT_INS),
    ).toEqual({ slug: "tech", isNew: false });
  });

  it("collapses music-genre variants into one canonical Music concept", () => {
    const result = matchTopicCategory(
      [
        "https://en.wikipedia.org/wiki/Pop_music",
        "https://en.wikipedia.org/wiki/Music",
        "https://en.wikipedia.org/wiki/Music_of_Asia",
      ],
      BUILT_INS,
    );
    expect(result).toEqual({ slug: "music", isNew: true, newCategoryName: "Music" });
  });

  it("reuses an existing custom category instead of creating a duplicate", () => {
    const withMusic = [...BUILT_INS, { slug: "music", name: "Music" }];
    const result = matchTopicCategory(["https://en.wikipedia.org/wiki/Pop_music"], withMusic);
    expect(result).toEqual({ slug: "music", isNew: false });
  });

  it("returns null (ambiguous) when two topics match different existing categories", () => {
    const result = matchTopicCategory(
      ["https://en.wikipedia.org/wiki/Politics", "https://en.wikipedia.org/wiki/Health"],
      BUILT_INS,
    );
    expect(result).toBeNull();
  });

  it("returns null (ambiguous) when multiple unmatched topics have no single winner", () => {
    const result = matchTopicCategory(
      ["https://en.wikipedia.org/wiki/Knowledge", "https://en.wikipedia.org/wiki/Lifestyle_(sociology)"],
      BUILT_INS,
    );
    expect(result).toBeNull();
  });

  it("returns null when there are no topics at all", () => {
    expect(matchTopicCategory([], BUILT_INS)).toBeNull();
  });
});
