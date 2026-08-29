import Link from "next/link";
import { money, shortDate } from "@/lib/format";
import { moneySummary, stripeReady } from "@/lib/stripe";

/**
 * What is owed, what is late, what came in.
 *
 * Read from Stripe every time rather than stored here, so it cannot
 * disagree with what was actually billed. Like the traffic panel it
 * renders inside Suspense: the pipeline must stay readable when
 * somebody else's server is slow.
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

  const { outstanding, overdue, paidLast30, invoices } = summary;

  // Nothing billed yet is the normal state before the first client, and
  // three zeros say that worse than a sentence does.
  if (invoices.length === 0) {
    return (
      <Shell>
        <p className="px-4 py-5 text-sm text-muted">
          Nothing invoiced yet. Draft one from a client record and it shows up
          here.
        </p>
      </Shell>
    );
  }

  // Anything still owing, worst first. Paid invoices are history and
  // belong on the client's own page, not on a dashboard.
  const owing = invoices
    .filter((i) => i.status === "open")
    .sort((a, b) => (a.dueDate < b.dueDate ? -1 : 1));

  // A drafted invoice is worth nothing until it is sent, so it counts
  // towards none of the figures above. Saying so beats three zeros with
  // no explanation, which is what this looked like otherwise.
  const drafts = invoices.filter((i) => i.status === "draft").length;

  return (
    <Shell>
      <div className="grid gap-px bg-line sm:grid-cols-3">
        <Figure label="Outstanding" value={outstanding} />
        <Figure label="Overdue" value={overdue} alarming={overdue > 0} />
        <Figure label="Paid, last 30 days" value={paidLast30} />
      </div>

      {owing.length > 0 && (
        <ul className="divide-y divide-line border-t border-line">
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
                  inv.overdue ? "font-semibold text-terracotta-dark" : "text-muted"
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
      <p className="px-4 py-5 text-sm text-muted">Asking Stripe...</p>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <section className="card overflow-hidden">
      <p className="border-b border-line px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted">
        Money
      </p>
      {children}
    </section>
  );
}

function Figure({
  label,
  value,
  alarming = false,
}: {
  label: string;
  value: number;
  alarming?: boolean;
}) {
  return (
    <div className="bg-surface px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
      </p>
      <p
        className={`mt-1 font-serif text-3xl font-semibold ${
          alarming ? "text-terracotta-dark" : "text-pine-dark"
        }`}
      >
        {value > 0 ? money(value) : "$0"}
      </p>
    </div>
  );
}
