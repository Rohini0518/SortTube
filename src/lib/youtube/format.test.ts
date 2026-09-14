import { describe, it, expect } from "vitest";
import { formatCount, formatDuration } from "./format";

describe("formatCount", () => {
  it("formats millions with one decimal, trimmed", () => {
    expect(formatCount(1_100_000)).toBe("1.1M");
    expect(formatCount(2_000_000)).toBe("2M");
  });

  it("formats thousands with one decimal, trimmed", () => {
    expect(formatCount(1_500)).toBe("1.5K");
    expect(formatCount(20_000)).toBe("20K");
  });

  it("leaves small counts as plain numbers", () => {
    expect(formatCount(540)).toBe("540");
    expect(formatCount(0)).toBe("0");
  });
});

describe("formatDuration", () => {
  it("formats minutes and seconds", () => {
    expect(formatDuration("PT4M13S")).toBe("4:13");
  });

  it("formats hours, minutes, and seconds with padding", () => {
    expect(formatDuration("PT1H2M3S")).toBe("1:02:03");
  });

  it("falls back to 0:00 for unparseable input", () => {
    expect(formatDuration("not-a-duration")).toBe("0:00");
  });
});
