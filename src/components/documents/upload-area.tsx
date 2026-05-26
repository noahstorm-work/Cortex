"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export function UploadArea() {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState("")
  const router = useRouter()
  const supabase = createClient()

  const handleUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      const allowed = [
        "application/pdf",
        "text/plain",
        "text/markdown",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ]

      if (!allowed.includes(file.type) && !file.name.endsWith(".txt") && !file.name.endsWith(".md") && !file.name.endsWith(".docx")) {
        alert("Only PDF, TXT, MD, and DOCX files are supported.")
        return
      }

      setUploading(true)
      setProgress("Uploading file...")

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setUploading(false)
        return
      }

      const filePath = `${user.id}/${Date.now()}-${file.name}`
      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, file)

      if (uploadError) {
        setProgress(`Upload failed: ${uploadError.message}`)
        setUploading(false)
        return
      }

      const { data: urlData } = supabase.storage
        .from("documents")
        .getPublicUrl(filePath)

      setProgress("Processing document...")

      const res = await fetch("/api/documents/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: file.name,
          file_url: urlData.publicUrl,
          file_type: file.type || "text/plain",
        }),
      })

      if (!res.ok) {
        setProgress("Failed to save document metadata.")
        setUploading(false)
        return
      }

      const { document_id } = await res.json()

      setProgress("Extracting and chunking...")

      await fetch("/api/documents/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ document_id, file_url: urlData.publicUrl }),
      })

      setProgress("Done!")
      router.refresh()
      setUploading(false)
    },
    [supabase, router]
  )

  return (
    <div className="rounded-xl border-2 border-dashed border-gray-300 bg-white p-12 text-center transition-colors hover:border-blue-400">
      {uploading ? (
        <div className="space-y-3">
          <div className="flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
          </div>
          <p className="text-sm text-gray-600">{progress}</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-4xl">📄</div>
          <div>
            <p className="text-sm font-medium text-gray-700">
              Drop a file here, or click to browse
            </p>
            <p className="mt-1 text-xs text-gray-500">
              PDF, TXT, MD, DOCX supported
            </p>
          </div>
          <label className="inline-flex cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            Choose file
            <input
              type="file"
              accept=".pdf,.txt,.md,.docx"
              onChange={handleUpload}
              className="hidden"
            />
          </label>
        </div>
      )}
    </div>
  )
}
