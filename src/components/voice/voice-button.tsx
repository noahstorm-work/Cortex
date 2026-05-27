"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useSpeechRecognition } from "@/hooks/use-speech-recognition"
import { useSpeechSynthesis } from "@/hooks/use-speech-synthesis"
import { VoiceOrb } from "@/components/voice/voice-orb"
import { X, Loader2 } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import type { SearchResponse } from "@/lib/types"

interface VoiceButtonProps {
  onSearchResult?: (result: SearchResponse) => void
}

export function VoiceButton({ onSearchResult }: VoiceButtonProps) {
  const { isListening, transcript, interimTranscript, error, modelLoading, modelProgress, usingLocalModel, audioLevel, toggle } = useSpeechRecognition()
  const { speaking, supported: ttsSupported, speak, stop: stopTts } = useSpeechSynthesis()
  const [expanded, setExpanded] = useState(false)
  const [searching, setSearching] = useState(false)
  const [response, setResponse] = useState<string | null>(null)
  const prevTranscriptRef = useRef("")

  useEffect(() => {
    if (transcript && transcript !== prevTranscriptRef.current && !isListening) {
      prevTranscriptRef.current = transcript
      performSearch(transcript)
    }
  }, [transcript, isListening])

  const performSearch = async (query: string) => {
    setSearching(true)
    setExpanded(true)
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      })
      if (!res.ok) throw new Error("Search failed")
      const data: SearchResponse = await res.json()

      setResponse(data.summary)
      if (ttsSupported) {
        speak(data.summary)
      }
      onSearchResult?.(data)
    } catch {
      setResponse("Sorry, I couldn't process that search.")
    } finally {
      setSearching(false)
    }
  }

  const handleClear = () => {
    setExpanded(false)
    setResponse(null)
    stopTts()
  }

  return (
    <div className="relative">
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-20 right-0 w-80 rounded-xl border bg-card p-4 shadow-lg"
          >
            {searching ? (
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Searching knowledge base...
              </div>
            ) : response ? (
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm leading-relaxed text-foreground">{response}</p>
                  <button onClick={handleClear} className="shrink-0 text-muted-foreground hover:text-foreground">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                {ttsSupported && (
                  <button
                    onClick={() => speaking ? stopTts() : speak(response)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    {speaking ? "Stop speaking" : "Speak again"}
                  </button>
                )}
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col items-center gap-2">
        {modelLoading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border bg-card">
              <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
            </div>
            <div className="w-32">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(modelProgress, 5)}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-muted-foreground"
            >
              {modelProgress > 0 ? `Downloading model... ${modelProgress}%` : "Loading speech model..."}
            </motion.p>
          </div>
        ) : (
          <VoiceOrb isListening={isListening} onToggle={toggle} audioLevel={audioLevel} />
        )}
        {isListening && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-muted-foreground"
          >
            {interimTranscript || (usingLocalModel ? "Recording..." : "Listening...")}
          </motion.p>
        )}
        {usingLocalModel && isListening && (
          <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-600">
            Local
          </span>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border bg-card p-3 text-xs shadow-sm w-64"
          >
            <p className="font-medium text-destructive mb-1">{error}</p>
            {error.includes("Microphone") && (
              <p className="text-muted-foreground">Click the lock icon in your URL bar and enable microphone access.</p>
            )}
            {!error.includes("Microphone") && (
              <button onClick={toggle} className="mt-1 text-primary underline hover:no-underline">
                Try again
              </button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
