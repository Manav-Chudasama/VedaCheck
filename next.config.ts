import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.0.102"],
  serverExternalPackages: ["sharp", "pdfjs-dist", "@google/genai"],
};

export default nextConfig;
