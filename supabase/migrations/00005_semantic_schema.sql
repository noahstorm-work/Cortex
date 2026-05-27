-- Upgrade embedding dimension from 384 to 1536 for OpenAI text-embedding-3-small
-- Drop old index first (depends on the column type)
DROP INDEX IF EXISTS chunks_embedding_idx;

-- Alter the vector column dimension
ALTER TABLE chunks ALTER COLUMN embedding TYPE VECTOR(1536);

-- Recreate index with appropriate list count for higher dimensions
CREATE INDEX IF NOT EXISTS chunks_embedding_idx
  ON chunks
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 200);

-- Update the match_chunks function signature and query
CREATE OR REPLACE FUNCTION match_chunks(
  query_embedding VECTOR(1536),
  match_threshold FLOAT,
  match_count INT,
  user_id UUID
)
RETURNS TABLE(
  id UUID,
  document_id UUID,
  document_title TEXT,
  content TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.document_id,
    d.title AS document_title,
    c.content,
    1 - (c.embedding <=> query_embedding) AS similarity
  FROM chunks c
  JOIN documents d ON c.document_id = d.id
  WHERE d.user_id = match_chunks.user_id
    AND 1 - (c.embedding <=> query_embedding) > match_threshold
  ORDER BY c.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Drop unused text_search_chunks function (app uses its own ILIKE fallback)
DROP FUNCTION IF EXISTS text_search_chunks;
