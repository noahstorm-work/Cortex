"use client"

import { useState, useRef, useCallback, useEffect } from "react"

interface SpeechRecognitionHook {
  isListening: boolean
  transcript: string
  interimTranscript: string
  error: string | null
  supported: boolean
  start: () => void
  stop: () => void
  toggle: () => void
}

export function useSpeechRecognition(): SpeechRecognitionHook {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [interimTranscript, setInterimTranscript] = useState("")
  const [error, setError] = useState<string | null>(null)
  const recognitionRef = useRef<any>(null)
  const [supported, setSupported] = useState(false)

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    setSupported(!!SR)
  }, [])

  const createRecognition = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) return null

    const recognition = new SR()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = "en-US"

    recognition.onresult = (event: any) => {
      let final = ""
      let interim = ""
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript
        } else {
          interim += event.results[i][0].transcript
        }
      }
      if (final) setTranscript((prev) => prev + final)
      setInterimTranscript(interim)
    }

    recognition.onerror = (event: any) => {
      setError(event.error)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    return recognition
  }, [])

  const start = useCallback(() => {
    const recognition = createRecognition()
    if (!recognition) {
      setError("Speech recognition not supported")
      return
    }
    recognitionRef.current = recognition
    setTranscript("")
    setInterimTranscript("")
    setError(null)
    recognition.start()
    setIsListening(true)
  }, [createRecognition])

  const stop = useCallback(() => {
    recognitionRef.current?.stop()
    recognitionRef.current = null
    setIsListening(false)
  }, [])

  const toggle = useCallback(() => {
    if (isListening) {
      stop()
    } else {
      start()
    }
  }, [isListening, start, stop])

  return {
    isListening,
    transcript,
    interimTranscript,
    error,
    supported,
    start,
    stop,
    toggle,
  }
}
