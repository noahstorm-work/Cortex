"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
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
    if (!confirm("Delete this project? Documents will be unlinked but not deleted.")) return
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
    return (
      <div className="rounded-lg bg-white p-8 text-center text-sm text-gray-500">
        Loading...
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div className="rounded-lg bg-white p-8 text-center text-sm text-gray-500">
        No projects yet. Create one above.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {projects.map((project) => (
        <div key={project.id} className="rounded-lg border border-gray-200 bg-white">
          <button
            onClick={() => setExpandedId(expandedId === project.id ? null : project.id)}
            className="flex w-full items-center justify-between px-5 py-3 text-left hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">📁</span>
              <div>
                <p className="text-sm font-medium text-gray-900">{project.name}</p>
                <p className="text-xs text-gray-500">
                  {project.documents.length} document{project.documents.length !== 1 ? "s" : ""}
                  {project.description && ` — ${project.description}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <span className="text-xs text-gray-400">
                {new Date(project.created_at).toLocaleDateString()}
              </span>
              <button
                onClick={() => handleDelete(project.id)}
                disabled={deleting === project.id}
                className="text-xs text-red-600 hover:underline disabled:opacity-50"
              >
                {deleting === project.id ? "..." : "Delete"}
              </button>
            </div>
          </button>

          {expandedId === project.id && (
            <div className="border-t border-gray-100 px-5 py-3">
              {project.documents.length === 0 ? (
                <p className="text-xs text-gray-400">No documents in this project.</p>
              ) : (
                <div className="space-y-1">
                  {project.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm">{doc.file_type === "application/pdf" ? "📕" : "📄"}</span>
                        <span className="text-sm text-gray-700 truncate">{doc.title}</span>
                      </div>
                      <button
                        onClick={() => handleUnlink(doc.id)}
                        className="flex-shrink-0 text-xs text-gray-400 hover:text-red-500"
                      >
                        Unlink
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
