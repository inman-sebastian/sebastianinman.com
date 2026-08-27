import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Serve AVIF where supported, WebP otherwise. Source files stay JPEG
    // (see scripts/optimize-images.ts); the optimizer converts at
    // request time and Vercel caches the variants at the edge.
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
