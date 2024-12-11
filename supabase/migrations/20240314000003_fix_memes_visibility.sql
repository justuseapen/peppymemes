-- Drop existing policies
DROP POLICY IF EXISTS "Allow public select" ON public.memes;
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.memes;

-- Anyone can view memes (including those without user_id)
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

-- Make user_id nullable to support existing memes
ALTER TABLE public.memes
    ALTER COLUMN user_id DROP NOT NULL;

-- Update existing memes to have a valid creator field if missing
UPDATE public.memes
SET creator = 'Anonymous'
WHERE creator IS NULL;