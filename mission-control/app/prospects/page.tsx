import Link from "next/link";
import { listProspects, type Prospect } from "@/lib/prospects";
import { listServices } from "@/lib/services";
import { money } from "@/lib/format";

export const dynamic = "force-dynamic";

/** Roughly what the work would be worth, from the service starting
    prices. A floor, not a quote. */
function worth(prospect: Prospect, prices: Map<string, number>): number {
  return prospect.services.reduce((sum, s) => sum + (prices.get(s) ?? 0), 0);
}

function Row({ prospect, prices }: { prospect: Prospect; prices: Map<string, number> }) {
  const value = worth(prospect, prices);
  return (
    <li>
      <Link
        href={`/prospects/${prospect.slug}`}
        className="flex flex-wrap items-center gap-x-3 gap-y-1 p-4 hover:bg-pine-tint/40"
      >
        <span className="font-serif text-lg font-semibold text-pine-dark">
          {prospect.business}
        </span>
        {prospect.fit === "strong" && (
          <span className="rounded-full bg-pine-tint px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-pine-dark">
            Strong
          </span>
        )}
        <span className="text-sm text-muted">
          {[prospect.category, prospect.city].filter(Boolean).join(" · ")}
        </span>
        {!prospect.website && (
          <span className="text-xs text-terracotta-dark">No website</span>
        )}
        {prospect.platform && (
          <span className="rounded-full bg-surface px-2 py-0.5 text-xs text-muted ring-1 ring-line">
            {prospect.platform}
          </span>
        )}
        {value > 0 && (
          <span className="ml-auto text-sm font-semibold">
            from {money(value)}
          </span>
        )}
      </Link>
    </li>
  );
}

export default function ProspectsPage() {
  const all = listProspects();
  const prices = new Map(listServices().map((s) => [s.slug, s.startingPrice]));
  const waiting = all.filter((p) => p.status === "new");
  const decided = all.filter((p) => p.status !== "new");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-pine-dark">Prospects</h1>
        <p className="mt-1 text-lg leading-relaxed text-muted">
          Businesses found by research. Nobody here has been contacted, and
          none of them are in the pipeline until you say so.
        </p>
      </div>

      {all.length === 0 ? (
        <div className="card p-6">
          <p className="text-muted">
            Nothing researched yet. Ask Cowork to find leads and it fills this
            in: <code>find me salons in Ashland worth talking to</code>.
          </p>
        </div>
      ) : (
        <section className="card">
          <p className="border-b border-line px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted">
            Waiting on you · {waiting.length}
          </p>
          <ul className="divide-y divide-line">
            {waiting.map((p) => (
              <Row key={p.slug} prospect={p} prices={prices} />
            ))}
            {waiting.length === 0 && (
              <li className="p-4 text-sm text-muted">
                All caught up on what has been researched.
              </li>
            )}
          </ul>
        </section>
      )}

      {decided.length > 0 && (
        <section className="card">
          <p className="border-b border-line px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted">
            Already decided · {decided.length}
          </p>
          <ul className="divide-y divide-line">
            {decided.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/prospects/${p.slug}`}
                  className="flex flex-wrap items-center gap-x-3 p-4 text-sm hover:bg-pine-tint/40"
                >
                  <span className="font-semibold text-pine-dark">
                    {p.business}
                  </span>
                  <span className="text-muted">
                    {p.status === "promoted" ? "In the pipeline" : "Not a fit"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="border-t border-line px-4 py-2 text-xs text-muted">
            Kept so a later research run knows these were already looked at.
          </p>
        </section>
      )}
    </div>
  );
}
