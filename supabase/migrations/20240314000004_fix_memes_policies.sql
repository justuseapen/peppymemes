-- Drop existing policies
DROP POLICY IF EXISTS "Allow public select" ON public.memes;
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.memes;

-- Make sure the user_id column exists and is nullable
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'memes' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE public.memes ADD COLUMN user_id UUID REFERENCES auth.users(id);
    END IF;
END $$;

ALTER TABLE public.memes
    ALTER COLUMN user_id DROP NOT NULL;

-- Ensure creator column has a default value
ALTER TABLE public.memes
    ALTER COLUMN creator SET DEFAULT 'Anonymous';

-- Update any NULL creators to 'Anonymous'
UPDATE public.memes
SET creator = 'Anonymous'
WHERE creator IS NULL;

-- Create new policies with better visibility rules
CREATE POLICY "Anyone can view memes"
    ON public.memes
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Authenticated users can insert memes"
    ON public.memes
    FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = user_id
    );