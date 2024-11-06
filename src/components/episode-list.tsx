import { cn } from "@/lib/utils";
import { ExternalLink, Play } from "lucide-react";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import Image from "next/image";
import { AddAnimeDrawer } from "./add-anime-drawer";
import { getUnwatchedEpisodes } from "@/app/actions";

type Props = {
  className?: string;
};

export async function EpisodeList({ className }: Props) {
  const episodes = await getUnwatchedEpisodes();

  return (
    <div className="w-full flex flex-col gap-4 relative mx-auto h-[calc(100vh-80px)] md:h-[calc(100vh-120px)]">
      <div
        className={cn(
          "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 justify-around bg-background rounded-md border border-dashed p-2 overflow-auto",
          className
        )}
      >
        {episodes.map((episode) => (
          <div
            key={episode.id}
            className={cn(
              "rounded-md flex relative border border-dashed group justify-between hover:border-accent-foreground"
            )}
          >
            <Image
              className="h-full rounded-tl-md rounded-bl-md object-cover w-1/2"
              width={150}
              height={200}
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
                <Checkbox className="size-8" />

                <span className="text-4xl font-bold leading-none">
                  {episode.episodeNumber}
                </span>
              </div>

              <div className="flex gap-1 justify-between">
                <Button className="bg-purple-400 font-bold flex-1">
                  <ExternalLink className="inline-flex" size={16} />
                </Button>

                <Button className="bg-blue-400 font-bold flex-1">
                  <Play className="inline-flex" size={16} />
                </Button>
              </div>

              {/* links should have shortcuts */}
              {/* <span className="self-end text-sm text-white font-semibold">[b]</span> */}
            </div>
          </div>
        ))}
      </div>

      <AddAnimeDrawer />
    </div>
  );
}
