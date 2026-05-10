-- Composite index for the trending feed query
-- (cards-store.ts listFeed sort=trending):
--   SELECT … FROM cards
--   WHERE is_public = true
--   ORDER BY cheers_count DESC, created_at DESC
--   LIMIT 20
-- Without this Postgres falls back to a seq scan + sort once the table
-- grows past a few thousand rows.
CREATE INDEX "cards_trending_idx" ON "cards"
  USING btree ("cheers_count" DESC NULLS LAST, "created_at" DESC NULLS LAST);
