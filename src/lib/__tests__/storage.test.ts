import { describe, it, expect } from "vitest"
import { extractStoragePath } from "../storage"

describe("extractStoragePath", () => {
  it("extracts path from full Supabase storage URL", () => {
    const url = "https://project.supabase.co/storage/v1/object/public/documents/user-123/file.pdf"
    expect(extractStoragePath(url)).toBe("user-123/file.pdf")
  })

  it("extracts path from short public URL", () => {
    const url = "https://project.supabase.co/public/documents/user-123/file.pdf"
    expect(extractStoragePath(url)).toBe("user-123/file.pdf")
  })

  it("extracts path from object URL without public", () => {
    const url = "https://project.supabase.co/storage/v1/object/documents/user-123/file.pdf"
    expect(extractStoragePath(url)).toBe("user-123/file.pdf")
  })

  it("returns null for unrecognized URL patterns", () => {
    expect(extractStoragePath("https://example.com/file.pdf")).toBeNull()
  })

  it("returns null for empty string", () => {
    expect(extractStoragePath("")).toBeNull()
  })
})
