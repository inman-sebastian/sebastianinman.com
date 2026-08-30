import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import type { z } from "zod";
import { repoEnv } from "./env";

/**
 * Asking Claude a question and getting a shape back.
 *
 * This is the Anthropic API rather than the `claude -p` route the image
 * and research buttons use. Those are agentic jobs that take minutes and
 * are worth a whole Claude Code process; a panel on a dashboard wants
 * one prompt and one answer, quickly, in a shape the UI can render
 * without parsing prose.
 *
 * Every answer is structured, never free text. A panel that has to guess
 * at paragraphs is a panel that breaks the first time the wording moves.
 *
 * What this sends: client records, including notes and timelines. That
 * is Sebastian's own data going to his own Anthropic account. It never
 * leaves this machine anywhere else, and nothing here writes.
 */

function apiKey(): string {
  return process.env.ANTHROPIC_API_KEY || repoEnv().ANTHROPIC_API_KEY || "";
}

/**
 * Which workspace a request acts in.
 *
 * An identity-linked key belongs to a person rather than to one
 * workspace, so the API refuses to guess which one to bill and count
 * against. Plain keys do not need this and ignore it.
 */
function workspaceId(): string {
  return (
    process.env.ANTHROPIC_WORKSPACE_ID || repoEnv().ANTHROPIC_WORKSPACE_ID || ""
  );
}

export function claudeReady(): boolean {
  return Boolean(apiKey());
}

let client: Anthropic | null = null;

function anthropic(): Anthropic {
  const key = apiKey();
  if (!key) throw new Error("No ANTHROPIC_API_KEY set.");
  if (!client) {
    const workspace = workspaceId();
    client = new Anthropic({
      apiKey: key,
      // The SDK has no first-class option for this, so it goes on as a
      // default header. Absent when unset, which is what a plain key
      // wants.
      ...(workspace
        ? { defaultHeaders: { "anthropic-workspace-id": workspace } }
        : {}),
    });
  }
  return client;
}

/**
 * Answers, keyed by what was asked.
 *
 * Content-addressed rather than timed: the cache key is a hash of the
 * prompt, so an answer is reused for exactly as long as nothing it was
 * based on has changed, and a new timeline entry refreshes it on its
 * own. A daily clock would do both jobs worse, re-asking when nothing
 * moved and going stale the moment something did.
 */
const CACHE_DIR = path.join(process.cwd(), "data", "ai-cache");

function cacheFile(kind: string, prompt: string): string {
  const key = crypto
    .createHash("sha256")
    .update(prompt)
    .digest("hex")
    .slice(0, 32);
  return path.join(CACHE_DIR, `${kind}-${key}.json`);
}

export type Asked<T> = { value: T; cached: boolean; costUsd: number };

/**
 * One question, one structured answer.
 *
 * `effort` is left at the default (high) and thinking is adaptive,
 * because every question asked here involves weighing records against
 * each other rather than extracting a field.
 */
export async function ask<T extends z.ZodType>(options: {
  /** Names the cache entry; changing it invalidates nothing else */
  kind: string;
  system: string;
  prompt: string;
  schema: T;
  /**
   * Hash this instead of the prompt.
   *
   * Content addressing is right for a derived view: the answer lives
   * exactly as long as the thing it described. It is wrong for a list
   * somebody is meant to work through, because acting on the list
   * changes the records the prompt was built from, so every completed
   * item regenerated the ones he had not done yet. Callers in that
   * position pin the answer to something stable instead, usually a
   * date, and refresh it deliberately.
   */
  cacheKey?: string;
}): Promise<Asked<z.infer<T>>> {
  const file = cacheFile(
    options.kind,
    options.cacheKey ?? `${options.system}\n${options.prompt}`
  );
  if (fs.existsSync(file)) {
    try {
      return {
        value: JSON.parse(fs.readFileSync(file, "utf8")),
        cached: true,
        costUsd: 0,
      };
    } catch {
      // A corrupt cache entry is not worth failing over; ask again
    }
  }

  let response;
  try {
    response = await anthropic().messages.parse({
      model: "claude-opus-5",
      max_tokens: 16000,
      thinking: { type: "adaptive" },
      system: options.system,
      messages: [{ role: "user", content: options.prompt }],
      output_config: { format: zodOutputFormat(options.schema) },
    });
  } catch (err) {
    throw new Error(explain(err));
  }

  const parsed = response.parsed_output;
  if (!parsed) {
    throw new Error(
      "Claude answered in a shape that did not match the schema.",
    );
  }

  // Opus 5 rates, for the note the panel shows. Not a bill, just the
  // number worth watching if this ever gets asked on every page load.
  const costUsd =
    (response.usage.input_tokens / 1_000_000) * 5 +
    (response.usage.output_tokens / 1_000_000) * 25;

  fs.mkdirSync(CACHE_DIR, { recursive: true });
  fs.writeFileSync(file, JSON.stringify(parsed));
  return { value: parsed as z.infer<T>, cached: false, costUsd };
}

/** Throw away every cached answer of one kind, so the next ask is fresh */
export function forget(kind: string) {
  if (!fs.existsSync(CACHE_DIR)) return;
  for (const f of fs.readdirSync(CACHE_DIR)) {
    if (f.startsWith(`${kind}-`)) fs.unlinkSync(path.join(CACHE_DIR, f));
  }
}

/** Turn an API failure into something worth reading on a dashboard */
function explain(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err);
  if (message.includes("anthropic-workspace-id")) {
    return (
      "That key is identity-linked, so Anthropic needs to know which workspace it acts in. " +
      "Add ANTHROPIC_WORKSPACE_ID to the repo root's .env.local (Console, Settings, Workspaces; " +
      "the id starts with wrkspc_) and restart, or use a plain workspace key instead."
    );
  }
  if (message.includes("authentication_error") || message.includes("401")) {
    return "Anthropic refused the key. Check ANTHROPIC_API_KEY in the repo root's .env.local.";
  }
  if (message.includes("credit balance") || message.includes("billing")) {
    return "Anthropic says the account has no credit. Top it up in the Console and this comes back on its own.";
  }
  return message;
}
