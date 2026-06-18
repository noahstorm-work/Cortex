import { describe, it, expect } from "vitest";
import { parseSummary } from "../summarize";

describe("parseSummary", () => {
  it("parses summary and key points from OpenAI response", () => {
    const text = `SUMMARY:
This is a summary of the document.

KEY POINTS:
- First key point
- Second key point
- Third key point`;
    const result = parseSummary(text);
    expect(result.summary).toBe("This is a summary of the document.");
    expect(result.key_points).toEqual(["First key point", "Second key point", "Third key point"]);
  });

  it("falls back to first line when no SUMMARY marker", () => {
    const text = `Just a plain response without markers.`;
    const result = parseSummary(text);
    expect(result.summary).toBe("Just a plain response without markers.");
    expect(result.key_points).toEqual([]);
  });

  it("handles empty key points section", () => {
    const text = `SUMMARY:
Summary text here.

KEY POINTS:
`;
    const result = parseSummary(text);
    expect(result.summary).toBe("Summary text here.");
    expect(result.key_points).toEqual([]);
  });
});
