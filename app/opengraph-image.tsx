import { ImageResponse } from "next/og";
import { site } from "@/content/site";
import { OgFrame, OG_SIZE, ogFonts } from "@/lib/og";

export const alt = `${site.name} | ${site.tagline}`;
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <OgFrame
        eyebrow="Automation & AI for small businesses"
        headline="Your business runs better when the busywork runs itself."
        card={{
          title: "Missed call texted back",
          sub: "They heard from you in seconds",
        }}
      />
    ),
    { ...size, fonts: await ogFonts() }
  );
}
