"use client"

import { useEffect, useRef, useState } from "react"

interface AnimatedCounterProps {
  value: number
  duration?: number
  className?: string
}

export function AnimatedCounter({ value, duration = 800, className }: AnimatedCounterProps) {
  const [display, setDisplay] = useState(0)
  const startTime = useRef<number | null>(null)
  const raf = useRef<number | null>(null)

  useEffect(() => {
    if (value === 0) {
      setDisplay(0)
      return
    }

    const from = 0
    const delta = value - from

    const step = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp
      const elapsed = timestamp - startTime.current
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.floor(from + delta * eased))

      if (progress < 1) {
        raf.current = requestAnimationFrame(step)
      }
    }

    startTime.current = null
    raf.current = requestAnimationFrame(step)

    return () => {
      if (raf.current) cancelAnimationFrame(raf.current)
    }
  }, [value, duration])

  return <span className={className}>{display.toLocaleString()}</span>
}
