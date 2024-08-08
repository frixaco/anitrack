import { Magnet, Video } from "lucide-react";
import { markEpisodeWatched } from "@/server/queries";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Release } from "../@main/episodes/page";
import { SubmitButton } from "./release-card-submit-btn";
import Link from "next/link";

export default async function NewEpisodeCard({
  episode,
}: {
  episode: Release;
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
    <Card className="flex flex-col p-4">
      <CardContent className="flex flex-col gap-2 justify-between h-full p-0">
        <CardTitle className="text-lg text-balance">{title}</CardTitle>

        <p className="font-bold text-lg pt-2">Episode: {episodeNumber}</p>

        <p>Season: {seasonNumber}</p>

        <div className="flex flex-col gap-2 items-center justify-around">
          <Button variant="secondary" className="w-full rounded-xl" asChild>
            <Link target="_blank" href={nyaaUrl}>
              <Magnet />
              <span className="pl-2 hidden lg:block">
                Download from nyaa.si
              </span>
            </Link>
          </Button>
          <Button variant="secondary" className="w-full rounded-xl" asChild>
            <Link target="_blank" href={aniwaveUrl}>
              <Video />
              <span className="pl-2 hidden lg:block">Watch at aniwave.to</span>
            </Link>
          </Button>
        </div>

        <form className="w-full" action={markEpisodeAsWatched}>
          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  );
}
