ALTER TABLE "anitrack_watch_history" DROP CONSTRAINT "anitrack_watch_history_release_id_anitrack_release_id_fk";
--> statement-breakpoint
ALTER TABLE "anitrack_release" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "anitrack_watch_history" ADD COLUMN "id" serial NOT NULL;--> statement-breakpoint
ALTER TABLE "anitrack_watch_history" ADD COLUMN "release_uuid" text NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "anitrack_watch_history" ADD CONSTRAINT "anitrack_watch_history_release_uuid_anitrack_release_uuid_fk" FOREIGN KEY ("release_uuid") REFERENCES "anitrack_release"("uuid") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "anitrack_watch_history" DROP COLUMN IF EXISTS "release_id";