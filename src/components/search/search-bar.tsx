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
import { Search, Loader2, BookOpen, List, FileText, Sparkles } from "lucide-react"
import type { SearchResponse, Project } from "@/lib/types"
import { createClient } from "@/lib/supabase/client"

export function SearchBar() {
  const [query, setQuery] = useState("")
  const [searching, setSearching] = useState(false)
  const [result, setResult] = useState<SearchResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState("")
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

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your documents..."
            className="h-11 pl-10 rounded-xl border-border/60 bg-background/50 backdrop-blur-sm text-sm transition-all duration-200 focus:border-amber-400/40 focus:ring-2 focus:ring-amber-400/10"
          />
        </div>
        {projects.length > 0 && (
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="h-11 w-40 rounded-xl border-border/60 bg-background/50 backdrop-blur-sm">
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
          className="h-11 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/20 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/30 hover:scale-[1.02] active:scale-[0.98]"
        >
          {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
        </Button>
      </form>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive"
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
            <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-4 text-sm text-amber-600 dark:text-amber-400">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 animate-pulse-glow" />
                Some documents are still being processed. Results may be incomplete.
              </div>
            </div>
          )}

          <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-foreground">Summary</h3>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">{result.summary}</p>
          </div>

          {result.key_points.length > 0 && (
            <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <List className="h-4 w-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-foreground">Key Points</h3>
              </div>
              <ul className="space-y-2">
                {result.key_points.map((point, i) => (
                  <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400/60" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.references.length > 0 && (
            <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-foreground">
                  Sources ({result.references.length})
                </h3>
              </div>
              <div className="space-y-3">
                {result.references.map((ref, i) => (
                  <div key={i} className="border-l-2 border-amber-400/20 pl-4 transition-colors hover:border-amber-400/40">
                    <p className="text-xs font-medium text-foreground">
                      {ref.document_title}
                      <span className="ml-2 text-muted-foreground/60">
                        (score: {ref.score})
                      </span>
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-3">{ref.content}</p>
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
