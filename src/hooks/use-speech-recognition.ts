"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { loadTranscriber, transcribeAudioChunks, getTranscriberStatus } from "@/lib/transcriber"

interface SpeechRecognitionHook {
  isListening: boolean
  transcript: string
  interimTranscript: string
  error: string | null
  micPermission: "prompt"|"granted"|"denied"|"unknown"
  supported: boolean
  modelLoading: boolean
  usingLocalModel: boolean
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
  const [usingLocalModel, setUsingLocalModel] = useState(false)
  const [modelLoading, setModelLoading] = useState(false)
  const recognitionRef = useRef<any>(null)
  const mediaRecorderRef = useRef<{
    stream: MediaStream
    audioContext: AudioContext
    source: MediaStreamAudioSourceNode
    processor: ScriptProcessorNode
    chunks: Float32Array[]
    stopRecording: () => void
  } | null>(null)

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    setSupported(!!SR)
    const status = getTranscriberStatus()
    if (status.loading) setModelLoading(true)
    if (status.loaded) setModelLoading(false)
  }, [])

  const startLocalRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const audioContext = new AudioContext()
      const source = audioContext.createMediaStreamSource(stream)
      const sampleRate = audioContext.sampleRate

      const processor = audioContext.createScriptProcessor(4096, 1, 1)
      const chunks: Float32Array[] = []
      let recording = true

      processor.onaudioprocess = (e) => {
        if (!recording) return
        const input = e.inputBuffer.getChannelData(0)
        chunks.push(new Float32Array(input))
      }

      source.connect(processor)
      processor.connect(audioContext.destination)

      const stopRecording = () => {
        recording = false
        processor.disconnect()
        source.disconnect()
        audioContext.close()
        stream.getTracks().forEach((t) => t.stop())
      }

      mediaRecorderRef.current = {
        stream,
        audioContext,
        source,
        processor,
        chunks,
        stopRecording,
      }

      setMicPermission("granted")
      setTranscript("")
      setInterimTranscript("")
      setError(null)
      setUsingLocalModel(true)
      setIsListening(true)
    } catch {
      setMicPermission("denied")
      setError("Microphone access was denied.")
    }
  }, [])

  const stopLocalRecording = useCallback(async () => {
    const recorder = mediaRecorderRef.current
    if (!recorder) return ""

    const chunks = recorder.chunks
    recorder.stopRecording()
    mediaRecorderRef.current = null
    setIsListening(false)

    if (chunks.length === 0) return ""

    setInterimTranscript("Transcribing locally...")

    const status = getTranscriberStatus()
    if (status.loading) setModelLoading(true)

    try {
      if (!status.loaded) {
        await loadTranscriber()
        setModelLoading(false)
      }
      const text = await transcribeAudioChunks(chunks)
      return text
    } catch {
      setError("Local transcription failed. Try again.")
      return ""
    } finally {
      setUsingLocalModel(false)
    }
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
      console.error("[SpeechRecognition] error:", event.error, event.message || "", event)
      if (event.error === "network") {
        recognitionRef.current = null
        startLocalRecording()
      } else {
        const friendly = event.error === "not-allowed"
          ? "Microphone access denied. Allow mic access in your browser settings."
          : event.error === "service-not-allowed"
            ? "Speech service not available."
            : event.error === "no-speech"
              ? "No speech detected. Try again."
              : event.error === "audio-capture"
                ? "No microphone found."
                : event.error === "language-not-supported"
                  ? "Language not supported."
                  : event.error || "Speech recognition failed"
        setError(friendly)
        setIsListening(false)
      }
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    return recognition
  }, [startLocalRecording])

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
    if (mediaRecorderRef.current) return
    if (micPermission === "denied") {
      setError("Microphone access was denied. Allow mic access in your browser settings and try again.")
      return
    }
    if (micPermission !== "granted") {
      const ok = await requestMicPermission()
      if (!ok) return
    }
    recognitionRef.current = null
    const recognition = createRecognition()
    if (!recognition) {
      startLocalRecording()
      return
    }
    recognitionRef.current = recognition
    setTranscript("")
    setInterimTranscript("")
    setError(null)
    setUsingLocalModel(false)
    try {
      recognition.start()
      setIsListening(true)
    } catch {
      recognitionRef.current = null
      startLocalRecording()
    }
  }, [createRecognition, micPermission, requestMicPermission, startLocalRecording])

  const stop = useCallback(() => {
    if (mediaRecorderRef.current) {
      stopLocalRecording().then((text) => {
        if (text) {
          setTranscript(text)
        }
      })
    } else if (recognitionRef.current) {
      try {
        recognitionRef.current?.stop()
      } catch {}
      recognitionRef.current = null
      setIsListening(false)
    }
  }, [stopLocalRecording])

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
      mediaRecorderRef.current?.stopRecording()
    }
  }, [])

  return {
    isListening,
    transcript,
    interimTranscript,
    error,
    micPermission,
    supported,
    modelLoading,
    usingLocalModel,
    start,
    stop,
    toggle,
  }
}
