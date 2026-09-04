import os from "node:os";
import { spawn } from "node:child_process";
import { z } from "zod";
import { CLAUDE_BIN, claudeAvailable } from "./agent-run";

/**
 * The same question, asked through the Claude Code subscription.
 *
 * lib/claude.ts is the fast path and stays the default: one API request,
 * a schema enforced by the model, a few seconds. This is what happens
 * when that path is unavailable because the API account has run out of
 * credit, which is a billing state rather than a fault, and it should not
 * take the dashboard's panels down with it.
 *
 * It is deliberately NOT the background runner in lib/agent-run.ts. That
 * is for skills: minutes of tool use, a log on disk, a job to poll. A
 * panel wants one prompt and one answer while the page is still loading,
 * so this runs `claude -p` in the foreground with no tools at all and
 * waits for the JSON.
 *
 * Two differences from the API path are worth knowing about:
 *
 * - There is no structured-output mode here, so the schema goes into the
 *   prompt as JSON Schema and the answer is parsed and validated on this
 *   side. A reply that does not fit is an error, not a silently mangled
 *   panel.
 * - It bills the subscription, so the cost figure the panels show would
 *   be a lie. This reports zero and the caller says which route answered
 *   instead.
 */

/** The CLI hands back a lot; this is the part that matters. */
type CliResult = {
  subtype?: string;
  is_error?: boolean;
  result?: string;
};

export function cliReady(): boolean {
  return claudeAvailable();
}

/** Long enough for a briefing over every record, short enough that a
    wedged run does not hold a page open all afternoon. */
const TIMEOUT_MS = 240_000;

export async function askViaCli<T extends z.ZodType>(options: {
  system: string;
  prompt: string;
  schema: T;
}): Promise<z.infer<T>> {
  const prompt = [
    options.prompt,
    "",
    "Answer with ONE JSON object and nothing else. No sentence before it,",
    "no sentence after it, no markdown code fence. It must validate",
    "against this JSON Schema:",
    JSON.stringify(z.toJSONSchema(options.schema)),
  ].join("\n");

  const raw = await run(options.system, prompt);
  return options.schema.parse(JSON.parse(extractJson(raw)));
}

function run(system: string, prompt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(
      CLAUDE_BIN,
      [
        "-p",
        "--system-prompt",
        system,
        // Pinned to what lib/claude.ts asks for, so the fallback answers
        // are the same quality rather than whatever model this machine
        // happens to be set to.
        "--model",
        "claude-opus-5",
        // No tools, no MCP servers, one turn: this is a question, not a
        // job. Any of those would only add latency and tokens.
        "--allowedTools",
        "",
        "--strict-mcp-config",
        "--max-turns",
        "1",
        "--output-format",
        "json",
      ],
      {
        // Somewhere with no CLAUDE.md, so the repo's project instructions
        // do not get loaded into a question that already carries its own
        // voice guidance.
        cwd: os.tmpdir(),
        // Without this the CLI would authenticate with the very key that
        // just ran out, which is the one thing this must not do.
        env: { ...process.env, ANTHROPIC_API_KEY: "" },
        stdio: ["pipe", "pipe", "pipe"],
      }
    );

    let out = "";
    let err = "";
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error("Claude Code took too long to answer."));
    }, TIMEOUT_MS);

    child.stdout.on("data", (d) => (out += d));
    child.stderr.on("data", (d) => (err += d));
    child.on("error", (e) => {
      clearTimeout(timer);
      reject(e);
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      if (code !== 0) {
        reject(
          new Error(
            `Claude Code exited ${code}. ${err.trim().slice(-400) || "It said nothing."}`
          )
        );
        return;
      }
      let parsed: CliResult;
      try {
        parsed = JSON.parse(out);
      } catch {
        reject(new Error("Claude Code answered in an unexpected format."));
        return;
      }
      if (parsed.is_error || parsed.subtype !== "success") {
        reject(
          new Error(parsed.result?.trim() || "Claude Code could not answer.")
        );
        return;
      }
      resolve(parsed.result ?? "");
    });

    child.stdin.end(prompt);
  });
}

/**
 * Get at the object even if it arrived wearing a code fence.
 *
 * Asking for bare JSON works nearly every time, and the times it does
 * not are a stray fence or a "Here you go:" rather than a different
 * answer. Throwing that away is cheaper than a second run.
 */
function extractJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const body = (fenced ? fenced[1] : text).trim();
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  if (start === -1 || end <= start) {
    throw new Error("Claude Code did not answer with JSON.");
  }
  return body.slice(start, end + 1);
}
