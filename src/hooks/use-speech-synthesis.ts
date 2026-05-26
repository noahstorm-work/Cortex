"use client"

import { useState, useCallback, useRef, useEffect } from "react"

interface SpeechSynthesisHook {
  speaking: boolean
  supported: boolean
  speak: (text: string) => void
  stop: () => void
  pause: () => void
  resume: () => void
}

const isBrowser = typeof window !== "undefined"
const hasSpeechSynthesis = isBrowser && "speechSynthesis" in window

export function useSpeechSynthesis(): SpeechSynthesisHook {
  const [speaking, setSpeaking] = useState(false)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const voicesRef = useRef<SpeechSynthesisVoice[]>([])

  useEffect(() => {
    if (!hasSpeechSynthesis) return

    const updateVoices = () => {
      voicesRef.current = window.speechSynthesis.getVoices()
    }

    updateVoices()
    window.speechSynthesis.addEventListener("voiceschanged", updateVoices)
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", updateVoices)
    }
  }, [])

  const speak = useCallback(
    (text: string) => {
      if (!hasSpeechSynthesis) return

      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 1.1
      utterance.pitch = 1.0
      utterance.volume = 1

      const voices = voicesRef.current.length > 0 ? voicesRef.current : window.speechSynthesis.getVoices()
      const preferred = voices.find(
        (v) => v.lang.startsWith("en") && v.name.includes("Female")
      ) || voices.find((v) => v.lang.startsWith("en")) || voices[0]
      if (preferred) utterance.voice = preferred

      utterance.onstart = () => setSpeaking(true)
      utterance.onend = () => setSpeaking(false)
      utterance.onerror = () => setSpeaking(false)

      utteranceRef.current = utterance
      window.speechSynthesis.speak(utterance)
    },
    []
  )

  const stop = useCallback(() => {
    window.speechSynthesis.cancel()
    setSpeaking(false)
  }, [])

  const pause = useCallback(() => {
    window.speechSynthesis.pause()
  }, [])

  const resume = useCallback(() => {
    window.speechSynthesis.resume()
  }, [])

  return { speaking, supported: hasSpeechSynthesis, speak, stop, pause, resume }
}
