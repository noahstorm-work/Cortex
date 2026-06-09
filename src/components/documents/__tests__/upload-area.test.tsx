import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { UploadArea } from "../upload-area"

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}))

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}))

const createMockFile = (name: string, type: string, size = 1024) =>
  new File([new ArrayBuffer(size)], name, { type })

describe("UploadArea", () => {
  beforeEach(() => {
    const mockFetch = vi.spyOn(global, "fetch")
    mockFetch.mockImplementation(async (url, init) => {
      if (typeof url === "string" && url.includes("/api/documents/upload")) {
        return {
          ok: true,
          json: () => Promise.resolve({
            signedUrl: "https://storage.example.com/upload",
            document_id: "doc-1",
            file_url: "https://storage.example.com/doc-1.pdf",
          }),
        } as Response
      }
      if (typeof url === "string" && url.includes("storage.example.com")) {
        return { ok: true } as Response
      }
      if (typeof url === "string" && url.includes("/api/documents/process")) {
        return { ok: true } as Response
      }
      return { ok: true, json: () => Promise.resolve({}) } as Response
    })
  })

  it("renders upload area with drop zone", () => {
    render(<UploadArea />)
    expect(screen.getByLabelText(/upload documents/i)).toBeInTheDocument()
    expect(screen.getByText(/drop files here/i)).toBeInTheDocument()
  })

  it("accepts file selection", () => {
    render(<UploadArea />)
    const file = createMockFile("test.pdf", "application/pdf")
    const input = screen.getByLabelText(/upload documents/i).closest("div")?.querySelector('input[type="file"]')
    expect(input).toBeInTheDocument()
  })

  it("shows selected file name", () => {
    render(<UploadArea />)
    const file = createMockFile("report.pdf", "application/pdf")
    const input = document.querySelector('input[type="file"]') as HTMLInputElement

    Object.defineProperty(input, "files", {
      value: [file],
    })
    fireEvent.change(input)

    expect(screen.getByText("report.pdf")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /upload 1 file/i })).toBeInTheDocument()
  })

  it("shows upload button when files are added", () => {
    render(<UploadArea />)
    const file = createMockFile("doc.pdf", "application/pdf")
    const input = document.querySelector('input[type="file"]') as HTMLInputElement

    Object.defineProperty(input, "files", {
      value: [file],
    })
    fireEvent.change(input)

    expect(screen.getByText(/upload 1 file/i)).toBeInTheDocument()
  })

  it("processes file through upload pipeline", async () => {
    const onComplete = vi.fn()
    render(<UploadArea onUploadComplete={onComplete} />)
    const file = createMockFile("doc.pdf", "application/pdf")
    const input = document.querySelector('input[type="file"]') as HTMLInputElement

    Object.defineProperty(input, "files", {
      value: [file],
    })
    fireEvent.change(input)

    fireEvent.click(screen.getByRole("button", { name: /upload 1 file/i }))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/documents/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: "doc.pdf",
          fileType: "application/pdf",
          fileSize: 1024,
        }),
      })
    })
  })

  it("calls onUploadComplete after successful upload", async () => {
    const onComplete = vi.fn()
    render(<UploadArea onUploadComplete={onComplete} />)
    const file = createMockFile("doc.pdf", "application/pdf")
    const input = document.querySelector('input[type="file"]') as HTMLInputElement

    Object.defineProperty(input, "files", {
      value: [file],
    })
    fireEvent.change(input)

    fireEvent.click(screen.getByRole("button", { name: /upload 1 file/i }))

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalled()
    })
  })
})
