import { stagedTargetFor } from "./images";
import { startRun } from "./agent-run";

/**
 * The illustration button, on top of the generic runner.
 *
 * The generate-image skill drives Sebastian's own Google Flow session
 * through agent-browser: his collection for style influence, two
 * candidates, a download at 2K, and a mandatory eyeball check. This
 * invokes that skill rather than reimplementing any of it.
 */

/** Only what a staged run needs: drive the browser, read the prompt, and
    look at the image it made. No writes into the repo, no optimizer, no
    git. Everything that changes the site happens later, on a click. */
const ALLOWED_TOOLS = ["Bash(agent-browser:*)", "Read", "Glob", "Grep"].join(",");

export function startIllustration(slug: string, prompt: string): string | null {
  if (!prompt.trim()) return "Write the image prompt first.";

  // Nothing a run makes goes near the website. It lands in the staging
  // folder and waits for Sebastian to look at it, so a picture he
  // already liked cannot be overwritten by one he has not seen.
  const target = stagedTargetFor(slug);

  return startRun({
    key: slug,
    allowedTools: ALLOWED_TOOLS,
    instruction: [
      `/generate-image Generate the illustration for the blog post "${slug}".`,
      `The prompt to use verbatim is the imagePrompt field in content/blog/${slug}.mdx.`,
      `Save the finished image to this EXACT absolute path: ${target}`,
      `Do the eyeball check on that file, as the skill requires, and say what you saw.`,
      `Do NOT write anything into public/, do NOT edit any post frontmatter, and do NOT tick anything off in IMAGES.md.`,
      `Do NOT run the optimizer; that happens later, after the image is chosen.`,
      // The repo auto-deploys from main, so a button must never be able
      // to ship anything. Publishing stays a separate, deliberate act.
      `Do NOT run git at all: no commit, no push, no staging.`,
      `If Flow is signed out or shows any challenge, stop and say so plainly; do not attempt to sign in.`,
    ].join(" "),
  });
}

export { readJob, clearJob, type Job, type JobState } from "./agent-run";
