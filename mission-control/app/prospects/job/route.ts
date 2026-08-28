import { readJob } from "@/lib/agent-run";
import { RESEARCH_JOB } from "@/lib/research";

/** Where the research run has got to; the panel polls this. */
export async function GET() {
  return Response.json(readJob(RESEARCH_JOB), {
    headers: { "cache-control": "no-store" },
  });
}
