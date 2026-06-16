"use client"

import { useState, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, File, X, AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils/cn"
import { toast } from "sonner"

interface FileStatus {
  name: string
  state: "pending" | "uploading" | "processing" | "done" | "error"
  error?: string
}

interface UploadAreaProps {
  onUploadComplete?: () => void
}

export function UploadArea({ onUploadComplete }: UploadAreaProps) {
  const [files, setFiles] = useState<File[]>([])
  const [fileStatuses, setFileStatuses] = useState<FileStatus[]>([])
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

  const updateStatus = (name: string, update: Partial<FileStatus>) => {
    setFileStatuses((prev) =>
      prev.map((s) => (s.name === name ? { ...s, ...update } : s))
    )
  }

  const handleUpload = async () => {
    if (files.length === 0) return
    setUploading(true)
    setUploadError(null)
    setFileStatuses(files.map((f) => ({ name: f.name, state: "pending" })))

    let succeeded = 0
    let failed = 0

    for (const file of files) {
      try {
        updateStatus(file.name, { state: "uploading" })

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

        updateStatus(file.name, { state: "processing" })

        for (let i = 0; i < 3; i++) {
          if (i > 0) await new Promise((r) => setTimeout(r, 1000))
          const res = await fetch("/api/documents/process", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ document_id, file_url }),
          })
          if (res.ok) {
            updateStatus(file.name, { state: "done" })
            succeeded++
            break
          }
          if (i === 2) {
            const err = await res.json().catch(() => ({ error: "Unknown error" }))
            throw new Error(err.error)
          }
        }
      } catch (err) {
        updateStatus(file.name, {
          state: "error",
          error: err instanceof Error ? err.message : "Upload failed",
        })
        failed++
      }
    }

    setFiles([])
    setUploading(false)

    if (failed > 0) {
      toast.error(`${failed} file${failed !== 1 ? "s" : ""} failed to upload`)
    } else if (succeeded > 0) {
      toast.success(`${succeeded} file${succeeded !== 1 ? "s" : ""} uploaded successfully`)
    }

    onUploadComplete?.()
  }

  const allDone = fileStatuses.some((s) => s.state === "done" || s.state === "error")

  return (
    <Card className="border border-border/50 bg-card/50 shadow-sm overflow-hidden">
      <CardContent className="p-6">
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") inputRef.current?.click() }}
          role="button"
          tabIndex={0}
          aria-label="Upload documents. Click or drag and drop files."
          className={cn(
            "relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 transition-all duration-300 outline-none focus-visible:border-teal-400/60 focus-visible:ring-2 focus-visible:ring-teal-400/20",
            dragOver
              ? "border-teal-400/60 bg-teal-400/5 scale-[1.02]"
              : "border-border/50 hover:border-teal-400/30 hover:bg-muted/20"
          )}
        >
          <div className={cn(
            "mb-3 flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-300",
            dragOver
              ? "bg-gradient-to-br from-teal-400/20 to-teal-600/20 scale-110"
              : "bg-muted/50"
          )}>
            <Upload className={cn(
              "h-6 w-6 transition-all duration-300",
              dragOver ? "text-teal-400 translate-y-[-2px]" : "text-muted-foreground"
            )} aria-hidden="true" />
          </div>
          <p className="text-sm font-medium text-foreground">
            {dragOver ? "Drop files here" : "Drop files here or click to browse"}
          </p>
          <p className="mt-1.5 text-xs text-muted-foreground">
            PDF, TXT, MD, CSV, DOCX, PNG, JPG, WEBP
          </p>
          {dragOver && (
            <div className="absolute inset-0 rounded-2xl border-2 border-teal-400/20 animate-drag-pulse pointer-events-none" />
          )}
          <input
            ref={inputRef}
            type="file"
            multiple
            accept=".pdf,.txt,.md,.csv,.docx,.png,.jpg,.jpeg,.webp"
            onChange={handleFileSelect}
            className="hidden"
            aria-hidden="true"
          />
        </div>

        {files.length > 0 && (
          <div className="mt-5 space-y-2" aria-live="polite" aria-atomic="false">
            {files.map((file, i) => {
              const status = fileStatuses.find((s) => s.name === file.name)
              return (
                <div key={i} className="flex items-center justify-between rounded-xl bg-muted/30 px-4 py-2.5 animate-fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
                  <div className="flex items-center gap-3 min-w-0">
                    <File className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="truncate text-sm text-foreground/90">{file.name}</span>
                    {status?.state === "uploading" && <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-teal-400" />}
                    {status?.state === "processing" && <span className="h-2 w-2 shrink-0 rounded-full bg-teal-400 animate-pulse" />}
                    {status?.state === "done" && <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />}
                    {status?.state === "error" && <AlertCircle className="h-3.5 w-3.5 shrink-0 text-destructive" />}
                  </div>
                  {!status || status.state === "pending" ? (
                    <button
                      onClick={() => {
                        setFiles((prev) => prev.filter((_, j) => j !== i))
                        setFileStatuses((prev) => prev.filter((s) => s.name !== file.name))
                      }}
                      aria-label={`Remove ${file.name}`}
                      className="shrink-0 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/40 rounded-lg"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                  ) : status.state === "error" ? (
                    <span className="text-[11px] text-destructive truncate max-w-[160px]">{status.error}</span>
                  ) : null}
                </div>
              )
            })}

            {!allDone && (
              <Button
                onClick={handleUpload}
                disabled={uploading || fileStatuses.some((s) => s.state === "uploading" || s.state === "processing")}
                aria-busy={uploading}
                className="w-full rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/20 transition-all duration-300 hover:shadow-xl hover:shadow-teal-500/30 hover:scale-[1.01] active:scale-[0.99]"
              >
                {uploading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </span>
                ) : (
                  `Upload ${files.length} file${files.length > 1 ? "s" : ""}`
                )}
              </Button>
            )}

            {allDone && (
              <div className="flex gap-2">
                <Button
                  onClick={() => { setFiles([]); setFileStatuses([]); onUploadComplete?.() }}
                  className="flex-1 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/20 transition-all duration-300 hover:shadow-xl"
                >
                  Done
                </Button>
                {fileStatuses.some((s) => s.state === "error") && (
                  <Button
                    onClick={() => { setFiles([]); setFileStatuses([]) }}
                    variant="outline"
                    className="flex-1 rounded-xl"
                  >
                    Clear all
                  </Button>
                )}
              </div>
            )}

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
