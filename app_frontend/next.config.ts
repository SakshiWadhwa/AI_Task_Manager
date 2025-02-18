import type { NextConfig } from "next";

const nextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/login',
        permanent: false, // Change to `true` if this should be permanent
      },
    ];
  },
};

module.exports = nextConfig;
