import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  transpilePackages: ["@preview-wallet/wallet"],
  turbopack: {
    root: path.join(__dirname, "../.."),
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@react-native-async-storage/async-storage": false,
    };

    return config;
  },
};

export default nextConfig;
