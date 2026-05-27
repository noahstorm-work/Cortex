"use client"

import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { 
  History, 
  Trash2, 
  Bookmark, 
  BookmarkCheck, 
  Loader2, 
  Search, 
  FileText,
  CheckCircle2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"

export const dynamic = "force-dynamic"

async function getSearchHistory() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from("search_history")
    .select("id, query, result_summary, source_count, created_at, saved")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Failed to fetch search history:", error)
    return []
  }

  return data
}

async function toggleSaved(id: string, currentSaved: boolean) {
  const supabase = createClient()
  const { error } = await supabase
    .from("search_history")
    .update({ saved: !currentSaved })
    .eq("id", id)

  if (error) {
    console.error("Failed to toggle saved status:", error)
    throw error
  }
}

async function clearAllHistory() {
  const supabase = createClient()
  const { error } = await supabase
    .from("search_history")
    .delete()
    .neq("saved", true) // Only delete unsaved searches

  if (error) {
    console.error("Failed to clear history:", error)
    throw error
  }
}

export default function HistoryPage() {
  const [history, setHistory] = useState<any[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getSearchHistory()
      if (data !== null) {
        setHistory(data)
      }
    } catch (err) {
      setError("Failed to load search history")
    } finally {
      setLoading(false)
    }
  }

  const handleToggleSaved = async (id: string, currentSaved: boolean) => {
    try {
      await toggleSaved(id, currentSaved)
      await loadHistory() // Refresh
    } catch (err) {
      setError("Failed to update saved status")
    }
  }

  const handleClearHistory = async () => {
    if (!window.confirm("Clear all search history? This cannot be undone.")) return
    try {
      await clearAllHistory()
      await loadHistory() // Refresh
    } catch (err) {
      setError("Failed to clear history")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 text-destructive bg-destructive/5 rounded-lg border border-destructive/20">
        {error}
      </div>
    )
  }

  if (!history) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <History className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">
          No search history yet. Your searches will appear here after you search for documents.
        </p>
        <Link href="/search" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-amber-500">
          Search now
          <Search className="h-3 w-3" />
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">Search History</h1>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={handleClearHistory}
            className="hover:text-destructive"
          >
            Clear History
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {history.map((item) => (
          <div key={item.id} className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-5">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50">
                <History className="h-4 w-4 text-amber-400" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-start gap-3">
                  <p className="text-sm font-medium text-foreground line-clamp-2 max-w-[200px]">{item.query}</p>
                  <div className="ml-auto flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground/60">
                      {new Date(item.created_at).toLocaleDateString()} ·
                      {new Date(item.created_at).toLocaleTimeString()}
                    </span>
                    {item.source_count > 0 && (
                      <span className="flex items-center gap-1 text-muted-foreground/60">
                        <FileText className="h-3 w-3" />
                        {item.source_count} source{item.source_count !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                </div>

                {item.result_summary && (
                  <p className="text-sm text-muted-foreground/80 line-clamp-3 max-w-[300px]">{item.result_summary}</p>
                )}

                <div className="flex items-center gap-3 pt-3 border-t border-border/50">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      window.location.href = `/search?q=${encodeURIComponent(item.query)}`
                    }}
                    className="hover:text-amber-500"
                  >
                    <Search className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleToggleSaved(item.id, item.saved)}
                    className="hover:text-amber-500"
                  >
                    {item.saved ? (
                      <BookmarkCheck className="h-4 w-4 text-amber-400" />
                    ) : (
                      <Bookmark className="h-4 w-4 text-amber-400" />
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      // Copy query to clipboard
                      navigator.clipboard.writeText(item.query)
                    }}
                    className="hover:text-muted-foreground"
                  >
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}