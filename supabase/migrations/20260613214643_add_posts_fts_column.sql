-- Add generated full-text search column to posts (idempotent)
ALTER TABLE posts
DROP COLUMN IF EXISTS fts;

ALTER TABLE posts
ADD COLUMN fts tsvector GENERATED ALWAYS AS (
  to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content, ''))
) STORED;

DROP INDEX IF EXISTS idx_posts_fts;
CREATE INDEX idx_posts_fts ON posts USING gin(fts);
