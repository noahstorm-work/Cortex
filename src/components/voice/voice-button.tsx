"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useSpeechRecognition } from "@/hooks/use-speech-recognition"
import { useSpeechSynthesis } from "@/hooks/use-speech-synthesis"
import { VoiceOrb } from "@/components/voice/voice-orb"
import { Button } from "@/components/ui/button"
import { X, Loader2 } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import type { SearchResponse } from "@/lib/types"

interface VoiceButtonProps {
  onSearchResult?: (result: SearchResponse) => void
}

export function VoiceButton({ onSearchResult }: VoiceButtonProps) {
  const { isListening, transcript, interimTranscript, error, supported, toggle } = useSpeechRecognition()
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

  if (!supported) return null

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
        <VoiceOrb isListening={isListening} onToggle={toggle} />
        {isListening && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-muted-foreground"
          >
            {interimTranscript || "Listening..."}
          </motion.p>
        )}
        {error && (
          <p className="text-xs text-destructive">{error}</p>
        )}
      </div>
    </div>
  )
}
