"use client"

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
import { FileText, ExternalLink, Calendar, Layers } from "lucide-react"
import type { Document } from "@/lib/types"

interface DocumentPreviewProps {
  document: Document | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DocumentPreview({ document, open, onOpenChange }: DocumentPreviewProps) {
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
              <FileText className="h-4 w-4" />
              <span>{document.file_type}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{new Date(document.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Layers className="h-4 w-4" />
              <span className="capitalize">{document.status}</span>
            </div>
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
