import { relations } from "drizzle-orm";
import { integer, text, pgTable, boolean, uuid } from "drizzle-orm/pg-core";

export const release = pgTable("release", {
  id: uuid("id").primaryKey().defaultRandom(),
  hianimeId: text("hianime_id").notNull(),
  title: text("title").notNull(),
  year: integer("year").notNull(),
  season: text("season").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  totalEpisodes: integer("total_episodes").notNull(),
});

export type Release = typeof release.$inferSelect;

export const episode = pgTable("episode", {
  id: uuid("id").primaryKey().defaultRandom(),
  hianimeId: text("hianime_id").notNull(),
  url: text("url").notNull(),
  title: text("title").notNull(),
  episodeNumber: integer("episode_number").notNull(),
  isWatched: boolean("is_watched").default(false).notNull(),
  releaseId: uuid("release_id")
    .references(() => release.id, {
      onDelete: "cascade",
    })
    .notNull(),
});

export const episodeRelations = relations(episode, ({ one }) => ({
  release: one(release, {
    fields: [episode.releaseId],
    references: [release.id],
  }),
}));

export type Episode = typeof episode.$inferSelect;
