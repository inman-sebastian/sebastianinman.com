"use client";

import { useActionState } from "react";
import { createPostAction } from "./actions";

export function NewPostForm() {
  const [state, formAction, pending] = useActionState(createPostAction, {});
  return (
    <form action={formAction} className="space-y-3">
      <div>
        <label className="label" htmlFor="title">
          Working title
        </label>
        <input
          id="title"
          name="title"
          className="field"
          placeholder="How to spot the busywork that's actually worth automating"
        />
        <p className="mt-1 text-xs text-muted">
          A sentence in the site&apos;s voice, not listicle-speak. The URL comes
          from this, so it is worth roughly right before you start.
        </p>
      </div>
      {state.error && (
        <p className="rounded-lg bg-terracotta-tint px-4 py-3 text-sm text-terracotta-dark">
          {state.error}
        </p>
      )}
      <button type="submit" className="btn" disabled={pending}>
        {pending ? "Starting..." : "Start a draft"}
      </button>
    </form>
  );
}
