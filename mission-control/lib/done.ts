import fs from "node:fs";
import path from "node:path";

/**
 * Which of the day's suggestions have already been ticked.
 *
 * Needed because the briefing is now pinned to the day rather than to
 * the records. That fixed the loop where doing one thing rewrote the
 * whole list, but it left the opposite problem: a pinned list would
 * hand back the item he just finished, for the rest of the day.
 *
 * A record's own tasks do not need this. They come from its stage and
 * its next step, so completing one changes the record and the task
 * stops being generated. Only Claude's suggestions are frozen text with
 * nothing behind them, so only they need remembering.
 *
 * Keyed by day, and old days are dropped on write, so this file cannot
 * grow into a thing anybody has to think about.
 */

const FILE = path.join(process.cwd(), "data", "briefing-done.json");

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

type Store = { day: string; ids: string[] };

function read(): Store {
  try {
    const parsed = JSON.parse(fs.readFileSync(FILE, "utf8")) as Store;
    if (parsed?.day === today() && Array.isArray(parsed.ids)) return parsed;
  } catch {
    // A missing or unreadable file just means nothing is done yet
  }
  return { day: today(), ids: [] };
}

/** Suggestion ids already ticked today */
export function doneToday(): Set<string> {
  return new Set(read().ids);
}

export function markSuggestionDone(id: string): void {
  if (!id) return;
  const store = read();
  if (store.ids.includes(id)) return;
  store.ids.push(id);
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(store));
}

/** Start the day's list over, for "Ask again" */
export function clearDone(): void {
  fs.rmSync(FILE, { force: true });
}
