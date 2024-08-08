import { StopCircle } from "lucide-react";
import { continueTrackingRelease, untrackRelease } from "@/server/queries";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Release } from "../@main/episodes/page";

export default async function TrackedReleaseCard({
  release,
  isTracking,
}: {
  release: Release;
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
    <Card className="flex flex-col justify-between p-4 gap-4">
      <CardContent className="flex-1 flex flex-col justify-between p-0">
        <CardTitle className="text-lg text-balance pb-4">{title}</CardTitle>

        <p className="font-bold text-lg pt-2">Season: {seasonNumber}</p>

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
