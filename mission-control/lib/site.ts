import fs from "node:fs";
import path from "node:path";

/**
 * The website's own files, read from one directory up.
 *
 * content/site.ts gets parsed with a regex rather than imported, the
 * same trick paperwork-app/render.js uses. It keeps the public site's
 * module graph and this app's bundler completely separate, and it means
 * a change over there shows up here on the next refresh.
 */

export const REPO_ROOT = path.join(process.cwd(), "..");

/**
 * The project's own voice guide, read out of CLAUDE.md.
 *
 * Anything that writes copy on Sebastian's behalf gets the real
 * document rather than somebody's summary of it. A paraphrase drifts:
 * the first version of the email drafter carried a hand-written gloss
 * that kept the rules about not inventing things and lost the ones
 * about warmth, and the drafts came out accurate and cold.
 */
export function voiceGuide(): string {
  const file = path.join(REPO_ROOT, "CLAUDE.md");
  if (!fs.existsSync(file)) return "";
  const text = fs.readFileSync(file, "utf8");
  const start = text.indexOf("## Voice guide");
  if (start === -1) return "";
  const end = text.indexOf("\n## ", start + 3);
  return text.slice(start, end === -1 ? undefined : end).trim();
}

export type SiteInfo = {
  name: string;
  email: string;
  phone: string;
  url: string;
  bookingUrl: string;
};

export function siteInfo(): SiteInfo {
  const src = fs.readFileSync(path.join(REPO_ROOT, "content", "site.ts"), "utf8");
  const grab = (key: string, fallback = "") => {
    const m = src.match(new RegExp(`${key}:\\s*"([^"]*)"`));
    return m ? m[1] : fallback;
  };
  return {
    name: grab("name", "Sebastian Inman"),
    email: grab("email"),
    phone: grab("phone"),
    url: grab("url", "https://www.sebastianinman.com"),
    bookingUrl: grab("bookingUrl"),
  };
}
