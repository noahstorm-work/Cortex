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

  const { title, file_url, file_type } = await request.json()

  if (!title || !file_url) {
    return NextResponse.json(
      { error: "title and file_url are required" },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from("documents")
    .insert({
      user_id: user.id,
      title,
      file_url,
      file_type: file_type || "text/plain",
    })
    .select("id")
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ document_id: data.id })
}
