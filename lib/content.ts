import fs from "fs";
import path from "path";
import matter from "gray-matter";

/**
 * Content loaders. All site copy lives in `content/` as MDX files with
 * frontmatter; see CLAUDE.md for the recipes to add or edit content.
 */

const CONTENT_DIR = path.join(process.cwd(), "content");

export type Service = {
  slug: string;
  title: string;
  summary: string;
  order: number;
  /** "Starting at" anchor in whole dollars */
  startingPrice: number;
  image: string;
  imagePrompt: string;
  imageAlt: string;
  /** Raw frontmatter arrays for the rotating hero cards; parse with
   *  parseHeroCards() from lib/heroCards.ts */
  heroCardsTop?: unknown[];
  heroCardsBottom?: unknown[];
  /** Short busywork phrases rendered as poppable chips ("Sound familiar?") */
  busywork: string[];
  /** Business types this service suits; shown as "Best for" on cards */
  bestFor: string[];
  /** "What you get" items, rendered as a checklist grid */
  deliverables: string[];
  /** "A good fit if…" sentence, rendered as a callout with the CTA */
  goodFit: string;
  body: string;
};

export type LandingPage = {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  heroHeadline: string;
  heroSubline: string;
  city: string;
  /** "location" pages are literal places listed under Areas I serve;
   *  "campaign" pages (e.g. service+geo hybrids) are ad/search entry
   *  points that never appear in on-site navigation */
  kind: "location" | "campaign";
  /** Raw frontmatter arrays for the rotating hero cards; parse with
   *  parseHeroCards() from lib/heroCards.ts */
  heroCardsTop?: unknown[];
  heroCardsBottom?: unknown[];
  body: string;
};

function readMdxDir(dir: string) {
  const full = path.join(CONTENT_DIR, dir);
  if (!fs.existsSync(full)) return [];
  return fs
    .readdirSync(full)
    .filter((f) => f.endsWith(".mdx"))
    .map((file) => {
      const slug = file.replace(/\.mdx$/, "");
      const raw = fs.readFileSync(path.join(full, file), "utf8");
      const { data, content } = matter(raw);
      return { slug, data, body: content };
    });
}

export function getServices(): Service[] {
  return readMdxDir("services")
    .map(({ slug, data, body }) => ({
      slug,
      title: data.title ?? slug,
      summary: data.summary ?? "",
      order: data.order ?? 99,
      startingPrice: data.startingPrice ?? 0,
      image: data.image ?? `/images/services/${slug}.jpg`,
      imagePrompt: data.imagePrompt ?? "",
      imageAlt: data.imageAlt ?? data.title ?? slug,
      heroCardsTop: data.heroCardsTop,
      heroCardsBottom: data.heroCardsBottom,
      busywork: Array.isArray(data.busywork) ? data.busywork.map(String) : [],
      bestFor: Array.isArray(data.bestFor) ? data.bestFor.map(String) : [],
      deliverables: Array.isArray(data.deliverables) ? data.deliverables.map(String) : [],
      goodFit: data.goodFit ?? "",
      body,
    }))
    .sort((a, b) => a.order - b.order);
}

export function getService(slug: string): Service | undefined {
  return getServices().find((s) => s.slug === slug);
}

export function getLandingPages(): LandingPage[] {
  return readMdxDir("landing").map(({ slug, data, body }) => ({
    slug,
    title: data.title ?? slug,
    metaTitle: data.metaTitle ?? data.title ?? slug,
    metaDescription: data.metaDescription ?? "",
    heroHeadline: data.heroHeadline ?? data.title ?? slug,
    heroSubline: data.heroSubline ?? "",
    city: data.city ?? "",
    kind: data.kind === "campaign" ? "campaign" : "location",
    heroCardsTop: data.heroCardsTop,
    heroCardsBottom: data.heroCardsBottom,
    body,
  }));
}

export function getLandingPage(slug: string): LandingPage | undefined {
  return getLandingPages().find((p) => p.slug === slug);
}

/** Load a single long-form page from content/pages (e.g. "about") */
export function getPage(name: string) {
  const file = path.join(CONTENT_DIR, "pages", `${name}.mdx`);
  if (!fs.existsSync(file)) return undefined;
  const { data, content } = matter(fs.readFileSync(file, "utf8"));
  return { frontmatter: data, body: content };
}
