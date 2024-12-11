-- Drop existing storage policies
DROP POLICY IF EXISTS "Allow public access to memes bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads to memes bucket" ON storage.objects;

-- Create new storage policies
CREATE POLICY "Public read access to memes bucket"
    ON storage.objects
    FOR SELECT
    TO public
    USING (
        bucket_id = 'memes'
    );

CREATE POLICY "Authenticated users can upload to their folder"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'memes' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

-- Ensure storage bucket exists and is public
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT FROM storage.buckets WHERE id = 'memes'
    ) THEN
        INSERT INTO storage.buckets (id, name, public)
        VALUES ('memes', 'memes', true);
    END IF;
END $$;