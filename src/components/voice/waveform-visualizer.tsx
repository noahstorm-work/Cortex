"use client"

import { useRef, useEffect } from "react"

interface WaveformVisualizerProps {
  wave: number[]
  isListening: boolean
}

export function WaveformVisualizer({ wave, isListening }: WaveformVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !isListening || wave.length < 2) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const w = canvas.clientWidth * dpr
    const h = canvas.clientHeight * dpr
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w
      canvas.height = h
    }

    ctx.clearRect(0, 0, w, h)

    const mid = h / 2
    const len = wave.length
    const step = w / len

    ctx.beginPath()
    ctx.moveTo(0, mid)
    for (let i = 0; i < len; i++) {
      const x = i * step
      const y = mid + wave[i] * mid * 0.8
      ctx.lineTo(x, y)
    }
    ctx.strokeStyle = "hsl(38 92% 56% / 0.7)"
    ctx.lineWidth = 2 * dpr
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(0, mid)
    for (let i = 0; i < len; i++) {
      const x = i * step
      const y = mid + wave[i] * mid * 0.8
      ctx.lineTo(x, y)
    }
    ctx.lineTo(w, mid)
    ctx.closePath()
    ctx.fillStyle = "hsl(38 92% 56% / 0.08)"
    ctx.fill()
  }, [wave, isListening])

  return (
    <canvas
      ref={canvasRef}
      className="h-12 w-full rounded-lg"
    />
  )
}
