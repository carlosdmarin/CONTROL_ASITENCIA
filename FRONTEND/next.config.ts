import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    viewTransition: true,
  },

  allowedDevOrigins: ["*.trycloudflare.com"],

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://returning-funny-officers-halo.trycloudflare.com/api/:path*",
      },
    ];
  },
};

export default nextConfig;