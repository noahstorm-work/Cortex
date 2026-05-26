export interface Document {
  id: string
  user_id: string
  title: string
  file_url: string
  file_type: string
  created_at: string
}

export interface SearchResponse {
  summary: string
  key_points: string[]
  references: {
    document_title: string
    content: string
    score: number
  }[]
}
