import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

const nextConfig = (phase: string): NextConfig => ({
  images:
    phase === PHASE_DEVELOPMENT_SERVER
      ? // Dev: serve straight from public/ with no optimizer. The dev
        // optimizer's persistent cache kept serving stale copies of
        // replaced images (the old npm run dev:fresh dance); skipping it
        // entirely means a normal refresh always shows the current file.
        { unoptimized: true }
      : // Prod: AVIF then WebP; Vercel caches variants at the edge.
        { formats: ["image/avif", "image/webp"] },
});

export default nextConfig;
