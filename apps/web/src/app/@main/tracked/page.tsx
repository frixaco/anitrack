import { auth } from "@clerk/nextjs/server";
import { db } from "@/server/db";
import { Release } from "../episodes/page";
import TrackedReleaseCard from "@/app/_components/tracked-release-card";

export default async function Page() {
  const newReleases: Release[] = [];

  const user = auth();
  if (user.userId == null) {
    return null;
  }

  const releasesWithNewEpisodes = await db.query.release.findMany({
    where: ({ userId }, { eq, and }) => and(eq(userId, user.userId)),
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

  // TODO: Remove
  for (let i = 0; i < 10; i++) {
    newReleases.push(newReleases[0]);
  }

  return (
    <section>
      <h2 className="font-semibold text-2xl">Tracking</h2>

      <div className="grid grid-cols-none sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
        {newReleases.length === 0 ? (
          <p className="p-4 flex-1 text-center">Nothing to see</p>
        ) : (
          newReleases.map((release) => (
            <TrackedReleaseCard
              key={release.releaseId}
              release={release}
              isTracking={release.isTracking}
            />
          ))
        )}
      </div>
    </section>
  );
}
