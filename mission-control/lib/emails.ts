import fs from "node:fs";
import path from "node:path";
import { REPO_ROOT } from "./site";
import { siteInfo } from "./site";
import { TERMS } from "./templates";
import type { ClientRecord } from "./clients";

/**
 * The five client emails, read live from docs/clients/email-templates.md
 * so that file stays the one place they are written and edited.
 *
 * Same filling rule as the documents: facts get resolved (first name,
 * the booking link, the deposit amount, the support window), and the
 * writing prompts in double braces are left alone. Those are the part
 * that has to sound like it came from a person who listened.
 */

const FILE = path.join(REPO_ROOT, "docs", "clients", "email-templates.md");

export type EmailTemplate = {
  id: number;
  /** "New inquiry reply (contact form submission)" */
  title: string;
  /** Anything the template says about itself between its heading and
      its subject line, like the rule about sending outreach by hand */
  notes: string;
  subject: string;
  body: string;
};

export function listEmailTemplates(): EmailTemplate[] {
  if (!fs.existsSync(FILE)) return [];
  const raw = fs.readFileSync(FILE, "utf8").replace(/\r\n/g, "\n");
  return raw
    .split(/^## /m)
    .slice(1) // the file's own header notes
    .map((chunk) => {
      const at = chunk.search(/^\*\*Subject:\*\*/m);
      if (at === -1) return null;
      // Headings wrap across lines in that file, and some templates
      // carry a paragraph of their own rules before the subject line.
      // The heading is the first paragraph; the rest is notes.
      const head = chunk.slice(0, at);
      const split = head.indexOf("\n\n");
      const heading = (split === -1 ? head : head.slice(0, split))
        .replace(/\s+/g, " ")
        .trim();
      const notes = split === -1 ? "" : head.slice(split).trim();
      const rest = chunk.slice(at);
      const newline = rest.indexOf("\n");
      const subject = rest.slice(0, newline).replace(/^\*\*Subject:\*\*\s*/, "");
      const numbered = heading.match(/^(\d+)\.\s*(.*)$/);
      return {
        id: numbered ? Number(numbered[1]) : 0,
        title: numbered ? numbered[2] : heading,
        notes,
        subject: subject.trim(),
        body: rest.slice(newline + 1).trim(),
      };
    })
    .filter((t): t is EmailTemplate => t !== null);
}

export function getEmailTemplate(id: number): EmailTemplate | null {
  return listEmailTemplates().find((t) => t.id === id) ?? null;
}

/** "Jamie Doe" -> "Jamie". Falls back to the business if there is no
    person's name on the record. */
function firstName(client: ClientRecord): string {
  const first = client.name.trim().split(/\s+/)[0];
  return first || client.business;
}

export function fillEmail(
  template: EmailTemplate,
  client: ClientRecord
): { subject: string; body: string } {
  const site = siteInfo();
  const values: Record<string, string> = {
    FIRST_NAME: firstName(client),
    CAL_LINK: site.bookingUrl,
    SUPPORT_WINDOW: TERMS.supportWindow,
    PHONE: site.phone,
  };
  if (client.value) {
    values.FLAT_PRICE = `$${client.value.toLocaleString("en-US")}`;
    values.DEPOSIT_AMOUNT = `$${Math.round(client.value / 2).toLocaleString("en-US")}`;
  }

  const fill = (s: string) => {
    let out = s;
    for (const [key, value] of Object.entries(values)) {
      if (!value) continue;
      out = out.replaceAll(`{{${key}}}`, value);
    }
    return out;
  };

  return { subject: fill(template.subject), body: fill(template.body) };
}

/** Anything still in double braces, so nothing half-written goes out */
export function unfilled(text: string): number {
  return (text.match(/\{\{[\s\S]*?\}\}/g) ?? []).length;
}
