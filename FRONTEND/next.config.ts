import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    viewTransition: true,
  },

  allowedDevOrigins: ["*.trycloudflare.com"],
};

export default nextConfig;