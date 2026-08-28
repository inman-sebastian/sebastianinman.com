import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

/**
 * Prospects: businesses Cowork found by research, waiting to be looked
 * at. They are deliberately NOT clients. Nobody here has been in touch,
 * nobody has agreed to anything, and a research run produces a batch of
 * them at once, so they stay out of the pipeline until Sebastian says a
 * particular one is worth pursuing.
 *
 * Same file format and the same only-writer rule as lib/clients.ts, so
 * Cowork can write these directly with plain file tools.
 *
 * Body convention: "## What I saw", "## Why it's a fit", "## Opening
 * line". The first is evidence with source links, the last is the true,
 * specific observation the first email leads with.
 */

export const PROSPECTS_DIR = path.join(process.cwd(), "data", "prospects");
const DNC_FILE = path.join(process.cwd(), "data", "do-not-contact.md");

export type Fit = "strong" | "worth a look";
export type ProspectStatus = "new" | "promoted" | "passed";

export type Prospect = {
  slug: string;
  business: string;
  city: string;
  category: string;
  /** Empty when they don't have one, which is itself the strongest signal */
  website: string;
  phone: string;
  /** Published business address only */
  email: string;
  /** Where it was found, so every claim can be checked */
  listing: string;
  /** What the site is built on, from scripts/detect-stack.mjs */
  platform: string;
  /** Tools already running on the site, same source */
  stack: string[];
  fit: Fit;
  /** Service slugs from content/services/*.mdx */
  services: string[];
  researched: string;
  status: ProspectStatus;
  /** Everything above "## Why it's a fit" */
  saw: string;
  why: string;
  openingLine: string;
  /** The whole body, for editing */
  body: string;
};

function asText(value: unknown): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return value == null ? "" : String(value).trim();
}

export function today(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

function filePath(slug: string) {
  return path.join(PROSPECTS_DIR, `${slug}.md`);
}

function writeAtomic(target: string, contents: string) {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  const tmp = `${target}.tmp`;
  fs.writeFileSync(tmp, contents, "utf8");
  fs.renameSync(tmp, target);
}

/** Pull one "## Heading" section out of the body */
function section(body: string, heading: string): string {
  const re = new RegExp(`^##\\s+${heading}\\s*$`, "im");
  const m = body.match(re);
  if (!m || m.index === undefined) return "";
  const after = body.slice(m.index + m[0].length);
  const next = after.search(/^##\s+/m);
  return (next === -1 ? after : after.slice(0, next)).trim();
}

function toProspect(slug: string, raw: string): Prospect {
  const { data, content } = matter(raw);
  const fit = asText(data.fit).toLowerCase();
  const status = asText(data.status).toLowerCase();
  return {
    slug,
    business: asText(data.business),
    city: asText(data.city),
    category: asText(data.category),
    website: asText(data.website),
    phone: asText(data.phone),
    email: asText(data.email),
    listing: asText(data.listing),
    platform: asText(data.platform),
    stack: Array.isArray(data.stack) ? data.stack.map(asText) : [],
    fit: fit === "strong" ? "strong" : "worth a look",
    services: Array.isArray(data.services) ? data.services.map(asText) : [],
    researched: asText(data.researched) || today(),
    status:
      status === "promoted" || status === "passed"
        ? (status as ProspectStatus)
        : "new",
    saw: section(content, "What I saw"),
    why: section(content, "Why it's a fit"),
    openingLine: section(content, "Opening line"),
    body: content.trim(),
  };
}

function serialize(p: Prospect): string {
  return matter.stringify(`${p.body.trim()}\n`, {
    business: p.business,
    city: p.city,
    category: p.category,
    website: p.website,
    phone: p.phone,
    email: p.email,
    listing: p.listing,
    platform: p.platform,
    stack: p.stack,
    fit: p.fit,
    services: p.services,
    researched: p.researched,
    status: p.status,
  });
}

export function listProspects(): Prospect[] {
  if (!fs.existsSync(PROSPECTS_DIR)) return [];
  return fs
    .readdirSync(PROSPECTS_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) =>
      toProspect(
        f.replace(/\.md$/, ""),
        fs.readFileSync(path.join(PROSPECTS_DIR, f), "utf8")
      )
    )
    .sort((a, b) => {
      if (a.fit !== b.fit) return a.fit === "strong" ? -1 : 1;
      return a.researched < b.researched ? 1 : -1;
    });
}

export function getProspect(slug: string): Prospect | null {
  const file = filePath(slug);
  if (!fs.existsSync(file)) return null;
  return toProspect(slug, fs.readFileSync(file, "utf8"));
}

export type ProspectPatch = Partial<
  Pick<Prospect, "business" | "city" | "email" | "phone" | "website" | "status" | "services" | "body">
>;

export function updateProspect(
  slug: string,
  patch: ProspectPatch
): Prospect | null {
  const current = getProspect(slug);
  if (!current) return null;
  writeAtomic(filePath(slug), serialize({ ...current, ...patch }));
  return getProspect(slug);
}

/**
 * The do-not-contact list: businesses, domains, or addresses that must
 * never be researched or written to again. One per line; anything after
 * a # is a note. Research reads this before writing anything, and the
 * composer warns when a record matches.
 */
export function doNotContact(): string[] {
  if (!fs.existsSync(DNC_FILE)) return [];
  return fs
    .readFileSync(DNC_FILE, "utf8")
    .split("\n")
    .map((line) => line.replace(/#.*$/, "").trim().toLowerCase())
    .filter((line) => line.length > 0 && !line.startsWith("<!--"));
}

/** Whether any of a record's details appear on the do-not-contact list */
export function isBlocked(fields: string[]): string | null {
  const list = doNotContact();
  for (const field of fields) {
    const value = field.trim().toLowerCase();
    if (!value) continue;
    const hit = list.find((entry) => value === entry || value.includes(entry));
    if (hit) return hit;
  }
  return null;
}
