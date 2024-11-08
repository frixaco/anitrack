"use client";

import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const TorrentPlayer = dynamic(() => import("../../components/torrent-player"), {
  ssr: false,
});

const AnnoyingWrapper = () => {
  const searchParams = useSearchParams();
  const url = searchParams.get("url");
  if (!url) {
    return <div>No URL provided</div>;
  }

  return (
    <div>
      <TorrentPlayer magnetLink={url} />
    </div>
  );
};

export default function Page() {
  return (
    <Suspense fallback={<div>loading the player...</div>}>
      <AnnoyingWrapper />
    </Suspense>
  );
}
