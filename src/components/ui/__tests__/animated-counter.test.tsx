import { describe, it, expect, vi } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"

vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
  setTimeout(() => cb(performance.now()), 0)
  return 1
})
vi.stubGlobal("cancelAnimationFrame", (id: number) => clearTimeout(id))

import { AnimatedCounter } from "../animated-counter"

describe("AnimatedCounter", () => {
  it("renders initial value as 0", () => {
    render(<AnimatedCounter value={100} />)
    expect(screen.getByText("0")).toBeInTheDocument()
  })

  it("animates to target value", async () => {
    render(<AnimatedCounter value={50} />)
    await waitFor(() => {
      expect(screen.getByText("50")).toBeInTheDocument()
    }, { timeout: 2000 })
  })

  it("renders 0 when value is 0", () => {
    render(<AnimatedCounter value={0} />)
    expect(screen.getByText("0")).toBeInTheDocument()
  })

  it("formats large numbers with locale string", async () => {
    render(<AnimatedCounter value={1000} />)
    await waitFor(() => {
      expect(screen.getByText((1000).toLocaleString())).toBeInTheDocument()
    }, { timeout: 2000 })
  })

  it("applies custom className", () => {
    render(<AnimatedCounter value={0} className="text-lg" />)
    const span = screen.getByText("0")
    expect(span).toHaveClass("text-lg")
  })
})
