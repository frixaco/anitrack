import { cn } from "@/lib/utils";
import Image from "next/image";
import { getUnwatchedEpisodes, markAsWatched } from "@/app/actions";
import { StreamTorrentButton } from "./stream-torrent-button";
import { OpenHianimeButton } from "./open-hianime-button";
import { MarkAsWatchedButton } from "./mark-as-watched-buttton";

type Props = {
  className?: string;
};

export async function EpisodeList({ className }: Props) {
  const episodes = await getUnwatchedEpisodes();

  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 gap-2 justify-around bg-background rounded-md border border-accent-foreground border-dotted p-2 overflow-auto",
        className
      )}
    >
      {episodes.length > 0 ? (
        episodes.map((episode) => (
          <div
            key={episode.id}
            className={cn(
              "rounded-md flex max-h-[300px] relative border border-dashed group justify-between hover:border-accent-foreground"
            )}
          >
            <Image
              className="rounded-tl-md rounded-bl-md w-auto max-w-1/2"
              width={225}
              height={300}
              src={episode.release.thumbnailUrl ?? ""}
              alt={episode.release.title}
            />

            <div className="p-2 flex flex-col gap-2 justify-start font-bold flex-1">
              <h1 className="font-bold text-lg line-clamp-2 overflow-hidden overflow-ellipsis">
                {episode.release.title}
              </h1>

              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-thin text-secondary-foreground">
                    {episode.release.totalEpisodes} episodes
                  </span>
                  <span className="text-xs font-thin text-secondary-foreground">
                    {episode.release.year}, {episode.release.season}
                  </span>
                </div>
              </div>

              <div className="self-center flex-1 flex items-center gap-2">
                <span className="text-4xl font-bold leading-none">
                  {episode.episodeNumber}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <form action={markAsWatched.bind(null, episode.id)}>
                  <MarkAsWatchedButton />
                </form>

                <div className="flex gap-1 justify-between">
                  <OpenHianimeButton episodeUrl={episode.url} />

                  {/* remove any puctuation marks from episode.release.title */}
                  {/* sample title: "Re Zero kara Hajimeru Isekai Seikatsu 3rd Season" - remove "<number>rd/th/st" and number, also "Season" */}
                  <StreamTorrentButton
                    defaultSearch={episode.release.title
                      .replace(/[^\w\s]/g, " ")
                      .replace(/\s+/g, " ")
                      .replace(/\d+(?:st|nd|rd|th)\s+season/gi, "")
                      .trim()}
                  />
                </div>
              </div>

              {/* links should have shortcuts */}
              {/* <span className="self-end text-sm text-white font-semibold">[b]</span> */}
            </div>
          </div>
        ))
      ) : (
        <span className="text-sm">no episodes</span>
      )}
    </div>
  );
}
