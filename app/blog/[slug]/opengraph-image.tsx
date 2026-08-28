import { ImageResponse } from "next/og";
import { getBlogPost } from "@/lib/content";
import { OgFrame, OG_SIZE, ogFonts } from "@/lib/og";

/**
 * Per-post share cards: the branded frame with the post title as the
 * headline. Long titles step down a size so they stay inside the frame.
 */

export const alt = "Blog post";
export const size = OG_SIZE;
export const contentType = "image/png";

const formatDate = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

export default async function BlogOgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  const title = post?.title ?? "From the blog";

  return new ImageResponse(
    (
      <OgFrame
        eyebrow={post ? `From the blog · ${formatDate(post.date)}` : "From the blog"}
        headline={title}
        headlineSize={title.length > 55 ? 56 : 64}
      />
    ),
    { ...size, fonts: await ogFonts() }
  );
}
