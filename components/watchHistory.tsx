import { randomUUID } from "crypto";
import ReleaseCard from "./releaseCard";

export default async function WatchHistory() {
  const newEpisodes = [
    {
      title: "Frieren: Beyond Journey's End",
      thumbnailUrl: "https://cdn.myanimelist.net/images/anime/1015/138006l.jpg",
      episode: 1,
      season: 2,
    },
    {
      title: "The Eminence in Shadow",
      thumbnailUrl: "https://cdn.myanimelist.net/images/anime/1874/121869l.jpg",
      episode: 1,
      season: 3,
    },
  ];

  return (
    <section>
      <h2 className="font-semibold text-2xl pb-2">Watch History</h2>

      <div className="grid grid-cols-2 gap-2">
        {newEpisodes.map((episode) => (
          <ReleaseCard key={randomUUID()} latestEpisode={episode} />
        ))}
      </div>
    </section>
  );
}
