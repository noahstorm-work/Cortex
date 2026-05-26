"use client"

import { useEffect } from "react"

interface KeyboardShortcuts {
  onSearch?: () => void
  onUpload?: () => void
}

export function useKeyboardShortcuts(handlers: KeyboardShortcuts) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault()
        handlers.onSearch?.()
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "u") {
        e.preventDefault()
        handlers.onUpload?.()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handlers.onSearch, handlers.onUpload])
}
