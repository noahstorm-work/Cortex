-- Search history table
CREATE TABLE IF NOT EXISTS search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  result_summary TEXT,
  source_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'search_history' AND policyname = 'Users can manage their own search history'
  ) THEN
    CREATE POLICY "Users can manage their own search history"
      ON search_history
      USING (user_id = auth.uid());
  END IF;
END;
$$;

CREATE INDEX IF NOT EXISTS search_history_user_id_idx
  ON search_history (user_id, created_at DESC);
