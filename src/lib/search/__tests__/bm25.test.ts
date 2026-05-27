import { describe, it, expect } from "vitest"

describe("tokenization helpers", () => {
  it("counts tokens correctly", () => {
    const count = "the quick brown fox".split(/\s+/).filter(Boolean).length
    expect(count).toBe(4)
  })

  it("handles empty string tokens", () => {
    const tokens = "".split(/\s+/).filter(Boolean)
    expect(tokens).toEqual([])
  })

  it("filters empty words after split", () => {
    const tokens = "hello   world".split(/\s+/).filter(Boolean)
    expect(tokens).toEqual(["hello", "world"])
  })

  it("builds correct ILIKE patterns for fallback search", () => {
    const words = "machine learning".split(/\s+/).filter(Boolean)
    const patterns = words.map((w) => `content.ilike.%${w}%`)
    expect(patterns).toEqual(["content.ilike.%machine%", "content.ilike.%learning%"])
  })
})
