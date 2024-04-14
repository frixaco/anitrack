import Image from "next/image";
import { Trash } from "lucide-react";
import { Release } from "./new-episodes-section";
import { untrackRelease } from "@/server/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
