import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { REPO_ROOT } from "./site";

/**
 * Client documents: proposals, agreements, invoices.
 *
 * These stay exactly where they already are, in docs/clients/drafts/
 * (git-ignored), because the draft-client-paperwork skill and
 * paperwork-app's CLI both expect them there. This module reads and
 * writes the same files; it does not move or reformat anything.
 *
 * A document belongs to a client record when its frontmatter says so
 * (`record: <client-slug>`), and failing that when its filename starts
 * with the client's slug, which is how the older drafts are named.
 */

export const DRAFTS_DIR = path.join(REPO_ROOT, "docs", "clients", "drafts");
export const OUT_DIR = path.join(DRAFTS_DIR, "out");

export const KINDS = [
  { id: "proposal", label: "Proposal" },
  { id: "agreement", label: "Agreement" },
  { id: "invoice", label: "Invoice" },
] as const;

export type DocKind = (typeof KINDS)[number]["id"] | "other";

export type ClientDocument = {
  slug: string;
  /** Filename as it sits on disk, .md or .mdx */
  file: string;
  title: string;
  client: string;
  /** Slug of the client record this belongs to, "" when unlinked */
  record: string;
  kind: DocKind;
  date: string;
  signatures: string[];
  body: string;
  /** Frontmatter keys this app does not manage, preserved on save */
  extra: Record<string, unknown>;
  /** Unresolved {{...}} blocks still in the body */
  placeholders: number;
  /** File mtime, used to bust the preview iframe after an edit */
  updated: string;
  /** Set when a PDF has been generated for this draft */
  pdf: { path: string; generated: string } | null;
};

const PLACEHOLDER_RE = /\{\{[\s\S]*?\}\}/g;

function asText(value: unknown): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return value == null ? "" : String(value).trim();
}

function kindFrom(slug: string, declared: unknown): DocKind {
  const known = KINDS.find((k) => k.id === declared);
  if (known) return known.id;
  const hit = KINDS.find((k) => slug.endsWith(`-${k.id}`));
  return hit ? hit.id : "other";
}

export function kindLabel(kind: DocKind): string {
  return KINDS.find((k) => k.id === kind)?.label ?? "Document";
}

function pdfInfo(slug: string): ClientDocument["pdf"] {
  const file = path.join(OUT_DIR, `${slug}.pdf`);
  if (!fs.existsSync(file)) return null;
  const stat = fs.statSync(file);
  return { path: file, generated: stat.mtime.toISOString() };
}

function toDocument(file: string, raw: string): ClientDocument {
  const slug = file.replace(/\.mdx?$/, "");
  const { data, content } = matter(raw);
  const {
    title,
    client,
    date,
    signatures,
    record,
    kind,
    ...extra
  } = data as Record<string, unknown>;
  return {
    slug,
    file,
    title: asText(title) || slug,
    client: asText(client),
    record: asText(record),
    kind: kindFrom(slug, kind),
    date: asText(date),
    signatures: Array.isArray(signatures) ? signatures.map(asText) : [],
    body: content.trim(),
    extra,
    placeholders: (content.match(PLACEHOLDER_RE) ?? []).length,
    updated: fs.statSync(path.join(DRAFTS_DIR, file)).mtime.toISOString(),
    pdf: pdfInfo(slug),
  };
}

export function listDocuments(): ClientDocument[] {
  if (!fs.existsSync(DRAFTS_DIR)) return [];
  return fs
    .readdirSync(DRAFTS_DIR)
    .filter((f) => /\.mdx?$/.test(f))
    .map((f) => toDocument(f, fs.readFileSync(path.join(DRAFTS_DIR, f), "utf8")))
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getDocument(slug: string): ClientDocument | null {
  for (const ext of [".mdx", ".md"]) {
    const file = path.join(DRAFTS_DIR, `${slug}${ext}`);
    if (fs.existsSync(file)) {
      return toDocument(`${slug}${ext}`, fs.readFileSync(file, "utf8"));
    }
  }
  return null;
}

export function documentsForClient(clientSlug: string): ClientDocument[] {
  if (!clientSlug) return [];
  return listDocuments().filter(
    (d) => d.record === clientSlug || (!d.record && d.slug.startsWith(`${clientSlug}-`))
  );
}

function serialize(doc: ClientDocument): string {
  const data: Record<string, unknown> = {
    ...doc.extra,
    title: doc.title,
    client: doc.client,
    date: doc.date,
  };
  if (doc.record) data.record = doc.record;
  // Written out explicitly rather than left to the filename, which stops
  // being readable the moment a slug gets a -2 on the end
  if (doc.kind !== "other") data.kind = doc.kind;
  if (doc.signatures.length) data.signatures = doc.signatures;
  return matter.stringify(`${doc.body.trim()}\n`, data);
}

function writeAtomic(target: string, contents: string) {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  const tmp = `${target}.tmp`;
  fs.writeFileSync(tmp, contents, "utf8");
  fs.renameSync(tmp, target);
}

export type DocumentPatch = Partial<
  Pick<ClientDocument, "title" | "date" | "signatures" | "body">
>;

export function saveDocument(
  slug: string,
  patch: DocumentPatch
): ClientDocument | null {
  const current = getDocument(slug);
  if (!current) return null;
  const next = { ...current, ...patch };
  writeAtomic(path.join(DRAFTS_DIR, current.file), serialize(next));
  return getDocument(slug);
}

export function createDocument(input: {
  record: string;
  kind: DocKind;
  title: string;
  client: string;
  body: string;
  signatures?: string[];
  date: string;
}): ClientDocument {
  fs.mkdirSync(DRAFTS_DIR, { recursive: true });
  const base = `${input.record || "client"}-${input.kind}`;
  let slug = base;
  let n = 2;
  while (getDocument(slug)) {
    slug = `${base}-${n}`;
    n += 1;
  }
  const doc: ClientDocument = {
    slug,
    file: `${slug}.mdx`,
    title: input.title,
    client: input.client,
    record: input.record,
    kind: input.kind,
    date: input.date,
    signatures: input.signatures ?? [],
    body: input.body,
    extra: {},
    placeholders: 0,
    updated: new Date().toISOString(),
    pdf: null,
  };
  writeAtomic(path.join(DRAFTS_DIR, doc.file), serialize(doc));
  return doc;
}

export function deleteDocument(slug: string): boolean {
  const doc = getDocument(slug);
  if (!doc) return false;
  fs.unlinkSync(path.join(DRAFTS_DIR, doc.file));
  const pdf = path.join(OUT_DIR, `${slug}.pdf`);
  if (fs.existsSync(pdf)) fs.unlinkSync(pdf);
  return true;
}

/**
 * Next invoice number for the year, read off the drafts already on
 * disk. The skill's rule is sequential INV-<year>-<NNN>; this reads the
 * highest one written so far rather than counting files, so a deleted
 * draft never reissues a number.
 */
export function nextInvoiceNumber(year = new Date().getFullYear()): string {
  let highest = 0;
  for (const doc of listDocuments()) {
    for (const m of `${doc.title}\n${doc.body}`.matchAll(/INV-(\d{4})-(\d{3})/g)) {
      if (Number(m[1]) === year) highest = Math.max(highest, Number(m[2]));
    }
  }
  return String(highest + 1).padStart(3, "0");
}
