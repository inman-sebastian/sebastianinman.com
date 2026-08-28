import fs from "node:fs";
import { candidatePath } from "@/lib/images";

/** Serves one of the not-yet-chosen candidates from the app's own
    scratch folder. These never reach the website unless picked. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ file: string }> }
) {
  const { file } = await params;
  const full = candidatePath(file);
  if (!fs.existsSync(full)) {
    return new Response("That candidate is gone", { status: 404 });
  }
  return new Response(new Uint8Array(fs.readFileSync(full)), {
    headers: { "content-type": "image/jpeg", "cache-control": "no-store" },
  });
}
