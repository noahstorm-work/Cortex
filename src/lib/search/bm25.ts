import { tokenize } from "./tokenize"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export interface ScoredChunk {
  chunk_id: string
  document_id: string
  document_title: string
  content: string
  score: number
}

const K1 = 1.5
const B = 0.75

export async function bm25Search(
  query: string,
  userId: string,
  topK: number = 5
): Promise<ScoredChunk[]> {
  const queryTerms = tokenize(query)
  if (queryTerms.length === 0) return []

  const supabase = await createServerSupabaseClient()

  const { data: chunks, error } = await supabase
    .from("chunks")
    .select("id, document_id, content, documents!inner(title, user_id)")
    .eq("documents.user_id", userId)

  if (error || !chunks || chunks.length === 0) return []

  const docs = chunks.map((c: any) => ({
    id: c.id,
    docId: c.document_id,
    title: c.documents.title,
    content: c.content,
    tokens: tokenize(c.content),
  }))

  const avgDocLen =
    docs.reduce((sum, d) => sum + d.tokens.length, 0) / docs.length

  const docCount = docs.length
  const df: Map<string, number> = new Map()

  for (const term of queryTerms) {
    let count = 0
    for (const doc of docs) {
      if (doc.tokens.includes(term)) count++
    }
    df.set(term, count)
  }

  const scored: ScoredChunk[] = docs.map((doc) => {
    const docLen = doc.tokens.length
    let score = 0

    for (const term of queryTerms) {
      const tf = doc.tokens.filter((t) => t === term).length
      if (tf === 0) continue

      const nq = df.get(term) || 1
      const idf = Math.log(
        (docCount - nq + 0.5) / (nq + 0.5) + 1
      )

      score +=
        idf *
        ((tf * (K1 + 1)) / (tf + K1 * (1 - B + B * (docLen / avgDocLen))))
    }

    return {
      chunk_id: doc.id,
      document_id: doc.docId,
      document_title: doc.title,
      content: doc.content,
      score,
    }
  })

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
}
