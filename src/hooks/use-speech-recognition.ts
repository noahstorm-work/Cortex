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
  modelProgress: number
  usingLocalModel: boolean
  audioLevel: number
  audioWave: number[]
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
  const [modelProgress, setModelProgress] = useState(0)
  const [audioLevel, setAudioLevel] = useState(0)
  const [audioWave, setAudioWave] = useState<number[]>([])
  const waveBufferRef = useRef<number[]>([])
  const lastWaveUpdateRef = useRef(0)
  const recognitionRef = useRef<any>(null)
  const mediaRecorderRef = useRef<{
    stream: MediaStream
    audioContext: AudioContext
    source: MediaStreamAudioSourceNode
    chunks: Float32Array[]
    maxRms: number
    stopRecording: () => void
  } | null>(null)
  const networkFailureRef = useRef(false)
  const startingRef = useRef(false)
  const fallbackInProgressRef = useRef(false)

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    setSupported(!!SR)
    const status = getTranscriberStatus()
    if (status.loading) setModelLoading(true)
    if (status.loaded) setModelLoading(false)
    if (status.progress > 0) setModelProgress(status.progress)

    if (SR) {
      const probe = new SR()
      probe.continuous = false
      probe.interimResults = false
      probe.lang = "en-US"
      probe.onstart = () => { probe.abort() }
      probe.onerror = (e: any) => {
        if (e.error === "network") networkFailureRef.current = true
        probe.abort()
      }
      try { probe.start() } catch {
        if (!navigator.mediaDevices) networkFailureRef.current = true
      }
    }

    const timer = setTimeout(() => {
      const s = getTranscriberStatus()
      if (!s.loaded && !s.loading) {
        setModelLoading(true)
        loadTranscriber((pct) => setModelProgress(pct)).finally(() => setModelLoading(false))
      }
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  const startLocalRecording = useCallback(async () => {
    if (mediaRecorderRef.current) return
    const sentinel: any = { _pending: true }
    mediaRecorderRef.current = sentinel
    setTranscript("")
    setInterimTranscript("")
    setError(null)
    setUsingLocalModel(true)
    setIsListening(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const audioContext = new AudioContext()
      const source = audioContext.createMediaStreamSource(stream)

      const chunks: Float32Array[] = []
      let recording = true
      let maxRms = 0
      let audioNode: AudioNode | null = null

      const onAudioData = (input: Float32Array) => {
        if (!recording) return
        chunks.push(input)

        // RMS for level/orb
        let sum = 0
        for (let i = 0; i < input.length; i++) {
          sum += input[i] * input[i]
        }
        const rms = Math.sqrt(sum / input.length)
        if (rms > maxRms) maxRms = rms
        setAudioLevel(Math.min(rms * 50, 1))

        // Decimate input to ~40 points for waveform
        const step = Math.max(1, Math.floor(input.length / 40))
        for (let i = 0; i < input.length; i += step) {
          waveBufferRef.current.push(input[i])
        }
        waveBufferRef.current = waveBufferRef.current.slice(-500)

        // Throttle waveform state to ~15fps
        const now = Date.now()
        if (now - lastWaveUpdateRef.current > 66) {
          lastWaveUpdateRef.current = now
          setAudioWave([...waveBufferRef.current])
        }
      }

      try {
        await audioContext.audioWorklet.addModule("/audio-processor.js")
        const worklet = new AudioWorkletNode(audioContext, "audio-capture-processor")
        worklet.port.onmessage = (e) => onAudioData(new Float32Array(e.data))
        source.connect(worklet)
        worklet.connect(audioContext.destination)
        audioNode = worklet
      } catch {
        const processor = audioContext.createScriptProcessor(4096, 1, 1)
        processor.onaudioprocess = (e) => onAudioData(e.inputBuffer.getChannelData(0))
        source.connect(processor)
        processor.connect(audioContext.destination)
        audioNode = processor
      }

      const stopRecording = () => {
        recording = false
        if (audioNode) audioNode.disconnect()
        source.disconnect()
        audioContext.close()
        stream.getTracks().forEach((t) => t.stop())
      }

      mediaRecorderRef.current = {
        stream,
        audioContext,
        source,
        chunks,
        maxRms,
        stopRecording,
      }

      setMicPermission("granted")
    } catch {
      mediaRecorderRef.current = null
      setMicPermission("denied")
      setError("Microphone access was denied.")
      setIsListening(false)
    }
  }, [])

  const stopLocalRecording = useCallback(async () => {
    const recorder = mediaRecorderRef.current
    setAudioLevel(0)
    setAudioWave([])
    if (!recorder || (recorder as any)._pending) {
      mediaRecorderRef.current = null
      setIsListening(false)
      return ""
    }

    const chunks = recorder.chunks
    const maxRms = recorder.maxRms
    recorder.stopRecording()
    mediaRecorderRef.current = null
    setIsListening(false)

    if (chunks.length === 0) {
      setUsingLocalModel(false)
      return ""
    }

    if (maxRms < 0.008) {
      setError("No speech detected. Try speaking into the mic.")
      setUsingLocalModel(false)
      return ""
    }

    setInterimTranscript("Transcribing locally...")

    const status = getTranscriberStatus()
    if (status.loading) setModelLoading(true)

    try {
      if (!status.loaded) {
        await loadTranscriber((pct) => setModelProgress(pct))
        setModelLoading(false)
      }
      const text = await transcribeAudioChunks(chunks)
      return text
    } catch (e) {
      console.error("[Transcriber] stopLocalRecording error:", e)
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
      if (event.error === "network") {
        networkFailureRef.current = true
        fallbackInProgressRef.current = true
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
      if (fallbackInProgressRef.current) {
        fallbackInProgressRef.current = false
        return
      }
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
    if (startingRef.current) return
    startingRef.current = true
    try {
      if (mediaRecorderRef.current) return
      if (micPermission === "denied") {
        setError("Microphone access was denied. Allow mic access in your browser settings and try again.")
        return
      }
      if (micPermission !== "granted") {
        const ok = await requestMicPermission()
        if (!ok) return
      }
      setAudioLevel(0)
      setAudioWave([])
      waveBufferRef.current = []
      if (networkFailureRef.current) {
        startLocalRecording()
        return
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
    } finally {
      startingRef.current = false
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
    modelProgress,
    usingLocalModel,
    audioLevel,
    audioWave,
    start,
    stop,
    toggle,
  }
}
