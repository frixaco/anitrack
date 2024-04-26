import { auth } from "@clerk/nextjs/server";
import { db } from "@/server/db";
import ReleaseCard from "../_components/release-card";

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

  return (
    <section className="grid grid-cols-none sm:grid-cols-4 overflow-scroll gap-2">
      {newReleases.map((episode) => (
        <ReleaseCard key={episode.releaseId} episode={episode} />
      ))}
    </section>
  );
}
