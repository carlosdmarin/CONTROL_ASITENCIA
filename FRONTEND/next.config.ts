import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    viewTransition: true,
  },

  allowedDevOrigins: ["*.trycloudflare.com"],

  async rewrites() {
    // Para pruebas locales con Cloudflare Tunnel:
    // - Frontend Tunnel -> localhost:3000
    // - Backend Tunnel  -> localhost:8080
    // Con rewrites SAME-ORIGIN (/api), el navegador solo habla con el Frontend
    // y Next.js hace proxy interno a localhost:8080. No requiere backend tunnel para API,
    // pero el backend tunnel queda disponible para pruebas directas a /api.
    // Si necesitas apuntar a backend remoto, usa BACKEND_URL env (ej: https://xxx.trycloudflare.com)
    const backendUrl = process.env.BACKEND_URL || "http://localhost:8080";
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;