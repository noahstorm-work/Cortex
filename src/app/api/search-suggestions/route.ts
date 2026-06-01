import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/supabase/auth-helper"
import { checkRateLimit, SEARCH_RATE_LIMIT } from "@/lib/rate-limit"

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown"
  const { allowed } = checkRateLimit(`search-suggestions:${ip}`, SEARCH_RATE_LIMIT)
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

  // We'll define a simple schema for the request
  const { query, limit = 5 } = body as { query: string; limit?: number }

  if (typeof query !== "string") {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 })
  }

  const trimmedQuery = query.trim()
  if (trimmedQuery.length < 2) {
    return NextResponse.json({ suggestions: [] })
  }

  try {
    // Get recent searches matching the query prefix (case-insensitive)
    const { data: recentSearches } = await supabase
      .from("search_history")
      .select("query")
      .eq("user_id", user.id)
      .ilike("query", `${trimmedQuery}%`)
      .order("created_at", { ascending: false })
      .limit(10)

    // Get popular searches (frequency-based) matching prefix
    // We'll do a simple aggregation: count occurrences of each query that matches prefix
    const { data: popularSearchesRaw } = await supabase
      .from("search_history")
      .select("query")
      .eq("user_id", user.id)
      .ilike("query", `${trimmedQuery}%`)

    // Process popular searches: count frequencies
    const popularMap = new Map<string, number>()
    for (const row of popularSearchesRaw || []) {
      const q = row.query
      popularMap.set(q, (popularMap.get(q) ?? 0) + 1)
    }
    const popularSearches = Array.from(popularMap.entries())
      .sort((a, b) => b[1] - a[1]) // descending by count
      .map(([query]) => query)
      .slice(0, 10)

    // Get document titles matching prefix
    const { data: documents } = await supabase
      .from("documents")
      .select("title")
      .eq("user_id", user.id)
      .ilike("title", `${trimmedQuery}%`)
      .order("created_at", { ascending: false })
      .limit(10)

    // Combine and deduplicate suggestions
    const suggestionsSet = new Set<string>()

    // Add recent searches (prioritize recency)
    for (const row of recentSearches || []) {
      suggestionsSet.add(row.query)
    }
    // Add popular searches
    for (const q of popularSearches) {
      suggestionsSet.add(q)
    }
    // Add document titles
    for (const doc of documents || []) {
      suggestionsSet.add(doc.title)
    }

    // Convert to array and limit
    const suggestions = Array.from(suggestionsSet).slice(0, limit)

    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error("Search suggestions error:", error)
    return NextResponse.json(
      { error: "Failed to fetch suggestions" },
      { status: 500 }
    )
  }
}