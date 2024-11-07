"use client";

import { Button } from "./ui/button";
import { ExternalLink } from "lucide-react";

export function OpenHianimeButton({ episodeUrl }: { episodeUrl: string }) {
  return (
    <Button
      className="bg-purple-400 font-bold flex-1"
      onClick={() => {
        window.open(episodeUrl, "_blank");
      }}
    >
      <ExternalLink className="inline-flex" size={16} />
    </Button>
  );
}
