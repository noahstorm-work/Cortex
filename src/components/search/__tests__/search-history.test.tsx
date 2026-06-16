import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { SearchHistory } from "../search-history"

vi.mock("@/components/ui/scroll-area", () => ({
  ScrollArea: ({ children }: any) => <div data-mock="scroll-area">{children}</div>,
}))

const mockItems = [
  { id: "h-1", query: "first query", result_summary: "Summary one", source_count: 5, created_at: "2025-06-09T10:00:00Z", saved: false },
  { id: "h-2", query: "second query", result_summary: "Summary two", source_count: 3, created_at: "2025-06-08T10:00:00Z", saved: true },
]

describe("SearchHistory", () => {
  beforeEach(() => {
    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockItems),
    } as Response)
  })

  it("shows loading skeleton initially", () => {
    render(<SearchHistory />)
    expect(screen.getByText("Search History")).toBeInTheDocument()
    expect(screen.queryByText("first query")).not.toBeInTheDocument()
  })

  it("renders history items after loading", async () => {
    render(<SearchHistory />)
    await waitFor(() => expect(screen.getByText("first query")).toBeInTheDocument(), { timeout: 10000 })
    expect(screen.getByText("second query")).toBeInTheDocument()
  })

  it("shows source count for each item", async () => {
    render(<SearchHistory />)
    await waitFor(() => {
      expect(screen.getByText("5 sources")).toBeInTheDocument()
      expect(screen.getByText("3 sources")).toBeInTheDocument()
    })
  })

  it("shows saved badge for saved items", async () => {
    render(<SearchHistory />)
    await waitFor(() => {
      const savedElements = screen.getAllByText("Saved")
      expect(savedElements.length).toBeGreaterThanOrEqual(2)
    })
  })

  it("shows error state on fetch failure", async () => {
    vi.spyOn(global, "fetch").mockRejectedValueOnce(new Error("Network error"))
    render(<SearchHistory />)
    await waitFor(() => expect(screen.getByText("Could not load search history")).toBeInTheDocument())
    expect(screen.getByText("Try again")).toBeInTheDocument()
  })

  it("shows empty state when no history", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    } as Response)
    render(<SearchHistory />)
    await waitFor(() => expect(screen.getByText("No searches yet—try searching above.")).toBeInTheDocument())
  })

  it("filters items by search query", async () => {
    render(<SearchHistory />)
    await waitFor(() => expect(screen.getByText("first query")).toBeInTheDocument())
    const input = screen.getByPlaceholderText("Filter queries…")
    fireEvent.change(input, { target: { value: "second" } })
    expect(screen.queryByText("first query")).not.toBeInTheDocument()
    expect(screen.getByText("second query")).toBeInTheDocument()
  })

  it("shows clear button when history exists", async () => {
    render(<SearchHistory />)
    await waitFor(() => expect(screen.getByLabelText("Clear search history")).toBeInTheDocument())
  })

  it("shows no matching searches message when filter yields no results", async () => {
    render(<SearchHistory />)
    await waitFor(() => expect(screen.getByText("first query")).toBeInTheDocument())
    const input = screen.getByPlaceholderText("Filter queries…")
    fireEvent.change(input, { target: { value: "nonexistent" } })
    await waitFor(() => expect(screen.getByText("No matching searches for this filter.")).toBeInTheDocument())
  })

  it("calls fetch on mount", async () => {
    render(<SearchHistory />)
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/search-history")
    })
  })
})
