const EMBEDDING_DIMENSIONS = 384

function hashToVector(text: string, dimensions: number = EMBEDDING_DIMENSIONS): number[] {
  const vector: number[] = new Array(dimensions).fill(0)

  const words = text.toLowerCase().split(/\s+/).filter(Boolean)

  for (const word of words) {
    let hash = 0
    for (let i = 0; i < word.length; i++) {
      hash = (hash * 31 + word.charCodeAt(i)) & 0x7fffffff
    }

    const position = hash % dimensions
    vector[position] += 1.0

    for (let i = 0; i < 3; i++) {
      const bigramIdx = (hash * (i + 1)) % dimensions
      vector[bigramIdx] += 0.5 / (i + 1)
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

export function generateEmbedding(text: string): number[] {
  return hashToVector(text)
}

export function generateQueryEmbedding(query: string): number[] {
  return hashToVector(query)
}
