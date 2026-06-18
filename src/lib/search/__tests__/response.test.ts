import { describe, it, expect } from "vitest";
import { buildExcerpt, getRelevanceLabel, extractiveKeyPoints, buildResponse } from "../response";
import type { ScoredChunk } from "../bm25";

describe("buildExcerpt", () => {
  it("returns full content when under max length", () => {
    expect(buildExcerpt("short text")).toBe("short text");
  });

  it("truncates at word boundary", () => {
    const long = "The quick brown fox jumps over the lazy dog near the riverbank.";
    const excerpt = buildExcerpt(long, 30);
    expect(excerpt.length).toBeLessThanOrEqual(33);
    expect(excerpt).toMatch(/\.\.\.$/);
  });

  it("truncates at maxLen when no space found", () => {
    const result = buildExcerpt("a".repeat(300), 200);
    expect(result.length).toBeLessThanOrEqual(203);
  });

  it("handles empty content", () => {
    expect(buildExcerpt("")).toBe("");
  });
});

describe("getRelevanceLabel", () => {
  it("returns high for score >= 0.7", () => {
    expect(getRelevanceLabel(0.7)).toBe("high");
    expect(getRelevanceLabel(0.95)).toBe("high");
  });

  it("returns medium for score >= 0.4", () => {
    expect(getRelevanceLabel(0.4)).toBe("medium");
    expect(getRelevanceLabel(0.69)).toBe("medium");
  });

  it("returns low for score < 0.4", () => {
    expect(getRelevanceLabel(0.39)).toBe("low");
    expect(getRelevanceLabel(0)).toBe("low");
  });
});

describe("extractiveKeyPoints", () => {
  it("returns up to count key points", () => {
    const sentences = [
      "Machine learning transforms industries.",
      "Deep learning requires large datasets.",
      "Natural language processing enables chatbots.",
      "Reinforcement learning trains agents through rewards.",
      "Computer vision analyzes visual data.",
      "Transfer learning reuses pretrained models.",
    ];
    const points = extractiveKeyPoints(sentences, 3);
    expect(points.length).toBeLessThanOrEqual(3);
    expect(points.length).toBeGreaterThanOrEqual(1);
  });

  it("returns empty array for empty input", () => {
    expect(extractiveKeyPoints([], 3)).toEqual([]);
  });

  it("returns fewer points when input is too short", () => {
    const points = extractiveKeyPoints(["Just one sentence."], 5);
    expect(points.length).toBe(1);
  });
});

describe("buildResponse", () => {
  it("returns empty response for no results", async () => {
    const res = await buildResponse("test query", []);
    expect(res.query).toBe("test query");
    expect(res.key_points).toEqual([]);
    expect(res.references).toEqual([]);
    expect(res.ai_generated).toBe(false);
  });

  it("builds response with results", async () => {
    const chunks: ScoredChunk[] = [
      {
        chunk_id: "1",
        document_id: "doc-1",
        document_title: "Doc 1",
        content: "Machine learning is transforming the technology industry with new approaches.",
        score: 0.85,
      },
      {
        chunk_id: "2",
        document_id: "doc-2",
        document_title: "Doc 2",
        content: "Artificial intelligence continues to advance rapidly.",
        score: 0.65,
      },
    ];
    const res = await buildResponse("machine learning", chunks);
    expect(res.query).toBe("machine learning");
    expect(res.references.length).toBe(2);
    expect(res.references[0].relevance).toBe("high");
    expect(res.references[1].relevance).toBe("medium");
    expect(res.ai_generated).toBe(false);
  });
});
