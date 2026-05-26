import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse", "@xenova/transformers", "sharp", "tesseract.js"],
}

export default nextConfig
