-- Enable RLS and add ownership-based policies for all tables (idempotent)

-- profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Profiles are publicly readable" ON profiles;
CREATE POLICY "Profiles are publicly readable" ON profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- recipes
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public recipes are readable by anyone" ON recipes;
CREATE POLICY "Public recipes are readable by anyone" ON recipes FOR SELECT USING (is_public = true OR user_id = auth.uid());
DROP POLICY IF EXISTS "Users can create their own recipes" ON recipes;
CREATE POLICY "Users can create their own recipes" ON recipes FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update their own recipes" ON recipes;
CREATE POLICY "Users can update their own recipes" ON recipes FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete their own recipes" ON recipes;
CREATE POLICY "Users can delete their own recipes" ON recipes FOR DELETE USING (auth.uid() = user_id);

-- batches
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own batches" ON batches;
CREATE POLICY "Users can manage their own batches" ON batches FOR ALL USING (auth.uid() = user_id);

-- readings
ALTER TABLE readings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own readings" ON readings;
CREATE POLICY "Users can manage their own readings" ON readings FOR ALL USING (auth.uid() = user_id);

-- batch_stages
ALTER TABLE batch_stages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage batch stages for their own batches" ON batch_stages;
CREATE POLICY "Users can manage batch stages for their own batches" ON batch_stages FOR ALL USING (
  EXISTS (
    SELECT 1 FROM batches WHERE batches.id = batch_stages.batch_id AND batches.user_id = auth.uid()
  )
);

-- posts
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Posts are publicly readable" ON posts;
CREATE POLICY "Posts are publicly readable" ON posts FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can create their own posts" ON posts;
CREATE POLICY "Users can create their own posts" ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update their own posts" ON posts;
CREATE POLICY "Users can update their own posts" ON posts FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete their own posts" ON posts;
CREATE POLICY "Users can delete their own posts" ON posts FOR DELETE USING (auth.uid() = user_id);

-- post_likes
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Post likes are publicly readable" ON post_likes;
CREATE POLICY "Post likes are publicly readable" ON post_likes FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can like posts" ON post_likes;
CREATE POLICY "Users can like posts" ON post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can unlike posts" ON post_likes;
CREATE POLICY "Users can unlike posts" ON post_likes FOR DELETE USING (auth.uid() = user_id);

-- comments
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Comments are publicly readable" ON comments;
CREATE POLICY "Comments are publicly readable" ON comments FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can create comments" ON comments;
CREATE POLICY "Users can create comments" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update their own comments" ON comments;
CREATE POLICY "Users can update their own comments" ON comments FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete their own comments" ON comments;
CREATE POLICY "Users can delete their own comments" ON comments FOR DELETE USING (auth.uid() = user_id);

-- challenges
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Challenges are publicly readable" ON challenges;
CREATE POLICY "Challenges are publicly readable" ON challenges FOR SELECT USING (true);

-- challenge_entries
ALTER TABLE challenge_entries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Challenge entries are publicly readable" ON challenge_entries;
CREATE POLICY "Challenge entries are publicly readable" ON challenge_entries FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can join challenges" ON challenge_entries;
CREATE POLICY "Users can join challenges" ON challenge_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can leave challenges" ON challenge_entries;
CREATE POLICY "Users can leave challenges" ON challenge_entries FOR DELETE USING (auth.uid() = user_id);

-- tasting_sessions
ALTER TABLE tasting_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Tasting sessions are publicly readable" ON tasting_sessions;
CREATE POLICY "Tasting sessions are publicly readable" ON tasting_sessions FOR SELECT USING (true);
DROP POLICY IF EXISTS "Hosts can manage tasting sessions" ON tasting_sessions;
CREATE POLICY "Hosts can manage tasting sessions" ON tasting_sessions FOR ALL USING (auth.uid() = host_id);

-- tasting_messages
ALTER TABLE tasting_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Tasting messages are publicly readable" ON tasting_messages;
CREATE POLICY "Tasting messages are publicly readable" ON tasting_messages FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can send tasting messages" ON tasting_messages;
CREATE POLICY "Users can send tasting messages" ON tasting_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete their own tasting messages" ON tasting_messages;
CREATE POLICY "Users can delete their own tasting messages" ON tasting_messages FOR DELETE USING (auth.uid() = user_id);

-- tasting_notes
ALTER TABLE tasting_notes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Tasting notes are publicly readable" ON tasting_notes;
CREATE POLICY "Tasting notes are publicly readable" ON tasting_notes FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can manage their own tasting notes" ON tasting_notes;
CREATE POLICY "Users can manage their own tasting notes" ON tasting_notes FOR ALL USING (auth.uid() = user_id);

-- notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read their own notifications" ON notifications;
CREATE POLICY "Users can read their own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
CREATE POLICY "Users can update their own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete their own notifications" ON notifications;
CREATE POLICY "Users can delete their own notifications" ON notifications FOR DELETE USING (auth.uid() = user_id);

-- follows
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Follows are publicly readable" ON follows;
CREATE POLICY "Follows are publicly readable" ON follows FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can follow others" ON follows;
CREATE POLICY "Users can follow others" ON follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
DROP POLICY IF EXISTS "Users can unfollow" ON follows;
CREATE POLICY "Users can unfollow" ON follows FOR DELETE USING (auth.uid() = follower_id);

-- yeast_bank
ALTER TABLE yeast_bank ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own yeast bank" ON yeast_bank;
CREATE POLICY "Users can manage their own yeast bank" ON yeast_bank FOR ALL USING (auth.uid() = user_id);
