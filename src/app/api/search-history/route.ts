import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/supabase/auth-helper"

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
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const auth = await requireAuth()
  if (auth.response) return auth.response
  const { supabase, user } = auth

  const { query, result_summary, source_count } = await request.json()

  if (!query) {
    return NextResponse.json({ error: "query is required" }, { status: 400 })
  }

  const { error } = await supabase.from("search_history").insert({
    user_id: user.id,
    query,
    result_summary,
    source_count: source_count || 0,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
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
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
