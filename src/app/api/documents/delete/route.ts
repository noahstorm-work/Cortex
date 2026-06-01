import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/supabase/auth-helper"
import { createAdminClient } from "@/lib/supabase/admin"
import { deleteSchema } from "@/lib/validation/schemas"
import { checkRateLimit, API_RATE_LIMIT } from "@/lib/rate-limit"
import { extractStoragePath } from "@/lib/storage"

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown"
  const { allowed } = checkRateLimit(`delete:${ip}`, API_RATE_LIMIT)
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

  const parsed = deleteSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  const { document_id } = parsed.data

  const { data: doc, error: fetchError } = await supabase
    .from("documents")
    .select("id, file_url")
    .eq("id", document_id)
    .eq("user_id", user.id)
    .single()

  if (fetchError || !doc) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 })
  }

  const admin = createAdminClient()

  const storagePath = extractStoragePath(doc.file_url)
  if (storagePath) {
    await admin.storage.from("documents").remove([storagePath])
  }

  const { error: deleteError } = await supabase
    .from("documents")
    .delete()
    .eq("id", document_id)
    .eq("user_id", user.id)

  if (deleteError) {
    console.error("Delete error:", deleteError)
    return NextResponse.json({ error: "Delete failed" }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
