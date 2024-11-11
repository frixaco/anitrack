import { Suspense } from "react";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const magnetLink = (await searchParams).url as string;

  const res = await fetch("https://api.anitrack.frixaco.com/torrents", {
    method: "POST",
    body: magnetLink,
  });
  const torrentInfo = await res.json();
  console.log(torrentInfo);

  const infoHash = torrentInfo.details.info_hash;
  const fileIdx = torrentInfo.id;

  if (typeof infoHash !== "string") {
    throw new Error("Invalid infohash");
  }
  if (!Number.isFinite(fileIdx)) {
    throw new Error("Invalid file index");
  }

  const streamUrl = `https://api.anitrack.frixaco.com/torrents/${infoHash}/stream/${fileIdx}`;

  return (
    <Suspense fallback={<div>loading the player...</div>}>
      <div className="h-screen w-full flex items-center justify-center">
        <div className="w-full max-w-4xl mx-auto">
          <p className="pb-4 overflow-auto text-sm text-gray-500 line-clamp-2">
            magnet link: {magnetLink}
          </p>
          <video
            controls
            autoPlay
            className="w-full rounded-lg shadow-lg bg-black"
            style={{ aspectRatio: "16/9" }}
            src={streamUrl}
          >
            Your browser does not support the video tag.
          </video>
          <div className="mt-4 text-sm text-gray-500">
            Note: Video may take a few moments to start as the torrent begins
            downloading.
          </div>
        </div>
      </div>
    </Suspense>
  );
}
