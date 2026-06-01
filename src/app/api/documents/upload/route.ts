import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/supabase/auth-helper"
import { createAdminClient } from "@/lib/supabase/admin"
import { uploadSchema } from "@/lib/validation/schemas"

const ALLOWED_EXTENSIONS = new Set([
  ".pdf", ".docx", ".doc", ".txt", ".png", ".jpg", ".jpeg", ".gif", ".webp",
])

function getFileExtension(fileName: string): string | null {
  const match = fileName.toLowerCase().match(/\.[^.]+$/)
  return match ? match[0] : null
}

export async function POST(request: Request) {
  const auth = await requireAuth()
  if (auth.response) return auth.response
  const { supabase, user } = auth

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    )
  }

  const parsed = uploadSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  const { fileName, fileType, fileSize, projectId } = parsed.data

  const ext = getFileExtension(fileName)
  if (ext && !ALLOWED_EXTENSIONS.has(ext)) {
    return NextResponse.json(
      { error: `File type "${ext}" is not allowed` },
      { status: 400 }
    )
  }

  try {
    const fileExt = ext || ".txt"
    const filePath = `${user.id}/${crypto.randomUUID()}${fileExt}`

    const admin = createAdminClient()

    const { data: signedData, error: signedError } = await admin.storage
      .from("documents")
      .createSignedUploadUrl(filePath)

    if (signedError || !signedData) {
      console.error("Signed URL error:", signedError)
      return NextResponse.json(
        { error: "Failed to create upload URL" },
        { status: 500 }
      )
    }

    const { data: urlData } = supabase.storage
      .from("documents")
      .getPublicUrl(filePath)

    const fileUrl = urlData.publicUrl

    const { data: doc, error: insertError } = await supabase
      .from("documents")
      .insert({
        user_id: user.id,
        title: fileName,
        file_url: fileUrl,
        file_type: fileType || "application/octet-stream",
        project_id: projectId || null,
        status: "pending",
      })
      .select("id")
      .single()

    if (insertError) {
      await admin.storage.from("documents").remove([filePath])
      console.error("DB insert error:", insertError)
      return NextResponse.json(
        { error: "Upload failed" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      signedUrl: signedData.signedUrl,
      path: signedData.path,
      token: signedData.token,
      document_id: doc.id,
      file_url: fileUrl,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    )
  }
}
