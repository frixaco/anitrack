import Image from "next/image";
import { StopCircle } from "lucide-react";
import { continueTrackingRelease, untrackRelease } from "@/server/queries";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Release } from "../@episodes/page";
import { AspectRatio } from "@/components/ui/aspect-ratio";

export default async function TrackedReleaseCard({
  release,
  asRelease,
  isTracking,
}: {
  release: Release;
  asRelease?: boolean;
  isTracking: boolean;
}) {
  const { episodeNumber, releaseId, seasonNumber, title, thumbnailUrl } =
    release;

  async function handleRelease() {
    "use server";

    if (isTracking) {
      await untrackRelease(releaseId);
    } else {
      await continueTrackingRelease(releaseId);
    }
  }

  return (
    <Card className="relative w-64 flex flex-col justify-between p-4 gap-4">
      {!asRelease && (
        <Badge className="absolute drop-shadow-lg z-10 left-2 top-2 text-xl">
          E{episodeNumber} - S{seasonNumber}
        </Badge>
      )}

      <AspectRatio ratio={2 / 3} className="relative p-0">
        <Image
          className="object-fit rounded-md"
          fill
          alt={title}
          src={thumbnailUrl}
        />
      </AspectRatio>

      <CardContent className="flex-1 flex flex-col justify-between p-0">
        <CardTitle className="text-lg text-balance pb-4">{title}</CardTitle>

        {isTracking ? (
          <form className="w-full" action={handleRelease}>
            <Button variant="secondary" className="w-full rounded-xl">
              <StopCircle />
              <span className="pl-2 hidden sm:block">Stop tracking</span>
            </Button>
          </form>
        ) : (
          <Button
            disabled
            aria-disabled
            variant="secondary"
            className="w-full rounded-xl"
          >
            <StopCircle />
            <span className="pl-2 hidden sm:block">Not tracking</span>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
