import { ImageResponse } from "next/og";
import { getLandingPage } from "@/lib/content";
import { OgFrame, OG_SIZE, ogFonts } from "@/lib/og";

/**
 * Share cards for the SEO landing pages: the page's own hero headline
 * and subline, with the city in the eyebrow.
 */

export const alt = "Landing page";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function LandingOgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = getLandingPage(slug);
  const headline = page?.heroHeadline ?? "Automation & AI help for small businesses";

  return new ImageResponse(
    (
      <OgFrame
        eyebrow={page?.city || "Southern Oregon"}
        headline={headline}
        headlineSize={headline.length > 55 ? 56 : 64}
        sub={page?.heroSubline || undefined}
      />
    ),
    { ...size, fonts: await ogFonts() }
  );
}
