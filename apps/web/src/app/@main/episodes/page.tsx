import { auth } from "@clerk/nextjs/server";
import { db } from "@/server/db";
import NewEpisodeCard from "@/app/_components/new-episode-card";

export type Release = {
  releaseId: string;
  episodeNumber: number;
  nyaaUrl: string;
  aniwaveUrl: string;
  seasonNumber: number;
  thumbnailUrl: string;
  title: string;
  isTracking: boolean;
};

export default async function Page() {
  await new Promise((r) => setTimeout(() => r("DONE"), 2000));

  const newReleases: Release[] = [];

  const user = auth();
  if (user.userId == null) {
    return null;
  }
  const releasesWithNewEpisodes = await db.query.release.findMany({
    where: ({ userId, isTracking }, { eq, and }) =>
      and(eq(userId, user.userId), eq(isTracking, true)),
  });

  if (releasesWithNewEpisodes == null) {
    return null;
  }

  for (const release of releasesWithNewEpisodes) {
    if (release.latestEpisode > release.lastWatchedEpisode) {
      newReleases.push({
        episodeNumber: release.lastWatchedEpisode + 1,
        releaseId: release.uuid,
        nyaaUrl: release.nyaaUrlFirstUnwatchedEp || release.nyaaSourceUrl,
        aniwaveUrl:
          release.aniwaveUrlFirstUnwatchedEp || release.aniwaveSourceUrl,
        title: release.title,
        seasonNumber: release.season,
        thumbnailUrl: release.thumbnailUrl,
        isTracking: release.isTracking,
      });
    }
  }

  // TODO: remove
  for (let i = 0; i < 10; i++) {
    newReleases.push(newReleases[0]);
  }

  return (
    <section>
      <h2 className="font-semibold text-2xl">New Episodes</h2>

      <div className="grid grid-cols-none sm:grid-cols-4 gap-2">
        {newReleases.length === 0 ? (
          <p className="p-4 col-span-full text-center">Nothing to see</p>
        ) : (
          newReleases.map((episode) => (
            <NewEpisodeCard key={episode.releaseId} episode={episode} />
          ))
        )}
      </div>
    </section>
  );
}
