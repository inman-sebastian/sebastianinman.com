import fs from "node:fs";
import path from "node:path";
import { REPO_ROOT } from "./site";
import type { BlogPost } from "./posts";

/**
 * Checks worth running before a post goes to the website.
 *
 * A broken post does not take the site down: Vercel fails that build and
 * the previous deploy stays live. It does mean the post silently never
 * appears, though, and working out why from a build log is a miserable
 * way to spend an evening. These catch the two things that actually go
 * wrong: MDX that will not compile, and a component the site does not
 * have.
 */

export type Issue = {
  level: "error" | "warning";
  message: string;
};

/** The components an MDX body may use, read from the site's own
    component map so this list cannot drift out of date */
export function registeredComponents(): string[] {
  const file = path.join(REPO_ROOT, "components", "mdx.tsx");
  if (!fs.existsSync(file)) return [];
  const src = fs.readFileSync(file, "utf8");
  const block = src.match(
    /export const mdxComponents:\s*MDXComponents\s*=\s*\{([\s\S]*?)\}/
  );
  if (!block) return [];
  return block[1]
    .split(",")
    .map((s) => s.trim().replace(/:.*$/, ""))
    .filter((s) => /^[A-Z][A-Za-z0-9]*$/.test(s));
}

export async function validatePost(post: BlogPost): Promise<Issue[]> {
  const issues: Issue[] = [];

  if (!post.title) issues.push({ level: "error", message: "It needs a title." });
  if (!post.description) {
    issues.push({
      level: "error",
      message:
        "It needs a description. That one is doing three jobs: the card on the index, the meta description, and the RSS summary.",
    });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(post.date)) {
    issues.push({
      level: "error",
      message: "The date has to be a plain YYYY-MM-DD.",
    });
  }
  if (!post.body.trim()) {
    issues.push({ level: "error", message: "There is no post yet." });
  }

  // Em dashes read as AI-written, which is the one thing the whole site
  // is trying not to sound like
  if (/—/.test(post.body) || /—/.test(post.description)) {
    issues.push({
      level: "warning",
      message:
        "There is an em dash in here. Rewrite it with a period, comma, colon, or parentheses.",
    });
  }

  if (post.image && !fs.existsSync(path.join(REPO_ROOT, "public", post.image.replace(/^\//, "")))) {
    issues.push({
      level: "error",
      message: `Frontmatter points at ${post.image}, and there is no such file. The post would ship with a broken image.`,
    });
  }

  const known = registeredComponents();
  const used = new Set(
    [...post.body.matchAll(/<([A-Z][A-Za-z0-9]*)/g)].map((m) => m[1])
  );
  for (const name of used) {
    if (!known.includes(name)) {
      issues.push({
        level: "error",
        message: `<${name}> is not one of the site's components. The build will fail on it. Available: ${known.join(", ")}.`,
      });
    }
  }

  try {
    const { compile } = await import("@mdx-js/mdx");
    await compile(post.body);
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    issues.push({ level: "error", message: `MDX will not compile: ${detail}` });
  }

  return issues;
}
