import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { isSource, isStage, type Source, type Stage } from "./stages";

/**
 * Client records: one markdown file per person, in a git-ignored folder.
 * Frontmatter holds the structured half (stage, contact, money); the
 * body holds the human half (what they said, then the timeline).
 *
 * This module is the ONLY writer. Both the app and Cowork go through it,
 * or through the same file format by hand, so records always look alike.
 *
 * Body convention: notes first, then a "## Timeline" heading with
 * "### <date> · <title>" entries, oldest first. Timeline stays the last
 * section of the file; new entries get appended to the end.
 */

export const DATA_DIR = path.join(process.cwd(), "data", "clients");

export type ClientRecord = {
  slug: string;
  name: string;
  business: string;
  email: string;
  phone: string;
  /** Town, so they can be put on the map with everyone else */
  city: string;
  address: string;
  lat: number | null;
  lng: number | null;
  stage: Stage;

  /**
   * Everything below is filled in by research and stays empty for
   * anyone who got in touch on their own. They are attributes of one
   * client record, not a second kind of thing: a business found by
   * research and a business that emailed the contact form are the same
   * sort of entity at different points in the same arc.
   */
  website: string;
  category: string;
  /** Where the research found them, so the claims can be checked */
  listing: string;
  googleProfile: "yes" | "no" | "unknown";
  googleProfileUrl: string;
  /** What their site is built on, from scripts/detect-stack.mjs */
  platform: string;
  /** Tools already running on their site */
  stack: string[];
  /** "strong" or "worth a look"; empty for inbound */
  fit: string;
  /** ISO date the research ran */
  researched: string;
  /** Service slugs from content/services/*.mdx */
  services: string[];
  /** Whole dollars; null until there is a real quote */
  value: number | null;
  /** The Stripe customer this record bills through, once one exists */
  stripeCustomerId: string;
  source: Source;
  nextStep: string;
  /** ISO date, or "" when nothing is scheduled */
  nextStepDue: string;
  created: string;
  updated: string;
  /** Everything above the "## Timeline" heading */
  notes: string;
  timeline: TimelineEntry[];
};

export type TimelineEntry = {
  date: string;
  title: string;
  note: string;
};

/** Fields a form can set. Everything else is bookkeeping. */
export type ClientInput = Partial<
  Pick<
    ClientRecord,
    | "name"
    | "business"
    | "email"
    | "phone"
    | "city"
    | "address"
    | "lat"
    | "lng"
    | "website"
    | "category"
    | "listing"
    | "googleProfile"
    | "googleProfileUrl"
    | "stripeCustomerId"
    | "platform"
    | "stack"
    | "fit"
    | "researched"
    | "stage"
    | "services"
    | "value"
    | "source"
    | "nextStep"
    | "nextStepDue"
    | "notes"
  >
>;

const TIMELINE_HEADING = "## Timeline";

/** Today in the local timezone as YYYY-MM-DD (never UTC, which can
    roll the date over in the evening here) */
export function today(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Hand-edited files may carry unquoted YAML dates, which parse as Date
    objects; flatten everything back to a plain YYYY-MM-DD string */
function asDate(value: unknown): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  const s = String(value ?? "").trim();
  return /^\d{4}-\d{2}-\d{2}/.test(s) ? s.slice(0, 10) : "";
}

function asText(value: unknown): string {
  return value == null ? "" : String(value).trim();
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
  return path.join(DATA_DIR, `${slug}.md`);
}

/** Write through a temp file so a crash mid-write cannot shred a record */
function writeAtomic(target: string, contents: string) {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  const tmp = `${target}.tmp`;
  fs.writeFileSync(tmp, contents, "utf8");
  fs.renameSync(tmp, target);
}

function splitBody(body: string): { notes: string; timeline: TimelineEntry[] } {
  const at = body.indexOf(TIMELINE_HEADING);
  if (at === -1) return { notes: body.trim(), timeline: [] };
  const notes = body.slice(0, at).trim();
  const rest = body.slice(at + TIMELINE_HEADING.length);
  const timeline = rest
    .split(/^### /m)
    .slice(1)
    .map((chunk) => {
      const [heading, ...lines] = chunk.split("\n");
      const [date, ...titleParts] = heading.split("·");
      return {
        date: date.trim(),
        title: titleParts.join("·").trim(),
        note: lines.join("\n").trim(),
      };
    });
  return { notes, timeline };
}

function joinBody(notes: string, timeline: TimelineEntry[]): string {
  const entries = timeline
    .map((e) =>
      [`### ${e.date} · ${e.title}`, e.note].filter(Boolean).join("\n\n")
    )
    .join("\n\n");
  return [notes.trim(), TIMELINE_HEADING, entries]
    .filter(Boolean)
    .join("\n\n")
    .concat("\n");
}

/**
 * A coordinate, or null when the record hasn't got one.
 *
 * Worth its own function because the obvious check is wrong: Number(null)
 * is 0, 0 is finite, and 0, 0 is a real place in the Gulf of Guinea. A
 * hand-written record saying `lat: null` is a supported way to edit these
 * files, so it must not come back as a pin off the coast of Africa.
 */
function coord(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function toRecord(slug: string, raw: string): ClientRecord {
  const { data, content } = matter(raw);
  const { notes, timeline } = splitBody(content);
  const services = Array.isArray(data.services)
    ? data.services.map((s: unknown) => String(s))
    : [];
  const value = Number(data.value);
  return {
    slug,
    name: asText(data.name),
    business: asText(data.business),
    email: asText(data.email),
    phone: asText(data.phone),
    city: asText(data.city),
    address: asText(data.address),
    lat: coord(data.lat),
    lng: coord(data.lng),
    stage: isStage(data.stage) ? data.stage : "inquiry",
    website: asText(data.website),
    category: asText(data.category),
    listing: asText(data.listing),
    googleProfile:
      asText(data.googleProfile).toLowerCase() === "yes"
        ? "yes"
        : asText(data.googleProfile).toLowerCase() === "no"
          ? "no"
          : "unknown",
    googleProfileUrl: asText(data.googleProfileUrl),
    stripeCustomerId: asText(data.stripeCustomerId),
    platform: asText(data.platform),
    stack: Array.isArray(data.stack) ? data.stack.map((t: unknown) => String(t)) : [],
    fit: asText(data.fit),
    researched: asDate(data.researched),
    services,
    value: Number.isFinite(value) && value > 0 ? value : null,
    source: isSource(data.source) ? data.source : "manual",
    nextStep: asText(data.nextStep),
    nextStepDue: asDate(data.nextStepDue),
    created: asDate(data.created) || today(),
    updated: asDate(data.updated) || today(),
    notes,
    timeline,
  };
}

function serialize(record: ClientRecord): string {
  return matter.stringify(joinBody(record.notes, record.timeline), {
    name: record.name,
    business: record.business,
    email: record.email,
    phone: record.phone,
    city: record.city,
    address: record.address,
    lat: record.lat ?? "",
    lng: record.lng ?? "",
    stage: record.stage,
    website: record.website,
    category: record.category,
    listing: record.listing,
    googleProfile: record.googleProfile,
    googleProfileUrl: record.googleProfileUrl,
    stripeCustomerId: record.stripeCustomerId,
    platform: record.platform,
    stack: record.stack,
    fit: record.fit,
    researched: record.researched,
    services: record.services,
    value: record.value ?? "",
    source: record.source,
    nextStep: record.nextStep,
    nextStepDue: record.nextStepDue,
    created: record.created,
    updated: record.updated,
  });
}

export function listClients(): ClientRecord[] {
  if (!fs.existsSync(DATA_DIR)) return [];
  return fs
    .readdirSync(DATA_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) =>
      toRecord(
        f.replace(/\.md$/, ""),
        fs.readFileSync(path.join(DATA_DIR, f), "utf8")
      )
    )
    .sort((a, b) => (a.updated < b.updated ? 1 : -1));
}

export function getClient(slug: string): ClientRecord | null {
  const file = filePath(slug);
  if (!fs.existsSync(file)) return null;
  return toRecord(slug, fs.readFileSync(file, "utf8"));
}

/** Business name first (that is how he'll think of them), person second */
function freshSlug(input: ClientInput): string {
  const base =
    slugify(input.business || "") || slugify(input.name || "") || "client";
  let slug = base;
  let n = 2;
  while (fs.existsSync(filePath(slug))) {
    slug = `${base}-${n}`;
    n += 1;
  }
  return slug;
}

export function createClient(input: ClientInput): ClientRecord {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const stage = input.stage ?? "inquiry";
  const record: ClientRecord = {
    slug: freshSlug(input),
    name: input.name ?? "",
    business: input.business ?? "",
    email: input.email ?? "",
    phone: input.phone ?? "",
    city: input.city ?? "",
    address: input.address ?? "",
    lat: input.lat ?? null,
    lng: input.lng ?? null,
    stage,
    website: input.website ?? "",
    category: input.category ?? "",
    listing: input.listing ?? "",
    googleProfile: input.googleProfile ?? "unknown",
    googleProfileUrl: input.googleProfileUrl ?? "",
    stripeCustomerId: input.stripeCustomerId ?? "",
    platform: input.platform ?? "",
    stack: input.stack ?? [],
    fit: input.fit ?? "",
    researched: input.researched ?? "",
    services: input.services ?? [],
    value: input.value ?? null,
    source: input.source ?? "manual",
    nextStep: input.nextStep ?? "",
    nextStepDue: input.nextStepDue ?? "",
    created: today(),
    updated: today(),
    notes: input.notes ?? "",
    timeline: [{ date: today(), title: "Added to the pipeline", note: "" }],
  };
  writeAtomic(filePath(record.slug), serialize(record));
  return record;
}

export function updateClient(
  slug: string,
  patch: ClientInput
): ClientRecord | null {
  const current = getClient(slug);
  if (!current) return null;
  const next: ClientRecord = { ...current, ...patch, updated: today() };
  writeAtomic(filePath(slug), serialize(next));
  return next;
}

export function appendTimeline(
  slug: string,
  title: string,
  note = ""
): ClientRecord | null {
  const current = getClient(slug);
  if (!current) return null;
  const next: ClientRecord = {
    ...current,
    updated: today(),
    timeline: [...current.timeline, { date: today(), title, note }],
  };
  writeAtomic(filePath(slug), serialize(next));
  return next;
}

export function deleteClient(slug: string): boolean {
  const file = filePath(slug);
  if (!fs.existsSync(file)) return false;
  fs.unlinkSync(file);
  return true;
}

/**
 * Records waiting on Sebastian: no next step, no date on the next step,
 * or a date that has arrived. Undated counts as waiting on purpose; if
 * it isn't on the calendar, it's on him.
 *
 * Prospects and people already contacted are the exception. They arrive
 * in batches from a research run and nobody is expecting anything, so
 * they only count as waiting once a date has been put on them and that
 * date has come. Otherwise one afternoon of research would bury the
 * people who actually wrote in.
 */
/**
 * How long a record can sit untouched before it is worth a nudge.
 *
 * Per stage, because the stages do not mean the same thing. Somebody
 * who wrote in and heard nothing for two days is a worse problem than a
 * build that has been quiet for a week. Stages left out of this are
 * either not started (`researched`, `prospect`) or over (`done`,
 * `lost`), and a batch from a research run must never nag.
 */
const QUIET_AFTER: Partial<Record<Stage, number>> = {
  contacted: 7, // the stage's own advice: give it a week
  inquiry: 2, // they reached out; silence here costs the most
  consult: 3, // the proposal should follow the call while it is warm
  proposal: 5, // the quote is with them
  agreement: 5, // paperwork out, waiting on a signature
  build: 10, // work in progress, but silence still costs trust
  delivered: 7,
  review: 7,
};

function daysBetween(from: string, to: string): number {
  const a = Date.parse(`${from}T00:00:00Z`);
  const b = Date.parse(`${to}T00:00:00Z`);
  if (Number.isNaN(a) || Number.isNaN(b)) return 0;
  return Math.round((b - a) / 86_400_000);
}

/**
 * Records nothing has happened to in a while.
 *
 * This is the other half of `needsAttention`, and deliberately not the
 * same question. That one asks what is due; this asks what has gone
 * quiet, which is how a deal actually dies: not with a missed date, but
 * with nobody noticing that three weeks went by. Anything already
 * flagged as due is left out so one record never appears twice.
 */
export function goneQuiet(clients: ClientRecord[]): ClientRecord[] {
  const now = today();
  const due = new Set(needsAttention(clients).map((c) => c.slug));
  return clients
    .filter((c) => {
      if (due.has(c.slug)) return false;
      const limit = QUIET_AFTER[c.stage];
      if (limit === undefined) return false;
      return daysBetween(c.updated, now) >= limit;
    })
    .sort((a, b) => (a.updated < b.updated ? -1 : 1));
}

/** How long a record has been sitting, in days */
export function daysSinceTouched(c: ClientRecord): number {
  return daysBetween(c.updated, today());
}

export function needsAttention(clients: ClientRecord[]): ClientRecord[] {
  const now = today();
  return clients.filter((c) => {
    if (c.stage === "done" || c.stage === "lost") return false;
    // A research batch is not a to-do list. Those are judged in the
    // review queue, which is where they are already counted; listing
    // all of them here fills the dashboard with identical rows saying
    // the stage's own default next step.
    if (c.stage === "researched") return false;
    if (c.stage === "prospect" || c.stage === "contacted") {
      return Boolean(c.nextStepDue) && c.nextStepDue <= now;
    }
    if (!c.nextStep || !c.nextStepDue) return true;
    return c.nextStepDue <= now;
  });
}

/** Found by research, not yet judged. The review queue. */
export function listResearched(): ClientRecord[] {
  return listClients()
    .filter((c) => c.stage === "researched")
    .sort((a, b) => {
      if (a.fit !== b.fit) return a.fit === "strong" ? -1 : 1;
      return a.created < b.created ? 1 : -1;
    });
}

export function displayName(c: ClientRecord): string {
  return c.business || c.name || c.slug;
}
