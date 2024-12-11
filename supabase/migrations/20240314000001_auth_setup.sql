-- Update memes table to reference auth.users
ALTER TABLE public.memes
    ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Update RLS policies
DROP POLICY IF EXISTS "Allow anonymous insert" ON public.memes;
DROP POLICY IF EXISTS "Allow anonymous select" ON public.memes;

-- Anyone can view memes
CREATE POLICY "Allow public select" ON public.memes
    FOR SELECT
    TO public
    USING (true);

-- Only authenticated users can insert
CREATE POLICY "Allow authenticated insert" ON public.memes
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Update storage policies
DROP POLICY IF EXISTS "Allow anonymous uploads to memes bucket" ON storage.objects;

CREATE POLICY "Allow authenticated uploads to memes bucket" ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'memes' AND auth.uid()::text = (storage.foldername(name))[1]);