import type { ScoredChunk } from "./bm25"
import type { SearchResponse } from "@/lib/types"
import { generateAISummary } from "./summarize"

export function buildExcerpt(content: string, maxLen: number = 200): string {
  if (content.length <= maxLen) return content
  const truncated = content.slice(0, maxLen)
  const lastSpace = truncated.lastIndexOf(" ")
  return (lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated) + "..."
}

export function getRelevanceLabel(score: number): "high" | "medium" | "low" {
  if (score >= 0.7) return "high"
  if (score >= 0.4) return "medium"
  return "low"
}

export function extractiveKeyPoints(sentences: string[], count: number): string[] {
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
        0,
      ),
    }))
    .sort((a, b) => b.score - a.score)

  return scored.slice(0, count).map((s) => s.sentence.trim())
}

export async function buildResponse(
  query: string,
  results: ScoredChunk[],
): Promise<SearchResponse> {
  if (results.length === 0) {
    return {
      query,
      summary: "No relevant documents found for your query.",
      key_points: [],
      references: [],
      ai_generated: false,
    }
  }

  const allText = results.map((r) => r.content).join(" ")

  const sentences = allText
    .split(/[.?!]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 30)

  const aiResult = await generateAISummary(query, results)

  const keyPoints =
    aiResult?.key_points.length
      ? aiResult.key_points
      : extractiveKeyPoints(sentences, 5)

  const summary =
    aiResult?.summary ||
    (sentences.length > 0
      ? sentences.slice(0, 3).join(". ") + "."
      : "Summary could not be generated from the retrieved content.")

  return {
    query,
    summary,
    key_points: keyPoints,
    total_chunks: results.length,
    ai_generated: !!aiResult,
    references: results.map((r) => ({
      document_title: r.document_title,
      document_id: r.document_id,
      content: r.content,
      excerpt: buildExcerpt(r.content),
      score: Math.round(r.score * 100) / 100,
      relevance: getRelevanceLabel(r.score),
    })),
  }
}
