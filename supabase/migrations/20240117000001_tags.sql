-- Create tags table
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    meme_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_tags_name ON tags(name);
CREATE INDEX idx_tags_meme_count ON tags(meme_count DESC);

-- Add tags array to memes table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'memes' AND column_name = 'tags'
    ) THEN
        ALTER TABLE memes ADD COLUMN tags TEXT[] DEFAULT '{}';
    END IF;
END $$;

-- Create function to update tag counts
CREATE OR REPLACE FUNCTION update_tag_counts()
RETURNS TRIGGER AS $$
BEGIN
    -- If tags were removed, decrease count
    IF TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN
        UPDATE tags
        SET meme_count = meme_count - 1
        WHERE name = ANY(OLD.tags);
    END IF;

    -- If tags were added, increase count
    IF TG_OP = 'UPDATE' OR TG_OP = 'INSERT' THEN
        -- Insert new tags if they don't exist
        INSERT INTO tags (name, meme_count)
        SELECT DISTINCT unnest(NEW.tags), 1
        ON CONFLICT (name)
        DO UPDATE SET meme_count = tags.meme_count + 1;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for tag count updates
CREATE TRIGGER meme_tags_changed
    AFTER INSERT OR UPDATE OF tags OR DELETE ON memes
    FOR EACH ROW
    EXECUTE FUNCTION update_tag_counts();
