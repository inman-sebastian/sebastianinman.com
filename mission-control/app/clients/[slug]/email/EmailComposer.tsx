"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { sendEmailAction } from "./actions";

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

export function EmailComposer({
  clientSlug,
  clientName,
  from,
  defaults,
  attachments,
  canSend,
}: {
  clientSlug: string;
  clientName: string;
  from: string;
  defaults: { to: string; subject: string; body: string };
  attachments: AttachmentOption[];
  canSend: boolean;
}) {
  const [state, formAction, pending] = useActionState(sendEmailAction, {});
  const [confirming, setConfirming] = useState(false);
  const [problem, setProblem] = useState("");
  const [to, setTo] = useState(defaults.to);
  const [subject, setSubject] = useState(defaults.subject);
  const [body, setBody] = useState(defaults.body);
  const [checked, setChecked] = useState<string[]>([]);

  const left =
    (subject.match(/\{\{[\s\S]*?\}\}/g) ?? []).length +
    (body.match(/\{\{[\s\S]*?\}\}/g) ?? []).length;

  function review() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
      return setProblem("That address doesn't look right.");
    }
    if (!subject.trim()) return setProblem("It needs a subject line.");
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

      <div className={confirming ? "hidden" : "space-y-4"}>
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
          disabled={!canSend}
        >
          Read it over before sending
        </button>
      </div>

      {confirming && (
        <div className="space-y-4">
          {/* Hidden copies so the values still post from this step */}
          <input type="hidden" name="to" value={to} />
          <input type="hidden" name="subject" value={subject} />
          <input type="hidden" name="body" value={body} />
          {picked.map((a) => (
            <input
              key={a.slug}
              type="hidden"
              name="attachments"
              value={a.slug}
            />
          ))}

          <div className="card overflow-hidden">
            <p className="border-b border-line bg-pine-tint px-4 py-2 text-xs font-semibold uppercase tracking-wide text-pine-dark">
              This is exactly what goes out
            </p>
            <dl className="divide-y divide-line text-sm">
              <div className="flex gap-4 px-4 py-2">
                <dt className="w-20 shrink-0 text-muted">From</dt>
                <dd>{from}</dd>
              </div>
              <div className="flex gap-4 px-4 py-2">
                <dt className="w-20 shrink-0 text-muted">To</dt>
                <dd className="font-semibold">{to}</dd>
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
            </dl>
            <p className="whitespace-pre-wrap border-t border-line px-4 py-4 text-sm leading-relaxed">
              {body}
            </p>
          </div>

          {state.error && (
            <p className="rounded-lg bg-terracotta-tint px-4 py-3 text-sm text-terracotta-dark">
              {state.error}
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            <button type="submit" className="btn" disabled={pending}>
              {pending ? "Sending..." : `Send it to ${to}`}
            </button>
            <button
              type="button"
              className="btn btn-quiet"
              onClick={() => setConfirming(false)}
              disabled={pending}
            >
              Back to editing
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
