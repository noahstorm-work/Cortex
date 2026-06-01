import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { checkRateLimit, AUTH_RATE_LIMIT } from "@/lib/rate-limit"

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown"
  const { allowed } = checkRateLimit(`demo-login:${ip}`, AUTH_RATE_LIMIT)
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  const email = process.env.DEMO_LOGIN_EMAIL || "test@cortex.app"
  const password = process.env.DEMO_LOGIN_PASSWORD

  if (!password) {
    return NextResponse.json({ error: "Demo login not configured" }, { status: 500 })
  }

  const supabase = await createServerSupabaseClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return NextResponse.json({ error: "Authentication failed" }, { status: 401 })
  }

  return NextResponse.json({ success: true })
}
