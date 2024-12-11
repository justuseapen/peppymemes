-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view memes" ON public.memes;
DROP POLICY IF EXISTS "Authenticated users can insert memes" ON public.memes;

-- Ensure required columns exist with proper defaults
ALTER TABLE public.memes
    ALTER COLUMN creator SET DEFAULT 'Anonymous',
    ALTER COLUMN user_id DROP NOT NULL;

-- Update any NULL creators
UPDATE public.memes
SET creator = 'Anonymous'
WHERE creator IS NULL;

-- Create new policies with proper checks
CREATE POLICY "Public read access to memes"
    ON public.memes
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Authenticated users can insert their own memes"
    ON public.memes
    FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = user_id AND
        creator IS NOT NULL AND
        image_url IS NOT NULL AND
        title IS NOT NULL
    );