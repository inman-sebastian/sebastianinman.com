import { ImageResponse } from "next/og";
import { getService } from "@/lib/content";
import { OgFrame, OG_SIZE, ogFonts } from "@/lib/og";

/**
 * Per-service share cards: title as the headline, the summary as the
 * supporting line, and the starting price in the eyebrow.
 */

export const alt = "Service";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function ServiceOgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getService(slug);

  return new ImageResponse(
    (
      <OgFrame
        eyebrow={
          service
            ? `Services · Starting at $${service.startingPrice.toLocaleString()}`
            : "Services"
        }
        headline={service?.title ?? "Services"}
        headlineSize={64}
        sub={service?.summary}
      />
    ),
    { ...size, fonts: await ogFonts() }
  );
}
