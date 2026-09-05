"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient, type ClientInput } from "@/lib/clients";
import {
  authUrl,
  disconnect as gmailDisconnect,
  fetchNew as gmailFetch,
  isConnected as gmailConnected,
} from "@/lib/gmail";
import {
  disconnect as igDisconnect,
  exchangeCode as igExchange,
  fetchNew as igFetch,
  isConnected as igConnected,
  saveToken as igSaveToken,
  verifyMessaging as igVerify,
} from "@/lib/instagram";
import {
  dismissUnmatched,
  linkMessage,
  saveMessages,
  unmatchedMessage,
} from "@/lib/messages";
import { parseInquiry } from "@/lib/parse-inquiry";

/**
 * The inbox actions. Reading Gmail and Instagram is the only thing here
 * that reaches off the machine, and it only ever reads. Creating a record
 * from a message is a deliberate button press, never automatic: unmatched
 * mail sits and waits rather than spawning records from every newsletter.
 */

export type CheckState = {
  error?: string;
  matched?: number;
  unmatched?: number;
  /** True when there was nothing to do (nothing connected), so the auto-
      check on the dashboard can call this harmlessly. */
  skipped?: boolean;
};

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function reason(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

export async function connectGmailAction() {
  redirect(authUrl());
}

export async function disconnectGmailAction() {
  gmailDisconnect();
  revalidatePath("/inbox");
  revalidatePath("/");
}

/**
 * Finish the OAuth connect after Sebastian pastes the code from the
 * sebastianinman.com callback page. The exchange (code -> token) happens
 * here, locally, so the app secret and token never leave the machine.
 */
export async function finishInstagramOauthAction(
  formData: FormData,
): Promise<{ error?: string; ok?: boolean }> {
  const code = text(formData, "code");
  if (!code) return { error: "Paste the code from the callback page first." };
  try {
    await igExchange(code);
    revalidatePath("/inbox");
    revalidatePath("/");
    return { ok: true };
  } catch (err) {
    return { error: reason(err) };
  }
}

export async function connectInstagramAction(
  formData: FormData,
): Promise<{ error?: string; account?: string }> {
  const pasted = text(formData, "token");
  try {
    const { account } = await igSaveToken(pasted);
    // Prove the messaging scope is really on the token, so a scope-short
    // token fails here with a clear reason, not as a silent empty inbox.
    await igVerify();
    revalidatePath("/inbox");
    revalidatePath("/");
    return { account };
  } catch (err) {
    // Do not sit half-connected: clear the token we just tried.
    igDisconnect();
    return { error: reason(err) };
  }
}

export async function disconnectInstagramAction() {
  igDisconnect();
  revalidatePath("/inbox");
  revalidatePath("/");
}

/** Pull every connected channel and file what comes back. */
export async function checkInboxAction(): Promise<CheckState> {
  const gmailOn = gmailConnected();
  const igOn = igConnected();
  if (!gmailOn && !igOn) return { skipped: true };

  let matched = 0;
  let unmatched = 0;
  const errors: string[] = [];

  if (gmailOn) {
    try {
      const r = saveMessages(await gmailFetch());
      matched += r.matched;
      unmatched += r.unmatched;
    } catch (err) {
      errors.push(`Gmail: ${reason(err)}`);
    }
  }
  if (igOn) {
    try {
      const r = saveMessages(await igFetch());
      matched += r.matched;
      unmatched += r.unmatched;
    } catch (err) {
      errors.push(`Instagram: ${reason(err)}`);
    }
  }

  revalidatePath("/inbox");
  revalidatePath("/");
  revalidatePath("/clients");
  return errors.length
    ? { matched, unmatched, error: errors.join("; ") }
    : { matched, unmatched };
}

function firstEmail(header: string): string {
  const m = header.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return m ? m[0].toLowerCase() : "";
}

function nameFromHeader(header: string): string {
  const before = header.split("<")[0].trim().replace(/^"|"$/g, "");
  // "jane@x.com" alone leaves nothing usable as a name
  return before.includes("@") ? "" : before;
}

export async function createFromMessageAction(formData: FormData) {
  const id = text(formData, "id");
  const msg = unmatchedMessage(id);
  if (!msg) return;

  let input: ClientInput;
  if (msg.channel === "instagram") {
    // No email to parse; the sender's handle is the contact. Save it to
    // socials so their next DM matches this record automatically.
    const handle = msg.from.replace(/^@/, "");
    input = {
      name: msg.from,
      socials: handle ? [`https://instagram.com/${handle}`] : [],
      notes: msg.body,
      source: "manual",
      stage: "inquiry",
    };
  } else {
    // A website contact-form notification carries the customer's details in
    // the body under labels, and its From is the site, not the person, so
    // it goes through the same parser the paste box uses. A plain email is
    // from a real person, so the From header is the contact.
    const parsed = parseInquiry(msg.body);
    const looksLikeForm =
      Boolean(parsed.email) && /interested in:|^\s*name:\s*\S/im.test(msg.body);
    input = looksLikeForm
      ? parsed
      : {
          name: nameFromHeader(msg.from),
          email: firstEmail(msg.from),
          notes: [msg.subject, msg.body].filter(Boolean).join("\n\n"),
          source: "email",
          stage: "inquiry",
        };
  }

  const record = createClient(input);
  linkMessage(id, record.slug);

  revalidatePath("/inbox");
  revalidatePath("/");
  revalidatePath("/clients");
  redirect(`/clients/${record.slug}`);
}

export async function dismissMessageAction(formData: FormData) {
  dismissUnmatched(text(formData, "id"));
  revalidatePath("/inbox");
}
