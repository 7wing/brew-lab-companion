-- Create the follows table for asymmetric follow/unfollow relationships
CREATE TABLE IF NOT EXISTS follows (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  followed_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT now(),

  -- Prevent duplicate follows and self-follows
  CONSTRAINT no_self_follow CHECK (follower_id != followed_id),
  CONSTRAINT unique_follow  UNIQUE (follower_id, followed_id)
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_followed ON follows(followed_id);

-- Enable Row Level Security
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- Allow anyone to see follows (needed for public follower/following counts)
CREATE POLICY "Follows are viewable by everyone" ON follows
  FOR SELECT USING (true);

-- Allow authenticated users to insert their own follows
CREATE POLICY "Users can create their own follows" ON follows
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

-- Allow authenticated users to delete their own follows
CREATE POLICY "Users can delete their own follows" ON follows
  FOR DELETE USING (auth.uid() = follower_id);
