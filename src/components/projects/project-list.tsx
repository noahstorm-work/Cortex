"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import { FolderKanban, FileText, Trash2, Unlink, Loader2, Inbox } from "lucide-react"
import { Skeleton, ProjectListSkeleton } from "@/components/ui/skeleton"
import type { Project, Document } from "@/lib/types"

interface ProjectWithDocs extends Project {
  documents: Document[]
}

export function ProjectList() {
  const [projects, setProjects] = useState<ProjectWithDocs[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  const fetchProjects = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: pData } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    const { data: dData } = await supabase
      .from("documents")
      .select("*")
      .eq("user_id", user.id)

    if (pData) {
      const enriched: ProjectWithDocs[] = pData.map((p) => ({
        ...p,
        documents: (dData || []).filter((d: Document) => d.project_id === p.id),
      }))
      setProjects(enriched)
    }

    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const handleDelete = async (projectId: string) => {
    setDeleting(projectId)
    await fetch("/api/projects/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project_id: projectId }),
    })
    setDeleting(null)
    fetchProjects()
    router.refresh()
  }

  const handleUnlink = async (documentId: string) => {
    await fetch("/api/projects/assign-document", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ document_id: documentId, project_id: null }),
    })
    fetchProjects()
    router.refresh()
  }

  if (loading) {
    return <ProjectListSkeleton />
  }

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-border/50 bg-card/50 p-12 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400/10 to-teal-600/10">
          <FolderKanban className="h-6 w-6 text-teal-400/60" aria-hidden="true" />
        </div>
        <p className="text-sm font-medium text-foreground">No projects yet</p>
        <p className="mt-1 text-xs text-muted-foreground">Create one above to organize your documents.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {projects.map((project) => (
        <Card key={project.id} className="border border-border/50 bg-card/50 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
          <CardContent className="p-0">
            <button
              onClick={() => setExpandedId(expandedId === project.id ? null : project.id)}
              className="flex w-full items-center justify-between px-5 py-3 text-left transition-all duration-200 hover:bg-muted/20"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400/10 to-teal-600/10">
                  <FolderKanban className="h-4.5 w-4.5 text-teal-400/70" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{project.name}</p>
                  <p className="text-xs text-muted-foreground/70">
                    {project.documents.length} document{project.documents.length !== 1 ? "s" : ""}
                    {project.description && <span className="ml-1">— {project.description}</span>}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <span className="text-[11px] text-muted-foreground/50">
                  {new Date(project.created_at).toLocaleDateString()}
                </span>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" disabled={deleting === project.id}>
                      {deleting === project.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Trash2 className="h-3 w-3" aria-hidden="true" />
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="glass-strong rounded-2xl">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete project</AlertDialogTitle>
                      <AlertDialogDescription>Are you sure you want to delete "{project.name}"? This cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(project.id)} className="rounded-xl bg-gradient-to-r from-destructive to-destructive/80">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </button>

            {expandedId === project.id && (
              <div className="border-t border-border/30 px-5 py-3">
                {project.documents.length === 0 ? (
                  <p className="text-xs text-muted-foreground/60 py-2 text-center">No documents in this project.</p>
                ) : (
                  <div className="space-y-1">
                    {project.documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between rounded-xl bg-muted/30 px-3 py-2 transition-all duration-200 hover:bg-muted/50 group">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="h-4 w-4 shrink-0 text-muted-foreground/60" aria-hidden="true" />
                          <span className="truncate text-sm text-foreground/90">{doc.title}</span>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" aria-label={`Remove ${doc.title} from project`}>
                              <Unlink className="h-3 w-3" aria-hidden="true" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="glass-strong rounded-2xl">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove document from project</AlertDialogTitle>
                              <AlertDialogDescription>Are you sure you want to remove "{doc.title}" from this project? The document itself will not be deleted.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleUnlink(doc.id)} className="rounded-xl bg-gradient-to-r from-destructive to-destructive/80">Remove</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
