"use client";

import { useEffect, useRef } from "react";

interface TorrentPlayerProps {
  magnetLink: string;
}

export default function TorrentPlayer({ magnetLink }: TorrentPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!videoRef.current || !magnetLink) return;

    const streamUrl = `https://api.anitrack.frixaco.com/stream?magnet=${encodeURIComponent(
      magnetLink
    )}`;
    videoRef.current.src = streamUrl;

    videoRef.current.load();
  }, [magnetLink]);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-4 text-sm text-gray-500 truncate">
        <span>Magnet link: {magnetLink}</span>
      </div>

      <video
        ref={videoRef}
        controls
        autoPlay
        className="w-full rounded-lg shadow-lg bg-black"
        style={{ aspectRatio: "16/9" }}
      >
        <source type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className="mt-4 text-sm text-gray-500">
        Note: Video may take a few moments to start as the torrent begins
        downloading.
      </div>
    </div>
  );
}
