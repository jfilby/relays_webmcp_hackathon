-- Backfill public_id columns for Profile, Project, Post, DiscussPost,
-- DiscussComment.
--
-- Run AFTER `prisma db push` created the tables' other structure OR on a
-- database where the prisma schema has not been pushed yet: this script adds
-- any missing public_id columns itself, fills them, and applies the unique
-- constraints so a subsequent `prisma db push` sees them already in place.
--
-- Format matches PublicIdService.generate(): an optional readable slug of up
-- to 50 characters plus a short random hash ('my-first-post-3f9a2b7c1d'), or
-- just the hash when there is no readable text.
--
-- Usage: psql "$DATABASE_URL" -f scripts/backfill-public-ids.sql

BEGIN;

-- Profiles: slug from display_name
ALTER TABLE profile ADD COLUMN IF NOT EXISTS public_id text;
UPDATE profile
SET public_id =
  COALESCE(NULLIF(trim(regexp_replace(lower(substring(display_name from 1 for 50)), '[^a-z0-9]+', '-', 'g'), '-'), '') || '-', '')
  || substr(md5(random()::text || id::text), 1, 10)
WHERE public_id IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS profile_public_id_key ON profile (public_id);
ALTER TABLE profile ALTER COLUMN public_id SET NOT NULL;

-- Projects: slug from the owning instance's name
ALTER TABLE project ADD COLUMN IF NOT EXISTS public_id text;
UPDATE project
SET public_id =
  COALESCE(NULLIF(trim(regexp_replace(lower(substring(i.name from 1 for 50)), '[^a-z0-9]+', '-', 'g'), '-'), '') || '-', '')
  || substr(md5(random()::text || project.id::text), 1, 10)
FROM instance i
WHERE project.instance_id = i.id
  AND project.public_id IS NULL;
UPDATE project
SET public_id = substr(md5(random()::text || id::text), 1, 10)
WHERE public_id IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS project_public_id_key ON project (public_id);
ALTER TABLE project ALTER COLUMN public_id SET NOT NULL;

-- Activity feed posts: slug from the body's first 50 characters
ALTER TABLE post ADD COLUMN IF NOT EXISTS public_id text;
UPDATE post
SET public_id =
  COALESCE(NULLIF(trim(regexp_replace(lower(substring(body from 1 for 50)), '[^a-z0-9]+', '-', 'g'), '-'), '') || '-', '')
  || substr(md5(random()::text || id::text), 1, 10)
WHERE public_id IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS post_public_id_key ON post (public_id);
ALTER TABLE post ALTER COLUMN public_id SET NOT NULL;

-- Discussion posts: slug from the title
ALTER TABLE discuss_post ADD COLUMN IF NOT EXISTS public_id text;
UPDATE discuss_post
SET public_id =
  COALESCE(NULLIF(trim(regexp_replace(lower(substring(title from 1 for 50)), '[^a-z0-9]+', '-', 'g'), '-'), '') || '-', '')
  || substr(md5(random()::text || id::text), 1, 10)
WHERE public_id IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS discuss_post_public_id_key ON discuss_post (public_id);
ALTER TABLE discuss_post ALTER COLUMN public_id SET NOT NULL;

-- Discussion comments: slug from the body's first 50 characters
ALTER TABLE discuss_comment ADD COLUMN IF NOT EXISTS public_id text;
UPDATE discuss_comment
SET public_id =
  COALESCE(NULLIF(trim(regexp_replace(lower(substring(body from 1 for 50)), '[^a-z0-9]+', '-', 'g'), '-'), '') || '-', '')
  || substr(md5(random()::text || id::text), 1, 10)
WHERE public_id IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS discuss_comment_public_id_key ON discuss_comment (public_id);
ALTER TABLE discuss_comment ALTER COLUMN public_id SET NOT NULL;

COMMIT;
