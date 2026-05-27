import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/supabase/auth-helper"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(request: Request) {
  const auth = await requireAuth()
  if (auth.response) return auth.response
  const { supabase, user } = auth

  let body: { fileName?: string; fileType?: string; fileSize?: number; projectId?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: "Expected JSON body" },
      { status: 400 }
    )
  }

  const { fileName, fileType, fileSize, projectId } = body

  if (!fileName) {
    return NextResponse.json({ error: "fileName is required" }, { status: 400 })
  }

  if (!fileSize || fileSize <= 0) {
    return NextResponse.json({ error: "File is empty" }, { status: 400 })
  }

  const maxSize = 50 * 1024 * 1024
  if (fileSize > maxSize) {
    return NextResponse.json({ error: "File exceeds 50 MB limit" }, { status: 400 })
  }

  try {
    const fileExt = fileName.split(".").pop() || "txt"
    const filePath = `${user.id}/${crypto.randomUUID()}.${fileExt}`

    const admin = createAdminClient()

    const { data: signedData, error: signedError } = await admin.storage
      .from("documents")
      .createSignedUploadUrl(filePath)

    if (signedError || !signedData) {
      return NextResponse.json(
        { error: "Failed to create upload URL: " + (signedError?.message || "unknown") },
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
      return NextResponse.json(
        { error: "Database insert failed: " + insertError.message },
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
