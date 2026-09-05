import fs from "node:fs";
import path from "node:path";
import { REPO_ROOT } from "./site";

/**
 * The website's .env.local, read from the repo root.
 *
 * Next only loads env files from its own directory, and the Resend
 * credentials belong to the site (they are already set in Vercel and in
 * the root .env.local). Reading them from there keeps one copy of the
 * key on this machine instead of two.
 *
 * Values never get logged or rendered. The UI only ever shows which
 * address mail would come FROM.
 */

let cache: Record<string, string> | null = null;

export function repoEnv(): Record<string, string> {
  if (cache) return cache;
  const out: Record<string, string> = {};
  const file = path.join(REPO_ROOT, ".env.local");
  if (fs.existsSync(file)) {
    for (const line of fs.readFileSync(file, "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
      if (!m) continue;
      out[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
    }
  }
  cache = out;
  return out;
}

export type MailConfig = { key: string; from: string };

export function mailConfig(): MailConfig {
  const env = repoEnv();
  return {
    key: process.env.RESEND_API_KEY || env.RESEND_API_KEY || "",
    from: process.env.RESEND_FROM || env.RESEND_FROM || "",
  };
}

/** Whether sending is even possible right now */
export function mailReady(): boolean {
  const { key, from } = mailConfig();
  return Boolean(key && from);
}

/** Safe to show on screen: the sender, never the key */
export function mailFrom(): string {
  return mailConfig().from;
}

/** For image generation. Same file, same rule: never logged, never shown. */
export function geminiKey(): string {
  return process.env.GEMINI_API_KEY || repoEnv().GEMINI_API_KEY || "";
}

/** For checking an address will accept mail. Same file, same rule. */
export function hunterKey(): string {
  return process.env.HUNTER_API_KEY || repoEnv().HUNTER_API_KEY || "";
}

/**
 * Gmail read integration. The OAuth client id and secret live in the same
 * repo-root .env.local; the refresh token is obtained at runtime and kept
 * in data/gmail, never here. Same rule as above: never logged, never shown.
 */
export function googleClientId(): string {
  return process.env.GOOGLE_CLIENT_ID || repoEnv().GOOGLE_CLIENT_ID || "";
}

export function googleClientSecret(): string {
  return process.env.GOOGLE_CLIENT_SECRET || repoEnv().GOOGLE_CLIENT_SECRET || "";
}

/** Whether the Gmail OAuth app is set up at all (credentials present). The
    separate question of whether it is connected (a token exists) lives in
    lib/gmail.ts, which owns the token store. */
export function gmailConfigured(): boolean {
  return Boolean(googleClientId() && googleClientSecret());
}

/**
 * Instagram OAuth (Business Login for Instagram). These are the
 * Instagram-app credentials from "API setup with Instagram login". The
 * redirect must be an HTTPS URL registered on the Meta app (Meta rejects a
 * localhost redirect), so for local use it points at a tunnel. Same rule as
 * every other secret here: never logged, never rendered.
 */
export function instagramAppId(): string {
  return process.env.INSTAGRAM_APP_ID || repoEnv().INSTAGRAM_APP_ID || "";
}

export function instagramAppSecret(): string {
  return process.env.INSTAGRAM_APP_SECRET || repoEnv().INSTAGRAM_APP_SECRET || "";
}

export function instagramRedirectUri(): string {
  return (
    process.env.INSTAGRAM_REDIRECT_URI || repoEnv().INSTAGRAM_REDIRECT_URI || ""
  );
}

/** Whether the OAuth Connect flow can run (all three set). Paste-a-token
    works without any of this. */
export function instagramOauthReady(): boolean {
  return Boolean(
    instagramAppId() && instagramAppSecret() && instagramRedirectUri(),
  );
}
