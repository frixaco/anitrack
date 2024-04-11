import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import Image from "next/image";
import { AspectRatio } from "./ui/aspect-ratio";
import { Badge } from "./ui/badge";
import { Trash } from "lucide-react";
import { Button } from "./ui/button";
import { untrackRelease } from "@/app/actions/untrackRelease";
import { Release } from "./newEpisodesSection";

export default async function TrackedReleaseCard({
  episode,
  asRelease,
}: {
  episode: Release;
  asRelease?: boolean;
}) {
  const { episodeNumber, releaseId, seasonNumber, title, thumbnailUrl } =
    episode;

  const untrackReleaseById = untrackRelease.bind(null, releaseId);

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

        <div className="flex flex-col pt-4">
          <form action={untrackReleaseById}>
            <Button variant="secondary" className="w-full rounded-xl">
              <Trash />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
