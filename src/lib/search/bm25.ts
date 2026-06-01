import { generateQueryEmbedding } from "@/lib/embeddings"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export interface ScoredChunk {
  chunk_id: string
  document_id: string
  document_title: string
  content: string
  score: number
}

export interface SearchOptions {
  project_id?: string
}

export async function vectorSearch(
  query: string,
  userId: string,
  options?: SearchOptions,
  topK: number = 5
): Promise<ScoredChunk[]> {
  const queryEmbedding = await generateQueryEmbedding(query)
  const supabase = await createServerSupabaseClient()

  let queryBuilder = supabase.rpc("match_chunks", {
    query_embedding: queryEmbedding,
    match_threshold: 0.1,
    match_count: topK,
    user_id: userId,
  })

  const { data, error } = await queryBuilder

  if (error) {
    console.error("Vector search error:", error)
    return textFallbackSearch(query, userId, options)
  }

  let results = data || []

  if (options?.project_id) {
    results = results.filter((r: any) => r.document_id)
    const docIds = results.map((r: any) => r.document_id)
    if (docIds.length > 0) {
      const { data: docs } = await supabase
        .from("documents")
        .select("id")
        .eq("project_id", options.project_id)
        .in("id", docIds)

      const validDocIds = new Set((docs || []).map((d) => d.id))
      results = results.filter((r: any) => validDocIds.has(r.document_id))
    } else {
      results = []
    }
  }

  if (results.length > 0) {
    return results.map((r: any) => ({
      chunk_id: r.id,
      document_id: r.document_id,
      document_title: r.document_title,
      content: r.content,
      score: r.similarity,
    }))
  }

  return textFallbackSearch(query, userId, options)
}

function escapeLike(value: string): string {
  return value.replace(/[%_]/g, "\\$&")
}

async function textFallbackSearch(
  query: string,
  userId: string,
  options?: SearchOptions,
  topK: number = 5
): Promise<ScoredChunk[]> {
  const words = query.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return []

  const supabase = await createServerSupabaseClient()

  let queryBuilder = supabase
    .from("chunks")
    .select("id, document_id, content, documents!inner(title, user_id, project_id)")
    .eq("documents.user_id", userId)
    .or(words.map((w) => `content.ilike.%${escapeLike(w)}%`).join(","))
    .limit(topK)

  if (options?.project_id) {
    queryBuilder = queryBuilder.eq("documents.project_id", options.project_id)
  }

  const { data, error } = await queryBuilder

  if (error || !data || data.length === 0) return []

  return data.map((r: any) => ({
    chunk_id: r.id,
    document_id: r.document_id,
    document_title: r.documents.title,
    content: r.content,
    score: 1.0,
  }))
}
