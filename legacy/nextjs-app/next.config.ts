import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "cdn.noitatnemucod.net",
      },
    ],
  },
};

export default nextConfig;
