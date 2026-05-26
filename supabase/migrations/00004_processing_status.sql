-- Add processing status to documents
ALTER TABLE documents ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending'
  CHECK (status IN ('pending', 'processing', 'ready', 'failed'));

CREATE INDEX IF NOT EXISTS documents_status_idx ON documents (status);
