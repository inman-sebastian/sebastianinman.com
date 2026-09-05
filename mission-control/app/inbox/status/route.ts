import { gmailConfigured } from "@/lib/env";
import { gmailState, isConnected as gmailConnected } from "@/lib/gmail";
import { instagramState, isConnected as igConnected } from "@/lib/instagram";
import { unmatchedCount } from "@/lib/messages";

/**
 * A tiny status read for the client-side auto-check: which channels are set
 * up and connected, how many unmatched messages are waiting, and when each
 * was last checked. No-store so it always reflects the last sync.
 */
export async function GET() {
  return Response.json(
    {
      gmail: {
        configured: gmailConfigured(),
        connected: gmailConnected(),
        lastChecked: gmailState().lastChecked ?? "",
      },
      instagram: {
        connected: igConnected(),
        account: instagramState().account ?? "",
        lastChecked: instagramState().lastChecked ?? "",
      },
      unmatched: unmatchedCount(),
    },
    { headers: { "cache-control": "no-store" } },
  );
}
