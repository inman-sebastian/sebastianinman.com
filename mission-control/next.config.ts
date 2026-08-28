import type { NextConfig } from "next";

/**
 * Mission Control runs on this machine only. It reads and writes client
 * records in ./data (git-ignored) and reads the website's content files
 * one directory up, so file tracing has to reach outside this folder.
 */
const nextConfig: NextConfig = {
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
