"use client";

import { useEffect, useState } from "react";
import { askPermission, notify, permission, type Permission } from "@/lib/notify";

/**
 * Registers the service worker and offers to turn notifications on.
 *
 * The button is deliberate. Asking for permission on page load is what
 * taught everybody to click Block on reflex, and browsers increasingly
 * refuse the request outside a user gesture anyway. So it sits quietly
 * in the header until pressed, and disappears once answered.
 */
export function NotificationSetup() {
  const [state, setState] = useState<Permission>("unsupported");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setState(permission());
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Not fatal: notifications fall back to the page-level API and
        // the app is only unavailable for installing, not for using.
      });
    }
  }, []);

  if (state === "unsupported" || state === "granted") return null;

  // Blocked is worth saying out loud. Silence here is indistinguishable
  // from the feature not existing, and the browser will not let the
  // button ask again, so the fix has to happen in site settings.
  if (state === "denied") {
    return (
      <span
        className="text-xs text-muted"
        title="Allow notifications for this site in your browser's settings, then reload."
      >
        Notifications blocked
      </span>
    );
  }

  return (
    <button
      type="button"
      className="btn btn-quiet text-xs"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        const next = await askPermission();
        setState(next);
        setBusy(false);
        if (next === "granted") {
          // Proof it works, now, rather than the first time it matters.
          await notify("Notifications are on", {
            body: "You'll get one of these when a long job finishes.",
            force: true,
          });
        }
      }}
    >
      {busy ? "Asking..." : "Turn on notifications"}
    </button>
  );
}
