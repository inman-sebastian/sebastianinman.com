import fs from "node:fs";
import path from "node:path";
import { REPO_ROOT, siteInfo } from "./site";

/**
 * The email signature, read from the same file Gmail's copy came out of.
 *
 * docs/marketing/email-signature.html holds the markup once. Sebastian
 * pastes the full signature into Gmail from there, and this reads the
 * identical block so mail sent by the app looks like mail he typed
 * himself. Keeping a second copy in TypeScript would guarantee the two
 * drift, and the drift would only ever show up in a client's inbox.
 *
 * Same arrangement as lib/emails.ts reading docs/clients/email-templates.md
 * and lib/site.ts parsing content/site.ts: the document is the source,
 * this is a reader.
 */

const FILE = path.join(REPO_ROOT, "docs", "marketing", "email-signature.html");

/** The FULL signature: the first block between the copy markers. The
    second block is the short reply version, which the app never uses. */
const BLOCK = /<!-- ===== COPY FROM HERE ===== -->([\s\S]*?)<!-- ===== TO HERE ===== -->/;

/**
 * The signature as HTML, or "" if the file or its markers are gone.
 *
 * Empty rather than throwing: a missing signature should not stop a
 * client email from going out, and the composer renders this in the
 * confirm step, so its absence is visible before anything sends.
 */
export function signatureHtml(): string {
  if (!fs.existsSync(FILE)) return "";
  const found = fs.readFileSync(FILE, "utf8").match(BLOCK);
  return found ? found[1].trim() : "";
}

/**
 * The plain-text half of the same signature, for the text/plain
 * alternative that goes out beside the HTML.
 *
 * Written out rather than stripped from the markup, because a stripped
 * version loses every href and would print "Book a free consult" with
 * nothing to book. The facts come from content/site.ts so they cannot
 * drift from the site; only the arrangement lives here.
 *
 * The leading "-- " is the long-standing plain-text signature
 * delimiter, which mail clients use to fold a signature away.
 */
export function signatureText(): string {
  const site = siteInfo();
  const lines = [
    "-- ",
    site.name,
    "Automation & AI help for small businesses",
    "",
    site.phone,
    site.email,
    site.url,
  ];
  if (site.bookingUrl) lines.push(`Book a free consult: ${site.bookingUrl}`);
  return lines.join("\n");
}

const ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
};

function escapeHtml(text: string): string {
  return text.replace(/[&<>"]/g, (c) => ESCAPES[c]);
}

/**
 * The written message as HTML, with every line break kept.
 *
 * Newlines become <br> rather than being reflowed into paragraphs. The
 * tempting version joins hard-wrapped lines back into flowing text, and
 * it cannot be done safely: template 1 ends with
 *
 *     You can grab a time that suits you here: {{CAL_LINK}}
 *     Or just reply with a couple of times that work.
 *
 * two deliberately separate lines, and the first one is long once the
 * booking URL is filled in. Any width-based guess at "this was a wrap"
 * merges them. Keeping the breaks means the message reads exactly as it
 * was written, and as its plain-text twin reads.
 */
export function bodyHtml(body: string): string {
  return linkify(escapeHtml(body.trim())).replace(/\n/g, "<br>");
}

/**
 * Bare URLs in the message, turned into real links.
 *
 * Not cosmetic. Templates drop raw links into the prose ({{CAL_LINK}} in
 * template 1 is the booking page, and it is the whole next step of that
 * email). A mail client auto-links a bare URL in a plain-text message,
 * but not inside an HTML part, so without this the booking link arrives
 * as text nobody can click.
 *
 * Runs after escaping, so an "&" in a query string is already "&amp;",
 * which is what an href needs anyway. Trailing sentence punctuation is
 * left outside the link; "…here: https://cal.com/x." should not put the
 * full stop in the URL.
 */
function linkify(escaped: string): string {
  return escaped.replace(/https?:\/\/[^\s<]+/g, (url) => {
    const trailing = url.match(/[.,;:!?)]+$/);
    const href = trailing ? url.slice(0, -trailing[0].length) : url;
    return `<a href="${href}" style="color:#234f3e;">${href}</a>${trailing?.[0] ?? ""}`;
  });
}

/**
 * The whole message: what was written, then the signature.
 *
 * 600px is the width every email client has been designed around for
 * twenty years, and the templates wrap at about 68 characters, which
 * sits inside it at this size without re-wrapping.
 */
export function emailHtml(body: string): string {
  const signature = signatureHtml();
  return [
    `<div style="max-width:600px;font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;font-size:14px;line-height:1.6;color:#2b2620;">`,
    bodyHtml(body),
    signature ? `<div style="height:28px;line-height:28px;">&nbsp;</div>` : "",
    signature,
    `</div>`,
  ]
    .filter(Boolean)
    .join("\n");
}

/** The whole message as plain text, for the alternative part */
export function emailText(body: string): string {
  const signature = signatureText();
  return signature ? `${body.trim()}\n\n${signature}\n` : `${body.trim()}\n`;
}
