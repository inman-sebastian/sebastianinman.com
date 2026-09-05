import fs from "node:fs";
import path from "node:path";
import { google } from "googleapis";
import { googleClientId, googleClientSecret } from "./env";
import type { ChannelMessage } from "./message-types";

/**
 * The Gmail read integration: the second thing in this app that reaches
 * off the machine (lib/send.ts is the first). It only ever READS, and only
 * mail on the hello@sebastianinman.com alias.
 *
 * hello@sebastianinman.com is a Google Workspace alias on the primary
 * account hello@sebastiancodes.com, so the app authenticates as that
 * primary account and filters every read to the alias, keeping personal
 * mail out. The OAuth app is Internal to the Workspace, which is why the
 * refresh token does not expire and no Google verification was needed for
 * the restricted gmail.readonly scope.
 *
 * Deliberately no Pub/Sub `watch`/push. Gmail push delivers to a public
 * HTTPS endpoint and needs an always-running receiver; this app is
 * local-only and usually closed, so a push would have nowhere to land
 * (the same wall as the Meta phase). Instead fetchNew() does an
 * incremental history sync, which the app runs on open and on demand.
 * That is fast enough that opening Mission Control feels like the mail
 * was already there.
 *
 * Tokens and sync state live in git-ignored data/gmail. Same rule as the
 * rest of this app's secrets: never logged, never rendered.
 */

export const ALIAS = "hello@sebastianinman.com";
const SCOPE = "https://www.googleapis.com/auth/gmail.readonly";
const REDIRECT = "http://127.0.0.1:4848/api/gmail/callback";

const DIR = path.join(process.cwd(), "data", "gmail");
const TOKEN_FILE = path.join(DIR, "token.json");
const STATE_FILE = path.join(DIR, "state.json");

type Token = {
  refresh_token: string;
  access_token?: string;
  expiry?: number;
};

export type GmailState = {
  historyId?: string;
  lastChecked?: string;
  account?: string;
};

/** A Gmail message, in the hub's shared shape (channel is always "gmail"). */
export type GmailMessage = ChannelMessage;

function readJson<T>(file: string): T | null {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8")) as T;
  } catch {
    return null;
  }
}

function writeJson(file: string, data: unknown) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), "utf8");
  fs.renameSync(tmp, file);
}

function oauth() {
  return new google.auth.OAuth2(
    googleClientId(),
    googleClientSecret(),
    REDIRECT,
  );
}

/** Whether a refresh token is stored, i.e. Connect has been done. The
    separate "is it even set up" question is gmailConfigured() in env.ts. */
export function isConnected(): boolean {
  return Boolean(readJson<Token>(TOKEN_FILE)?.refresh_token);
}

export function gmailState(): GmailState {
  return readJson<GmailState>(STATE_FILE) ?? {};
}

/** The consent URL. offline + consent so Google returns a refresh token
    every time, not only on the very first grant. */
export function authUrl(): string {
  return oauth().generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [SCOPE],
  });
}

/** Trade the callback's code for tokens and store the refresh token. */
export async function exchangeCode(code: string): Promise<void> {
  const client = oauth();
  const { tokens } = await client.getToken(code);
  if (!tokens.refresh_token) {
    throw new Error(
      "Google did not return a refresh token. Remove Mission Control's access in your Google account's security settings, then connect again.",
    );
  }
  writeJson(TOKEN_FILE, {
    refresh_token: tokens.refresh_token,
    access_token: tokens.access_token ?? undefined,
    expiry: tokens.expiry_date ?? undefined,
  } satisfies Token);
}

/** Forget the connection. Leaves the message store alone. */
export function disconnect(): void {
  for (const file of [TOKEN_FILE, STATE_FILE]) {
    if (fs.existsSync(file)) fs.unlinkSync(file);
  }
}

function authedClient() {
  const stored = readJson<Token>(TOKEN_FILE);
  if (!stored?.refresh_token) throw new Error("Gmail is not connected.");
  const client = oauth();
  client.setCredentials({
    refresh_token: stored.refresh_token,
    access_token: stored.access_token,
    expiry_date: stored.expiry,
  });
  // The library refreshes the access token from the refresh token as
  // needed; persist the refreshed one so the next run starts warm.
  client.on("tokens", (tok) => {
    const current = readJson<Token>(TOKEN_FILE);
    if (!current) return;
    writeJson(TOKEN_FILE, {
      refresh_token: tok.refresh_token || current.refresh_token,
      access_token: tok.access_token ?? current.access_token,
      expiry: tok.expiry_date ?? current.expiry,
    } satisfies Token);
  });
  return client;
}

function headerOf(
  payload: { headers?: { name?: string | null; value?: string | null }[] } | undefined,
  name: string,
): string {
  const hit = payload?.headers?.find(
    (h) => (h.name ?? "").toLowerCase() === name.toLowerCase(),
  );
  return hit?.value ?? "";
}

function decode(data?: string | null): string {
  if (!data) return "";
  // Gmail encodes part bodies as base64url.
  return Buffer.from(data, "base64url").toString("utf8");
}

type Part = {
  mimeType?: string | null;
  body?: { data?: string | null } | null;
  parts?: Part[] | null;
};

/** First body of the wanted MIME type, walking nested parts. */
function collect(payload: Part | undefined, mime: string): string {
  if (!payload) return "";
  if (payload.mimeType === mime && payload.body?.data) {
    return decode(payload.body.data);
  }
  for (const part of payload.parts ?? []) {
    const found = collect(part, mime);
    if (found) return found;
  }
  return "";
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<\/(p|div|br|li|tr|h[1-6])>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function bodyText(payload: Part | undefined): string {
  const plain = collect(payload, "text/plain");
  if (plain.trim()) return plain.trim();
  return stripHtml(collect(payload, "text/html"));
}

function toIso(dateHeader: string, internalDate?: string | null): string {
  const d = dateHeader
    ? new Date(dateHeader)
    : internalDate
      ? new Date(Number(internalDate))
      : null;
  return d && !Number.isNaN(d.getTime()) ? d.toISOString() : "";
}

type RawMessage = {
  id?: string | null;
  threadId?: string | null;
  snippet?: string | null;
  internalDate?: string | null;
  payload?: Part & {
    headers?: { name?: string | null; value?: string | null }[];
  };
};

function normalize(data: RawMessage): GmailMessage | null {
  if (!data.id || !data.payload) return null;
  const from = headerOf(data.payload, "From");
  const to = headerOf(data.payload, "To");
  return {
    id: data.id,
    threadId: data.threadId ?? data.id,
    rfcMessageId: headerOf(data.payload, "Message-ID"),
    channel: "gmail",
    direction: from.toLowerCase().includes(ALIAS) ? "out" : "in",
    from,
    to,
    subject: headerOf(data.payload, "Subject"),
    date: toIso(headerOf(data.payload, "Date"), data.internalDate),
    snippet: data.snippet ?? "",
    body: bodyText(data.payload),
  };
}

/** Alias filter: the mail must touch hello@sebastianinman.com, so the
    incremental history (which is mailbox-wide) never leaks personal mail. */
function onAlias(m: GmailMessage): boolean {
  return `${m.from} ${m.to}`.toLowerCase().includes(ALIAS);
}

function isNotFound(err: unknown): boolean {
  const e = err as { code?: number; response?: { status?: number } };
  return e?.code === 404 || e?.response?.status === 404;
}

/**
 * Pull whatever is new since the last sync.
 *
 * With a stored historyId, ask Gmail only for what changed (cheap, near
 * instant). Without one, or when Gmail says the id is too old to answer
 * from (a 404), seed from the last 90 days of alias mail. Either way the
 * stored historyId is advanced to the mailbox's current one so the next
 * run is incremental.
 */
export async function fetchNew(): Promise<GmailMessage[]> {
  const auth = authedClient();
  const gmail = google.gmail({ version: "v1", auth });
  const state = gmailState();

  const ids = new Set<string>();
  let seed = !state.historyId;

  if (state.historyId) {
    try {
      let pageToken: string | undefined;
      do {
        const res = await gmail.users.history.list({
          userId: "me",
          startHistoryId: state.historyId,
          historyTypes: ["messageAdded"],
          pageToken,
        });
        for (const h of res.data.history ?? []) {
          for (const added of h.messagesAdded ?? []) {
            if (added.message?.id) ids.add(added.message.id);
          }
        }
        pageToken = res.data.nextPageToken ?? undefined;
      } while (pageToken);
    } catch (err) {
      if (isNotFound(err)) seed = true;
      else throw err;
    }
  }

  if (seed) {
    const res = await gmail.users.messages.list({
      userId: "me",
      q: `(to:${ALIAS} OR from:${ALIAS}) newer_than:90d`,
      maxResults: 100,
    });
    for (const m of res.data.messages ?? []) if (m.id) ids.add(m.id);
  }

  const messages: GmailMessage[] = [];
  for (const id of ids) {
    const full = await gmail.users.messages.get({
      userId: "me",
      id,
      format: "full",
    });
    const msg = normalize(full.data as RawMessage);
    if (msg && onAlias(msg)) messages.push(msg);
  }

  // The mailbox's current historyId is the canonical "we are caught up to
  // here" marker; reading it from the profile avoids gaps that picking the
  // max off the fetched messages could leave.
  const profile = await gmail.users.getProfile({ userId: "me" });
  writeJson(STATE_FILE, {
    historyId: profile.data.historyId ?? state.historyId,
    lastChecked: new Date().toISOString(),
    account: profile.data.emailAddress ?? state.account,
  } satisfies GmailState);

  return messages;
}
