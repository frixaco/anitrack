import { Suspense } from "react";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const magnetLink = (await searchParams).url as string;
  let streamUrl: string | null = null;

  let res = await fetch("https://api.anitrack.frixaco.com/torrents", {
    method: "POST",
    body: magnetLink,
  });

  if (res.status === 409) {
    console.log("torrent already exists...");
    res = await fetch(`https://api.anitrack.frixaco.com/torrents`);
    const torrents = (await res.json()).torrents;
    const torrent = torrents.find((t: { info_hash: string }) =>
      magnetLink.includes(t.info_hash)
    );
    res = await fetch(
      `https://api.anitrack.frixaco.com/torrents/${torrent.id}`
    );
    const torrentInfo = await res.json();
    console.log("fetched existing torrent...", torrentInfo);

    const infoHash = torrentInfo.info_hash;
    const fileIdx = torrentInfo.files.length - 1; // always one file

    streamUrl = `https://api.anitrack.frixaco.com/torrents/${infoHash}/stream/${fileIdx}`;
  } else {
    const torrentInfo = await res.json();
    console.log("added new torrent...", torrentInfo);

    const infoHash = torrentInfo.details.info_hash;
    const fileIdx = torrentInfo.details.files.length - 1; // always one file

    if (typeof infoHash !== "string") {
      throw new Error("Invalid infohash");
    }
    if (!Number.isFinite(fileIdx)) {
      throw new Error("Invalid file index");
    }

    streamUrl = `https://api.anitrack.frixaco.com/torrents/${infoHash}/stream/${fileIdx}`;
  }

  return (
    <Suspense fallback={<div>loading the player...</div>}>
      <div className="h-screen w-full flex items-center justify-center">
        <div className="w-full max-w-4xl mx-auto">
          <p className="pb-8 overflow-auto text-sm text-gray-500 line-clamp-2">
            magnet link: {magnetLink}
          </p>
          {streamUrl && (
            <video
              controls
              autoPlay
              className="w-full rounded-lg shadow-lg bg-black"
              style={{ aspectRatio: "16/9" }}
              src={streamUrl}
            >
              Your browser does not support the video tag.
            </video>
          )}
          <div className="mt-4 text-sm text-gray-500">
            Note: Video may take a few moments to start as the torrent begins
            downloading.
          </div>
        </div>
      </div>
    </Suspense>
  );
}
