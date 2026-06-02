import { describe, it, expect } from "vitest"
import { escapeLike } from "../bm25"

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

describe("escapeLike", () => {
  it("passes through normal text", () => {
    expect(escapeLike("hello")).toBe("hello")
  })

  it("escapes percent signs", () => {
    expect(escapeLike("50%")).toBe("50\\%")
  })

  it("escapes underscores", () => {
    expect(escapeLike("test_1")).toBe("test\\_1")
  })

  it("escapes mixed patterns", () => {
    expect(escapeLike("100%_complete")).toBe("100\\%\\_complete")
  })

  it("handles empty string", () => {
    expect(escapeLike("")).toBe("")
  })

  it("handles multiple escapes", () => {
    expect(escapeLike("%%__%%")).toBe("\\%\\%\\_\\_\\%\\%")
  })
})
