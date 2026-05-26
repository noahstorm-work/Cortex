"use client"

import { useState, useCallback } from "react"
import { UploadArea } from "@/components/documents/upload-area"
import { DocumentList } from "@/components/documents/document-list"

export default function DocumentsPage() {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleUploadComplete = useCallback(() => {
    setRefreshKey((k) => k + 1)
  }, [])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Documents</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload and manage your documents for semantic search.
        </p>
      </div>

      <UploadArea onUploadComplete={handleUploadComplete} />

      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Your documents
        </h2>
        <DocumentList key={refreshKey} />
      </div>
    </div>
  )
}
