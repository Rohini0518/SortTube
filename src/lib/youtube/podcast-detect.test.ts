import { describe, it, expect } from "vitest";
import { isPodcastChannel } from "./podcast-detect";

describe("isPodcastChannel", () => {
  it("detects a channel that mentions podcast repeatedly, like a real podcast does", () => {
    expect(
      isPodcastChannel(
        "The Huberman Lab podcast is hosted by Andrew Huberman.",
        '"health podcast" "science podcast"',
      ),
    ).toBe(true);
  });

  it("detects plural/-ing forms spread across both fields", () => {
    expect(
      isPodcastChannel("Pioneered the Indian podcasting revolution, 1,000+ podcasts.", '"hindi podcast"'),
    ).toBe(true);
  });

  it("does NOT trigger on a single incidental mention (real false positive we hit: Apple's description)", () => {
    expect(
      isPodcastChannel(
        "Additional products include AirPods, AirTags, Apple Arcade, Apple Books, Apple News, Apple Podcasts, and Apple TV.",
        "Apple iPhone TV \"iPad Pro\" Mac iPod Watch MacBook",
      ),
    ).toBe(false);
  });

  it("returns false when neither field mentions it at all", () => {
    expect(isPodcastChannel("A channel about cooking.", "recipes food cooking")).toBe(false);
  });
});
