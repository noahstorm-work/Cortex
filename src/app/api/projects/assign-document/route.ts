import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/supabase/auth-helper"
import { assignDocumentSchema } from "@/lib/validation/schemas"

export async function POST(request: Request) {
  const auth = await requireAuth()
  if (auth.response) return auth.response
  const { supabase, user } = auth

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const parsed = assignDocumentSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  const { document_id, project_id } = parsed.data

  const { data: doc, error: fetchError } = await supabase
    .from("documents")
    .select("id")
    .eq("id", document_id)
    .eq("user_id", user.id)
    .single()

  if (fetchError || !doc) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 })
  }

  const { error } = await supabase
    .from("documents")
    .update({ project_id: project_id || null })
    .eq("id", document_id)
    .eq("user_id", user.id)

  if (error) {
    console.error("Document assign error:", error)
    return NextResponse.json({ error: "Failed to assign document" }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
