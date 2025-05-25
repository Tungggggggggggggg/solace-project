import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      'lh3.googleusercontent.com', // Google user avatars
      'platform-lookaside.fbsbx.com', // Facebook user avatars
      'graph.facebook.com' // Facebook user avatars (alternate domain)
    ],
  },
};

export default nextConfig;
