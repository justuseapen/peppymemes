-- Add name column to api_keys
ALTER TABLE api_keys ADD COLUMN name TEXT NOT NULL;

-- Drop existing RLS policies
DROP POLICY IF EXISTS "Users can view their own API keys" ON api_keys;
DROP POLICY IF EXISTS "Users can create their own API keys" ON api_keys;
DROP POLICY IF EXISTS "Users can delete their own API keys" ON api_keys;

-- Create new RLS policies
CREATE POLICY "Users can view their own API keys"
ON api_keys FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own API keys"
ON api_keys FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own API keys"
ON api_keys FOR DELETE
USING (auth.uid() = user_id);
