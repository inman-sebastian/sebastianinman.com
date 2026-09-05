import fs from "node:fs";
import path from "node:path";
import {
  instagramAppId,
  instagramAppSecret,
  instagramRedirectUri,
} from "./env";
import type { ChannelMessage } from "./message-types";

/**
 * Instagram DMs (read), for the business Instagram account.
 *
 * The third off-machine reach after lib/send.ts and lib/gmail.ts, and like
 * Gmail it only READS in this phase. Instagram DM conversations are
 * fetchable on demand over the Graph API, so this polls (on app open and on
 * a button) rather than needing a webhook and a public URL the local app
 * cannot offer.
 *
 * There are two ways to connect, both ending in a stored long-lived token:
 *   - Paste a token generated in the Meta App Dashboard. Simplest for one
 *     account and needs no public URL, so it is the everyday path.
 *   - The OAuth Business Login flow (authUrl -> exchangeCode). Meta rejects
 *     a localhost redirect, so this needs an HTTPS redirect (a tunnel); it
 *     exists mainly because App Review has to see the standard connect flow.
 * Either way the token is kept alive with the refresh endpoint (which needs
 * only the token, no app secret). Same secret rule as everywhere else:
 * never logged, never rendered.
 */

// Pin a Graph API version; bump deliberately, never float.
const GRAPH = "https://graph.instagram.com/v23.0";
const AUTHORIZE_URL = "https://www.instagram.com/oauth/authorize";
const TOKEN_URL = "https://api.instagram.com/oauth/access_token";
const EXCHANGE_URL = "https://graph.instagram.com/access_token";
const SCOPE = "instagram_business_basic,instagram_business_manage_messages";
const REFRESH_URL = "https://graph.instagram.com/refresh_access_token";
/** Refresh once the token is within this window of its 60-day expiry. */
const REFRESH_BEFORE_MS = 7 * 24 * 60 * 60 * 1000;
const SIXTY_DAYS_MS = 60 * 24 * 60 * 60 * 1000;

const DIR = path.join(process.cwd(), "data", "instagram");
const TOKEN_FILE = path.join(DIR, "token.json");
const STATE_FILE = path.join(DIR, "state.json");

type Token = {
  access_token: string;
  /** ms since epoch when the token expires */
  expires_at: number;
};

export type InstagramProfile = {
  username: string;
  name: string;
  accountType: string;
  profilePictureUrl: string;
  followers: number | null;
  mediaCount: number | null;
};

export type InstagramState = {
  account?: string;
  /** The IG-scoped user id, to tell our own messages from theirs */
  userId?: string;
  /** Profile info, shown on the inbox panel (and to the app reviewer) */
  profile?: InstagramProfile;
  lastChecked?: string;
  /** conversation id -> last updated_time we have pulled */
  cursors?: Record<string, string>;
};

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

export function isConnected(): boolean {
  return Boolean(readJson<Token>(TOKEN_FILE)?.access_token);
}

export function instagramState(): InstagramState {
  return readJson<InstagramState>(STATE_FILE) ?? {};
}

export function disconnect(): void {
  for (const file of [TOKEN_FILE, STATE_FILE]) {
    if (fs.existsSync(file)) fs.unlinkSync(file);
  }
}

/** A Graph GET that turns Meta's error envelope into a thrown Error. */
async function graphGet(url: string): Promise<Record<string, unknown>> {
  const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok || data.error) {
    const err = data.error as { message?: string } | undefined;
    throw new Error(err?.message || `Instagram API error ${res.status}`);
  }
  return data;
}

function token(): string {
  const t = readJson<Token>(TOKEN_FILE);
  if (!t?.access_token) throw new Error("Instagram is not connected.");
  return t.access_token;
}

/**
 * Read the connected account's profile and store it. Verifies the token as
 * a side effect (a bad token throws here). Requests the rich field set for
 * the profile card, and falls back to the always-present core if any field
 * is unavailable, so connecting never breaks on profile display.
 */
export async function fetchProfile(): Promise<InstagramProfile> {
  const access = token();
  const rich =
    "user_id,username,name,account_type,profile_picture_url,followers_count,follows_count,media_count";
  let data: Record<string, unknown>;
  try {
    data = await graphGet(
      `${GRAPH}/me?fields=${rich}&access_token=${encodeURIComponent(access)}`,
    );
  } catch {
    data = await graphGet(
      `${GRAPH}/me?fields=user_id,username&access_token=${encodeURIComponent(access)}`,
    );
  }
  const profile: InstagramProfile = {
    username: String(data.username ?? ""),
    name: String(data.name ?? ""),
    accountType: String(data.account_type ?? ""),
    profilePictureUrl: String(data.profile_picture_url ?? ""),
    followers: data.followers_count != null ? Number(data.followers_count) : null,
    mediaCount: data.media_count != null ? Number(data.media_count) : null,
  };
  const current = instagramState();
  writeJson(STATE_FILE, {
    ...current,
    account: profile.username || current.account,
    userId: String(data.user_id ?? current.userId ?? ""),
    profile,
  } satisfies InstagramState);
  return profile;
}

/**
 * Store a token pasted from the Meta App Dashboard. The 60-day clock starts
 * now (dashboard tokens are 60-day). Fetching the profile afterwards both
 * verifies the token and fills the profile card. Throws readably on a bad
 * token.
 */
export async function saveToken(accessToken: string): Promise<{ account: string }> {
  const clean = accessToken.trim();
  if (!clean) throw new Error("Paste the token first.");
  writeJson(TOKEN_FILE, {
    access_token: clean,
    expires_at: Date.now() + SIXTY_DAYS_MS,
  } satisfies Token);
  const profile = await fetchProfile();
  return { account: profile.username };
}

/** The Business Login consent URL. Used by the OAuth connect path; needs
    the configured HTTPS redirect registered on the Meta app. */
export function authUrl(): string {
  const params = new URLSearchParams({
    client_id: instagramAppId(),
    redirect_uri: instagramRedirectUri(),
    response_type: "code",
    scope: SCOPE,
  });
  return `${AUTHORIZE_URL}?${params.toString()}`;
}

/**
 * Trade the callback's code for a long-lived token and store it. Code ->
 * short-lived token (form POST on api.instagram.com), then short -> 60-day
 * long-lived (GET on graph.instagram.com), then fetch the profile.
 */
export async function exchangeCode(code: string): Promise<void> {
  const clean = code.replace(/#_$/, "");
  const body = new URLSearchParams({
    client_id: instagramAppId(),
    client_secret: instagramAppSecret(),
    grant_type: "authorization_code",
    redirect_uri: instagramRedirectUri(),
    code: clean,
  });
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    body,
    signal: AbortSignal.timeout(20000),
  });
  const short = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  const shortErr =
    (short.error_message as string) ||
    (short.error as { message?: string } | undefined)?.message;
  if (!res.ok || shortErr) {
    throw new Error(shortErr || `Instagram token exchange failed (${res.status})`);
  }
  const shortToken = String(short.access_token ?? "");
  if (!shortToken) throw new Error("Instagram did not return an access token.");

  const long = await graphGet(
    `${EXCHANGE_URL}?grant_type=ig_exchange_token&client_secret=${encodeURIComponent(
      instagramAppSecret(),
    )}&access_token=${encodeURIComponent(shortToken)}`,
  );
  const longToken = String(long.access_token ?? "");
  const expiresIn = Number(long.expires_in ?? 0);
  if (!longToken) throw new Error("Instagram did not return a long-lived token.");
  writeJson(TOKEN_FILE, {
    access_token: longToken,
    expires_at: Date.now() + (expiresIn > 0 ? expiresIn * 1000 : SIXTY_DAYS_MS),
  } satisfies Token);
  await fetchProfile();
}

/** Probe messaging access, so a token missing the messages scope fails at
    connect time with a clear reason instead of a silently empty inbox. */
export async function verifyMessaging(): Promise<void> {
  await graphGet(
    `${GRAPH}/me/conversations?fields=id&limit=1&access_token=${encodeURIComponent(token())}`,
  );
}

/** Refresh the long-lived token when it nears expiry. Best-effort: a failed
    refresh should not stop a read with a still-valid token. */
async function refreshIfNeeded(): Promise<void> {
  const t = readJson<Token>(TOKEN_FILE);
  if (!t?.access_token) return;
  if (t.expires_at - Date.now() > REFRESH_BEFORE_MS) return;
  try {
    const data = await graphGet(
      `${REFRESH_URL}?grant_type=ig_refresh_token&access_token=${encodeURIComponent(t.access_token)}`,
    );
    const next = String(data.access_token ?? "");
    const expiresIn = Number(data.expires_in ?? 0);
    if (next) {
      writeJson(TOKEN_FILE, {
        access_token: next,
        expires_at: Date.now() + (expiresIn > 0 ? expiresIn * 1000 : SIXTY_DAYS_MS),
      } satisfies Token);
    }
  } catch {
    // Leave the current token in place; the next check tries again.
  }
}

type Participant = { username?: string; id?: string };

function personLabel(p: Participant | undefined): { label: string; id: string } {
  return { label: p?.username || p?.id || "", id: p?.id || "" };
}

function isoDate(value: unknown): string {
  const d = value ? new Date(String(value)) : null;
  return d && !Number.isNaN(d.getTime()) ? d.toISOString() : "";
}

/**
 * Pull messages from conversations that changed since the last sync.
 *
 * There is no delta feed, so we list conversations, compare each one's
 * updated_time against a stored cursor, and only re-read the ones that
 * moved. The message store dedupes by id, so re-reading a conversation is
 * cheap and safe.
 */
export async function fetchNew(): Promise<ChannelMessage[]> {
  await refreshIfNeeded();
  const access = token();
  const state = instagramState();
  const cursors = { ...(state.cursors ?? {}) };
  const ourId = state.userId ?? "";

  const convos = await graphGet(
    `${GRAPH}/me/conversations?fields=id,updated_time&limit=50&access_token=${encodeURIComponent(access)}`,
  );
  const conversations = Array.isArray(convos.data)
    ? (convos.data as { id?: string; updated_time?: string }[])
    : [];

  const out: ChannelMessage[] = [];

  for (const convo of conversations) {
    const convId = convo.id;
    if (!convId) continue;
    const updated = String(convo.updated_time ?? "");
    if (cursors[convId] && updated && cursors[convId] === updated) continue;

    const detail = await graphGet(
      `${GRAPH}/${convId}?fields=messages{id,created_time,from,to,message}&access_token=${encodeURIComponent(access)}`,
    );
    const messages = Array.isArray(
      (detail.messages as { data?: unknown } | undefined)?.data,
    )
      ? ((detail.messages as { data: Record<string, unknown>[] }).data)
      : [];

    for (const raw of messages) {
      const id = String(raw.id ?? "");
      if (!id) continue;
      const from = personLabel(raw.from as Participant);
      const toList = (raw.to as { data?: Participant[] } | undefined)?.data ?? [];
      const to = personLabel(toList[0]);
      out.push({
        id,
        threadId: convId,
        rfcMessageId: "",
        channel: "instagram",
        direction: ourId && from.id === ourId ? "out" : "in",
        from: from.label,
        to: to.label,
        subject: "",
        date: isoDate(raw.created_time),
        snippet: String(raw.message ?? "").slice(0, 140),
        body: String(raw.message ?? ""),
      });
    }

    if (updated) cursors[convId] = updated;
  }

  writeJson(STATE_FILE, {
    ...state,
    cursors,
    lastChecked: new Date().toISOString(),
  } satisfies InstagramState);

  return out;
}
