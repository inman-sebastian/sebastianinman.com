import { ImageResponse } from "next/og";

/**
 * Apple touch icon: the same sawtooth landscape as app/icon.svg, but
 * full-bleed (iOS rounds the corners itself) and rendered as PNG.
 */

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%" }}>
        <svg width="180" height="180" viewBox="0 0 64 64">
          <rect width="64" height="64" fill="#234f3e" />
          <circle cx="45" cy="21" r="8" fill="#c05f33" />
          <path
            d="M0 47 L8 39 L16 47 L24 39 L32 47 L40 39 L48 47 L56 39 L64 47 L64 64 L0 64 Z"
            fill="#faf6ef"
          />
        </svg>
      </div>
    ),
    size
  );
}
