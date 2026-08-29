import type { ClientRecord } from "@/lib/clients";
import { money, shortDate } from "@/lib/format";
import { serviceTitles } from "@/lib/services";
import { invoicesFor, isTestMode, stripeReady } from "@/lib/stripe";
import { InvoiceForm } from "./InvoiceForm";

/**
 * Money, for one client.
 *
 * Rendered inside Suspense on the client page, so a slow or unreachable
 * Stripe never holds up the record itself. Everything shown is read from
 * Stripe rather than stored here, so it cannot drift out of step with
 * what was actually invoiced and paid.
 */
export async function InvoicePanel({ client }: { client: ClientRecord }) {
  if (!stripeReady()) {
    return (
      <Shell>
        <p className="mt-2 text-sm text-muted">
          No <code>STRIPE_API_KEY</code> in the repo root&apos;s{" "}
          <code>.env.local</code>, so there is nothing to bill through yet.
        </p>
      </Shell>
    );
  }

  let invoices;
  try {
    invoices = client.stripeCustomerId
      ? await invoicesFor(client.stripeCustomerId)
      : [];
  } catch (err) {
    return (
      <Shell>
        <p className="mt-2 rounded-lg bg-terracotta-tint px-3 py-2 text-sm text-terracotta-dark">
          {err instanceof Error ? err.message : String(err)}
        </p>
      </Shell>
    );
  }

  const owed = invoices
    .filter((i) => i.status === "open")
    .reduce((sum, i) => sum + i.amountDue, 0);

  const what = serviceTitles(client.services).join(", ");

  return (
    <Shell>
      {invoices.length > 0 && (
        <ul className="mt-3 divide-y divide-line text-sm">
          {invoices.map((inv) => (
            <li key={inv.id} className="flex flex-wrap items-baseline gap-x-3 py-2">
              <span className="font-semibold text-ink">{money(inv.total)}</span>
              <span
                className={
                  inv.paid
                    ? "text-pine"
                    : inv.overdue
                      ? "font-semibold text-terracotta-dark"
                      : "text-muted"
                }
              >
                {inv.paid
                  ? "Paid"
                  : inv.overdue
                    ? `Overdue since ${shortDate(inv.dueDate)}`
                    : inv.status === "open"
                      ? `Due ${shortDate(inv.dueDate)}`
                      : "Draft, not sent"}
              </span>
              {inv.number && (
                <span className="text-xs text-muted">{inv.number}</span>
              )}
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

      {owed > 0 && (
        <p className="mt-3 text-sm font-semibold text-pine-dark">
          {money(owed)} outstanding.
        </p>
      )}

      <InvoiceForm
        slug={client.slug}
        defaultAmount={client.value}
        defaultDescription={what || "Project work"}
        live={!isTestMode()}
      />
    </Shell>
  );
}

export function InvoicePanelSkeleton() {
  return (
    <Shell>
      <p className="mt-2 text-sm text-muted">Asking Stripe...</p>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <section className="card p-5">
      <h2 className="font-serif text-lg font-semibold text-pine-dark">
        Invoices
      </h2>
      {children}
    </section>
  );
}
