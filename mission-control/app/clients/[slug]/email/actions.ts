"use server";

import { revalidatePath } from "next/cache";
import { resolveChannel } from "@/lib/channels";
import { appendTimeline, getClient, updateClient } from "@/lib/clients";
import { draftMessage } from "@/lib/drafting";
import { getEmailTemplate, unfilled } from "@/lib/emails";
import { recordOutbound } from "@/lib/messages";
import { isBlocked } from "@/lib/suppression";
import { sendBlockReason, sendClientEmail } from "@/lib/send";
import { stageInfo } from "@/lib/stages";

/**
 * The send action. It runs only when Sebastian presses the button on the
 * confirm step, and it re-checks everything the UI already checked,
 * because the guard that matters is the one closest to the wire.
 */

export type SendState = { error?: string; sent?: string };

export type DraftState = {
  error?: string;
  subject?: string;
  body?: string;
  leftBlank?: { placeholder: string; missing: string }[];
  costUsd?: number;
};

/**
 * Fill the writing prompts from what the record already knows.
 *
 * Sends nothing and saves nothing. It hands text back to the form,
 * which Sebastian then edits, reads on the confirm step, and only then
 * sends. The placeholder guard still applies afterwards, which is what
 * makes it safe for the model to leave one alone rather than guess.
 */
export async function draftEmailAction(
  slug: string,
  templateId: number,
  attempt: number,
  channelId?: string,
): Promise<DraftState> {
  const client = getClient(slug);
  if (!client) return { error: "That client record is gone." };

  const channel = resolveChannel(client, channelId);
  if (!channel) return { error: "There's no way to message this one on file." };

  // A DM has no template; email does.
  const template = channel.kind === "email" ? getEmailTemplate(templateId) : null;
  if (channel.kind === "email" && !template) {
    return { error: "That template is gone." };
  }

  try {
    const { value, costUsd } = await draftMessage({
      client,
      channel,
      template,
      attempt,
    });
    return {
      subject: value.subject,
      body: value.body,
      leftBlank: value.leftBlank,
      costUsd,
    };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}

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

  // Reply threading: when replying, the original's Message-ID goes on
  // In-Reply-To/References so the recipient's client threads it, and the
  // thread id groups the stored copy with the message it answers.
  const replyToRfcId = text(formData, "replyToRfcId");
  const threadId = text(formData, "threadId");
  const headers = replyToRfcId
    ? { "In-Reply-To": replyToRfcId, References: replyToRfcId }
    : undefined;

  const result = await sendClientEmail({
    to,
    subject,
    body,
    attachmentSlugs,
    headers,
  });
  if (!result.ok) return { error: result.message };

  // Store what we just sent, so the conversation stays whole. Resend does
  // not put it in the Gmail mailbox we sync, so this is the only copy.
  recordOutbound(slug, { to, subject, body, threadId: threadId || undefined });

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
  // The channel's label, e.g. "Instagram DM"; "Email" or empty otherwise
  const channel = text(formData, "channel");
  const client = getClient(slug);
  if (!client) return { error: "That client record is gone." };

  // A week from now, matching what the contacted stage says to do:
  // give it a week, then let it go.
  const due = new Date();
  due.setDate(due.getDate() + 7);

  const isDm = channel && channel !== "Email";
  updateClient(slug, {
    stage: "contacted",
    nextStep: stageInfo("contacted").nextStep,
    nextStepDue: due.toISOString().slice(0, 10),
  });
  appendTimeline(
    slug,
    isDm ? `First message sent by hand (${channel})` : "First email sent by hand",
    [
      subject && `Subject: ${subject}`,
      isDm
        ? `Copied from the composer and sent by hand as a ${channel}.`
        : "Copied from the composer and sent from Sebastian's own inbox.",
    ]
      .filter(Boolean)
      .join("\n")
  );

  revalidatePath("/");
  revalidatePath("/research");
  revalidatePath(`/clients/${slug}`);
  return { sent: client.email || "your inbox" };
}
