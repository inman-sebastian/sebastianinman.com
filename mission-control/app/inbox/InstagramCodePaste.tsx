"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { finishInstagramOauthAction } from "./actions";

/**
 * Second half of the OAuth connect: paste the code shown on the
 * sebastianinman.com callback page. The exchange runs server-side (locally),
 * so the app secret and token never leave the machine.
 */
export function InstagramCodePaste() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  return (
    <form
      className="mt-3 space-y-2"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const data = new FormData();
          data.set("code", code);
          const r = await finishInstagramOauthAction(data);
          if (r.error) {
            setError(r.error);
          } else {
            setError("");
            setCode("");
            router.refresh();
          }
        });
      }}
    >
      <input
        className="field font-mono text-xs"
        placeholder="Paste the code from the callback page"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
      <button type="submit" className="btn" disabled={pending || !code.trim()}>
        {pending ? "Finishing..." : "Finish connecting"}
      </button>
      {error && (
        <p className="rounded-lg bg-terracotta-tint px-3 py-2 text-sm text-terracotta-dark">
          {error}
        </p>
      )}
    </form>
  );
}
