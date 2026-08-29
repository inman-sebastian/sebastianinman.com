import fs from "node:fs";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { REPO_ROOT } from "./site";
import { repoEnv } from "./env";

/**
 * Running one of this repo's own Claude skills from a button.
 *
 * The skills in .claude/skills are the real implementations of the
 * work: generate-image drives Flow through agent-browser, find-leads
 * researches businesses. None of that is an API call, so nothing here
 * reimplements them. It shells out to Claude Code in headless mode and
 * asks it to run the skill, which keeps one implementation and means
 * the buttons keep working as the skills change.
 *
 * It also bills the Claude subscription that is already paid for rather
 * than a second metered key.
 *
 * Runs take minutes, so they go in the background and leave progress on
 * disk: a log of streamed events, and an exit-code file written at the
 * end. Reading those two is how the UI knows where things stand, and it
 * survives this server restarting mid-run.
 */

const JOBS_DIR = path.join(process.cwd(), "data", "agent-jobs");

/**
 * Which CLI to run, overridable from the repo root's .env.local.
 *
 * Anthropic announced in June 2026 that programmatic runs (`claude -p`,
 * the Agent SDK) would move off the interactive subscription onto a
 * separate metered credit, then paused it the next day and promised
 * notice before trying again. Today this bills the subscription. If that
 * changes, the escape hatches are: point this at a different binary or
 * wrapper, or run the skill by hand in Cowork, which is the same skill
 * and always works. Nothing is locked to this one entry point, which is
 * the point of invoking the skills rather than reimplementing them.
 */
function claudeBin(): string {
  return (
    process.env.MISSION_CONTROL_CLAUDE_BIN ||
    repoEnv().MISSION_CONTROL_CLAUDE_BIN ||
    "claude"
  );
}

const CLAUDE_BIN = claudeBin();

function shellQuote(value: string): string {
  return `'${value.replace(/'/g, `'\\''`)}'`;
}

function claudeAvailable(): boolean {
  const result = spawnSync("sh", ["-c", `command -v ${shellQuote(CLAUDE_BIN)}`], {
    encoding: "utf8",
  });
  return result.status === 0;
}

export type JobState = "none" | "running" | "done" | "failed";

export type Job = {
  state: JobState;
  startedAt: string;
  /** Seconds since it started */
  elapsed: number;
  /** Readable progress, newest last */
  log: string;
  /** What the run finally said */
  summary: string;
  /**
   * What this run would cost at API rates. On a subscription it is not
   * a bill, it is the number that would start mattering if programmatic
   * runs ever move to metered credit. Worth watching for that reason.
   */
  costUsd: number | null;
  /** Tools the run asked for and did not have. If one shows up here,
      the allowlist below is too tight for what the skill now does. */
  denials: string[];
  /** Set when something went wrong in a way worth acting on */
  problem: string;
};

function jobFile(slug: string, ext: string) {
  return path.join(JOBS_DIR, `${path.basename(slug)}.${ext}`);
}

export function readJob(slug: string): Job {
  const started = jobFile(slug, "started");
  const empty: Job = {
    state: "none",
    startedAt: "",
    elapsed: 0,
    log: "",
    summary: "",
    costUsd: null,
    denials: [],
    problem: "",
  };
  if (!fs.existsSync(started)) return empty;

  const startedAt = fs.readFileSync(started, "utf8").trim();
  const raw = fs.existsSync(jobFile(slug, "log"))
    ? fs.readFileSync(jobFile(slug, "log"), "utf8")
    : "";
  const read = interpret(raw);

  const exitFile = jobFile(slug, "exit");
  const finished = fs.existsSync(exitFile);
  const code = finished ? Number(fs.readFileSync(exitFile, "utf8").trim()) : 0;

  // How long the run took, not how long ago it started. The exit file is
  // written the moment the run ends, so its timestamp is the finish
  // line; measuring to now instead would report an eight-minute run left
  // open overnight as an eight-hour one.
  const endedAt = finished ? fs.statSync(exitFile).mtimeMs : Date.now();
  const elapsed = Math.max(
    0,
    Math.round((endedAt - new Date(startedAt).getTime()) / 1000)
  );

  return {
    ...read,
    state: !finished ? "running" : code === 0 ? "done" : "failed",
    startedAt,
    elapsed,
  };
}

/**
 * Turn the run's newline-delimited JSON into something readable.
 *
 * Anything unparseable is shown as-is rather than dropped: if a future
 * version of the CLI stops emitting this format, the panel degrades to
 * plain output instead of going blank. The last line is often half
 * written while a run is in flight, which is why a bad line is never an
 * error here.
 */
function interpret(raw: string): Omit<Job, "state" | "startedAt" | "elapsed"> {
  const lines: string[] = [];
  let summary = "";
  let costUsd: number | null = null;
  let denials: string[] = [];
  let problem = "";

  for (const line of raw.split("\n")) {
    const text = line.trim();
    if (!text) continue;
    if (!text.startsWith("{")) {
      lines.push(text);
      continue;
    }
    let event: Record<string, unknown>;
    try {
      event = JSON.parse(text);
    } catch {
      continue; // a line still being written
    }

    const type = String(event.type ?? "");
    if (type === "assistant") {
      const message = event.message as { content?: unknown[] } | undefined;
      for (const part of message?.content ?? []) {
        const p = part as { type?: string; text?: string; name?: string; input?: Record<string, unknown> };
        if (p.type === "text" && p.text?.trim()) {
          lines.push(p.text.trim());
        } else if (p.type === "tool_use") {
          const detail =
            typeof p.input?.command === "string"
              ? p.input.command
              : typeof p.input?.file_path === "string"
                ? p.input.file_path
                : "";
          lines.push(`> ${p.name}${detail ? `: ${trim(detail, 140)}` : ""}`);
        }
      }
    } else if (type === "rate_limit_event") {
      // These arrive routinely with status "allowed"; they are telemetry,
      // not trouble. Only a status that is not "allowed" means the run
      // was actually held back.
      const info = event.rate_limit_info as
        | { status?: string; resetsAt?: number; rateLimitType?: string }
        | undefined;
      if (info && info.status && info.status !== "allowed") {
        const resets = info.resetsAt
          ? new Date(info.resetsAt * 1000).toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
            })
          : "";
        problem = `Your Claude ${info.rateLimitType?.replace("_", "-") ?? ""} limit is ${info.status}${
          resets ? `, and resets around ${resets}` : ""
        }. The run may not have finished.`;
      }
    } else if (type === "result") {
      summary = String(event.result ?? "").trim();
      const cost = Number(event.total_cost_usd);
      if (Number.isFinite(cost)) costUsd = cost;
      const dn = event.permission_denials;
      if (Array.isArray(dn) && dn.length > 0) {
        denials = dn.map((d) => {
          const entry = d as { tool_name?: string };
          return String(entry.tool_name ?? "a tool");
        });
      }
      if (event.is_error) {
        problem =
          String(event.api_error_status ?? "") ||
          summary ||
          "The run reported an error.";
      }
    }
  }

  if (denials.length > 0 && !problem) {
    // Deliberately does not name a file: this runs every skill now, and
    // pointing at the wrong one is worse than pointing at none.
    problem = `The run wanted ${[...new Set(denials)].join(", ")} and was not allowed it. If the skill has changed, the ALLOWED_TOOLS list that starts this run needs to change with it.`;
  }

  return { log: lines.slice(-60).join("\n"), summary, costUsd, denials, problem };
}

function trim(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max)}...` : value;
}

export function clearJob(slug: string) {
  for (const ext of ["started", "log", "exit"]) {
    const f = jobFile(slug, ext);
    if (fs.existsSync(f)) fs.unlinkSync(f);
  }
}


/**
 * Kick off a run. Returns an error string, or null when it started.
 * The work carries on in the background and reports through the files
 * above.
 */
export function startRun(options: {
  /** Names the job's files; one run per key at a time */
  key: string;
  /** What to ask Claude Code to do, usually "/skill-name ..." */
  instruction: string;
  /** Scoped as tightly as the skill allows */
  allowedTools: string;
  maxTurns?: number;
}): string | null {
  if (readJob(options.key).state === "running") {
    return "That one is already running.";
  }
  if (!claudeAvailable()) {
    return `Could not find the Claude Code CLI (looked for "${CLAUDE_BIN}"). Set MISSION_CONTROL_CLAUDE_BIN in the repo root's .env.local if it lives somewhere else.`;
  }

  fs.mkdirSync(JOBS_DIR, { recursive: true });
  clearJob(options.key);
  fs.writeFileSync(jobFile(options.key, "started"), new Date().toISOString());

  const log = jobFile(options.key, "log");
  const exit = jobFile(options.key, "exit");
  const script = [
    `${shellQuote(CLAUDE_BIN)} -p ${shellQuote(options.instruction)}`,
    `--allowedTools ${shellQuote(options.allowedTools)}`,
    `--permission-mode acceptEdits`,
    `--max-turns ${options.maxTurns ?? 80}`,
    // Streams events as they happen instead of printing everything at
    // the end, which is the difference between a progress panel and a
    // spinner. --verbose is required alongside it in print mode.
    `--output-format stream-json --verbose`,
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
