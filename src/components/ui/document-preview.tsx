"use client"

import { useEffect, useState } from "react"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { FileText, ExternalLink, Calendar, Layers, Hash, Loader2, FolderKanban } from "lucide-react"
import type { Document } from "@/lib/types"
import { createClient } from "@/lib/supabase/client"

interface DocumentPreviewProps {
  document: Document | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DocumentPreview({ document, open, onOpenChange }: DocumentPreviewProps) {
  const [chunkCount, setChunkCount] = useState<number | null>(null)
  const [projectName, setProjectName] = useState<string | null>(null)
  const [loadingMeta, setLoadingMeta] = useState(false)

  useEffect(() => {
    if (!document || !open) return
    const doc = document

    setLoadingMeta(true)
    const supabase = createClient()

    async function loadMeta() {
      const [chunkResult, projectResult] = await Promise.all([
        supabase
          .from("chunks")
          .select("id", { count: "exact", head: true })
          .eq("document_id", doc.id),
        doc.project_id
          ? supabase.from("projects").select("name").eq("id", doc.project_id).single()
          : Promise.resolve({ data: null }),
      ])

      setChunkCount(chunkResult.count ?? 0)
      setProjectName(projectResult.data?.name ?? null)
      setLoadingMeta(false)
    }

    loadMeta()
  }, [document, open])

  if (!document) return null

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="glass-strong rounded-2xl sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-teal-500" />
            {document.title}
          </AlertDialogTitle>
          <AlertDialogDescription>
            Document details and metadata
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <FileText className="h-4 w-4 shrink-0" />
              <span className="truncate">{document.file_type}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4 shrink-0" />
              <span>{new Date(document.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Layers className="h-4 w-4 shrink-0" />
              <span className="capitalize">{document.status}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Hash className="h-4 w-4 shrink-0" />
              {loadingMeta ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <span>{chunkCount !== null ? `${chunkCount} chunk${chunkCount !== 1 ? "s" : ""}` : "—"}</span>
              )}
            </div>
            {projectName && (
              <div className="flex items-center gap-2 text-muted-foreground col-span-2">
                <FolderKanban className="h-4 w-4 shrink-0" />
                <span>{projectName}</span>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild className="rounded-xl">
              <a href={document.file_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open File
              </a>
            </Button>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-xl">Close</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
