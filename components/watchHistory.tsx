import { createClient } from "@/lib/supabase/server";
import WatchedEpisodeCard from "./watchedEpisodeCard";

export type WatchedEpisode = {
  title: string;
  episodeNumber: number;
  seasonNumber: number;
  thumbnailUrl: string;
  nyaaUrl: string;
  aniwaveUrl: string;
};

export default async function WatchHistory() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user == null) {
    return (
      <section>
        <h2 className="font-semibold text-2xl pb-2">Watch History</h2>

        <div className="grid grid-cols-2 gap-2"></div>
      </section>
    );
  }

  const { data: watchedEpisodes } = await supabase
    .from("watchHistory")
    .select(
      "id, episodeNumber, seasonNumber, releaseId, nyaaUrl, aniwaveUrl, release (title, season, thumbnailUrl)",
    )
    .eq("userId", user.id);

  return (
    <section>
      <h2 className="font-semibold text-2xl pb-2">Watch History</h2>

      <div className="grid grid-cols-2 gap-2">
        {watchedEpisodes?.map((episode) => (
          <WatchedEpisodeCard
            key={episode.id}
            episode={{
              episodeNumber: episode.episodeNumber,
              seasonNumber: episode.seasonNumber,
              title: episode.release?.title || "",
              nyaaUrl: episode.nyaaUrl,
              aniwaveUrl: episode.aniwaveUrl,
              thumbnailUrl: episode.release?.thumbnailUrl || "",
            }}
          />
        ))}
      </div>
    </section>
  );
}
