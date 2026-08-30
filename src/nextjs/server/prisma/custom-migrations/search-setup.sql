-- One-time setup for hybrid search (pgvector + full-text + trigram).
--
-- Run BEFORE `prisma db push` so the `vector` type exists for the embedding
-- columns declared in schema.prisma. `db push` does not manage extensions or
-- expression indexes, so re-run this file after a `db push` that recreates
-- tables. Creating extensions requires superuser (or appropriate grants).
--
-- The full-text expressions below must stay in sync with the tsvector
-- expressions built by SearchService.toTsvectorSql() in
-- server/src/services/search/search-service.ts (expression indexes are only
-- used when the query expression matches exactly).

CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Full-text expression indexes ------------------------------------------------

-- Profile: display_name, headline, bio, location
CREATE INDEX IF NOT EXISTS profile_search_fts_idx
  ON public.profile USING gin (to_tsvector('english',
    coalesce(display_name, '') || ' ' || coalesce(headline, '') || ' ' ||
    coalesce(bio, '') || ' ' || coalesce(location, '')));

-- Project: tagline, description, tech_stack. The project name lives on the
-- instance table, which is searched as a separate tsvector source (see the
-- instance index below); an expression index cannot span a join.
CREATE INDEX IF NOT EXISTS project_search_fts_idx
  ON public.project USING gin (to_tsvector('english',
    coalesce(tagline, '') || ' ' || coalesce(description, '') || ' ' ||
    coalesce(array_to_string(tech_stack, ' '), '')));

-- Instance name (searched as part of project search)
CREATE INDEX IF NOT EXISTS instance_search_fts_idx
  ON public.instance USING gin (to_tsvector('english', name));

-- DiscussPost: title, body
CREATE INDEX IF NOT EXISTS discuss_post_search_fts_idx
  ON public.discuss_post USING gin (to_tsvector('english',
    coalesce(title, '') || ' ' || coalesce(body, '')));

-- DiscussComment: body
CREATE INDEX IF NOT EXISTS discuss_comment_search_fts_idx
  ON public.discuss_comment USING gin (to_tsvector('english',
    coalesce(body, '')));

-- Trigram indexes (support LIKE/ILIKE/~ and future similarity operators) ------

CREATE INDEX IF NOT EXISTS profile_display_name_trgm_idx
  ON public.profile USING gin (display_name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS profile_headline_trgm_idx
  ON public.profile USING gin (headline gin_trgm_ops);

CREATE INDEX IF NOT EXISTS profile_bio_trgm_idx
  ON public.profile USING gin (bio gin_trgm_ops);

CREATE INDEX IF NOT EXISTS profile_location_trgm_idx
  ON public.profile USING gin (location gin_trgm_ops);

CREATE INDEX IF NOT EXISTS discuss_post_title_trgm_idx
  ON public.discuss_post USING gin (title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS discuss_post_body_trgm_idx
  ON public.discuss_post USING gin (body gin_trgm_ops);

CREATE INDEX IF NOT EXISTS discuss_comment_body_trgm_idx
  ON public.discuss_comment USING gin (body gin_trgm_ops);

CREATE INDEX IF NOT EXISTS project_tagline_trgm_idx
  ON public.project USING gin (tagline gin_trgm_ops);

CREATE INDEX IF NOT EXISTS project_description_trgm_idx
  ON public.project USING gin (description gin_trgm_ops);

CREATE INDEX IF NOT EXISTS instance_name_trgm_idx
  ON public.instance USING gin (name gin_trgm_ops);

-- Embedding indexes (cosine distance) -----------------------------------------

CREATE INDEX IF NOT EXISTS profile_embedding_hnsw_idx
  ON public.profile USING hnsw (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS discuss_post_embedding_hnsw_idx
  ON public.discuss_post USING hnsw (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS discuss_comment_embedding_hnsw_idx
  ON public.discuss_comment USING hnsw (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS project_embedding_hnsw_idx
  ON public.project USING hnsw (embedding vector_cosine_ops);
