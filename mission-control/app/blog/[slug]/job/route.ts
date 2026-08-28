import { readJob } from "@/lib/illustrate";

/** Where an illustration run has got to. The panel polls this while one
    is going, because the run takes minutes and a request cannot sit
    open that long. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  return Response.json(readJob(slug), {
    headers: { "cache-control": "no-store" },
  });
}
