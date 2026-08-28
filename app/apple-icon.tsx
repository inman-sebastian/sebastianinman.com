import { ImageResponse } from "next/og";

/**
 * Apple touch icon: the terracotta sun dot on the site's cream, since
 * iOS home-screen icons can't be transparent. Full-bleed; iOS rounds
 * its own corners.
 */

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          background: "#faf6ef",
        }}
      >
        <div
          style={{
            width: 104,
            height: 104,
            borderRadius: 9999,
            background: "#c05f33",
          }}
        />
      </div>
    ),
    size
  );
}
