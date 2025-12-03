-- Create oauth_connections table to store per-user OAuth tokens
CREATE TABLE IF NOT EXISTS oauth_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL, -- e.g. 'google_drive', 'github', etc.
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  scopes TEXT[],
  provider_user_id TEXT,
  provider_user_email TEXT,
  connected_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, provider)
);

-- Enable RLS
ALTER TABLE oauth_connections ENABLE ROW LEVEL SECURITY;

-- RLS Policies - users can only see their own connections
CREATE POLICY "Users can view their own OAuth connections"
  ON oauth_connections
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own OAuth connections"
  ON oauth_connections
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own OAuth connections"
  ON oauth_connections
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own OAuth connections"
  ON oauth_connections
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX oauth_connections_user_provider_idx ON oauth_connections(user_id, provider);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_oauth_connections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER oauth_connections_updated_at
  BEFORE UPDATE ON oauth_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_oauth_connections_updated_at();
