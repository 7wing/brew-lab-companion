-- ============================================================
-- Full Spec Schema Migration
-- Adds all missing tables, columns, enums, indexes, and RLS
-- Date: 2026-06-15
-- ============================================================

-- ============================================================
-- SECTION 1: NEW ENUMS
-- ============================================================

-- user_role enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('brewer', 'moderator', 'super_admin');
  END IF;
END $$;

-- moderation_status enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'moderation_status') THEN
    CREATE TYPE moderation_status AS ENUM ('pending', 'approved', 'rejected', 'needs_edits');
  END IF;
END $$;

-- challenge_type enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'challenge_type') THEN
    CREATE TYPE challenge_type AS ENUM ('official', 'community');
  END IF;
END $$;

-- ============================================================
-- SECTION 2: EXTEND EXISTING ENUMS (Supabase PG < 15 safe)
-- ============================================================

-- Add 'wine' to ferment_type
DO $$
BEGIN
  -- Check if 'wine' is NOT already in the enum (skip if already added)
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'ferment_type' AND e.enumlabel = 'wine'
  ) THEN
    ALTER TYPE ferment_type ADD VALUE IF NOT EXISTS 'wine';
  END IF;
EXCEPTION
  WHEN undefined_object THEN
    -- Type doesn't exist yet; recreate with all values
    ALTER TYPE ferment_type RENAME TO ferment_type_old;
    CREATE TYPE ferment_type AS ENUM ('beer', 'kombucha', 'mead', 'cider', 'sourdough', 'ferment', 'wine');
    ALTER TABLE batches ALTER COLUMN type TYPE ferment_type USING ferment_type_old::text::ferment_type;
    ALTER TABLE challenges ALTER COLUMN type TYPE ferment_type[] USING ARRAY[ferment_type_old::text::ferment_type];
    DROP TYPE ferment_type_old;
END $$;

-- Add new values to batch_status enum
DO $$
BEGIN
  -- Check each value before adding (skip if already present)
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'batch_status' AND e.enumlabel = 'brew_day'
  ) THEN
    ALTER TYPE batch_status ADD VALUE IF NOT EXISTS 'brew_day';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'batch_status' AND e.enumlabel = 'fermenting'
  ) THEN
    ALTER TYPE batch_status ADD VALUE IF NOT EXISTS 'fermenting';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'batch_status' AND e.enumlabel = 'conditioning'
  ) THEN
    -- 'conditioning' may already exist (in current schema) — skip
    ALTER TYPE batch_status ADD VALUE IF NOT EXISTS 'conditioning';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'batch_status' AND e.enumlabel = 'packaging'
  ) THEN
    ALTER TYPE batch_status ADD VALUE IF NOT EXISTS 'packaging';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'batch_status' AND e.enumlabel = 'batch_shelf'
  ) THEN
    ALTER TYPE batch_status ADD VALUE IF NOT EXISTS 'batch_shelf';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'batch_status' AND e.enumlabel = 'finished'
  ) THEN
    ALTER TYPE batch_status ADD VALUE IF NOT EXISTS 'finished';
  END IF;
END $$;

-- Add 'brew_log' to post_category
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'post_category' AND e.enumlabel = 'brew_log'
  ) THEN
    ALTER TYPE post_category ADD VALUE IF NOT EXISTS 'brew_log';
  END IF;
END $$;

-- ============================================================
-- SECTION 3: ALTER EXISTING TABLES — ADD MISSING COLUMNS
-- ============================================================

-- ---- profiles ----
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cover_photo_url text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS brewing_since text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS favourite_styles text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS experience_level text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS brew_types ferment_type[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'brewer';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- ---- recipes ----
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS style text;
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS batch_size numeric;
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS ibu numeric;
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS srm numeric;
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS target_og numeric;
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS target_fg numeric;
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS moderation_status moderation_status DEFAULT 'pending';
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS curated boolean DEFAULT false;
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS rejection_reason text;
-- forked_from: must drop FK first if it already exists with wrong constraint
ALTER TABLE recipes DROP CONSTRAINT IF EXISTS recipes_forked_from_fkey;
ALTER TABLE recipes DROP COLUMN IF EXISTS forked_from;
ALTER TABLE recipes ADD COLUMN forked_from uuid REFERENCES recipes(id);
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS edited_at timestamptz;

-- ---- batches ----
ALTER TABLE batches ADD COLUMN IF NOT EXISTS batch_number int;
ALTER TABLE batches ADD COLUMN IF NOT EXISTS batch_size numeric;
ALTER TABLE batches ADD COLUMN IF NOT EXISTS brew_date date;
ALTER TABLE batches ADD COLUMN IF NOT EXISTS yeast_strain text;
ALTER TABLE batches ADD COLUMN IF NOT EXISTS volume numeric;
ALTER TABLE batches ADD COLUMN IF NOT EXISTS srm numeric;
ALTER TABLE batches ADD COLUMN IF NOT EXISTS packaged_date date;
ALTER TABLE batches ADD COLUMN IF NOT EXISTS completed_date date;
ALTER TABLE batches ADD COLUMN IF NOT EXISTS finished_at timestamptz;
ALTER TABLE batches ADD COLUMN IF NOT EXISTS star_rating numeric;
-- updated_at may already exist — skip if so
DO $$
BEGIN
  ALTER TABLE batches ADD COLUMN updated_at timestamptz DEFAULT now();
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;

-- ---- posts ----
ALTER TABLE posts ADD COLUMN IF NOT EXISTS recipe_id uuid REFERENCES recipes(id);
ALTER TABLE posts ADD COLUMN IF NOT EXISTS challenge_id uuid REFERENCES challenges(id);
ALTER TABLE posts ADD COLUMN IF NOT EXISTS photos jsonb DEFAULT '[]'::jsonb;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS star_rating numeric;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS batch_stage text;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS current_sg numeric;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS current_temp numeric;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS current_ph numeric;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS appearance text;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS aroma text;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS flavor text;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS mouthfeel text;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS overall text;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS edited_at timestamptz;

-- ---- comments ----
ALTER TABLE comments ADD COLUMN IF NOT EXISTS edited_at timestamptz;

-- ---- challenge_entries ----
ALTER TABLE challenge_entries ADD COLUMN IF NOT EXISTS submission_post_id uuid REFERENCES posts(id);
ALTER TABLE challenge_entries ADD COLUMN IF NOT EXISTS submitted_at timestamptz;
ALTER TABLE challenge_entries ADD COLUMN IF NOT EXISTS rating numeric;

-- ---- challenges ----
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES profiles(id);
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS challenge_type challenge_type DEFAULT 'community';
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS moderation_status moderation_status DEFAULT 'pending';
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS rules text;
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS max_participants int;

-- ---- yeast_bank ----
ALTER TABLE yeast_bank ADD COLUMN IF NOT EXISTS source text;
ALTER TABLE yeast_bank ADD COLUMN IF NOT EXISTS generation int;
ALTER TABLE yeast_bank ADD COLUMN IF NOT EXISTS storage_date date;
ALTER TABLE yeast_bank ADD COLUMN IF NOT EXISTS viability_notes text;
DO $$
BEGIN
  ALTER TABLE yeast_bank ADD COLUMN updated_at timestamptz DEFAULT now();
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;

-- ============================================================
-- SECTION 4: NEW TABLES
-- ============================================================

-- ---- recipe_stages ----
CREATE TABLE IF NOT EXISTS recipe_stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id uuid NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  day int NOT NULL,
  action text NOT NULL,
  notes text,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- ---- recipe_ratings ----
CREATE TABLE IF NOT EXISTS recipe_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id uuid NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating int NOT NULL CHECK (rating >= 1 AND rating <= 5),
  batch_id uuid REFERENCES batches(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(recipe_id, user_id)
);

-- ---- featured_recipes ----
CREATE TABLE IF NOT EXISTS featured_recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id uuid NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  featured_type text NOT NULL DEFAULT 'curated',
  sort_order int DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- ---- badges ----
CREATE TABLE IF NOT EXISTS badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  icon_url text,
  criteria_key text NOT NULL,
  target_value int DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- ---- user_badges ----
CREATE TABLE IF NOT EXISTS user_badges (
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id uuid NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  awarded_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, badge_id)
);

-- ---- user_settings ----
CREATE TABLE IF NOT EXISTS user_settings (
  user_id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  temperature_unit text DEFAULT 'fahrenheit',
  gravity_unit text DEFAULT 'sg',
  volume_unit text DEFAULT 'gallons',
  theme text DEFAULT 'system'
);

-- ---- user_privacy ----
CREATE TABLE IF NOT EXISTS user_privacy (
  user_id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  profile_visibility text DEFAULT 'public',
  batch_shelf_visibility text DEFAULT 'everyone',
  yeast_bank_visibility text DEFAULT 'everyone'
);

-- ---- notification_settings ----
CREATE TABLE IF NOT EXISTS notification_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  in_app_enabled boolean DEFAULT true,
  email_enabled boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, type)
);

-- ---- reported_content ----
CREATE TABLE IF NOT EXISTS reported_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content_type text NOT NULL,
  content_id uuid NOT NULL,
  reason text NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- ---- lab_partners ----
CREATE TABLE IF NOT EXISTS lab_partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  logo_url text,
  slot int DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- SECTION 5: INDEXES
-- ============================================================

-- recipes
CREATE INDEX IF NOT EXISTS idx_recipes_moderation_curated ON recipes(moderation_status, curated);
CREATE INDEX IF NOT EXISTS idx_recipes_forked_from ON recipes(forked_from);

-- posts
CREATE INDEX IF NOT EXISTS idx_posts_recipe_id ON posts(recipe_id);
CREATE INDEX IF NOT EXISTS idx_posts_challenge_id ON posts(challenge_id);
CREATE INDEX IF NOT EXISTS idx_posts_category_created ON posts(category, created_at DESC);

-- challenge_entries
CREATE INDEX IF NOT EXISTS idx_challenge_entries_rating ON challenge_entries(challenge_id, rating);

-- batches
CREATE INDEX IF NOT EXISTS idx_batches_status_user ON batches(status, user_id);

-- notification_settings
CREATE INDEX IF NOT EXISTS idx_notification_settings_user_type ON notification_settings(user_id, type);

-- reported_content
CREATE INDEX IF NOT EXISTS idx_reported_content_status ON reported_content(status);

-- Additional useful indexes
CREATE INDEX IF NOT EXISTS idx_recipe_stages_recipe ON recipe_stages(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_ratings_recipe ON recipe_ratings(recipe_id);
CREATE INDEX IF NOT EXISTS idx_featured_recipes_active ON featured_recipes(active, sort_order);
CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_reported_content_content ON reported_content(content_type, content_id);

-- ============================================================
-- SECTION 6: RLS POLICIES FOR NEW TABLES
-- ============================================================

-- ---- recipe_stages ----
ALTER TABLE recipe_stages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "recipe_stages_select" ON recipe_stages;
CREATE POLICY "recipe_stages_select" ON recipe_stages FOR SELECT USING (
  EXISTS (SELECT 1 FROM recipes WHERE recipes.id = recipe_stages.recipe_id AND (recipes.is_public = true OR recipes.user_id = auth.uid()))
);
DROP POLICY IF EXISTS "recipe_stages_manage" ON recipe_stages;
CREATE POLICY "recipe_stages_manage" ON recipe_stages FOR ALL USING (
  EXISTS (SELECT 1 FROM recipes WHERE recipes.id = recipe_stages.recipe_id AND recipes.user_id = auth.uid())
);

-- ---- recipe_ratings ----
ALTER TABLE recipe_ratings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "recipe_ratings_all_read" ON recipe_ratings;
CREATE POLICY "recipe_ratings_all_read" ON recipe_ratings FOR SELECT USING (true);
DROP POLICY IF EXISTS "recipe_ratings_insert" ON recipe_ratings;
CREATE POLICY "recipe_ratings_insert" ON recipe_ratings FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "recipe_ratings_update" ON recipe_ratings;
CREATE POLICY "recipe_ratings_update" ON recipe_ratings FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "recipe_ratings_delete" ON recipe_ratings;
CREATE POLICY "recipe_ratings_delete" ON recipe_ratings FOR DELETE USING (auth.uid() = user_id);

-- ---- featured_recipes ----
ALTER TABLE featured_recipes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "featured_recipes_all_read" ON featured_recipes;
CREATE POLICY "featured_recipes_all_read" ON featured_recipes FOR SELECT USING (true);
DROP POLICY IF EXISTS "featured_recipes_admin_manage" ON featured_recipes;
CREATE POLICY "featured_recipes_admin_manage" ON featured_recipes FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('moderator', 'super_admin'))
);

-- ---- badges ----
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "badges_all_read" ON badges;
CREATE POLICY "badges_all_read" ON badges FOR SELECT USING (true);
DROP POLICY IF EXISTS "badges_admin_insert" ON badges;
CREATE POLICY "badges_admin_insert" ON badges FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin')
);
DROP POLICY IF EXISTS "badges_admin_update" ON badges;
CREATE POLICY "badges_admin_update" ON badges FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin')
);

-- ---- user_badges ----
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "user_badges_all_read" ON user_badges;
CREATE POLICY "user_badges_all_read" ON user_badges FOR SELECT USING (true);
DROP POLICY IF EXISTS "user_badges_manage" ON user_badges;
CREATE POLICY "user_badges_manage" ON user_badges FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('moderator', 'super_admin'))
);

-- ---- user_settings ----
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "user_settings_own_read" ON user_settings;
CREATE POLICY "user_settings_own_read" ON user_settings FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "user_settings_own_write" ON user_settings;
CREATE POLICY "user_settings_own_write" ON user_settings FOR ALL USING (auth.uid() = user_id);

-- ---- user_privacy ----
ALTER TABLE user_privacy ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "user_privacy_own_read" ON user_privacy;
CREATE POLICY "user_privacy_own_read" ON user_privacy FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "user_privacy_own_write" ON user_privacy;
CREATE POLICY "user_privacy_own_write" ON user_privacy FOR ALL USING (auth.uid() = user_id);

-- ---- notification_settings ----
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "notification_settings_own_read" ON notification_settings;
CREATE POLICY "notification_settings_own_read" ON notification_settings FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "notification_settings_own_write" ON notification_settings;
CREATE POLICY "notification_settings_own_write" ON notification_settings FOR ALL USING (auth.uid() = user_id);

-- ---- reported_content ----
ALTER TABLE reported_content ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "reported_content_own_insert" ON reported_content;
CREATE POLICY "reported_content_own_insert" ON reported_content FOR INSERT WITH CHECK (auth.uid() = reporter_id);
DROP POLICY IF EXISTS "reported_content_mod_read" ON reported_content;
CREATE POLICY "reported_content_mod_read" ON reported_content FOR SELECT USING (
  auth.uid() = reporter_id OR
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('moderator', 'super_admin'))
);
DROP POLICY IF EXISTS "reported_content_mod_update" ON reported_content;
CREATE POLICY "reported_content_mod_update" ON reported_content FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('moderator', 'super_admin'))
);

-- ---- lab_partners ----
ALTER TABLE lab_partners ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "lab_partners_all_read" ON lab_partners;
CREATE POLICY "lab_partners_all_read" ON lab_partners FOR SELECT USING (active = true);
DROP POLICY IF EXISTS "lab_partners_admin_manage" ON lab_partners;
CREATE POLICY "lab_partners_admin_manage" ON lab_partners FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin')
);

-- ============================================================
-- SECTION 7: UPDATE EXISTING RLS FOR RECIPES/POSTS
-- Add moderation-aware SELECT policy for recipes (keep existing too)
-- ============================================================

-- Add a curated/recipes SELECT policy that complements existing is_public policy
DROP POLICY IF EXISTS "recipes_curated_select" ON recipes;
CREATE POLICY "recipes_curated_select" ON recipes FOR SELECT USING (
  moderation_status = 'approved' OR user_id = auth.uid()
);

-- Posts: ensure all authenticated users can read (community feed)
-- The existing "Posts are publicly readable" policy covers this, but reinforce
DROP POLICY IF EXISTS "posts_community_feed" ON posts;
CREATE POLICY "posts_community_feed" ON posts FOR SELECT USING (true);

-- Update recipes moderation_status policy to be more explicit
DROP POLICY IF EXISTS "recipes_approved_or_owner_select" ON recipes;
CREATE POLICY "recipes_approved_or_owner_select" ON recipes FOR SELECT USING (
  moderation_status = 'approved' OR user_id = auth.uid()
);

-- ============================================================
-- SECTION 8: HELPER FUNCTIONS / TRIGGERS
-- ============================================================

-- Auto-update updated_at on profiles
CREATE OR REPLACE FUNCTION profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON profiles;
CREATE TRIGGER trigger_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION profiles_updated_at();

-- Auto-update updated_at on batches
CREATE OR REPLACE FUNCTION batches_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_batches_updated_at ON batches;
CREATE TRIGGER trigger_batches_updated_at
  BEFORE UPDATE ON batches
  FOR EACH ROW EXECUTE FUNCTION batches_updated_at();

-- Auto-update updated_at on yeast_bank
CREATE OR REPLACE FUNCTION yeast_bank_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_yeast_bank_updated_at ON yeast_bank;
CREATE TRIGGER trigger_yeast_bank_updated_at
  BEFORE UPDATE ON yeast_bank
  FOR EACH ROW EXECUTE FUNCTION yeast_bank_updated_at();