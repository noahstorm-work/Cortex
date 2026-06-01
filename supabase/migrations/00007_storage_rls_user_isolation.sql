-- Fix storage bucket policies to enforce user-id isolation
-- Previously, any authenticated user could access any file in the documents bucket.
-- Files are stored as {user_id}/{uuid}.{ext}, so we check that the path starts with the user's own ID.

DO $$
BEGIN
  -- Drop overly permissive policies
  DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
  DROP POLICY IF EXISTS "Allow authenticated selects" ON storage.objects;
  DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;

  -- Re-create with user isolation
  -- Users can only upload to their own directory
  CREATE POLICY "Users can upload their own documents"
    ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (
      bucket_id = 'documents'
      AND (storage.objects.name LIKE (auth.uid()::text || '/%'))
    );

  -- Users can only read from their own directory
  CREATE POLICY "Users can read their own documents"
    ON storage.objects FOR SELECT TO authenticated
    USING (
      bucket_id = 'documents'
      AND (storage.objects.name LIKE (auth.uid()::text || '/%'))
    );

  -- Users can only delete from their own directory
  CREATE POLICY "Users can delete their own documents"
    ON storage.objects FOR DELETE TO authenticated
    USING (
      bucket_id = 'documents'
      AND (storage.objects.name LIKE (auth.uid()::text || '/%'))
    );
END;
$$;
