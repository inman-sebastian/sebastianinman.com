"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { checkInboxAction } from "./inbox/actions";

/**
 * Checks every connected channel when the dashboard loads, and then on a
 * gentle interval while it stays open, so new mail and DMs are just there
 * without a button press. This is what stands in for a webhook: the app is
 * local-only and usually closed, so rather than something pushing to it, it
 * pulls when it is open. Renders nothing, and refreshes only when a pull
 * actually found something, so it never loops on its own output. Silently
 * does nothing when nothing is connected.
 */
const INTERVAL_MS = 60_000;

export function MailAutoCheck() {
  const router = useRouter();
  const running = useRef(false);

  useEffect(() => {
    async function check() {
      if (running.current) return;
      running.current = true;
      try {
        const r = await checkInboxAction();
        const found = (r.matched ?? 0) + (r.unmatched ?? 0);
        if (!r.skipped && !r.error && found > 0) router.refresh();
      } catch {
        // A failed check is surfaced on the inbox page, not here.
      } finally {
        running.current = false;
      }
    }
    check();
    const timer = setInterval(check, INTERVAL_MS);
    return () => clearInterval(timer);
  }, [router]);

  return null;
}
