import { describe, it, expect } from "vitest";
import { chunkText } from "../index";

describe("chunkText", () => {
  it("splits short text into one chunk", () => {
    const chunks = chunkText("Hello world");
    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toBe("Hello world");
  });

  it("splits long text into multiple chunks", () => {
    const text = Array(100)
      .fill("This is a sentence with enough words to test chunking.")
      .join(" ");
    const chunks = chunkText(text);
    expect(chunks.length).toBeGreaterThan(1);
  });

  it("handles empty text", () => {
    const chunks = chunkText("");
    expect(chunks).toEqual([]);
  });

  it("handles whitespace-only text", () => {
    const chunks = chunkText("   \n\n  ");
    expect(chunks).toEqual([]);
  });
});
