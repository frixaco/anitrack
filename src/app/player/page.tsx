"use client";

import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";

const TorrentPlayer = dynamic(() => import("../../components/torrent-player"), {
  ssr: false,
});

export default function Page() {
  const searchParams = useSearchParams();
  //   const url = "https://nyaa.si/download/1896535.torrent";
  //   const url =
  //     "magnet:?xt=urn:btih:64c2d63e1b465e91318f0df17b830566efb2ac2b&dn=%5BSubsPlease%5D%20Another%20Journey%20to%20the%20West%20-%2009%20%281080p%29%20%5B136D5393%5D.mkv&tr=http%3A%2F%2Fnyaa.tracker.wf%3A7777%2Fannounce&tr=udp%3A%2F%2Fopen.stealth.si%3A80%2Fannounce&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337%2Fannounce&tr=udp%3A%2F%2Fexodus.desync.com%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.torrent.eu.org%3A451%2Fannounce";
  const url = searchParams.get("url");
  if (!url) {
    return <div>No URL provided</div>;
  }

  return (
    <div>
      <span>Magnet link: {url}</span>

      <TorrentPlayer magnetURI={url} />
    </div>
  );
}
