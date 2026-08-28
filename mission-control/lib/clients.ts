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
  stage: Stage;
  /** Service slugs from content/services/*.mdx */
  services: string[];
  /** Whole dollars; null until there is a real quote */
  value: number | null;
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
    stage: isStage(data.stage) ? data.stage : "inquiry",
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
    stage: record.stage,
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
    stage,
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
export function needsAttention(clients: ClientRecord[]): ClientRecord[] {
  const now = today();
  return clients.filter((c) => {
    if (c.stage === "done" || c.stage === "lost") return false;
    if (c.stage === "prospect" || c.stage === "contacted") {
      return Boolean(c.nextStepDue) && c.nextStepDue <= now;
    }
    if (!c.nextStep || !c.nextStepDue) return true;
    return c.nextStepDue <= now;
  });
}

export function displayName(c: ClientRecord): string {
  return c.business || c.name || c.slug;
}
