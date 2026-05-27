-- Add saved column to search_history for bookmarking insights
ALTER TABLE search_history ADD COLUMN saved BOOLEAN DEFAULT FALSE;

-- Create index for faster querying of saved searches
CREATE INDEX idx_search_history_saved ON search_history(user_id, saved) WHERE saved = TRUE;