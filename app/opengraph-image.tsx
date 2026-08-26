import { ImageResponse } from "next/og";
import { site } from "@/content/site";

export const alt = `${site.name} | ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#18382c",
          color: "#faf6ef",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ fontSize: 64, fontWeight: 700 }}>{site.name}</div>
        <div
          style={{
            marginTop: 24,
            fontSize: 36,
            color: "#e9f0ea",
            maxWidth: 900,
          }}
        >
          {site.tagline}
        </div>
        <div
          style={{
            marginTop: 48,
            fontSize: 26,
            color: "#c05f33",
            display: "flex",
          }}
        >
          sebastianinman.com
        </div>
      </div>
    ),
    { ...size }
  );
}
