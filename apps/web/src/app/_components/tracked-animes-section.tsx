import { auth } from "@clerk/nextjs/server";
import { db } from "@/server/db";
import { Release } from "./new-episodes-section";
import TrackedReleaseCard from "./tracked-release-card";

export default async function TrackedAnimesSection() {
  const newReleases: Release[] = [];

  const user = auth();
  if (user.userId == null) {
    return (
      <section>
        <h2 className="font-semibold text-2xl pb-2">Tracking</h2>

        <div className="grid grid-cols-2 gap-2"></div>
      </section>
    );
  }

  const releasesWithNewEpisodes = await db.query.release.findMany({
    where: ({ userId, isTracking }, { eq, and }) =>
      and(eq(userId, user.userId), eq(isTracking, true)),
  });

  if (releasesWithNewEpisodes == null) {
    return (
      <section>
        <h2 className="font-semibold text-2xl pb-2">Tracking</h2>

        <div className="grid grid-cols-2 gap-2"></div>
      </section>
    );
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
      });
    }
  }

  return (
    <section>
      <h2 className="font-semibold text-2xl pb-2">Tracking</h2>

      <div className="grid grid-cols-2 gap-2">
        {newReleases.map((episode) => (
          <TrackedReleaseCard
            key={episode.releaseId}
            episode={episode}
            asRelease
          />
        ))}
      </div>
    </section>
  );
}
