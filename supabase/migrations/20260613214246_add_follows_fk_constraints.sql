-- Add foreign key constraints from follows to profiles (idempotent)
ALTER TABLE follows
DROP CONSTRAINT IF EXISTS follows_follower_id_fkey;

ALTER TABLE follows
ADD CONSTRAINT follows_follower_id_fkey
FOREIGN KEY (follower_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE follows
DROP CONSTRAINT IF EXISTS follows_followed_id_fkey;

ALTER TABLE follows
ADD CONSTRAINT follows_followed_id_fkey
FOREIGN KEY (followed_id) REFERENCES profiles(id) ON DELETE CASCADE;
