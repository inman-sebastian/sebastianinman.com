import fs from "node:fs";
import path from "node:path";

/**
 * What has been ticked off, and enough about it to still show.
 *
 * Two jobs, and they need different windows.
 *
 * Showing: a ticked item stays on the list, struck through, for the
 * rest of the day, because the point of a day's list is being able to
 * look back at what you did. The record's own timeline is the durable
 * account; this is just the day in front of you.
 *
 * Suppressing: a ticked suggestion must never come back, and that has
 * to outlast the day, because suggestions now roll over rather than
 * being regenerated every morning. So ids are remembered longer than
 * the entries are displayed.
 *
 * It keeps the label and the name because a finished RECORD task stops
 * being generated the moment the record moves. There is nothing left to
 * render it from, so what is needed to show it has to be written down
 * here at the moment it is ticked.
 */

const FILE = path.join(process.cwd(), "data", "tasks-done.json");

/** Long enough that a rolled-over suggestion cannot reappear, short
    enough that this file never becomes something to think about. */
const KEEP_DAYS = 30;

export type DoneEntry = {
  id: string;
  slug: string;
  who: string;
  label: string;
  /** ISO date it was ticked */
  day: string;
};

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function read(): DoneEntry[] {
  try {
    const parsed = JSON.parse(fs.readFileSync(FILE, "utf8"));
    return Array.isArray(parsed) ? (parsed as DoneEntry[]) : [];
  } catch {
    return [];
  }
}

function write(entries: DoneEntry[]): void {
  const cutoff = new Date(Date.now() - KEEP_DAYS * 86400_000)
    .toISOString()
    .slice(0, 10);
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(
    FILE,
    JSON.stringify(entries.filter((e) => e.day >= cutoff))
  );
}

/** Every id ticked recently, for keeping finished suggestions away */
export function doneIds(): Set<string> {
  return new Set(read().map((e) => e.id));
}

/** Just today's, which is what still shows on the list */
export function completedToday(): DoneEntry[] {
  const day = today();
  return read().filter((e) => e.day === day);
}

export function markDone(entry: Omit<DoneEntry, "day">): void {
  if (!entry.id) return;
  const entries = read();
  if (entries.some((e) => e.id === entry.id && e.day === today())) return;
  entries.push({ ...entry, day: today() });
  write(entries);
}

/** Start over, for "Ask again": a new list has new ids anyway */
export function clearDone(): void {
  fs.rmSync(FILE, { force: true });
}
