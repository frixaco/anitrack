import Image from "next/image";
import { StopCircle } from "lucide-react";
import { continueTrackingRelease, untrackRelease } from "@/server/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Release } from "../@episodes/page";

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
          <form action={handleRelease}>
            <Button
              disabled={!isTracking}
              aria-disabled={!isTracking}
              variant="secondary"
              className="w-full rounded-xl"
            >
              <StopCircle />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
