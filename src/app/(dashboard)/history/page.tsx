"use client"

import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import {
  History,
  Bookmark,
  BookmarkCheck,
  Search,
  FileText,
  Trash2,
  Clipboard,
  ArrowRight,
  AlertTriangle,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton, HistoryListSkeleton } from "@/components/ui/skeleton"
import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"

import type { SearchHistoryItem } from "@/lib/types"

const PAGE_SIZE = 20

interface HistoryItem extends SearchHistoryItem {
  saved: boolean
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[] | null>(null)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadHistory = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setHistory([]); return }

      const { data, error: fetchError } = await supabase
        .from("search_history")
        .select("id, query, result_summary, source_count, created_at, saved")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .range(0, PAGE_SIZE - 1)

      if (fetchError) throw fetchError
      setHistory(data || [])
      setHasMore((data?.length ?? 0) === PAGE_SIZE)
      setPage(0)
    } catch {
      setError("Failed to load search history")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  const loadMore = async () => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const nextPage = page + 1
      const from = nextPage * PAGE_SIZE
      const to = from + PAGE_SIZE - 1

      const { data, error: fetchError } = await supabase
        .from("search_history")
        .select("id, query, result_summary, source_count, created_at, saved")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .range(from, to)

      if (fetchError) throw fetchError
      if (data) setHistory(prev => prev ? [...prev, ...data] : data)
      setHasMore(data?.length === PAGE_SIZE)
      setPage(nextPage)
    } catch {
      toast.error("Failed to load more history")
    } finally {
      setLoadingMore(false)
    }
  }

  const handleToggleSaved = async (id: string, currentSaved: boolean) => {
    const newSaved = !currentSaved
    setHistory(prev => prev ? prev.map(h => h.id === id ? { ...h, saved: newSaved } : h) : prev)
    try {
      const supabase = createClient()
      await supabase.from("search_history").update({ saved: newSaved }).eq("id", id)
    } catch {
      setHistory(prev => prev ? prev.map(h => h.id === id ? { ...h, saved: currentSaved } : h) : prev)
      toast.error("Failed to update saved status")
    }
  }

  const handleDelete = async (id: string) => {
    const prevHistory = history
    setHistory(prev => prev ? prev.filter(h => h.id !== id) : prev)
    toast.success("Search entry deleted")
    try {
      const supabase = createClient()
      await supabase.from("search_history").delete().eq("id", id)
    } catch {
      setHistory(prevHistory)
      toast.error("Failed to delete entry")
    }
  }

  const handleClearAll = async () => {
    const prevHistory = history
    setHistory(prev => prev ? prev.filter(h => !h.saved) : prev)
    try {
      const supabase = createClient()
      await supabase.from("search_history").delete().neq("saved", true)
      toast.success("History cleared (saved searches preserved)")
    } catch {
      setHistory(prevHistory)
      toast.error("Failed to clear history")
    }
  }

  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in-up">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
            <div>
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-3 w-24 mt-1.5" />
            </div>
          </div>
          <Skeleton className="h-8 w-28 rounded-xl shrink-0" />
        </div>
        <HistoryListSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <div role="alert" aria-live="polite" className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-sm text-destructive">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
        <button
          onClick={loadHistory}
          className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-teal-600 hover:text-teal-500 focus-visible:ring-2 focus-visible:ring-teal-400/40 rounded-lg transition-colors"
        >
          Try again
          <ArrowRight className="h-3 w-3" aria-hidden="true" />
        </button>
      </div>
    )
  }

  if (!history || history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400/10 to-teal-600/10">
          <History className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
        </div>
        <p className="text-sm font-medium text-foreground">No searches yet</p>
        <p className="mt-1 text-sm text-muted-foreground max-w-sm">
          Try searching above—your queries will appear here.
        </p>
        <Link
          href="/search"
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-teal-500/20 transition-all duration-300 hover:shadow-xl hover:shadow-teal-500/30"
        >
          <Search className="h-4 w-4" aria-hidden="true" />
          Search now
        </Link>
      </div>
    )
  }

  const savedCount = history.filter((h) => h.saved).length

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 shadow-sm">
            <History className="h-4 w-4 text-white" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-xl font-display tracking-tight text-balance">Search History</h1>
            <p className="text-sm text-muted-foreground/70">
              {history.length} searches · {savedCount} saved
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleClearAll}
          className="h-8 rounded-lg border-border/50 text-xs hover:text-destructive transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
          Clear history
        </Button>
      </div>

      <div className="space-y-3">
        {history.map((item, i) => (
          <div
            key={item.id}
            className={`group flex items-center justify-between rounded-2xl border border-border/50 bg-card/50 px-5 py-4 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 animate-fade-in-up stagger-${Math.min(i + 1, 8)}`}
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400/10 to-teal-600/10 group-hover:from-teal-400/20 group-hover:to-teal-600/20 transition-all duration-300">
                <History className="h-4 w-4 text-teal-400/70 group-hover:text-teal-400 transition-colors duration-300" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-foreground truncate" title={item.query}>{item.query}</p>
                  <div className="flex items-center gap-2 shrink-0">
                    {(item.source_count ?? 0) > 0 && (
                      <span className="hidden sm:inline-flex items-center gap-1 text-xs text-muted-foreground/60">
                        <FileText className="h-3 w-3" aria-hidden="true" />
                        <span>{item.source_count}</span>
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground/60">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {item.result_summary && (
                  <p className="mt-1 text-xs text-muted-foreground/60 line-clamp-1">{item.result_summary}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0 ml-4">
              <Link
                href={`/search?q=${encodeURIComponent(item.query)}`}
                aria-label="Search for this query"
                className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-muted-foreground hover:text-teal-400 hover:bg-teal-400/10 focus-visible:ring-2 focus-visible:ring-teal-400/40 transition-all duration-200"
              >
                <Search className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
              <button
                onClick={() => handleToggleSaved(item.id, item.saved)}
                aria-label={item.saved ? "Unsave bookmark" : "Save bookmark"}
                className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-muted-foreground hover:text-teal-400 hover:bg-teal-400/10 focus-visible:ring-2 focus-visible:ring-teal-400/40 transition-all duration-200"
              >
                {item.saved ? (
                  <BookmarkCheck className="h-3.5 w-3.5" aria-hidden="true" />
                ) : (
                  <Bookmark className="h-3.5 w-3.5" aria-hidden="true" />
                )}
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(item.query)
                  toast.success("Query copied to clipboard")
                }}
                aria-label="Copy query to clipboard"
                className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-teal-400/40 transition-all duration-200"
              >
                <Clipboard className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                aria-label="Delete search entry"
                className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 focus-visible:ring-2 focus-visible:ring-teal-400/40 transition-all duration-200"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            onClick={loadMore}
            disabled={loadingMore}
            className="h-9 rounded-xl border-border/50 text-sm gap-2"
          >
            {loadingMore ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <ArrowRight className="h-4 w-4 rotate-90" aria-hidden="true" />
            )}
            {loadingMore ? "Loading..." : "Load more"}
          </Button>
        </div>
      )}
    </div>
  )
}
