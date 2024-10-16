/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.NODE_ENV === "production" ? "export" : undefined,
  reactStrictMode: false,
  crossOrigin: "anonymous",
  publicRuntimeConfig: {
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
    domains: ["example.com"],
  },
  async rewrites() {
    if (process.env.NODE_ENV === "development") {
      return [
        {
          source: "/api/:path*",
          destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`,
        },
      ];
    }
    return [];
  },
  swcMinify: true,
};

export default nextConfig;
