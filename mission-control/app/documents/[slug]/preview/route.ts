import { getDocument } from "@/lib/documents";
import { renderPreviewHtml } from "@/lib/paperwork";

/**
 * The iframe source for the in-app preview: paperwork-app's own
 * rendering of the draft, letterhead and print styles included.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  if (!getDocument(slug)) {
    return new Response("No such draft", { status: 404 });
  }
  try {
    const html = await renderPreviewHtml(slug);
    return new Response(html, {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store",
      },
    });
  } catch (err) {
    return new Response(`Preview failed:\n\n${String(err)}`, {
      status: 500,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }
}
