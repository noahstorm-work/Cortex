import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "./server"

export async function requireAuth() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { supabase: null as null, user: null as null, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) as NextResponse }
  return { supabase, user, response: null as null }
}
