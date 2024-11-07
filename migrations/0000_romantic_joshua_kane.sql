CREATE TABLE IF NOT EXISTS "episode" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"hianime_id" text NOT NULL,
	"url" text NOT NULL,
	"title" text NOT NULL,
	"episode_number" integer NOT NULL,
	"is_watched" boolean DEFAULT false NOT NULL,
	"release_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "release" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"hianime_id" text NOT NULL,
	"title" text NOT NULL,
	"year" integer NOT NULL,
	"season" text NOT NULL,
	"thumbnail_url" text,
	"total_episodes" integer NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "episode" ADD CONSTRAINT "episode_release_id_release_id_fk" FOREIGN KEY ("release_id") REFERENCES "public"."release"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
