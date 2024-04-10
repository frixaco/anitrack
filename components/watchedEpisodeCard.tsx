import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import Image from "next/image";
import { AspectRatio } from "./ui/aspect-ratio";
import { Badge } from "./ui/badge";
import { Magnet, Video } from "lucide-react";
import { Button } from "./ui/button";
import { WatchedEpisode } from "./watchHistory";

export default async function WatchedEpisodeCard({
  episode,
}: {
  episode: WatchedEpisode;
}) {
  const {
    title,
    episodeNumber,
    seasonNumber,
    thumbnailUrl,
    nyaaUrl,
    aniwaveUrl,
  } = episode;

  return (
    <Card className="relative">
      <Badge className="absolute drop-shadow-lg z-10 right-2 top-2 text-xl">
        E{seasonNumber} - S{episodeNumber}
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
        </div>
      </CardContent>
    </Card>
  );
}
