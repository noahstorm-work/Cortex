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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton, HistoryListSkeleton } from "@/components/ui/skeleton"
import { useState, useEffect } from "react"
import { toast } from "sonner"

interface HistoryItem {
  id: string
  query: string
  result_summary: string | null
  source_count: number | null
  created_at: string
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
      <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-sm text-destructive">
        {error}
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
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400/20 to-teal-600/20">
            <History className="h-4.5 w-4.5 text-teal-400" />
          </div>
          <div>
            <h1 className="text-xl font-display tracking-tight text-balance">Search History</h1>
            <p className="text-xs text-muted-foreground/70">
              {history.length} searches · {savedCount} saved
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={handleClearAll}
          className="shrink-0 rounded-xl border-border/50 hover:text-destructive transition-colors text-xs"
        >
          <Trash2 className="h-3.5 w-3.5 mr-1.5" />
          Clear history
        </Button>
      </div>

      {/* List */}
      <div className="space-y-3">
        {history.map((item, i) => (
          <div
            key={item.id}
            className={`group rounded-2xl border border-border/50 bg-card/50 p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 animate-fade-in-up stagger-${Math.min(i + 1, 8)}`}
          >
            <div className="flex items-start gap-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400/10 to-teal-600/10 group-hover:from-teal-400/20 group-hover:to-teal-600/20 transition-all duration-300">
                <History className="h-4 w-4 text-teal-400/70" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium text-foreground truncate">{item.query}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground/60 shrink-0">
                    {(item.source_count ?? 0) > 0 && (
                      <span className="hidden sm:inline-flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {item.source_count}
                      </span>
                    )}
                    <span>{new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {item.result_summary && (
                  <p className="mt-1.5 text-sm text-muted-foreground/70 line-clamp-2 max-w-2xl">
                    {item.result_summary}
                  </p>
                )}

                <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border/30">
                  <Link
                    href={`/search?q=${encodeURIComponent(item.query)}`}
                    aria-label="Search for this query"
                    className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-muted-foreground hover:text-teal-400 hover:bg-teal-400/10 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/40"
                  >
                    <Search className="h-4 w-4" aria-hidden="true" />
                  </Link>
                  <button
                    onClick={() => handleToggleSaved(item.id, item.saved)}
                    aria-label={item.saved ? "Unsave bookmark" : "Save bookmark"}
                    className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-muted-foreground hover:text-teal-400 hover:bg-teal-400/10 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/40"
                  >
                    {item.saved ? (
                      <BookmarkCheck className="h-4 w-4 text-teal-400" aria-hidden="true" />
                    ) : (
                      <Bookmark className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(item.query)
                      toast.success("Query copied to clipboard")
                    }}
                    aria-label="Copy query to clipboard"
                    className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/40"
                  >
                    <Clipboard className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    aria-label={`Delete search entry for "${item.query}"`}
                    className="ml-auto inline-flex items-center justify-center h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/40"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
