import { claudeReady } from "@/lib/claude";
import { briefing } from "@/lib/insights";
import { listClients } from "@/lib/clients";
import { moneySummary, stripeReady } from "@/lib/stripe";
import { analyticsReady, siteTraffic } from "@/lib/analytics";
import { recordTasks, suggestedTasks } from "@/lib/tasks";
import { doneToday } from "@/lib/done";

/**
 * The suggestions, fetched by the browser after the page is up.
 *
 * They are deliberately NOT part of the page render. A fresh briefing
 * takes about fifteen seconds, and anything awaited during render is
 * also awaited inside a server action's response, so ticking one task
 * meant a sixteen-second wait before the tick appeared. Off the render
 * path, the dashboard is instant and this arrives when it arrives.
 */
export async function GET() {
  if (!claudeReady()) return Response.json({ tasks: [], summary: "", footer: "" });

  const clients = listClients();
  let outstanding = 0;
  let overdue = 0;
  let visitors = 0;
  if (stripeReady()) {
    try {
      const m = await moneySummary();
      outstanding = m.outstanding;
      overdue = m.overdue;
    } catch {
      // A briefing without the money picture is still worth having
    }
  }
  if (analyticsReady()) {
    try {
      visitors = (await siteTraffic()).week.visitors;
    } catch {
      // Same
    }
  }

  try {
    const { value, cached, costUsd } = await briefing({ outstanding, overdue, visitors });
    // Anything already on his own list is the same job described twice
    const already = new Set(recordTasks(clients).map((t) => t.slug));
    // The list is pinned to the day now, so anything ticked has to be
    // remembered or it comes straight back.
    const ticked = doneToday();
    return Response.json({
      summary: value.summary,
      tasks: suggestedTasks(value.actions, clients).filter(
        (t) => !already.has(t.slug) && !ticked.has(t.id)
      ),
      footer: cached
        ? "Today's list. It stays put while you work through it."
        : `A fresh list, about $${costUsd.toFixed(3)}.`,
    }, { headers: { "cache-control": "no-store" } });
  } catch (err) {
    return Response.json({
      summary: "",
      tasks: [],
      footer: err instanceof Error ? err.message : String(err),
    });
  }
}
