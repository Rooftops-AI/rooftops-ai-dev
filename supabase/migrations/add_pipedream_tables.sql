-- Create pipedream_connections table to store Pipedream MCP credentials per user
CREATE TABLE IF NOT EXISTS pipedream_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pipedream_project_id TEXT NOT NULL,
  mcp_server_url TEXT NOT NULL,
  api_key TEXT NOT NULL,
  connected_apps JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- Create pipedream_data_sources table to track enabled/disabled sources per chat
CREATE TABLE IF NOT EXISTS pipedream_data_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  app_slug TEXT NOT NULL,
  app_name TEXT NOT NULL,
  app_icon_url TEXT,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, chat_id, app_slug)
);

-- Enable RLS on pipedream_connections
ALTER TABLE pipedream_connections ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pipedream_connections
CREATE POLICY "Users can view their own Pipedream connections"
  ON pipedream_connections
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own Pipedream connections"
  ON pipedream_connections
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own Pipedream connections"
  ON pipedream_connections
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own Pipedream connections"
  ON pipedream_connections
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Enable RLS on pipedream_data_sources
ALTER TABLE pipedream_data_sources ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pipedream_data_sources
CREATE POLICY "Users can view their own Pipedream data sources"
  ON pipedream_data_sources
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own Pipedream data sources"
  ON pipedream_data_sources
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own Pipedream data sources"
  ON pipedream_data_sources
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own Pipedream data sources"
  ON pipedream_data_sources
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for faster lookups
CREATE INDEX pipedream_connections_user_idx ON pipedream_connections(user_id);
CREATE INDEX pipedream_data_sources_user_chat_idx ON pipedream_data_sources(user_id, chat_id);
CREATE INDEX pipedream_data_sources_user_idx ON pipedream_data_sources(user_id);

-- Create updated_at trigger for pipedream_connections
CREATE OR REPLACE FUNCTION update_pipedream_connections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pipedream_connections_updated_at
  BEFORE UPDATE ON pipedream_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_pipedream_connections_updated_at();
