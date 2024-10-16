/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.NODE_ENV === "production" ? "export" : undefined,
  reactStrictMode: false, // 必要に応じて true に変更
  crossOrigin: "anonymous",
  serverRuntimeConfig: {
    // サーバーサイドでのみ利用可能な設定
    // 例: API_SECRET: process.env.API_SECRET,
  },
  publicRuntimeConfig: {
    // クライアントサイドでも利用可能な設定
    API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.ignoreWarnings = [{ module: /node_modules\/recharts/ }];
    }

    config.module.rules.push({
      test: /(_tests_|__tests__|\.test\.(js|jsx|ts|tsx))$/,
      use: "ignore-loader",
    });

    return config;
  },
  images: {
    domains: ["example.com"], // 必要に応じて調整
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`,
      },
    ];
  },
  swcMinify: true,
};

export default nextConfig;
