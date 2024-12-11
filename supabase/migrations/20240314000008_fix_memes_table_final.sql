-- Drop existing policies
DROP POLICY IF EXISTS "Public read access to memes" ON public.memes;
DROP POLICY IF EXISTS "Authenticated users can insert their own memes" ON public.memes;

-- Ensure memes table has correct structure
ALTER TABLE public.memes
    ALTER COLUMN creator SET DEFAULT 'Anonymous',
    ALTER COLUMN user_id DROP NOT NULL;

-- Create new policies
CREATE POLICY "Anyone can view memes"
    ON public.memes
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Authenticated users can create memes"
    ON public.memes
    FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = user_id
    );

-- Grant necessary permissions
GRANT SELECT ON public.memes TO anon;
GRANT SELECT, INSERT ON public.memes TO authenticated;