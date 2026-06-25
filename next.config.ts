import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: [
    "https://preview-chat-7baa410a-ef36-4811-82a5-699a5c950b7e.space-z.ai",
    "http://21.0.14.79:3000",
    "http://21.0.14.79",
  ],
};

export default nextConfig;