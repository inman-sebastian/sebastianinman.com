import Link from "next/link";
import { claudeReady } from "@/lib/claude";
import { briefing } from "@/lib/insights";
import { displayName, getClient } from "@/lib/clients";
import { moneySummary, stripeReady } from "@/lib/stripe";
import { analyticsReady, siteTraffic } from "@/lib/analytics";
import { RefreshBriefing } from "./RefreshBriefing";

/**
 * What Claude makes of the state of things.
 *
 * Deliberately quiet by design: it is allowed to have nothing to say,
 * and when it does the panel says so in one line rather than dressing
 * up the silence. Everything it does say has to point at a record.
 */
export async function BriefingPanel() {
  if (!claudeReady()) return null;

  // The same numbers the top row shows, so the briefing is reasoning
  // over the same picture Sebastian is looking at. Both are cached per
  // render, so this costs no extra calls.
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

  let result;
  try {
    result = await briefing({ outstanding, overdue, visitors });
  } catch (err) {
    return (
      <Shell>
        <p className="bg-terracotta-tint px-4 py-3 text-sm text-terracotta-dark">
          {err instanceof Error ? err.message : String(err)}
        </p>
      </Shell>
    );
  }

  const { value, cached, costUsd } = result;
  const quiet = !value.summary && value.actions.length === 0;

  return (
    <Shell>
      {quiet ? (
        <p className="px-4 py-6 text-sm text-muted">
          Nothing worth flagging today.
        </p>
      ) : (
        <>
          {/* The framing sentence is a different kind of thing from the
              list of jobs, so it gets its own band rather than running
              straight into the first one. */}
          {value.summary && (
            <p className="border-b border-line bg-pine-tint/30 px-4 py-3 text-sm leading-relaxed text-pine-dark">
              {value.summary}
            </p>
          )}
          {value.actions.length > 0 && (
            <ol className="divide-y divide-line">
              {value.actions.map((a, i) => {
                const client = a.slug ? getClient(a.slug) : null;
                return (
                  <li key={`${a.slug}-${i}`} className="flex gap-3 px-4 py-3">
                    <span className="w-5 shrink-0 font-serif text-lg font-semibold leading-6 text-terracotta">
                      {i + 1}
                    </span>
                    <span className="min-w-0">
                      {/* The title carries the link. Trailing the
                          business name after the reason left every entry
                          ending in a sentence fragment. */}
                      {client ? (
                        <Link
                          href={`/clients/${client.slug}`}
                          className="font-semibold text-pine-dark hover:underline"
                        >
                          {a.title}
                        </Link>
                      ) : (
                        <span className="font-semibold text-pine-dark">
                          {a.title}
                        </span>
                      )}
                      <span className="mt-0.5 block text-sm leading-relaxed text-muted">
                        {a.why}
                      </span>
                      {client && (
                        <span className="mt-1 block text-xs text-muted">
                          {displayName(client)}
                        </span>
                      )}
                    </span>
                  </li>
                );
              })}
            </ol>
          )}
        </>
      )}

      <div className="flex flex-wrap items-center gap-x-3 border-t border-line px-4 py-2 text-xs text-muted">
        <span>
          {cached
            ? "Held from the last time anything changed."
            : `Fresh. That cost about $${costUsd.toFixed(3)}.`}
        </span>
        <RefreshBriefing />
      </div>
    </Shell>
  );
}

export function BriefingPanelSkeleton() {
  return (
    <Shell>
      <p className="px-4 py-6 text-sm text-muted">Thinking about it...</p>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <section className="card overflow-hidden">
      <p className="border-b border-line px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted">
        What Claude makes of it
      </p>
      {children}
    </section>
  );
}
