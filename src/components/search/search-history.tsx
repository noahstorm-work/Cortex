"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { History, Search, Trash2, Loader2, Clock } from "lucide-react"
import { Skeleton, SearchHistorySkeleton } from "@/components/ui/skeleton"
import type { SearchHistoryItem } from "@/lib/types"

export function SearchHistory() {
  const [history, setHistory] = useState<SearchHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [clearing, setClearing] = useState(false)

  const fetchHistory = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/search-history")
      if (res.ok) {
        const data = await res.json()
        setHistory(data)
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [])

  const handleClear = async () => {
    setClearing(true)
    await fetch("/api/search-history", { method: "DELETE" })
    setHistory([])
    setClearing(false)
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

  return (
    <Card className="border border-border/50 bg-card/50 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-sm">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-teal-400/20 to-teal-600/20">
            <History className="h-3.5 w-3.5 text-teal-400" aria-hidden="true" />
          </div>
          Recent Searches
        </CardTitle>
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
      </CardHeader>
      <CardContent className={history.length === 0 ? "" : "pt-0"}>
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-muted/50">
              <Search className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </div>
            <p className="text-xs text-muted-foreground/70">No searches yet—try searching above.</p>
          </div>
        ) : (
          <ScrollArea className="max-h-72">
            <div className="space-y-1">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="group rounded-lg bg-muted/30 px-3 py-2 transition-all duration-200 hover:bg-muted/50"
                >
                  <div className="flex items-center gap-2">
                    <Search className="h-3 w-3 shrink-0 text-muted-foreground/50" aria-hidden="true" />
                    <p className="text-sm font-medium text-foreground/80 truncate group-hover:text-foreground transition-colors">
                      {item.query}
                    </p>
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
