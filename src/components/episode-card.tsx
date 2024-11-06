import { cn } from "@/lib/utils";
import { ExternalLink, Play } from "lucide-react";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import Image from "next/image";
import { Episode } from "@/app/actions";

export async function EpisodeCard({ episode }: { episode: Episode }) {
  const { title, episodeNumber, releaseYear, releaseSeason, totalEpisodes } =
    episode;

  return (
    <div
      className={cn(
        "rounded-md flex relative border border-dashed group justify-between hover:border-accent-foreground"
      )}
    >
      <Image
        className="h-full rounded-tl-md rounded-bl-md object-cover w-1/2"
        width={150}
        height={200}
        src={episode.thumbnailUrl}
        alt={title}
      />

      <div className="p-2 flex flex-col gap-2 justify-start font-bold flex-1">
        <h1 className="font-bold text-lg line-clamp-2 overflow-hidden overflow-ellipsis">
          {title}
        </h1>

        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-thin text-secondary-foreground">
              {totalEpisodes} episodes
            </span>
            <span className="text-xs font-thin text-secondary-foreground">
              {releaseYear}, {releaseSeason}
            </span>
          </div>
        </div>

        <div className="self-center flex-1 flex items-center gap-2">
          <Checkbox className="size-8" />
          <span className="text-4xl font-bold leading-none">
            {episodeNumber}
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
  );
}
