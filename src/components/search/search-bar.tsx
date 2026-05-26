"use client"

import { useState } from "react"
import type { SearchResponse } from "@/lib/types"

export function SearchBar() {
  const [query, setQuery] = useState("")
  const [searching, setSearching] = useState(false)
  const [result, setResult] = useState<SearchResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setSearching(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim() }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Search failed")
      }

      const data: SearchResponse = await res.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed")
    } finally {
      setSearching(false)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search your documents..."
          className="block flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={searching || !query.trim()}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {searching ? "Searching..." : "Search"}
        </button>
      </form>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-6">
          <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <h3 className="mb-2 text-sm font-semibold text-gray-900">Summary</h3>
            <p className="text-sm leading-relaxed text-gray-700">{result.summary}</p>
          </div>

          {result.key_points.length > 0 && (
            <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
              <h3 className="mb-3 text-sm font-semibold text-gray-900">Key Points</h3>
              <ul className="space-y-2">
                {result.key_points.map((point, i) => (
                  <li key={i} className="flex gap-2 text-sm text-gray-700">
                    <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.references.length > 0 && (
            <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
              <h3 className="mb-3 text-sm font-semibold text-gray-900">
                Sources ({result.references.length})
              </h3>
              <div className="space-y-3">
                {result.references.map((ref, i) => (
                  <div key={i} className="border-l-2 border-blue-200 pl-3">
                    <p className="text-xs font-medium text-blue-700">
                      {ref.document_title}
                      <span className="ml-2 text-gray-400">
                        ({(ref.similarity * 100).toFixed(1)}% match)
                      </span>
                    </p>
                    <p className="mt-1 text-sm text-gray-600 line-clamp-3">
                      {ref.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
