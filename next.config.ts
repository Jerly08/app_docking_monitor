import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure proper handling of CSS-in-JS during SSR
  compiler: {
    emotion: true,
  },
};

export default nextConfig;
