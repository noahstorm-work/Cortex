import "@testing-library/jest-dom"

// Suppress act() warnings from async effects that complete after render.
// These are React 19 strict-mode console warnings, not test failures.
const originalError = console.error
console.error = (...args: any[]) => {
  if (typeof args[0] === "string" && args[0].includes("not wrapped in act(...)")) return
  originalError(...args)
}
