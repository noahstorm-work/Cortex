"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, ExternalLink, Trash2, Loader2, Inbox } from "lucide-react"
import type { Document, Project } from "@/lib/types"

export function DocumentList() {
  const [documents, setDocuments] = useState<(Document & { project_name?: string })[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [filterProject, setFilterProject] = useState("")
  const supabase = createClient()

  const fetchDocuments = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: pData } = await supabase
      .from("projects")
      .select("id, name, description, user_id, created_at")
      .eq("user_id", user.id)
    if (pData) setProjects(pData as any)

    const projectMap = new Map((pData || []).map((p) => [p.id, p.name]))

    let query = supabase
      .from("documents")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (filterProject) {
      query = query.eq("project_id", filterProject)
    }

    const { data } = await query

    if (data) {
      setDocuments(data.map((d: Document) => ({
        ...d,
        project_name: d.project_id ? projectMap.get(d.project_id) : undefined,
      })))
    }
    setLoading(false)
  }, [supabase, filterProject])

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  const handleDelete = async (doc: Document) => {
    setDeleting(doc.id)
    await fetch("/api/documents/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ document_id: doc.id }),
    })
    setDeleting(null)
    fetchDocuments()
  }

  return (
    <div className="space-y-4">
      {projects.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Filter:</span>
          <Select value={filterProject} onValueChange={setFilterProject}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All documents" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All documents</SelectItem>
              <SelectItem value="unassigned">No project</SelectItem>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center rounded-lg border bg-card p-12">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border bg-card p-12 text-center">
          <Inbox className="mb-2 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No documents yet. Upload your first file above.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between rounded-lg border bg-card px-5 py-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {doc.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(doc.created_at).toLocaleDateString()}
                    {doc.project_name && (
                      <Badge variant="secondary" className="ml-2 text-[10px]">
                        {doc.project_name}
                      </Badge>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={doc.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  <ExternalLink className="h-3 w-3" />
                  View
                </a>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => handleDelete(doc)}
                  disabled={deleting === doc.id}
                >
                  {deleting === doc.id ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Trash2 className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
