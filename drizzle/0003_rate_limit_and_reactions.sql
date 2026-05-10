CREATE TABLE "rate_limit" (
	"key" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE INDEX "rate_limit_expires_at_idx" ON "rate_limit" USING btree ("expires_at");--> statement-breakpoint
CREATE TABLE "reactions" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"card_id" uuid NOT NULL,
	"ip_hash" text NOT NULL,
	"reaction" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "reactions_kind_check" CHECK (reaction IN ('cheer','unhinged','facts','felt-that'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX "reactions_unique_idx" ON "reactions" USING btree ("card_id","ip_hash","reaction");
