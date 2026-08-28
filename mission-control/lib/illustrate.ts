import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { REPO_ROOT } from "./site";
import { stagedTargetFor } from "./images";

/**
 * Running the real illustration pipeline from a button.
 *
 * The generate-image skill drives Sebastian's own Google Flow session
 * through agent-browser: his collection for style influence, two
 * candidates, a download at 2K, the optimizer, and a mandatory eyeball
 * check. None of that is an API call, so this does not reimplement it.
 * It shells out to Claude Code in headless mode and asks it to run the
 * skill, which means the pipeline stays exactly one implementation and
 * this keeps working as the skill changes.
 *
 * It also means generation bills against the Claude subscription that is
 * already paid for, rather than a second metered key.
 *
 * The run takes minutes, so it goes in the background and leaves its
 * progress on disk: a log, and an exit-code file written when it
 * finishes. Reading those two is how the UI knows where things stand,
 * which survives this server restarting mid-run.
 */

const JOBS_DIR = path.join(process.cwd(), "data", "image-jobs");

/** Only what a staged run needs: drive the browser, read the prompt, and
    look at the image it made. No writes into the repo, no optimizer, no
    git. Everything that changes the site happens later, on a click. */
const ALLOWED_TOOLS = ["Bash(agent-browser:*)", "Read", "Glob", "Grep"].join(",");

export type JobState = "none" | "running" | "done" | "failed";

export type Job = {
  state: JobState;
  startedAt: string;
  /** Seconds since it started */
  elapsed: number;
  /** Tail of the run's output */
  log: string;
};

function jobFile(slug: string, ext: string) {
  return path.join(JOBS_DIR, `${path.basename(slug)}.${ext}`);
}

export function readJob(slug: string): Job {
  const started = jobFile(slug, "started");
  if (!fs.existsSync(started)) {
    return { state: "none", startedAt: "", elapsed: 0, log: "" };
  }
  const startedAt = fs.readFileSync(started, "utf8").trim();
  const log = fs.existsSync(jobFile(slug, "log"))
    ? fs.readFileSync(jobFile(slug, "log"), "utf8")
    : "";
  const elapsed = Math.max(
    0,
    Math.round((Date.now() - new Date(startedAt).getTime()) / 1000)
  );

  const exitFile = jobFile(slug, "exit");
  if (!fs.existsSync(exitFile)) {
    return { state: "running", startedAt, elapsed, log: tail(log) };
  }
  const code = Number(fs.readFileSync(exitFile, "utf8").trim());
  return {
    state: code === 0 ? "done" : "failed",
    startedAt,
    elapsed,
    log: tail(log),
  };
}

function tail(text: string, lines = 40): string {
  const all = text.trim().split("\n");
  return all.slice(-lines).join("\n");
}

export function clearJob(slug: string) {
  for (const ext of ["started", "log", "exit"]) {
    const f = jobFile(slug, ext);
    if (fs.existsSync(f)) fs.unlinkSync(f);
  }
}

/**
 * Kick off a run. Returns immediately; the work carries on in the
 * background and reports through the files above.
 */
export function startIllustration(slug: string, prompt: string): string | null {
  if (readJob(slug).state === "running") return "That one is already running.";
  if (!prompt.trim()) return "Write the image prompt first.";

  fs.mkdirSync(JOBS_DIR, { recursive: true });
  clearJob(slug);
  fs.writeFileSync(jobFile(slug, "started"), new Date().toISOString());

  // Nothing a run makes goes near the website. It lands in the staging
  // folder and waits for Sebastian to look at it, so a picture he
  // already liked cannot be overwritten by one he has not seen.
  const target = stagedTargetFor(slug);

  const instruction = [
    `/generate-image Generate the illustration for the blog post "${slug}".`,
    `The prompt to use verbatim is the imagePrompt field in content/blog/${slug}.mdx.`,
    `Save the finished image to this EXACT absolute path: ${target}`,
    `Do the eyeball check on that file, as the skill requires, and say what you saw.`,
    `Do NOT write anything into public/, do NOT edit any post frontmatter, and do NOT tick anything off in IMAGES.md.`,
    `Do NOT run the optimizer; that happens later, after the image is chosen.`,
    // The repo auto-deploys from main, so a button must never be able to
    // ship anything. Publishing stays a separate, deliberate act.
    `Do NOT run git at all: no commit, no push, no staging.`,
    `If Flow is signed out or shows any challenge, stop and say so plainly; do not attempt to sign in.`,
  ].join(" ");

  const log = jobFile(slug, "log");
  const exit = jobFile(slug, "exit");
  const script = [
    `claude -p ${shellQuote(instruction)}`,
    `--allowedTools ${shellQuote(ALLOWED_TOOLS)}`,
    `--permission-mode acceptEdits`,
    `--max-turns 80`,
    `>> ${shellQuote(log)} 2>&1;`,
    `echo $? > ${shellQuote(exit)}`,
  ].join(" ");

  const child = spawn("sh", ["-c", script], {
    cwd: REPO_ROOT,
    detached: true,
    stdio: "ignore",
  });
  child.unref();
  return null;
}

function shellQuote(value: string): string {
  return `'${value.replace(/'/g, `'\\''`)}'`;
}
