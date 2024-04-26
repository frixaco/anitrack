import Image from "next/image";
import { Magnet, Video } from "lucide-react";
import { markEpisodeWatched } from "@/server/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
    <Card className="relative min-w-96 flex flex-row h-64 p-4 gap-4">
      {!asRelease && (
        <Badge className="absolute drop-shadow-lg z-10 left-2 top-2 text-xl">
          E{episodeNumber} - S{seasonNumber}
        </Badge>
      )}

      <div className="relative w-2/5 p-0 h-full">
        <Image
          className="object-cover rounded-md"
          fill
          alt={title}
          src={thumbnailUrl}
        />
      </div>

      <CardContent className="flex flex-col justify-between h-full w-3/5 p-0">
        <CardTitle className="text-lg text-balance">{title}</CardTitle>

        <div className="flex flex-col gap-2 items-center justify-around">
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
              <span className="pl-2 hidden sm:block">Watch at aniwave.to</span>
            </a>
          </Button>
        </div>

        <form className="w-full" action={markEpisodeAsWatched}>
          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  );
}
