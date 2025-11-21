import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: {
    buildActivity: false, // 左下のNext.jsインジケーターを非表示
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Pyodideはブラウザ専用なので、Node.jsモジュールを除外
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        child_process: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

export default nextConfig;
