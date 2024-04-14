import "./globals.css";

import type { Metadata } from "next";
import { Poppins } from "next/font/google";

import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "./_components/navbar";

import { ClerkProvider } from "@clerk/nextjs";
import { CSPostHogProvider } from "./_providers/analytics";
import { NextThemeProvider } from "./_providers/next-theme";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TailwindIndicator } from "@/components/ui/tailwind-indicator";

const poppins = Poppins({
  weight: ["200", "400", "600", "800"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Anitrack by @frixaco",
  description: "Track Anime releases through nyaa.si and 9animetv.to",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <CSPostHogProvider>
        <html lang="en" suppressHydrationWarning>
          <body
            className={cn(
              "min-h-screen bg-background font-sans antialiased",
              poppins.className,
            )}
          >
            <NextThemeProvider>
              <TooltipProvider>
                <Navbar />
                {children}

                <TailwindIndicator />
                <Toaster />
              </TooltipProvider>
            </NextThemeProvider>
          </body>
        </html>
      </CSPostHogProvider>
    </ClerkProvider>
  );
}
