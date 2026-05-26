import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { search, buildResponse } from "@/lib/search"

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { query, project_id } = await request.json()

  if (!query || typeof query !== "string") {
    return NextResponse.json(
      { error: "query is required" },
      { status: 400 }
    )
  }

  if (query.trim().length < 2) {
    return NextResponse.json(
      { error: "Query must be at least 2 characters" },
      { status: 400 }
    )
  }

  try {
    const results = await search(query, user.id, { project_id: project_id || undefined })
    const response = buildResponse(results)

    return NextResponse.json(response)
  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    )
  }
}
