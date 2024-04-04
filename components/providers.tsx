import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "./ui/tooltip";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class">
      <TooltipProvider>{children}</TooltipProvider>
    </ThemeProvider>
  );
}
