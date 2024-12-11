-- Create tables
CREATE TABLE IF NOT EXISTS public.memes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    image_url TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    creator TEXT NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.memes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow anonymous insert" ON public.memes
    FOR INSERT
    TO anon
    WITH CHECK (true);

CREATE POLICY "Allow anonymous select" ON public.memes
    FOR SELECT
    TO anon
    USING (true);

-- Create storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('memes', 'memes', true)
ON CONFLICT DO NOTHING;

-- Allow public access to storage bucket
CREATE POLICY "Allow public access to memes bucket" ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id = 'memes');

-- Allow anonymous uploads to storage bucket
CREATE POLICY "Allow anonymous uploads to memes bucket" ON storage.objects
    FOR INSERT
    TO anon
    WITH CHECK (bucket_id = 'memes');