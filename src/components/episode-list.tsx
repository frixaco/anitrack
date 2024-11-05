"use client";

import { cn } from "@/lib/utils";

type Props = {
  className?: string;
};

export function EpisodeList({ className }: Props) {
  return (
    <div
      className={cn(
        "grid p-4 gap-4 rounded-lg border border-dashed",
        className
      )}
    >
      <div className="rounded-lg max-w-[300px] max-h-[400px] flex flex-col p-4 relative border border-dashed">
        <div
          className="rounded-lg absolute bg-cover inset-1 brightness-50 -z-10"
          style={{
            backgroundImage:
              "url(https://cdn.noitatnemucod.net/thumbnail/300x400/100/8ed3a4df2e8f22be9916959c96e5e3e2.jpg)",
          }}
        ></div>
        <h1 className="text-2xl font-bold">Blue Lock Season 2</h1>

        <span>Total episodes: 24</span>
        <span>Year: 2024</span>
        <span>Season: Spring</span>
        <span className="text-4xl font-bold">4</span>

        <span className="text-sm">[b]</span>
      </div>
    </div>
  );
}
