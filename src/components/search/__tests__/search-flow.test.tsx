import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SearchBar } from "../search-bar";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

vi.mock("@/components/ui/select", () => ({
  Select: ({ children }: any) => <div data-mock="select">{children}</div>,
  SelectContent: ({ children }: any) => <div data-mock="select-content">{children}</div>,
  SelectItem: ({ children }: any) => <div data-mock="select-item">{children}</div>,
  SelectTrigger: ({ children }: any) => <div data-mock="select-trigger">{children}</div>,
  SelectValue: ({ placeholder }: any) => <span data-mock="select-value">{placeholder}</span>,
}));

vi.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: any) => <div data-mock="dropdown-menu">{children}</div>,
  DropdownMenuTrigger: ({ children }: any) => <div data-mock="dropdown-trigger">{children}</div>,
  DropdownMenuContent: ({ children }: any) => <div data-mock="dropdown-content">{children}</div>,
  DropdownMenuItem: ({ children, onClick }: any) => (
    <button data-mock="dropdown-item" onClick={onClick}>
      {children}
    </button>
  ),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      getUser: () => Promise.resolve({ data: { user: { id: "user-1" } }, error: null }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          order: () => Promise.resolve({ data: [], error: null }),
        }),
      }),
    }),
  }),
}));

const mockSearchResponse = {
  query: "test query",
  summary: "This is a comprehensive test summary that covers all the key findings.",
  key_points: [
    "First key point about the search results",
    "Second key point with additional context",
    "Third point summarizing the findings",
  ],
  references: [
    {
      document_id: "doc-1",
      document_title: "Research Paper Alpha",
      excerpt: "This is a relevant excerpt from the document that matches the search query.",
      content: "Full content of the document with detailed information about the topic at hand.",
      relevance: "high" as const,
      score: 0.95,
      chunk_id: "chunk-1",
    },
    {
      document_id: "doc-2",
      document_title: "Technical Report Beta",
      excerpt: "Another relevant excerpt from a different document with supporting information.",
      content:
        "Extended content from the technical report providing additional context and analysis.",
      relevance: "medium" as const,
      score: 0.78,
      chunk_id: "chunk-2",
    },
  ],
  ai_generated: true,
  processing_documents: false,
  total_chunks: 15,
};

describe("Search Integration Flow", () => {
  beforeEach(() => {
    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockSearchResponse),
    } as Response);
  });

  it("full search flow: type → submit → view results → expand source", async () => {
    render(<SearchBar />);

    // Step 1: Type a search query
    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "test query" } });

    // Step 2: Submit search
    const searchButton = screen.getByRole("button", { name: /search/i });
    fireEvent.submit(searchButton);

    // Step 3: Verify search was called
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: "test query", project_id: undefined }),
      });
    });

    // Step 4: Verify summary is displayed
    await waitFor(() => {
      expect(
        screen.getByText("This is a comprehensive test summary that covers all the key findings.")
      ).toBeInTheDocument();
    });

    // Step 5: Verify key points are displayed
    expect(screen.getByText("First key point about the search results")).toBeInTheDocument();
    expect(screen.getByText("Second key point with additional context")).toBeInTheDocument();
    expect(screen.getByText("Third point summarizing the findings")).toBeInTheDocument();

    // Step 6: Verify sources are displayed
    expect(screen.getByText("Research Paper Alpha")).toBeInTheDocument();
    expect(screen.getByText("Technical Report Beta")).toBeInTheDocument();
    expect(screen.getByText("Sources (2)")).toBeInTheDocument();

    // Step 7: Verify chunk count
    expect(screen.getByText("15 chunks matched")).toBeInTheDocument();

    // Step 8: Expand a source
    fireEvent.click(screen.getByText("Research Paper Alpha"));
    await waitFor(() => {
      expect(
        screen.getByText(
          "Full content of the document with detailed information about the topic at hand."
        )
      ).toBeInTheDocument();
    });

    // Step 9: Verify AI generated badge
    expect(screen.getByText("AI generated")).toBeInTheDocument();
  });

  it("search with error shows error state", async () => {
    vi.spyOn(global, "fetch").mockRejectedValueOnce(new Error("Server error"));

    render(<SearchBar />);

    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "failing query" } });
    fireEvent.submit(screen.getByRole("button", { name: /search/i }));

    await waitFor(() => {
      const errors = screen.getAllByText("Server error");
      expect(errors.length).toBeGreaterThanOrEqual(1);
    });
  });

  it("search button shows loading state during search", async () => {
    render(<SearchBar />);

    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "slow query" } });
    const submitButton = screen.getByRole("button", { name: /search/i });
    fireEvent.submit(submitButton);

    // Button should be disabled during search (shows spinner)
    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });

    // After search completes, results appear
    await waitFor(() => {
      expect(
        screen.getByText("This is a comprehensive test summary that covers all the key findings.")
      ).toBeInTheDocument();
    });
  });

  it("onSearchComplete callback is called after search", async () => {
    const onComplete = vi.fn();
    render(<SearchBar onSearchComplete={onComplete} />);

    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "test" } });
    fireEvent.submit(screen.getByRole("button", { name: /search/i }));

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledTimes(1);
    });
  });
});
