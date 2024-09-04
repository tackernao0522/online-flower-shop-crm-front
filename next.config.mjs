/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverRuntimeConfig: {
    // サーバーサイドでのみ利用可能な設定
    // 例: API_SECRET: process.env.API_SECRET,
  },
  publicRuntimeConfig: {
    // クライアントサイドでも利用可能な設定
    // 例: API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  // 必要に応じて追加の設定をここに記述
  // 例:
  // images: {
  //   domains: ['example.com'],
  // },
  // webpack: (config, { isServer }) => {
  //   // カスタムWebpack設定
  //   return config;
  // },
};

export default nextConfig;
