CREATE TYPE "public"."color_theme" AS ENUM('sunset', 'ocean', 'forest', 'lavender', 'peach', 'mono');--> statement-breakpoint
CREATE TABLE "cards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nickname" text NOT NULL,
	"raw_story" text NOT NULL,
	"title" text NOT NULL,
	"brag_points" jsonb NOT NULL,
	"vibe_caption" text NOT NULL,
	"emoji" text NOT NULL,
	"color_theme" "color_theme" NOT NULL,
	"cheers_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"is_public" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE INDEX "cards_created_at_idx" ON "cards" USING btree ("created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "cards_is_public_idx" ON "cards" USING btree ("is_public");