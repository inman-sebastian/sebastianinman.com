import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { REPO_ROOT } from "./site";
import { fileState, type FileState, type RepoState } from "./git";

/**
 * Blog posts: content/blog/*.mdx on the public site.
 *
 * Unlike everything else in this app, these files ARE the website. They
 * get committed and deployed. Saving here only writes the file; putting
 * it on the site is a separate, deliberate act (see lib/git.ts).
 */

export const POSTS_DIR = path.join(REPO_ROOT, "content", "blog");
const IMAGES_DIR = path.join(REPO_ROOT, "public", "images", "blog");

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  date: string;
  image: string;
  imagePrompt: string;
  imageAlt: string;
  imageCaption: string;
  body: string;
  /** Frontmatter keys this app does not manage, preserved on save */
  extra: Record<string, unknown>;
  updated: string;
};

export type PostStatus = {
  file: FileState;
  /** True when the illustration exists on disk */
  hasImage: boolean;
  imageFile: FileState | null;
};

function asText(value: unknown): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return value == null ? "" : String(value).trim();
}

export function postPath(slug: string): string {
  return path.join(POSTS_DIR, `${slug}.mdx`);
}

/** The illustration a post's frontmatter points at, on disk */
function imagePath(post: BlogPost): string | null {
  if (!post.image) return null;
  return path.join(REPO_ROOT, "public", post.image.replace(/^\//, ""));
}

function toPost(slug: string, raw: string): BlogPost {
  const { data, content } = matter(raw);
  const {
    title,
    description,
    date,
    image,
    imagePrompt,
    imageAlt,
    imageCaption,
    ...extra
  } = data as Record<string, unknown>;
  return {
    slug,
    title: asText(title),
    description: asText(description),
    date: asText(date),
    image: asText(image),
    imagePrompt: asText(imagePrompt),
    imageAlt: asText(imageAlt),
    imageCaption: asText(imageCaption),
    body: content.trim(),
    extra,
    updated: fs.statSync(postPath(slug)).mtime.toISOString(),
  };
}

export function listPosts(): BlogPost[] {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) =>
      toPost(f.replace(/\.mdx$/, ""), fs.readFileSync(path.join(POSTS_DIR, f), "utf8"))
    )
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPost(slug: string): BlogPost | null {
  const file = postPath(slug);
  if (!fs.existsSync(file)) return null;
  return toPost(slug, fs.readFileSync(file, "utf8"));
}

export async function postStatus(post: BlogPost): Promise<PostStatus> {
  const img = imagePath(post);
  return {
    file: await fileState(postPath(post.slug)),
    hasImage: Boolean(img && fs.existsSync(img)),
    imageFile: img && fs.existsSync(img) ? await fileState(img) : null,
  };
}

/** Everything that should ride along in this post's commit */
export function publishPaths(post: BlogPost): string[] {
  const paths = [postPath(post.slug)];
  const img = imagePath(post);
  if (img && fs.existsSync(img)) paths.push(img);
  return paths;
}

/**
 * What to tell Sebastian about where a post stands. "Live" means the
 * file is committed and the branch has nothing waiting to push, which
 * is as close to "it is on the website" as git can tell us.
 */
export function statusLabel(
  status: PostStatus,
  repo: RepoState
): { label: string; detail: string; live: boolean } {
  if (status.file === "untracked") {
    return {
      label: "Not on the site",
      detail: "A draft on this machine. Nobody can see it yet.",
      live: false,
    };
  }
  if (status.file === "modified") {
    return {
      label: "Edited since it went up",
      detail: "The live version is the older one until you publish again.",
      live: false,
    };
  }
  if (repo.ahead > 0) {
    return {
      label: "Committed, not pushed",
      detail: `${repo.ahead} commit${repo.ahead === 1 ? "" : "s"} on ${repo.branch} waiting to go out.`,
      live: false,
    };
  }
  return { label: "Live", detail: "Committed and pushed.", live: true };
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 70);
}

function serialize(post: BlogPost): string {
  const data: Record<string, unknown> = {
    ...post.extra,
    title: post.title,
    description: post.description,
    date: post.date,
  };
  // Image fields only appear once there is an image to describe
  if (post.image) {
    data.image = post.image;
    if (post.imagePrompt) data.imagePrompt = post.imagePrompt;
    if (post.imageAlt) data.imageAlt = post.imageAlt;
    if (post.imageCaption) data.imageCaption = post.imageCaption;
  }
  return matter.stringify(`${post.body.trim()}\n`, data);
}

function writeAtomic(target: string, contents: string) {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  const tmp = `${target}.tmp`;
  fs.writeFileSync(tmp, contents, "utf8");
  fs.renameSync(tmp, target);
}

export type PostPatch = Partial<
  Pick<
    BlogPost,
    | "title"
    | "description"
    | "date"
    | "image"
    | "imagePrompt"
    | "imageAlt"
    | "imageCaption"
    | "body"
  >
>;

export function savePost(slug: string, patch: PostPatch): BlogPost | null {
  const current = getPost(slug);
  if (!current) return null;
  writeAtomic(postPath(slug), serialize({ ...current, ...patch }));
  return getPost(slug);
}

export function createPost(title: string): BlogPost {
  const base = slugify(title) || "untitled";
  let slug = base;
  let n = 2;
  while (fs.existsSync(postPath(slug))) {
    slug = `${base}-${n}`;
    n += 1;
  }
  const today = new Date();
  const pad = (v: number) => String(v).padStart(2, "0");
  const post: BlogPost = {
    slug,
    title,
    description: "",
    date: `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`,
    image: "",
    imagePrompt: "",
    imageAlt: "",
    imageCaption: "",
    body: "",
    extra: {},
    updated: today.toISOString(),
  };
  writeAtomic(postPath(slug), serialize(post));
  return post;
}

/** Deletes the draft file. The illustration in public/ stays; removing
    an image that is already live is a separate decision. */
export function deletePost(slug: string): boolean {
  const file = postPath(slug);
  if (!fs.existsSync(file)) return false;
  fs.unlinkSync(file);
  return true;
}

/** Where an illustration for this post would go, by the repo's convention */
export function suggestedImagePath(slug: string): string {
  return `/images/blog/${slug}.jpg`;
}

export function imageOnDisk(slug: string): boolean {
  return fs.existsSync(path.join(IMAGES_DIR, `${slug}.jpg`));
}
