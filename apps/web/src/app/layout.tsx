import "./globals.css";

import type { Metadata } from "next";
import { Poppins } from "next/font/google";

import { ClerkProvider } from "@clerk/nextjs";
import { CSPostHogProvider } from "./_providers/analytics";
import { NextThemeProvider } from "./_providers/next-theme";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TailwindIndicator } from "@/components/ui/tailwind-indicator";

import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { Header } from "./_components/header";

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
  drawer,
  episodes,
  history,
  releases,
}: Readonly<{
  children: React.ReactNode;
  drawer: React.ReactNode;
  episodes: React.ReactNode;
  history: React.ReactNode;
  releases: React.ReactNode;
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
                <Header />

                <main className="flex flex-col gap-6 p-4">
                  {children}
                  {drawer}
                  {episodes}
                  {history}
                  {releases}
                </main>

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
