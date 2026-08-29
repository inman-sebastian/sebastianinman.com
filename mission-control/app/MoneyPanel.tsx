import Link from "next/link";
import { money, shortDate } from "@/lib/format";
import { moneySummary, stripeReady } from "@/lib/stripe";

/**
 * Who owes what.
 *
 * The totals live in the row at the top of the page, so this is only the
 * detail: which invoices are still out and how late they are. Read from
 * Stripe on each load rather than stored, so it cannot disagree with
 * what was actually billed, and rendered inside Suspense so a slow
 * Stripe never holds up the pipeline.
 */
export async function MoneyPanel() {
  if (!stripeReady()) return null;

  let summary;
  try {
    summary = await moneySummary();
  } catch (err) {
    return (
      <Shell>
        <p className="bg-terracotta-tint px-4 py-3 text-sm text-terracotta-dark">
          {err instanceof Error ? err.message : String(err)}
        </p>
      </Shell>
    );
  }

  const { invoices } = summary;

  if (invoices.length === 0) {
    return (
      <Shell>
        <p className="px-4 py-6 text-sm text-muted">
          Nothing invoiced yet. Draft one from a client record and it shows up
          here.
        </p>
      </Shell>
    );
  }

  // Still owing, worst first. Paid invoices are history and belong on
  // the client's own page, not on a dashboard.
  const owing = invoices
    .filter((i) => i.status === "open")
    .sort((a, b) => (a.dueDate < b.dueDate ? -1 : 1));

  // A drafted invoice is worth nothing until it is sent, so it counts
  // towards none of the totals up top. Saying so beats leaving a gap.
  const drafts = invoices.filter((i) => i.status === "draft").length;

  return (
    <Shell>
      {owing.length === 0 ? (
        <p className="px-4 py-6 text-sm text-muted">
          Nothing outstanding. Everything sent has been paid.
        </p>
      ) : (
        <ul className="divide-y divide-line">
          {owing.map((inv) => (
            <li
              key={inv.id}
              className="flex flex-wrap items-baseline gap-x-3 px-4 py-2 text-sm"
            >
              <span className="font-semibold text-ink">
                {money(inv.amountDue)}
              </span>
              {inv.slug ? (
                <Link
                  href={`/clients/${inv.slug}`}
                  className="font-semibold text-pine-dark hover:underline"
                >
                  {inv.customerName || inv.slug}
                </Link>
              ) : (
                <span className="font-semibold text-pine-dark">
                  {inv.customerName || "Someone"}
                </span>
              )}
              <span
                className={
                  inv.overdue
                    ? "font-semibold text-terracotta-dark"
                    : "text-muted"
                }
              >
                {inv.overdue
                  ? `overdue since ${shortDate(inv.dueDate)}`
                  : `due ${shortDate(inv.dueDate)}`}
              </span>
              {inv.hostedUrl && (
                <a
                  href={inv.hostedUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-auto text-xs font-semibold text-pine hover:underline"
                >
                  What they see
                </a>
              )}
            </li>
          ))}
        </ul>
      )}

      {drafts > 0 && (
        <p className="border-t border-line px-4 py-2 text-xs text-muted">
          {drafts} drafted {drafts === 1 ? "invoice" : "invoices"} not sent yet,
          so {drafts === 1 ? "it counts" : "they count"} towards nothing above.
        </p>
      )}
    </Shell>
  );
}

export function MoneyPanelSkeleton() {
  return (
    <Shell>
      <p className="px-4 py-6 text-sm text-muted">Asking Stripe...</p>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <section className="card overflow-hidden">
      <p className="border-b border-line px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted">
        Who owes what
      </p>
      {children}
    </section>
  );
}
