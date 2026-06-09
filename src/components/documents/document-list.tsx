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
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import { FileText, FileImage, FileSpreadsheet, FileCode, ExternalLink, Trash2, Loader2, Inbox, Sparkles } from "lucide-react"
import { Skeleton, DocumentListSkeleton } from "@/components/ui/skeleton"
import { DocumentPreview } from "@/components/ui/document-preview"
import type { Document, Project } from "@/lib/types"

function getFileIcon(title: string) {
  const ext = title.split(".").pop()?.toLowerCase()
  switch (ext) {
    case "png": case "jpg": case "jpeg": case "webp": return FileImage
    case "csv": case "xlsx": return FileSpreadsheet
    case "json": case "xml": case "yaml": case "yml": return FileCode
    default: return FileText
  }
}

export function DocumentList() {
  const [documents, setDocuments] = useState<(Document & { project_name?: string })[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [filterProject, setFilterProject] = useState("")
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const supabase = createClient()

  const fetchDocuments = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [pResult, dResult] = await Promise.all([
      supabase
        .from("projects")
        .select("id, name, description, user_id, created_at")
        .eq("user_id", user.id),
      (() => {
        let q = supabase
          .from("documents")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
        if (filterProject) {
          q = q.eq("project_id", filterProject)
        }
        return q.range(page * 20, (page + 1) * 20 - 1)
      })(),
    ])

    const pData = pResult.data
    if (pData) setProjects(pData as any)

    const projectMap = new Map((pData || []).map((p) => [p.id, p.name]))

    if (dResult.data) {
      setHasMore(dResult.data.length === 20)
      const mapped = dResult.data.map((d: Document) => ({
        ...d,
        project_name: d.project_id ? projectMap.get(d.project_id) : undefined,
      }))
      setDocuments(page === 0 ? mapped : (prev) => [...prev, ...mapped])
    }

    setLoading(false)
  }, [supabase, filterProject, page])

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  const hasProcessing = documents.some((d) => d.status === "pending" || d.status === "processing")

  useEffect(() => {
    if (!hasProcessing) return
    const interval = setInterval(fetchDocuments, 3000)
    return () => clearInterval(interval)
  }, [hasProcessing, fetchDocuments])

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
            <SelectTrigger className="w-48 glass rounded-xl">
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
        <DocumentListSkeleton />
      ) : documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border/50 bg-card/50 p-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400/10 to-teal-600/10">
            <Inbox className="h-7 w-7 text-muted-foreground" aria-hidden="true" />
          </div>
          <p className="text-sm font-medium text-foreground">No documents yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload a document above to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {documents.map((doc, i) => (
            <div
              key={doc.id}
              className={`group flex items-center justify-between rounded-2xl border border-border/50 bg-card/50 px-5 py-4 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 hover:border-teal-400/20 animate-fade-in-up stagger-${Math.min(i + 1, 8)}`}
              onClick={() => { setPreviewDoc(doc); setPreviewOpen(true) }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setPreviewDoc(doc); setPreviewOpen(true) } }}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400/10 to-teal-600/10 group-hover:from-teal-400/20 group-hover:to-teal-600/20 transition-all duration-300">
                  {(() => { const Icon = getFileIcon(doc.title); return <Icon className="h-4 w-4 text-teal-400/70 group-hover:text-teal-400 transition-colors duration-300" />; })()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {doc.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground/60">
                      {new Date(doc.created_at).toLocaleDateString()}
                    </span>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium border ${
                      doc.status === 'ready' ? 'bg-emerald-400/10 text-emerald-500 border-emerald-400/20' :
                      doc.status === 'processing' ? 'bg-teal-400/10 text-teal-500 border-teal-400/20' :
                      doc.status === 'pending' ? 'bg-muted text-muted-foreground border-border/50' :
                      'bg-destructive/10 text-destructive border-destructive/20'
                    }`}>
                      {doc.status === 'processing' && <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse" />}
                      {doc.status === 'pending' ? 'Pending' : doc.status === 'processing' ? 'Processing' : doc.status === 'ready' ? 'Ready' : 'Failed'}
                    </span>
                    {doc.project_name && (
                      <Badge variant="secondary" className="text-[10px] rounded-full border border-border/50">
                        {doc.project_name}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0 ml-4">
                <a
                  href={doc.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Open ${doc.title}`}
                  className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/40"
                >
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg focus-visible:ring-2 focus-visible:ring-teal-400/40" disabled={deleting === doc.id}>
                      {deleting === doc.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive transition-colors" />
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="glass-strong rounded-2xl">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete document</AlertDialogTitle>
                      <AlertDialogDescription>Are you sure you want to delete "{doc.title}"? This cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(doc)} className="rounded-xl bg-gradient-to-r from-destructive to-destructive/80">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}
      {hasMore && (
        <Button variant="outline" className="w-full mt-4 rounded-xl glass" onClick={() => setPage(p => p + 1)}>
          Load more
        </Button>
      )}

      <DocumentPreview
        document={previewDoc}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
      />
    </div>
  )
}
