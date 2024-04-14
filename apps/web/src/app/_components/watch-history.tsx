import { db } from "@/server/db";
import { auth } from "@clerk/nextjs/server";
import WatchedEpisodeCard from "./watched-episode-card";
import { release, watchHistory } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export type WatchedEpisode = {
  title: string;
  episodeNumber: number;
  seasonNumber: number;
  thumbnailUrl: string;
  nyaaUrl: string;
  aniwaveUrl: string;
};

export default async function WatchHistory() {
  const user = auth();

  if (user.userId == null) {
    return (
      <section>
        <h2 className="font-semibold text-2xl pb-2">Watch History</h2>

        <div className="grid grid-cols-2 gap-2"></div>
      </section>
    );
  }

  const watchedEpisodes = await db
    .select()
    .from(watchHistory)
    .innerJoin(release, eq(watchHistory.userId, user.userId));

  return (
    <section>
      <h2 className="font-semibold text-2xl pb-2">Watch History</h2>

      <div className="grid grid-cols-2 gap-2">
        {watchedEpisodes?.map((episode) => (
          <WatchedEpisodeCard
            key={episode.watch_history.uuid}
            episode={{
              episodeNumber: episode.watch_history.episode,
              seasonNumber: episode.watch_history.season,
              title: episode.release.title,
              nyaaUrl: episode.watch_history.nyaaEpisodeUrl,
              aniwaveUrl: episode.watch_history.aniwaveEpisodeUrl,
              thumbnailUrl: episode.release.thumbnailUrl,
            }}
          />
        ))}
      </div>
    </section>
  );
}
