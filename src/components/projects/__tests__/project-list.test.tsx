import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { ProjectList } from "../project-list"

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}))

vi.mock("@/components/ui/alert-dialog", () => ({
  AlertDialog: ({ children }: any) => <div data-mock="alert-dialog">{children}</div>,
  AlertDialogTrigger: ({ children }: any) => <div data-mock="alert-dialog-trigger">{children}</div>,
  AlertDialogContent: ({ children }: any) => <div data-mock="alert-dialog-content">{children}</div>,
  AlertDialogHeader: ({ children }: any) => <div data-mock="alert-dialog-header">{children}</div>,
  AlertDialogTitle: ({ children }: any) => <div data-mock="alert-dialog-title">{children}</div>,
  AlertDialogDescription: ({ children }: any) => <div data-mock="alert-dialog-description">{children}</div>,
  AlertDialogFooter: ({ children }: any) => <div data-mock="alert-dialog-footer">{children}</div>,
  AlertDialogAction: ({ children }: any) => <div data-mock="alert-dialog-action">{children}</div>,
  AlertDialogCancel: ({ children }: any) => <div data-mock="alert-dialog-cancel">{children}</div>,
}))

let mockProjectData: any[] = []
let mockDocData: any[] = []

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      getUser: () => Promise.resolve({ data: { user: { id: "user-1" } }, error: null }),
    },
    from: vi.fn((table: string) => {
      if (table === "projects") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => Promise.resolve({ data: mockProjectData, error: null })),
            })),
          })),
        }
      }
      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ data: mockDocData, error: null })),
        })),
      }
    }),
  }),
}))

describe("ProjectList", () => {
  beforeEach(() => {
    mockProjectData = [
      { id: "p-1", name: "Test Project", description: "A test description", user_id: "user-1", created_at: "2025-01-01" },
      { id: "p-2", name: "Alpha", description: null, user_id: "user-1", created_at: "2025-01-02" },
    ]
    mockDocData = [
      { id: "d-1", title: "Doc One", project_id: "p-1", user_id: "user-1" },
      { id: "d-2", title: "Doc Two", project_id: "p-1", user_id: "user-1" },
      { id: "d-3", title: "Unlinked Doc", project_id: null, user_id: "user-1" },
    ]
  })

  it("shows loading skeleton initially", async () => {
    render(<ProjectList />)
    expect(screen.queryByText("Test Project")).not.toBeInTheDocument()
  })

  it("renders projects after loading", async () => {
    render(<ProjectList />)
    await waitFor(() => expect(screen.getByText("Test Project")).toBeInTheDocument())
    expect(screen.getByText("Alpha")).toBeInTheDocument()
  })

  it("shows document count for each project", async () => {
    render(<ProjectList />)
    await waitFor(() => expect(screen.getByText("2 documents")).toBeInTheDocument())
  })

  it("shows project description when present", async () => {
    render(<ProjectList />)
    await waitFor(() => {
      expect(screen.getByText(/A test description/)).toBeInTheDocument()
    })
  })

  it("shows empty state when no projects", async () => {
    mockProjectData = []
    render(<ProjectList />)
    await waitFor(() => expect(screen.getByText("No projects yet")).toBeInTheDocument())
  })

  it("expands project to show documents on click", async () => {
    render(<ProjectList />)
    await waitFor(() => expect(screen.getByText("Test Project")).toBeInTheDocument())
    fireEvent.click(screen.getByText("Test Project"))
    await waitFor(() => {
      expect(screen.getByText("Doc One")).toBeInTheDocument()
      expect(screen.getByText("Doc Two")).toBeInTheDocument()
    })
    expect(screen.queryByText("Unlinked Doc")).not.toBeInTheDocument()
  })
})
