import fs from "node:fs";
import { getDocument } from "@/lib/documents";

/** Serves the PDF that was generated for a draft, if one exists yet. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const doc = getDocument(slug);
  if (!doc?.pdf) {
    return new Response("No PDF generated for this draft yet.", { status: 404 });
  }
  return new Response(new Uint8Array(fs.readFileSync(doc.pdf.path)), {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `inline; filename="${slug}.pdf"`,
      "cache-control": "no-store",
    },
  });
}
