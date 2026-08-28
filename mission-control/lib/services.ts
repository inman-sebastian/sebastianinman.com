import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { REPO_ROOT } from "./site";

/**
 * The services on the public site, read live from content/services.
 * Two jobs here: the checkboxes on a client record, and the starting
 * price, which is the floor for any quote (never go under it).
 */

export type ServiceSummary = {
  slug: string;
  title: string;
  startingPrice: number;
  order: number;
};

const SERVICES_DIR = path.join(REPO_ROOT, "content", "services");

export function listServices(): ServiceSummary[] {
  if (!fs.existsSync(SERVICES_DIR)) return [];
  return fs
    .readdirSync(SERVICES_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => {
      const { data } = matter(fs.readFileSync(path.join(SERVICES_DIR, f), "utf8"));
      return {
        slug: f.replace(/\.mdx$/, ""),
        title: String(data.title ?? f),
        startingPrice: Number(data.startingPrice ?? 0),
        order: Number(data.order ?? 99),
      };
    })
    .sort((a, b) => a.order - b.order);
}

/** Map a service title back to its slug, for the inquiry-email parser */
export function slugForTitle(title: string): string | null {
  const want = title.trim().toLowerCase();
  const hit = listServices().find((s) => s.title.toLowerCase() === want);
  return hit ? hit.slug : null;
}

export function serviceTitles(slugs: string[]): string[] {
  const byslug = new Map(listServices().map((s) => [s.slug, s.title]));
  return slugs.map((s) => byslug.get(s) ?? s);
}
