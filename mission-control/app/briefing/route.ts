import { claudeReady, forget } from "@/lib/claude";
import { briefing } from "@/lib/insights";
import { listClients } from "@/lib/clients";
import { moneySummary, stripeReady } from "@/lib/stripe";
import { analyticsReady, siteTraffic } from "@/lib/analytics";
import { recordTasks, suggestedTasks, type Task } from "@/lib/tasks";
import { completedToday, doneIds } from "@/lib/done";

/**
 * The suggestions, fetched by the browser after the page is up.
 *
 * They are deliberately NOT part of the page render. A fresh briefing
 * takes about fifteen seconds, and anything awaited during render is
 * also awaited inside a server action's response, so ticking one task
 * meant a sixteen-second wait before the tick appeared. Off the render
 * path, the dashboard is instant and this arrives when it arrives.
 */
/**
 * Mark what has been ticked, and put back what ticking removed.
 *
 * Two different things end up struck through. A suggestion is frozen
 * text, so it is still in the list and only needs flagging. A record's
 * own task is derived from its stage and next step, so finishing one
 * changes the record and the task stops being generated at all: there
 * is nothing left to flag, and it has to be rebuilt from what was
 * written down when it was ticked.
 *
 * Only today's, because the list is a day's work and the durable
 * account of what happened lives on each record's timeline.
 */
function withCompleted(tasks: Task[], ticked: Set<string>): Task[] {
  const marked = tasks.map((t) =>
    ticked.has(t.id) ? { ...t, done: true } : t
  );
  const present = new Set(marked.map((t) => t.id));

  const finished: Task[] = completedToday()
    .filter((e) => !present.has(e.id))
    .map((e) => ({
      id: e.id,
      slug: e.slug,
      who: e.who,
      label: e.label,
      detail: "",
      when: "",
      urgent: false,
      suggested: e.id.startsWith("claude-"),
      advancesTo: null,
      done: true,
    }));

  // Anything still to do first; the finished ones settle underneath.
  return [...marked.filter((t) => !t.done), ...marked.filter((t) => t.done), ...finished];
}

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
    let { value, cached, costUsd, via } = await briefing({ outstanding, overdue, visitors });

    // The list rolls over until it is finished. Once it is, throw it
    // away and ask for a new one rather than showing a page of things
    // already crossed out. Ids are content-addressed, so a genuinely
    // new suggestion cannot arrive already ticked.
    const finished =
      value.actions.length > 0 &&
      suggestedTasks(value.actions, clients).every((t) => doneIds().has(t.id));
    if (finished) {
      forget("briefing");
      ({ value, cached, costUsd, via } = await briefing({ outstanding, overdue, visitors }));
    }
    // Anything already on his own list is the same job described twice
    const already = new Set(recordTasks(clients).map((t) => t.slug));
    const ticked = doneIds();
    return Response.json({
      summary: value.summary,
      tasks: withCompleted(
        suggestedTasks(value.actions, clients).filter(
          (t) => !already.has(t.slug)
        ),
        ticked
      ),
      footer: cached
        ? "Your list. Anything left undone rolls over."
        : via === "subscription"
          ? "A fresh list, written through your Claude Code subscription: the API account is out of credit."
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
