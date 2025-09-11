import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: "/:path*",
        destination: "https://artist-recommender-1.onrender.com/:path*",
      }
    ];
  }
};

export default nextConfig;
