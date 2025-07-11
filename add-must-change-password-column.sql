-- Add must_change_password column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT TRUE;

-- Update existing users to not require password change (except new ones)
-- Luis and other existing users don't need to change password
UPDATE users 
SET must_change_password = FALSE 
WHERE email = 'luis.ribeiro@beachpark.com.br';

-- Update other existing users to not require password change
UPDATE users 
SET must_change_password = FALSE 
WHERE password_hash IS NOT NULL AND created_at < NOW() - INTERVAL '1 day';

-- Set the default password hash for new users (hash of 'BeachPark@123')
-- This will be done in the application code when creating new users