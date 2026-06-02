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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton, HistoryListSkeleton } from "@/components/ui/skeleton"
import { useState, useEffect } from "react"
import { toast } from "sonner"

import type { SearchHistoryItem } from "@/lib/types"

interface HistoryItem extends SearchHistoryItem {
  saved: boolean
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
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

      if (fetchError) throw fetchError
      setHistory(data || [])
    } catch {
      setError("Failed to load search history")
    } finally {
      setLoading(false)
    }
  }

  const handleToggleSaved = async (id: string, currentSaved: boolean) => {
    try {
      const supabase = createClient()
      await supabase.from("search_history").update({ saved: !currentSaved }).eq("id", id)
      await loadHistory()
    } catch {
      toast.error("Failed to update saved status")
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const supabase = createClient()
      await supabase.from("search_history").delete().eq("id", id)
      toast.success("Search entry deleted")
      await loadHistory()
    } catch {
      toast.error("Failed to delete entry")
    }
  }

  const handleClearAll = async () => {
    try {
      const supabase = createClient()
      await supabase.from("search_history").delete().neq("saved", true)
      toast.success("History cleared (saved searches preserved)")
      await loadHistory()
    } catch {
      toast.error("Failed to clear history")
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in-up">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3 w-24 mt-1.5" />
          </div>
          <Skeleton className="h-8 w-16 rounded-lg" />
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
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-muted/50">
          <History className="h-6 w-6 text-muted-foreground/50" aria-hidden="true" />
        </div>
        <p className="text-sm font-medium text-foreground">No searches yet</p>
        <p className="mt-1 text-xs text-muted-foreground/70 max-w-[240px]">
          Your search history will appear here.
        </p>
        <Link
          href="/search"
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-teal-700 transition-colors"
        >
          <Search className="h-4 w-4" aria-hidden="true" />
          Go to search
        </Link>
      </div>
    )
  }

  const savedCount = history.filter((h) => h.saved).length

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Search History</h1>
          <p className="text-xs text-muted-foreground/70 mt-0.5">
            {history.length} searches · {savedCount} saved
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleClearAll}
          className="h-8 rounded-lg text-xs text-muted-foreground hover:text-destructive hover:border-destructive/50"
        >
          <Trash2 className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
          Clear
        </Button>
      </div>

      <div className="space-y-3">
        {history.map((item, i) => (
          <div
            key={item.id}
            className={`group rounded-xl border border-border/40 bg-card p-5 shadow-xs transition-all duration-200 hover:shadow-sm hover:border-border/60 animate-fade-in-up stagger-${Math.min(i + 1, 8)}`}
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate" title={item.query}>
                  {item.query}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {(item.source_count ?? 0) > 0 && (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-muted-foreground/60">
                    <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                    {item.source_count}
                  </span>
                )}
                <span className="text-[11px] text-muted-foreground/60">
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            {item.result_summary && (
              <p className="text-sm text-muted-foreground/70 line-clamp-2 mb-4">
                {item.result_summary}
              </p>
            )}

            <div className="flex items-center gap-1 pt-3 border-t border-border/30">
              <Link
                href={`/search?q=${encodeURIComponent(item.query)}`}
                aria-label="Search for this query"
                className="inline-flex items-center gap-1.5 h-7 px-2 rounded-md text-[11px] font-medium text-muted-foreground hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950 focus-visible:ring-2 focus-visible:ring-teal-400/40 transition-colors"
              >
                <Search className="h-3 w-3" aria-hidden="true" />
                Search
              </Link>
              <button
                onClick={() => handleToggleSaved(item.id, item.saved)}
                aria-label={item.saved ? "Unsave bookmark" : "Save bookmark"}
                className="inline-flex items-center gap-1.5 h-7 px-2 rounded-md text-[11px] font-medium text-muted-foreground hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950 focus-visible:ring-2 focus-visible:ring-teal-400/40 transition-colors"
              >
                {item.saved ? (
                  <BookmarkCheck className="h-3 w-3" aria-hidden="true" />
                ) : (
                  <Bookmark className="h-3 w-3" aria-hidden="true" />
                )}
                {item.saved ? "Saved" : "Save"}
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(item.query)
                  toast.success("Copied to clipboard")
                }}
                aria-label="Copy query to clipboard"
                className="inline-flex items-center gap-1.5 h-7 px-2 rounded-md text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-teal-400/40 transition-colors"
              >
                <Clipboard className="h-3 w-3" aria-hidden="true" />
                Copy
              </button>
              <div className="flex-1" />
              <button
                onClick={() => handleDelete(item.id)}
                aria-label="Delete search entry"
                className="inline-flex items-center gap-1.5 h-7 px-2 rounded-md text-[11px] font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/5 focus-visible:ring-2 focus-visible:ring-teal-400/40 transition-colors"
              >
                <Trash2 className="h-3 w-3" aria-hidden="true" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
