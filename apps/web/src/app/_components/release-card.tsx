import Image from "next/image";
import { Magnet, Video } from "lucide-react";
import { markEpisodeWatched } from "@/server/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Release } from "../@episodes/page";
import { SubmitButton } from "./release-card-submit-btn";

export default async function ReleaseCard({
  episode,
  asRelease,
}: {
  episode: Release;
  asRelease?: boolean;
}) {
  const {
    episodeNumber,
    releaseId,
    nyaaUrl,
    aniwaveUrl,
    seasonNumber,
    title,
    thumbnailUrl,
  } = episode;

  const markEpisodeAsWatched = markEpisodeWatched.bind(null, {
    lastWatchedEpisode: episodeNumber,
    releaseId,
    nyaaUrl,
    aniwaveUrl,
    seasonNumber,
  });

  return (
    <Card className="relative">
      {!asRelease && (
        <Badge className="absolute drop-shadow-lg z-10 right-2 top-2 text-xl">
          E{episodeNumber} - S{seasonNumber}
        </Badge>
      )}

      <CardHeader className="relative w-[280px] max-w-full pb-2">
        <AspectRatio ratio={2 / 3}>
          <Image className="rounded-md" fill alt={title} src={thumbnailUrl} />
        </AspectRatio>
      </CardHeader>

      <CardContent>
        <CardTitle className="text-lg text-balance">{title}</CardTitle>

        <div className="flex flex-col gap-4">
          <div className="pt-2 flex flex-col gap-2 items-center justify-around">
            <Button variant="secondary" className="w-full rounded-xl" asChild>
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
            <SubmitButton />
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
