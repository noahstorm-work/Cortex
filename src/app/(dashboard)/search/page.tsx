"use client"

import { useState } from "react"
import { SearchBar } from "@/components/search/search-bar"
import { SearchHistory } from "@/components/search/search-history"
import { Search } from "lucide-react"

export default function SearchPage() {
  const [searchTrigger, setSearchTrigger] = useState(0)

  const handleSearchComplete = () => {
    setSearchTrigger(prev => prev + 1)
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 shadow-sm">
          <Search className="h-4.5 w-4.5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-display tracking-tight text-balance">Semantic Search</h1>
          <p className="text-sm text-muted-foreground/70">
            Search across your documents using vector similarity.
          </p>
        </div>
      </div>

      <SearchBar onSearchComplete={handleSearchComplete} />

      <SearchHistory refetchTrigger={searchTrigger} />
    </div>
  )
}
