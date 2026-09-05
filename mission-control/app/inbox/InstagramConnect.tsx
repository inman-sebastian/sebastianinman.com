"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { connectInstagramAction } from "./actions";

/**
 * Paste-a-token connect for Instagram. The token is generated once in the
 * Meta App Dashboard (no OAuth redirect, which Meta will not accept on
 * localhost); the app verifies it, stores it, and refreshes it from then
 * on. A scope-short token fails here with a clear message.
 */
export function InstagramConnect() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [token, setToken] = useState("");
  const [error, setError] = useState("");

  return (
    <form
      className="mt-3 space-y-2"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const data = new FormData();
          data.set("token", token);
          const r = await connectInstagramAction(data);
          if (r.error) {
            setError(r.error);
          } else {
            setError("");
            setToken("");
            router.refresh();
          }
        });
      }}
    >
      <input
        className="field font-mono text-xs"
        placeholder="Paste the long-lived Instagram token"
        value={token}
        onChange={(e) => setToken(e.target.value)}
      />
      <button type="submit" className="btn" disabled={pending || !token.trim()}>
        {pending ? "Connecting..." : "Connect Instagram"}
      </button>
      {error && (
        <p className="rounded-lg bg-terracotta-tint px-3 py-2 text-sm text-terracotta-dark">
          {error}
        </p>
      )}
    </form>
  );
}
