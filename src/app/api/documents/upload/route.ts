import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json(
      { error: "Expected multipart/form-data" },
      { status: 400 }
    )
  }

  const file = formData.get("file") as File | null
  if (!file) {
    return NextResponse.json({ error: "file is required" }, { status: 400 })
  }

  if (file.size === 0) {
    return NextResponse.json({ error: "File is empty" }, { status: 400 })
  }

  const projectId = formData.get("project_id") as string | null

  const maxSize = 50 * 1024 * 1024
  if (file.size > maxSize) {
    return NextResponse.json({ error: "File exceeds 50 MB limit" }, { status: 400 })
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    const fileExt = file.name.split(".").pop() || "txt"
    const filePath = `${user.id}/${crypto.randomUUID()}.${fileExt}`

    const admin = createAdminClient()

    const { error: uploadError } = await admin.storage
      .from("documents")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      return NextResponse.json(
        { error: "Storage upload failed: " + uploadError.message },
        { status: 500 }
      )
    }

    const { data: urlData } = await supabase.storage
      .from("documents")
      .getPublicUrl(filePath)

    const fileUrl = urlData.publicUrl

    const { data: doc, error: insertError } = await supabase
      .from("documents")
      .insert({
        user_id: user.id,
        title: file.name,
        file_url: fileUrl,
        file_type: file.type || "application/octet-stream",
        project_id: projectId || null,
        status: "processing",
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

    const { count } = await supabase
      .from("documents")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "processing")

    if (count && count > 3) {
      await supabase.from("documents").update({ status: "pending" }).eq("id", doc.id)
    } else {
      fetch(new URL("/api/documents/process", request.url), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          document_id: doc.id,
          file_url: fileUrl,
          user_id: user.id,
        }),
      }).catch((err) => console.error("Process trigger failed:", err))
    }

    return NextResponse.json({
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
