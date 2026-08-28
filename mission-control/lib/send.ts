import fs from "node:fs";
import path from "node:path";
import { mailConfig } from "./env";
import { OUT_DIR } from "./documents";

/**
 * The one place this app talks to the outside world.
 *
 * The rule that governs it, carried over from the draft-client-paperwork
 * skill: SEBASTIAN SENDS EVERYTHING. Nothing calls this except the
 * confirm step of the composer, after he has read the exact message and
 * pressed the button. Cowork drafts, fills, and attaches; Cowork does
 * not press it. Never wire this to anything automatic.
 */

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
