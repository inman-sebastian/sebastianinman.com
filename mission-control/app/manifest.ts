import type { MetadataRoute } from "next";

/**
 * Installable so it gets its own window and its own icon in the dock.
 *
 * The point is not offline support: this app reads and writes files in
 * the repo it is running from, so it is useless without its own server
 * anyway. The point is that a long agent run can be left to get on with
 * it in a window of its own, and say so when it is done.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mission Control",
    short_name: "Mission Control",
    description: "Local control center for Sebastian Inman's business.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#faf6ef",
    theme_color: "#234f3e",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
