import { getOpenAIKey } from "@/lib/embeddings/openai"
import type { ScoredChunk } from "./bm25"

interface SummaryResult {
  summary: string
  key_points: string[]
}

export async function generateAISummary(
  query: string,
  chunks: ScoredChunk[],
): Promise<SummaryResult | null> {
  const key = getOpenAIKey()
  if (!key) return null

  const context = chunks
    .map(
      (c, i) =>
        `[Source ${i + 1}] From "${c.document_title}":\n${c.content}`,
    )
    .join("\n\n")

  const systemPrompt = `You are a precise document analysis assistant. Answer based ONLY on the provided context.`

  const userPrompt = `Context:
${context}

Question: ${query}

Provide:
1. A concise 2-3 sentence summary answering the question based on the context
2. 3-5 key bullet points extracted from the context

Format your response as:
SUMMARY:
<summary text>

KEY POINTS:
- point 1
- point 2
- point 3`

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    }),
  })

  if (!res.ok) return null

  const json = await res.json()
  const text = json.choices?.[0]?.message?.content
  if (!text) return null

  return parseSummary(text)
}

function parseSummary(text: string): SummaryResult {
  const summaryMatch = text.match(/SUMMARY:\s*([\s\S]*?)(?=\nKEY POINTS:)/)
  const pointsMatch = text.match(/KEY POINTS:\s*([\s\S]*)$/)

  const summary = summaryMatch
    ? summaryMatch[1].trim()
    : text.split("\n")[0]

  const key_points = pointsMatch
    ? pointsMatch[1]
        .split("\n")
        .map((l) => l.replace(/^[-*]\s*/, "").trim())
        .filter(Boolean)
    : []

  return { summary, key_points }
}
