import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '4.5mb',
    },
  },
};

export const maxDuration = 60; // Support long-running AI analysis

export default nextConfig;
