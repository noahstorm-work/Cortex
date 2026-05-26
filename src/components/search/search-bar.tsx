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
import { Search, Loader2, BookOpen, List, FileText } from "lucide-react"
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
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your documents..."
            className="pl-9"
          />
        </div>
        {projects.length > 0 && (
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-40">
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
        <Button type="submit" disabled={searching || !query.trim()}>
          {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
        </Button>
      </form>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {result.processing_documents && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 p-3 text-sm text-amber-800 dark:text-amber-200">
              Some documents are still being processed. Results may be incomplete. Check back shortly.
            </div>
          )}
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="mb-2 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">Summary</h3>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">{result.summary}</p>
          </div>

          {result.key_points.length > 0 && (
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <List className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground">Key Points</h3>
              </div>
              <ul className="space-y-2">
                {result.key_points.map((point, i) => (
                  <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.references.length > 0 && (
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground">
                  Sources ({result.references.length})
                </h3>
              </div>
              <div className="space-y-3">
                {result.references.map((ref, i) => (
                  <div key={i} className="border-l-2 border-primary/20 pl-3">
                    <p className="text-xs font-medium text-foreground">
                      {ref.document_title}
                      <span className="ml-2 text-muted-foreground">
                        (score: {ref.score})
                      </span>
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-3">
                      {ref.content}
                    </p>
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
