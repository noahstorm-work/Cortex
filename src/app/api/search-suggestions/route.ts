import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/supabase/auth-helper"
import { checkRateLimit, SUGGESTION_RATE_LIMIT } from "@/lib/rate-limit"
import { searchSuggestionsSchema } from "@/lib/validation/schemas"
import { escapeLike } from "@/lib/search/bm25"

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown"
  const { allowed } = checkRateLimit(`search-suggestions:${ip}`, SUGGESTION_RATE_LIMIT)
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

  const parsed = searchSuggestionsSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 })
  }

  const { query, limit } = parsed.data
  const trimmedQuery = query.trim()
  const escapedQuery = escapeLike(trimmedQuery)

  try {
    // Single query for both recent + frequency aggregation
    const { data: searchHistory } = await supabase
      .from("search_history")
      .select("query")
      .eq("user_id", user.id)
      .ilike("query", `${escapedQuery}%`)

    // Recent searches (most recent first, deduped)
    const seen = new Set<string>()
    const recentSearches: string[] = []
    for (const row of searchHistory || []) {
      if (!seen.has(row.query)) {
        seen.add(row.query)
        recentSearches.push(row.query)
      }
    }

    // Popular searches (by frequency)
    const freqMap = new Map<string, number>()
    for (const row of searchHistory || []) {
      freqMap.set(row.query, (freqMap.get(row.query) ?? 0) + 1)
    }
    const popularSearches = Array.from(freqMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([q]) => q)

    // Document titles matching prefix
    const { data: documents } = await supabase
      .from("documents")
      .select("title")
      .eq("user_id", user.id)
      .ilike("title", `${escapedQuery}%`)
      .order("created_at", { ascending: false })
      .limit(10)

    // Combine and deduplicate: recency first, then popularity, then titles
    const suggestions = Array.from(
      new Set([...recentSearches, ...popularSearches, ...(documents || []).map((d) => d.title)])
    ).slice(0, limit)

    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error("Search suggestions error:", error)
    return NextResponse.json(
      { error: "Failed to fetch suggestions" },
      { status: 500 }
    )
  }
}