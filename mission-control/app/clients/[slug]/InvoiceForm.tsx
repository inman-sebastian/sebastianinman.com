"use client";

import { useActionState } from "react";
import { createInvoiceAction, type InvoiceState } from "./invoice-actions";

/**
 * The draft-an-invoice form.
 *
 * Prefilled from the quote on the record, because that is the number
 * already agreed and retyping it is how a wrong figure gets sent.
 */
export function InvoiceForm({
  slug,
  defaultAmount,
  defaultDescription,
  live,
}: {
  slug: string;
  defaultAmount: number | null;
  defaultDescription: string;
  /** True when the key is a live one, so the button says so */
  live: boolean;
}) {
  const [state, formAction, pending] = useActionState<InvoiceState, FormData>(
    createInvoiceAction,
    {}
  );

  if (state.created) {
    return (
      <div className="mt-3 rounded-lg bg-pine-tint px-4 py-3 text-sm text-pine-dark">
        <p className="font-semibold">Drafted. Nothing has gone to them yet.</p>
        <p className="mt-1">
          Read it over in Stripe, where you see it exactly as they will, and
          send it from there.
        </p>
        <a
          href={state.url}
          target="_blank"
          rel="noreferrer"
          className="btn mt-3"
        >
          Open it in Stripe
        </a>
      </div>
    );
  }

  return (
    <form action={formAction} className="mt-3 space-y-3">
      <input type="hidden" name="slug" value={slug} />
      <div className="flex gap-3">
        <div className="w-32">
          <label className="label" htmlFor="amount">
            Amount
          </label>
          <input
            id="amount"
            name="amount"
            type="number"
            min="1"
            step="1"
            className="field"
            defaultValue={defaultAmount ?? ""}
            required
          />
        </div>
        <div className="w-28">
          <label className="label" htmlFor="daysUntilDue">
            Due in
          </label>
          <select id="daysUntilDue" name="daysUntilDue" className="field" defaultValue="14">
            <option value="7">7 days</option>
            <option value="14">14 days</option>
            <option value="30">30 days</option>
          </select>
        </div>
      </div>
      <div>
        <label className="label" htmlFor="description">
          What it's for
        </label>
        <input
          id="description"
          name="description"
          className="field"
          defaultValue={defaultDescription}
          required
        />
      </div>

      {state.error && (
        <p className="rounded-lg bg-terracotta-tint px-3 py-2 text-sm text-terracotta-dark">
          {state.error}
        </p>
      )}

      <button type="submit" className="btn" disabled={pending}>
        {pending ? "Drafting..." : "Draft the invoice"}
      </button>
      <p className="text-xs text-muted">
        Creates a draft in {live ? "your live Stripe account" : "Stripe test mode"}.
        It is not sent, and nobody is charged, until you send it from Stripe.
      </p>
    </form>
  );
}
