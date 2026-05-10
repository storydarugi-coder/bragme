-- Backfill: any duplicate nicknames in the existing cards table get an
-- 8-char id suffix appended so they become unique. The first card to use
-- each handle (oldest by created_at) keeps the original. After this the
-- UNIQUE index can be created safely.
UPDATE "cards"
SET "nickname" = "nickname" || '_' || substr("id"::text, 1, 8)
WHERE "id" IN (
  SELECT "id" FROM (
    SELECT "id",
           ROW_NUMBER() OVER (PARTITION BY "nickname" ORDER BY "created_at") AS rn
    FROM "cards"
  ) t
  WHERE t.rn > 1
);
--> statement-breakpoint
CREATE UNIQUE INDEX "cards_nickname_unique_idx" ON "cards" USING btree ("nickname");
