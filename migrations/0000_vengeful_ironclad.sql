CREATE TABLE IF NOT EXISTS "episode" (
	"id" uuid PRIMARY KEY NOT NULL,
	"hianime_id" text NOT NULL,
	"title" text NOT NULL,
	"episode_number" integer NOT NULL,
	"is_watched" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "release" (
	"id" uuid PRIMARY KEY NOT NULL,
	"hianime_id" text NOT NULL,
	"title" text NOT NULL,
	"year" integer NOT NULL,
	"season" text NOT NULL,
	"thumbnail_url" text,
	"total_episodes" integer NOT NULL
);
