import type { NextConfig } from "next";

const replitDevDomain = process.env.REPLIT_DEV_DOMAIN;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Required for Docker multi-stage production build (copies only what's needed)
  output: process.env.NODE_ENV === "production" ? "standalone" : undefined,
  // Allow all hosts — required for Replit's proxied preview iframe
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    ...(replitDevDomain ? [replitDevDomain] : []),
  ],
  experimental: {
    // TypeScript 7 removed the compiler API Next.js uses; this flag uses
    // the TS CLI directly instead. Can be removed once Next.js 16 catches up.
    useTypeScriptCli: true,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
