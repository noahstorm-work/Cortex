import { generateQueryEmbedding } from "@/lib/embeddings"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export interface ScoredChunk {
  chunk_id: string
  document_id: string
  document_title: string
  content: string
  score: number
}

export async function vectorSearch(
  query: string,
  userId: string,
  topK: number = 5
): Promise<ScoredChunk[]> {
  const queryEmbedding = await generateQueryEmbedding(query)
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase.rpc("match_chunks", {
    query_embedding: queryEmbedding,
    match_threshold: 0.1,
    match_count: topK,
    user_id: userId,
  })

  if (error) {
    console.error("Vector search error:", error)
    return textFallbackSearch(query, userId)
  }

  if (data && data.length > 0) {
    return data.map((r: any) => ({
      chunk_id: r.id,
      document_id: r.document_id,
      document_title: r.document_title,
      content: r.content,
      score: r.similarity,
    }))
  }

  return textFallbackSearch(query, userId)
}

async function textFallbackSearch(
  query: string,
  userId: string,
  topK: number = 5
): Promise<ScoredChunk[]> {
  const words = query.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return []

  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from("chunks")
    .select("id, document_id, content, documents!inner(title, user_id)")
    .eq("documents.user_id", userId)
    .or(words.map((w) => `content.ilike.%${w}%`).join(","))
    .limit(topK)

  if (error || !data || data.length === 0) return []

  return data.map((r: any) => ({
    chunk_id: r.id,
    document_id: r.document_id,
    document_title: r.documents.title,
    content: r.content,
    score: 1.0,
  }))
}
