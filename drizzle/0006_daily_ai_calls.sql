-- Daily counter for Anthropic API calls. Single row per UTC date.
-- Keeps cost predictable: when count exceeds AI_DAILY_CAP, AI routes
-- start refusing new generations until midnight UTC rolls over.
CREATE TABLE "daily_ai_calls" (
	"date_key" text PRIMARY KEY NOT NULL,
	"count" integer DEFAULT 0 NOT NULL
);
