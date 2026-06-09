import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import { ErrorBoundary } from "../error-boundary"

function ThrowingComponent() {
  throw new Error("Test error")
}

function GoodComponent() {
  return <div>Child content</div>
}

describe("ErrorBoundary", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {})
  })

  it("renders children when no error", () => {
    render(
      <ErrorBoundary>
        <GoodComponent />
      </ErrorBoundary>
    )
    expect(screen.getByText("Child content")).toBeInTheDocument()
  })

  it("renders default fallback on error", () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    )
    expect(screen.getByText("Something went wrong")).toBeInTheDocument()
    expect(screen.getByText(/An unexpected error occurred/)).toBeInTheDocument()
  })

  it("renders custom fallback on error", () => {
    render(
      <ErrorBoundary fallback={<div>Custom error UI</div>}>
        <ThrowingComponent />
      </ErrorBoundary>
    )
    expect(screen.getByText("Custom error UI")).toBeInTheDocument()
  })

  it("renders Try again button in error state", () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    )
    expect(screen.getByText("Try again")).toBeInTheDocument()
  })
})
