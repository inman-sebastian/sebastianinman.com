import { analyticsReady, siteTraffic } from "@/lib/analytics";
import { listClients } from "@/lib/clients";

/**
 * What the website did this week.
 *
 * This is the only panel on the dashboard that depends on somebody
 * else's server being up, so it renders inside Suspense and the rest of
 * the page never waits for it. If Vercel is slow, the pipeline still
 * loads; if Vercel is down, this says so and nothing else breaks.
 */
export async function TrafficPanel() {
  if (!analyticsReady()) {
    return (
      <Shell>
        <p className="px-4 py-6 text-sm text-muted">
          No <code>VERCEL_API_TOKEN</code> in the repo root&apos;s{" "}
          <code>.env.local</code>. Create a read-only token at{" "}
          <span className="text-ink">vercel.com/account/tokens</span> and the
          numbers show up here.
        </p>
      </Shell>
    );
  }

  let traffic;
  try {
    traffic = await siteTraffic();
  } catch (err) {
    return (
      <Shell>
        <p className="bg-terracotta-tint px-4 py-3 text-sm text-terracotta-dark">
          {err instanceof Error ? err.message : String(err)}
        </p>
      </Shell>
    );
  }

  const { week, routes, contactViews } = traffic;
  const perVisitor = week.visitors
    ? (week.pageviews / week.visitors).toFixed(1)
    : "0";

  // Enquiries that arrived this week, from the records rather than from
  // Vercel. A form submission is a client record, which is a truer
  // measure of the form working than any click could be.
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - 7);
  const inquiries = listClients().filter(
    (c) =>
      (c.source === "contact-form" || c.source === "booking") &&
      c.created >= since.toISOString().slice(0, 10)
  ).length;

  return (
    <Shell>
      <p className="border-b border-line px-4 py-2 text-xs text-muted">
        {week.pageviews} page views, {perVisitor} pages per visitor.
      </p>

      {routes.length > 0 && (
        <div className="px-4 py-3">
          <ul className="space-y-1">
            {routes.map((r) => (
              <li key={r.route} className="flex items-center gap-3 text-sm">
                <span className="w-8 shrink-0 text-right font-semibold text-ink">
                  {r.pageviews}
                </span>
                {/* The bar gets its own fixed track. Sizing it as a share
                    of the row pushed the busiest route's label off the
                    end, which is exactly the one worth reading. */}
                <span className="h-1.5 w-24 shrink-0 overflow-hidden rounded-full bg-line">
                  <span
                    aria-hidden
                    className="block h-full rounded-full bg-pine/40"
                    style={{
                      width: `${Math.max(6, Math.round((r.pageviews / (routes[0]?.pageviews || 1)) * 100))}%`,
                    }}
                  />
                </span>
                <code className="min-w-0 flex-1 truncate text-ink">
                  {r.route}
                </code>
                <span className="shrink-0 text-xs text-muted">
                  {r.visitors} {r.visitors === 1 ? "visitor" : "visitors"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="border-t border-line px-4 py-3 text-sm">
        <span className="font-semibold text-pine-dark">
          {contactViews} reached the contact page
        </span>
        <span className="text-muted">
          {" "}
          and {inquiries} got in touch
          {contactViews > 0 && inquiries === 0
            ? ". Worth a look at what the page asks for."
            : "."}
        </span>
      </p>
    </Shell>
  );
}

/** Shown immediately while the numbers are still on their way */
export function TrafficPanelSkeleton() {
  return (
    <Shell>
      <p className="px-4 py-6 text-sm text-muted">Asking Vercel...</p>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <section className="card overflow-hidden">
      <p className="border-b border-line px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted">
        Where they went
      </p>
      {children}
    </section>
  );
}
