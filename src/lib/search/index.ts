import type { SearchResult, SearchResponse } from "@/lib/types"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { generateQueryEmbedding } from "@/lib/embeddings"

export async function semanticSearch(
  query: string,
  userId: string,
  topK: number = 5
): Promise<SearchResult[]> {
  const supabase = await createServerSupabaseClient()
  const queryEmbedding = generateQueryEmbedding(query)

  const { data, error } = await supabase.rpc("match_chunks", {
    query_embedding: queryEmbedding,
    match_threshold: 0.01,
    match_count: topK,
    user_id: userId,
  })

  if (error) {
    console.error("Vector search error:", error)
    return textFallbackSearch(query, userId, supabase, topK)
  }

  if (data && data.length > 0) return data

  return textFallbackSearch(query, userId, supabase, topK)
}

async function textFallbackSearch(
  query: string,
  userId: string,
  supabase: any,
  topK: number = 5
): Promise<SearchResult[]> {
  const words = query.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return []

  const { data, error } = await supabase
    .from("chunks")
    .select("id, document_id, content, documents!inner(title, user_id)")
    .eq("documents.user_id", userId)
    .or(words.map((w) => `content.ilike.%${w}%`).join(","))
    .limit(topK)

  if (error) {
    console.error("Text fallback error:", error)
    return []
  }

  if (data && data.length > 0) {
    return data.map((r: any) => ({
      chunk_id: r.id,
      document_id: r.document_id,
      document_title: r.documents.title,
      content: r.content,
      similarity: 1.0,
    }))
  }

  return []
}

export function buildResponse(results: SearchResult[]): SearchResponse {
  if (results.length === 0) {
    return {
      summary: "No relevant documents found for your query.",
      key_points: [],
      references: [],
    }
  }

  const allText = results.map((r) => r.content).join(" ")

  const sentences = allText
    .split(/[.?!]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 30)

  const keyTopics = extractKeyTopics(sentences, 5)

  const summary = sentences.length > 0
    ? [sentences[0], ...keyTopics.slice(0, 3)].join(". ") + "."
    : "Summary could not be generated."

  return {
    summary,
    key_points: keyTopics,
    references: results.map((r) => ({
      document_title: r.document_title,
      content: r.content,
      similarity: r.similarity,
    })),
  }
}

function extractKeyTopics(sentences: string[], count: number): string[] {
  const wordFreq: Record<string, number> = {}
  const stopWords = new Set([
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to",
    "for", "of", "with", "by", "is", "are", "was", "were", "be",
    "been", "being", "have", "has", "had", "do", "does", "did",
    "will", "would", "can", "could", "should", "may", "might",
    "this", "that", "these", "those", "it", "its", "they", "them",
    "we", "our", "you", "your", "he", "she", "his", "her",
  ])

  for (const sentence of sentences) {
    const words = sentence.toLowerCase().split(/\s+/).filter(Boolean)
    for (const word of words) {
      if (!stopWords.has(word) && word.length > 3) {
        wordFreq[word] = (wordFreq[word] || 0) + 1
      }
    }
  }

  const ranked = Object.entries(wordFreq)
    .sort(([, a], [, b]) => b - a)
    .slice(0, count * 2)

  const scored = sentences
    .map((s) => ({
      sentence: s,
      score: ranked.reduce(
        (sum, [word]) =>
          sum + (s.toLowerCase().includes(word) ? 1 : 0),
        0
      ),
    }))
    .sort((a, b) => b.score - a.score)

  return scored.slice(0, count).map((s) => s.sentence.trim())
}
