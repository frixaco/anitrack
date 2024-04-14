import { auth } from "@clerk/nextjs/server";
import ReleaseCard from "./release-card";
import { db } from "@/server/db";

let x = "rs";

export type Release = {
  releaseId: string;
  episodeNumber: number;
  nyaaUrl: string;
  aniwaveUrl: string;
  seasonNumber: number;
  thumbnailUrl: string;
  title: string;
};

export default async function NewEpisodesSection() {
  const newReleases: Release[] = [];

  const user = auth();
  if (user.userId == null) {
    return (
      <section>
        <h2 className="font-semibold text-2xl pb-2">New Episodes</h2>
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
        <h2 className="font-semibold text-2xl pb-2">New Episodes</h2>
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
      <h2 className="font-semibold text-2xl pb-2">New Episodes</h2>

      <div className="grid grid-cols-2 gap-2">
        {newReleases.map((episode) => (
          <ReleaseCard key={episode.releaseId} episode={episode} />
        ))}
      </div>
    </section>
  );
}
