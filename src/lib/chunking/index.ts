const CHUNK_SIZE = 400
const CHUNK_OVERLAP = 50

function countTokens(text: string): number {
  return text.split(/\s+/).filter(Boolean).length
}

function splitIntoChunks(text: string): string[] {
  const words = text.split(/\s+/).filter(Boolean)
  const chunks: string[] = []
  let start = 0

  while (start < words.length) {
    const end = Math.min(start + CHUNK_SIZE, words.length)
    chunks.push(words.slice(start, end).join(" "))
    start += CHUNK_SIZE - CHUNK_OVERLAP
  }

  return chunks
}

export function chunkText(rawText: string): string[] {
  const cleaned = rawText
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()

  if (!cleaned) return []

  const estimatedTokens = countTokens(cleaned)

  if (estimatedTokens <= CHUNK_SIZE) {
    return [cleaned]
  }

  return splitIntoChunks(cleaned)
}

