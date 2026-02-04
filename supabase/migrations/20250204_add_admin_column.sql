-- Add admin column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Set Steele as admin (replace with your actual user_id)
UPDATE profiles 
SET is_admin = true 
WHERE user_id = 'YOUR_USER_ID_HERE';

-- Verify
SELECT user_id, email, is_admin FROM profiles WHERE is_admin = true;
