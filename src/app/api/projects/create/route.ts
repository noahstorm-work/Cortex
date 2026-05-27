import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/supabase/auth-helper"

export async function POST(request: Request) {
  const auth = await requireAuth()
  if (auth.response) return auth.response
  const { supabase, user } = auth

  const { name, description } = await request.json()

  if (!name || typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "name is required" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("projects")
    .insert({
      user_id: user.id,
      name: name.trim(),
      description: (description || "").trim(),
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
