import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"

const mockSetTheme = vi.fn()

vi.mock("next-themes", () => ({
  useTheme: () => ({ setTheme: mockSetTheme }),
}))

vi.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: any) => <div data-mock="dropdown-menu">{children}</div>,
  DropdownMenuTrigger: ({ children }: any) => <div data-mock="dropdown-trigger">{children}</div>,
  DropdownMenuContent: ({ children }: any) => <div data-mock="dropdown-content">{children}</div>,
  DropdownMenuItem: ({ children, onClick }: any) => <button data-mock="dropdown-item" onClick={onClick}>{children}</button>,
}))

import { ThemeToggle } from "../theme-toggle"

describe("ThemeToggle", () => {
  beforeEach(() => {
    mockSetTheme.mockClear()
  })

  it("renders toggle button with sr-only text", () => {
    render(<ThemeToggle />)
    expect(screen.getByText("Toggle theme")).toBeInTheDocument()
  })

  it("calls setTheme('light') when Light is clicked", () => {
    render(<ThemeToggle />)
    fireEvent.click(screen.getByText("Light"))
    expect(mockSetTheme).toHaveBeenCalledWith("light")
  })

  it("calls setTheme('dark') when Dark is clicked", () => {
    render(<ThemeToggle />)
    fireEvent.click(screen.getByText("Dark"))
    expect(mockSetTheme).toHaveBeenCalledWith("dark")
  })

  it("calls setTheme('system') when System is clicked", () => {
    render(<ThemeToggle />)
    fireEvent.click(screen.getByText("System"))
    expect(mockSetTheme).toHaveBeenCalledWith("system")
  })

  it("renders all three theme options", () => {
    render(<ThemeToggle />)
    expect(screen.getByText("Light")).toBeInTheDocument()
    expect(screen.getByText("Dark")).toBeInTheDocument()
    expect(screen.getByText("System")).toBeInTheDocument()
  })
})
