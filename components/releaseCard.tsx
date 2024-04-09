import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import Image from "next/image";
import { AspectRatio } from "./ui/aspect-ratio";
import { Badge } from "./ui/badge";
import { randomUUID } from "crypto";
import { Eye, Magnet, Video } from "lucide-react";
import { Button } from "./ui/button";
import { markEpisodeWatched } from "@/app/actions/markEpisodeWatched";
import { Release } from "./newEpisodesSection";

export default async function ReleaseCard({ episode }: { episode: Release }) {
  if (episode == null) {
    return null;
  }

  const {
    episodeNumber,
    releaseId,
    nyaaUrl,
    aniwaveUrl,
    season,
    title,
    thumbnailUrl,
  } = episode;

  const markEpisodeAsWatched = markEpisodeWatched.bind(null, {
    lastWatchedEpisode: episodeNumber,
    releaseId,
  });

  return (
    <Card className="relative" key={randomUUID()}>
      <Badge className="absolute drop-shadow-lg z-10 right-2 top-2 text-xl">
        E{season} - S{episodeNumber}
      </Badge>

      <CardHeader className="relative w-[280px] max-w-full pb-2">
        <AspectRatio ratio={2 / 3}>
          <Image className="rounded-md" fill alt={title} src={thumbnailUrl} />
        </AspectRatio>
      </CardHeader>

      <CardContent>
        <CardTitle className="text-lg text-balance">{title}</CardTitle>

        <div className="flex flex-col gap-4">
          <div className="pt-2 flex flex-col gap-2 items-center justify-around">
            <Button variant="secondary" className="w-full rounded-xl">
              <a href={nyaaUrl}>
                <Magnet />
                <span className="pl-2 hidden sm:block">
                  Download from nyaa.si
                </span>
              </a>
            </Button>
            <Button variant="secondary" className="w-full rounded-xl" asChild>
              <a href={aniwaveUrl}>
                <Video />
                <span className="pl-2 hidden sm:block">
                  Watch at aniwave.to
                </span>
              </a>
            </Button>
          </div>

          <form action={markEpisodeAsWatched}>
            <Button className="w-full rounded-xl">
              <Eye />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
