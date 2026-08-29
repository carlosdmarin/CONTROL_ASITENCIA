import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    viewTransition: true,
  },

  allowedDevOrigins: [
    "genome-high-mirror-platforms.trycloudflare.com",
  ],
};

export default nextConfig;