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
    match_threshold: 0.1,
    match_count: topK,
    user_id: userId,
  })

  if (error) {
    console.error("Search error:", error)
    return []
  }

  return (data || []).map((row: any) => ({
    chunk_id: row.id,
    document_id: row.document_id,
    document_title: row.document_title,
    content: row.content,
    similarity: row.similarity,
  }))
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
