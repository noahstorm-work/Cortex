"use client"

import { useState, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, File, X, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils/cn"

interface UploadAreaProps {
  onUploadComplete?: () => void
}

export function UploadArea({ onUploadComplete }: UploadAreaProps) {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const acceptedTypes = [
    "application/pdf",
    "text/plain",
    "text/markdown",
    "text/csv",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/png",
    "image/jpeg",
    "image/webp",
  ]

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const dropped = Array.from(e.dataTransfer.files).filter((f) =>
      acceptedTypes.includes(f.type)
    )
    if (dropped.length > 0) setFiles((prev) => [...prev, ...dropped])
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)])
    }
  }

  const handleUpload = async () => {
    if (files.length === 0) return
    setUploading(true)
    setUploadError(null)

    for (const file of files) {
      try {
        const metaRes = await fetch("/api/documents/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
          }),
        })
        if (!metaRes.ok) {
          const data = await metaRes.json()
          throw new Error(data.error || "Upload failed")
        }

        const { signedUrl, document_id, file_url } = await metaRes.json()

        const uploadRes = await fetch(signedUrl, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type },
        })
        if (!uploadRes.ok) {
          throw new Error("File upload to storage failed")
        }

        const triggerProcess = async (retries = 3): Promise<void> => {
          for (let i = 0; i < retries; i++) {
            if (i > 0) await new Promise(r => setTimeout(r, 1000))
            const res = await fetch("/api/documents/process", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ document_id, file_url }),
            })
            if (res.ok) return
            if (i === retries - 1) {
              const err = await res.json().catch(() => ({ error: "Unknown error" }))
              console.error("Process trigger failed:", err.error)
            }
          }
        }
        triggerProcess()
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : "Upload failed")
        return
      }
    }

    setFiles([])
    setUploading(false)
    onUploadComplete?.()
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors",
            dragOver
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-muted-foreground/50"
          )}
        >
          <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">
            Drop files here or click to browse
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            PDF, TXT, MD, CSV, DOCX, PNG, JPG, WEBP
          </p>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept=".pdf,.txt,.md,.csv,.docx,.png,.jpg,.jpeg,.webp"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {files.length > 0 && (
          <div className="mt-4 space-y-2">
            {files.map((file, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg bg-muted px-3 py-2">
                <div className="flex items-center gap-2 min-w-0">
                  <File className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="truncate text-sm text-foreground">{file.name}</span>
                </div>
                <button
                  onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))}
                  className="shrink-0 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            <Button onClick={handleUpload} disabled={uploading} className="w-full">
              {uploading ? "Uploading..." : `Upload ${files.length} file${files.length > 1 ? "s" : ""}`}
            </Button>
            {uploadError && (
              <p className="mt-2 text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {uploadError}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
