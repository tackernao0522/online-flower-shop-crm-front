/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Fast Refreshを利用するために必要
  crossOrigin: "anonymous",
  serverRuntimeConfig: {
    // サーバーサイドでのみ利用可能な設定
    // 例: API_SECRET: process.env.API_SECRET,
  },
  publicRuntimeConfig: {
    // クライアントサイドでも利用可能な設定
    API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  // Rechartsの警告を抑制
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.ignoreWarnings = [{ module: /node_modules\/recharts/ }];
    }

    // 正規表現を修正
    config.module.rules.push({
      test: /(_tests_|__tests__|\.test\.(js|jsx|ts|tsx))$/,
      use: "ignore-loader",
    });

    return config;
  },
  // 画像最適化の設定（必要に応じて）
  images: {
    domains: ["example.com"],
  },
  // APIルートの設定
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
