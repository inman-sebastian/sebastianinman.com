import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import type { z } from "zod";
import { repoEnv } from "./env";
import { askViaCli, cliReady } from "./claude-cli";

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
 * When the API account is out of credit, the same question goes to the
 * Claude Code subscription instead (lib/claude-cli.ts). That is a
 * separate thing already paid for, and an empty API balance is a billing
 * state rather than a fault, so it should not empty the panels. Nothing
 * else falls back: a wrong key or a bad request is a real problem and
 * says so.
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

/** There is a way to ask, whether or not it is the fast one */
export function claudeReady(): boolean {
  return Boolean(apiKey()) || cliReady();
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

/** Which route answered. Worth showing, because one of them is metered
    and the other is the subscription, and the cost figure only means
    something for the first. */
export type Source = "api" | "subscription";

export type Asked<T> = {
  value: T;
  cached: boolean;
  costUsd: number;
  via: Source;
};

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
  const hit = readCache<z.infer<T>>(file);
  if (hit) return { ...hit, cached: true, costUsd: 0 };

  if (apiKey()) {
    try {
      const response = await anthropic().messages.parse({
        model: "claude-opus-5",
        max_tokens: 16000,
        thinking: { type: "adaptive" },
        system: options.system,
        messages: [{ role: "user", content: options.prompt }],
        output_config: { format: zodOutputFormat(options.schema) },
      });

      const parsed = response.parsed_output;
      if (!parsed) {
        throw new Error("Claude answered in a shape that did not match the schema.");
      }

      // Opus 5 rates, for the note the panel shows. Not a bill, just the
      // number worth watching if this ever gets asked on every page load.
      const costUsd =
        (response.usage.input_tokens / 1_000_000) * 5 +
        (response.usage.output_tokens / 1_000_000) * 25;

      writeCache(file, parsed, "api");
      return { value: parsed as z.infer<T>, cached: false, costUsd, via: "api" };
    } catch (err) {
      // Out of credit is the one failure worth working around, because
      // the subscription can answer the same question. Everything else
      // is a real problem and should read like one.
      if (!outOfCredit(err) || !cliReady()) throw new Error(explain(err));
    }
  }

  if (!cliReady()) {
    throw new Error(
      "No ANTHROPIC_API_KEY in the repo root's .env.local, and no Claude Code CLI to fall back on."
    );
  }

  const value = await askViaCli({
    system: options.system,
    prompt: options.prompt,
    schema: options.schema,
  });
  writeCache(file, value, "subscription");
  return { value, cached: false, costUsd: 0, via: "subscription" };
}

/**
 * The cache file, which now records which route wrote it.
 *
 * Entries written before it did are plain values, and every one of them
 * came from the API, so reading them that way is a fact rather than a
 * default.
 */
type Cached<T> = { v: 1; via: Source; value: T };

function readCache<T>(file: string): { value: T; via: Source } | null {
  if (!fs.existsSync(file)) return null;
  try {
    const parsed = JSON.parse(fs.readFileSync(file, "utf8"));
    if (parsed && typeof parsed === "object" && (parsed as Cached<T>).v === 1) {
      const entry = parsed as Cached<T>;
      return { value: entry.value, via: entry.via };
    }
    return { value: parsed as T, via: "api" };
  } catch {
    // A corrupt cache entry is not worth failing over; ask again
    return null;
  }
}

function writeCache<T>(file: string, value: T, via: Source) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  const entry: Cached<T> = { v: 1, via, value };
  fs.writeFileSync(file, JSON.stringify(entry));
}

/** An empty balance, as opposed to a key or a request that is wrong */
function outOfCredit(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err);
  return /credit balance|Plans & Billing/i.test(message);
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
    // Only reached when there is no CLI to fall back to, since that is
    // checked first.
    return (
      "Anthropic says the account has no credit, and the Claude Code CLI is not on this machine " +
      "to answer instead. Top the account up in the Console, or install the CLI, and this comes back on its own."
    );
  }
  return message;
}
