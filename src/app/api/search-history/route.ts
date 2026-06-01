import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/supabase/auth-helper"
import { searchHistoryCreateSchema } from "@/lib/validation/schemas"

export async function GET() {
  const auth = await requireAuth()
  if (auth.response) return auth.response
  const { supabase, user } = auth

  const { data, error } = await supabase
    .from("search_history")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20)

  if (error) {
    console.error("Search history fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch search history" }, { status: 500 })
  }

  return NextResponse.json(data)
}

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

  const parsed = searchHistoryCreateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  const { query, result_summary, source_count } = parsed.data

  const { error } = await supabase.from("search_history").insert({
    user_id: user.id,
    query,
    result_summary: result_summary || null,
    source_count: source_count || 0,
  })

  if (error) {
    console.error("Search history insert error:", error)
    return NextResponse.json({ error: "Failed to save search history" }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

export async function DELETE() {
  const auth = await requireAuth()
  if (auth.response) return auth.response
  const { supabase, user } = auth

  const { error } = await supabase
    .from("search_history")
    .delete()
    .eq("user_id", user.id)

  if (error) {
    console.error("Search history delete error:", error)
    return NextResponse.json({ error: "Failed to clear search history" }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
