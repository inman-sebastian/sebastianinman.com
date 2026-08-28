import fs from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { REPO_ROOT } from "./site";

/**
 * Blog illustrations on disk.
 *
 * Two places matter. `public/images/blog/` is the website's, and anything
 * landing there is real art that ships. `data/image-candidates/` is this
 * app's own scratch space, git-ignored with the rest of data, holding the
 * two candidates from a generation run until one is chosen. The unchosen
 * one is thrown away; nothing half-picked ever reaches public/.
 */

const run = promisify(execFile);

export const BLOG_IMAGES_DIR = path.join(REPO_ROOT, "public", "images", "blog");
export const CANDIDATES_DIR = path.join(process.cwd(), "data", "image-candidates");

/** Filenames only, never paths from the browser */
function safeName(name: string): string {
  return path.basename(name).replace(/[^A-Za-z0-9._-]/g, "");
}

/** Resolve a web path like /images/blog/x.jpg onto disk, refusing to
    step outside the blog images folder */
export function blogImagePath(webPath: string): string | null {
  if (!webPath) return null;
  const name = safeName(webPath);
  if (!name) return null;
  const full = path.join(BLOG_IMAGES_DIR, name);
  if (!full.startsWith(BLOG_IMAGES_DIR)) return null;
  return full;
}

/** Changes whenever the file does, so the browser reloads the preview */
export function blogImageVersion(webPath: string): string {
  const full = blogImagePath(webPath);
  if (!full || !fs.existsSync(full)) return "";
  return String(fs.statSync(full).mtimeMs);
}

export function webPathFor(filename: string): string {
  return `/images/blog/${safeName(filename)}`;
}

export function candidatePath(name: string): string {
  return path.join(CANDIDATES_DIR, safeName(name));
}

/**
 * Staged images for a post, newest first.
 *
 * Two kinds live here and both are just candidates: `gen` is something a
 * run produced and nobody has approved, `prev` is an image that used to
 * be on the post before it was replaced. Keeping the old one means
 * changing your mind is one click rather than a regeneration, which is
 * the whole reason nothing writes straight over public/.
 */
export type Candidate = {
  file: string;
  kind: "gen" | "prev";
  created: string;
};

/** Where a run should put what it makes. Never inside public/. */
export function stagedTargetFor(slug: string): string {
  fs.mkdirSync(CANDIDATES_DIR, { recursive: true });
  return path.join(CANDIDATES_DIR, `${slug}--gen-${Date.now()}.jpg`);
}

export function listCandidates(slug: string): Candidate[] {
  if (!fs.existsSync(CANDIDATES_DIR)) return [];
  return fs
    .readdirSync(CANDIDATES_DIR)
    .filter((f) => f.startsWith(`${slug}--`) && /\.(jpe?g|png|webp)$/i.test(f))
    .map((file) => ({
      file,
      kind: file.includes("--prev-") ? ("prev" as const) : ("gen" as const),
      created: fs
        .statSync(path.join(CANDIDATES_DIR, file))
        .mtime.toISOString(),
    }))
    .sort((a, b) => (a.created < b.created ? 1 : -1));
}

export function discardCandidate(file: string) {
  const full = candidatePath(file);
  if (fs.existsSync(full)) fs.unlinkSync(full);
}

/**
 * Put a staged image on the post. Whatever was there first gets kept as
 * another candidate, so an image that was liked is never simply gone.
 */
export function adoptCandidate(slug: string, file: string): string {
  const from = candidatePath(file);
  if (!fs.existsSync(from)) throw new Error("That one is no longer staged.");
  fs.mkdirSync(BLOG_IMAGES_DIR, { recursive: true });

  const live = path.join(BLOG_IMAGES_DIR, `${slug}.jpg`);
  if (fs.existsSync(live)) {
    fs.copyFileSync(
      live,
      path.join(CANDIDATES_DIR, `${slug}--prev-${Date.now()}.jpg`)
    );
  }

  fs.copyFileSync(from, live);
  fs.unlinkSync(from);
  return webPathFor(`${slug}.jpg`);
}

export function saveUpload(slug: string, bytes: Buffer, original: string): string {
  fs.mkdirSync(BLOG_IMAGES_DIR, { recursive: true });
  const ext = (path.extname(original) || ".jpg").toLowerCase();
  const name = `${slug}${ext === ".jpeg" ? ".jpg" : ext}`;
  fs.writeFileSync(path.join(BLOG_IMAGES_DIR, name), bytes);
  return webPathFor(name);
}

/**
 * The same `npm run optimize:images` the workflow already ends with.
 * It needs bun; when that is missing the image is still perfectly
 * usable, just larger, so this reports rather than fails.
 */
export async function optimizeImages(): Promise<string> {
  try {
    const { stdout } = await run("npm", ["run", "optimize:images"], {
      cwd: REPO_ROOT,
      timeout: 180000,
      maxBuffer: 8 * 1024 * 1024,
    });
    const lines = stdout.trim().split("\n").filter(Boolean);
    return lines[lines.length - 1] || "Optimizer ran.";
  } catch (err) {
    const detail =
      err && typeof err === "object" && "stderr" in err
        ? String((err as { stderr: string }).stderr).trim()
        : String(err);
    return `Saved, but the optimizer did not run: ${detail.split("\n")[0]}`;
  }
}
