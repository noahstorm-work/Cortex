import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/supabase/auth-helper"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(request: Request) {
  const auth = await requireAuth()
  if (auth.response) return auth.response
  const { supabase, user } = auth

  const { document_id } = await request.json()

  if (!document_id) {
    return NextResponse.json(
      { error: "document_id is required" },
      { status: 400 }
    )
  }

  const { data: doc, error: fetchError } = await supabase
    .from("documents")
    .select("id, file_url")
    .eq("id", document_id)
    .eq("user_id", user.id)
    .single()

  if (fetchError || !doc) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 })
  }

  const admin = createAdminClient()

  const filePath = doc.file_url.split("/storage/v1/object/documents/")[1]
  if (filePath) {
    await admin.storage.from("documents").remove([filePath])
  }

  const { error: deleteError } = await supabase
    .from("documents")
    .delete()
    .eq("id", document_id)
    .eq("user_id", user.id)

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
