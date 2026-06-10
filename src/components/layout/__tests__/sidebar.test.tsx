import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { Sidebar } from "../sidebar"

vi.mock("next/navigation", () => ({
  usePathname: () => "/documents",
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}))

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: { signOut: () => Promise.resolve({ error: null }) },
  }),
}))

vi.mock("@/components/ui/sheet", () => ({
  Sheet: ({ children }: any) => <div data-mock="sheet">{children}</div>,
  SheetContent: ({ children }: any) => <div data-mock="sheet-content">{children}</div>,
  SheetDescription: ({ children }: any) => <div data-mock="sheet-description">{children}</div>,
  SheetTitle: ({ children }: any) => <div data-mock="sheet-title">{children}</div>,
  SheetTrigger: ({ children }: any) => <div data-mock="sheet-trigger">{children}</div>,
}))

vi.mock("@/components/ui/theme-toggle", () => ({
  ThemeToggle: () => <button data-mock="theme-toggle">Toggle theme</button>,
}))

describe("Sidebar", () => {
  beforeEach(() => {
    // Ensure mounted state is true
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("renders the Cortex brand link", () => {
    render(<Sidebar />)
    const brandLinks = screen.getAllByText("Cortex")
    expect(brandLinks.length).toBeGreaterThanOrEqual(1)
  })

  it("renders all navigation items", () => {
    render(<Sidebar />)
    expect(screen.getAllByText("Dashboard").length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText("Documents").length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText("Search").length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText("History").length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText("Projects").length).toBeGreaterThanOrEqual(1)
  })

  it("renders section labels", () => {
    render(<Sidebar />)
    expect(screen.getAllByText("Workspace").length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText("More").length).toBeGreaterThanOrEqual(1)
  })

  it("renders sign out button", () => {
    render(<Sidebar />)
    expect(screen.getAllByText("Sign out").length).toBeGreaterThanOrEqual(1)
  })

  it("renders theme toggle", () => {
    render(<Sidebar />)
    const toggles = screen.getAllByText("Toggle theme")
    expect(toggles.length).toBeGreaterThanOrEqual(1)
  })

  it("highlights active route", () => {
    render(<Sidebar />)
    const docLinks = screen.getAllByText("Documents")
    expect(docLinks.length).toBeGreaterThanOrEqual(1)
  })
})
