// import type { NextConfig } from "next";

const nextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
        {
            protocol: 'https',
            hostname: 'i.imgur.com',
        }
    ]
  }
};

export default nextConfig;
