import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/supabase/auth-helper"
import { search, buildResponse } from "@/lib/search"
import { searchSchema } from "@/lib/validation/schemas"
import { checkRateLimit, SEARCH_RATE_LIMIT, SUMMARY_RATE_LIMIT } from "@/lib/rate-limit"
import { logger } from "@/lib/logger"

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown"
  const { allowed } = checkRateLimit(`search:${ip}`, SEARCH_RATE_LIMIT)
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

  const parsed = searchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  const { query, project_id } = parsed.data

  try {
    const results = await search(query, user.id, { project_id })

    const { allowed: summaryAllowed } = checkRateLimit(`summary:${ip}`, SUMMARY_RATE_LIMIT)
    const response = await buildResponse(query, results, !summaryAllowed)

    const { data: processingDocs } = await supabase
      .from("documents")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .in("status", ["pending", "processing"])

    if (processingDocs) {
      response.processing_documents = true
    }

    supabase.from("search_history").insert({
      user_id: user.id,
      query: query.trim(),
      result_summary: response.summary?.slice(0, 200),
      source_count: response.references?.length || 0,
    }).then(({ error }) => {
      if (error) logger.error("Failed to log search history", { error })
    })

    return NextResponse.json(response)
  } catch (error) {
    logger.error("Search error", { error })
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    )
  }
}
