// import type { NextConfig } from "next";

const nextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
        {
            protocol: 'https',
            hostname: 'i.imgur.com',
        },
        {
            protocol: 'https',
            hostname: 'img.clerk.com',
        }
    ]
  }
};

export default nextConfig;
