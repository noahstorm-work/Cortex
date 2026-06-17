/**
 * Document chunking module.
 *
 * Splits long text content into fixed-size overlapping chunks suitable for
 * vector embedding and storage. Each chunk targets approximately 400 words
 * with a 50-word overlap to preserve context across chunk boundaries.
 */

/** Target chunk size in words. */
const CHUNK_SIZE = 400
/** Overlap between consecutive chunks in words. */
const CHUNK_OVERLAP = 50

/**
 * Counts the number of tokens (words) in a string.
 *
 * @param text - Input text to tokenize
 * @returns The number of whitespace-separated words
 */
function countTokens(text: string): number {
  return text.split(/\s+/).filter(Boolean).length
}

/**
 * Splits text into overlapping chunks at the word boundary.
 *
 * @param text - Pre-cleaned text to split
 * @returns Array of text chunks, each up to {@link CHUNK_SIZE} words
 */
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

/**
 * Splits raw document text into overlapping chunks for embedding.
 *
 * Normalizes whitespace, then either returns the text as a single chunk
 * (if short enough) or splits it into overlapping windows of ~400 words.
 *
 * @param rawText - Raw extracted text from a document
 * @returns Array of text chunks (empty if input is blank)
 *
 * @example
 * ```ts
 * const chunks = chunkText(longDocument)
 * console.log(chunks.length) // e.g. 5
 * // Each chunk is ~400 words with 50-word overlap
 * ```
 */
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
