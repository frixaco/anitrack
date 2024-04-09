import { randomUUID } from "crypto";
import ReleaseCard from "./releaseCard";
import { createClient } from "@/lib/supabase/server";

export type Release = {
  releaseId: string;
  episodeNumber: number;
  nyaaUrl: string;
  aniwaveUrl: string;
  season: number;
  thumbnailUrl: string;
  title: string;
};

export default async function NewEpisodesSection() {
  const newRelease: Release[] = [];

  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  if (data.user == null) {
    return (
      <section>
        <h2 className="font-semibold text-2xl pb-2">New Episodes</h2>
      </section>
    );
  }
  const { data: releasesWithNewEpisodes } = await supabase
    .from("release")
    .select("*")
    .eq("userId", data.user?.id);

  if (releasesWithNewEpisodes == null) {
    return (
      <section>
        <h2 className="font-semibold text-2xl pb-2">New Episodes</h2>
      </section>
    );
  }

  for (const release of releasesWithNewEpisodes) {
    if (release.latestEpisode > release.lastWatchedEpisode) {
      newRelease.push({
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
      <h2 className="font-semibold text-2xl pb-2">New Episodes</h2>

      <div className="grid grid-cols-2 gap-2">
        {newRelease.map((episode) => (
          <ReleaseCard key={randomUUID()} episode={episode} />
        ))}
      </div>
    </section>
  );
}
