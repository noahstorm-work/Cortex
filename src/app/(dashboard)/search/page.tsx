"use client"

import { SearchBar } from "@/components/search/search-bar"
import { SearchHistory } from "@/components/search/search-history"
import { Search } from "lucide-react"

export default function SearchPage() {
  return (
    <div className="space-y-8 animate-fade-in-up">
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

      <SearchBar />

      <SearchHistory />
    </div>
  )
}
