import { describe, it, expect } from "vitest";
import { FEATURES, VALUE_PROPS, HOW_IT_WORKS_STEPS, FAQ_ITEMS } from "./content";

describe("landing page content", () => {
  it("has exactly 3 value props, matching the 3-column layout, each short enough to scan", () => {
    expect(VALUE_PROPS).toHaveLength(3);
    for (const prop of VALUE_PROPS) {
      expect(prop.title.trim().length).toBeGreaterThan(0);
      expect(prop.body.trim().length).toBeGreaterThan(0);
      expect(prop.body.length).toBeLessThan(90);
    }
  });

  it("has a non-empty title and body for every feature", () => {
    expect(FEATURES.length).toBeGreaterThan(0);
    for (const feature of FEATURES) {
      expect(feature.title.trim().length).toBeGreaterThan(0);
      expect(feature.body.trim().length).toBeGreaterThan(0);
    }
  });

  it("has unique feature titles (no accidental duplicates)", () => {
    const titles = FEATURES.map((f) => f.title);
    expect(new Set(titles).size).toBe(titles.length);
  });

  it("has exactly 3 how-it-works steps, matching the 3-column layout", () => {
    expect(HOW_IT_WORKS_STEPS).toHaveLength(3);
    for (const step of HOW_IT_WORKS_STEPS) {
      expect(step.title.trim().length).toBeGreaterThan(0);
      expect(step.body.trim().length).toBeGreaterThan(0);
    }
  });

  it("has a non-empty question and answer for every FAQ item", () => {
    expect(FAQ_ITEMS.length).toBeGreaterThan(0);
    for (const item of FAQ_ITEMS) {
      expect(item.question.trim().endsWith("?")).toBe(true);
      expect(item.answer.trim().length).toBeGreaterThan(0);
    }
  });
});
