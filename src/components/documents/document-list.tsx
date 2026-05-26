"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Document } from "@/lib/types"

export function DocumentList() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const supabase = createClient()

  const fetchDocuments = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from("documents")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (data) setDocuments(data)
    setLoading(false)
  }, [supabase])

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

  if (loading) {
    return (
      <div className="rounded-lg bg-white p-8 text-center text-sm text-gray-500">
        Loading...
      </div>
    )
  }

  if (documents.length === 0) {
    return (
      <div className="rounded-lg bg-white p-8 text-center text-sm text-gray-500">
        No documents yet. Upload your first file above.
      </div>
    )
  }

  return (
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
  )
}
