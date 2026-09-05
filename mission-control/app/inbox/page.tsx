import Link from "next/link";
import { gmailConfigured, instagramOauthReady } from "@/lib/env";
import { gmailState, isConnected as gmailConnected } from "@/lib/gmail";
import {
  authUrl as igAuthUrl,
  instagramState,
  isConnected as igConnected,
} from "@/lib/instagram";
import { displayName, getClient } from "@/lib/clients";
import { recentMessages, unmatchedMessages } from "@/lib/messages";
import { CHANNEL_LABEL } from "@/lib/message-types";
import {
  connectGmailAction,
  createFromMessageAction,
  dismissMessageAction,
  disconnectGmailAction,
  disconnectInstagramAction,
} from "./actions";
import { CheckMailButton } from "./CheckMailButton";
import { InstagramConnect } from "./InstagramConnect";
import { InstagramCodePaste } from "./InstagramCodePaste";

export const dynamic = "force-dynamic";

/** A message timestamp as a short, local, readable string. */
function when(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function InboxPage({
  searchParams,
}: {
  searchParams: Promise<{
    connected?: string;
    ig_connected?: string;
    error?: string;
  }>;
}) {
  const {
    connected: justConnected,
    ig_connected: igJustConnected,
    error,
  } = await searchParams;
  const configured = gmailConfigured();
  const connected = gmailConnected();
  const igOn = igConnected();
  const igOauth = instagramOauthReady();
  const anyConnected = connected || igOn;
  const state = gmailState();
  const ig = instagramState();
  const unmatched = unmatchedMessages();
  const recent = recentMessages(20);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-pine-dark">Inbox</h1>
          <p className="mt-1 text-sm text-muted">
            Email and Instagram, matched to the people they are from. Read
            only, for now: replying comes later.
          </p>
        </div>
        {anyConnected && <CheckMailButton />}
      </div>

      {error && (
        <p className="rounded-lg bg-terracotta-tint px-4 py-3 text-sm text-terracotta-dark">
          The connection came back with an error: {error}
        </p>
      )}
      {igJustConnected && (
        <p className="rounded-lg bg-pine-tint px-4 py-3 text-sm text-pine-dark">
          Instagram connected. Press Check now to pull recent DMs in.
        </p>
      )}
      {justConnected && (
        <p className="rounded-lg bg-pine-tint px-4 py-3 text-sm text-pine-dark">
          Connected. Press Check now to pull the last few months in.
        </p>
      )}

      {/* Not set up: the one-time steps, kept here so they are not lost. */}
      {!configured && (
        <section className="card p-5 text-sm">
          <h2 className="font-serif text-lg font-semibold text-pine-dark">
            Set it up once
          </h2>
          <p className="mt-2 text-muted">
            hello@sebastianinman.com is a Workspace alias on
            hello@sebastiancodes.com, so this reads that mailbox and filters to
            the alias. One-time setup in Google:
          </p>
          <ol className="mt-3 list-decimal space-y-1 pl-5 text-muted">
            <li>
              A Google Cloud project under the sebastiancodes.com org, with the
              Gmail API enabled.
            </li>
            <li>
              OAuth consent screen set to <strong>Internal</strong>, scope{" "}
              <code>gmail.readonly</code> (Internal skips Google verification).
            </li>
            <li>
              An OAuth client of type <strong>Web application</strong>, redirect
              URI <code>http://127.0.0.1:4848/api/gmail/callback</code>.
            </li>
            <li>
              Put <code>GOOGLE_CLIENT_ID</code> and{" "}
              <code>GOOGLE_CLIENT_SECRET</code> in the repo root&apos;s{" "}
              <code>.env.local</code>, then restart the app.
            </li>
          </ol>
        </section>
      )}

      {/* Set up but not connected: the one button that starts OAuth. */}
      {configured && !connected && (
        <section className="card p-5">
          <h2 className="font-serif text-lg font-semibold text-pine-dark">
            Connect Gmail
          </h2>
          <p className="mt-1 text-sm text-muted">
            Opens Google&apos;s consent screen. Sign in as
            hello@sebastiancodes.com and allow read-only Gmail access. You only
            do this once.
          </p>
          <form action={connectGmailAction} className="mt-3">
            <button type="submit" className="btn">
              Connect Gmail
            </button>
          </form>
        </section>
      )}

      {/* Connected: the status line, a manual pull, and disconnect. */}
      {configured && connected && (
        <section className="card flex flex-wrap items-center justify-between gap-4 p-5">
          <div className="text-sm">
            <p className="font-semibold text-pine-dark">
              Connected{state.account ? ` as ${state.account}` : ""}
            </p>
            <p className="text-muted">
              {state.lastChecked
                ? `Last checked ${when(state.lastChecked)}`
                : "Not checked yet"}
            </p>
          </div>
          <form action={disconnectGmailAction}>
            <button type="submit" className="btn btn-quiet text-xs">
              Disconnect
            </button>
          </form>
        </section>
      )}

      {/* Instagram: paste-a-token connect, then status + disconnect. */}
      <section className="card p-5">
        <h2 className="font-serif text-lg font-semibold text-pine-dark">
          Instagram
        </h2>
        {igOn ? (
          <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {ig.profile?.profilePictureUrl && (
                // Plain img (not next/image) to skip remote-domain config for
                // Instagram's CDN. This is the profile info the app reviewer
                // needs to see displayed.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={ig.profile.profilePictureUrl}
                  alt=""
                  width={48}
                  height={48}
                  className="size-12 rounded-full object-cover"
                />
              )}
              <div className="text-sm">
                <p className="font-semibold text-pine-dark">
                  {ig.profile?.name || (ig.account ? `@${ig.account}` : "Connected")}
                </p>
                <p className="text-muted">
                  {ig.account ? `@${ig.account}` : ""}
                  {ig.profile?.accountType
                    ? ` · ${ig.profile.accountType.toLowerCase()}`
                    : ""}
                  {ig.profile?.followers != null
                    ? ` · ${ig.profile.followers.toLocaleString("en-US")} followers`
                    : ""}
                  {ig.profile?.mediaCount != null
                    ? ` · ${ig.profile.mediaCount.toLocaleString("en-US")} posts`
                    : ""}
                </p>
                <p className="text-xs text-muted">
                  {ig.lastChecked
                    ? `Last checked ${when(ig.lastChecked)}`
                    : "Not checked yet"}
                </p>
              </div>
            </div>
            <form action={disconnectInstagramAction}>
              <button type="submit" className="btn btn-quiet text-xs">
                Disconnect
              </button>
            </form>
          </div>
        ) : (
          <>
            <p className="mt-1 text-sm text-muted">
              Reads DMs for your business account, matched to clients by their
              Instagram handle. Read only, and it never sends a cold DM.
              Replies come later.
            </p>
            {igOauth ? (
              <>
                <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-muted">
                  <li>
                    <a
                      href={igAuthUrl()}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-pine hover:underline"
                    >
                      Connect Instagram
                    </a>{" "}
                    (opens Instagram in a new tab).
                  </li>
                  <li>
                    Approve, then copy the code shown on the
                    sebastianinman.com page.
                  </li>
                  <li>Come back here and paste it below.</li>
                </ol>
                <InstagramCodePaste />
                <details className="mt-3">
                  <summary className="cursor-pointer text-xs font-semibold text-muted">
                    Paste a dashboard token instead
                  </summary>
                  <div className="mt-2">
                    <p className="text-xs text-muted">
                      Generate a long-lived token in the Meta App Dashboard
                      (Instagram &rarr; API setup with Instagram login &rarr;
                      Generate token) and paste it; the app keeps it refreshed.
                    </p>
                    <InstagramConnect />
                  </div>
                </details>
              </>
            ) : (
              <>
                <p className="mt-2 text-xs text-muted">
                  Generate a long-lived token in the Meta App Dashboard
                  (Instagram &rarr; API setup with Instagram login &rarr;
                  Generate token) and paste it; the app keeps it refreshed. To
                  use the Connect button instead, set{" "}
                  <code>INSTAGRAM_APP_ID</code>,{" "}
                  <code>INSTAGRAM_APP_SECRET</code>, and{" "}
                  <code>INSTAGRAM_REDIRECT_URI</code> (an HTTPS tunnel URL, since
                  Meta rejects localhost).
                </p>
                <InstagramConnect />
              </>
            )}
          </>
        )}
      </section>

      {/* Unmatched: messages from nobody on file. A record is never made
          automatically; this is where one gets made on purpose. */}
      {anyConnected && (
        <section className="space-y-3">
          <h2 className="font-serif text-lg font-semibold text-pine-dark">
            To sort {unmatched.length > 0 && `(${unmatched.length})`}
          </h2>
          {unmatched.length === 0 ? (
            <p className="text-sm text-muted">
              Nothing waiting. Mail from someone already on file attaches to
              their record on its own.
            </p>
          ) : (
            <ul className="space-y-3">
              {unmatched.map((m) => (
                <li key={m.id} className="card p-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-semibold text-ink">
                      <span className="mr-2 rounded-full bg-line/60 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-muted">
                        {CHANNEL_LABEL[m.channel]}
                      </span>
                      {m.from}
                    </p>
                    <p className="text-xs text-muted">{when(m.date)}</p>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-pine-dark">
                    {m.subject || "(no subject)"}
                  </p>
                  {m.snippet && (
                    <p className="mt-1 text-sm text-muted">{m.snippet}</p>
                  )}
                  <div className="mt-3 flex gap-2">
                    <form action={createFromMessageAction}>
                      <input type="hidden" name="id" value={m.id} />
                      <button type="submit" className="btn text-xs">
                        Make a record
                      </button>
                    </form>
                    <form action={dismissMessageAction}>
                      <input type="hidden" name="id" value={m.id} />
                      <button type="submit" className="btn btn-quiet text-xs">
                        Dismiss
                      </button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* Recent, across everyone, each linking to the record it belongs to. */}
      {anyConnected && recent.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-serif text-lg font-semibold text-pine-dark">
            Recent
          </h2>
          <ul className="divide-y divide-line rounded-xl border border-line bg-surface">
            {recent.map((m) => {
              const client = getClient(m.record);
              return (
                <li key={m.id} className="flex flex-wrap gap-x-4 gap-y-1 px-4 py-3 text-sm">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                    {CHANNEL_LABEL[m.channel]} · {m.direction === "in" ? "In" : "Out"}
                  </span>
                  <Link
                    href={`/clients/${m.record}`}
                    className="font-semibold text-pine-dark hover:underline"
                  >
                    {client ? displayName(client) : m.record}
                  </Link>
                  <span className="flex-1 truncate text-muted">
                    {m.subject || "(no subject)"}
                  </span>
                  <span className="text-xs text-muted">{when(m.date)}</span>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
