ALTER TABLE "episode" ADD COLUMN "release_id" uuid;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "episode" ADD CONSTRAINT "episode_release_id_release_id_fk" FOREIGN KEY ("release_id") REFERENCES "public"."release"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
