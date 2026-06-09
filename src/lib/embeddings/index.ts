import { generateGroqEmbedding, generateGroqEmbeddings, getGroqKey } from "./groq"

const HASH_DIMENSIONS = 384

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

export function isEmbedderFallback(): boolean {
  return !getGroqKey()
}

export async function generateEmbedding(text: string): Promise<number[]> {
  if (getGroqKey()) {
    return generateGroqEmbedding(text)
  }
  return hashToVector(text, HASH_DIMENSIONS)
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  if (getGroqKey()) {
    return generateGroqEmbeddings(texts)
  }
  return texts.map((t) => hashToVector(t, HASH_DIMENSIONS))
}

export const generateQueryEmbedding = generateEmbedding
