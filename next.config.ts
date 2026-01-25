import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: '/api/binance/:path*',
        destination: 'https://p2p.binance.com/:path*',
      },
    ]
  },
};

export default nextConfig;
