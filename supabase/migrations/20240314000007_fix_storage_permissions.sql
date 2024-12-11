-- Drop existing storage policies
DROP POLICY IF EXISTS "Public read access to memes bucket" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload to their folder" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads to memes bucket" ON storage.objects;

-- Ensure bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('memes', 'memes', true)
ON CONFLICT (id) DO UPDATE
SET public = true;

-- Create new storage policies
CREATE POLICY "Public read access to memes bucket"
    ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id = 'memes');

CREATE POLICY "Authenticated users can upload to memes bucket"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'memes' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

-- Grant necessary permissions
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;