"use client"

import { useState } from "react"
import { SearchBar } from "@/components/search/search-bar"
import { SearchHistory } from "@/components/search/search-history"
import { VoiceButton } from "@/components/voice/voice-button"
import { VoiceResponse } from "@/components/voice/voice-response"
import { Search } from "lucide-react"
import type { SearchResponse } from "@/lib/types"

export default function SearchPage() {
  const [voiceResult, setVoiceResult] = useState<SearchResponse | null>(null)
  const [voiceLoading, setVoiceLoading] = useState(false)

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-sm">
            <Search className="h-4.5 w-4.5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Semantic Search</h1>
            <p className="text-sm text-muted-foreground/70">
              Search across your documents using vector similarity.
            </p>
          </div>
        </div>
        <VoiceButton
          onSearchResult={(result) => {
            setVoiceResult(result)
            setVoiceLoading(false)
          }}
        />
      </div>

      <SearchBar />

      {voiceResult && <VoiceResponse result={voiceResult} loading={voiceLoading} />}

      <SearchHistory />
    </div>
  )
}
