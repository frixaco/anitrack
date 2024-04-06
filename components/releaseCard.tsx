import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import Image from "next/image";
import { AspectRatio } from "./ui/aspect-ratio";
import { Badge } from "./ui/badge";
import { randomUUID } from "crypto";
import { Eye, Magnet, Video } from "lucide-react";
import { Button } from "./ui/button";

export default async function ReleaseCard({ latestEpisode }) {
  return (
    <Card className="relative" key={randomUUID()}>
      <Badge className="absolute drop-shadow-lg z-10 right-2 top-2 text-xl">
        E{latestEpisode.season} - S{latestEpisode.episode}
      </Badge>

      <CardHeader className="relative w-[280px] max-w-full pb-2">
        <AspectRatio ratio={2 / 3}>
          <Image
            className="rounded-md"
            fill
            alt={latestEpisode.title}
            src={latestEpisode.thumbnailUrl}
          />
        </AspectRatio>
      </CardHeader>

      <CardContent>
        <CardTitle className="text-lg text-balance">
          {latestEpisode.title}
        </CardTitle>

        <div className="flex flex-col gap-4">
          <div className="pt-2 flex flex-col gap-2 items-center justify-around">
            <Button variant="secondary" className="w-full rounded-xl">
              <Magnet />
              <span className="pl-2 hidden sm:block">
                Download from nyaa.si
              </span>
            </Button>
            <Button variant="secondary" className="w-full rounded-xl">
              <Video />
              <span className="pl-2 hidden sm:block">Watch at 9animetv.to</span>
            </Button>
          </div>

          <Button className="w-full rounded-xl">
            <Eye />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
