"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { History, Search, Trash2, Loader2, Clock } from "lucide-react"
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <History className="h-4 w-4" />
            Search History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-sm">
          <History className="h-4 w-4" />
          Search History
        </CardTitle>
        {history.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            disabled={clearing}
            className="h-7 text-xs"
          >
            {clearing ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Trash2 className="h-3 w-3" />
            )}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Search className="mb-2 h-6 w-6 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">No search history yet.</p>
          </div>
        ) : (
          <ScrollArea className="max-h-72">
            <div className="space-y-2">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg bg-muted/50 px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <Search className="h-3 w-3 shrink-0 text-muted-foreground" />
                    <p className="text-sm font-medium text-foreground truncate">
                      {item.query}
                    </p>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                    <Clock className="h-3 w-3" />
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
