import { generateGroqEmbedding, generateGroqEmbeddings, getGroqKey } from "./groq"

/** Default dimensionality for hash-based pseudo-embeddings. */
const HASH_DIMENSIONS = 384

/**
 * Generates a deterministic pseudo-embedding vector from text using a hash-based approach.
 *
 * When no external embedding provider (Groq/OpenAI) is configured, this function
 * produces a 384-dimensional unit vector by hashing words and their sub-parts.
 * The result is L2-normalized to produce a unit vector.
 *
 * Note: Hash-based embeddings have much lower quality than neural embeddings.
 * Use only as a fallback when `OPENAI_API_KEY` or `GROQ_API_KEY` is unavailable.
 *
 * @param text - Input text to convert into a vector
 * @param dimensions - Output vector dimensionality (default: 384)
 * @returns An L2-normalized vector of the specified dimensionality
 *
 * @example
 * ```ts
 * const vec = hashToVector("machine learning", 384)
 * console.log(vec.length) // 384
 * ```
 */
export function hashToVector(text: string, dimensions: number = HASH_DIMENSIONS): number[] {
  const vector: number[] = new Array(dimensions).fill(0)
  const words = text.toLowerCase().split(/\s+/).filter(Boolean)

  if (words.length === 0) return vector

  for (const word of words) {
    let hash = 0
    for (let i = 0; i < word.length; i++) {
      hash = (hash * 31 + word.charCodeAt(i)) & 0x7fffffff
    }

    const position = hash % dimensions
    vector[position] += 1.0

    for (let i = 0; i < 3; i++) {
      const ngram = i === 0
        ? word
        : (i === 1 ? word.slice(0, Math.ceil(word.length / 2)) : word.slice(Math.floor(word.length / 2)))
      let ngramHash = 0
      for (let j = 0; j < ngram.length; j++) {
        ngramHash = (ngramHash * 31 + ngram.charCodeAt(j)) & 0x7fffffff
      }
      const ngramIdx = ngramHash % dimensions
      vector[ngramIdx] += 0.5 / (i + 1)
    }
  }

  const magnitude = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0))
  if (magnitude > 0) {
    for (let i = 0; i < vector.length; i++) {
      vector[i] /= magnitude
    }
  }

  return vector
}

/**
 * Checks whether the system is using hash-based fallback embeddings.
 *
 * @returns `true` if no Groq API key is configured, meaning fallback embeddings are in use
 */
export function isEmbedderFallback(): boolean {
  return !getGroqKey()
}

/**
 * Generates an embedding vector for a single text string.
 *
 * If a Groq API key is configured, delegates to the Groq embedding API.
 * Otherwise falls back to the deterministic hash-based approach.
 *
 * @param text - Input text to embed
 * @returns A vector of numbers representing the text in embedding space
 *
 * @example
 * ```ts
 * const vec = await generateEmbedding("hello world")
 * // vec is a 384-dim (hash) or 1024-dim (Groq) vector
 * ```
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  if (getGroqKey()) {
    return generateGroqEmbedding(text)
  }
  return hashToVector(text, HASH_DIMENSIONS)
}

/**
 * Generates embedding vectors for multiple text strings.
 *
 * If a Groq API key is configured, delegates to the Groq batch embedding API.
 * Otherwise maps each text through the hash-based approach.
 *
 * @param texts - Array of input strings to embed
 * @returns Array of embedding vectors, one per input text
 *
 * @example
 * ```ts
 * const vectors = await generateEmbeddings(["hello", "world"])
 * console.log(vectors.length) // 2
 * ```
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  if (getGroqKey()) {
    return generateGroqEmbeddings(texts)
  }
  return texts.map((t) => hashToVector(t, HASH_DIMENSIONS))
}

/** Alias for {@link generateEmbedding} — generates an embedding for a single query string. */
export const generateQueryEmbedding = generateEmbedding
