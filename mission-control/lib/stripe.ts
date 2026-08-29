import { cache } from "react";
import Stripe from "stripe";
import { repoEnv } from "./env";

/**
 * Invoicing, through Stripe.
 *
 * Proposals and agreements stay as this repo's own branded PDFs. Only
 * invoices live here, because an invoice has to be payable and a PDF is
 * not. Stripe hosts the payment page, emails it, chases it, and tells us
 * when it was paid.
 *
 * Three decisions this is built on, all Sebastian's:
 *
 *  - Sole proprietor, so the business name customers see comes from the
 *    Stripe account itself. Nothing to set per invoice.
 *  - One invoice per project, not a deposit and a final.
 *  - No sales tax obligation (Oregon has none, and the work is
 *    services). `automatic_tax` is therefore deliberately NOT set.
 *    Turning it on without an active registration is the documented way
 *    to collect nothing while believing tax is handled, and it cannot be
 *    fixed retroactively. If that ever changes, it needs a registration
 *    in the Dashboard FIRST, then this flag, in that order.
 *
 * Nothing here charges a card. Invoices are created as drafts and go out
 * only when Sebastian sends them, the same rule the email composer
 * follows.
 */

/** Read-only-ish: this key should be a restricted key (rk_), scoped to
    invoices, customers and prices. Never logged, never rendered. */
function apiKey(): string {
  return process.env.STRIPE_API_KEY || repoEnv().STRIPE_API_KEY || "";
}

export function stripeReady(): boolean {
  return Boolean(apiKey());
}

/** True when pointed at test mode, which the UI says out loud so a test
    invoice is never mistaken for a real one. */
export function isTestMode(): boolean {
  return apiKey().includes("_test_");
}

let client: Stripe | null = null;

function stripe(): Stripe {
  const key = apiKey();
  if (!key) throw new Error("No STRIPE_API_KEY set.");
  // A StripeClient instance, not the deprecated global api-key pattern
  if (!client) client = new Stripe(key);
  return client;
}

/** What a client record needs to remember about Stripe */
export type StripeLink = { customerId: string };

/**
 * Find or make the Stripe customer for a client.
 *
 * The id is stored back on the record so this is a one-off per client.
 * Looking up by email as a fallback means a customer created by hand in
 * the Dashboard gets adopted rather than duplicated.
 */
export async function ensureCustomer(input: {
  customerId?: string;
  business: string;
  name: string;
  email: string;
}): Promise<string> {
  const s = stripe();

  if (input.customerId) {
    // Deleted in the Dashboard? Fall through and make a new one rather
    // than failing every invoice from here on.
    const existing = await s.customers.retrieve(input.customerId).catch(() => null);
    if (existing && !existing.deleted) return existing.id;
  }

  if (input.email) {
    const found = await s.customers.list({ email: input.email, limit: 1 });
    if (found.data.length > 0) return found.data[0].id;
  }

  const created = await s.customers.create({
    name: input.business || input.name,
    email: input.email || undefined,
    description: input.business && input.name ? input.name : undefined,
  });
  return created.id;
}

export type DraftInvoice = {
  id: string;
  status: string;
  total: number;
  /** Where Sebastian reviews it before sending */
  dashboardUrl: string;
};

/**
 * Create the invoice as a DRAFT. It does not go to the client.
 *
 * Ad-hoc amounts rather than a Price object, because every project is
 * quoted separately and a Product per project would be catalogue litter.
 *
 * `payment_method_types` is deliberately absent: leaving it off enables
 * dynamic payment methods, so which methods appear is configured once in
 * the Dashboard. That is where ACH gets turned on, and ACH is the whole
 * reason this is worth doing at these amounts.
 */
export async function draftInvoice(input: {
  customerId: string;
  /** Whole dollars, as quoted */
  amount: number;
  description: string;
  daysUntilDue: number;
  /** Ties the Stripe invoice back to the record it came from */
  slug: string;
}): Promise<DraftInvoice> {
  const s = stripe();

  const invoice = await s.invoices.create({
    customer: input.customerId,
    collection_method: "send_invoice",
    days_until_due: input.daysUntilDue,
    metadata: { missionControlSlug: input.slug },
    // Nothing else on this customer should ride along on this invoice
    pending_invoice_items_behavior: "exclude",
  });

  if (!invoice.id) throw new Error("Stripe returned an invoice with no id.");

  await s.invoiceItems.create({
    customer: input.customerId,
    invoice: invoice.id,
    amount: Math.round(input.amount * 100),
    currency: "usd",
    description: input.description,
  });

  // Re-read so the total reflects the item just added
  const withItem = await s.invoices.retrieve(invoice.id);

  return {
    id: withItem.id as string,
    status: withItem.status ?? "draft",
    total: (withItem.total ?? 0) / 100,
    dashboardUrl: `https://dashboard.stripe.com${isTestMode() ? "/test" : ""}/invoices/${withItem.id}`,
  };
}

export type InvoiceSummary = {
  id: string;
  number: string;
  status: string;
  /** Dollars */
  total: number;
  amountDue: number;
  amountPaid: number;
  created: string;
  dueDate: string;
  /** When it was actually paid, which is not when it was raised */
  paidAt: string;
  paid: boolean;
  /** The client record this came from, when the app created it */
  slug: string;
  /** Snapshotted on the invoice by Stripe, so it survives the customer
      being renamed or deleted */
  customerName: string;
  /** Past its due date and still owing */
  overdue: boolean;
  hostedUrl: string;
  pdfUrl: string;
};

function toSummary(inv: Stripe.Invoice): InvoiceSummary {
  const iso = (unix: number | null | undefined) =>
    unix ? new Date(unix * 1000).toISOString().slice(0, 10) : "";
  const due = iso(inv.due_date);
  const paid = inv.status === "paid";
  const today = new Date().toISOString().slice(0, 10);

  return {
    id: inv.id as string,
    number: inv.number ?? "",
    status: inv.status ?? "draft",
    total: (inv.total ?? 0) / 100,
    amountDue: (inv.amount_due ?? 0) / 100,
    amountPaid: (inv.amount_paid ?? 0) / 100,
    created: iso(inv.created),
    dueDate: due,
    paidAt: iso(inv.status_transitions?.paid_at),
    paid,
    slug: String(inv.metadata?.missionControlSlug ?? ""),
    customerName: inv.customer_name ?? "",
    // Only an invoice that actually went out can be late. A draft
    // sitting past a date nobody has seen is not overdue, it is unsent.
    overdue:
      !paid && inv.status === "open" && Boolean(due) && due < today,
    hostedUrl: inv.hosted_invoice_url ?? "",
    pdfUrl: inv.invoice_pdf ?? "",
  };
}

/**
 * Every invoice for one client.
 *
 * Polled rather than pushed. Stripe recommends webhooks, and for an app
 * that fulfils automatically they are right: you must not ship before
 * the money clears. Nothing here fulfils anything. Sebastian delivers
 * the work by hand and Stripe emails him on payment, so reading the
 * status when the page loads tells him the same thing a webhook would,
 * without this local-only app needing a public endpoint it should not
 * have.
 */
export async function invoicesFor(customerId: string): Promise<InvoiceSummary[]> {
  const s = stripe();
  const list = await s.invoices.list({ customer: customerId, limit: 100 });
  return list.data.map(toSummary);
}

export type MoneySummary = {
  outstanding: number;
  overdue: number;
  paidLast30: number;
  invoices: InvoiceSummary[];
};

/**
 * The money question, for the dashboard: what is owed, what is late.
 *
 * Wrapped in React's cache so the figures at the top of the dashboard
 * and the list further down are one request to Stripe rather than two.
 */
export const moneySummary = cache(async function moneySummary(): Promise<MoneySummary> {
  const s = stripe();
  const list = await s.invoices.list({ limit: 100 });
  const all = list.data.map(toSummary);

  const cutoff = new Date();
  cutoff.setUTCDate(cutoff.getUTCDate() - 30);
  const since = cutoff.toISOString().slice(0, 10);

  return {
    outstanding: all
      .filter((i) => i.status === "open")
      .reduce((sum, i) => sum + i.amountDue, 0),
    overdue: all.filter((i) => i.overdue).reduce((sum, i) => sum + i.amountDue, 0),
    // On when it was PAID, not when it was raised. Filtering on
    // created would miss an invoice sent seven weeks ago and settled
    // yesterday, which is exactly the one worth knowing about.
    paidLast30: all
      .filter((i) => i.paid && i.paidAt >= since)
      .reduce((sum, i) => sum + i.amountPaid, 0),
    invoices: all,
  };
});
