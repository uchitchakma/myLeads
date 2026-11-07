import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "localhost", "127.0.0.1:3000", "localhost:3000"],
  serverExternalPackages: ["@whiskeysockets/baileys", "pino"],
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
