"use client"

import { useState, useCallback } from "react"
import { UploadArea } from "@/components/documents/upload-area"
import { DocumentList } from "@/components/documents/document-list"
import { FileText, UploadCloud } from "lucide-react"

export default function DocumentsPage() {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleUploadComplete = useCallback(() => {
    setRefreshKey((k) => k + 1)
  }, [])

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 shadow-sm">
              <FileText className="h-4.5 w-4.5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-display tracking-tight text-balance">Documents</h1>
              <p className="text-sm text-muted-foreground/70">
                Upload and manage your documents for semantic search.
              </p>
            </div>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 rounded-lg border border-border/50 bg-background/50 px-3 py-1.5 text-xs text-muted-foreground">
          <UploadCloud className="h-3.5 w-3.5" />
          Supports PDF, Word, images
        </div>
      </div>

      <UploadArea onUploadComplete={handleUploadComplete} />

      <div>
        <h2 className="mb-4 text-sm font-medium text-foreground/80 tracking-wide uppercase">
          Your documents
        </h2>
        <DocumentList key={refreshKey} />
      </div>
    </div>
  )
}
