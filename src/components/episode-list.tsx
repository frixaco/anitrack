"use client";

import { cn } from "@/lib/utils";

type Props = {
  className?: string;
};

export function EpisodeList({ className }: Props) {
  return (
    <div
      className={cn(
        "grid p-4 gap-4 rounded-md border border-dashed overflow-hidden bg-background",
        className
      )}
    >
      <div className="rounded-md max-w-[210px] max-h-[280px] flex flex-col p-4 z-10 relative border border-dashed justify-between group hover:cursor-pointer">
        <div
          className="rounded-md absolute bg-cover inset-1 brightness-[60%] -z-10 transition-all duration-300 origin-center group-hover:scale-[1.03]"
          style={{
            backgroundImage:
              "url(https://cdn.noitatnemucod.net/thumbnail/300x400/100/8ed3a4df2e8f22be9916959c96e5e3e2.jpg)",
          }}
        ></div>
        <div className="flex flex-col gap-2 font-bold">
          <h1 className="text-lg text-white [text-shadow:_0_2px_1px_rgb(0_0_0_/_100%)]">
            Blue Lock Season 2
          </h1>

          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-col gap-1">
              <span className="text-white text-xs [text-shadow:_0_2px_1px_rgb(0_0_0_/_100%)]">
                {/* <Video className="inline-flex" size={24} /> 24 */}
                24 episodes
              </span>
              <span className="text-white text-xs [text-shadow:_0_2px_1px_rgb(0_0_0_/_100%)]">
                {/* <CalendarDays className="inline-flex" size={24} /> 2024 */}
                2024, Spring
              </span>
            </div>

            <span className="text-6xl font-bold text-white [text-shadow:_0_2px_1px_rgb(0_0_0_/_100%)]">
              4
            </span>
          </div>
        </div>

        <span className="self-end text-sm text-white font-semibold">[b]</span>
      </div>
    </div>
  );
}
