export interface Document {
  id: string
  user_id: string
  title: string
  file_url: string
  file_type: string
  created_at: string
}

export interface Chunk {
  id: string
  document_id: string
  content: string
  embedding: number[]
  created_at: string
}

export interface SearchResult {
  chunk_id: string
  document_id: string
  document_title: string
  content: string
  similarity: number
}

export interface SearchResponse {
  summary: string
  key_points: string[]
  references: {
    document_title: string
    content: string
    similarity: number
  }[]
}
