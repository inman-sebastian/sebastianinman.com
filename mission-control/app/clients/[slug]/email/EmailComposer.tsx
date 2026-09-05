"use client";

import Link from "next/link";
import { startTransition, useActionState, useState, useTransition } from "react";
import { VerifyEmail } from "@/components/VerifyEmail";
import type { Channel } from "@/lib/channels";
import {
  draftEmailAction,
  markContactedAction,
  sendEmailAction,
  type DraftState,
} from "./actions";

/**
 * Writing and sending, deliberately as two separate screens.
 *
 * Nothing leaves this machine until the confirm step is on screen and
 * the button on it gets pressed. The confirm step shows the exact
 * address, subject, message, and attachments, because that is the last
 * chance to catch a wrong address or a half-written sentence.
 */

export type AttachmentOption = {
  slug: string;
  filename: string;
  title: string;
  bytes: number;
};

const kb = (bytes: number) => `${Math.max(1, Math.round(bytes / 1024))} KB`;

export type ReplyContext = {
  rfcMessageId: string;
  threadId: string;
  from: string;
  subject: string;
  date: string;
  body: string;
};

export function EmailComposer({
  clientSlug,
  clientName,
  channel,
  from,
  defaults,
  attachments,
  canSend,
  copyOnly,
  signature,
  templateId,
  reply,
}: {
  clientSlug: string;
  clientName: string;
  /** Email or a DM channel; drives whether there is a subject, an
      address, attachments, and a signature */
  channel: Channel;
  from: string;
  /** Which numbered template is on screen, so a draft matches it */
  templateId: number;
  defaults: { to: string; subject: string; body: string };
  attachments: AttachmentOption[];
  canSend: boolean;
  /** Set when this is a threaded reply to a stored message: the original
      is shown for reference, the template draft assist is hidden, and the
      threading ids ride along as hidden fields. */
  reply?: ReplyContext | null;
  /** Set for records that came from research: the app will not send to
      them, so the last step hands the message over instead */
  copyOnly?: string;
  /** The signature the send path appends, rendered in the confirm step
      so "exactly what goes out" keeps meaning it. Trusted markup from
      docs/marketing/email-signature.html, never anything typed here. */
  signature: string;
}) {
  const [state, formAction, pending] = useActionState(sendEmailAction, {});
  const [marked, markAction, marking] = useActionState(markContactedAction, {});
  const [confirming, setConfirming] = useState(false);
  const [problem, setProblem] = useState("");
  const [copied, setCopied] = useState(false);
  const [to, setTo] = useState(defaults.to);
  const [subject, setSubject] = useState(defaults.subject);
  const [body, setBody] = useState(defaults.body);
  const [checked, setChecked] = useState<string[]>([]);
  const [draft, setDraft] = useState<DraftState>({});
  const [attempt, setAttempt] = useState(0);
  const [drafting, startDrafting] = useTransition();

  const isDm = channel.kind === "dm";
  const isReply = Boolean(reply);

  function askForDraft() {
    const next = attempt + 1;
    setAttempt(next);
    startDrafting(async () => {
      const result = await draftEmailAction(clientSlug, templateId, next, channel.id);
      setDraft(result);
      if (result.subject) setSubject(result.subject);
      if (result.body) setBody(result.body);
    });
  }

  const left =
    (subject.match(/\{\{[\s\S]*?\}\}/g) ?? []).length +
    (body.match(/\{\{[\s\S]*?\}\}/g) ?? []).length;

  function review() {
    // A DM has no address to check and no subject line.
    if (!isDm && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
      return setProblem("That address doesn't look right.");
    }
    if (!isDm && !subject.trim()) return setProblem("It needs a subject line.");
    if (!body.trim()) return setProblem("The message is empty.");
    if (left > 0) {
      return setProblem(
        `Still ${left} placeholder${left === 1 ? "" : "s"} to fill in. Those are the parts that have to sound like you.`
      );
    }
    setProblem("");
    setConfirming(true);
  }

  if (state.sent) {
    return (
      <div className="card space-y-3 p-6">
        <h2 className="font-serif text-lg font-semibold text-pine-dark">
          Sent to {state.sent}
        </h2>
        <p className="text-sm text-muted">
          It is logged on {clientName}&apos;s timeline.
        </p>
        <Link href={`/clients/${clientSlug}`} className="btn">
          Back to {clientName}
        </Link>
      </div>
    );
  }

  const picked = attachments.filter((a) => checked.includes(a.slug));

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="slug" value={clientSlug} />
      {/* Threading, so the recipient's client files the reply under the
          original and the stored copy groups with it. */}
      <input type="hidden" name="replyToRfcId" value={reply?.rfcMessageId ?? ""} />
      <input type="hidden" name="threadId" value={reply?.threadId ?? ""} />

      <div className={confirming ? "hidden" : "space-y-4"}>
        {reply && (
          <div className="rounded-lg border border-line bg-surface px-4 py-3 text-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              Replying to
            </p>
            <p className="mt-1 font-semibold text-ink">{reply.from}</p>
            <p className="text-pine-dark">{reply.subject || "(no subject)"}</p>
            {reply.body && (
              <p className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap text-muted">
                {reply.body}
              </p>
            )}
          </div>
        )}

        {/* Fills the writing prompts from the record and its notes.
            Overwrites whatever is in the fields, which is why it sits
            above them rather than beside the send button. A reply has no
            template to draft from, so this is hidden there. */}
        {!isReply && (
          <div className="rounded-lg border border-line bg-surface px-4 py-3">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="btn btn-quiet text-xs"
                onClick={askForDraft}
                disabled={drafting}
              >
                {drafting
                  ? "Reading the record..."
                  : attempt === 0
                    ? "Draft it from the notes"
                    : "Draft another"}
              </button>
              <p className="text-xs text-muted">
                Uses this record&apos;s notes, research and timeline. It
                replaces what is in the fields below, and sends nothing.
              </p>
            </div>

            {draft.error && (
              <p className="mt-2 rounded-lg bg-terracotta-tint px-3 py-2 text-xs text-terracotta-dark">
                {draft.error}
              </p>
            )}

            {/* What it refused to invent. The placeholder guard already
                stops a send, so this is the list of what to supply. */}
            {draft.leftBlank && draft.leftBlank.length > 0 && (
              <div className="mt-2 rounded-lg bg-background px-3 py-2 text-xs">
                <p className="font-semibold text-pine-dark">
                  Left blank on purpose, because the record doesn&apos;t say:
                </p>
                <ul className="mt-1 space-y-0.5 text-muted">
                  {draft.leftBlank.map((b) => (
                    <li key={b.placeholder}>
                      <code>{b.placeholder}</code> &mdash; {b.missing}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {isDm ? (
          <div className="rounded-lg border border-line bg-surface px-4 py-3 text-sm">
            <span className="text-muted">Sending as a {channel.label} to </span>
            <span className="font-semibold">{channel.target}</span>
            {channel.targetUrl && (
              <a
                className="ml-3 text-xs font-semibold text-pine hover:underline"
                href={channel.targetUrl}
                target="_blank"
                rel="noreferrer"
              >
                Open profile
              </a>
            )}
          </div>
        ) : (
          <>
            <div>
              <label className="label" htmlFor="to">
                To
              </label>
              <input
                id="to"
                name="to"
                className="field"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </div>
            <div>
              <label className="label" htmlFor="subject">
                Subject
              </label>
              <input
                id="subject"
                name="subject"
                className="field"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
          </>
        )}
        <div>
          <label className="label" htmlFor="body">
            Message
          </label>
          <textarea
            id="body"
            name="body"
            rows={20}
            className="field font-mono text-sm"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          {left > 0 && (
            <p className="mt-1 text-xs text-terracotta-dark">
              {left} placeholder{left === 1 ? "" : "s"} left.
            </p>
          )}
        </div>

        {attachments.length > 0 && (
          <fieldset>
            <legend className="label">Attach</legend>
            <div className="space-y-2">
              {attachments.map((a) => (
                <label
                  key={a.slug}
                  className="flex items-center gap-3 rounded-lg border border-line bg-surface px-3 py-2 text-sm"
                >
                  <input
                    type="checkbox"
                    name="attachments"
                    value={a.slug}
                    checked={checked.includes(a.slug)}
                    onChange={(e) =>
                      setChecked((prev) =>
                        e.target.checked
                          ? [...prev, a.slug]
                          : prev.filter((s) => s !== a.slug)
                      )
                    }
                  />
                  <span className="font-semibold">{a.title}</span>
                  <span className="ml-auto text-xs text-muted">
                    {a.filename} · {kb(a.bytes)}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        )}

        {problem && (
          <p className="rounded-lg bg-terracotta-tint px-4 py-3 text-sm text-terracotta-dark">
            {problem}
          </p>
        )}

        <button
          type="button"
          className="btn"
          onClick={review}
          disabled={!canSend && !copyOnly}
        >
          {copyOnly ? "Read it over" : "Read it over before sending"}
        </button>
      </div>

      {confirming && (
        <div className="space-y-4">
          {/* No hidden copies of the fields here on purpose. The editing
              step above is hidden with CSS, not unmounted, so its inputs
              are still in this form and still post. Duplicating them was
              harmless for the single-value fields, where the action reads
              the first one, but every checked attachment posted twice and
              went out attached twice. If that block ever stops being
              rendered while confirming, the values have to come back. */}

          <div className="card overflow-hidden">
            <p className="border-b border-line bg-pine-tint px-4 py-2 text-xs font-semibold uppercase tracking-wide text-pine-dark">
              {copyOnly ? "This is the message" : "This is exactly what goes out"}
            </p>
            <dl className="divide-y divide-line text-sm">
              {isDm ? (
                <div className="flex gap-4 px-4 py-2">
                  <dt className="w-20 shrink-0 text-muted">To</dt>
                  <dd className="flex-1">
                    <span className="font-semibold">{channel.target}</span>
                    <span className="ml-2 text-muted">on {channel.label}</span>
                    {channel.targetUrl && (
                      <a
                        className="ml-3 text-xs font-semibold text-pine hover:underline"
                        href={channel.targetUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open profile
                      </a>
                    )}
                  </dd>
                </div>
              ) : (
                <>
                  <div className="flex gap-4 px-4 py-2">
                    <dt className="w-20 shrink-0 text-muted">From</dt>
                    <dd>{from}</dd>
                  </div>
                  <div className="flex gap-4 px-4 py-2">
                    <dt className="w-20 shrink-0 text-muted">To</dt>
                    <dd className="flex-1">
                      <span className="font-semibold">{to}</span>
                      {/* Last chance to catch a bad address. Optional on
                          purpose: the check costs one of a hundred a month,
                          and most sends are to somebody already written to. */}
                      <VerifyEmail email={to} />
                    </dd>
                  </div>
                  <div className="flex gap-4 px-4 py-2">
                    <dt className="w-20 shrink-0 text-muted">Subject</dt>
                    <dd className="font-semibold">{subject}</dd>
                  </div>
                  <div className="flex gap-4 px-4 py-2">
                    <dt className="w-20 shrink-0 text-muted">Attached</dt>
                    <dd>
                      {picked.length === 0
                        ? "Nothing"
                        : picked
                            .map((a) => `${a.filename} (${kb(a.bytes)})`)
                            .join(", ")}
                    </dd>
                  </div>
                </>
              )}
            </dl>
            <p className="whitespace-pre-wrap border-t border-line px-4 py-4 text-sm leading-relaxed">
              {body}
            </p>
            {/* The signature is added by the send path, not typed above,
                so it has to be shown here or the heading is a lie. Not
                shown for outreach: that message gets copied into Gmail,
                which appends its own. */}
            {!copyOnly && signature && (
              <div
                className="border-t border-line bg-surface px-4 py-4"
                dangerouslySetInnerHTML={{ __html: signature }}
              />
            )}
          </div>

          {state.error && (
            <p className="rounded-lg bg-terracotta-tint px-4 py-3 text-sm text-terracotta-dark">
              {state.error}
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            {copyOnly ? (
              <button
                type="button"
                className="btn"
                onClick={async () => {
                  // A DM is pasted straight into the message box, so it is
                  // the body alone. An email copied to Gmail keeps its
                  // address and subject so they can be pasted in too.
                  await navigator.clipboard.writeText(
                    isDm ? body : `To: ${to}\nSubject: ${subject}\n\n${body}`
                  );
                  setCopied(true);
                }}
              >
                {copied ? "Copied" : isDm ? "Copy the message" : "Copy it for your inbox"}
              </button>
            ) : (
              <button type="submit" className="btn" disabled={pending}>
                {pending ? "Sending..." : `Send it to ${to}`}
              </button>
            )}
            <button
              type="button"
              className="btn btn-quiet"
              onClick={() => setConfirming(false)}
              disabled={pending}
            >
              Back to editing
            </button>
          </div>

          {/* Only once it is on the clipboard, because until then there
              is nothing to have sent. This records what Sebastian
              already did; it sends nothing. */}
          {copyOnly && copied && !marked.sent && (
            <div className="rounded-lg bg-pine-tint px-4 py-3">
              <p className="text-sm text-pine-dark">
                Once you have sent it, say so and this moves to Contacted
                with a check-back a week out.
              </p>
              <button
                type="button"
                className="btn mt-3"
                disabled={marking}
                onClick={() => {
                  const data = new FormData();
                  data.set("slug", clientSlug);
                  data.set("subject", subject);
                  data.set("channel", channel.label);
                  // Dispatched by hand rather than from a form: this sits
                  // inside the composer's own form, and forms cannot nest.
                  startTransition(() => markAction(data));
                }}
              >
                {marking ? "Noting it..." : "I sent it"}
              </button>
            </div>
          )}

          {marked.sent && (
            <p className="rounded-lg bg-pine-tint px-4 py-3 text-sm text-pine-dark">
              Noted. {clientName} is at Contacted, with a check-back in a
              week.{" "}
              <Link
                href={`/clients/${clientSlug}`}
                className="font-semibold underline"
              >
                Open the record
              </Link>
            </p>
          )}

          {copyOnly && (
            <p className="rounded-lg bg-terracotta-tint px-4 py-3 text-sm text-terracotta-dark">
              {copyOnly}
            </p>
          )}
        </div>
      )}
    </form>
  );
}
