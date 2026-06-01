import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/supabase/auth-helper"
import { projectDeleteSchema } from "@/lib/validation/schemas"
import { checkRateLimit, API_RATE_LIMIT } from "@/lib/rate-limit"

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown"
  const { allowed } = checkRateLimit(`project-delete:${ip}`, API_RATE_LIMIT)
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  const auth = await requireAuth()
  if (auth.response) return auth.response
  const { supabase, user } = auth

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const parsed = projectDeleteSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  const { project_id } = parsed.data

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
    console.error("Project delete error:", deleteError)
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
