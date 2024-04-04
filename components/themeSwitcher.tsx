"use client";
import { useTheme } from "next-themes";
import { MoonStar, Sun } from "lucide-react";
import { Switch } from "./ui/switch";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "./ui/skeleton";

export default function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const [_, setChecked] = useState(false);

  const { theme, setTheme } = useTheme();
  console.log(theme);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <Skeleton className="w-[4.5rem] h-[1.5rem] rounded-xl" />;
  }

  return (
    <div className="flex items-center gap-2">
      <MoonStar className={cn(theme === "dark" ? "inline" : "hidden")} />
      <Sun className={cn(theme === "light" ? "inline" : "hidden")} />

      <Switch
        defaultChecked={theme === "dark"}
        onCheckedChange={(e) => {
          setChecked(e);
          setTheme(e ? "dark" : "light");
        }}
        aria-readonly
      />
    </div>
  );
}
