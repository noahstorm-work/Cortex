import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { SearchExport } from "../search-export"

vi.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: any) => <div data-mock="dropdown-menu">{children}</div>,
  DropdownMenuTrigger: ({ children }: any) => <div data-mock="dropdown-trigger">{children}</div>,
  DropdownMenuContent: ({ children }: any) => <div data-mock="dropdown-content">{children}</div>,
  DropdownMenuItem: ({ onClick, children }: any) => <button data-mock="dropdown-item" onClick={onClick}>{children}</button>,
}))

const mockResults = {
  query: "test query",
  summary: "Test summary",
  key_points: ["Point 1", "Point 2"],
  references: [
    { document_title: "Doc 1", document_id: "d1", content: "Content", excerpt: "Excerpt", score: 0.95, relevance: "high" as const },
  ],
  ai_generated: true,
}

describe("SearchExport", () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    })
  })

  it("renders Copy button", () => {
    render(<SearchExport results={mockResults} />)
    expect(screen.getByText("Copy")).toBeInTheDocument()
  })

  it("copies JSON to clipboard on Copy click", async () => {
    render(<SearchExport results={mockResults} />)
    fireEvent.click(screen.getByText("Copy"))
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalled()
    })
  })

  it("shows Copied state after copy", async () => {
    render(<SearchExport results={mockResults} />)
    fireEvent.click(screen.getByText("Copy"))
    await waitFor(() => {
      expect(screen.getByText("Copied")).toBeInTheDocument()
      expect(screen.queryByText("Copy")).not.toBeInTheDocument()
    })
  })

  it("renders export options", () => {
    render(<SearchExport results={mockResults} />)
    expect(screen.getByText("Export as JSON")).toBeInTheDocument()
    expect(screen.getByText("Export as CSV")).toBeInTheDocument()
    expect(screen.getByText("Export as Markdown")).toBeInTheDocument()
  })

  it("renders download button trigger", () => {
    render(<SearchExport results={mockResults} />)
    const downloadBtns = screen.getAllByRole("button")
    const hasDownload = downloadBtns.some(
      (btn) => btn.querySelector("svg")
    )
    expect(hasDownload).toBe(true)
  })
})
