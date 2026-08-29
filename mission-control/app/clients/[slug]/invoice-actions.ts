"use server";

import { revalidatePath } from "next/cache";
import { appendTimeline, getClient, updateClient } from "@/lib/clients";
import { draftInvoice, ensureCustomer } from "@/lib/stripe";
import { money } from "@/lib/format";

/**
 * Making an invoice, as a draft.
 *
 * The same rule the email composer follows, for a stronger reason:
 * finalizing an invoice is what emails a real person asking for real
 * money, and a finalized invoice is a legal document in many places that
 * cannot simply be edited afterwards. So this stops at a draft, and
 * sending happens in Stripe, where the invoice is shown exactly as the
 * client will see it.
 */

export type InvoiceState = { error?: string; created?: string; url?: string };

export async function createInvoiceAction(
  _prev: InvoiceState,
  formData: FormData
): Promise<InvoiceState> {
  const slug = String(formData.get("slug") ?? "").trim();
  const amount = Number(formData.get("amount"));
  const description = String(formData.get("description") ?? "").trim();
  const daysUntilDue = Number(formData.get("daysUntilDue")) || 14;

  const client = getClient(slug);
  if (!client) return { error: "That client record is gone." };
  if (!client.email) {
    return {
      error:
        "No email address on this record, and Stripe needs one to send an invoice to.",
    };
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    return { error: "That amount doesn't look right." };
  }
  if (!description) return { error: "Say what the invoice is for." };

  try {
    const customerId = await ensureCustomer({
      customerId: client.stripeCustomerId,
      business: client.business,
      name: client.name,
      email: client.email,
    });
    // Stored so the next invoice reuses the same customer rather than
    // making a second one with the same email
    if (customerId !== client.stripeCustomerId) {
      updateClient(slug, { stripeCustomerId: customerId });
    }

    const draft = await draftInvoice({
      customerId,
      amount,
      description,
      daysUntilDue,
      slug,
    });

    appendTimeline(
      slug,
      `Invoice drafted: ${money(amount)}`,
      `${description}\nDue ${daysUntilDue} days after it is sent. Not sent yet.`
    );

    revalidatePath("/");
    revalidatePath(`/clients/${slug}`);
    return { created: draft.id, url: draft.dashboardUrl };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}
