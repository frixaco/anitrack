import { db } from "@/server/db";
import { auth } from "@clerk/nextjs/server";
import { release, watchHistory } from "@/server/db/schema";
import { and, eq } from "drizzle-orm";
import WatchedEpisodeCard from "@/app/_components/watched-episode-card";

export type WatchedEpisode = {
  title: string;
  episodeNumber: number;
  seasonNumber: number;
  thumbnailUrl: string;
  nyaaUrl: string;
  aniwaveUrl: string;
};

export default async function Page() {
  const user = auth();

  if (user.userId == null) {
    return null;
  }

  const watchedEpisodes = await db
    .select()
    .from(watchHistory)
    .innerJoin(
      release,
      and(
        eq(watchHistory.userId, user.userId),
        eq(watchHistory.releaseId, release.uuid),
      ),
    );

  let result = (
    <>
      {watchedEpisodes.map((episode) => (
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
    </>
  );
  if (watchedEpisodes.length === 0) {
    result = <p className="p-4 text-center col-span-2">Nothing to see</p>;
  }

  return (
    <section>
      <h2 className="font-semibold text-2xl">Watch History</h2>

      <div className="grid grid-cols-none md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
        {result}
      </div>
    </section>
  );
}
