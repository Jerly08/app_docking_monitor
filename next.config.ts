import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure proper handling of CSS-in-JS during SSR
  compiler: {
    emotion: true,
  },
  // Fix for Next.js 15.5.3 client reference manifest bug
  serverExternalPackages: [],
  // Ensure proper module resolution
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

export default nextConfig;
