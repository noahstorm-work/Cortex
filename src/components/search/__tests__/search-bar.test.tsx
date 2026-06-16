import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { SearchBar } from "../search-bar"

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}))

vi.mock("@/components/ui/select", () => ({
  Select: ({ children }: any) => <div data-mock="select">{children}</div>,
  SelectContent: ({ children }: any) => <div data-mock="select-content">{children}</div>,
  SelectItem: ({ children }: any) => <div data-mock="select-item">{children}</div>,
  SelectTrigger: ({ children }: any) => <div data-mock="select-trigger">{children}</div>,
  SelectValue: ({ placeholder }: any) => <span data-mock="select-value">{placeholder}</span>,
}))

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      getUser: () => Promise.resolve({ data: { user: { id: "user-1" } }, error: null }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          order: () => Promise.resolve({
            data: [
              { id: "proj-1", name: "Alpha", description: null, user_id: "user-1", created_at: "2025-01-01" },
              { id: "proj-2", name: "Beta", description: null, user_id: "user-1", created_at: "2025-01-02" },
            ],
            error: null,
          }),
        }),
      }),
    }),
  }),
}))

const mockSearchResponse = {
  query: "test query",
  summary: "This is a test summary.",
  key_points: ["Point one", "Point two"],
  references: [
    {
      document_id: "doc-1",
      document_title: "Test Doc",
      excerpt: "Some excerpt...",
      content: "Full content here",
      relevance: "high" as const,
      score: 0.95,
      chunk_id: "chunk-1",
    },
  ],
  ai_generated: true,
  processing_documents: false,
  total_chunks: 1,
}

describe("SearchBar", () => {
  beforeEach(() => {
    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockSearchResponse),
    } as Response)
  })

  it("renders search input and button", async () => {
    render(<SearchBar />)
    expect(screen.getByLabelText(/search documents/i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /search/i })).toBeInTheDocument()
  })

  it("disables search button when query is empty", async () => {
    render(<SearchBar />)
    const btn = screen.getByRole("button", { name: /search/i })
    expect(btn).toBeDisabled()
  })

  it("enables search button when query is typed", async () => {
    render(<SearchBar />)
    const input = screen.getByRole("combobox")
    fireEvent.change(input, { target: { value: "hello" } })
    expect(screen.getByRole("button", { name: /search/i })).not.toBeDisabled()
  })

  it("calls /api/search on submit", async () => {
    render(<SearchBar />)
    const input = screen.getByRole("combobox")
    fireEvent.change(input, { target: { value: "test query" } })
    fireEvent.submit(screen.getByRole("button", { name: /search/i }))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: "test query", project_id: undefined }),
      })
    })
  })

  it("shows search results after search", async () => {
    render(<SearchBar />)
    const input = screen.getByRole("combobox")
    fireEvent.change(input, { target: { value: "test query" } })
    fireEvent.submit(screen.getByRole("button", { name: /search/i }))

    await waitFor(() => {
      expect(screen.getByText("This is a test summary.")).toBeInTheDocument()
      expect(screen.getByText("Test Doc")).toBeInTheDocument()
      expect(screen.getByText("Point one")).toBeInTheDocument()
    })
  })

  it("calls onSearchComplete after search", async () => {
    const onComplete = vi.fn()
    render(<SearchBar onSearchComplete={onComplete} />)
    const input = screen.getByRole("combobox")
    fireEvent.change(input, { target: { value: "test" } })
    fireEvent.submit(screen.getByRole("button", { name: /search/i }))

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalled()
    })
  })

  it("shows error state on failed search", async () => {
    vi.spyOn(global, "fetch").mockRejectedValueOnce(new Error("Network error"))
    render(<SearchBar />)
    const input = screen.getByRole("combobox")
    fireEvent.change(input, { target: { value: "test" } })
    fireEvent.submit(screen.getByRole("button", { name: /search/i }))

    await waitFor(() => {
      const errors = screen.getAllByText("Network error")
      expect(errors.length).toBeGreaterThanOrEqual(1)
    })
  })
})
