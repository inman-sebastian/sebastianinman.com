"use server";

import { revalidatePath } from "next/cache";
import { appendTimeline, getClient, updateClient } from "@/lib/clients";
import { unfilled } from "@/lib/emails";
import { isBlocked } from "@/lib/suppression";
import { sendBlockReason, sendClientEmail } from "@/lib/send";
import { stageInfo } from "@/lib/stages";

/**
 * The send action. It runs only when Sebastian presses the button on the
 * confirm step, and it re-checks everything the UI already checked,
 * because the guard that matters is the one closest to the wire.
 */

export type SendState = { error?: string; sent?: string };

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

export async function sendEmailAction(
  _prev: SendState,
  formData: FormData
): Promise<SendState> {
  const slug = text(formData, "slug");
  const to = text(formData, "to");
  const subject = text(formData, "subject");
  const body = text(formData, "body");
  // Deduped, because a repeated slug attaches the same PDF twice and
  // nothing about that looks like an error until it lands in an inbox.
  const attachmentSlugs = [
    ...new Set(formData.getAll("attachments").map(String)),
  ];

  const client = getClient(slug);
  if (!client) return { error: "That client record is gone." };

  // The guarantee, not the convenience. The button is already swapped
  // out for these, but this is what stops a future change from quietly
  // turning the app into a cold-email sender. Same function the UI uses,
  // checked again here because the UI is not a guard.
  const blocked = sendBlockReason(client);
  if (blocked) return { error: blocked.reason };

  // The typed address is checked separately, since it can be edited
  const listedByHand = isBlocked([to]);
  if (listedByHand) {
    return {
      error: `That address matches "${listedByHand}" on the do-not-contact list. Not sending.`,
    };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return { error: "That address doesn't look right." };
  }
  if (!subject) return { error: "It needs a subject line." };
  if (!body) return { error: "The message is empty." };

  const left = unfilled(subject) + unfilled(body);
  if (left > 0) {
    return {
      error: `Still ${left} placeholder${left === 1 ? "" : "s"} in this. Nothing goes out with {{...}} in it.`,
    };
  }

  const result = await sendClientEmail({ to, subject, body, attachmentSlugs });
  if (!result.ok) return { error: result.message };

  appendTimeline(
    slug,
    `Email sent: ${subject}`,
    [
      `To ${to}`,
      attachmentSlugs.length
        ? `Attached: ${attachmentSlugs.map((s) => `${s}.pdf`).join(", ")}`
        : "",
    ]
      .filter(Boolean)
      .join("\n")
  );

  revalidatePath("/");
  revalidatePath(`/clients/${slug}`);
  return { sent: to };
}

/**
 * "I sent that one myself."
 *
 * Outreach leaves this app as text on the clipboard, so nothing here
 * ever learns that it went. Without this the record sits at `prospect`
 * forever, and because prospects only count as waiting when they carry
 * a date, an entire round of outreach could go quiet with nothing on
 * the dashboard saying so.
 *
 * This records what Sebastian already did. It sends nothing.
 */
export async function markContactedAction(
  _prev: SendState,
  formData: FormData
): Promise<SendState> {
  const slug = text(formData, "slug");
  const subject = text(formData, "subject");
  const client = getClient(slug);
  if (!client) return { error: "That client record is gone." };

  // A week from now, matching what the contacted stage says to do:
  // give it a week, then let it go.
  const due = new Date();
  due.setDate(due.getDate() + 7);

  updateClient(slug, {
    stage: "contacted",
    nextStep: stageInfo("contacted").nextStep,
    nextStepDue: due.toISOString().slice(0, 10),
  });
  appendTimeline(
    slug,
    "First email sent by hand",
    [subject && `Subject: ${subject}`, "Copied from the composer and sent from Sebastian's own inbox."]
      .filter(Boolean)
      .join("\n")
  );

  revalidatePath("/");
  revalidatePath("/research");
  revalidatePath(`/clients/${slug}`);
  return { sent: client.email || "your inbox" };
}
