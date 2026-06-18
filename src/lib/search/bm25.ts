import { generateQueryEmbedding } from "@/lib/embeddings"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { logger } from "@/lib/logger"

/** Row shape returned by the `match_chunks` Supabase RPC function. */
interface MatchChunksRow {
  id: string
  document_id: string
  document_title: string
  content: string
  similarity: number
}

/** Row shape returned by the text fallback search query. */
interface TextFallbackRow {
  id: string
  document_id: string
  content: string
  documents: { title: string; user_id: string; project_id: string | null }[]
}

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
    match_threshold: 0.7,
    match_count: topK,
    user_id: userId,
  })

  const { data, error } = await queryBuilder

  if (error) {
    logger.error("Vector search error", { error })
    return textFallbackSearch(query, userId, options)
  }

  let results = (data || []) as MatchChunksRow[]

  if (options?.project_id) {
    results = results.filter((r) => r.document_id)
    const docIds = results.map((r) => r.document_id)
    if (docIds.length > 0) {
      const { data: docs } = await supabase
        .from("documents")
        .select("id")
        .eq("project_id", options.project_id)
        .in("id", docIds)

      const validDocIds = new Set((docs || []).map((d) => d.id))
      results = results.filter((r) => validDocIds.has(r.document_id))
    } else {
      results = []
    }
  }

  if (results.length > 0) {
    return results.map((r) => ({
      chunk_id: r.id,
      document_id: r.document_id,
      document_title: r.document_title,
      content: r.content,
      score: r.similarity,
    }))
  }

  return textFallbackSearch(query, userId, options)
}

export function escapeLike(value: string): string {
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

  const typed = data as TextFallbackRow[]
  return typed.map((r) => ({
    chunk_id: r.id,
    document_id: r.document_id,
    document_title: r.documents[0]?.title ?? "",
    content: r.content,
    score: 1.0,
  }))
}
