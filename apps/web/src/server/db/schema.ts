import {
  serial,
  text,
  timestamp,
  pgTableCreator,
  integer,
  boolean,
} from "drizzle-orm/pg-core";

const pgTable = pgTableCreator((name) => `anitrack_${name}`);

export const release = pgTable("release", {
  id: serial("id").primaryKey(),
  uuid: text("uuid").unique().notNull(),
  title: text("title").notNull(),
  userId: text("user_id").notNull(),
  isTracking: boolean("is_tracking").default(true).notNull(),
  nyaaSourceUrl: text("nyaa_source_url").notNull(),
  aniwaveSourceUrl: text("aniwave_source_url").notNull(),
  aniwaveUrlFirstUnwatchedEp: text("aniwave_url_first_unwatched_ep").notNull(),
  nyaaUrlFirstUnwatchedEp: text("nyaa_url_first_unwatched_ep").notNull(),
  latestEpisode: integer("latest_episode").default(0).notNull(),
  season: integer("season").default(1).notNull(),
  thumbnailUrl: text("thumbnail_url").notNull(),
  lastWatchedEpisode: integer("last_watched_episode").default(0).notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

export const watchHistory = pgTable("watch_history", {
  id: serial("id").primaryKey(),
  episode: integer("episode").notNull(),
  uuid: text("uuid").unique().notNull(),
  nyaaEpisodeUrl: text("nyaa_episode_url").notNull(),
  aniwaveEpisodeUrl: text("aniwave_episode_url").notNull(),
  season: integer("season").notNull(),
  releaseId: text("release_uuid")
    .notNull()
    .references(() => release.uuid),
  userId: text("user_id").notNull(),
});
