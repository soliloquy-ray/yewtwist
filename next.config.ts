import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // If you're using styled-components
  compiler: {
    styledComponents: true,
  }
};

export default nextConfig;
