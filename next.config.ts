import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: "/flask/:path*",
        destination: "http://localhost:5000/flask/:path*",
      }
    ];
  }
};

export default nextConfig;
