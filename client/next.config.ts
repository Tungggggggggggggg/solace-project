import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      'lh3.googleusercontent.com', // Google user avatars
      'platform-lookaside.fbsbx.com', // Facebook user avatars
      'graph.facebook.com' // Facebook user avatars (alternate domain)
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5000/api/:path*'
      }
    ];
  }
};

export default nextConfig;
