import type { ScoredChunk } from "./bm25"

export interface SearchResponse {
  summary: string
  key_points: string[]
  references: {
    document_title: string
    content: string
    score: number
  }[]
  processing_documents?: boolean
}

export function buildResponse(results: ScoredChunk[]): SearchResponse {
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

  const keyPoints = extractKeyPoints(sentences, 5)

  const summary = sentences.length > 0
    ? [sentences[0], ...keyPoints.slice(0, 3)].join(". ") + "."
    : "Summary could not be generated."

  return {
    summary,
    key_points: keyPoints,
    references: results.map((r) => ({
      document_title: r.document_title,
      content: r.content,
      score: Math.round(r.score * 100) / 100,
    })),
  }
}

function extractKeyPoints(sentences: string[], count: number): string[] {
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
