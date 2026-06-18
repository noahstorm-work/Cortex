import { describe, it, expect } from "vitest";
import { generateEmbedding, hashToVector, isEmbedderFallback } from "../index";

describe("hashToVector", () => {
  it("produces a vector of 384 dimensions", () => {
    const vec = hashToVector("hello world");
    expect(vec.length).toBe(384);
  });

  it("produces a normalized vector", () => {
    const vec = hashToVector("test");
    const magnitude = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0));
    expect(magnitude).toBeCloseTo(1, 1);
  });

  it("returns similar vectors for similar texts", () => {
    const a = hashToVector("machine learning");
    const b = hashToVector("deep learning");
    const dot = a.reduce((sum, v, i) => sum + v * b[i], 0);
    expect(dot).toBeGreaterThan(0);
  });

  it("returns empty-normalized vector for empty text", () => {
    const vec = hashToVector("");
    const magnitude = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0));
    expect(magnitude).toBeCloseTo(0, 1);
  });
});

describe("isEmbedderFallback", () => {
  it("returns true when GROQ_API_KEY is not set", () => {
    expect(isEmbedderFallback()).toBe(true);
  });
});

describe("generateEmbedding", () => {
  it("produces hash vector when no API key", async () => {
    const vec = await generateEmbedding("hello world");
    expect(vec.length).toBe(384);
    const magnitude = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0));
    expect(magnitude).toBeCloseTo(1, 1);
  });
});
