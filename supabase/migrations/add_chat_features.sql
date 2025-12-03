-- Add chat feature settings to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS web_search_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS extended_thinking_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS google_drive_connected BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS dropbox_connected BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS onedrive_connected BOOLEAN DEFAULT false;

-- Add comment explaining the columns
COMMENT ON COLUMN profiles.web_search_enabled IS 'Whether to use Brave web search for all queries (default: true)';
COMMENT ON COLUMN profiles.extended_thinking_enabled IS 'Whether to enable extended thinking mode';
COMMENT ON COLUMN profiles.google_drive_connected IS 'Whether Google Drive is connected as a document source';
COMMENT ON COLUMN profiles.dropbox_connected IS 'Whether Dropbox is connected as a document source';
COMMENT ON COLUMN profiles.onedrive_connected IS 'Whether OneDrive is connected as a document source';
