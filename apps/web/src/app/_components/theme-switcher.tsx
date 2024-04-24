"use client";

import { useTheme } from "next-themes";
import { MoonStar, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";

export default function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const [_, setChecked] = useState(false);

  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
    setTheme("dark");
  }, [setTheme]);

  if (!mounted) {
    return null;
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
