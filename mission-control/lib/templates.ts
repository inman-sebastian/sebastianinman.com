import fs from "node:fs";
import path from "node:path";
import { REPO_ROOT } from "./site";
import { siteInfo } from "./site";
import { longDate } from "./format";
import type { ClientRecord } from "./clients";
import type { DocKind } from "./documents";

/**
 * The document templates in docs/clients/. Each file opens with notes
 * for whoever is filling it in, then a `---` line, then the template
 * itself. Only the part after that line becomes a draft; the notes stay
 * where they are and keep applying.
 *
 * Filling is deliberately mechanical. Placeholders that are just facts
 * (name, business, date, price, phone) get resolved from the client
 * record and content/site.ts. The ones that are writing prompts
 * (`{{ONE_SHORT_PARAGRAPH: restate what's eating their time...}}`) are
 * left exactly as they are, because answering those is the actual work
 * and it needs Sebastian's notes from the consult, not a guess.
 */

const TEMPLATE_DIR = path.join(REPO_ROOT, "docs", "clients");

const FILES: Record<string, string> = {
  proposal: "proposal-template.md",
  agreement: "services-agreement.md",
  invoice: "invoice-template.md",
};

export type Template = {
  body: string;
  /** True while the template's own notes still say it is not reviewed */
  needsLawyerReview: boolean;
};

export function loadTemplate(kind: DocKind): Template | null {
  const file = FILES[kind];
  if (!file) return null;
  const full = path.join(TEMPLATE_DIR, file);
  if (!fs.existsSync(full)) return null;
  const raw = fs.readFileSync(full, "utf8");
  const split = raw.indexOf("\n---\n");
  const notes = split === -1 ? raw : raw.slice(0, split);
  const body = split === -1 ? raw : raw.slice(split + 5);
  return {
    body: body.trim(),
    needsLawyerReview: /NOT YET LAWYER-REVIEWED/i.test(notes),
  };
}

/** Default terms, straight from the paperwork skill: half up front,
    the rest within 14 days, 30 days of free fixes after delivery. */
export const TERMS = { paymentDays: 14, supportWindow: "30 days" };

export function fillTemplate(
  body: string,
  client: ClientRecord,
  opts: { invoiceNumber?: string; proposalDate?: string } = {}
): string {
  const site = siteInfo();
  const today = new Date();
  const price = client.value;

  const values: Record<string, string> = {
    CLIENT_NAME: client.name,
    CLIENT_BUSINESS: client.business,
    DATE: longDate(new Date().toISOString().slice(0, 10)),
    PHONE: site.phone,
    YEAR: String(today.getFullYear()),
    PAYMENT_DAYS: String(TERMS.paymentDays),
    SUPPORT_WINDOW: TERMS.supportWindow,
  };
  if (price) {
    values.FLAT_PRICE = `$${price.toLocaleString("en-US")}`;
    values.DEPOSIT_PORTION = `$${Math.round(price / 2).toLocaleString("en-US")} (half)`;
  }
  if (opts.invoiceNumber) values.NNN = opts.invoiceNumber;
  if (opts.proposalDate) values.PROPOSAL_DATE = longDate(opts.proposalDate);

  let out = body;
  for (const [key, value] of Object.entries(values)) {
    if (!value) continue;
    out = out.replaceAll(`{{${key}}}`, value);
  }
  // The agreement template carries a note to the drafter about putting
  // signatures in frontmatter; the app does that itself, so the comment
  // has no business in a client's copy
  return out.replace(/<!--[\s\S]*?-->\s*$/g, "").trim();
}

/** The title that goes in frontmatter. Sebastian renames it if the
    project deserves a better name than the business does. */
export function templateTitle(
  kind: DocKind,
  client: ClientRecord,
  invoiceNumber?: string
): string {
  const who = client.business || client.name;
  if (kind === "invoice") {
    return `Invoice INV-${new Date().getFullYear()}-${invoiceNumber} · ${who}`;
  }
  if (kind === "agreement") return `Agreement for ${who}`;
  return `Proposal for ${who}`;
}

/** Agreements are signed by both sides; nothing else is */
export function templateSignatures(
  kind: DocKind,
  client: ClientRecord
): string[] {
  if (kind !== "agreement") return [];
  const them = [client.name, client.business].filter(Boolean).join(", ");
  return [siteInfo().name, them || "Client"];
}
