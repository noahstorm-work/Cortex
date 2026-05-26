"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
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
    if (!confirm(`Delete "${doc.title}"?`)) return
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
          <label className="text-xs font-medium text-gray-500">Filter:</label>
          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="">All documents</option>
            <option value="unassigned">No project</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {loading ? (
        <div className="rounded-lg bg-white p-8 text-center text-sm text-gray-500">
          Loading...
        </div>
      ) : documents.length === 0 ? (
        <div className="rounded-lg bg-white p-8 text-center text-sm text-gray-500">
          No documents yet. Upload your first file above.
        </div>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between rounded-lg bg-white px-5 py-3 shadow-sm ring-1 ring-gray-200"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-lg flex-shrink-0">
                  {doc.file_type === "application/pdf" ? "📕" : "📄"}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {doc.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(doc.created_at).toLocaleDateString()}
                    {doc.project_name && (
                      <span className="ml-2 rounded bg-blue-50 px-1.5 py-0.5 text-xs text-blue-600">
                        {doc.project_name}
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <a
                  href={doc.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline"
                >
                  View
                </a>
                <button
                  onClick={() => handleDelete(doc)}
                  disabled={deleting === doc.id}
                  className="text-xs text-red-600 hover:underline disabled:opacity-50"
                >
                  {deleting === doc.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
