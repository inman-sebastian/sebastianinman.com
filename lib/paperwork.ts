import fs from "fs";
import path from "path";
import matter from "gray-matter";

/**
 * Client paperwork drafts: MDX files in docs/clients/drafts/, rendered
 * at /paperwork (DEV ONLY; the routes 404 in production and the drafts
 * directory is git-ignored, so client data never reaches the deployed
 * site). See the draft-client-paperwork skill.
 */

const DRAFTS_DIR = path.join(process.cwd(), "docs", "clients", "drafts");

export type PaperworkDraft = {
  slug: string;
  title: string;
  client: string;
  date: string;
  body: string;
};

export function getPaperworkDrafts(): PaperworkDraft[] {
  if (!fs.existsSync(DRAFTS_DIR)) return [];
  return fs
    .readdirSync(DRAFTS_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => {
      const raw = fs.readFileSync(path.join(DRAFTS_DIR, f), "utf8");
      const { data, content } = matter(raw);
      return {
        slug: f.replace(/\.mdx$/, ""),
        title: String(data.title ?? f),
        client: String(data.client ?? ""),
        date: String(data.date ?? ""),
        body: content,
      };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPaperworkDraft(slug: string): PaperworkDraft | undefined {
  return getPaperworkDrafts().find((d) => d.slug === slug);
}
