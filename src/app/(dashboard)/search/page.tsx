"use client"

import { useState } from "react"
import { SearchBar } from "@/components/search/search-bar"
import { SearchHistory } from "@/components/search/search-history"
import { VoiceButton } from "@/components/voice/voice-button"
import { VoiceResponse } from "@/components/voice/voice-response"
import type { SearchResponse } from "@/lib/types"

export default function SearchPage() {
  const [voiceResult, setVoiceResult] = useState<SearchResponse | null>(null)
  const [voiceLoading, setVoiceLoading] = useState(false)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Semantic Search</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Search across your documents using vector similarity.
          </p>
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
