import { slugForTitle } from "./services";
import type { ClientInput } from "./clients";

/**
 * Turn a pasted contact-form notification email into a half-filled
 * client record, so a new inquiry is a paste instead of six fields of
 * retyping.
 *
 * The shape it reads is the one the website actually sends, built in
 * app/contact/actions.ts:
 *
 *   New inquiry from https://www.sebastianinman.com
 *   Name: Jamie Doe
 *   Email: jamie@example.com
 *   Phone: (541) 555-0123          (only when they filled it in)
 *   Business: Sample Bakery        (only when they filled it in)
 *   Interested in: Workflow automation, Tool integration
 *
 *   ...their message, which can run to several paragraphs
 *
 * Anything it cannot read is left blank rather than guessed at. The
 * result fills the form for review; nothing saves without a click.
 */

const LABELS = ["name", "email", "phone", "business", "interested in"] as const;

const EMAIL_RE = /[^\s@<>]+@[^\s@<>]+\.[^\s@<>,;]+/;

export function parseInquiry(raw: string): ClientInput {
  const text = raw.replace(/\r\n/g, "\n").trim();
  if (!text) return {};

  const lines = text.split("\n");
  const fields = new Map<string, string>();
  let lastLabelLine = -1;

  lines.forEach((line, i) => {
    const m = line.match(/^\s*([A-Za-z ]+):\s*(.*)$/);
    if (!m) return;
    const label = m[1].trim().toLowerCase();
    if (!LABELS.includes(label as (typeof LABELS)[number])) return;
    fields.set(label, m[2].trim());
    lastLabelLine = i;
  });

  // The message is everything after the last labelled line. With no
  // labels at all (a forwarded note, a booking email), treat the whole
  // paste as the message and pull out whatever email address is in it.
  const notes = lines
    .slice(lastLabelLine + 1)
    .join("\n")
    .trim();

  const services = (fields.get("interested in") ?? "")
    .split(",")
    .map((t) => slugForTitle(t))
    .filter((slug): slug is string => Boolean(slug));

  const email = fields.get("email") ?? text.match(EMAIL_RE)?.[0] ?? "";

  return {
    name: fields.get("name") ?? "",
    business: fields.get("business") ?? "",
    email,
    phone: fields.get("phone") ?? "",
    services,
    source: "contact-form",
    stage: "inquiry",
    notes,
  };
}
