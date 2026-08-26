import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.0.102"],
  serverExternalPackages: [
    "sharp",
    "pdfjs-dist",
    "openai",
    "@napi-rs/canvas",
  ],
  // Allow ~10MB uploads (+ multipart overhead) for assessment files.
  experimental: {
    serverActions: {
      bodySizeLimit: "12mb",
    },
  },
};

export default nextConfig;
