import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

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
    <html lang="en" suppressHydrationWarning>
      <body className={poppins.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
