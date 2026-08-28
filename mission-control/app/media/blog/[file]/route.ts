import fs from "node:fs";
import { blogImagePath } from "@/lib/images";

/** Serves an illustration out of the website's public/images/blog so the
    CMS can show a preview. Read-only, and the path is sanitised to a
    bare filename inside that one folder. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ file: string }> }
) {
  const { file } = await params;
  const full = blogImagePath(file);
  if (!full || !fs.existsSync(full)) {
    return new Response("No such image", { status: 404 });
  }
  const ext = full.split(".").pop()?.toLowerCase();
  const type =
    ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
  return new Response(new Uint8Array(fs.readFileSync(full)), {
    headers: { "content-type": type, "cache-control": "no-store" },
  });
}
