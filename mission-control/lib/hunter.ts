import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { hunterKey } from "./env";

/**
 * Hunter.io, used for ONE thing: checking that an email address will
 * actually accept mail before something important gets sent to it.
 *
 * **Domain Search is deliberately not here, and should not be added.**
 * It was tested against real leads on 2026-08-29 and returned nothing:
 * shineonhairsalon.com, waterstonesalon.com and thegoodtimebarbershop.com
 * all came back with the organisation named and zero addresses. Hunter
 * indexes companies with a public web footprint, and a three-chair salon
 * in Ashland has none. Worse, it needs a domain at all, and five of the
 * eight businesses on file have no website.
 *
 * Its Email Finder is a harder no. That endpoint returns *pattern
 * guesses* with a confidence score attached, which is exactly what the
 * find-leads skill forbids ("Never invent contact details"). A number
 * beside a guess does not make it an observation, and the place a
 * guessed address fails is a bounce on a first email.
 *
 * Verification is a different pool from search (100 a month against 50)
 * and answers a real question, so that is all this module does.
 */

export type Verdict = {
  /** Hunter's own wording: deliverable | undeliverable | risky | unknown */
  result: string;
  /** 0-100. Hunter's confidence that mail will arrive */
  score: number;
  /** True when the server accepts everything, so a pass proves little */
  acceptAll: boolean;
  disposable: boolean;
  webmail: boolean;
  /** Whether the mail server answered at all */
  mxRecords: boolean;
  /** Our reading of the above, for someone who is about to press send */
  summary: string;
  /** Whether this came from the cache rather than a fresh credit */
  cached: boolean;
};

export type VerifyResult =
  | { ok: true; verdict: Verdict }
  | { ok: false; message: string };

const CACHE_DIR = path.join(process.cwd(), "data", "hunter-cache");

function cacheFile(email: string): string {
  const key = crypto
    .createHash("sha256")
    .update(email.trim().toLowerCase())
    .digest("hex")
    .slice(0, 16);
  return path.join(CACHE_DIR, `${key}.json`);
}

/**
 * Plain English for the person about to send, not Hunter's vocabulary.
 *
 * `accept_all` is the one worth spelling out. A catch-all server says
 * yes to every address, so "deliverable" against one proves only that
 * the domain exists, not that anybody reads that mailbox.
 */
function readVerdict(d: Record<string, unknown>): string {
  const result = String(d.result ?? "unknown");
  if (result === "undeliverable") {
    return "That address bounced the check. Do not send to it; check for a typo.";
  }
  if (d.accept_all) {
    return "The mail server accepts everything, so this check cannot tell you much either way. Worth a second look at the spelling.";
  }
  if (result === "deliverable") {
    return "The address exists and the server accepted it.";
  }
  if (result === "risky") {
    return "Hunter is unsure about this one. It may bounce.";
  }
  return "Hunter could not reach a verdict on this address.";
}

/**
 * Verify one address. Never called on a render: it costs a credit and
 * the quota is 100 a month, so it runs only when somebody asks for it.
 * Repeats come out of the cache so a double click is free.
 */
export async function verifyEmail(email: string): Promise<VerifyResult> {
  const address = email.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) {
    return { ok: false, message: "That doesn't look like an email address." };
  }

  const key = hunterKey();
  if (!key) {
    return {
      ok: false,
      message:
        "No Hunter key found. HUNTER_API_KEY lives in the repo root's .env.local.",
    };
  }

  const file = cacheFile(address);
  if (fs.existsSync(file)) {
    try {
      const cached = JSON.parse(fs.readFileSync(file, "utf8")) as Verdict;
      return { ok: true, verdict: { ...cached, cached: true } };
    } catch {
      // A corrupt entry is not worth failing over; ask again.
    }
  }

  try {
    const url = new URL("https://api.hunter.io/v2/email-verifier");
    url.searchParams.set("email", address);
    url.searchParams.set("api_key", key);

    const response = await fetch(url, { cache: "no-store" });
    const body = await response.json();

    if (body?.errors?.length) {
      // Hunter's own message is the useful one (quota, bad key, and so on)
      return { ok: false, message: String(body.errors[0].details ?? body.errors[0]) };
    }
    if (!response.ok || !body?.data) {
      return { ok: false, message: `Hunter answered ${response.status}.` };
    }

    const d = body.data as Record<string, unknown>;
    const verdict: Verdict = {
      result: String(d.result ?? "unknown"),
      score: Number(d.score ?? 0),
      acceptAll: Boolean(d.accept_all),
      disposable: Boolean(d.disposable),
      webmail: Boolean(d.webmail),
      mxRecords: Boolean(d.mx_records),
      summary: readVerdict(d),
      cached: false,
    };

    fs.mkdirSync(CACHE_DIR, { recursive: true });
    fs.writeFileSync(file, JSON.stringify(verdict));
    return { ok: true, verdict };
  } catch (err) {
    return { ok: false, message: String(err) };
  }
}

export type Quota = { searches: number; verifications: number; resets: string };

/** What is left this month. The account endpoint costs nothing. */
export async function quota(): Promise<Quota | null> {
  const key = hunterKey();
  if (!key) return null;
  try {
    const response = await fetch(
      `https://api.hunter.io/v2/account?api_key=${encodeURIComponent(key)}`,
      { cache: "no-store" }
    );
    const body = await response.json();
    const r = body?.data?.requests;
    if (!r) return null;
    return {
      searches: Number(r.searches?.remaining ?? 0),
      verifications: Number(r.verifications?.remaining ?? 0),
      resets: String(body.data.reset_date ?? ""),
    };
  } catch {
    return null;
  }
}
