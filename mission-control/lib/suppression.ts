import fs from "node:fs";
import path from "node:path";

/**
 * The do-not-contact list: businesses, domains, or addresses that must
 * never be researched or written to again. One per line; anything after
 * a # is a note.
 *
 * This lives on its own rather than inside the record module because it
 * outlives records. Someone asking not to be contacted still counts
 * after their record is deleted.
 */

const DNC_FILE = path.join(process.cwd(), "data", "do-not-contact.md");

export function doNotContact(): string[] {
  if (!fs.existsSync(DNC_FILE)) return [];
  return fs
    .readFileSync(DNC_FILE, "utf8")
    .split("\n")
    .map((line) => line.replace(/#.*$/, "").trim().toLowerCase())
    .filter((line) => line.length > 0 && !line.startsWith("<!--"));
}

/** Whether any of a record's details appear on the list */
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
