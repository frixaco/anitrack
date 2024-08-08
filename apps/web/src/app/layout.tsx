import "./globals.css";

import type { Metadata } from "next";
import { Poppins } from "next/font/google";

import { ClerkProvider } from "@clerk/nextjs";
import { NextThemeProvider } from "./_providers/next-theme";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TailwindIndicator } from "@/components/ui/tailwind-indicator";
import { ReactQueryProvider } from "./_providers/react-query";

import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { Header } from "./_components/header";

const poppins = Poppins({
  weight: ["200", "400", "600", "800"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Anitrack by @frixaco",
  description: "Track Anime releases on nyaa.si and aniwave.to",
};

export default function RootLayout({
  main,
}: Readonly<{
  children: React.ReactNode;
  drawer: React.ReactNode;
  main: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <ClerkProvider>
        <body
          className={cn(
            "min-h-screen bg-background font-sans antialiased",
            poppins.className,
          )}
        >
          <NextThemeProvider>
            <ReactQueryProvider>
              <TooltipProvider>
                <Header />

                <main className="flex flex-col px-4 gap-8">
                  {main}
                  {/* {children} */}
                </main>

                <TailwindIndicator />
                <Toaster />
              </TooltipProvider>
            </ReactQueryProvider>
          </NextThemeProvider>
        </body>
      </ClerkProvider>
    </html>
  );
}
