CREATE TABLE IF NOT EXISTS "anitrack_release" (
	"id" serial NOT NULL,
	"uuid" text NOT NULL,
	"title" text NOT NULL,
	"user_id" text NOT NULL,
	"is_tracking" boolean DEFAULT true NOT NULL,
	"nyaa_source_url" text NOT NULL,
	"aniwave_source_url" text NOT NULL,
	"aniwave_url_first_unwatched_ep" text NOT NULL,
	"nyaa_url_first_unwatched_ep" text NOT NULL,
	"latest_episode" integer DEFAULT 0 NOT NULL,
	"season" integer DEFAULT 1 NOT NULL,
	"thumbnail_url" text NOT NULL,
	"last_watched_episode" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp,
	CONSTRAINT "anitrack_release_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "anitrack_watch_history" (
	"episode" integer NOT NULL,
	"uuid" text NOT NULL,
	"nyaa_episode_url" text NOT NULL,
	"aniwave_episode_url" text NOT NULL,
	"season" integer NOT NULL,
	"release_id" text NOT NULL,
	"user_id" text NOT NULL,
	CONSTRAINT "anitrack_watch_history_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "anitrack_watch_history" ADD CONSTRAINT "anitrack_watch_history_release_id_anitrack_release_id_fk" FOREIGN KEY ("release_id") REFERENCES "anitrack_release"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
