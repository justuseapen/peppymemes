-- Drop existing policies
DROP POLICY IF EXISTS "Allow public select" ON public.memes;
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.memes;

-- Anyone can view memes
CREATE POLICY "Allow public select" ON public.memes
    FOR SELECT
    TO public
    USING (true);

-- Only authenticated users can insert with their user_id
CREATE POLICY "Allow authenticated insert" ON public.memes
    FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = user_id AND
        user_id IS NOT NULL
    );

-- Update storage policies to be more permissive with paths
DROP POLICY IF EXISTS "Allow authenticated uploads to memes bucket" ON storage.objects;

CREATE POLICY "Allow authenticated uploads to memes bucket" ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'memes' AND
        auth.uid() IS NOT NULL
    );