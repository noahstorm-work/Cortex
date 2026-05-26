export function tokenize(text: string): string[] {
  const stopWords = new Set([
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to",
    "for", "of", "with", "by", "is", "are", "was", "were", "be",
    "been", "being", "have", "has", "had", "do", "does", "did",
    "will", "would", "can", "could", "should", "may", "might",
    "this", "that", "these", "those", "it", "its", "they", "them",
    "we", "our", "you", "your", "he", "she", "his", "her",
    "i", "me", "my", "myself", "am", "not", "no", "nor", "so",
    "if", "then", "than", "too", "very", "just", "about", "up",
    "out", "also", "more", "any", "now", "each", "all", "some",
    "such", "only", "own", "same", "into", "over", "after",
  ])

  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !stopWords.has(w))
}
