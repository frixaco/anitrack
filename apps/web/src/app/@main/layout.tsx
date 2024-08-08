"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

function Tab({
  isActive,
  title,
  url,
}: {
  isActive: boolean;
  title: string;
  url: string;
}) {
  return (
    <Link
      className={cn(
        "lg:text-xl rounded-full px-4 py-2 bg-secondary cursor-pointer text-center",
        {
          "bg-white text-black": isActive,
        },
      )}
      href={url}
    >
      {title}
    </Link>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-4">
      <nav className="flex flex-col sm:flex-row gap-4 sm:mx-auto">
        <Tab
          isActive={pathname === "/episodes"}
          title="New Episodes"
          url="/episodes"
        />

        <Tab
          isActive={pathname === "/tracked"}
          title="Tracked Releases"
          url="/tracked"
        />

        <Tab
          isActive={pathname === "/history"}
          title="Watch History"
          url="/history"
        />
      </nav>
      {children}
    </div>
  );
}
