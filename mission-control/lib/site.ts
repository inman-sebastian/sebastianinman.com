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
