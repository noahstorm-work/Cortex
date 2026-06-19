import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DocumentList } from "../document-list";

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

vi.mock("@/components/ui/select", () => ({
  Select: ({ children }: any) => <div data-mock="select">{children}</div>,
  SelectContent: ({ children }: any) => <div data-mock="select-content">{children}</div>,
  SelectItem: ({ children, value }: any) => (
    <div data-mock="select-item" data-value={value}>
      {children}
    </div>
  ),
  SelectTrigger: ({ children }: any) => <div data-mock="select-trigger">{children}</div>,
  SelectValue: ({ placeholder }: any) => <span data-mock="select-value">{placeholder}</span>,
}));

vi.mock("@/components/ui/alert-dialog", () => ({
  AlertDialog: ({ children }: any) => <div data-mock="alert-dialog">{children}</div>,
  AlertDialogTrigger: ({ children }: any) => <div data-mock="alert-dialog-trigger">{children}</div>,
  AlertDialogContent: ({ children }: any) => <div data-mock="alert-dialog-content">{children}</div>,
  AlertDialogHeader: ({ children }: any) => <div data-mock="alert-dialog-header">{children}</div>,
  AlertDialogTitle: ({ children }: any) => <div data-mock="alert-dialog-title">{children}</div>,
  AlertDialogDescription: ({ children }: any) => (
    <div data-mock="alert-dialog-description">{children}</div>
  ),
  AlertDialogFooter: ({ children }: any) => <div data-mock="alert-dialog-footer">{children}</div>,
  AlertDialogAction: ({ children }: any) => (
    <button data-mock="alert-dialog-action">{children}</button>
  ),
  AlertDialogCancel: ({ children }: any) => (
    <button data-mock="alert-dialog-cancel">{children}</button>
  ),
}));

vi.mock("@/components/ui/badge", () => ({
  Badge: ({ children, variant, className }: any) => (
    <span data-mock="badge" data-variant={variant} className={className}>
      {children}
    </span>
  ),
}));

vi.mock("@/components/ui/document-preview", () => ({
  DocumentPreview: () => null,
}));

vi.mock("@/components/ui/skeleton", () => ({
  Skeleton: ({ className }: any) => <div data-mock="skeleton" className={className} />,
  DocumentListSkeleton: () => <div data-mock="document-list-skeleton" />,
}));

const mockUser = { id: "user-1" };
const mockDocuments = [
  {
    id: "doc-1",
    title: "Project Report.pdf",
    status: "ready",
    created_at: "2025-06-01T10:00:00Z",
    file_url: "https://storage.example.com/doc-1.pdf",
    user_id: "user-1",
    project_id: null,
    file_type: "application/pdf",
    file_size: 1024,
  },
  {
    id: "doc-2",
    title: "Notes.txt",
    status: "processing",
    created_at: "2025-06-02T12:00:00Z",
    file_url: "https://storage.example.com/doc-2.txt",
    user_id: "user-1",
    project_id: "proj-1",
    file_type: "text/plain",
    file_size: 512,
  },
  {
    id: "doc-3",
    title: "Image.png",
    status: "failed",
    created_at: "2025-06-03T14:00:00Z",
    file_url: "https://storage.example.com/doc-3.png",
    user_id: "user-1",
    project_id: "proj-2",
    file_type: "image/png",
    file_size: 2048,
  },
];

const mockProjects = [
  { id: "proj-1", name: "Alpha", description: null, user_id: "user-1", created_at: "2025-01-01" },
  { id: "proj-2", name: "Beta", description: null, user_id: "user-1", created_at: "2025-01-02" },
];

function createMockClient() {
  const buildChain = (): any => {
    const chain: any = {
      select: () => chain,
      eq: () => chain,
      order: () => chain,
      range: () => Promise.resolve({ data: mockDocuments, error: null }),
    };
    return chain;
  };
  const docQuery = buildChain();
  return {
    auth: {
      getUser: () => Promise.resolve({ data: { user: mockUser }, error: null }),
    },
    from: (table: string) => {
      if (table === "projects") {
        return {
          select: () => ({
            eq: () => ({
              order: () => Promise.resolve({ data: mockProjects, error: null }),
            }),
          }),
        };
      }
      if (table === "documents") {
        return docQuery;
      }
      return buildChain();
    },
  };
}

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => createMockClient(),
}));

describe("DocumentList", () => {
  beforeEach(() => {
    vi.spyOn(global, "fetch").mockResolvedValue({ ok: true } as Response);
  });

  it("renders documents after loading", async () => {
    render(<DocumentList />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText("Project Report.pdf")).toBeInTheDocument();
      expect(screen.getByText("Notes.txt")).toBeInTheDocument();
      expect(screen.getByText("Image.png")).toBeInTheDocument();
    });
  });

  it("shows correct status badges", async () => {
    render(<DocumentList />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText("Ready")).toBeInTheDocument();
      expect(screen.getByText("Processing")).toBeInTheDocument();
      expect(screen.getByText("Failed")).toBeInTheDocument();
    });
  });

  it("shows project badges for assigned documents", async () => {
    render(<DocumentList />, { wrapper });

    await waitFor(() => {
      const alphas = screen.getAllByText("Alpha");
      const badgeAlpha = alphas.find((el) => el.getAttribute("data-mock") === "badge");
      expect(badgeAlpha).toBeTruthy();
      const betas = screen.getAllByText("Beta");
      const badgeBeta = betas.find((el) => el.getAttribute("data-mock") === "badge");
      expect(badgeBeta).toBeTruthy();
    });
  });

  it("shows filter when projects exist", async () => {
    render(<DocumentList />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText("Filter:")).toBeInTheDocument();
    });
  });
});
