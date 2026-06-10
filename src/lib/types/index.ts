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

export interface SearchReference {
  document_title: string
  document_id: string
  content: string
  excerpt: string
  score: number
  relevance: "high" | "medium" | "low"
}

export interface SearchResponse {
  query: string
  summary: string
  key_points: string[]
  references: SearchReference[]
  total_chunks?: number
  ai_generated: boolean
  processing_documents?: boolean
}

export interface SearchHistoryItem {
  id: string
  query: string
  result_summary: string | null
  source_count: number | null
  created_at: string
  saved?: boolean
}
