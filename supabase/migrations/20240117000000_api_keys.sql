-- Create API keys table
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT NOT NULL UNIQUE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    tier TEXT NOT NULL CHECK (tier IN ('free', 'developer', 'enterprise')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true
);

-- Create API key usage table
CREATE TABLE api_key_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    api_key_id UUID NOT NULL REFERENCES api_keys(id),
    date DATE NOT NULL,
    request_count INTEGER DEFAULT 0,
    UNIQUE(api_key_id, date)
);

-- Create index for faster lookups
CREATE INDEX idx_api_keys_key ON api_keys(key);
CREATE INDEX idx_api_key_usage_date ON api_key_usage(api_key_id, date);

-- Create RLS policies
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_key_usage ENABLE ROW LEVEL SECURITY;

-- Only allow users to see their own API keys
CREATE POLICY "Users can view their own API keys"
    ON api_keys FOR SELECT
    USING (auth.uid() = user_id);

-- Only allow users to view their own API key usage
CREATE POLICY "Users can view their own API key usage"
    ON api_key_usage FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM api_keys
            WHERE api_keys.id = api_key_usage.api_key_id
            AND api_keys.user_id = auth.uid()
        )
    );
