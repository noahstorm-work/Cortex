import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { document_id, project_id } = await request.json()

  if (!document_id) {
    return NextResponse.json({ error: "document_id is required" }, { status: 400 })
  }

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
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
