import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { REPO_ROOT } from "./site";

/**
 * Git, for the blog CMS only.
 *
 * The thing to keep in mind here: main auto-deploys on GitHub, so a push
 * IS a deploy to sebastianinman.com. That is why saving and publishing
 * are two different buttons in this app, and why publish commits ONLY
 * the post's own files by pathspec. Whatever else is dirty in the
 * working tree (this app, notes, half-finished edits) is none of a blog
 * post's business and must never ride along in its commit.
 *
 * Every call passes arguments as an array, never a shell string.
 */

const run = promisify(execFile);

async function git(args: string[]): Promise<string> {
  const { stdout } = await run("git", args, { cwd: REPO_ROOT });
  return stdout.trim();
}

export type RepoState = {
  branch: string;
  /** Commits on this branch that the remote does not have yet */
  ahead: number;
  hasUpstream: boolean;
};

export async function repoState(): Promise<RepoState> {
  const branch = await git(["rev-parse", "--abbrev-ref", "HEAD"]).catch(
    () => "unknown"
  );
  try {
    const ahead = await git(["rev-list", "--count", "@{u}..HEAD"]);
    return { branch, ahead: Number(ahead) || 0, hasUpstream: true };
  } catch {
    return { branch, ahead: 0, hasUpstream: false };
  }
}

export type FileState = "untracked" | "modified" | "clean" | "missing";

export async function fileState(absPath: string): Promise<FileState> {
  const rel = path.relative(REPO_ROOT, absPath);
  const out = await git(["status", "--porcelain", "--", rel]).catch(() => "");
  if (!out) return "clean";
  const code = out.slice(0, 2);
  if (code.includes("?")) return "untracked";
  if (code.includes("D")) return "missing";
  return "modified";
}

export type PublishResult = { ok: boolean; message: string };

/**
 * Commit the given files and push. This deploys. Only the composer's
 * confirm step calls it, and only when Sebastian presses the button.
 */
export async function publishFiles(
  absPaths: string[],
  message: string
): Promise<PublishResult> {
  const rels = absPaths.map((p) => path.relative(REPO_ROOT, p));
  if (rels.length === 0) return { ok: false, message: "Nothing to publish." };
  try {
    await git(["add", "--", ...rels]);
    // The pathspec on commit is the guard: even if something else is
    // staged, only these files go into this commit
    await git(["commit", "-m", message, "--", ...rels]);
    const pushed = await git(["push", "origin", "HEAD"]);
    const sha = await git(["rev-parse", "--short", "HEAD"]);
    return {
      ok: true,
      message: `Committed ${sha} and pushed. ${pushed || "Vercel is building now."}`.trim(),
    };
  } catch (err) {
    const detail =
      err && typeof err === "object" && "stderr" in err
        ? String((err as { stderr: string }).stderr).trim()
        : String(err);
    return { ok: false, message: detail.split("\n").slice(0, 5).join("\n") };
  }
}
