import fs from "node:fs";
import path from "node:path";
import { mailConfig } from "./env";
import { OUT_DIR } from "./documents";
import { isBlocked } from "./prospects";
import { OUTREACH_SOURCE } from "./stages";

/**
 * The one place this app talks to the outside world.
 *
 * The rule that governs it, carried over from the draft-client-paperwork
 * skill: SEBASTIAN SENDS EVERYTHING. Nothing calls this except the
 * confirm step of the composer, after he has read the exact message and
 * pressed the button. Cowork drafts, fills, and attaches; Cowork does
 * not press it. Never wire this to anything automatic.
 */

export type SendBlock = {
  kind: "outreach" | "do-not-contact";
  reason: string;
} | null;

/**
 * Why a record must not be emailed from this app, or null when it is
 * fine to send.
 *
 * One rule in one place. The composer calls it to swap the send button
 * for a copy button, and the send action calls it to refuse outright.
 * If these two ever drift apart, the UI becomes the only guard, and a
 * UI guard is a suggestion.
 */
export function sendBlockReason(client: {
  source: string;
  business: string;
  email: string;
}): SendBlock {
  if (client.source === OUTREACH_SOURCE) {
    return {
      kind: "outreach",
      reason:
        "This one came from research. Resend does not allow cold outreach, and that is the same account the website's contact form and your client email run through, so this goes from your own inbox. One at a time, to people you would genuinely be glad to help.",
    };
  }
  const listed = isBlocked([client.business, client.email]);
  if (listed) {
    return {
      kind: "do-not-contact",
      reason: `They are on the do-not-contact list (matched "${listed}").`,
    };
  }
  return null;
}

export type Attachment = { filename: string; slug: string; bytes: number };

/** The generated PDFs available to attach for a set of draft slugs */
export function attachmentsFor(slugs: string[]): Attachment[] {
  return slugs
    .map((slug) => {
      const file = path.join(OUT_DIR, `${slug}.pdf`);
      if (!fs.existsSync(file)) return null;
      return {
        filename: `${slug}.pdf`,
        slug,
        bytes: fs.statSync(file).size,
      };
    })
    .filter((a): a is Attachment => a !== null);
}

export type SendResult = { ok: boolean; message: string };

export async function sendClientEmail(input: {
  to: string;
  subject: string;
  body: string;
  attachmentSlugs: string[];
}): Promise<SendResult> {
  const { key, from } = mailConfig();
  if (!key || !from) {
    return {
      ok: false,
      message:
        "No mail credentials found. RESEND_API_KEY and RESEND_FROM live in the repo root's .env.local.",
    };
  }

  const attachments = attachmentsFor(input.attachmentSlugs).map((a) => ({
    filename: a.filename,
    content: fs.readFileSync(path.join(OUT_DIR, `${a.slug}.pdf`)),
  }));

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(key);
    const { data, error } = await resend.emails.send({
      from,
      to: input.to,
      replyTo: from,
      subject: input.subject,
      text: input.body,
      attachments: attachments.length ? attachments : undefined,
    });
    if (error) return { ok: false, message: error.message || String(error) };
    return { ok: true, message: `Sent. Resend id ${data?.id ?? "unknown"}.` };
  } catch (err) {
    return { ok: false, message: String(err) };
  }
}
