"use client";

/**
 * Desktop notifications for the things that take a while.
 *
 * The honest scope: this fires when a job the OPEN app is watching
 * finishes. Agent runs are background processes that leave their
 * progress on disk, and it is this app's polling that notices they
 * stopped, so if the window is closed there is nothing watching and
 * nothing to notify. Real notifications for a closed app need a push
 * service and a server to talk to it, which a local-only tool that
 * reads the repo it runs from has no business acquiring.
 *
 * That is fine for the actual case: a run is started here, so the
 * window is already open, and the point is to be able to go and do
 * something else while it works.
 */

export type Permission = NotificationPermission | "unsupported";

export function permission(): Permission {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  return Notification.permission;
}

/**
 * Ask, from a click.
 *
 * Browsers increasingly refuse this outside a user gesture, and asking
 * unprompted on page load is the behaviour that trained everybody to
 * hit Block, so nothing here calls it automatically.
 */
export async function askPermission(): Promise<Permission> {
  if (permission() === "unsupported") return "unsupported";
  try {
    return await Notification.requestPermission();
  } catch {
    return Notification.permission;
  }
}

/**
 * Show one, but only when it would tell him something he cannot see.
 *
 * If the window is focused and in front, the panel he is looking at
 * already says the run finished, and a notification on top of that is
 * just noise. `document.hidden` covers another tab; `hasFocus` covers
 * another application with this window still visible behind it.
 */
export async function notify(
  title: string,
  options: { body?: string; url?: string; force?: boolean } = {}
): Promise<void> {
  if (permission() !== "granted") return;
  if (!options.force && !document.hidden && document.hasFocus()) return;

  const payload: NotificationOptions = {
    body: options.body,
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    data: { url: options.url ?? "/" },
    // One per kind: a second finished run replaces the first rather
    // than stacking up a pile he has to dismiss one at a time.
    tag: options.url ?? "mission-control",
  };

  try {
    const registration = await navigator.serviceWorker?.ready;
    if (registration) {
      await registration.showNotification(title, payload);
      return;
    }
  } catch {
    // Fall through to the page-level notification below.
  }

  // Works on desktop without a service worker; the click handler here
  // is the plain-window equivalent of the one in sw.js.
  const note = new Notification(title, payload);
  note.onclick = () => {
    window.focus();
    if (options.url) window.location.href = options.url;
    note.close();
  };
}
