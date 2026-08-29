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

/**
 * The tools the site already says Sebastian connects, from the
 * tool-integration service page. When detection finds one of these on a
 * prospect's site, that is a real thing to open a conversation with
 * rather than a guess.
 */
export function integratedTools(): Set<string> {
  const file = path.join(SERVICES_DIR, "tool-integration.mdx");
  if (!fs.existsSync(file)) return new Set();
  const { data } = matter(fs.readFileSync(file, "utf8"));
  const tools = Array.isArray(data.tools) ? data.tools : [];
  return new Set(tools.map((t: unknown) => String(t).toLowerCase()));
}

export function serviceTitles(slugs: string[]): string[] {
  const byslug = new Map(listServices().map((s) => [s.slug, s.title]));
  return slugs.map((s) => byslug.get(s) ?? s);
}

/**
 * Roughly what a piece of work would be worth, added up from the
 * starting prices of the services it needs.
 *
 * A floor, never a quote: the starting price is the least a service can
 * go for, so anywhere this shows it has to read as "from". Both the
 * research queue and the client list use it to put a number against a
 * record nobody has quoted yet.
 */
export function estimatedWorth(services: string[]): number {
  const prices = new Map(listServices().map((s) => [s.slug, s.startingPrice]));
  return services.reduce((sum, s) => sum + (prices.get(s) ?? 0), 0);
}
