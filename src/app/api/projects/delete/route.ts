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

  const { project_id } = await request.json()

  if (!project_id) {
    return NextResponse.json({ error: "project_id is required" }, { status: 400 })
  }

  const { data: project, error: fetchError } = await supabase
    .from("projects")
    .select("id")
    .eq("id", project_id)
    .eq("user_id", user.id)
    .single()

  if (fetchError || !project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 })
  }

  const { error: deleteError } = await supabase
    .from("projects")
    .delete()
    .eq("id", project_id)
    .eq("user_id", user.id)

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
