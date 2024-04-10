import { createClient } from "@/lib/supabase/server";
import { Release } from "./newEpisodesSection";
import TrackedReleaseCard from "./trackedReleaseCard";

export default async function TrackedAnimesSection() {
  const newReleases: Release[] = [];

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user == null) {
    return (
      <section>
        <h2 className="font-semibold text-2xl pb-2">Tracking</h2>

        <div className="grid grid-cols-2 gap-2"></div>
      </section>
    );
  }

  const { data: releases } = await supabase
    .from("release")
    .select("*")
    .eq("userId", user.id)
    .eq("isWatching", true);

  if (releases == null) {
    return (
      <section>
        <h2 className="font-semibold text-2xl pb-2">Tracking</h2>

        <div className="grid grid-cols-2 gap-2"></div>
      </section>
    );
  }

  for (const release of releases) {
    if (release.latestEpisode > release.lastWatchedEpisode) {
      newReleases.push({
        episodeNumber: release.lastWatchedEpisode + 1,
        releaseId: release.id,
        nyaaUrl:
          release.nyaaUrlForFirstUnwatchedEpisode || release.nyaaSourceUrl,
        aniwaveUrl:
          release.aniwaveUrlForFirstUnwatchedEpisode ||
          release.aniwaveSourceUrl,
        title: release.title,
        season: release.season,
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
