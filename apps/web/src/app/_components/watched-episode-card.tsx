import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Magnet, Video } from "lucide-react";
import { WatchedEpisode } from "../@main/history/page";
import Link from "next/link";

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
    <Card className="flex flex-col p-2">
      <CardContent className="flex flex-row gap-2 justify-between p-0">
        <div className="text-lg text-balance flex flex-col gap-2">
          <span>{title}</span>

          <p className="font-bold text-lg flex-1">Episode: {episodeNumber}</p>

          <p>Season: {seasonNumber}</p>
        </div>

        <div className="flex flex-col gap-2 items-center justify-start">
          <Button variant="secondary" className="w-full rounded-xl" asChild>
            <Link target="_blank" href={nyaaUrl}>
              <Magnet />
            </Link>
          </Button>
          <Button variant="secondary" className="w-full rounded-xl" asChild>
            <Link target="_blank" href={aniwaveUrl}>
              <Video />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
