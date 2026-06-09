"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { History, Search, Trash2, Loader2, Clock, Filter, X } from "lucide-react"
import { Skeleton, SearchHistorySkeleton } from "@/components/ui/skeleton"
import type { SearchHistoryItem } from "@/lib/types"

type FilterMode = "all" | "today" | "week" | "saved"

export function SearchHistory({ refetchTrigger }: { refetchTrigger?: number } = {}) {
  const [history, setHistory] = useState<SearchHistoryItem[] & { saved?: boolean }[]>([])
  const [loading, setLoading] = useState(true)
  const [clearing, setClearing] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterMode>("all")
  const [searchQuery, setSearchQuery] = useState("")

  const fetchHistory = async () => {
    setLoading(true)
    setFetchError(null)
    try {
      const res = await fetch("/api/search-history")
      if (!res.ok) {
        throw new Error("Failed to load search history")
      }
      const data = await res.json()
      setHistory(data)
    } catch {
      setFetchError("Could not load search history")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [refetchTrigger])

  const filtered = useMemo(() => {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekStart = new Date(todayStart)
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())

    return history.filter((item) => {
      if (searchQuery && !item.query.toLowerCase().includes(searchQuery.toLowerCase())) return false
      if (filter === "all") return true
      if (filter === "saved") return (item as any).saved
      const d = new Date(item.created_at)
      if (filter === "today") return d >= todayStart
      if (filter === "week") return d >= weekStart
      return true
    })
  }, [history, filter, searchQuery])

  const handleClear = async () => {
    setClearing(true)
    try {
      const res = await fetch("/api/search-history", { method: "DELETE" })
      if (!res.ok) {
        throw new Error("Failed to clear history")
      }
      setHistory([])
    } catch {
      setFetchError("Could not clear history")
    } finally {
      setClearing(false)
    }
  }

  if (loading) {
    return (
      <Card className="border border-border/50 bg-card/50 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <History className="h-4 w-4 text-teal-400" aria-hidden="true" />
            Search History
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <SearchHistorySkeleton />
        </CardContent>
      </Card>
    )
  }

  if (fetchError) {
    return (
      <Card className="border border-border/50 bg-card/50 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <History className="h-4 w-4 text-teal-400" aria-hidden="true" />
            Search History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div role="alert" aria-live="polite" className="text-xs text-destructive">{fetchError}</div>
          <button
            onClick={fetchHistory}
            className="mt-2 text-xs font-medium text-teal-600 hover:text-teal-500 focus-visible:ring-2 focus-visible:ring-teal-400/40 rounded-lg transition-colors"
          >
            Try again
          </button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border border-border/50 bg-card/50 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-sm">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-teal-400/20 to-teal-600/20">
            <History className="h-3.5 w-3.5 text-teal-400" aria-hidden="true" />
          </div>
          Recent Searches
        </CardTitle>
        <div className="flex items-center gap-2">
          {history.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              disabled={clearing}
              className="h-7 text-xs rounded-lg text-muted-foreground hover:text-foreground"
              aria-label="Clear search history"
            >
              {clearing ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Trash2 className="h-3 w-3" />
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className={history.length === 0 ? "" : "space-y-3 pt-0"}>
        {history.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[140px]">
              <Search className="absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground/40" aria-hidden="true" />
              <Input
                placeholder="Filter queries…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 pl-8 pr-8 rounded-lg text-xs border-border/50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
            <div className="flex gap-1">
              {(["all", "today", "week", "saved"] as FilterMode[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-colors ${
                    filter === f
                      ? "bg-teal-400/10 text-teal-500"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  {f === "all" ? "All" : f === "today" ? "Today" : f === "week" ? "This Week" : "Saved"}
                </button>
              ))}
            </div>
          </div>
        )}

        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-muted/50">
              <Search className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </div>
            <p className="text-xs text-muted-foreground/70">No searches yet—try searching above.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-muted/50">
              <Filter className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </div>
            <p className="text-xs text-muted-foreground/70">No matching searches for this filter.</p>
          </div>
        ) : (
          <ScrollArea className="max-h-72">
            <div className="space-y-1">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  className="group rounded-lg bg-muted/30 px-3 py-2 transition-all duration-200 hover:bg-muted/50"
                >
                  <div className="flex items-center gap-2">
                    <Search className="h-3 w-3 shrink-0 text-muted-foreground/50" aria-hidden="true" />
                    <p className="text-sm font-medium text-foreground/80 truncate group-hover:text-foreground transition-colors">
                      {item.query}
                    </p>
                    {(item as any).saved && (
                      <span className="text-[10px] font-medium text-teal-500 ml-auto">Saved</span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground/60">
                    <Clock className="h-3 w-3" aria-hidden="true" />
                    <span>{new Date(item.created_at).toLocaleString()}</span>
                    <span>·</span>
                    <span>{item.source_count ?? 0} sources</span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
