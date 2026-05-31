"use client"

import { useState, useEffect } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"
import { Search, Loader2, BookOpen, List, FileText, Sparkles, Cpu, ChevronDown, ChevronUp } from "lucide-react"
import type { SearchResponse, Project } from "@/lib/types"
import { createClient } from "@/lib/supabase/client"

function RelevanceBadge({ label }: { label: "high" | "medium" | "low" }) {
  const styles = {
    high: "bg-emerald-400/10 text-emerald-500 border-emerald-400/20",
    medium: "bg-teal-400/10 text-teal-500 border-teal-400/20",
    low: "bg-muted text-muted-foreground border-border/50",
  }
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${styles[label]}`}>
      {label}
    </span>
  )
}

export function SearchBar() {
  const [query, setQuery] = useState("")
  const [searching, setSearching] = useState(false)
  const [result, setResult] = useState<SearchResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState("")
  const [expandedRefs, setExpandedRefs] = useState<Set<number>>(new Set())
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase
        .from("projects")
        .select("id, name, description, user_id, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .then(({ data }) => {
          if (data) setProjects(data as any)
        })
    })
  }, [supabase])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setSearching(true)
    setError(null)
    setResult(null)
    setExpandedRefs(new Set())

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: query.trim(),
          project_id: selectedProject || undefined,
        }),
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

  const toggleRef = (i: number) => {
    setExpandedRefs((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/40" />
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your documents..."
            className="h-11 pl-10 rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm text-sm transition-all duration-300 focus:border-teal-400/40 focus:ring-2 focus:ring-teal-400/10 focus:bg-card/80"
          />
        </div>
        {projects.length > 0 && (
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="h-11 w-40 rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm">
              <SelectValue placeholder="All projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All projects</SelectItem>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Button
          type="submit"
          disabled={searching || !query.trim()}
          className="h-11 px-6 rounded-2xl bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/20 transition-all duration-300 hover:shadow-xl hover:shadow-teal-500/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
        >
          {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
        </Button>
      </form>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive"
        >
          {error}
        </motion.div>
      )}

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5"
        >
          {result.processing_documents && (
            <div className="rounded-2xl border border-teal-400/20 bg-teal-400/5 p-4 text-sm text-teal-600 dark:text-teal-400">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 animate-pulse-glow" />
                Some documents are still being processed. Results may be incomplete.
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="rounded-2xl border border-border/50 bg-card/50 p-6 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400/20 to-teal-600/20">
                <BookOpen className="h-3.5 w-3.5 text-teal-400" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">Summary</h3>
              {result.ai_generated && (
                <span className="ml-auto inline-flex items-center gap-1 rounded-full border border-teal-400/20 bg-teal-400/5 px-2 py-0.5 text-[10px] font-medium text-teal-500">
                  <Cpu className="h-3 w-3" />
                  AI generated
                </span>
              )}
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground/90">{result.summary}</p>
          </div>

          {/* Key Points */}
          {result.key_points.length > 0 && (
            <div className="rounded-2xl border border-border/50 bg-card/50 p-6 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400/20 to-teal-600/20">
                  <List className="h-3.5 w-3.5 text-teal-400" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">Key Points</h3>
              </div>
              <ul className="space-y-2">
                {result.key_points.map((point, i) => (
                  <li key={i} className="flex gap-2 text-sm text-muted-foreground/90">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-400/60" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Sources */}
          {result.references.length > 0 && (
            <div className="rounded-2xl border border-border/50 bg-card/50 p-6 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400/20 to-teal-600/20">
                  <FileText className="h-3.5 w-3.5 text-teal-400" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">
                  Sources ({result.references.length})
                </h3>
                {result.total_chunks && (
                  <span className="text-[11px] text-muted-foreground/60 ml-auto">
                    {result.total_chunks} chunk{result.total_chunks !== 1 ? "s" : ""} matched
                  </span>
                )}
              </div>
              <div className="space-y-3">
                {result.references.map((ref, i) => (
                  <div key={i}>
                    <button
                      onClick={() => toggleRef(i)}
                      className="w-full text-left border-l-2 border-teal-400/20 pl-4 py-2 transition-all duration-200 hover:border-teal-400/40 rounded-r-xl hover:bg-muted/30"
                    >
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-medium text-foreground truncate">
                          {ref.document_title}
                        </p>
                        <RelevanceBadge label={ref.relevance} />
                        {expandedRefs.has(i) ? (
                          <ChevronUp className="ml-auto h-3 w-3 shrink-0 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="ml-auto h-3 w-3 shrink-0 text-muted-foreground" />
                        )}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground/70 line-clamp-2">
                        {ref.excerpt}
                      </p>
                    </button>
                    {expandedRefs.has(i) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-2 ml-6 rounded-xl bg-muted/30 p-4 text-sm text-muted-foreground/90 leading-relaxed"
                      >
                        {ref.content}
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
