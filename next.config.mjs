/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  crossOrigin: "anonymous",
  serverRuntimeConfig: {
    // サーバーサイドでのみ利用可能な設定
  },
  publicRuntimeConfig: {
    // クライアントサイドでも利用可能な設定
    API_URL: process.env.NEXT_PUBLIC_API_URL,
    BASIC_AUTH_USER: process.env.BASIC_AUTH_USER,
    BASIC_AUTH_PASS: process.env.BASIC_AUTH_PASS,
  },
  // Rechartsの警告を抑制とMessageChannelの警告を抑制
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.ignoreWarnings = [
        { module: /node_modules\/recharts/ },
        // MessageChannelの警告を抑制
        { message: /.*message channel closed.*/ },
        { message: /.*asynchronous response.*/ },
      ];
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
