"use client";

import { useActionState, useState } from "react";
import { publishPostAction } from "@/app/blog/actions";
import type { PostStage } from "@/lib/posts";

/**
 * Publishing, behind the same two-step confirm the email composer uses,
 * for the same reason: this one is irreversible in the sense that
 * matters. A push to main puts the post on the live website a couple of
 * minutes later.
 */
export function PublishPanel({
  slug,
  branch,
  files,
  defaultMessage,
  blocked,
  status,
  stage,
}: {
  slug: string;
  branch: string;
  files: string[];
  defaultMessage: string;
  /** Errors that have to be fixed first; empty means it is publishable */
  blocked: string[];
  status: string;
  /** Everything on this panel reads off this, so an already-published
      post is never described as though it were a draft */
  stage: PostStage;
}) {
  const [state, formAction, pending] = useActionState(publishPostAction, {});
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState(defaultMessage);

  const words = {
    draft: {
      heading: "Put it on the site",
      action: "Publish this post",
      confirm: "Yes, publish it",
      warning: "This publishes it to sebastianinman.com.",
      done: "It's on its way",
    },
    changed: {
      heading: "Update the live post",
      action: "Publish the changes",
      confirm: "Yes, update it",
      warning: "This replaces the live version on sebastianinman.com.",
      done: "The update is on its way",
    },
    unpushed: {
      heading: "Waiting to go out",
      action: "Push it",
      confirm: "Yes, push it",
      warning: "This pushes what is already committed to sebastianinman.com.",
      done: "On its way",
    },
    live: {
      heading: "On the site",
      action: "Nothing to publish",
      confirm: "",
      warning: "",
      done: "",
    },
  }[stage];

  const nothingToDo = stage === "live";

  if (state.message) {
    return (
      <div className="card space-y-2 border-pine p-5">
        <h2 className="font-serif text-lg font-semibold text-pine-dark">
          {words.done}
        </h2>
        <p className="text-sm">{state.message}</p>
        <p className="text-sm text-muted">
          Vercel builds from main automatically. Give it a couple of minutes,
          then have a look at the live post.
        </p>
      </div>
    );
  }

  return (
    <section className="card p-5">
      <h2 className="font-serif text-lg font-semibold text-pine-dark">
        {words.heading}
      </h2>
      <p className="mt-1 text-sm text-muted">{status}</p>

      {blocked.length > 0 && (
        <ul className="mt-3 space-y-1 rounded-lg bg-terracotta-tint px-4 py-3 text-sm text-terracotta-dark">
          {blocked.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      )}

      {!confirming && (
        <form
          action={formAction}
          className="mt-4 space-y-3"
          onSubmit={(e) => e.preventDefault()}
        >
          <div>
            <label className="label" htmlFor="message">
              Commit message
            </label>
            <input
              id="message"
              className="field"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          <button
            type="button"
            className="btn"
            disabled={blocked.length > 0 || !message.trim() || nothingToDo}
            onClick={() => setConfirming(true)}
          >
            {words.action}
          </button>
        </form>
      )}

      {confirming && (
        <form action={formAction} className="mt-4 space-y-4">
          <input type="hidden" name="slug" value={slug} />
          <input type="hidden" name="message" value={message} />

          <div className="rounded-lg border border-terracotta bg-terracotta-tint px-4 py-3 text-sm text-terracotta-dark">
            <p className="font-semibold">{words.warning}</p>
            <p className="mt-1">
              Pushing <code>{branch}</code> is what deploys the site, so it
              takes effect a couple of minutes after this.
            </p>
          </div>

          <dl className="rounded-lg border border-line bg-surface text-sm">
            <div className="flex gap-4 border-b border-line px-4 py-2">
              <dt className="w-24 shrink-0 text-muted">Committing</dt>
              <dd>
                {files.map((f) => (
                  <code key={f} className="block text-xs">
                    {f}
                  </code>
                ))}
              </dd>
            </div>
            <div className="flex gap-4 border-b border-line px-4 py-2">
              <dt className="w-24 shrink-0 text-muted">Message</dt>
              <dd className="font-semibold">{message}</dd>
            </div>
            <div className="flex gap-4 px-4 py-2">
              <dt className="w-24 shrink-0 text-muted">Branch</dt>
              <dd>{branch}</dd>
            </div>
          </dl>

          <p className="text-xs text-muted">
            Only these files go in. Anything else you have in progress stays
            where it is.
          </p>

          {state.error && (
            <p className="whitespace-pre-wrap rounded-lg bg-terracotta-tint px-4 py-3 text-sm text-terracotta-dark">
              {state.error}
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            <button type="submit" className="btn" disabled={pending}>
              {pending ? "Publishing..." : words.confirm}
            </button>
            <button
              type="button"
              className="btn btn-quiet"
              onClick={() => setConfirming(false)}
              disabled={pending}
            >
              Not yet
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
