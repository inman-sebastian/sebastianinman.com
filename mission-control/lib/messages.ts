import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { appendTimeline, findClientByEmail, findClientBySocial } from "./clients";
import { ALIAS } from "./gmail";
import { CHANNEL_LABEL, type ChannelMessage } from "./message-types";

/**
 * The conversation store: messages pulled from Gmail, kept per client.
 *
 * One writer, same rule as lib/clients.ts and lib/documents.ts. Files live
 * in git-ignored data/messages: <client-slug>.json holds that client's
 * messages, unmatched.json holds mail that matched no record yet. The
 * Gmail message id is the dedupe key, so a re-sync (or a reseed after an
 * expired history id) never stores or logs the same message twice.
 *
 * A matched message also drops a compact line on the client's timeline the
 * first time it is seen, so the record reads as a history without opening
 * the thread. Read only: nothing here sends.
 */

const DIR = path.join(process.cwd(), "data", "messages");
const UNMATCHED_FILE = path.join(DIR, "unmatched.json");

export type StoredMessage = ChannelMessage & {
  /** The client slug this belongs to, "" while unmatched */
  record: string;
};

function clientFile(slug: string): string {
  return path.join(DIR, `${slug}.json`);
}

function readStore(file: string): StoredMessage[] {
  try {
    const parsed = JSON.parse(fs.readFileSync(file, "utf8"));
    return Array.isArray(parsed) ? (parsed as StoredMessage[]) : [];
  } catch {
    return [];
  }
}

function writeStore(file: string, list: StoredMessage[]) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(list, null, 2), "utf8");
  fs.renameSync(tmp, file);
}

function byDateDesc(a: StoredMessage, b: StoredMessage): number {
  return a.date < b.date ? 1 : a.date > b.date ? -1 : 0;
}

const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;

/** The email at the other end of a message: the sender for inbound, the
    recipient for outbound, in either case not the alias itself. */
function counterpartyEmail(m: ChannelMessage): string {
  const side = m.direction === "in" ? m.from : m.to;
  const found = [...side.matchAll(EMAIL_RE)].map((x) => x[0].toLowerCase());
  const alias = ALIAS.toLowerCase();
  return found.find((e) => e !== alias) ?? found[0] ?? "";
}

/**
 * The client a message belongs to, matched the way that channel is
 * addressed: email by address, a DM by the sender's handle against the
 * record's socials. Null when nobody on file matches.
 */
function matchClient(m: ChannelMessage) {
  if (m.channel === "gmail") {
    const email = counterpartyEmail(m);
    return email ? findClientByEmail(email) : null;
  }
  const handle = m.direction === "in" ? m.from : m.to;
  return handle ? findClientBySocial(handle, m.channel) : null;
}

/** Every message id already on disk, across all clients and unmatched. */
function knownIds(): Set<string> {
  const ids = new Set<string>();
  if (!fs.existsSync(DIR)) return ids;
  for (const file of fs.readdirSync(DIR)) {
    if (!file.endsWith(".json")) continue;
    for (const m of readStore(path.join(DIR, file))) ids.add(m.id);
  }
  return ids;
}

function logToTimeline(slug: string, m: ChannelMessage) {
  const verb = m.direction === "in" ? "received" : "sent";
  const title =
    m.channel === "gmail"
      ? `Email ${verb}: ${m.subject || "(no subject)"}`
      : `${CHANNEL_LABEL[m.channel]} message ${verb}`;
  appendTimeline(slug, title, m.snippet || m.body.slice(0, 140));
}

function fileToClientMessage(m: ChannelMessage, slug: string): StoredMessage {
  return { ...m, record: slug };
}

/**
 * Store a batch of freshly fetched messages. New ones are routed to a
 * client (by email or by handle, per channel) or to unmatched.
 * Already-stored ids are skipped entirely, which is what keeps the
 * timeline from doubling up.
 */
export function saveMessages(incoming: ChannelMessage[]): {
  matched: number;
  unmatched: number;
} {
  const seen = knownIds();
  let matched = 0;
  let unmatched = 0;

  for (const m of incoming) {
    if (seen.has(m.id)) continue;
    seen.add(m.id);

    const client = matchClient(m);
    if (client) {
      const file = clientFile(client.slug);
      writeStore(file, [...readStore(file), fileToClientMessage(m, client.slug)]);
      logToTimeline(client.slug, m);
      matched += 1;
    } else {
      writeStore(UNMATCHED_FILE, [
        ...readStore(UNMATCHED_FILE),
        { ...m, record: "" },
      ]);
      unmatched += 1;
    }
  }

  return { matched, unmatched };
}

export function messagesForClient(slug: string): StoredMessage[] {
  return readStore(clientFile(slug)).sort(byDateDesc);
}

export function unmatchedMessages(): StoredMessage[] {
  return readStore(UNMATCHED_FILE).sort(byDateDesc);
}

export function unmatchedCount(): number {
  return readStore(UNMATCHED_FILE).length;
}

/** Newest messages across every client, for the inbox overview. */
export function recentMessages(limit = 20): StoredMessage[] {
  if (!fs.existsSync(DIR)) return [];
  const all: StoredMessage[] = [];
  for (const file of fs.readdirSync(DIR)) {
    if (!file.endsWith(".json") || file === "unmatched.json") continue;
    all.push(...readStore(path.join(DIR, file)));
  }
  return all.sort(byDateDesc).slice(0, limit);
}

/** Move an unmatched message onto a client (once a record exists for it). */
export function linkMessage(id: string, slug: string): boolean {
  const unmatched = readStore(UNMATCHED_FILE);
  const msg = unmatched.find((m) => m.id === id);
  if (!msg) return false;
  writeStore(
    UNMATCHED_FILE,
    unmatched.filter((m) => m.id !== id),
  );
  const file = clientFile(slug);
  writeStore(file, [...readStore(file), { ...msg, record: slug }]);
  logToTimeline(slug, msg);
  return true;
}

/** Drop an unmatched message (spam, a receipt, anything not worth a record). */
export function dismissUnmatched(id: string): boolean {
  const unmatched = readStore(UNMATCHED_FILE);
  if (!unmatched.some((m) => m.id === id)) return false;
  writeStore(
    UNMATCHED_FILE,
    unmatched.filter((m) => m.id !== id),
  );
  return true;
}

/** One unmatched message by id, for the create-record prefill. */
export function unmatchedMessage(id: string): StoredMessage | null {
  return readStore(UNMATCHED_FILE).find((m) => m.id === id) ?? null;
}

/** One of a client's messages by id, for the reply prefill. */
export function messageById(slug: string, id: string): StoredMessage | null {
  return readStore(clientFile(slug)).find((m) => m.id === id) ?? null;
}

/**
 * Record a message the app just sent, so the thread stays complete.
 *
 * The app sends through Resend, not Gmail, so a sent reply will not show
 * up in the alias mailbox sync; storing it here is what keeps the outbound
 * side of a conversation visible. Deliberately no timeline entry: the send
 * action already logs "Email sent", and a second line would double it.
 */
export function recordOutbound(
  slug: string,
  msg: { to: string; subject: string; body: string; threadId?: string },
): void {
  const stored: StoredMessage = {
    id: `out-${randomUUID()}`,
    threadId: msg.threadId || `out-${randomUUID()}`,
    rfcMessageId: "",
    channel: "gmail",
    direction: "out",
    from: ALIAS,
    to: msg.to,
    subject: msg.subject,
    date: new Date().toISOString(),
    snippet: msg.body.replace(/\s+/g, " ").trim().slice(0, 140),
    body: msg.body,
    record: slug,
  };
  const file = clientFile(slug);
  writeStore(file, [...readStore(file), stored]);
}
