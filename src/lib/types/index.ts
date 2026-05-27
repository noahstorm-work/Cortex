export interface Document {
  id: string
  user_id: string
  title: string
  file_url: string
  file_type: string
  project_id: string | null
  status: string
  created_at: string
}

export interface Project {
  id: string
  user_id: string
  name: string
  description: string
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
  processing_documents?: boolean
}

export interface SearchHistoryItem {
  id: string
  query: string
  result_summary: string | null
  source_count: number | null
  created_at: string
}
