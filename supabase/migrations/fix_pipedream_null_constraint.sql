-- Fix the unique constraint for pipedream_data_sources to properly handle NULL chat_id
-- PostgreSQL doesn't consider NULL values equal in unique constraints, so we need a partial index

-- First, drop the existing constraint if it exists
ALTER TABLE pipedream_data_sources DROP CONSTRAINT IF EXISTS pipedream_data_sources_user_id_chat_id_app_slug_key;

-- Create a unique constraint for rows WITH a chat_id
CREATE UNIQUE INDEX IF NOT EXISTS pipedream_data_sources_with_chat_unique
  ON pipedream_data_sources(user_id, chat_id, app_slug)
  WHERE chat_id IS NOT NULL;

-- Create a unique constraint for rows WITHOUT a chat_id (global data sources)
CREATE UNIQUE INDEX IF NOT EXISTS pipedream_data_sources_without_chat_unique
  ON pipedream_data_sources(user_id, app_slug)
  WHERE chat_id IS NULL;

-- Make api_key nullable since we use Pipedream Connect tokens now
ALTER TABLE pipedream_connections ALTER COLUMN api_key DROP NOT NULL;
