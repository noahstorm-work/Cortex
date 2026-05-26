"use client"

import { useState, useRef, useCallback, useEffect } from "react"

const ERROR_MESSAGES: Record<string, string> = {
  "network": "Speech service unreachable. Check your connection.",
  "no-speech": "No speech detected. Try again.",
  "aborted": "",
  "audio-capture": "No microphone found.",
  "not-allowed": "Microphone access denied.",
  "service-not-allowed": "Speech service not available.",
  "language-not-supported": "Language not supported.",
}

interface SpeechRecognitionHook {
  isListening: boolean
  transcript: string
  interimTranscript: string
  error: string | null
  micPermission: "prompt"|"granted"|"denied"|"unknown"
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
  const [micPermission, setMicPermission] = useState<"prompt"|"granted"|"denied"|"unknown">("unknown")
  const [supported, setSupported] = useState(false)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    setSupported(!!SR)
  }, [])

  const createRecognition = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) return null

    const recognition = new SR()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = "en-US"

    recognition.onresult = (event: any) => {
      let final = ""
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript
        }
      }
      if (final) {
        setTranscript((prev) => prev + final)
      }
      if (event.results.length > 0) {
        const last = event.results[event.results.length - 1]
        if (!last.isFinal) {
          setInterimTranscript(last[0].transcript)
        } else {
          setInterimTranscript("")
        }
      }
    }

    recognition.onerror = (event: any) => {
      const friendly = ERROR_MESSAGES[event.error] || event.error
      if (friendly) setError(friendly)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    return recognition
  }, [])

  const requestMicPermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach(t => t.stop())
      setMicPermission("granted")
      return true
    } catch {
      setMicPermission("denied")
      return false
    }
  }, [])

  const start = useCallback(async () => {
    if (micPermission === "denied") {
      setError("Microphone access was denied. Allow mic access in your browser settings and try again.")
      return
    }
    if (micPermission !== "granted") {
      const ok = await requestMicPermission()
      if (!ok) return
    }
    const recognition = createRecognition()
    if (!recognition) {
      setError("Speech recognition not supported")
      return
    }
    recognitionRef.current = recognition
    setTranscript("")
    setInterimTranscript("")
    setError(null)
    try {
      recognition.start()
      setIsListening(true)
    } catch {
      setError("Failed to start speech recognition")
    }
  }, [createRecognition, micPermission, requestMicPermission])

  const stop = useCallback(() => {
    try {
      recognitionRef.current?.stop()
    } catch {}
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

  useEffect(() => {
    return () => {
      try { recognitionRef.current?.stop() } catch {}
    }
  }, [])

  return {
    isListening,
    transcript,
    interimTranscript,
    error,
    micPermission,
    supported,
    start,
    stop,
    toggle,
  }
}
